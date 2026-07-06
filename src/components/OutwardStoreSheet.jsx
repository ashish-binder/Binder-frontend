import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  createOutwardStoreSheet,
  getCompanyEssentials,
  getIPOs,
  getOutwardStoreSheetChoices,
} from "../services/integration";
import ThemedSelect from "./StockSheet/ThemedSelect";

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
const TD = "border-b border-[#e2e3e8] px-2 py-1.5 align-top";
const TCTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-2.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

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
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
};

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createEmptyUsnLink = () => ({
  id: createId(),
  link_usn: "",
  usn_quantity: "",
});

const createEmptyRow = () => ({
  id: createId(),
  particulars: "",
  dispatch_quantity: "",
  unit: "CM",
  usn_links: [createEmptyUsnLink()],
  remark: "",
  dispatch_form: "",
  num_packages: "",
  uqr_sent: false,
});

const IPO_TYPE_TO_ORDER_TYPE = {
  PRODUCTION: "PD",
  SAMPLING: "SAM",
  COMPANY: "SELF",
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatQuantity = (value) => {
  const numeric = Number.isFinite(value) ? value : toNumber(value);
  return numeric
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
};

const getCarryCode = (index) => {
  let current = index + 1;
  let letters = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    letters = `${String.fromCharCode(65 + remainder)}${letters}`;
    current = Math.floor((current - 1) / 26);
  }

  return `-${letters}`;
};

const normalizeCarryCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "");

const getUsnQuantitySum = (row) =>
  row.usn_links.reduce((sum, link) => sum + toNumber(link.usn_quantity), 0);

const getBalance = (row) =>
  toNumber(row.dispatch_quantity) - getUsnQuantitySum(row);

const ensureNegativeBalanceLinkRow = (row) => {
  if (getBalance(row) < 0 && row.usn_links.length === 1) {
    return {
      ...row,
      usn_links: [...row.usn_links, createEmptyUsnLink()],
    };
  }
  return row;
};

const OutwardStoreSheet = ({ onBack }) => {
  const [dispatchType, setDispatchType] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [dispatchIssuedToAddress, setDispatchIssuedToAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [ipoType, setIpoType] = useState("");
  const [selectedIpo, setSelectedIpo] = useState("");
  const [selectedCompanyEssential, setSelectedCompanyEssential] = useState("");
  const [dispatchedGoodsConditionImage, setDispatchedGoodsConditionImage] =
    useState(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleNoImage, setVehicleNoImage] = useState(null);
  const [companyChallanNumber, setCompanyChallanNumber] = useState("");
  const [companyChallanImage, setCompanyChallanImage] = useState(null);
  const [rows, setRows] = useState([createEmptyRow()]);

  const [choices, setChoices] = useState({
    dispatch_types: [],
    ipo_types: [],
    departments: [],
    vendors: [],
    item_units: ["CM"],
  });
  const [ipoOptions, setIpoOptions] = useState([]);
  const [companyEssentialOptions, setCompanyEssentialOptions] = useState([]);
  const [loadingChoices, setLoadingChoices] = useState(true);
  const [loadingIpoOptions, setLoadingIpoOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadChoices = async () => {
      setLoadingChoices(true);
      try {
        const data = await getOutwardStoreSheetChoices();
        if (!isMounted) return;
        setChoices({
          dispatch_types: data?.dispatch_types || [],
          ipo_types: data?.ipo_types || [],
          departments: data?.departments || [],
          vendors: data?.vendors || [],
          item_units: data?.item_units || ["CM"],
        });
      } catch {
        if (!isMounted) return;
        setChoices({
          dispatch_types: [],
          ipo_types: [],
          departments: [],
          vendors: [],
          item_units: ["CM"],
        });
      } finally {
        if (isMounted) setLoadingChoices(false);
      }
    };

    loadChoices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadIpoOptions = async () => {
      if (!ipoType) {
        setIpoOptions([]);
        setCompanyEssentialOptions([]);
        return;
      }

      setLoadingIpoOptions(true);
      try {
        if (ipoType === "COMPANY_ESSENTIALS") {
          const data = await getCompanyEssentials("", {});
          if (!isMounted) return;
          const results = data?.results || data || [];
          setCompanyEssentialOptions(Array.isArray(results) ? results : []);
          setIpoOptions([]);
        } else {
          const data = await getIPOs({
            order_type: IPO_TYPE_TO_ORDER_TYPE[ipoType],
          });
          if (!isMounted) return;
          const results = data?.results || data || [];
          const normalizedResults = Array.isArray(results) ? results : [];
          setIpoOptions(
            normalizedResults.filter(
              (option) => option.order_type === IPO_TYPE_TO_ORDER_TYPE[ipoType],
            ),
          );
          setCompanyEssentialOptions([]);
        }
      } catch {
        if (!isMounted) return;
        setIpoOptions([]);
        setCompanyEssentialOptions([]);
      } finally {
        if (isMounted) setLoadingIpoOptions(false);
      }
    };

    loadIpoOptions();

    return () => {
      isMounted = false;
    };
  }, [ipoType]);

  const activeDepartment = choices.departments.find(
    (department) => department.id === selectedDepartment,
  );
  const sectionOptions = activeDepartment?.sections || [];

  const getCarryReferences = (excludeRowId = null) => {
    const references = {};

    rows.forEach((row, index) => {
      if (row.id === excludeRowId) return;
      const balance = getBalance(row);
      if (balance > 0) {
        references[getCarryCode(index)] = balance;
      }
    });

    return references;
  };

  const updateRow = (rowId, updater) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return ensureNegativeBalanceLinkRow(updater(row));
      }),
    );
  };

  const handleRowChange = (rowId, field, value) => {
    updateRow(rowId, (row) => ({ ...row, [field]: value }));
  };

  const handleUsnLinkChange = (rowId, linkId, field, value) => {
    const carryReferences = getCarryReferences(rowId);

    updateRow(rowId, (row) => {
      const nextLinks = row.usn_links.map((link) => {
        if (link.id !== linkId) return link;

        const nextLink = { ...link, [field]: value };
        if (field === "link_usn") {
          const carryQuantity = carryReferences[normalizeCarryCode(value)];
          if (typeof carryQuantity === "number" && carryQuantity > 0) {
            nextLink.usn_quantity = formatQuantity(carryQuantity);
          }
        }
        return nextLink;
      });

      return { ...row, usn_links: nextLinks };
    });
  };

  const addUsnLinkRow = (rowId) => {
    updateRow(rowId, (row) => ({
      ...row,
      usn_links: [...row.usn_links, createEmptyUsnLink()],
    }));
  };

  const removeUsnLinkRow = (rowId, linkId) => {
    updateRow(rowId, (row) => ({
      ...row,
      usn_links:
        row.usn_links.length > 1
          ? row.usn_links.filter((link) => link.id !== linkId)
          : row.usn_links,
    }));
  };

  const addMainRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeMainRow = (rowId) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev,
    );
  };

  const handleDispatchTypeChange = (value) => {
    setDispatchType(value);
    setErrorMsg("");

    if (value === "INTERNAL_CHALLAN") {
      setSelectedVendor("");
    }

    if (value === "EXTERNAL_CHALLAN") {
      setUnitNumber("");
      setSelectedDepartment("");
      setSelectedSection("");
    }
  };

  const handleVendorChange = (vendorId) => {
    setSelectedVendor(vendorId);
    const vendor = choices.vendors.find((item) => item.id === vendorId);
    if (vendor) {
      setDispatchIssuedToAddress(vendor.address || "");
      setContactPerson(vendor.contact_person || "");
      setContactNumber(vendor.contact_number || "");
    } else {
      setDispatchIssuedToAddress("");
      setContactPerson("");
      setContactNumber("");
    }
  };

  const handleDepartmentChange = (departmentId) => {
    setSelectedDepartment(departmentId);
    const nextDepartment = choices.departments.find(
      (department) => department.id === departmentId,
    );
    if (
      !nextDepartment?.sections?.some(
        (section) => section.id === selectedSection,
      )
    ) {
      setSelectedSection("");
    }
  };

  const handleIpoTypeChange = (value) => {
    setIpoType(value);
    setSelectedIpo("");
    setSelectedCompanyEssential("");
  };

  const validateBeforeSave = (normalizedRows) => {
    if (!dispatchType) return "Please select Dispatch Type.";
    if (
      dispatchType === "INTERNAL_CHALLAN" &&
      (!unitNumber.trim() || !selectedDepartment || !selectedSection)
    ) {
      return "Please complete Unit #, Department, and Section for internal challan.";
    }
    if (dispatchType === "EXTERNAL_CHALLAN" && !selectedVendor) {
      return "Please select a Vendor Code for external challan.";
    }
    if (!ipoType) return "Please select IPO Type.";
    if (ipoType === "COMPANY_ESSENTIALS" && !selectedCompanyEssential) {
      return "Please select a Company Essential.";
    }
    if (ipoType !== "COMPANY_ESSENTIALS" && !selectedIpo) {
      return "Please select an IPO.";
    }
    if (normalizedRows.length === 0)
      return "Please add at least one outward row.";

    const incompleteRow = normalizedRows.find(
      (row) => !row.particulars.trim() || !toNumber(row.dispatch_quantity),
    );
    if (incompleteRow) {
      return "Each row needs Particulars and Dispatch Quantity.";
    }

    return "";
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const normalizedRows = rows
      .map((row) => ({
        ...row,
        usn_links: row.usn_links.filter(
          (link) => link.link_usn.trim() || toNumber(link.usn_quantity) > 0,
        ),
      }))
      .filter(
        (row) =>
          row.particulars.trim() ||
          String(row.dispatch_quantity).trim() ||
          row.usn_links.length > 0 ||
          row.remark.trim(),
      );

    const validationError = validateBeforeSave(normalizedRows);
    if (validationError) {
      setSaving(false);
      setErrorMsg(validationError);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("dispatch_type", dispatchType);
      payload.append("dispatch_issued_to_address", dispatchIssuedToAddress);
      payload.append("contact_person", contactPerson);
      payload.append("contact_number", contactNumber);
      payload.append("ipo_type", ipoType);
      payload.append("vehicle_no", vehicleNo);
      payload.append("company_challan_number", companyChallanNumber);

      if (dispatchType === "INTERNAL_CHALLAN") {
        payload.append("unit_number", unitNumber);
        payload.append("department", selectedDepartment);
        payload.append("section", selectedSection);
      }

      if (dispatchType === "EXTERNAL_CHALLAN") {
        payload.append("vendor_code", selectedVendor);
      }

      if (ipoType === "COMPANY_ESSENTIALS") {
        payload.append("company_essential", selectedCompanyEssential);
      } else {
        payload.append("ipo", selectedIpo);
      }

      if (dispatchedGoodsConditionImage) {
        payload.append(
          "dispatched_goods_condition_image",
          dispatchedGoodsConditionImage,
        );
      }
      if (vehicleNoImage) {
        payload.append("vehicle_no_image", vehicleNoImage);
      }
      if (companyChallanImage) {
        payload.append("company_challan_image", companyChallanImage);
      }

      payload.append(
        "items",
        JSON.stringify(
          normalizedRows.map((row) => ({
            particulars: row.particulars,
            dispatch_quantity: toNumber(row.dispatch_quantity),
            unit: row.unit || "CM",
            remark: row.remark,
            dispatch_form: row.dispatch_form,
            num_packages: Number.parseInt(row.num_packages, 10) || 0,
            uqr_sent: row.uqr_sent,
            usn_links: row.usn_links.map((link) => ({
              link_usn: link.link_usn,
              usn_quantity: toNumber(link.usn_quantity),
            })),
          })),
        ),
      );

      const result = await createOutwardStoreSheet(payload);
      if (result?.status === "success") {
        setSuccessMsg("Outward Store Logs saved successfully.");
      } else {
        setErrorMsg(
          result?.message ||
            JSON.stringify(result) ||
            "Failed to save outward store logs...",
        );
      }
    } catch (error) {
      setErrorMsg(
        error.message || "An error occurred while saving outward store logs.",
      );
    } finally {
      setSaving(false);
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
            Outward Store Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record dispatch challans, outward movements, and linked USN
            quantities
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

        {/* Dispatch information */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Dispatch Information</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
            {/* Row 1 — Dispatch Type | IPO Type */}
            <div>
              <label className={LABEL}>
                Dispatch Type <span className="text-primary">*</span>
              </label>
              <ThemedSelect
                value={dispatchType}
                onChange={handleDispatchTypeChange}
                isDisabled={loadingChoices}
                options={choices.dispatch_types}
                placeholder="-- Select --"
              />
            </div>

            <div>
              <label className={LABEL}>
                IPO Type <span className="text-primary">*</span>
              </label>
              <ThemedSelect
                value={ipoType}
                onChange={handleIpoTypeChange}
                isDisabled={loadingChoices}
                options={choices.ipo_types}
                placeholder="-- Select --"
              />
            </div>

            {/* Row 2 — Dispatch / Issued To | Address */}
            <div>
              <label className={LABEL}>
                Dispatch / Issued To <span className="text-primary">*</span>
              </label>

              {dispatchType === "INTERNAL_CHALLAN" && (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    className={CTRL}
                    type="text"
                    value={unitNumber}
                    onChange={(event) => setUnitNumber(event.target.value)}
                    placeholder="Unit #"
                  />
                  <ThemedSelect
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    placeholder="-- Department --"
                    options={choices.departments.map((department) => ({
                      value: department.id,
                      label: department.name,
                    }))}
                  />
                  <ThemedSelect
                    value={selectedSection}
                    onChange={setSelectedSection}
                    isDisabled={!selectedDepartment}
                    placeholder="-- Section --"
                    options={sectionOptions.map((section) => ({
                      value: section.id,
                      label: section.name,
                    }))}
                  />
                </div>
              )}

              {dispatchType === "EXTERNAL_CHALLAN" && (
                <ThemedSelect
                  value={selectedVendor}
                  onChange={handleVendorChange}
                  placeholder="-- Vendor Code --"
                  options={choices.vendors.map((vendor) => ({
                    value: vendor.id,
                    label: `${vendor.code} - ${vendor.vendor_name}`,
                  }))}
                />
              )}

              {!dispatchType && (
                <div className="rounded-md border border-dashed border-[#d5d6dc] bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Select a dispatch type to choose internal unit details or an
                  external vendor code.
                </div>
              )}
            </div>

            <div>
              <label className={LABEL}>Dispatch / Issued To Address</label>
              <textarea
                className={`${CTRL} min-h-20 resize-y`}
                value={dispatchIssuedToAddress}
                onChange={(event) =>
                  setDispatchIssuedToAddress(event.target.value)
                }
                placeholder="Enter address"
              />
            </div>

            {/* Row 3 — Contact Person | Contact Number */}
            <div>
              <label className={LABEL}>Contact Person</label>
              <input
                className={CTRL}
                type="text"
                value={contactPerson}
                onChange={(event) => setContactPerson(event.target.value)}
                placeholder="Enter contact person"
              />
            </div>

            <div>
              <label className={LABEL}>Contact Number</label>
              <input
                className={CTRL}
                type="tel"
                inputMode="numeric"
                value={contactNumber}
                onChange={(event) =>
                  setContactNumber(event.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Enter contact number"
              />
            </div>

            {/* Row 4 — IPO / Company Essential (half width) */}
            <div>
              <label className={LABEL}>
                {ipoType === "COMPANY_ESSENTIALS" ? "Company Essential" : "IPO"}{" "}
                <span className="text-primary">*</span>
              </label>
              {ipoType === "COMPANY_ESSENTIALS" ? (
                <ThemedSelect
                  value={selectedCompanyEssential}
                  onChange={setSelectedCompanyEssential}
                  isDisabled={!ipoType || loadingIpoOptions}
                  placeholder="-- Select Company Essential --"
                  options={companyEssentialOptions.map((option) => ({
                    value: option.id,
                    label: `${option.code}${option.item ? ` - ${option.item}` : ""}`,
                  }))}
                />
              ) : (
                <ThemedSelect
                  value={selectedIpo}
                  onChange={setSelectedIpo}
                  isDisabled={!ipoType || loadingIpoOptions}
                  placeholder="-- Select IPO --"
                  options={ipoOptions.map((option) => ({
                    value: option.id,
                    label: `${option.ipo_code} - ${option.program_name}`,
                  }))}
                />
              )}
            </div>
          </div>
        </div>

        {/* Dispatch details (images) */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Dispatch Details</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 md:items-start">
            <div>
              <label className={LABEL}>Dispatched Goods Condition</label>
              <ImageUpload
                id="oss-dispatched-goods-image"
                value={dispatchedGoodsConditionImage}
                onChange={setDispatchedGoodsConditionImage}
              />
            </div>

            <div>
              <label className={LABEL}>Vehicle No.</label>
              <input
                className={CTRL}
                type="text"
                value={vehicleNo}
                onChange={(event) => setVehicleNo(event.target.value)}
                placeholder="Enter vehicle number"
              />
              <div className="mt-2">
                <ImageUpload
                  id="oss-vehicle-no-image"
                  value={vehicleNoImage}
                  onChange={setVehicleNoImage}
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Company Challan Number</label>
              <input
                className={CTRL}
                type="text"
                value={companyChallanNumber}
                onChange={(event) => setCompanyChallanNumber(event.target.value)}
                placeholder="Enter company challan number"
              />
              <div className="mt-2">
                <ImageUpload
                  id="oss-company-challan-image"
                  value={companyChallanImage}
                  onChange={setCompanyChallanImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className={CARD}>
          <h3 className={SECTION_TITLE}>Items</h3>
          <div className="overflow-x-auto rounded-lg border border-[#e2e3e8]">
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "4%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className={`${TH} text-center`}>Sr</th>
                  <th className={TH}>Particulars</th>
                  <th className={TH}>Dispatch Qty</th>
                  <th className={TH}>Unit</th>
                  <th className={TH}>Link USN</th>
                  <th className={TH}>USN Quantity</th>
                  <th className={TH}>Remark</th>
                  <th className={TH}>Dispatch Form</th>
                  <th className={TH}># of Package</th>
                  <th className={TH}>UQR</th>
                  <th className={TH}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => {
                  const usnQuantitySum = getUsnQuantitySum(row);
                  const balance = getBalance(row);
                  const carryCode = getCarryCode(rowIndex);
                  const showCarryForward = balance > 0;

                  return (
                    <tr key={row.id} className="transition-colors hover:bg-muted/40">
                      <td className={`${TD} text-center font-semibold`}>
                        {rowIndex + 1}
                      </td>
                      <td className={TD}>
                        <input
                          className={TCTRL}
                          type="text"
                          value={row.particulars}
                          onChange={(event) =>
                            handleRowChange(
                              row.id,
                              "particulars",
                              event.target.value,
                            )
                          }
                          placeholder="Particulars"
                        />
                      </td>
                      <td className={TD}>
                        <input
                          className={`${TCTRL} ${NO_SPIN}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.dispatch_quantity}
                          onChange={(event) =>
                            handleRowChange(
                              row.id,
                              "dispatch_quantity",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td className={TD}>
                        <input
                          className={TCTRL}
                          type="text"
                          value={row.unit}
                          onChange={(event) =>
                            handleRowChange(
                              row.id,
                              "unit",
                              event.target.value.toUpperCase(),
                            )
                          }
                          placeholder={choices.item_units[0] || "CM"}
                        />
                      </td>
                      <td className={TD}>
                        <div className="flex flex-col gap-1.5">
                          {row.usn_links.map((link, linkIndex) => (
                            <div key={link.id} className="flex items-center gap-1">
                              <input
                                className={TCTRL}
                                type="text"
                                value={link.link_usn}
                                onChange={(event) =>
                                  handleUsnLinkChange(
                                    row.id,
                                    link.id,
                                    "link_usn",
                                    event.target.value,
                                  )
                                }
                                placeholder={
                                  linkIndex === 0
                                    ? "Link USN"
                                    : "Extra Link USN"
                                }
                              />
                              {row.usn_links.length > 1 && (
                                <button
                                  type="button"
                                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-lg leading-none text-destructive transition-colors hover:bg-destructive/10"
                                  onClick={() => removeUsnLinkRow(row.id, link.id)}
                                  title="Remove USN link"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          {(balance < 0 || row.usn_links.length > 1) && (
                            <button
                              type="button"
                              className="inline-flex w-fit cursor-pointer items-center gap-1 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                              onClick={() => addUsnLinkRow(row.id)}
                            >
                              + Add USN Row
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="flex flex-col gap-1.5">
                          {row.usn_links.map((link, linkIndex) => (
                            <input
                              key={link.id}
                              className={`${TCTRL} ${NO_SPIN}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={link.usn_quantity}
                              onChange={(event) =>
                                handleUsnLinkChange(
                                  row.id,
                                  link.id,
                                  "usn_quantity",
                                  event.target.value,
                                )
                              }
                              placeholder={
                                linkIndex === 0 ? "USN Qty" : "Extra Qty"
                              }
                            />
                          ))}
                          <div className="flex flex-col gap-1 pt-0.5 text-[10px] text-muted-foreground">
                            <span>Sum: {formatQuantity(usnQuantitySum)}</span>
                            <span>Balance: {formatQuantity(balance)}</span>
                            {showCarryForward && (
                              <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                                {carryCode} {formatQuantity(balance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={TD}>
                        <input
                          className={TCTRL}
                          type="text"
                          value={row.remark}
                          onChange={(event) =>
                            handleRowChange(row.id, "remark", event.target.value)
                          }
                          placeholder="Remark"
                        />
                      </td>
                      <td className={TD}>
                        <input
                          className={TCTRL}
                          type="text"
                          value={row.dispatch_form}
                          onChange={(event) =>
                            handleRowChange(
                              row.id,
                              "dispatch_form",
                              event.target.value,
                            )
                          }
                          placeholder="Dispatch Form"
                        />
                      </td>
                      <td className={TD}>
                        <input
                          className={`${TCTRL} ${NO_SPIN}`}
                          type="number"
                          min="0"
                          value={row.num_packages}
                          onChange={(event) =>
                            handleRowChange(
                              row.id,
                              "num_packages",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                      <td className={TD}>
                        <label
                          className="flex cursor-pointer items-center gap-2"
                          title="Sent to verification"
                        >
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                            checked={row.uqr_sent}
                            onChange={(event) =>
                              handleRowChange(
                                row.id,
                                "uqr_sent",
                                event.target.checked,
                              )
                            }
                          />
                          <span className="text-[9px] font-semibold leading-tight text-primary">
                            SENT TO VERIFICATION
                          </span>
                        </label>
                      </td>
                      <td className={`${TD} text-center`}>
                        <button
                          type="button"
                          className="cursor-pointer rounded p-1 text-lg leading-none text-destructive transition-colors hover:bg-destructive/10"
                          onClick={() => removeMainRow(row.id)}
                          title="Remove row"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addMainRow}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            + Add Row
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="cursor-pointer rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || loadingChoices}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutwardStoreSheet;
