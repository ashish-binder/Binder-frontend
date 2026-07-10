import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import BaseFormTemplate from "./BaseFormTemplate";
import { formsConfig } from "./formConfig";
import ThemedSelect from "../IMS/StockSheet/ThemedSelect";
import { getIPOs } from "../../services/integration";
import {
  getFormDisplayName,
  getOrderTypeLabel,
  isQualityYes,
  mapArtworkCategoryToFormKey,
  mapRawMaterialToFormKey,
  ORDER_TYPE_SEQUENCE,
  toCollectionArray,
} from "@/utils/uqrMappings";

const FACTORY_STORAGE_KEY = "factoryCodeFormData";
const INTERNAL_PURCHASE_ORDERS_KEY = "internalPurchaseOrders";
const UQR_FILLED_SECTIONS_KEY = "uqrFilledSections";
const UQR_DRAFT_PREFIX = "uqrDraft::";

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const CARD = "rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6";
const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const SECTION_TITLE =
  "mb-4 text-sm font-bold uppercase tracking-wide text-foreground";

const parseJson = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
};

const getSectionContextKey = ({ orderType, ipoCode, ipcCode, formKey }) =>
  `${orderType}::${ipoCode}::${ipcCode}::${formKey}`;

const parseSectionContextKey = (contextKey = "") => {
  const [orderType = "", ipoCode = "", ipcCode = "", formKey = ""] =
    String(contextKey).split("::");
  if (!orderType || !ipoCode || !ipcCode || !formKey) {
    return null;
  }
  return { orderType, ipoCode, ipcCode, formKey };
};

const getDraftStorageKey = (contextKey = "") =>
  contextKey ? `${UQR_DRAFT_PREFIX}${contextKey}` : "";
const toCodeKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const compareOrderType = (left, right) => {
  const leftIndex = ORDER_TYPE_SEQUENCE.indexOf(left);
  const rightIndex = ORDER_TYPE_SEQUENCE.indexOf(right);
  const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
  const normalizedRight =
    rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
  if (normalizedLeft !== normalizedRight) {
    return normalizedLeft - normalizedRight;
  }
  return String(left || "").localeCompare(String(right || ""));
};

const formatSavedAt = (value) => {
  if (!value) return "Saved draft";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Saved draft";
  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const collectUqrFormsForStepData = (stepData = {}) => {
  const formKeys = new Set();

  toCollectionArray(stepData.rawMaterials).forEach((material) => {
    const hasMaterialQualityYes = isQualityYes(material?.qualityVerification);
    const hasWorkOrderQualityYes = toCollectionArray(material?.workOrders).some(
      (workOrder) => isQualityYes(workOrder?.qualityVerification),
    );
    if (!hasMaterialQualityYes && !hasWorkOrderQualityYes) return;

    const formKey = mapRawMaterialToFormKey(material);
    if (formKey && formsConfig[formKey]) formKeys.add(formKey);
  });

  toCollectionArray(stepData.artworkMaterials).forEach((material) => {
    const artworkCategory = material?.artworkCategory;
    const qualityValue =
      material?.qualityVerificationByCategory?.[artworkCategory] ??
      material?.qualityVerification;

    if (artworkCategory && isQualityYes(qualityValue)) {
      const formKey = mapArtworkCategoryToFormKey(artworkCategory);
      if (formKey && formsConfig[formKey]) formKeys.add(formKey);
      return;
    }

    const qualityByCategory = material?.qualityVerificationByCategory;
    if (qualityByCategory && typeof qualityByCategory === "object") {
      Object.entries(qualityByCategory).forEach(([category, quality]) => {
        if (!isQualityYes(quality)) return;
        const formKey = mapArtworkCategoryToFormKey(category);
        if (formKey && formsConfig[formKey]) formKeys.add(formKey);
      });
    }
  });

  return Array.from(formKeys);
};

const getIpcEntriesFromFactoryDraft = (entry = {}) => {
  const ipcMap = new Map();
  const skus = toCollectionArray(entry?.skus);

  const addIpc = (ipcCode, stepData) => {
    const code = String(ipcCode || "").trim();
    if (!code) return;
    const forms = ipcMap.get(code) || new Set();
    if (stepData) {
      collectUqrFormsForStepData(stepData).forEach((formKey) =>
        forms.add(formKey),
      );
    }
    ipcMap.set(code, forms);
  };

  skus.forEach((sku, skuIndex) => {
    const mainIpcCode = sku?.ipcCode || `IPC-${skuIndex + 1}`;
    addIpc(mainIpcCode, sku?.stepData);

    toCollectionArray(sku?.subproducts).forEach((subproduct, spIndex) => {
      const spIpcCode =
        subproduct?.ipcCode ||
        `${String(mainIpcCode).replace(/\/SP-?\d+$/i, "")}/SP-${spIndex + 1}`;
      addIpc(spIpcCode, subproduct?.stepData);
    });
  });

  return Array.from(ipcMap.entries()).map(([ipcCode, forms]) => ({
    ipcCode,
    uqrForms: Array.from(forms),
  }));
};

const sortIpcEntries = (ipcs = []) =>
  [...ipcs]
    .map((ipc) => ({
      ...ipc,
      uqrForms: [...(ipc.uqrForms || [])].sort((left, right) =>
        getFormDisplayName(
          left,
          formsConfig[left]?.title || left,
        ).localeCompare(
          getFormDisplayName(right, formsConfig[right]?.title || right),
        ),
      ),
    }))
    .sort((left, right) => left.ipcCode.localeCompare(right.ipcCode));

const sortEntries = (entries = []) =>
  [...entries]
    .map((entry) => ({
      ...entry,
      ipcs: sortIpcEntries(entry.ipcs),
    }))
    .sort((left, right) => {
      const orderTypeComparison = compareOrderType(
        left.orderType,
        right.orderType,
      );
      if (orderTypeComparison !== 0) return orderTypeComparison;
      return left.code.localeCompare(right.code);
    });

const loadFactorySavedEntries = (ipoSource = []) => {
  const keySet = new Set([FACTORY_STORAGE_KEY]);
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(`${FACTORY_STORAGE_KEY}:`)) {
      keySet.add(key);
    }
  }

  const entryMap = new Map();
  const mergeIpcs = (existing = [], incoming = []) => {
    const ipcMap = new Map();
    existing.forEach((ipc) => {
      ipcMap.set(ipc.ipcCode, new Set(ipc.uqrForms || []));
    });
    incoming.forEach((ipc) => {
      const forms = ipcMap.get(ipc.ipcCode) || new Set();
      (ipc.uqrForms || []).forEach((formKey) => forms.add(formKey));
      ipcMap.set(ipc.ipcCode, forms);
    });
    return Array.from(ipcMap.entries()).map(([ipcCode, forms]) => ({
      ipcCode,
      uqrForms: Array.from(forms),
    }));
  };

  Array.from(keySet).forEach((key) => {
    const raw = localStorage.getItem(key);
    const parsed = parseJson(raw, null);
    if (!parsed || typeof parsed !== "object") return;

    const orderType = getOrderTypeLabel(
      parsed?.orderType || parsed?.order_type || "",
    );
    const code = String(parsed?.ipoCode || parsed?.code || "").trim();
    if (!orderType || !code) return;

    const ipcs = getIpcEntriesFromFactoryDraft(parsed);
    if (ipcs.length === 0) return;

    const mapKey = `${orderType}::${toCodeKey(code)}`;
    const previousEntry = entryMap.get(mapKey);
    entryMap.set(
      mapKey,
      previousEntry
        ? { ...previousEntry, ipcs: mergeIpcs(previousEntry.ipcs, ipcs) }
        : { orderType, code, ipcs },
    );
  });

  if (!Array.isArray(ipoSource)) return [];

  const combined = new Map();
  ipoSource.forEach((ipo) => {
    const orderType = getOrderTypeLabel(
      ipo?.orderType || ipo?.order_type || "",
    );
    const code = String(ipo?.ipoCode || ipo?.code || "").trim();
    if (!orderType || !code) return;

    const mapKey = `${orderType}::${toCodeKey(code)}`;
    const factoryEntry = entryMap.get(mapKey);
    combined.set(mapKey, {
      orderType,
      code,
      ipcs: factoryEntry?.ipcs || [],
    });
  });

  return sortEntries(Array.from(combined.values()));
};

const loadSavedDatabaseEntries = (filledSections = {}) => {
  const entryMap = new Map();

  const ensureIpcEntry = (entry, ipcCode) => {
    const existingIpc = entry.ipcs.find((ipc) => ipc.ipcCode === ipcCode);
    if (existingIpc) return existingIpc;
    const nextIpc = { ipcCode, uqrForms: [], savedAtByForm: {} };
    entry.ipcs.push(nextIpc);
    return nextIpc;
  };

  const addSavedContext = (contextKey, savedAt = "") => {
    const context = parseSectionContextKey(contextKey);
    if (!context || !formsConfig[context.formKey]) return;

    const entryKey = `${context.orderType}::${toCodeKey(context.ipoCode)}`;
    const entry = entryMap.get(entryKey) || {
      orderType: context.orderType,
      code: context.ipoCode,
      ipcs: [],
    };

    const ipcEntry = ensureIpcEntry(entry, context.ipcCode);
    if (!ipcEntry.uqrForms.includes(context.formKey)) {
      ipcEntry.uqrForms.push(context.formKey);
    }
    if (!ipcEntry.savedAtByForm[context.formKey] || savedAt) {
      ipcEntry.savedAtByForm[context.formKey] = savedAt;
    }

    entryMap.set(entryKey, entry);
  };

  Object.entries(filledSections).forEach(([contextKey, savedAt]) => {
    addSavedContext(contextKey, typeof savedAt === "string" ? savedAt : "");
  });

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(UQR_DRAFT_PREFIX)) continue;
    const contextKey = key.slice(UQR_DRAFT_PREFIX.length);
    addSavedContext(contextKey, filledSections?.[contextKey] || "");
  }

  return sortEntries(Array.from(entryMap.values()));
};

const UQRFormsPreview = ({ mode = "forms" }) => {
  const isDatabaseMode = mode === "database";
  const [formEntries, setFormEntries] = useState([]);
  const [databaseEntries, setDatabaseEntries] = useState([]);
  const [filledSections, setFilledSections] = useState({});
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedIpoCode, setSelectedIpoCode] = useState("");
  const [selectedIpcCode, setSelectedIpcCode] = useState("");
  const [selectedFormKey, setSelectedFormKey] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const nextFilledSections = parseJson(
        localStorage.getItem(UQR_FILLED_SECTIONS_KEY),
        {},
      );
      const normalizedFilledSections =
        nextFilledSections && typeof nextFilledSections === "object"
          ? nextFilledSections
          : {};

      let ipoList = [];
      try {
        const response = await getIPOs();
        const rawItems = response?.results || response?.data || response || [];
        ipoList = Array.isArray(rawItems) ? rawItems : [];
      } catch (error) {
        console.warn("Failed to load IPOs from API:", error);
        ipoList = [];
      }

      setFormEntries(loadFactorySavedEntries(ipoList));
      setDatabaseEntries(loadSavedDatabaseEntries(normalizedFilledSections));
      setFilledSections(normalizedFilledSections);
    };

    loadData();
    window.addEventListener("storage", loadData);
    window.addEventListener("factoryCodeFormDataUpdated", loadData);
    window.addEventListener("internalPurchaseOrdersUpdated", loadData);
    window.addEventListener("uqrFilledSectionsUpdated", loadData);
    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("factoryCodeFormDataUpdated", loadData);
      window.removeEventListener("internalPurchaseOrdersUpdated", loadData);
      window.removeEventListener("uqrFilledSectionsUpdated", loadData);
    };
  }, []);

  const activeEntries = isDatabaseMode ? databaseEntries : formEntries;
  const orderTypes = ORDER_TYPE_SEQUENCE;

  useEffect(() => {
    if (!orderTypes.includes(selectedOrderType)) {
      setSelectedOrderType(orderTypes[0] || "");
    }
  }, [orderTypes, selectedOrderType]);

  const ipoEntries = useMemo(
    () =>
      activeEntries.filter((entry) => entry.orderType === selectedOrderType),
    [activeEntries, selectedOrderType],
  );

  useEffect(() => {
    if (!ipoEntries.some((entry) => entry.code === selectedIpoCode)) {
      setSelectedIpoCode(ipoEntries[0]?.code || "");
    }
  }, [ipoEntries, selectedIpoCode]);

  const selectedIpoEntry = useMemo(
    () => ipoEntries.find((entry) => entry.code === selectedIpoCode) || null,
    [ipoEntries, selectedIpoCode],
  );

  const ipcEntries = selectedIpoEntry?.ipcs || [];

  useEffect(() => {
    if (!ipcEntries.some((ipc) => ipc.ipcCode === selectedIpcCode)) {
      setSelectedIpcCode(ipcEntries[0]?.ipcCode || "");
    }
  }, [ipcEntries, selectedIpcCode]);

  const selectedIpcEntry = useMemo(
    () => ipcEntries.find((ipc) => ipc.ipcCode === selectedIpcCode) || null,
    [ipcEntries, selectedIpcCode],
  );

  const sections = useMemo(() => {
    const formKeys = selectedIpcEntry?.uqrForms || [];
    return formKeys
      .filter((formKey) => Boolean(formsConfig[formKey]))
      .map((formKey) => ({
        formKey,
        label: getFormDisplayName(
          formKey,
          formsConfig[formKey]?.title || formKey,
        ),
        savedAt: selectedIpcEntry?.savedAtByForm?.[formKey] || "",
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [selectedIpcEntry]);

  useEffect(() => {
    if (!sections.some((section) => section.formKey === selectedFormKey)) {
      setSelectedFormKey(sections[0]?.formKey || "");
    }
  }, [sections, selectedFormKey]);

  const selectedContext =
    selectedOrderType && selectedIpoCode && selectedIpcCode && selectedFormKey
      ? {
          orderType: selectedOrderType,
          ipoCode: selectedIpoCode,
          ipcCode: selectedIpcCode,
          formKey: selectedFormKey,
        }
      : null;

  const selectedContextKey = selectedContext
    ? getSectionContextKey(selectedContext)
    : "";
  const selectedFormConfig = selectedFormKey
    ? formsConfig[selectedFormKey]
    : null;
  const draftStorageKey = getDraftStorageKey(selectedContextKey);
  const selectedSavedAt =
    selectedIpcEntry?.savedAtByForm?.[selectedFormKey] || "";

  const isSectionFilled = (formKey) => {
    if (isDatabaseMode) return true;
    if (!selectedOrderType || !selectedIpoCode || !selectedIpcCode)
      return false;

    const contextKey = getSectionContextKey({
      orderType: selectedOrderType,
      ipoCode: selectedIpoCode,
      ipcCode: selectedIpcCode,
      formKey,
    });
    return Boolean(filledSections[contextKey]);
  };

  const handleSectionSubmitSuccess = () => {
    if (!selectedContext) return;
    const contextKey = getSectionContextKey(selectedContext);
    const nextFilledSections = {
      ...filledSections,
      [contextKey]: new Date().toISOString(),
    };
    setFilledSections(nextFilledSections);
    localStorage.setItem(
      UQR_FILLED_SECTIONS_KEY,
      JSON.stringify(nextFilledSections),
    );
    window.dispatchEvent(new Event("uqrFilledSectionsUpdated"));
  };

  const emptyIpoMessage = isDatabaseMode
    ? "No saved UQR forms available for this section."
    : "No IPOs available for this section.";
  const emptyIpcMessage = isDatabaseMode
    ? "No saved IPCs available for this IPO."
    : "No IPCs available for this IPO.";
  const emptySectionsMessage = isDatabaseMode
    ? "No saved UQR forms found for this IPO and IPC."
    : "No Quality inspection required";

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        zoom: 0.9,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        // Recolor the theme's pinkish --accent to a neutral grey for dropdown hover.
        "--accent": "#edeef1",
      }}
    >
      <div className="mx-auto flex max-w-[95%] flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isDatabaseMode ? "UQR Database" : "UQR Forms"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDatabaseMode
              ? "Browse all saved UQR forms using the same section, IPO, IPC, and form filters."
              : "Create and submit UQR forms using the existing section, IPO, IPC, and form flow."}
          </p>
        </div>

        {/* Filters */}
        <div className={CARD}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={LABEL}>Section</label>
              <ThemedSelect
                value={selectedOrderType}
                onChange={setSelectedOrderType}
                options={orderTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                isSearchable={false}
                placeholder="Select section"
              />
            </div>

            <div>
              <label className={LABEL}>IPO</label>
              <ThemedSelect
                value={selectedIpoCode}
                onChange={setSelectedIpoCode}
                options={ipoEntries.map((entry) => ({
                  value: entry.code,
                  label: entry.code,
                }))}
                placeholder="No IPOs"
              />
            </div>

            <div>
              <label className={LABEL}>IPC</label>
              <ThemedSelect
                value={selectedIpcCode}
                onChange={setSelectedIpcCode}
                options={ipcEntries.map((ipc) => ({
                  value: ipc.ipcCode,
                  label: ipc.ipcCode,
                }))}
                placeholder="No IPCs"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className={CARD}>
          <h2 className={SECTION_TITLE}>
            {isDatabaseMode ? "Saved UQR Forms" : "Quality Inspection Sections"}
          </h2>
          {ipoEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyIpoMessage}</p>
          ) : ipcEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyIpcMessage}</p>
          ) : sections.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {sections.map((section) => {
                const filled = isSectionFilled(section.formKey);
                const isActive = selectedFormKey === section.formKey;
                return (
                  <button
                    key={section.formKey}
                    type="button"
                    onClick={() => setSelectedFormKey(section.formKey)}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[#e2e3e8] bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{section.label}</span>
                    {filled && <Check className="h-3.5 w-3.5 text-green-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {emptySectionsMessage}
            </p>
          )}
        </div>

        {selectedFormConfig && selectedContext && (
          <div className={CARD}>
            {isDatabaseMode && (
              <div className="mb-4 rounded-md border border-[#e2e3e8] bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
                {`Showing saved record: ${formatSavedAt(selectedSavedAt)}`}
              </div>
            )}
            <BaseFormTemplate
              key={selectedContextKey}
              formId={selectedFormKey}
              title={selectedFormConfig.title}
              sections={selectedFormConfig.sections}
              tableConfig={selectedFormConfig.tableConfig}
              draftStorageKey={draftStorageKey}
              apiContext={{
                orderType: selectedOrderType,
                ipoCode: selectedIpoCode,
                ipcCode: selectedIpcCode,
              }}
              onSubmitSuccess={
                isDatabaseMode ? undefined : handleSectionSubmitSuccess
              }
              readOnly={isDatabaseMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UQRFormsPreview;
