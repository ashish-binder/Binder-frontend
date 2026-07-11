import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ThemedSelect from "../../IMS/StockSheet/ThemedSelect";
import { COMPANY, DEFAULT_TERMS, downloadVpoPdf, printVpo } from "./vpoPrint";

const INPUT =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const LABEL =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";
const TH =
  "border border-primary/40 bg-primary px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-primary-foreground whitespace-nowrap";
const TD =
  "border border-[#e2e3e8] px-3 py-2 align-middle text-sm text-foreground";
// Section header strip inside the FROM / TO blocks.
const BLOCK_HEAD =
  "mb-3 rounded-md bg-primary/5 px-3 py-2 text-sm font-bold tracking-wide text-primary";
const PRIMARY_BTN =
  "cursor-pointer rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINE_BTN =
  "cursor-pointer rounded-md border border-[#e2e3e8] bg-card px-4 py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

const num = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

const money = (n) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const todayIso = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Read-only label/value line used in the FROM (company) block.
const StaticRow = ({ label, value }) => (
  <div className="flex gap-2 text-sm">
    <span className="shrink-0 font-semibold text-foreground">{label}</span>
    <span className="break-words text-muted-foreground">{value}</span>
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className={LABEL}>{label}</label>
    {children}
  </div>
);

// `preview` shape: { ipo, lines:[{source_type, source_id, ipc_code, category,
// material_description, qty, unit, rate, amount, remark}], total_qty }.
const VpoPreviewModal = ({
  open,
  preview,
  errors,
  onClose,
  onIssue,
  busy,
  vendors = [],
}) => {
  const previewLines = useMemo(() => preview?.lines || [], [preview]);

  // Vendor (TO) block
  const [vendorId, setVendorId] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorDeliveryAddress, setVendorDeliveryAddress] = useState("");
  const [vendorGst, setVendorGst] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorWhatsapp, setVendorWhatsapp] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  // Company (FROM) block — editable parts
  const [companyDispatchAddress, setCompanyDispatchAddress] = useState("");
  const [companyDeliveryAddress, setCompanyDeliveryAddress] = useState("");
  const [companyContact, setCompanyContact] = useState("");
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");

  // Order meta
  const [vpoNo, setVpoNo] = useState("");
  const [vpoDate, setVpoDate] = useState(todayIso());
  const [deliveryDueDate, setDeliveryDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  // Footer
  const [wastageTolerance, setWastageTolerance] = useState("");
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [raisedByName, setRaisedByName] = useState("");
  const [raisedByUsername, setRaisedByUsername] = useState("");
  const [remarks, setRemarks] = useState("");

  // Editable per-line qty/rate/remark, keyed by index. Seeded from the preview.
  const [qtys, setQtys] = useState({});

  const [rates, setRates] = useState({});
  const [lineRemarks, setLineRemarks] = useState({});

  // PDF generation is async (html2pdf is lazy-loaded), so it gets its own busy flag.
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const seededQtys = {};
    const seededRates = {};
    const seededRemarks = {};
    previewLines.forEach((l, i) => {
      seededQtys[i] = l.qty ?? "";

      seededRates[i] = l.rate ?? "";
      seededRemarks[i] = l.remark ?? "";
    });
    setQtys(seededQtys);
    setRates(seededRates);
    setLineRemarks(seededRemarks);
    setVpoDate(todayIso());
    setTerms(DEFAULT_TERMS);
  }, [open, previewLines]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => String(v.id) === String(vendorId)),
    [vendors, vendorId],
  );

  // Auto-fill the vendor block whenever a vendor is picked from the list.
  useEffect(() => {
    if (!selectedVendor) return;
    setVendorCode(selectedVendor.code || "");
    setVendorName(selectedVendor.vendor_name || selectedVendor.name || "");
    setVendorAddress(selectedVendor.address || "");
    setVendorGst(selectedVendor.gst || selectedVendor.gst_number || "");
    setVendorContact(selectedVendor.contact_person || "");
    setVendorWhatsapp(
      selectedVendor.whatsapp_number || selectedVendor.contact_number || "",
    );
    setVendorEmail(selectedVendor.email || "");
    setPaymentTerms((prev) => prev || selectedVendor.payment_terms || "");
  }, [selectedVendor]);

  // The edited qty for a line (falls back to the preview qty until seeded).
  //   const qtyOf = (l, i) => (qtys[i] === undefined ? num(l.qty) : num(qtys[i]));

  //   const totalQty = useMemo(
  //     () => previewLines.reduce((s, l, i) => s + qtyOf(l, i), 0),
  //     [previewLines, qtys],
  //   );
  //   const totalAmount = useMemo(
  //     () => previewLines.reduce((s, l, i) => s + num(rates[i]) * qtyOf(l, i), 0),
  //     [previewLines, rates, qtys],
  //   );

  //   if (!open) return null;

  //   const ipoCode = preview?.ipo?.ipo_code || "";

  const totalQty = useMemo(
    () => previewLines.reduce((s, l) => s + num(l.qty), 0),
    [previewLines],
  );
  const totalAmount = useMemo(
    () => previewLines.reduce((s, l, i) => s + num(rates[i]) * num(l.qty), 0),
    [previewLines, rates],
  );

  if (!open) return null;

  const ipoCode = preview?.ipo?.ipo_code || "";

  const buildLines = () =>
    previewLines.map((l, i) => ({
      source_type: l.source_type,
      source_id: l.source_id,
      material_description: l.material_description,
      qty: l.qty,
      unit: l.unit,
      rate: rates[i] === "" || rates[i] === undefined ? undefined : rates[i],
      amount: num(rates[i]) * num(l.qty),
      remark: lineRemarks[i] || "",
    }));

  // Everything the printable Purchase Order needs.
  const buildDocument = () => ({
    vpo_number: vpoNo,
    vpo_date: vpoDate,
    ipo_code: ipoCode,
    vendor_code: vendorCode,
    vendor_name: vendorName,
    vendor_address: vendorAddress,
    vendor_delivery_address: vendorDeliveryAddress,
    vendor_gst: vendorGst,
    vendor_contact_person: vendorContact,
    vendor_whatsapp: vendorWhatsapp,
    vendor_email: vendorEmail,
    company_dispatch_address: companyDispatchAddress,
    company_delivery_address: companyDeliveryAddress,
    company_contact_person: companyContact,
    company_whatsapp: companyWhatsapp,
    delivery_due_date: deliveryDueDate,
    payment_terms: paymentTerms,
    wastage_tolerance: wastageTolerance,
    terms,
    raised_by_name: raisedByName,
    raised_by_username: raisedByUsername,
    remarks,
    total_qty: totalQty,
    total_amount: totalAmount,
    lines: buildLines(),
  });

  const handlePrint = () => printVpo(buildDocument());

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadVpoPdf(buildDocument());
    } catch (err) {
      console.error("Failed to generate the VPO PDF:", err);
      alert(`Could not generate the PDF: ${err?.message || err}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleIssue = () => {
    onIssue?.({
      vendor_id: vendorId || undefined,
      payment_terms: paymentTerms || undefined,
      delivery_due_date: deliveryDueDate || undefined,
      remarks: remarks || undefined,
      lines: buildLines(),
      document: buildDocument(),
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        // Portalled to <body>, so it doesn't inherit the sheet's override. The theme's
        // --accent is a pinkish grey used for react-select's option hover; make it neutral.
        "--accent": "#edeef1",
      }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal chrome */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e3e8] px-6 py-4">
          <div>
            <div className="text-lg font-bold text-foreground">
              Generate VPO
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              IPO {ipoCode} — {previewLines.length} line(s)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={OUTLINE_BTN} onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {/* Document body */}
        <div className="overflow-y-auto bg-[#f8f9fb] px-6 py-5">
          {errors && errors.length > 0 && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Cannot issue VPO:</strong>
              <ul className="ml-5 mt-1 list-disc">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card">
            {/* Title band */}
            <div className="bg-primary py-3 text-center text-sm font-bold uppercase tracking-[0.25em] text-primary-foreground">
              Purchase Order
            </div>

            {/* FROM / TO */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* FROM — company */}
              <div className="space-y-3 border-b border-[#e2e3e8] p-5 lg:border-b-0 lg:border-r">
                <div className={BLOCK_HEAD}>FROM: {COMPANY.name}</div>
                <div className="space-y-1 rounded-md border border-[#e2e3e8] bg-muted/40 p-3">
                  <div className="text-sm text-muted-foreground">
                    {COMPANY.address}
                  </div>
                  <StaticRow label="GST:" value={COMPANY.gst} />
                  <StaticRow label="EMAIL:" value={COMPANY.email} />
                </div>

                <Field label="Company Dispatch Address">
                  <input
                    className={INPUT}
                    value={companyDispatchAddress}
                    onChange={(e) => setCompanyDispatchAddress(e.target.value)}
                    placeholder="Enter dispatch address"
                  />
                </Field>
                <Field label="Company Delivery Address">
                  <input
                    className={INPUT}
                    value={companyDeliveryAddress}
                    onChange={(e) => setCompanyDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Contact Person">
                    <input
                      className={INPUT}
                      value={companyContact}
                      onChange={(e) => setCompanyContact(e.target.value)}
                      placeholder="Enter contact person"
                    />
                  </Field>
                  <Field label="WhatsApp No.">
                    <input
                      className={INPUT}
                      value={companyWhatsapp}
                      onChange={(e) => setCompanyWhatsapp(e.target.value)}
                      placeholder="Enter WhatsApp number"
                    />
                  </Field>
                </div>
                <Field label="IPO Code">
                  <input
                    className={`${INPUT} bg-muted/50`}
                    value={ipoCode}
                    readOnly
                  />
                </Field>
              </div>

              {/* TO — vendor */}
              <div className="space-y-3 p-5">
                <div className={BLOCK_HEAD}>
                  TO: {vendorName || "VENDOR"}
                  {vendorCode ? ` (${vendorCode})` : " (VENDOR CODE)"}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Select Vendor">
                    <ThemedSelect
                      value={vendorId}
                      onChange={setVendorId}
                      isDisabled={vendors.length === 0}
                      placeholder={
                        vendors.length === 0
                          ? "No vendors available"
                          : "— Select vendor —"
                      }
                      options={vendors.map((v) => ({
                        value: String(v.id),
                        label: `${v.code ? `${v.code} — ` : ""}${
                          v.vendor_name || v.name || "Vendor"
                        }`,
                      }))}
                    />
                  </Field>
                  <Field label="Vendor Code">
                    <input
                      className={INPUT}
                      value={vendorCode}
                      onChange={(e) => setVendorCode(e.target.value)}
                      placeholder="Vendor code"
                    />
                  </Field>
                </div>

                <Field label="Vendor Name">
                  <input
                    className={INPUT}
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Vendor name"
                  />
                </Field>
                <Field label="Vendor Address">
                  <input
                    className={INPUT}
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="Vendor address"
                  />
                </Field>
                <Field label="Vendor Delivery Address">
                  <input
                    className={INPUT}
                    value={vendorDeliveryAddress}
                    onChange={(e) => setVendorDeliveryAddress(e.target.value)}
                    placeholder="Vendor delivery address"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="GST">
                    <input
                      className={INPUT}
                      value={vendorGst}
                      onChange={(e) => setVendorGst(e.target.value)}
                      placeholder="Vendor GST"
                    />
                  </Field>
                  <Field label="Contact Person">
                    <input
                      className={INPUT}
                      value={vendorContact}
                      onChange={(e) => setVendorContact(e.target.value)}
                      placeholder="Contact person"
                    />
                  </Field>
                  <Field label="WhatsApp No.">
                    <input
                      className={INPUT}
                      value={vendorWhatsapp}
                      onChange={(e) => setVendorWhatsapp(e.target.value)}
                      placeholder="WhatsApp number"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={INPUT}
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="Vendor email"
                    />
                  </Field>
                  <Field label="VPO No.">
                    <input
                      className={INPUT}
                      value={vpoNo}
                      onChange={(e) => setVpoNo(e.target.value)}
                      placeholder="Auto / enter VPO no."
                    />
                  </Field>
                  <Field label="VPO Date">
                    <input
                      type="date"
                      className={INPUT}
                      value={vpoDate}
                      onChange={(e) => setVpoDate(e.target.value)}
                    />
                  </Field>
                  <Field label="Delivery Due Date">
                    <input
                      type="date"
                      className={INPUT}
                      value={deliveryDueDate}
                      onChange={(e) => setDeliveryDueDate(e.target.value)}
                    />
                  </Field>
                  <Field label="Payment Terms">
                    <input
                      className={INPUT}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Payment terms"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="overflow-x-auto border-t border-[#e2e3e8]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={`${TH} w-14 text-center`}>S.No.</th>
                    <th className={TH}>Material Description</th>
                    <th className={`${TH} w-28 text-right`}>Purchase Qty</th>
                    <th className={`${TH} w-20 text-center`}>Unit</th>
                    <th className={`${TH} w-32 text-right`}>Rate (INR/Unit)</th>
                    <th className={`${TH} w-32 text-right`}>Amount</th>
                    <th className={`${TH} w-44`}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {previewLines.map((l, i) => (
                    <tr key={i}>
                      <td className={`${TD} text-center font-semibold`}>
                        {i + 1}
                      </td>
                      <td className={TD}>
                        <div className="text-foreground">
                          {l.material_description}
                        </div>
                        {l.ipc_code && (
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {l.ipc_code}
                          </div>
                        )}
                      </td>
                      <td className={`${TD} text-right`}>{l.qty}</td>
                      <td className={`${TD} text-center`}>{l.unit}</td>
                      <td className={TD}>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={rates[i] ?? ""}
                          placeholder="—"
                          onChange={(e) =>
                            setRates((p) => ({ ...p, [i]: e.target.value }))
                          }
                          className={`${INPUT} text-right`}
                        />
                      </td>
                      <td className={`${TD} text-right font-medium`}>
                        {money(num(rates[i]) * num(l.qty))}
                      </td>
                      <td className={TD}>
                        <input
                          type="text"
                          value={lineRemarks[i] ?? ""}
                          onChange={(e) =>
                            setLineRemarks((p) => ({
                              ...p,
                              [i]: e.target.value,
                            }))
                          }
                          className={INPUT}
                          placeholder="Remark"
                        />
                      </td>
                    </tr>
                  ))}
                  {previewLines.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className={`${TD} py-6 text-center text-muted-foreground`}
                      >
                        No lines.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-primary/10">
                    <td colSpan={2} className={`${TD} text-right font-bold`}>
                      TOTAL
                    </td>
                    <td className={`${TD} text-right font-bold`}>{totalQty}</td>
                    <td colSpan={2} className={TD} />
                    <td
                      className={`${TD} text-right text-base font-bold text-primary`}
                    >
                      ₹ {money(totalAmount)}
                    </td>
                    <td className={TD} />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer blocks */}
            <div className="grid grid-cols-1 border-t border-[#e2e3e8] lg:grid-cols-2">
              <div className="space-y-3 border-b border-[#e2e3e8] p-5 lg:border-b-0 lg:border-r">
                <Field label="Wastage Tolerance">
                  <input
                    className={INPUT}
                    value={wastageTolerance}
                    onChange={(e) => setWastageTolerance(e.target.value)}
                    placeholder="e.g. 2%"
                  />
                </Field>
                <Field label="Terms & Conditions">
                  <textarea
                    className={`${INPUT} min-h-20 resize-y`}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </Field>
                <Field label="Remarks">
                  <input
                    className={INPUT}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Order remarks"
                  />
                </Field>
              </div>

              <div className="space-y-3 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Raised By — Name">
                    <input
                      className={INPUT}
                      value={raisedByName}
                      onChange={(e) => setRaisedByName(e.target.value)}
                      placeholder="Name"
                    />
                  </Field>
                  <Field label="Raised By — Username">
                    <input
                      className={INPUT}
                      value={raisedByUsername}
                      onChange={(e) => setRaisedByUsername(e.target.value)}
                      placeholder="Username"
                    />
                  </Field>
                </div>
                <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-4">
                  <div className="text-sm font-bold text-primary">
                    FOR {COMPANY.name}
                  </div>
                  <div className="mt-10 border-t border-[#e2e3e8] pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#e2e3e8] px-6 py-4">
          <button type="button" className={OUTLINE_BTN} onClick={onClose}>
            Back to Sheet
          </button>
          <button type="button" className={OUTLINE_BTN} onClick={handlePrint}>
            Print
          </button>
          <button
            type="button"
            className={OUTLINE_BTN}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={handleIssue}
            disabled={
              busy || (errors && errors.length > 0) || previewLines.length === 0
            }
          >
            {busy ? "Issuing…" : "Issue VPO"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VpoPreviewModal;
