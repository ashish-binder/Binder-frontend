import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { scrollToFirstError } from "@/utils/scrollToFirstError";
import {
  getBuyerCodes,
  createBuyerCode,
  updateBuyerCode,
} from "../services/integration";

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const CARD = "rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6";
const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const CTRL =
  "w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";
const CTRL_ERR =
  "border-destructive focus:border-destructive focus:ring-destructive/20";
const BACK_BTN =
  "mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg";
const PRIMARY_BTN =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

const INITIAL_FORM_DATA = {
  buyerName: "",
  contactPerson: "",
  retailer: "",
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
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

const GenerateBuyerCode = ({ onBack, initialData = null, onSaved }) => {
  const isEditMode = Boolean(initialData);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingBuyerCodes, setExistingBuyerCodes] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        buyerName: initialData.buyerName || initialData.buyer_name || "",
        contactPerson:
          initialData.contactPerson || initialData.contact_person || "",
        retailer: initialData.retailer || initialData.end_customer || "",
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
    setGeneratedCode("");
    setIsGenerating(false);
  }, [initialData]);

  // Existing codes are still loaded (silently) to detect duplicate
  // buyer + end-customer combinations before creating a new one.
  useEffect(() => {
    const loadBuyerCodes = async () => {
      try {
        const response = await getBuyerCodes();
        const codes = extractItems(response);
        const mapped = Array.isArray(codes)
          ? codes.map((item) => ({
              id: item.id || item.code || "",
              code: item.code || item.id || "",
              buyerName: item.buyer_name || item.buyerName || "",
              buyerAddress: item.buyer_address || item.buyerAddress || "",
              contactPerson: item.contact_person || item.contactPerson || "",
              retailer: item.retailer || "",
              createdAt: item.created_at || item.createdAt || "",
            }))
          : [];
        setExistingBuyerCodes(mapped);
      } catch (error) {
        console.warn("Failed to load buyer codes from API:", error);
        setExistingBuyerCodes([]);
      }
    };
    loadBuyerCodes();
  }, [generatedCode]); // Refresh when returning from success screen

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedData = {
      buyerName: formData.buyerName?.trim() || "",
      contactPerson: formData.contactPerson?.trim() || "",
      retailer: formData.retailer?.trim() || "",
    };

    if (!trimmedData.buyerName) {
      newErrors.buyerName = "Buyer Name is required";
    }
    if (!trimmedData.contactPerson) {
      newErrors.contactPerson = "Contact Person is required";
    }
    if (!trimmedData.retailer) {
      newErrors.retailer = "End Customer is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return false;
    }
    return true;
  };

  const checkIfCombinationExists = (existingCodes) => {
    const normalizedBuyerName = formData.buyerName.trim().toLowerCase();
    const normalizedRetailer = formData.retailer.trim().toLowerCase();
    const currentCode = (initialData?.code || initialData?.id || "")
      .toString()
      .trim();

    return existingCodes.find((item) => {
      const itemBuyerName = (item.buyerName || "").trim().toLowerCase();
      const itemRetailer = (item.retailer || "").trim().toLowerCase();
      const itemCode = (item.code || item.id || "").toString().trim();

      return (
        itemCode !== currentCode &&
        itemBuyerName === normalizedBuyerName &&
        itemRetailer === normalizedRetailer
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard against rapid double-clicks: setIsGenerating(true) is async, so the
    // button's disabled state may not apply before a second click fires. This
    // ref-free check bails out immediately if a request is already in flight.
    if (isGenerating) return;
    if (!validateForm()) return;

    const existingEntry = checkIfCombinationExists(existingBuyerCodes);
    if (existingEntry) {
      setErrors({
        buyerName: "This buyer-end customer combination already exists",
        retailer: `Existing code: ${existingEntry.code}`,
      });
      toast.error(
        `This buyer-end customer combination already exists (code ${existingEntry.code}). Use a different end customer or buyer name.`,
      );
      return;
    }

    setIsGenerating(true);
    try {
      if (isEditMode) {
        const identifier = initialData?.id || initialData?.code;
        if (!identifier) {
          throw new Error("Buyer identifier is missing");
        }

        const response = await updateBuyerCode(identifier, {
          buyer_name: formData.buyerName.trim(),
          buyer_address:
            initialData?.buyerAddress ||
            initialData?.buyer_address ||
            formData.buyerName.trim(),
          contact_person: formData.contactPerson.trim(),
          retailer: formData.retailer.trim(),
        });

        const responseData =
          response?.data && typeof response.data === "object"
            ? response.data
            : response;

        const updatedBuyerData = {
          id: responseData?.id || initialData?.id || initialData?.code || "",
          code:
            responseData?.code || initialData?.code || initialData?.id || "",
          buyerName:
            responseData?.buyer_name ||
            responseData?.buyerName ||
            formData.buyerName.trim(),
          buyerAddress:
            responseData?.buyer_address ||
            responseData?.buyerAddress ||
            initialData?.buyerAddress ||
            initialData?.buyer_address ||
            formData.buyerName.trim(),
          contactPerson:
            responseData?.contact_person ||
            responseData?.contactPerson ||
            formData.contactPerson.trim(),
          retailer: responseData?.retailer || formData.retailer.trim(),
          createdAt:
            responseData?.created_at ||
            responseData?.createdAt ||
            initialData?.createdAt ||
            new Date().toISOString(),
        };

        const currentCode = (
          initialData?.code ||
          initialData?.id ||
          ""
        ).toString();
        setExistingBuyerCodes((prev) =>
          prev.map((item) => {
            const itemCode = (item.code || item.id || "").toString();
            return itemCode === currentCode
              ? { ...item, ...updatedBuyerData }
              : item;
          }),
        );

        toast.success("Buyer updated successfully.");
        if (typeof onSaved === "function") {
          onSaved(updatedBuyerData);
        } else {
          onBack?.();
        }
        return;
      }

      // Call backend API - code is auto-generated by the server.
      const response = await createBuyerCode({
        buyerName: formData.buyerName.trim(),
        buyerAddress: formData.buyerName.trim(), // Backend requires address; use buyer name as fallback
        contactPerson: formData.contactPerson.trim(),
        retailer: formData.retailer.trim(),
      });

      if (response?.status !== "success" || !response.data) {
        throw new Error(response?.message || "Failed to create buyer code");
      }

      const data = response.data;
      const newBuyerData = {
        id: data.id || data.code || "",
        code: data.code,
        buyerName: formData.buyerName.trim(),
        buyerAddress: formData.buyerName.trim(),
        contactPerson: formData.contactPerson.trim(),
        retailer: formData.retailer.trim(),
        createdAt: new Date().toISOString(),
      };

      setExistingBuyerCodes((prev) => [...prev, newBuyerData]);
      setGeneratedCode(data.code);
      toast.success(`Buyer code  generated successfully!`);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(
        error?.message ||
          error?.data?.message ||
          "An error occurred while generating the buyer code.",
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
              Buyer Code Generated
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your unique buyer code is ready to use.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <div className={`${CARD} flex flex-col items-center text-center`}>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600">
                ✓
              </div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Buyer Code
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
            {isEditMode ? "Edit Buyer Code" : "Generate Buyer Code"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditMode
              ? `Update buyer details for code ${initialData?.code || initialData?.id || ""}`.trim()
              : "Fill in the buyer details to generate a unique buyer code."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={CARD}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Buyer Name" required error={errors.buyerName}>
              <input
                type="text"
                id="buyerName"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                placeholder="Enter buyer name"
                aria-invalid={!!errors.buyerName}
                className={`${CTRL} ${errors.buyerName ? CTRL_ERR : ""}`}
              />
            </Field>

            <Field label="End Customer" required error={errors.retailer}>
              <input
                type="text"
                id="retailer"
                name="retailer"
                value={formData.retailer}
                onChange={handleInputChange}
                placeholder="Enter end customer name"
                aria-invalid={!!errors.retailer}
                className={`${CTRL} ${errors.retailer ? CTRL_ERR : ""}`}
              />
            </Field>

            <Field label="Contact Person" required error={errors.contactPerson}>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
                aria-invalid={!!errors.contactPerson}
                className={`${CTRL} ${errors.contactPerson ? CTRL_ERR : ""}`}
              />
            </Field>
          </div>

          <div className="mt-6 flex justify-start">
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
                  ? "Updating Buyer..."
                  : "Generating Code..."
                : isEditMode
                  ? "Update Buyer"
                  : "Generate Buyer Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateBuyerCode;
