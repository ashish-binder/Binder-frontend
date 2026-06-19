import { useEffect, useMemo, useState } from "react";
import {
  getIPOs,
  getFactoryCodes,
  createStockSheet,
} from "../services/integration";
import "./InwardStoreSheet.css";
import "./StockSheet.css";

const IPO_TYPE_OPTIONS = [
  { value: "PRODUCTION", label: "Production" },
  { value: "SAMPLING", label: "Sampling" },
  { value: "COMPANY", label: "Company" },
  { value: "COMPANY_ESSENTIALS", label: "Company Essentials" },
];

const CATEGORY_OPTIONS = [
  { value: "YARN", label: "Yarn" },
  { value: "FABRIC", label: "Fabric" },
  { value: "FIBER", label: "Fiber" },
  { value: "FOAM", label: "Foam" },
  { value: "TRIMS_ACCESSORY", label: "Trims & Accessory" },
  { value: "ARTWORK_LABELLING", label: "Artwork & Labelling" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "COMPANY_ESSENTIALS", label: "Company Essentials" },
];

const YARN_SUB_OPTIONS = [
  { value: "STITCHING_THREAD", label: "Stitching Thread" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

const ipoTypeToOrderType = {
  PRODUCTION: "PD",
  SAMPLING: "SAM",
  COMPANY: "SELF",
  COMPANY_ESSENTIALS: "SELF",
};

const StockSheet = ({ onBack, onSaved }) => {
  // Form state
  const [source, setSource] = useState("FROM_IPO");
  const [ipoType, setIpoType] = useState("");
  const [selectedIpo, setSelectedIpo] = useState("");
  const [selectedIpc, setSelectedIpc] = useState("");
  const [category, setCategory] = useState("");
  const [yarnSubCategory, setYarnSubCategory] = useState("");
  const isFromIpo = source === "FROM_IPO";

  // Item rows (Sr.No., material_description, unit, image, details)
  const [itemRows, setItemRows] = useState([]);
  const [itemColumns, setItemColumns] = useState([]);

  // Packages
  const [numPackagesInput, setNumPackagesInput] = useState("");
  const [packageRows, setPackageRows] = useState([]);

  // Rate / Amount
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");

  // Lookup data
  const [ipoList, setIpoList] = useState([]);
  const [ipcList, setIpcList] = useState([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ---- Effects: load IPOs based on IPO type ----
  useEffect(() => {
    if (!isFromIpo || !ipoType) {
      setIpoList([]);
      return;
    }
    const orderType = ipoTypeToOrderType[ipoType];
    (async () => {
      try {
        const data = await getIPOs({ order_type: orderType });
        const results = data?.results || data || [];
        setIpoList(
          Array.isArray(results)
            ? results.filter((ipo) => ipo.order_type === orderType)
            : [],
        );
      } catch {
        setIpoList([]);
      }
    })();
  }, [ipoType, isFromIpo]);

  // ---- Effects: load IPC (factory codes) for selected IPO ----
  useEffect(() => {
    if (!isFromIpo || !selectedIpo) {
      setIpcList([]);
      setSelectedIpc("");
      return;
    }
    (async () => {
      try {
        const data = await getFactoryCodes({ ipo: selectedIpo });
        const results = data?.results || data || [];
        // Dedupe by displayed code so the dropdown doesn't show repeats.
        const seen = new Set();
        const unique = [];
        for (const fc of Array.isArray(results) ? results : []) {
          const label = fc.ipc_code || fc.code || "";
          if (label && seen.has(label)) continue;
          seen.add(label);
          unique.push(fc);
        }
        setIpcList(unique);
      } catch {
        setIpcList([]);
      }
    })();
  }, [selectedIpo, isFromIpo]);

  // ---- Items loader is intentionally disabled (work in progress) ----
  // The backend material-items endpoint is being reworked; until it lands,
  // we keep the section empty and surface a "Work in progress" placeholder
  // instead of fetching and rendering anything.
  useEffect(() => {
    setItemRows([]);
    setItemColumns([]);
  }, [category, selectedIpc, yarnSubCategory, ipcList]);

  // ---- Effect: rebuild package rows when num_packages changes ----
  useEffect(() => {
    const n = parseInt(numPackagesInput, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setPackageRows([]);
      return;
    }
    setPackageRows((prev) => {
      const next = [];
      for (let i = 0; i < n; i++) {
        next.push(prev[i] || { package_no: i + 1, qty: "", unit: "" });
      }
      return next;
    });
  }, [numPackagesInput]);

  // ---- Derived values ----
  const showUnitColumn = useMemo(() => {
    return itemRows.some((row) => row.unit && row.unit.toUpperCase() !== "PCS");
  }, [itemRows]);

  const totalQty = useMemo(() => {
    return packageRows.reduce(
      (sum, pkg) => sum + (parseFloat(pkg.qty) || 0),
      0,
    );
  }, [packageRows]);

  // ---- Handlers ----
  const updatePackage = (idx, field, value) => {
    setPackageRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSourceChange = (nextSource) => {
    if (nextSource === source) return;
    setSource(nextSource);
    setIpoType("");
    setSelectedIpo("");
    setSelectedIpc("");
    setIpoList([]);
    setIpcList([]);
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (isFromIpo && !ipoType) {
      setErrorMsg("Please select IPO Type.");
      return;
    }
    if (!category) {
      setErrorMsg("Please select Category.");
      return;
    }
    if (category === "YARN" && !yarnSubCategory) {
      setErrorMsg("Please select the Yarn sub-category.");
      return;
    }
    if (isFromIpo && category !== "COMPANY_ESSENTIALS" && !selectedIpc) {
      setErrorMsg("Please select an IPC Code.");
      return;
    }

    const ipcDisplay = (() => {
      if (!isFromIpo) return "";
      const found = ipcList.find((c) => c.id === selectedIpc);
      return found ? found.ipc_code || found.code || "" : "";
    })();

    const payload = {
      source,
      ipo_type: isFromIpo ? ipoType : null,
      ipo: isFromIpo ? selectedIpo || null : null,
      ipc: isFromIpo ? selectedIpc || null : null,
      ipc_code_text: isFromIpo ? ipcDisplay : "",
      category,
      yarn_sub_category: category === "YARN" ? yarnSubCategory : "",
      num_packages: parseInt(numPackagesInput, 10) || 0,
      total_qty: totalQty,
      rate: parseFloat(rate) || 0,
      amount: parseFloat(amount) || 0,
      item_columns: itemColumns,
      items: itemRows.map((r, i) => ({
        sr_no: r.sr_no || i + 1,
        material_description: r.material_description || "",
        unit: r.unit || "",
        details: r.details || {},
        image: r.image || null,
      })),
      packages: packageRows.map((p, i) => ({
        package_no: p.package_no || i + 1,
        qty: parseFloat(p.qty) || 0,
        unit: p.unit || "",
      })),
    };

    setSaving(true);
    try {
      const res = await createStockSheet(payload);
      if (res?.status === "success" || res?.id) {
        setSuccessMsg("Stock Sheet saved successfully.");
        if (onSaved) onSaved(res?.data || res);
      } else {
        setErrorMsg(res?.message || JSON.stringify(res) || "Failed to save.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="iss-container">
      <div className="iss-header">
        <button className="iss-back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="iss-title">Add Stock Items</h1>
        <p className="iss-description">
          {isFromIpo
            ? "Create a Stock Sheet entry from an existing IPO."
            : "Create a Stock Sheet entry manually without linking an IPO."}
        </p>
      </div>

      {successMsg && <div className="iss-success">{successMsg}</div>}
      {errorMsg && <div className="iss-error">{errorMsg}</div>}

      <div className="iss-form">
        {/* Source */}
        <div className="ss-source-row">
          <button
            type="button"
            className={`ss-source-pill ${isFromIpo ? "active" : ""}`}
            onClick={() => handleSourceChange("FROM_IPO")}
          >
            From IPO
          </button>
          <button
            type="button"
            className={`ss-source-pill ${!isFromIpo ? "active" : ""}`}
            onClick={() => handleSourceChange("ADD_NEW")}
          >
            Add New
          </button>
        </div>

        {/* Top dropdowns */}
        <div className="iss-form-grid">
          {isFromIpo && (
            <>
              <div className="iss-form-group">
                <label className="iss-form-label">
                  IPO Type <span className="iss-required">*</span>
                </label>
                <select
                  className="iss-form-select"
                  value={ipoType}
                  onChange={(e) => {
                    setIpoType(e.target.value);
                    setSelectedIpo("");
                    setSelectedIpc("");
                  }}
                >
                  <option value="">-- Select --</option>
                  {IPO_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="iss-form-group">
                <label className="iss-form-label">Select IPO</label>
                <select
                  className="iss-form-select"
                  value={selectedIpo}
                  onChange={(e) => setSelectedIpo(e.target.value)}
                  disabled={!ipoType}
                >
                  <option value="">-- Select IPO --</option>
                  {ipoList.map((ipo) => (
                    <option key={ipo.id} value={ipo.id}>
                      {ipo.ipo_code}{" "}
                      {ipo.program_name ? `— ${ipo.program_name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="iss-form-group">
                <label className="iss-form-label">IPC Code</label>
                <select
                  className="iss-form-select"
                  value={selectedIpc}
                  onChange={(e) => setSelectedIpc(e.target.value)}
                  disabled={!selectedIpo}
                >
                  <option value="">-- Select IPC --</option>
                  {ipcList.map((ipc) => (
                    <option key={ipc.id} value={ipc.id}>
                      {ipc.ipc_code || ipc.code}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="iss-form-group">
            <label className="iss-form-label">
              Select Category <span className="iss-required">*</span>
            </label>
            <select
              className="iss-form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setYarnSubCategory("");
              }}
            >
              <option value="">-- Select --</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {category === "YARN" && (
            <div className="iss-form-group">
              <label className="iss-form-label">
                Yarn Sub-Category <span className="iss-required">*</span>
              </label>
              <select
                className="iss-form-select"
                value={yarnSubCategory}
                onChange={(e) => setYarnSubCategory(e.target.value)}
              >
                <option value="">-- Select --</option>
                {YARN_SUB_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Material Items Table — disabled while the items endpoint is being reworked. */}
        <div className="ss-section">
          <h3 className="ss-section-title">Items</h3>
          <p className="ss-muted">
            Work in progress — items will load here once available.
          </p>
        </div>

        {/* # of Packages */}
        <div className="ss-section">
          <div className="iss-form-group" style={{ maxWidth: 280 }}>
            <label className="iss-form-label"># of Packages</label>
            <input
              className="iss-form-input"
              type="number"
              min="0"
              value={numPackagesInput}
              onChange={(e) => setNumPackagesInput(e.target.value)}
              placeholder="Enter number of packages"
            />
          </div>

          {packageRows.length > 0 && (
            <div className="ss-table-wrap" style={{ marginTop: 16 }}>
              <table className="ss-table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Package #</th>
                    <th>QTY</th>
                    {showUnitColumn && <th style={{ width: 140 }}>Unit</th>}
                  </tr>
                </thead>
                <tbody>
                  {packageRows.map((pkg, idx) => (
                    <tr key={idx}>
                      <td>{pkg.package_no}</td>
                      <td>
                        <input
                          className="iss-form-input"
                          type="number"
                          min="0"
                          step="any"
                          value={pkg.qty}
                          onChange={(e) =>
                            updatePackage(idx, "qty", e.target.value)
                          }
                        />
                      </td>
                      {showUnitColumn && (
                        <td>
                          <input
                            className="iss-form-input"
                            type="text"
                            value={pkg.unit}
                            onChange={(e) =>
                              updatePackage(idx, "unit", e.target.value)
                            }
                            placeholder="e.g. MTR"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="ss-total-row">
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>{totalQty.toFixed(3)}</strong>
                    </td>
                    {showUnitColumn && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rate / Amount */}
        <div className="iss-form-grid">
          <div className="iss-form-group">
            <label className="iss-form-label">Rate</label>
            <input
              className="iss-form-input"
              type="number"
              min="0"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="iss-form-group">
            <label className="iss-form-label">Amount</label>
            <input
              className="iss-form-input"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ss-actions">
          <button
            type="button"
            className="iss-btn iss-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Stock Sheet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSheet;
