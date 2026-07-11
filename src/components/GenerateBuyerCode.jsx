import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-layout";
import { scrollToFirstError } from "@/utils/scrollToFirstError";
import {
  getBuyerCodes,
  createBuyerCode,
  updateBuyerCode,
} from "../services/integration";

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Trim whitespace and check if fields are empty
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

    // Check if exact buyer + end customer combination exists
    const existingEntry = existingCodes.find((item) => {
      const itemBuyerName = (item.buyerName || "").trim().toLowerCase();
      const itemRetailer = (item.retailer || "").trim().toLowerCase();
      const itemCode = (item.code || item.id || "").toString().trim();

      return (
        itemCode !== currentCode &&
        itemBuyerName === normalizedBuyerName &&
        itemRetailer === normalizedRetailer
      );
    });

    return existingEntry;
  };

  const generateBuyerCode = (buyerName, retailer) => {
    try {
      // Use codes already loaded from the API
      const existingCodes = existingBuyerCodes;

      // Normalize buyer name for comparison
      const normalizedBuyerName = buyerName.trim().toLowerCase();

      // Find all codes for this buyer (regardless of end customer)
      const buyerCodes = existingCodes.filter((item) => {
        const itemBuyerName = (item.buyerName || "").trim().toLowerCase();
        return itemBuyerName === normalizedBuyerName;
      });

      if (buyerCodes.length > 0) {
        // Buyer exists - increment the letter suffix
        // Get the base number from the first code of this buyer
        const firstCode = buyerCodes[0].code;
        const baseNumber = parseInt(firstCode.replace(/[A-Z]/g, ""));

        // Find all letter suffixes for this buyer
        const letterSuffixes = buyerCodes.map((item) => {
          const match = item.code.match(/[A-Z]+$/);
          return match ? match[0] : "A";
        });

        // Find the highest letter (A, B, C, etc.)
        let highestLetter = "A";
        letterSuffixes.forEach((letter) => {
          if (letter > highestLetter) {
            highestLetter = letter;
          }
        });

        // Increment the letter for new end customer
        const nextLetter = String.fromCharCode(highestLetter.charCodeAt(0) + 1);

        return `${baseNumber}${nextLetter}`;
      } else {
        // New buyer - increment the base number
        // Find the highest base number across all codes
        let maxBaseNumber = 100; // Start from 100, so first code will be 101

        existingCodes.forEach((item) => {
          const itemNumber = parseInt(item.code.replace(/[A-Z]/g, ""));
          if (itemNumber > maxBaseNumber) {
            maxBaseNumber = itemNumber;
          }
        });

        // Increment for new buyer
        const newBaseNumber = maxBaseNumber + 1;
        return `${newBaseNumber}A`;
      }
    } catch (error) {
      console.error("Error generating buyer code:", error);
      // Fallback to a simple code
      return `${Date.now().toString().slice(-3)}A`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    try {
      setIsGenerating(true);

      // Check if this exact buyer + end customer combination already exists
      const existingEntry = checkIfCombinationExists(existingBuyerCodes);

      if (existingEntry) {
        setIsGenerating(false);
        setErrors({
          buyerName: "This buyer-end customer combination already exists",
          retailer: `Existing code: ${existingEntry.code}`,
        });
        alert(
          `⚠️ This buyer-end customer combination already exists!\n\nExisting Code: ${existingEntry.code}\nBuyer: ${existingEntry.buyerName}\nEnd Customer: ${existingEntry.retailer}\n\nPlease use a different end customer or buyer name.`,
        );
        return;
      }

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
        setIsGenerating(false);

        if (typeof onSaved === "function") {
          onSaved(updatedBuyerData);
        } else {
          alert("Buyer updated successfully.");
          onBack?.();
        }
        return;
      }

      // Call backend API - code is auto-generated by the server
      const response = await createBuyerCode({
        buyerName: formData.buyerName.trim(),
        buyerAddress: formData.buyerName.trim(), // Backend requires address; use buyer name as fallback
        contactPerson: formData.contactPerson.trim(),
        retailer: formData.retailer.trim(),
      });

      console.log("API response:", response);

      if (response.status === "success" && response.data) {
        const newCode = response.data.code;
        console.log("Generated code from API:", newCode);

        // Update localStorage cache
        const newBuyerData = {
          id: response.data.id || response.data.code || "",
          code: newCode,
          buyerName: formData.buyerName.trim(),
          buyerAddress: formData.buyerName.trim(),
          contactPerson: formData.contactPerson.trim(),
          retailer: formData.retailer.trim(),
          createdAt: new Date().toISOString(),
        };

        setExistingBuyerCodes((prev) => [...prev, newBuyerData]);

        // Set the generated code to show success screen
        setGeneratedCode(newCode);
        setIsGenerating(false);
      } else {
        throw new Error(response.message || "Failed to create buyer code");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsGenerating(false);
      const errorMsg =
        error.message ||
        error.data?.message ||
        "An error occurred while generating the buyer code.";
      alert(`Error: ${errorMsg}\nPlease try again.`);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      alert("Buyer code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generatedCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        alert("Buyer code copied to clipboard!");
      } catch (copyErr) {
        console.error("Fallback copy failed:", copyErr);
        alert("Failed to copy code. Please copy manually: " + generatedCode);
      }

      document.body.removeChild(textArea);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setGeneratedCode("");
    setIsGenerating(false);
  };

  // Success screen - only show generated code
  if (generatedCode && !isEditMode) {
    return (
      <div className="fullscreen-content" style={{ overflowY: "auto" }}>
        <div className="content-header">
          <Button
            variant="outline"
            onClick={onBack}
            type="button"
            className="mb-6 bg-white"
          >
            ← Back to Code Creation
          </Button>
          <h1 className="fullscreen-title">
            Buyer Code Generated Successfully!
          </h1>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <FormCard
            className="rounded-2xl border-border bg-muted"
            style={{ padding: "24px 20px" }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-5">
                ✓
              </div>

              <div className="w-full" style={{ marginTop: "8px" }}>
                <div className="text-sm font-semibold text-foreground/80 mb-3">
                  Your Buyer Code
                </div>

                <FormCard
                  className="rounded-xl border-border bg-card"
                  style={{ padding: "20px 18px" }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="text-primary font-black"
                      style={{
                        fontSize: "36px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace',
                        letterSpacing: "3px",
                        wordBreak: "break-word",
                      }}
                    >
                      {generatedCode}
                    </span>
                  </div>
                </FormCard>
              </div>

              <div
                className="flex justify-center gap-3"
                style={{ marginTop: "40px" }}
              >
                <Button variant="default" onClick={resetForm} type="button">
                  Generate Another Code
                </Button>
              </div>
            </div>
          </FormCard>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="fullscreen-content" style={{ overflowY: "auto" }}>
      <div className="content-header">
        <Button
          variant="outline"
          onClick={onBack}
          type="button"
          className="mb-6 bg-white"
        >
          ← Back to Code Creation
        </Button>
        <h1 className="fullscreen-title">
          {isEditMode ? "Edit Buyer Code" : "Generate Buyer Code"}
        </h1>
        <p className="fullscreen-description">
          {isEditMode
            ? `Update buyer details for code ${initialData?.code || initialData?.id || ""}`.trim()
            : "Fill in the buyer details to generate a unique buyer code"}
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <FormCard
          className="rounded-2xl border-border bg-muted"
          style={{ padding: "24px 20px" }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="flex flex-wrap"
              style={{ gap: "16px 12px", marginBottom: "16px" }}
            >
              <Field
                label="BUYER NAME"
                required
                error={errors.buyerName}
                width="md"
              >
                <Input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  placeholder="Enter buyer name"
                  required
                  aria-invalid={!!errors.buyerName}
                />
              </Field>

              <Field
                label="END CUSTOMER"
                required
                error={errors.retailer}
                width="md"
              >
                <Input
                  type="text"
                  id="retailer"
                  name="retailer"
                  value={formData.retailer}
                  onChange={handleInputChange}
                  placeholder="Enter end customer name"
                  required
                  aria-invalid={!!errors.retailer}
                />
              </Field>

              <Field
                label="CONTACT PERSON"
                required
                error={errors.contactPerson}
                width="md"
              >
                <Input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  required
                  aria-invalid={!!errors.contactPerson}
                />
              </Field>
            </div>

            <div className="flex justify-start">
              <Button type="submit" disabled={isGenerating} size="default">
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"></span>
                    {isEditMode ? "Updating Buyer..." : "Generating Code..."}
                  </>
                ) : isEditMode ? (
                  "Update Buyer"
                ) : (
                  "Generate Buyer Code"
                )}
              </Button>
            </div>
          </form>
        </FormCard>

        {existingBuyerCodes.length > 0 && (
          <div
            className="w-fit"
            style={{
              marginTop: "16px",
              border: "1px solid rgb(34 197 94)",
              borderRadius: "8px",
              padding: "16px 20px",
              maxWidth: "480px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#000",
                letterSpacing: "0.5px",
              }}
            >
              Existing codes
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {[...existingBuyerCodes].reverse().map((item, idx) => (
                <div
                  key={item.code + "-" + (item.createdAt || idx)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    backgroundColor: "var(--muted)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: "600",
                      color: "var(--foreground)",
                    }}
                  >
                    {item.code || "N/A"}
                  </span>
                  <span
                    style={{
                      color: "var(--muted-foreground)",
                      maxWidth: "140px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.buyerName || item.buyer_name || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateBuyerCode;
