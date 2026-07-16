import { useMemo, useState } from "react";
import { uploadToBlob } from "../../services/blobUpload";
import { createCourierRecord } from "../../services/integration";
import { normalizeOrderType } from "../../utils/orderType";
import ThemedSelect from "../IMS/StockSheet/ThemedSelect";
import {
  CARD,
  CHIP,
  Field,
  FormRow,
  ImageUpload,
  Input,
  PRIMARY_BTN,
  SECONDARY_BTN,
  TCTRL,
  TD,
  TH,
  DIMENSION_UNIT_OPTIONS,
  INITIAL_SLIP_STATE,
  IPO_TYPE_OPTIONS,
  buildBoxRows,
  buildCourierApiPayload,
  buildRecordId,
  computeDimensionalWeight,
  getSampleAsOptions,
  persistCourierRecords,
  toLocalDateValue,
  useCourierIpos,
  useCourierRecords,
} from "./shared";

const CourierSlip = ({ onBack }) => {
  const ipos = useCourierIpos();
  const { records, setRecords } = useCourierRecords();

  const [slipForm, setSlipForm] = useState(INITIAL_SLIP_STATE);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSavingSlip, setIsSavingSlip] = useState(false);
  const [slipMessage, setSlipMessage] = useState({ type: "", text: "" });

  const filteredIpos = useMemo(
    () =>
      ipos.filter(
        (ipo) => normalizeOrderType(ipo.orderType) === slipForm.ipoType,
      ),
    [ipos, slipForm.ipoType],
  );

  const selectedIpo = useMemo(
    () => filteredIpos.find((ipo) => ipo.ipoCode === slipForm.ipoCode) || null,
    [filteredIpos, slipForm.ipoCode],
  );

  const sampleOptions = getSampleAsOptions(slipForm.ipoType);
  const savedSlipsForCurrentType = records.filter((record) =>
    slipForm.ipoType ? record.ipoType === slipForm.ipoType : true,
  );

  const resetImageSelection = () => {
    setSelectedImageFile(null);
  };

  const handleImageSelect = (file) => {
    setSelectedImageFile(file);
    setSlipMessage({ type: "", text: "" });
  };

  const resetSlipForm = ({ keepSelection = false } = {}) => {
    setSlipForm((current) => ({
      ...INITIAL_SLIP_STATE,
      ipoType: keepSelection ? current.ipoType : "",
      ipoCode: keepSelection ? current.ipoCode : "",
    }));
    resetImageSelection();
  };

  const handleSlipFieldChange = (field, value) => {
    setSlipMessage({ type: "", text: "" });
    setSlipForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "boxesPackets") {
        next.boxRows = buildBoxRows(value, current.boxRows);
      }
      return next;
    });
  };

  const handleBoxRowFieldChange = (index, field, value) => {
    setSlipMessage({ type: "", text: "" });
    setSlipForm((current) => {
      const nextRows = current.boxRows.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row,
      );
      return { ...current, boxRows: nextRows };
    });
  };

  const handleIpoTypeChange = (value) => {
    setSlipMessage({ type: "", text: "" });
    setSlipForm({
      ...INITIAL_SLIP_STATE,
      ipoType: value,
    });
    resetImageSelection();
  };

  const handleSaveSlip = async () => {
    const requiresOtherText = slipForm.sampleAs === "OTHER_TEXT";

    if (!slipForm.ipoType || !slipForm.ipoCode || !slipForm.sampleAs) {
      setSlipMessage({
        type: "error",
        text: "Select IPO Type, IPO, and Sample As before saving the courier slip.",
      });
      return;
    }

    if (requiresOtherText && !slipForm.sampleAsOtherText.trim()) {
      setSlipMessage({
        type: "error",
        text: "Enter the custom Sample As value for the selected OTHER TEXT option.",
      });
      return;
    }

    if (slipForm.boxesPackets && !/^\d+$/.test(slipForm.boxesPackets)) {
      setSlipMessage({
        type: "error",
        text: "Boxes/Packets accepts numbers only.",
      });
      return;
    }

    setIsSavingSlip(true);
    setSlipMessage({ type: "", text: "" });

    try {
      let uploadedImageUrl = "";
      if (selectedImageFile) {
        try {
          uploadedImageUrl =
            (await uploadToBlob(selectedImageFile, "courier")) || "";
        } catch (error) {
          console.warn(
            "Courier image upload failed, saving slip without hosted image URL:",
            error,
          );
        }
      }

      const nextRecord = {
        id: buildRecordId(),
        ipoType: slipForm.ipoType,
        ipoCode: slipForm.ipoCode,
        programName: selectedIpo?.programName || "",
        buyerCode: selectedIpo?.buyerCode || "",
        companyType: selectedIpo?.type || "",
        sampleAs: slipForm.sampleAs,
        sampleAsOtherText: requiresOtherText
          ? slipForm.sampleAsOtherText.trim()
          : "",
        dimensionUnit: slipForm.dimensionUnit || "CM",
        boxesPackets: slipForm.boxesPackets,
        boxRows: slipForm.boxRows.map((row, idx) => ({
          srNo: row.srNo ?? idx + 1,
          length: row.length || "",
          width: row.width || "",
          height: row.height || "",
          weight: row.weight || "",
        })),
        attachImageRefUrl: uploadedImageUrl,
        attachImageRefName: selectedImageFile?.name || "",
        droppedBy: slipForm.droppedBy.trim(),
        handedBy: slipForm.handedBy.trim(),
        dispatchDate: toLocalDateValue(),
        courierReceipt: "",
        awbNumber: "",
        edd: "",
        status: "",
        handoverTo: "",
        contact: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist to the backend (database) first. We keep a local copy as an
      // offline cache, but the success message must reflect where the slip
      // actually landed so a server/DB save is never silently mistaken for a
      // local-only one.
      let savedToServer = false;
      try {
        const apiResult = await createCourierRecord(
          buildCourierApiPayload(nextRecord),
        );
        const backendId = apiResult?.data?.id;
        if (apiResult?.available && backendId) {
          nextRecord.backendId = String(backendId);
          nextRecord.persistenceSource = "api";
          savedToServer = true;
        }
      } catch (apiError) {
        console.warn(
          "Courier slip API save failed; keeping local copy.",
          apiError,
        );
      }

      const nextRecords = [nextRecord, ...records];
      setRecords(nextRecords);
      persistCourierRecords(nextRecords);
      resetSlipForm({ keepSelection: true });
      setSlipMessage(
        savedToServer
          ? {
              type: "success",
              text: `Courier slip saved to the database for ${nextRecord.ipoCode}. It is now available in Master Courier Sheet.`,
            }
          : {
              type: "error",
              text: `Saved locally for ${nextRecord.ipoCode}, but the server could not be reached — this slip is NOT in the database yet. Check your connection and save again to sync it.`,
            },
      );
    } catch (error) {
      console.error("Unable to save courier slip:", error);
      setSlipMessage({
        type: "error",
        text: "Courier slip could not be saved. Try again.",
      });
    } finally {
      setIsSavingSlip(false);
    }
  };

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        zoom: 0.9,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        "--accent": "#edeef1",
      }}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Header */}
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg"
            >
              ← Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-foreground">Courier Slip</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create courier slips from saved IPOs. Each saved slip feeds the
            Master Courier Sheet automatically.
          </p>
        </div>

        <div className={CARD}>
          {/* Card header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#e2e3e8] pb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Courier Slip Details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select an IPO type, choose an IPO from IPO Management, and
                capture the courier handover details.
              </p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Saved Slips:{" "}
              <strong className="text-foreground">
                {savedSlipsForCurrentType.length}
              </strong>
            </div>
          </div>

          {/* 1 — IPO Selection */}
          <section className="mb-6">
            <div className="mb-3 text-sm font-semibold text-foreground">
              1 · IPO Selection
            </div>
            <FormRow className="sm:grid-cols-2">
              <Field label="Show IPO Type" required>
                <ThemedSelect
                  value={slipForm.ipoType}
                  onChange={handleIpoTypeChange}
                  options={IPO_TYPE_OPTIONS.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  placeholder="Select IPO Type"
                />
              </Field>

              <Field
                label="IPO"
                required
                helper={
                  slipForm.ipoType && filteredIpos.length === 0
                    ? "No IPOs are available for this IPO Type yet."
                    : "Saved IPOs from IPO Management are listed here."
                }
              >
                <ThemedSelect
                  value={slipForm.ipoCode}
                  onChange={(code) => handleSlipFieldChange("ipoCode", code)}
                  isDisabled={!slipForm.ipoType || filteredIpos.length === 0}
                  placeholder={
                    !slipForm.ipoType
                      ? "Select IPO Type first"
                      : filteredIpos.length === 0
                        ? "No IPOs available"
                        : "Select IPO"
                  }
                  options={filteredIpos.map((ipo) => ({
                    value: ipo.ipoCode,
                    label: ipo.programName
                      ? `${ipo.ipoCode} - ${ipo.programName}`
                      : ipo.ipoCode,
                  }))}
                />
              </Field>

              {selectedIpo && (
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <span className={CHIP}>IPO: {selectedIpo.ipoCode}</span>
                  {selectedIpo.programName && (
                    <span className={CHIP}>
                      Program: {selectedIpo.programName}
                    </span>
                  )}
                  {selectedIpo.buyerCode && (
                    <span className={CHIP}>
                      Buyer Code: {selectedIpo.buyerCode}
                    </span>
                  )}
                  {selectedIpo.type && (
                    <span className={CHIP}>
                      Company Type: {selectedIpo.type}
                    </span>
                  )}
                </div>
              )}
            </FormRow>
          </section>

          {/* 2 — Courier Type */}
          <section className="mb-6">
            <div className="mb-3 text-sm font-semibold text-foreground">
              2 · Courier Type
            </div>
            <FormRow className="sm:grid-cols-2">
              <Field label="Sample As" required>
                <ThemedSelect
                  value={slipForm.sampleAs}
                  onChange={(value) => handleSlipFieldChange("sampleAs", value)}
                  isDisabled={!slipForm.ipoType}
                  options={sampleOptions}
                  placeholder={
                    !slipForm.ipoType
                      ? "Select IPO Type first"
                      : "Select Sample As"
                  }
                />
              </Field>

              {slipForm.sampleAs === "OTHER_TEXT" && (
                <Field label="Other Sample As" required>
                  <Input
                    value={slipForm.sampleAsOtherText}
                    onChange={(event) =>
                      handleSlipFieldChange(
                        "sampleAsOtherText",
                        event.target.value,
                      )
                    }
                    placeholder="Enter custom sample type"
                  />
                </Field>
              )}
            </FormRow>
          </section>

          {/* 3 — Package Details */}
          <section className="mb-6">
            <div className="mb-3 text-sm font-semibold text-foreground">
              3 · Package Details
            </div>
            <FormRow className="sm:grid-cols-2">
              <Field label="Boxes/Packets">
                <Input
                  inputMode="numeric"
                  value={slipForm.boxesPackets}
                  onChange={(event) =>
                    handleSlipFieldChange(
                      "boxesPackets",
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="Enter quantity"
                />
              </Field>

              <Field label="Dimension Unit">
                <ThemedSelect
                  value={slipForm.dimensionUnit}
                  onChange={(value) =>
                    handleSlipFieldChange("dimensionUnit", value)
                  }
                  options={DIMENSION_UNIT_OPTIONS.map((unit) => ({
                    value: unit,
                    label: unit,
                  }))}
                  isSearchable={false}
                />
              </Field>

              {slipForm.boxRows.length > 0 && (
                <div className="sm:col-span-2">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Per-box details ({slipForm.boxRows.length}) — dimensions in{" "}
                    {slipForm.dimensionUnit}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[#e2e3e8]">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th
                            className={`${TH} text-center`}
                            style={{ width: 64 }}
                          >
                            Sr No.
                          </th>
                          <th className={TH} style={{ width: 110 }}>
                            L ({slipForm.dimensionUnit})
                          </th>
                          <th className={TH} style={{ width: 110 }}>
                            W ({slipForm.dimensionUnit})
                          </th>
                          <th className={TH} style={{ width: 110 }}>
                            H ({slipForm.dimensionUnit})
                          </th>
                          <th className={TH} style={{ width: 130 }}>
                            Weight (kg)
                          </th>
                          <th className={TH}>
                            Dim. Weight ((L × W × H) / 5000)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {slipForm.boxRows.map((row, index) => {
                          const dimWeight = computeDimensionalWeight(
                            row.length,
                            row.width,
                            row.height,
                          );
                          return (
                            <tr key={`box-row-${index}`}>
                              <td className={`${TD} text-center font-semibold`}>
                                {row.srNo}
                              </td>
                              <td className={TD}>
                                <input
                                  className={TCTRL}
                                  inputMode="decimal"
                                  value={row.length}
                                  onChange={(event) =>
                                    handleBoxRowFieldChange(
                                      index,
                                      "length",
                                      event.target.value.replace(/[^\d.]/g, ""),
                                    )
                                  }
                                  placeholder="L"
                                />
                              </td>
                              <td className={TD}>
                                <input
                                  className={TCTRL}
                                  inputMode="decimal"
                                  value={row.width}
                                  onChange={(event) =>
                                    handleBoxRowFieldChange(
                                      index,
                                      "width",
                                      event.target.value.replace(/[^\d.]/g, ""),
                                    )
                                  }
                                  placeholder="W"
                                />
                              </td>
                              <td className={TD}>
                                <input
                                  className={TCTRL}
                                  inputMode="decimal"
                                  value={row.height}
                                  onChange={(event) =>
                                    handleBoxRowFieldChange(
                                      index,
                                      "height",
                                      event.target.value.replace(/[^\d.]/g, ""),
                                    )
                                  }
                                  placeholder="H"
                                />
                              </td>
                              <td className={TD}>
                                <input
                                  className={TCTRL}
                                  inputMode="decimal"
                                  value={row.weight}
                                  onChange={(event) =>
                                    handleBoxRowFieldChange(
                                      index,
                                      "weight",
                                      event.target.value.replace(/[^\d.]/g, ""),
                                    )
                                  }
                                  placeholder="0.00"
                                />
                              </td>
                              <td
                                className={`${TD} font-medium text-muted-foreground`}
                              >
                                {dimWeight || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </FormRow>
          </section>

          {/* 4 — Handover */}
          <section className="mb-6">
            <div className="mb-3 text-sm font-semibold text-foreground">
              4 · Handover
            </div>
            <FormRow className="sm:grid-cols-2">
              <Field label="Dropped By">
                <Input
                  value={slipForm.droppedBy}
                  onChange={(event) =>
                    handleSlipFieldChange("droppedBy", event.target.value)
                  }
                  placeholder="Enter dropped by"
                />
              </Field>

              <Field label="Handed By">
                <Input
                  value={slipForm.handedBy}
                  onChange={(event) =>
                    handleSlipFieldChange("handedBy", event.target.value)
                  }
                  placeholder="Enter handed by"
                />
              </Field>
            </FormRow>
          </section>

          {/* 5 — Reference */}
          <section className="mb-6">
            <div className="mb-3 text-sm font-semibold text-foreground">
              5 · Reference
            </div>
            <FormRow className="sm:grid-cols-2">
              <Field label="Attach Image Ref">
                <ImageUpload
                  id="courier-image-upload"
                  value={selectedImageFile}
                  onChange={handleImageSelect}
                  label="Upload Image Ref"
                />
              </Field>
            </FormRow>
          </section>

          {slipMessage.text && (
            <div
              className={`rounded-md border px-5 py-4 text-sm font-medium ${
                slipMessage.type === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-green-500/40 bg-green-500/10 text-green-600"
              }`}
            >
              {slipMessage.text}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className={SECONDARY_BTN}
              onClick={() => resetSlipForm()}
            >
              Reset
            </button>
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={handleSaveSlip}
              disabled={isSavingSlip}
            >
              {isSavingSlip ? "Saving..." : "Save Courier Slip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierSlip;
