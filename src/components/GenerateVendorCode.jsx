import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { scrollToFirstError } from "@/utils/scrollToFirstError";
import { createVendorCode, updateVendorCode } from "../services/integration";

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const CARD = "rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6";
const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const SECTION_TITLE =
  "text-[11px] font-semibold uppercase tracking-wider text-foreground/60";
const CTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const CTRL_ERR =
  "border-destructive focus:border-destructive focus:ring-destructive/20";
const BACK_BTN =
  "mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg";
const PRIMARY_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

// react-select (multi) themed to match ThemedSelect / the flat StockSheet look.
const multiSelectClassNames = {
  control: ({ isFocused, isDisabled }) =>
    [
      "min-h-[46px] w-full rounded-md border px-2 text-sm transition-colors",
      isDisabled
        ? "cursor-not-allowed bg-muted opacity-60 border-[#e2e3e8]"
        : isFocused
          ? "cursor-text border-primary ring-2 ring-primary/15 bg-white"
          : "cursor-pointer border-[#e2e3e8] hover:border-[#c9cad2] bg-white",
    ].join(" "),
  valueContainer: () => "gap-1 px-1 py-1 flex-wrap",
  placeholder: () => "text-muted-foreground",
  input: () => "text-foreground",
  multiValue: () =>
    "rounded-full bg-muted border border-[#e2e3e8] overflow-hidden",
  multiValueLabel: () => "px-2 py-0.5 text-xs font-medium text-foreground",
  multiValueRemove: () =>
    "px-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors",
  indicatorsContainer: () => "gap-1",
  dropdownIndicator: () =>
    "px-1 text-muted-foreground transition-colors hover:text-foreground",
  clearIndicator: () =>
    "px-1 text-muted-foreground transition-colors hover:text-foreground",
  indicatorSeparator: () => "hidden",
  menu: () =>
    "mt-1 overflow-hidden rounded-md border border-[#e2e3e8] bg-popover text-popover-foreground shadow-sm z-50",
  menuList: () => "max-h-60 p-1",
  option: ({ isFocused, isSelected }) =>
    [
      "cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors",
      isSelected
        ? "bg-primary text-primary-foreground"
        : isFocused
          ? "bg-accent text-accent-foreground"
          : "text-foreground",
    ].join(" "),
  noOptionsMessage: () => "px-3 py-2 text-sm text-muted-foreground",
};

const ThemedMultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select...",
  isDisabled = false,
  inputId,
}) => {
  const selected = (value || []).map((v) => ({ value: v, label: v }));
  const opts = options.map((o) => ({ value: o, label: o }));

  return (
    <Select
      inputId={inputId}
      isMulti
      unstyled
      isDisabled={isDisabled}
      placeholder={placeholder}
      options={opts}
      value={selected}
      onChange={(picked) => onChange((picked || []).map((p) => p.value))}
      menuPlacement="auto"
      closeMenuOnSelect={false}
      classNames={multiSelectClassNames}
    />
  );
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className={LABEL}>
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
    )}
  </div>
);

const JOB_WORK_CATEGORY_SUB_CATEGORY_MAP = {
  "Greige Yarn": [
    "Coarse Count UV 2Ne to 20Ne",
    "Fine Count UV 24Ne to 60Ne",
    "Linen Yarn",
    "Viscose Yarn",
    "Jute Yarn",
    "Polyester Yarn",
    "Wool Yarn",
    "Chenille Yarn",
    "Silk Yarn",
    "Pet Yarn",
    "Fancy Yarn",
    "Acrylic Yarn",
    "Slub yarn",
    "Roto Yarn",
    "Stitching Yarn",
    "Hemp Yarn",
    "Rafiya Yarn",
    "Others",
  ],
  "Recycled Yarn": [
    "Coarse Count 2Ne to 20Ne",
    "Fine Count 24Ne to 40Ne",
    "Non UV Natural",
    "Melange yarn",
    "Others",
  ],
  Fabric: [
    "Plain Fabric",
    "Recycled Fabric",
    "Designer Fabric",
    "Non Wooven",
    "Fancy Fabric",
    "Others",
  ],
  Dye: [
    "Natural Yarn",
    "Artifical Yarn",
    "Natural Fabric",
    "Artifical Fabric",
    "Cotton Bathmat",
    "Polyester Bathmat",
    "Stonewash",
    "Others",
  ],
  Knitting: ["Crochet", "Circular", "Flat Bed", "Others"],
  Quilting: [
    "Hand Quilting",
    "Single Needle",
    "Multi Needle",
    "Multi Needle+Embroidery",
    "Others",
  ],
  Embroidery: [
    "Rice Stitch",
    "Dori",
    "Single Thread",
    "Multi Thread",
    "Aari Embroidery",
    "Others",
  ],
  "Cut&Sew": [
    "Machine/Material Supplier",
    "Stitching Contractor",
    "Stitching Centre",
    "Complete Packaging Unit",
    "Others",
  ],
  "Artworks&Trims": [
    "Tyvek Labels",
    "Taffta Labels",
    "Woven Labels",
    "Embossing Labels",
    "Carton Marking",
    "Insert Cards",
    "Belly Bands",
    "Ribbon",
    "Others",
    "Zip",
  ],
  "Packaging Material": ["Cartons", "Tape", "Packaging Accessories", "Others"],
  "Factory Supplies": [
    "Admin Stationery",
    "Quality Accessories",
    "Sharp Tools",
    "Maintenance",
    "Others",
  ],
  Fiber: [
    "Conjugated",
    "Mix",
    "Virgin",
    "Only Bale",
    "Fiber Sheets",
    "Foam",
    "Others",
  ],
  Weaving: [
    "Pitloom",
    "Frameloom",
    "Powerloom",
    "Shuttleless",
    "Dobby",
    "Jacquard",
    "Jumbo Jacquard",
    "Airjet",
    "Others",
  ],
  Braided: ["Hand Braided", "Machine Braided", "Others"],
  Printing: [
    "Screen Print",
    "Lamination Polyester digital Print",
    "Rotary Print",
    "Block Print",
    "Cotton digital Print",
    "Others",
  ],
  "Job Card Service": [
    "Flocking",
    "Tassle Making",
    "Applique",
    "Lamination",
    "Gel Backing",
    "TPR",
    "Latex",
    "Niwar Backing",
    "Niwar",
    "Beads Work",
    "Others",
  ],
  Tufting: ["Table Tufting", "Multi Needle", "Computerised", "Others"],
  Carpet: ["Hand Tufting", "Broadloom", "Machine Made - Vandewiele", "Others"],
  Manpower: [
    "Marketing",
    "Sales",
    "Production Operations",
    "Quality Operations",
    "Research & Development",
    "Designing",
    "Accounts",
    "H.R",
    "Auditory Compliances",
    "Merchandising",
    "Security",
    "Trader",
    "Machine Manufacturing",
    "Management",
    "IT",
  ],
  Others: [],
};

const JOB_WORK_CATEGORIES = Object.keys(JOB_WORK_CATEGORY_SUB_CATEGORY_MAP);

const INITIAL_FORM_DATA = {
  vendorName: "",
  address: "",
  gst: "",
  bankName: "",
  accNo: "",
  ifscCode: "",
  jobWorkCategory: [],
  jobWorkSubCategory: [],
  contactPerson: "",
  whatsappNo: "",
  altWhatsappNo: "",
  email: "",
  paymentTerms: "",
};

const toMultiSelectArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const GenerateVendorCode = ({ onBack, initialData = null, onSaved }) => {
  const isEditMode = Boolean(initialData);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        vendorName: initialData.vendorName || initialData.vendor_name || "",
        address: initialData.address || initialData.vendor_address || "",
        gst:
          initialData.gst || initialData.gst_number || initialData.gstin || "",
        bankName:
          initialData.bankName ||
          initialData.bank_name ||
          initialData.bank ||
          "",
        accNo:
          initialData.accNo ||
          initialData.account_number ||
          initialData.acc_no ||
          initialData.account_no ||
          "",
        ifscCode:
          initialData.ifscCode ||
          initialData.ifsc_code ||
          initialData.ifsc ||
          "",
        jobWorkCategory: toMultiSelectArray(
          initialData.jobWorkCategory ||
            initialData.job_work_category ||
            initialData.job_work_categories,
        ),
        jobWorkSubCategory: toMultiSelectArray(
          initialData.jobWorkSubCategory ||
            initialData.job_work_sub_category ||
            initialData.job_work_sub_categories,
        ),
        contactPerson:
          initialData.contactPerson ||
          initialData.contact_person ||
          initialData.contact ||
          "",
        whatsappNo:
          initialData.whatsappNo ||
          initialData.whatsapp_number ||
          initialData.phone ||
          "",
        altWhatsappNo:
          initialData.altWhatsappNo ||
          initialData.alt_whatsapp_number ||
          initialData.alt_phone ||
          "",
        email: initialData.email || initialData.email_address || "",
        paymentTerms:
          initialData.paymentTerms ||
          initialData.payment_terms ||
          initialData.payment_term ||
          "",
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
    setGeneratedCode("");
    setIsGenerating(false);
  }, [initialData]);

  const availableJobWorkSubCategories = useMemo(() => {
    if (
      !Array.isArray(formData.jobWorkCategory) ||
      formData.jobWorkCategory.length === 0
    ) {
      return [];
    }

    const uniqueSubCategories = [];
    formData.jobWorkCategory.forEach((category) => {
      const mappedSubCategories =
        JOB_WORK_CATEGORY_SUB_CATEGORY_MAP[category] || [];
      mappedSubCategories.forEach((subCategory) => {
        if (!uniqueSubCategories.includes(subCategory)) {
          uniqueSubCategories.push(subCategory);
        }
      });
    });

    return uniqueSubCategories;
  }, [formData.jobWorkCategory]);

  useEffect(() => {
    if (
      !Array.isArray(formData.jobWorkSubCategory) ||
      formData.jobWorkSubCategory.length === 0
    ) {
      return;
    }

    const validSubCategories = formData.jobWorkSubCategory.filter(
      (subCategory) => availableJobWorkSubCategories.includes(subCategory),
    );

    if (validSubCategories.length !== formData.jobWorkSubCategory.length) {
      setFormData((prev) => ({
        ...prev,
        jobWorkSubCategory: validSubCategories,
      }));
    }
  }, [formData.jobWorkSubCategory, availableJobWorkSubCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "vendorName",
      "address",
      "gst",
      "bankName",
      "accNo",
      "ifscCode",
      "contactPerson",
      "whatsappNo",
      "email",
      "paymentTerms",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || !formData[field].toString().trim()) {
        newErrors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`;
      }
    });

    if (!formData.jobWorkCategory || formData.jobWorkCategory.length === 0) {
      newErrors.jobWorkCategory = "Job Work Category is required";
    }
    if (
      availableJobWorkSubCategories.length > 0 &&
      (!formData.jobWorkSubCategory || formData.jobWorkSubCategory.length === 0)
    ) {
      newErrors.jobWorkSubCategory = "Job Work Sub-Category is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.whatsappNo &&
      !/^\d{10}$/.test(formData.whatsappNo.replace(/\s+/g, ""))
    ) {
      newErrors.whatsappNo = "Please enter a valid 10-digit WhatsApp number";
    }

    if (
      formData.altWhatsappNo &&
      formData.altWhatsappNo.trim() &&
      !/^\d{10}$/.test(formData.altWhatsappNo.replace(/\s+/g, ""))
    ) {
      newErrors.altWhatsappNo = "Please enter a valid 10-digit WhatsApp number";
    }

    if (
      formData.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)
    ) {
      newErrors.ifscCode = "Please enter a valid IFSC code (e.g., SBIN0000123)";
    }

    if (
      formData.gst &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gst,
      )
    ) {
      newErrors.gst = "Please enter a valid GST number";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard against rapid double-clicks: setIsGenerating(true) is async, so the
    // button's disabled state may not apply before a second click fires.
    if (isGenerating) return;
    if (!validateForm()) return;

    setIsGenerating(true);

    try {
      const payload = {
        vendorName: formData.vendorName.trim(),
        address: formData.address.trim(),
        gst: formData.gst.trim().toUpperCase(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accNo.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        jobWorkCategory: Array.isArray(formData.jobWorkCategory)
          ? formData.jobWorkCategory.join(", ")
          : formData.jobWorkCategory,
        jobWorkSubCategory: Array.isArray(formData.jobWorkSubCategory)
          ? formData.jobWorkSubCategory.join(", ")
          : formData.jobWorkSubCategory,
        contactPerson: formData.contactPerson.trim(),
        whatsappNumber: formData.whatsappNo.trim(),
        altWhatsappNumber: formData.altWhatsappNo?.trim() || "",
        email: formData.email.trim(),
        paymentTerms: formData.paymentTerms.trim(),
      };

      if (isEditMode) {
        const identifier = initialData?.id || initialData?.code;
        if (!identifier) {
          throw new Error("Vendor identifier is missing");
        }

        const response = await updateVendorCode(identifier, {
          vendor_name: payload.vendorName,
          address: payload.address,
          gst: payload.gst,
          bank_name: payload.bankName,
          account_number: payload.accountNumber,
          ifsc_code: payload.ifscCode,
          job_work_category: payload.jobWorkCategory,
          job_work_sub_category: payload.jobWorkSubCategory,
          contact_person: payload.contactPerson,
          whatsapp_number: payload.whatsappNumber,
          alt_whatsapp_number: payload.altWhatsappNumber,
          email: payload.email,
          payment_terms: payload.paymentTerms,
        });

        const responseData =
          response?.data && typeof response.data === "object"
            ? response.data
            : response;
        const updatedVendorData = {
          id: responseData?.id || initialData?.id || initialData?.code || "",
          code:
            responseData?.code || initialData?.code || initialData?.id || "",
          ...formData,
          gst: payload.gst,
          ifscCode: payload.ifscCode,
          createdAt:
            responseData?.created_at ||
            responseData?.createdAt ||
            initialData?.createdAt ||
            new Date().toISOString(),
        };

        toast.success("Vendor updated successfully.");
        if (typeof onSaved === "function") {
          onSaved(updatedVendorData);
        } else {
          onBack?.();
        }
        return;
      }

      const response = await createVendorCode(payload);

      if (response.status === "success" && response.data) {
        setGeneratedCode(response.data.code);
        toast.success(`Vendor code generated successfully!`);
      } else {
        throw new Error(response.message || "Failed to create vendor code");
      }
    } catch (error) {
      console.error("Error creating vendor code:", error);
      toast.error(
        error?.message ||
          error?.data?.message ||
          "An error occurred while generating the vendor code.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setGeneratedCode("");
    setIsGenerating(false);
  };

  const shellStyle = {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    // The theme's --accent is a pinkish grey used for react-select's option hover;
    // recolor it to a neutral grey so hovered options match the other components.
    "--accent": "#edeef1",
  };

  // Success screen — only show the generated code.
  if (generatedCode && !isEditMode) {
    return (
      <div
        className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
        style={shellStyle}
      >
        <div className="mx-auto max-w-[95%] space-y-5">
          <div>
            <button type="button" onClick={onBack} className={BACK_BTN}>
              ← Back to Code Creation
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              Vendor Code Generated
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your unique vendor code is ready to use.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <div className={`${CARD} flex flex-col items-center text-center`}>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600">
                ✓
              </div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formData.vendorName || "Vendor"} Code
              </div>
              <div className="w-full rounded-lg border border-[#e2e3e8] bg-muted/40 px-6 py-5">
                <span className="font-mono text-4xl font-black tracking-[0.15em] text-primary">
                  {generatedCode}
                </span>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className={`${PRIMARY_BTN} mt-8`}
              >
                Generate Another Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={shellStyle}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        <div>
          <button type="button" onClick={onBack} className={BACK_BTN}>
            ← Back to Code Creation
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Vendor Code" : "Generate Vendor Code"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? `Update vendor details for code ${initialData?.code || initialData?.id || ""}`.trim()
              : "Fill in the vendor details to generate a unique vendor code."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={`${CARD} space-y-8`}
        >
          {/* VENDOR DETAILS */}
          <section className="space-y-4">
            <h2 className={SECTION_TITLE}>Vendor Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Vendor Name" required error={errors.vendorName}>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  aria-invalid={!!errors.vendorName}
                  className={`${CTRL} ${errors.vendorName ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="GST Number" required error={errors.gst}>
                <input
                  type="text"
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  aria-invalid={!!errors.gst}
                  className={`${CTRL} ${errors.gst ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="Address" required error={errors.address}>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete vendor address"
                  aria-invalid={!!errors.address}
                  className={`${CTRL} ${errors.address ? CTRL_ERR : ""}`}
                />
              </Field>
            </div>
          </section>

          {/* ACCOUNT DETAILS */}
          <section className="space-y-4">
            <h2 className={SECTION_TITLE}>Account Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Bank Name" required error={errors.bankName}>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  aria-invalid={!!errors.bankName}
                  className={`${CTRL} ${errors.bankName ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="Account Number" required error={errors.accNo}>
                <input
                  type="text"
                  name="accNo"
                  value={formData.accNo}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  aria-invalid={!!errors.accNo}
                  className={`${CTRL} ${errors.accNo ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="IFSC Code" required error={errors.ifscCode}>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="SBIN0000123"
                  maxLength={11}
                  aria-invalid={!!errors.ifscCode}
                  className={`${CTRL} ${errors.ifscCode ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="Payment Terms" required error={errors.paymentTerms}>
                <input
                  type="text"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  placeholder="Enter payment terms and conditions"
                  aria-invalid={!!errors.paymentTerms}
                  className={`${CTRL} ${errors.paymentTerms ? CTRL_ERR : ""}`}
                />
              </Field>
            </div>
          </section>

          {/* JOB WORK */}
          <section className="space-y-4">
            <h2 className={SECTION_TITLE}>Job Work</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Job Work Category"
                required
                error={errors.jobWorkCategory}
              >
                <ThemedMultiSelect
                  inputId="jobWorkCategory"
                  options={JOB_WORK_CATEGORIES}
                  value={formData.jobWorkCategory}
                  onChange={(values) =>
                    handleDropdownChange("jobWorkCategory", values)
                  }
                  placeholder="Select categories"
                />
              </Field>

              <Field
                label="Job Work Sub-Category"
                required={availableJobWorkSubCategories.length > 0}
                error={errors.jobWorkSubCategory}
              >
                <ThemedMultiSelect
                  inputId="jobWorkSubCategory"
                  options={availableJobWorkSubCategories}
                  value={formData.jobWorkSubCategory}
                  onChange={(values) =>
                    handleDropdownChange("jobWorkSubCategory", values)
                  }
                  isDisabled={availableJobWorkSubCategories.length === 0}
                  placeholder={
                    formData.jobWorkCategory.length === 0
                      ? "Select category first"
                      : availableJobWorkSubCategories.length === 0
                        ? "No sub-categories available"
                        : "Select sub-categories"
                  }
                />
              </Field>
            </div>
          </section>

          {/* CONTACT DETAILS */}
          <section className="space-y-4">
            <h2 className={SECTION_TITLE}>Contact Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Contact Person"
                required
                error={errors.contactPerson}
              >
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  aria-invalid={!!errors.contactPerson}
                  className={`${CTRL} ${errors.contactPerson ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  aria-invalid={!!errors.email}
                  className={`${CTRL} ${errors.email ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field label="WhatsApp Number" required error={errors.whatsappNo}>
                <input
                  type="tel"
                  name="whatsappNo"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength={10}
                  aria-invalid={!!errors.whatsappNo}
                  className={`${CTRL} ${errors.whatsappNo ? CTRL_ERR : ""}`}
                />
              </Field>

              <Field
                label="Alternative WhatsApp No."
                error={errors.altWhatsappNo}
              >
                <input
                  type="tel"
                  name="altWhatsappNo"
                  value={formData.altWhatsappNo}
                  onChange={handleInputChange}
                  placeholder="9876543210 (Optional)"
                  maxLength={10}
                  aria-invalid={!!errors.altWhatsappNo}
                  className={`${CTRL} ${errors.altWhatsappNo ? CTRL_ERR : ""}`}
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className={PRIMARY_BTN}
            >
              {isGenerating && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isGenerating
                ? isEditMode
                  ? "Updating Vendor..."
                  : "Generating Code..."
                : isEditMode
                  ? "Update Vendor"
                  : "Generate Vendor Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateVendorCode;
