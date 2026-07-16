import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../api/authService";
import { updateCourierRecord } from "../../services/integration";
import { normalizeOrderType } from "../../utils/orderType";
import ThemedSelect from "../IMS/StockSheet/ThemedSelect";
import {
  CARD,
  Field,
  FormRow,
  Input,
  TD,
  TH,
  IPO_TYPE_OPTIONS,
  computeDimensionalWeight,
  getSampleAsLabel,
  persistCourierRecords,
  toLocalDateValue,
  useCourierIpos,
  useCourierRecords,
} from "./shared";

const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const MasterCourierSheet = ({ onBack }) => {
  const ipos = useCourierIpos();
  const { records, setRecords } = useCourierRecords();

  const [masterFilterType, setMasterFilterType] = useState("");
  const [masterFilterIpo, setMasterFilterIpo] = useState("");
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((res) => {
        if (cancelled) return;
        const td = res?.tenant_details || {};
        setCompanyInfo({
          name: td.company_name || td.trade_name || td.legal_name || "",
          gstin: td.gst_number || td.gstin || "",
          address: td.company_address || td.address || "",
          phone:
            td.company_phone ||
            td.whatsapp_number ||
            td.phone ||
            td.mobile ||
            "",
        });
      })
      .catch((err) => {
        console.warn("[MasterCourierSheet] Failed to load user data:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const masterFilteredIpos = useMemo(
    () =>
      masterFilterType
        ? ipos.filter(
            (ipo) => normalizeOrderType(ipo.orderType) === masterFilterType,
          )
        : [],
    [ipos, masterFilterType],
  );

  const visibleRecords = useMemo(() => {
    if (!masterFilterType || !masterFilterIpo) return [];
    return records
      .filter(
        (record) =>
          record.ipoType === masterFilterType &&
          record.ipoCode === masterFilterIpo,
      )
      .sort((left, right) => {
        const leftKey = left.dispatchDate || left.createdAt || "";
        const rightKey = right.dispatchDate || right.createdAt || "";
        return rightKey.localeCompare(leftKey);
      });
  }, [masterFilterType, masterFilterIpo, records]);

  const handleMasterFieldChange = (recordId, field, value) => {
    setRecords((current) => {
      const nextRecords = current.map((record) =>
        record.id === recordId
          ? { ...record, [field]: value, updatedAt: new Date().toISOString() }
          : record,
      );

      persistCourierRecords(nextRecords);
      return nextRecords;
    });
  };

  // Master-sheet-editable fields → backend (snake_case) field names.
  const MASTER_FIELD_API_KEYS = {
    courierReceipt: "courier_receipt",
    dispatchDate: "dispatch_date",
    handoverTo: "handover_to",
    contact: "contact",
    awbNumber: "awb_number",
    edd: "edd",
    status: "status",
  };

  // Persist a single edited field to the backend on blur, when the record exists
  // server-side. Local storage is already updated on change; this just syncs.
  const handleMasterFieldBlur = async (record, field, value) => {
    if (!record?.backendId) return;
    const apiField = MASTER_FIELD_API_KEYS[field];
    if (!apiField) return;
    try {
      await updateCourierRecord(record.backendId, { [apiField]: value ?? "" });
    } catch (error) {
      console.warn(
        "[MasterCourierSheet] Failed to sync field to backend:",
        error,
      );
    }
  };

  const handleMasterFilterTypeChange = (value) => {
    setMasterFilterType(value);
    setMasterFilterIpo("");
  };

  const handlePrintReceipt = (record) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for this site to print the receipt.");
      return;
    }
    const sampleLabel = escapeHtml(getSampleAsLabel(record));
    const ci = companyInfo || {};
    const companyName = escapeHtml(ci.name || "Company Name");
    const companyGstin = escapeHtml(ci.gstin);
    const companyAddress = escapeHtml(ci.address);
    const companyPhone = escapeHtml(ci.phone);
    const html = `<!DOCTYPE html>
<html>
<head>
<title>Courier Receipt - ${escapeHtml(record.ipoCode || "N/A")}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;padding:20px;print-color-adjust:exact;-webkit-print-color-adjust:exact}
table{width:100%;border-collapse:collapse;border:2px solid #000}
td{border:1px solid #000;padding:8px 10px;font-size:14px}
.lbl{font-weight:700;text-align:right;white-space:nowrap}
.sig-lbl{font-weight:700;text-align:center;white-space:nowrap}
.sig-val{min-width:60px}
@media print{
  body{padding:0}
  @page{size:portrait;margin:10mm 12mm}
  td{border:1px solid #000 !important}
  table{border:2px solid #000 !important}
}
</style>
</head>
<body>
<table>
<tr>
  <td colspan="6" style="padding:8px 10px">
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:13px">
      <span>${companyGstin ? "GSTIN: " + companyGstin : "&nbsp;"}</span>
      <span>${companyPhone ? "MOBILE: " + companyPhone : "&nbsp;"}</span>
    </div>
  </td>
</tr>
<tr>
  <td colspan="6" style="text-align:center;padding:8px 10px">
    <div style="font-size:24px;font-weight:700">${companyName}</div>
    ${companyAddress ? '<div style="font-size:13px;margin-top:2px">' + companyAddress + "</div>" : ""}
  </td>
</tr>
<tr><td colspan="2" class="lbl">COURIER RECEIPT NO.:</td><td colspan="4">${escapeHtml(record.courierReceipt)}</td></tr>
<tr><td colspan="2" class="lbl">IPO TYPE:</td><td colspan="4">${escapeHtml(record.ipoType)}</td></tr>
<tr><td colspan="2" class="lbl">IPO NO.:</td><td colspan="4">${escapeHtml(record.ipoCode)}</td></tr>
<tr><td colspan="2" class="lbl">COURIERTYPE:</td><td colspan="4">${sampleLabel}</td></tr>
<tr><td colspan="2" class="lbl">BOXES/PACKETS:</td><td colspan="4">${escapeHtml(record.boxesPackets)}</td></tr>
${
  Array.isArray(record.boxRows) && record.boxRows.length > 0
    ? `<tr><td colspan="6" style="padding:0">
        <table style="width:100%;border:0;border-collapse:collapse">
          <tr style="background:#f3f4f6">
            <td style="border:1px solid #000;width:50px;font-weight:700">Sr No.</td>
            <td style="border:1px solid #000;font-weight:700">L (${escapeHtml(record.dimensionUnit || "CM")})</td>
            <td style="border:1px solid #000;font-weight:700">W (${escapeHtml(record.dimensionUnit || "CM")})</td>
            <td style="border:1px solid #000;font-weight:700">H (${escapeHtml(record.dimensionUnit || "CM")})</td>
            <td style="border:1px solid #000;font-weight:700">Weight (kg)</td>
            <td style="border:1px solid #000;font-weight:700">Dim. Wt. ((L×W×H)/5000)</td>
          </tr>
          ${record.boxRows
            .map((row, idx) => {
              const dimW = computeDimensionalWeight(
                row.length,
                row.width,
                row.height,
              );
              return `<tr>
                <td style="border:1px solid #000">${escapeHtml(row.srNo ?? idx + 1)}</td>
                <td style="border:1px solid #000">${escapeHtml(row.length || "-")}</td>
                <td style="border:1px solid #000">${escapeHtml(row.width || "-")}</td>
                <td style="border:1px solid #000">${escapeHtml(row.height || "-")}</td>
                <td style="border:1px solid #000">${escapeHtml(row.weight || "-")}</td>
                <td style="border:1px solid #000">${escapeHtml(dimW || "-")}</td>
              </tr>`;
            })
            .join("")}
        </table>
      </td></tr>`
    : ""
}
<tr>
  <td class="lbl">DROPPED BY:</td>
  <td class="sig-val">${escapeHtml(record.droppedBy)}</td>
  <td class="sig-lbl">SIGN:</td>
  <td class="sig-val"></td>
  <td class="sig-lbl">DATE:</td>
  <td class="sig-val">${escapeHtml(record.dispatchDate)}</td>
</tr>
<tr>
  <td class="lbl">HANDOVER TO:</td>
  <td class="sig-val">${escapeHtml(record.handoverTo)}</td>
  <td class="sig-lbl">SIGN:</td>
  <td class="sig-val"></td>
  <td class="sig-lbl">DATE:</td>
  <td class="sig-val"></td>
</tr>
<tr><td colspan="2" class="lbl">CONTACT:</td><td colspan="4">${escapeHtml(record.contact)}</td></tr>
<tr><td colspan="2" class="lbl">STAMP:</td><td colspan="4" style="height:50px">&nbsp;</td></tr>
</table>
<script>window.onload=function(){window.print()}</script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
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
          <h1 className="text-3xl font-bold text-foreground">
            Master Courier Sheet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select IPO Type and IPO to view and print courier receipts.
          </p>
        </div>

        {/* Filter */}
        <div className={CARD}>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#e2e3e8] pb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">Filter</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select IPO Type and IPO to view the courier receipt form.
              </p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Records:{" "}
              <strong className="text-foreground">
                {visibleRecords.length}
              </strong>
            </div>
          </div>

          <FormRow className="sm:grid-cols-2">
            <Field label="IPO Type" required>
              <ThemedSelect
                value={masterFilterType}
                onChange={handleMasterFilterTypeChange}
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
                masterFilterType && masterFilteredIpos.length === 0
                  ? "No IPOs available for this IPO Type."
                  : ""
              }
            >
              <ThemedSelect
                value={masterFilterIpo}
                onChange={setMasterFilterIpo}
                isDisabled={
                  !masterFilterType || masterFilteredIpos.length === 0
                }
                placeholder={
                  !masterFilterType
                    ? "Select IPO Type first"
                    : masterFilteredIpos.length === 0
                      ? "No IPOs available"
                      : "Select IPO"
                }
                options={masterFilteredIpos.map((ipo) => ({
                  value: ipo.ipoCode,
                  label: ipo.programName
                    ? `${ipo.ipoCode} - ${ipo.programName}`
                    : ipo.ipoCode,
                }))}
              />
            </Field>
          </FormRow>
        </div>

        {!masterFilterType || !masterFilterIpo ? (
          <div className={CARD}>
            <div className="py-12 text-center text-sm text-muted-foreground">
              Select both IPO Type and IPO to view courier receipts.
            </div>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className={CARD}>
            <div className="py-12 text-center text-sm text-muted-foreground">
              No courier slips found for the selected IPO Type and IPO.
            </div>
          </div>
        ) : (
          visibleRecords.map((record, index) => (
            <div key={record.id} className={CARD}>
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#e2e3e8] pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Courier Receipt
                  {visibleRecords.length > 1 ? ` #${index + 1}` : ""}
                </h2>
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  onClick={() => handlePrintReceipt(record)}
                >
                  Print
                </button>
              </div>

              <FormRow className="sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Courier Receipt No.">
                  <Input
                    value={record.courierReceipt || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "courierReceipt",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(
                        record,
                        "courierReceipt",
                        event.target.value,
                      )
                    }
                    placeholder="Enter courier receipt no."
                  />
                </Field>

                <Field label="IPO Type">
                  <Input value={record.ipoType || ""} readOnly />
                </Field>

                <Field label="IPO No.">
                  <Input value={record.ipoCode || ""} readOnly />
                </Field>

                <Field label="Courier Type (Sample As)">
                  <Input value={getSampleAsLabel(record)} readOnly />
                </Field>

                <Field label="Boxes / Packets">
                  <Input value={record.boxesPackets || "-"} readOnly />
                </Field>

                {Array.isArray(record.boxRows) && record.boxRows.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Per-box details — dimensions in{" "}
                      {record.dimensionUnit || "CM"}
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
                            <th className={TH}>
                              L ({record.dimensionUnit || "CM"})
                            </th>
                            <th className={TH}>
                              W ({record.dimensionUnit || "CM"})
                            </th>
                            <th className={TH}>
                              H ({record.dimensionUnit || "CM"})
                            </th>
                            <th className={TH}>Weight (kg)</th>
                            <th className={TH}>
                              Dim. Weight ((L × W × H) / 5000)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.boxRows.map((row, idx) => {
                            const dimW = computeDimensionalWeight(
                              row.length,
                              row.width,
                              row.height,
                            );
                            return (
                              <tr key={`master-box-${record.id}-${idx}`}>
                                <td
                                  className={`${TD} text-center font-semibold`}
                                >
                                  {row.srNo ?? idx + 1}
                                </td>
                                <td className={TD}>{row.length || "-"}</td>
                                <td className={TD}>{row.width || "-"}</td>
                                <td className={TD}>{row.height || "-"}</td>
                                <td className={TD}>{row.weight || "-"}</td>
                                <td
                                  className={`${TD} font-medium text-muted-foreground`}
                                >
                                  {dimW || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Field label="Dispatch Date">
                  <Input
                    type="date"
                    value={
                      record.dispatchDate || toLocalDateValue(record.createdAt)
                    }
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "dispatchDate",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(
                        record,
                        "dispatchDate",
                        event.target.value,
                      )
                    }
                  />
                </Field>

                <Field label="Dropped By">
                  <Input value={record.droppedBy || "-"} readOnly />
                </Field>

                <Field label="Handover To">
                  <Input
                    value={record.handoverTo || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "handoverTo",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(
                        record,
                        "handoverTo",
                        event.target.value,
                      )
                    }
                    placeholder="Enter handover to"
                  />
                </Field>

                <Field label="Contact">
                  <Input
                    value={record.contact || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "contact",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(record, "contact", event.target.value)
                    }
                    placeholder="Enter contact"
                  />
                </Field>

                <Field label="AWB #">
                  <Input
                    value={record.awbNumber || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "awbNumber",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(
                        record,
                        "awbNumber",
                        event.target.value,
                      )
                    }
                    placeholder="Enter AWB number"
                  />
                </Field>

                <Field label="EDD">
                  <Input
                    type="date"
                    value={record.edd || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "edd",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(record, "edd", event.target.value)
                    }
                  />
                </Field>

                <Field label="Status">
                  <Input
                    value={record.status || ""}
                    onChange={(event) =>
                      handleMasterFieldChange(
                        record.id,
                        "status",
                        event.target.value,
                      )
                    }
                    onBlur={(event) =>
                      handleMasterFieldBlur(record, "status", event.target.value)
                    }
                    placeholder="Enter status"
                  />
                </Field>

                {record.attachImageRefUrl && (
                  <Field label="Image Ref">
                    <a
                      href={record.attachImageRefUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {record.attachImageRefName || "View Ref"}
                    </a>
                  </Field>
                )}
              </FormRow>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MasterCourierSheet;
