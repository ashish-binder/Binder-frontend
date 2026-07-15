import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import ThemedSelect from "./IMS/StockSheet/ThemedSelect";
import {
  createCompanyEssential,
  markPublicEssentialTaken,
} from "../services/integration";
import { scrollToFirstError } from "@/utils/scrollToFirstError";

/* ------------------------------------------------------------------ *
 * Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
 * ------------------------------------------------------------------ */
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
const OUTLINE_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#e2e3e8] bg-white px-5 py-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-[#f5f5f5]";
const DANGER_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-destructive/30 bg-white px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40";

const NO_SPIN =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// Convert a plain string list into react-select { value, label } options.
const toOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

/* ------------------------------------------------------------------ *
 * Local UI primitives.
 * ------------------------------------------------------------------ */
const Field = ({ label, required, error, className = "", children }) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label className={LABEL}>
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
    )}
  </div>
);

// Truncate a filename to `max` chars, keeping the extension and adding an ellipsis.
const truncateName = (name, max = 20) => {
  if (!name || name.length <= max) return name || "";
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(1, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

// Themed image picker matching the other IMS screens.
const ImageUpload = ({ id, value, onChange, label = "Upload Image" }) => {
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
      {label}
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

const CompanyEssentials = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [commonDate, setCommonDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [forms, setForms] = useState([
    { id: 1, srNo: 1, data: getInitialFormData() },
  ]);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [previewPersonName, setPreviewPersonName] = useState("");
  const [previewPaymentMethod, setPreviewPaymentMethod] = useState("");
  const [previewErrors, setPreviewErrors] = useState({});
  const [errors, setErrors] = useState({}); // { [formId]: { [fieldName]: string } }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "STATIONARY",
    "PANTRY",
    "MACHINERY",
    "HOUSEKEEPING",
    "ELECTRICALS",
    "HARDWARE_CHEMICALS",
    "AUDIT_COMPLIANCE",
    "IT",
    "QC_TOOLS",
    "TRAVEL_EXPENSE",
    "REPAIR",
    "MAINTENANCE",
  ];

  const unitOptions = ["KGS", "LITRE", "METER", "PCS"];
  const forOptions = ["COMPANY", "COMPANY/GUEST", "GUEST"];
  const departmentOptions = [
    "BRAIDING",
    "CARPET",
    "CUTTING",
    "DYEING",
    "EMBROIDERY",
    "KNITTING",
    "PRINTING",
    "QUILTING",
    "SEWING",
    "TUFTING",
    "WEAVING",
  ];
  const paymentMethodOptions = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
  ];

  function getInitialFormData() {
    return {
      department: "",
      itemDescription: "",
      item: "",
      machineType: "",
      componentSpec: "",
      qty: "",
      amount: "",
      unit: "",
      forField: "",
      remarks: "",
      referenceImage: null,
    };
  }

  // Reset when category changes
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCommonDate(new Date().toISOString().split("T")[0]);
    setForms([{ id: 1, srNo: 1, data: getInitialFormData() }]);
    setErrors({});
    setPreviewPersonName("");
    setPreviewPaymentMethod("");
    setPreviewErrors({});
  };

  // Handle remove form
  const handleRemove = (formId) => {
    setForms((prevForms) => {
      const updated = prevForms.filter((form) => form.id !== formId);
      // Reassign SR NOs
      return updated.map((form, index) => ({ ...form, srNo: index + 1 }));
    });
  };

  // Handle field change for a specific form
  const handleChange = (formId, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === formId
          ? { ...form, data: { ...form.data, [field]: value } }
          : form,
      ),
    );
    // Clear field-level error as the user edits
    setErrors((prev) => {
      if (!prev[formId]?.[field]) return prev;
      const next = { ...prev, [formId]: { ...prev[formId], [field]: "" } };
      return next;
    });
  };

  // Handle Add More - add new form below
  const handleAddMore = () => {
    const nextSrNo = forms.length + 1;
    const newForm = {
      id: Date.now(),
      srNo: nextSrNo,
      data: getInitialFormData(),
    };
    setForms((prevForms) => [...prevForms, newForm]);
  };

  const validatePreviewFields = () => {
    const newPreviewErrors = {};

    if (!previewPersonName.trim()) {
      newPreviewErrors.personName = "Required";
    }

    if (!previewPaymentMethod) {
      newPreviewErrors.paymentMethod = "Required";
    }

    setPreviewErrors(newPreviewErrors);
    return Object.keys(newPreviewErrors).length === 0;
  };

  // Format a DRF error body into a single readable line.
  const formatApiError = (response) => {
    if (!response) return "No response from server";
    if (typeof response === "string") return response;
    if (response.detail) return String(response.detail);
    if (response.message && response.status !== "success")
      return String(response.message);
    if (response.error) return String(response.error);
    // DRF field errors: { field: ["msg", ...], ... }
    const fieldMsgs = Object.entries(response)
      .filter(([k]) => !["status", "message", "data"].includes(k))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
    if (fieldMsgs.length) return fieldMsgs.join(" | ");
    return JSON.stringify(response).slice(0, 300);
  };

  // Handle form submit for a specific form; returns created essential (with share_token).
  // Throws with a readable message when the API rejects the request.
  const submitForm = async (formId, previewMeta) => {
    const form = forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form not found");

    const response = await createCompanyEssential({
      category: selectedCategory,
      entry_date: commonDate,
      department: form.data.department || "",
      item_description:
        form.data.itemDescription ||
        form.data.item ||
        form.data.machineType ||
        "",
      item: form.data.item || "",
      machine_type: form.data.machineType || "",
      component_spec: form.data.componentSpec || "",
      quantity: form.data.qty ? parseInt(form.data.qty) : null,
      amount: form.data.amount ? parseFloat(form.data.amount) : null,
      unit: form.data.unit || "",
      for_field: form.data.forField || "",
      remarks: form.data.remarks || "",
      taken_by_name: previewMeta?.personName || "",
      payment_method: previewMeta?.paymentMethod || "",
    });

    const data = response?.data ?? response;
    const isSuccess =
      data && (response?.status === "success" || data.code || data.id);
    if (!isSuccess) {
      console.error("Save failed - server response:", response);
      throw new Error(formatApiError(response));
    }

    const shareToken = data.share_token || data.shareToken || "";
    if (shareToken && previewMeta?.personName) {
      try {
        await markPublicEssentialTaken(shareToken, {
          taken_by_name: previewMeta.personName,
          person_name: previewMeta.personName,
          payment_method: previewMeta.paymentMethod || undefined,
        });
      } catch (markError) {
        console.warn(
          "Failed to mark essential as taken during submit:",
          markError,
        );
      }
    }
    return data;
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateForms()) {
      toast.error("Please fill all required fields.");
      return;
    }
    setErrors({});
    setPreviewErrors({});
    setShowPreviewPopup(true);
  };

  const handleConfirmSubmit = async () => {
    if (isSubmitting) return;
    if (!validatePreviewFields()) {
      return;
    }

    const previewMeta = {
      personName: previewPersonName.trim(),
      paymentMethod: previewPaymentMethod,
    };

    setIsSubmitting(true);
    try {
      for (const form of forms) {
        await submitForm(form.id, previewMeta);
      }

      toast.success(
        forms.length > 1
          ? `${forms.length} entries saved successfully!`
          : "Entry saved successfully!",
      );
      setShowPreviewPopup(false);
      // Reset for the next batch under the same category.
      setForms([{ id: Date.now(), srNo: 1, data: getInitialFormData() }]);
      setPreviewPersonName("");
      setPreviewPaymentMethod("");
      setPreviewErrors({});
    } catch (error) {
      console.error("Error submitting forms:", error);
      toast.error(error?.message || "Failed to save entries.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardPreview = () => {
    setShowPreviewPopup(false);
    setForms([{ id: Date.now(), srNo: 1, data: getInitialFormData() }]);
    setErrors({});
    setPreviewPersonName("");
    setPreviewPaymentMethod("");
    setPreviewErrors({});
  };

  // Prevent Enter key from submitting the form when typing in input fields.
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  // Check if category needs DEPARTMENT instead of DATE
  const needsDepartment =
    selectedCategory === "MACHINERY" || selectedCategory === "QC TOOLS";

  // Check if category needs MACHINE TYPE and COMPONENT SPEC
  const needsMachineFields =
    selectedCategory === "MACHINERY" || selectedCategory === "QC TOOLS";

  // Check if category needs FOR field
  const needsForField =
    selectedCategory === "PANTRY" || selectedCategory === "TRAVEL EXPENSE";

  // Check if category needs AMOUNT instead of QTY
  const needsAmount = selectedCategory === "TRAVEL EXPENSE";

  // Check if category needs ITEM instead of ITEM DESCRIPTION
  const needsItem = selectedCategory === "PANTRY";

  // Check if category needs JOB WORK instead of ITEM DESCRIPTION
  const needsJobWork =
    selectedCategory === "REPAIR" || selectedCategory === "MAINTENANCE";

  // Validate all forms; set errors and return false if any form is invalid (blank required fields)
  const validateForms = () => {
    const newErrors = {};
    let valid = true;
    forms.forEach((form) => {
      const formErrors = {};
      if (needsDepartment && !form.data.department?.trim()) {
        formErrors.department = "Required";
        valid = false;
      }
      if (needsMachineFields) {
        if (!form.data.machineType?.trim()) {
          formErrors.machineType = "Required";
          valid = false;
        }
        if (!form.data.componentSpec?.trim()) {
          formErrors.componentSpec = "Required";
          valid = false;
        }
      } else {
        const descField = needsItem
          ? form.data.item
          : form.data.itemDescription;
        if (!descField?.trim()) {
          formErrors[needsItem ? "item" : "itemDescription"] = "Required";
          valid = false;
        }
      }
      if (selectedCategory !== "MACHINERY") {
        if (needsAmount) {
          if (form.data.amount === "" && form.data.amount !== 0) {
            formErrors.amount = "Required";
            valid = false;
          }
        } else {
          if (form.data.qty === "" && form.data.qty !== 0) {
            formErrors.qty = "Required";
            valid = false;
          }
        }
      }
      if (
        !needsAmount &&
        selectedCategory !== "MACHINERY" &&
        !form.data.unit?.trim()
      ) {
        formErrors.unit = "Required";
        valid = false;
      }
      if (Object.keys(formErrors).length > 0) {
        newErrors[form.id] = formErrors;
      }
    });
    setErrors(newErrors);
    if (!valid) {
      scrollToFirstError(newErrors);
    }
    return valid;
  };

  // Render a single sub-form card.
  const renderForm = (form) => {
    const formErrors = errors[form.id] || {};
    const descKey = needsItem ? "item" : "itemDescription";
    const descLabel = needsItem
      ? "ITEM"
      : needsJobWork
        ? "JOB WORK"
        : "ITEM DESCRIPTION";

    return (
      <div
        key={form.id}
        className="rounded-lg border border-[#e2e3e8] bg-[#fafafb] p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Entry #{form.srNo}
          </span>
          <button
            type="button"
            onClick={() => handleRemove(form.id)}
            disabled={forms.length === 1}
            className={DANGER_BTN}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="SR No.">
            <input
              type="number"
              value={form.srNo}
              readOnly
              className={`${CTRL} ${NO_SPIN} cursor-default bg-muted text-foreground/70`}
            />
          </Field>

          {/* Department (MACHINERY / QC TOOLS) */}
          {needsDepartment && (
            <Field label="Department" required error={formErrors.department}>
              <ThemedSelect
                value={form.data.department}
                onChange={(value) => handleChange(form.id, "department", value)}
                options={toOptions(departmentOptions)}
                placeholder="Select department"
              />
            </Field>
          )}

          {/* Item Description / Item / Job Work */}
          {!needsMachineFields && (
            <Field
              label={descLabel}
              required
              error={formErrors[descKey]}
              className="lg:col-span-2"
            >
              <input
                type="text"
                value={form.data[descKey]}
                onChange={(e) => handleChange(form.id, descKey, e.target.value)}
                placeholder={`Enter ${descLabel.toLowerCase()}`}
                className={`${CTRL} ${formErrors[descKey] ? CTRL_ERR : ""}`}
              />
            </Field>
          )}

          {/* Machine Type + Component Spec (MACHINERY / QC TOOLS) */}
          {needsMachineFields && (
            <Field label="Machine Type" required error={formErrors.machineType}>
              <input
                type="text"
                value={form.data.machineType}
                onChange={(e) =>
                  handleChange(form.id, "machineType", e.target.value)
                }
                placeholder="Enter machine type"
                className={`${CTRL} ${formErrors.machineType ? CTRL_ERR : ""}`}
              />
            </Field>
          )}
          {needsMachineFields && (
            <Field
              label="Component Spec"
              required
              error={formErrors.componentSpec}
            >
              <input
                type="text"
                value={form.data.componentSpec}
                onChange={(e) =>
                  handleChange(form.id, "componentSpec", e.target.value)
                }
                placeholder="Enter component specification"
                className={`${CTRL} ${formErrors.componentSpec ? CTRL_ERR : ""}`}
              />
            </Field>
          )}

          {/* QTY or AMOUNT (not in first row for MACHINERY) */}
          {selectedCategory !== "MACHINERY" && (
            <Field
              label={needsAmount ? "Amount" : "Qty"}
              required
              error={formErrors[needsAmount ? "amount" : "qty"]}
            >
              <input
                type="number"
                value={needsAmount ? form.data.amount : form.data.qty}
                onChange={(e) =>
                  handleChange(
                    form.id,
                    needsAmount ? "amount" : "qty",
                    e.target.value,
                  )
                }
                placeholder={needsAmount ? "Enter amount" : "Enter quantity"}
                className={`${CTRL} ${NO_SPIN} ${
                  formErrors[needsAmount ? "amount" : "qty"] ? CTRL_ERR : ""
                }`}
              />
            </Field>
          )}

          {/* UNIT (not for TRAVEL EXPENSE / MACHINERY here) */}
          {!needsAmount && selectedCategory !== "MACHINERY" && (
            <Field label="Unit" required error={formErrors.unit}>
              <ThemedSelect
                value={form.data.unit}
                onChange={(value) => handleChange(form.id, "unit", value)}
                options={toOptions(unitOptions)}
                placeholder="Select unit"
              />
            </Field>
          )}

          {/* QTY + UNIT for MACHINERY */}
          {selectedCategory === "MACHINERY" && (
            <Field label="Qty">
              <input
                type="number"
                value={form.data.qty}
                onChange={(e) => handleChange(form.id, "qty", e.target.value)}
                placeholder="Enter quantity"
                className={`${CTRL} ${NO_SPIN}`}
              />
            </Field>
          )}
          {selectedCategory === "MACHINERY" && (
            <Field label="Unit">
              <ThemedSelect
                value={form.data.unit}
                onChange={(value) => handleChange(form.id, "unit", value)}
                options={toOptions(unitOptions)}
                placeholder="Select unit"
              />
            </Field>
          )}

          {/* FOR (PANTRY / TRAVEL EXPENSE) */}
          {needsForField && (
            <Field label="For">
              {selectedCategory === "PANTRY" ? (
                <ThemedSelect
                  value={form.data.forField}
                  onChange={(value) =>
                    handleChange(form.id, "forField", value)
                  }
                  options={toOptions(forOptions)}
                  placeholder="Select option"
                />
              ) : (
                <input
                  type="text"
                  value={form.data.forField}
                  onChange={(e) =>
                    handleChange(form.id, "forField", e.target.value)
                  }
                  placeholder="Enter value"
                  className={CTRL}
                />
              )}
            </Field>
          )}

          {/* REMARKS */}
          <Field label="Remarks" className="lg:col-span-2">
            <input
              type="text"
              value={form.data.remarks}
              onChange={(e) => handleChange(form.id, "remarks", e.target.value)}
              placeholder="Enter remarks"
              className={CTRL}
            />
          </Field>

          {/* REFERENCE IMAGE (all except MACHINERY) */}
          {selectedCategory !== "MACHINERY" && (
            <Field label="Reference Image" className="lg:col-span-2">
              <ImageUpload
                id={`upload-image-${form.id}`}
                value={form.data.referenceImage}
                onChange={(file) =>
                  handleChange(form.id, "referenceImage", file)
                }
              />
            </Field>
          )}
        </div>
      </div>
    );
  };

  const shellStyle = {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    // The theme's --accent is a pinkish grey used for react-select's option hover;
    // recolor it to a neutral grey so hovered options match the other components.
    "--accent": "#edeef1",
  };

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={shellStyle}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Header */}
        <div>
          <button type="button" onClick={onBack} className={BACK_BTN}>
            ← Back to Code Creation
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            Company Essentials
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a category and add the items you need to procure.
          </p>
        </div>

        {/* Category Selection */}
        <div className={CARD}>
          <Field label="Select Category" className="max-w-md">
            <ThemedSelect
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={toOptions(categories)}
              placeholder="Select or search category"
            />
          </Field>
        </div>

        {/* Forms Section */}
        {selectedCategory && (
          <div className={`${CARD} space-y-5`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={SECTION_TITLE}>
                {selectedCategory.replace(/_/g, " ")}
              </h2>
              {!needsDepartment && (
                <Field label="Date" className="w-full sm:w-56">
                  <input
                    type="date"
                    value={commonDate}
                    onChange={(e) => setCommonDate(e.target.value)}
                    className={CTRL}
                  />
                </Field>
              )}
            </div>

            {/* Render all subforms */}
            <form
              onSubmit={handleSubmitAll}
              onKeyDown={handleKeyDown}
              className="space-y-4"
            >
              <div className="space-y-4">
                {forms.map((form) => renderForm(form))}
              </div>

              {/* Submit and Add More Buttons */}
              <div className="flex flex-wrap justify-start gap-3 pt-1">
                <button type="submit" className={PRIMARY_BTN}>
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleAddMore}
                  className={OUTLINE_BTN}
                >
                  + Add More
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewPopup &&
          createPortal(
            <div
              className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4"
              style={shellStyle}
              onClick={() => !isSubmitting && setShowPreviewPopup(false)}
            >
              <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[#e2e3e8] bg-card shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e2e3e8] bg-primary px-5 py-4">
                  <h3 className="text-base font-semibold text-primary-foreground">
                    Preview Entry
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPreviewPopup(false)}
                    disabled={isSubmitting}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div className="space-y-3">
                    {forms.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-md border border-[#e2e3e8] bg-[#fafafb] p-3"
                      >
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Entry #{form.srNo}
                        </div>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm md:grid-cols-2">
                          <PreviewRow
                            label="Category"
                            value={selectedCategory.replace(/_/g, " ") || "-"}
                          />
                          <PreviewRow
                            label="Date"
                            value={needsDepartment ? "-" : commonDate || "-"}
                          />
                          {needsDepartment && (
                            <PreviewRow
                              label="Department"
                              value={form.data.department || "-"}
                            />
                          )}
                          {needsMachineFields ? (
                            <>
                              <PreviewRow
                                label="Machine Type"
                                value={form.data.machineType || "-"}
                              />
                              <PreviewRow
                                label="Component Spec"
                                value={form.data.componentSpec || "-"}
                              />
                            </>
                          ) : (
                            <PreviewRow
                              label={
                                needsItem
                                  ? "Item"
                                  : needsJobWork
                                    ? "Job Work"
                                    : "Item Description"
                              }
                              value={
                                needsItem
                                  ? form.data.item || "-"
                                  : form.data.itemDescription || "-"
                              }
                            />
                          )}
                          <PreviewRow
                            label={needsAmount ? "Amount" : "Qty"}
                            value={
                              needsAmount
                                ? form.data.amount || "-"
                                : form.data.qty || "-"
                            }
                          />
                          {!needsAmount && (
                            <PreviewRow
                              label="Unit"
                              value={form.data.unit || "-"}
                            />
                          )}
                          {needsForField && (
                            <PreviewRow
                              label="For"
                              value={form.data.forField || "-"}
                            />
                          )}
                          <div className="md:col-span-2">
                            <PreviewRow
                              label="Remarks"
                              value={form.data.remarks || "-"}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Your Name"
                      required
                      error={previewErrors.personName}
                    >
                      <input
                        type="text"
                        value={previewPersonName}
                        onChange={(e) => {
                          setPreviewPersonName(e.target.value);
                          if (previewErrors.personName) {
                            setPreviewErrors((prev) => ({
                              ...prev,
                              personName: undefined,
                            }));
                          }
                        }}
                        placeholder="Enter your name"
                        className={`${CTRL} ${
                          previewErrors.personName ? CTRL_ERR : ""
                        }`}
                      />
                    </Field>
                    <Field
                      label="Payment Mode"
                      required
                      error={previewErrors.paymentMethod}
                    >
                      <ThemedSelect
                        value={previewPaymentMethod}
                        onChange={(value) => {
                          setPreviewPaymentMethod(value);
                          if (previewErrors.paymentMethod) {
                            setPreviewErrors((prev) => ({
                              ...prev,
                              paymentMethod: undefined,
                            }));
                          }
                        }}
                        options={paymentMethodOptions}
                        placeholder="Select payment mode"
                      />
                    </Field>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-[#e2e3e8] bg-[#fafafb] px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setShowPreviewPopup(false)}
                    disabled={isSubmitting}
                    className={OUTLINE_BTN}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardPreview}
                    disabled={isSubmitting}
                    className={DANGER_BTN.replace("px-3 py-1.5 text-xs", "px-5 py-3 text-sm")}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className={PRIMARY_BTN}
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {isSubmitting ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

// Small label/value pair used inside the preview modal.
const PreviewRow = ({ label, value }) => (
  <div>
    <span className="font-medium text-foreground/70">{label}:</span>{" "}
    <span className="text-foreground">{value}</span>
  </div>
);

export default CompanyEssentials;
