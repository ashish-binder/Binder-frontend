import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  getIPOs,
  createInwardStoreSheet,
  generateInwardStoreSheetCodes,
  getVpoHistory,
  getVpoDetail,
} from "../services/integration";
import ThemedSelect from "./IMS/StockSheet/ThemedSelect";

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp:
// small radius, defined grey borders, no shadows, orange primary, grey neutrals.
const CARD = "rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6";
const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const CTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const NO_SPIN =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const SECTION_TITLE =
  "mb-4 text-sm font-bold uppercase tracking-wide text-foreground";
// Compact table controls
const TH =
  "border-b border-[#e2e3e8] bg-muted px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground";
const TD = "border-b border-[#e2e3e8] px-2 py-1.5 align-middle";
const TCTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-2.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

const RECEIVABLE_TYPE_OPTIONS = [
  { value: "CHALLAN_ONLY", label: "Challan Only" },
  { value: "CHALLAN_CUM_INVOICE", label: "Challan Cum Invoice" },
];
const IPO_TYPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "PRODUCTION", label: "Production" },
  { value: "SAMPLING", label: "Sampling" },
];

// Truncate a filename to `max` chars, keeping the extension and adding an ellipsis.
const truncateName = (name, max = 20) => {
  if (!name || name.length <= max) return name || "";
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(1, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

// Themed image picker: dashed upload button with an icon, or once a file is chosen a
// thumbnail preview + truncated name + an X to clear (which re-enables the button).
const ImageUpload = ({ id, value, onChange }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  if (value) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card p-1.5">
        {preview ? (
          <img
            src={preview}
            alt={value.name}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
        <span
          className="flex-1 truncate text-sm font-medium text-foreground"
          title={value.name}
        >
          {truncateName(value.name)}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#cdced6] bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      <ImagePlus className="h-4 w-4" />
      Upload Image
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
    </label>
  );
};

const EMPTY_ROW = {
  particulars: "",
  po_quantity: "",
  received_quantity: "",
  rate: "",
  remarks: "",
  received_form: "",
  num_packages: "",
  uqr_sent: false,
  raw_material_type: "",
  raw_material: "",
  length: "",
};

const InwardStoreSheet = ({ onBack }) => {
  // Form state
  const [receivableType, setReceivableType] = useState("");
  const [ipoType, setIpoType] = useState("");
  const [selectedIpo, setSelectedIpo] = useState("");
  const [selectedVpo, setSelectedVpo] = useState("");
  const [selectedIpc, setSelectedIpc] = useState("");

  const [goodsReceivingCondition, setGoodsReceivingCondition] = useState("");
  const [goodsConditionImage, setGoodsConditionImage] = useState(null);
  const [vehicleNumberImage, setVehicleNumberImage] = useState(null);
  const [vehiclePic, setVehiclePic] = useState(null);
  const [vendorChallanNo, setVendorChallanNo] = useState("");
  const [vendorChallanImage, setVendorChallanImage] = useState(null);
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState("");
  const [vendorInvoiceImage, setVendorInvoiceImage] = useState(null);

  // Table rows
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);

  // Dropdown data
  const [ipoList, setIpoList] = useState([]);
  const [vpoList, setVpoList] = useState([]);
  const [ipcList, setIpcList] = useState([]);
  // Issued VPOs (the new Purchase-department VPOs) used to auto-fill line items.
  const [issuedVpos, setIssuedVpos] = useState([]);
  const [selectedIssuedVpo, setSelectedIssuedVpo] = useState("");
  const [loadingVpoItems, setLoadingVpoItems] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [createdSheet, setCreatedSheet] = useState(null);

  const isChallanOnly = receivableType === "CHALLAN_ONLY";

  // Map IPO type to the order_type filter used in the API
  const ipoTypeToOrderType = {
    COMPANY: "SELF",
    PRODUCTION: "PD",
    SAMPLING: "SAM",
  };

  // Load IPOs when ipoType changes
  useEffect(() => {
    if (!ipoType) {
      setIpoList([]);
      return;
    }
    const orderType = ipoTypeToOrderType[ipoType];
    getIPOs({ order_type: orderType })
      .then((data) => {
        const results = data?.results || data || [];
        const normalizedResults = Array.isArray(results) ? results : [];
        setIpoList(
          normalizedResults.filter((ipo) => ipo.order_type === orderType),
        );
      })
      .catch(() => setIpoList([]));
  }, [ipoType]);

  // Load VPOs (purchase orders) – we load all and let user pick
  useEffect(() => {
    // Purchase orders are available at the PO endpoint
    const loadVPOs = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_API_URL || "https://binder-backend-0szj.onrender.com/api/"}ims/purchase-orders/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await resp.json();
        const results = data?.results || data || [];
        setVpoList(Array.isArray(results) ? results : []);
      } catch {
        setVpoList([]);
      }
    };
    loadVPOs();
  }, []);

  // Load issued VPOs (new Purchase-department VPOs) for the auto-fill selector.
  // When an IPO is chosen we scope to it; otherwise list all issued VPOs.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getVpoHistory({ ipoId: selectedIpo || undefined, status: "issued" });
        if (!cancelled) setIssuedVpos(res?.results || []);
      } catch {
        if (!cancelled) setIssuedVpos([]);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedIpo]);

  // When a VPO is selected, pull its lines and populate the inward rows so the
  // user doesn't retype what Purchase already issued.
  const handleSelectIssuedVpo = async (vpoId) => {
    setSelectedIssuedVpo(vpoId);
    if (!vpoId) return;
    setLoadingVpoItems(true);
    try {
      const detail = await getVpoDetail(vpoId);
      const lines = detail?.lines || [];
      if (lines.length) {
        setRows(
          lines.map((l) => ({
            ...EMPTY_ROW,
            particulars: l.material_description || "",
            raw_material: l.material_description || "",
            raw_material_type: l.category || "",
            po_quantity: l.qty != null ? String(l.qty) : "",
            received_quantity: "",
            rate: l.rate != null ? String(l.rate) : "",
            remarks: l.remark || "",
          }))
        );
      }
    } catch {
      /* leave rows as-is on failure */
    } finally {
      setLoadingVpoItems(false);
    }
  };

  // Load IPCs (factory codes) when IPO is selected
  useEffect(() => {
    if (!selectedIpo) {
      setIpcList([]);
      return;
    }
    const loadIPCs = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_API_URL || "https://binder-backend-0szj.onrender.com/api/"}ims/factory-codes/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await resp.json();
        const results = data?.results || data || [];
        setIpcList(Array.isArray(results) ? results : []);
      } catch {
        setIpcList([]);
      }
    };
    loadIPCs();
  }, [selectedIpo]);

  // Row helpers
  const addRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (idx) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );
  };

  const updateRow = (idx, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const computeBalance = (row) => {
    const poQ = parseFloat(row.po_quantity) || 0;
    const recQ = parseFloat(row.received_quantity) || 0;
    return (poQ - recQ).toFixed(2);
  };

  const computeAmount = (row) => {
    const recQ = parseFloat(row.received_quantity) || 0;
    const rate = parseFloat(row.rate) || 0;
    return (recQ * rate).toFixed(2);
  };

  // Save handler
  const handleSave = async () => {
    if (!receivableType || !ipoType) {
      setErrorMsg("Please select Receivable Type and IPO Type.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        receivable_type: receivableType,
        ipo_type: ipoType,
        ipo: selectedIpo || null,
        vpo: selectedVpo || null,
        ipc: selectedIpc || null,
        goods_receiving_condition: goodsReceivingCondition,
        vendor_challan_no: vendorChallanNo,
        vendor_invoice_no: isChallanOnly ? "" : vendorInvoiceNo,
        items: rows.map((row, idx) => ({
          sr_no: idx + 1,
          particulars: row.particulars,
          po_quantity: parseFloat(row.po_quantity) || 0,
          received_quantity: parseFloat(row.received_quantity) || 0,
          rate: isChallanOnly ? 0 : parseFloat(row.rate) || 0,
          remarks: row.remarks,
          received_form: row.received_form,
          num_packages: parseInt(row.num_packages) || 0,
          uqr_sent: row.uqr_sent,
          raw_material_type: row.raw_material_type,
          raw_material: row.raw_material,
          length: row.length,
        })),
      };

      const result = await createInwardStoreSheet(payload);
      if (result?.status === "success") {
        setSuccessMsg("Inward Store Logs saved successfully!");
        setCreatedSheet(result.data);
      } else {
        setErrorMsg(
          result?.message || JSON.stringify(result) || "Failed to save.",
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Generate UIN/USN codes
  const handleGenerateCodes = async () => {
    if (!createdSheet?.id) {
      setErrorMsg("Please save the form first before generating codes.");
      return;
    }
    setGeneratingCodes(true);
    setErrorMsg("");

    try {
      const result = await generateInwardStoreSheetCodes(createdSheet.id);
      if (result?.status === "success") {
        setCreatedSheet(result.data);
        setSuccessMsg("UIN and USN codes generated successfully!");
      } else {
        setErrorMsg(result?.message || "Failed to generate codes.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while generating codes.");
    } finally {
      setGeneratingCodes(false);
    }
  };

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        zoom: 0.9,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        // The theme's --accent is a pinkish grey used for the dropdown option hover;
        // recolor to a neutral light grey so hover reads grey (matches StockSheet).
        "--accent": "#edeef1",
      }}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            Inward Store Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record incoming inventory with receiving details and generate
            UIN/USN codes
          </p>
        </div>

        {successMsg && (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 px-5 py-4 text-sm font-medium text-green-600">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Generated codes display */}
        {createdSheet?.uin_code && (
          <div className={CARD}>
            <h3 className={SECTION_TITLE}>Generated Codes</h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-[#e2e3e8] bg-background px-3 py-1.5 font-mono text-sm">
                <span className="text-muted-foreground">UIN</span>
                <span className="font-semibold text-foreground">
                  {createdSheet.uin_code}
                </span>
              </span>
              {createdSheet.items?.map(
                (item) =>
                  item.usn_code && (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-md border border-[#e2e3e8] bg-background px-3 py-1.5 font-mono text-sm"
                    >
                      <span className="text-muted-foreground">
                        USN #{item.sr_no}
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.usn_code}
                      </span>
                    </span>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Order Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={LABEL}>
                Receivable Type <span className="text-primary">*</span>
              </label>
              <ThemedSelect
                value={receivableType}
                onChange={setReceivableType}
                options={RECEIVABLE_TYPE_OPTIONS}
                placeholder="-- Select --"
              />
            </div>

            <div>
              <label className={LABEL}>
                Select IPO Type <span className="text-primary">*</span>
              </label>
              <ThemedSelect
                value={ipoType}
                onChange={(v) => {
                  setIpoType(v);
                  setSelectedIpo("");
                }}
                options={IPO_TYPE_OPTIONS}
                placeholder="-- Select --"
              />
            </div>

            <div>
              <label className={LABEL}>Select IPO</label>
              <ThemedSelect
                value={selectedIpo}
                onChange={setSelectedIpo}
                isDisabled={!ipoType}
                placeholder="-- Select IPO --"
                options={ipoList.map((ipo) => ({
                  value: ipo.id,
                  label: `${ipo.ipo_code} — ${ipo.program_name}`,
                }))}
              />
            </div>

            <div>
              <label className={LABEL}>Select VPO</label>
              <ThemedSelect
                value={selectedVpo}
                onChange={setSelectedVpo}
                placeholder="-- Select VPO --"
                options={vpoList.map((po) => ({
                  value: po.id,
                  label: `${po.po_code}${po.buyer_name ? ` — ${po.buyer_name}` : ""}`,
                }))}
              />
            </div>

            <div>
              <label className={LABEL}>
                Select VPO (auto-fill items){loadingVpoItems ? " — loading…" : ""}
              </label>
              <ThemedSelect
                value={selectedIssuedVpo}
                onChange={handleSelectIssuedVpo}
                placeholder="-- Select issued VPO --"
                options={issuedVpos.map((v) => ({
                  value: v.id,
                  label: `${v.vpo_number}${v.ipo_code ? ` — ${v.ipo_code}` : ""}`,
                }))}
              />
            </div>

            <div>
              <label className={LABEL}>IPC (Factory Code)</label>
              <ThemedSelect
                value={selectedIpc}
                onChange={setSelectedIpc}
                isDisabled={!selectedIpo}
                placeholder="-- Select IPC --"
                options={ipcList.map((fc) => ({
                  value: fc.id,
                  label: fc.code || fc.id,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Receiving details */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Receiving Details</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 md:items-start">
            {/* Row 1 — Goods Receiving Condition | its image */}
            <div>
              <label className={LABEL}>Goods Receiving Condition</label>
              <textarea
                className={`${CTRL} min-h-20 resize-y`}
                value={goodsReceivingCondition}
                onChange={(e) => setGoodsReceivingCondition(e.target.value)}
                placeholder="Describe goods receiving condition..."
              />
            </div>

            <div>
              <label className={LABEL}>Goods Condition Image</label>
              <ImageUpload
                id="iss-goods-condition-image"
                value={goodsConditionImage}
                onChange={setGoodsConditionImage}
              />
            </div>

            {/* Row 2 — Vehicle Number | Vehicle Pic */}
            <div>
              <label className={LABEL}>Vehicle Number</label>
              <ImageUpload
                id="iss-vehicle-number"
                value={vehicleNumberImage}
                onChange={setVehicleNumberImage}
              />
            </div>

            <div>
              <label className={LABEL}>Vehicle Pic</label>
              <ImageUpload
                id="iss-vehicle-pic"
                value={vehiclePic}
                onChange={setVehiclePic}
              />
            </div>

            {/* Row 3 — Vendor Challan No. | Vendor Invoice No. */}
            <div>
              <label className={LABEL}>Vendor Challan No.</label>
              <input
                className={CTRL}
                type="text"
                value={vendorChallanNo}
                onChange={(e) => setVendorChallanNo(e.target.value)}
                placeholder="Enter challan number"
              />
              <div className="mt-2">
                <ImageUpload
                  id="iss-vendor-challan-image"
                  value={vendorChallanImage}
                  onChange={setVendorChallanImage}
                />
              </div>
            </div>

            {!isChallanOnly && (
              <div>
                <label className={LABEL}>Vendor Invoice No.</label>
                <input
                  className={CTRL}
                  type="text"
                  value={vendorInvoiceNo}
                  onChange={(e) => setVendorInvoiceNo(e.target.value)}
                  placeholder="Enter invoice number"
                />
                <div className="mt-2">
                  <ImageUpload
                    id="iss-vendor-invoice-image"
                    value={vendorInvoiceImage}
                    onChange={setVendorInvoiceImage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Items</h3>
          <div className="overflow-x-auto rounded-lg border border-[#e2e3e8]">
            <table className="w-full table-fixed border-collapse text-sm">
              {isChallanOnly ? (
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>
              ) : (
                <colgroup>
                  <col style={{ width: "3%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "4%" }} />
                </colgroup>
              )}
              <thead>
                <tr>
                  <th className={`${TH} text-center`}>Sr</th>
                  <th className={TH}>Particulars</th>
                  <th className={TH}>PO Qty</th>
                  <th className={TH}>Received Qty</th>
                  <th className={`${TH} text-center`}>Bal</th>
                  {!isChallanOnly && <th className={TH}>Rate (₹)</th>}
                  {!isChallanOnly && <th className={TH}>Amount (₹)</th>}
                  <th className={TH}>Remarks</th>
                  <th className={TH}>Received Form</th>
                  <th className={TH}># of Package</th>
                  <th className={TH}>UQR</th>
                  <th className={TH}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-muted/50">
                    <td className={`${TD} text-center font-semibold`}>
                      {idx + 1}
                    </td>
                    <td className={TD}>
                      <input
                        className={TCTRL}
                        type="text"
                        value={row.particulars}
                        onChange={(e) =>
                          updateRow(idx, "particulars", e.target.value)
                        }
                        placeholder="Item name"
                      />
                    </td>
                    <td className={TD}>
                      <input
                        className={`${TCTRL} ${NO_SPIN}`}
                        type="number"
                        value={row.po_quantity}
                        onChange={(e) =>
                          updateRow(idx, "po_quantity", e.target.value)
                        }
                        min="0"
                      />
                    </td>
                    <td className={TD}>
                      <input
                        className={`${TCTRL} ${NO_SPIN}`}
                        type="number"
                        value={row.received_quantity}
                        onChange={(e) =>
                          updateRow(idx, "received_quantity", e.target.value)
                        }
                        min="0"
                      />
                    </td>
                    <td className={`${TD} text-center font-medium`}>
                      {computeBalance(row)}
                    </td>
                    {!isChallanOnly && (
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                            ₹
                          </span>
                          <input
                            className={`${TCTRL} ${NO_SPIN}`}
                            type="number"
                            value={row.rate}
                            onChange={(e) =>
                              updateRow(idx, "rate", e.target.value)
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                    )}
                    {!isChallanOnly && (
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                            ₹
                          </span>
                          <span className="font-medium">
                            {computeAmount(row)}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className={TD}>
                      <input
                        className={TCTRL}
                        type="text"
                        value={row.remarks}
                        onChange={(e) =>
                          updateRow(idx, "remarks", e.target.value)
                        }
                        placeholder="Remarks"
                      />
                    </td>
                    <td className={TD}>
                      <input
                        className={TCTRL}
                        type="text"
                        value={row.received_form}
                        onChange={(e) =>
                          updateRow(idx, "received_form", e.target.value)
                        }
                        placeholder="Form"
                      />
                    </td>
                    <td className={TD}>
                      <input
                        className={`${TCTRL} ${NO_SPIN}`}
                        type="number"
                        value={row.num_packages}
                        onChange={(e) =>
                          updateRow(idx, "num_packages", e.target.value)
                        }
                        min="0"
                      />
                    </td>
                    <td className={TD}>
                      <label
                        className="flex cursor-pointer items-center gap-2"
                        title="SENT TO QUALITY VERIFICATION"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                          checked={row.uqr_sent}
                          onChange={(e) =>
                            updateRow(idx, "uqr_sent", e.target.checked)
                          }
                        />
                        <span className="text-[9px] font-semibold leading-tight text-primary">
                          SENT TO QUALITY VERIFICATION
                        </span>
                      </label>
                    </td>
                    <td className={`${TD} text-center`}>
                      <button
                        type="button"
                        className="cursor-pointer rounded p-1 text-lg leading-none text-destructive transition-colors hover:bg-destructive/10"
                        onClick={() => removeRow(idx)}
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            + Add Row
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <button
            type="button"
            className="cursor-pointer rounded-md border border-[#e2e3e8] bg-muted px-6 py-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-[#e9eaee] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleGenerateCodes}
            disabled={generatingCodes || !createdSheet}
          >
            {generatingCodes ? "Generating..." : "Generate UIN and USN Codes"}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InwardStoreSheet;
