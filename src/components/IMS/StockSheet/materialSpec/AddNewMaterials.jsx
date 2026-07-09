// "Add New" material editor for the StockSheet flow. Lets the user manually build
// materials (with full specification + advance specification) for the supported types,
// reusing the wizard's standalone pieces (TrimAccessoryFields, description generator,
// data/helpers, ui/ primitives) without touching Step2.
import { useEffect } from "react";
import { Layers, PackageOpen, Plus } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchableDropdown from "../../../GenerateFactoryCode/components/SearchableDropdown";
import TrimAccessoryFields from "../../../GenerateFactoryCode/components/TrimAccessoryFields";
import {
  UNIT_OPTIONS,
  UNIT_OPTIONS_WITH_PCS,
} from "../../../GenerateFactoryCode/constants/unitOptions";
import FabricSpecFields from "./FabricSpecFields";
import YarnSpecFields from "./YarnSpecFields";
import FoamSpecFields from "./FoamSpecFields";
import FiberSpecFields from "./FiberSpecFields";
import PackagingSpecFields from "./PackagingSpecFields";
import ArtworkSpecFields from "./ArtworkSpecFields";
import CompanyEssentialsSpecFields from "./CompanyEssentialsSpecFields";
import Reveal from "./Reveal";
import {
  applyMaterialChange,
  SPEC_ADVANCE_FLAG,
  CATEGORY_TO_MATERIAL_TYPE,
  SUPPORTED_CATEGORIES,
} from "./applyMaterialChange";

//just empty comment to restart the push again for re-deployment

const TRIM_OPTIONS = [
  "BUCKLES",
  "BUTTONS",
  "CABLE-TIES",
  "CORD STOPS",
  "FELT",
  "HOOKS-EYES",
  "INTERLINING(FUSING)",
  "MAGNETIC CLOSURE",
  "PIN-BARBS",
  "REFLECTIVE TAPES",
  "RINGS-LOOPS",
  "RIVETS",
  "SEAM TAPE",
  "SHOULDER PADS",
  "VELCRO",
  "NIWAR-WEBBING",
  "RIBBING",
  "LACE",
  "FIRE RETARDANT (FR) TRIMS",
  "ZIPPERS",
];

const makeBlankMaterial = (materialType, yarnSubMaterial = "") => ({
  materialType,
  materialDescription: "",
  unit: "",
  ...(materialType === "Yarn" ? { subMaterial: yarnSubMaterial } : {}),
  ...(materialType === "Trim & Accessory" ? { trimAccessory: "" } : {}),
  ...(materialType === "Packaging" ? { packagingMaterialType: "" } : {}),
  ...(materialType === "Artwork"
    ? {
        artworkCategory: "",
        material: "",
        permanence: "",
        adhesive: "",
        remarks: "",
      }
    : {}),
  ...(materialType === "CompanyEssentials"
    ? {
        ceCategory: "",
        department: "",
        item: "",
        itemDescription: "",
        machineType: "",
        componentSpec: "",
        qty: "",
        amount: "",
        unit: "",
        forField: "",
        remarks: "",
        referenceImage: null,
      }
    : {}),
});

const AddNewMaterials = ({
  category,
  materials,
  setMaterials,
  errors = {},
  subCategorySelected = true,
  yarnSubMaterial = "",
}) => {
  const materialType = CATEGORY_TO_MATERIAL_TYPE[category];
  const isSupported = SUPPORTED_CATEGORIES.includes(category);

  // Once a supported category (and sub-category, where applicable) is chosen, drop in the
  // first material automatically so the user lands straight on its inputs.
  useEffect(() => {
    if (!isSupported || !subCategorySelected) return;
    setMaterials((prev) =>
      prev.length === 0
        ? [makeBlankMaterial(materialType, yarnSubMaterial)]
        : prev,
    );
  }, [
    isSupported,
    subCategorySelected,
    materialType,
    yarnSubMaterial,
    setMaterials,
  ]);

  const updateMaterial = (index, field, value) => {
    setMaterials((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = applyMaterialChange(next[index], field, value);
      return next;
    });
  };

  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      makeBlankMaterial(materialType, yarnSubMaterial),
    ]);
  };

  const removeMaterial = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  // No materials to show yet (no category chosen, or Yarn's sub-category still pending):
  // show a friendly empty state rather than nothing.
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          No Items Added Yet
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Select a category above to begin. The item specifications will appear
          here so you can build your stock sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((material, index) => {
        const errorPrefix = `item_${index}`;
        const advanceFlag = SPEC_ADVANCE_FLAG[materialType];
        return (
          <Reveal key={index}>
            <div
              data-stocksheet-material-index={index}
              className="rounded-lg border border-[#e2e3e8] bg-card"
            >
              {/* Card header bar */}
              <div className="flex items-center justify-between rounded-t-lg border-b border-[#e2e3e8] bg-muted/60 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Layers className="h-4 w-4" />
                  </span>
                  <h4 className="text-md ml-1 font-bold text-foreground">
                    Items — {materialType}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Entry {index + 1}
                  </span>
                  {materials.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => removeMaterial(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                {/* Artwork & Company Essentials render their own header fields below. */}
                {materialType !== "Artwork" &&
                  materialType !== "CompanyEssentials" && (
                    <div className="ss-fgrid">
                      {/* Read-only generated description (click reveals the source fields) */}
                      <Field
                        label="MATERIAL DESCRIPTION"
                        width="lg"
                        error={errors[`${errorPrefix}_materialDescription`]}
                      >
                        <Input
                          type="text"
                          value={material.materialDescription || ""}
                          onChange={() => {}}
                          readOnly
                          onClick={() =>
                            advanceFlag &&
                            updateMaterial(index, advanceFlag, true)
                          }
                          title="Auto-generated from specifications — fill the fields below"
                          placeholder="Fill specifications below"
                          className="cursor-pointer bg-muted/40"
                          aria-invalid={
                            errors[`${errorPrefix}_materialDescription`]
                              ? true
                              : undefined
                          }
                        />
                      </Field>

                      {/* Unit (Packaging materials carry their own per-type dimension units) */}
                      {materialType !== "Packaging" && (
                        <Field
                          label="UNIT"
                          width="sm"
                          error={errors[`${errorPrefix}_unit`]}
                        >
                          <SearchableDropdown
                            value={material.unit || ""}
                            onChange={(value) =>
                              updateMaterial(index, "unit", value)
                            }
                            options={
                              materialType === "Trim & Accessory"
                                ? UNIT_OPTIONS_WITH_PCS
                                : UNIT_OPTIONS
                            }
                            placeholder="Select unit"
                            placeholderDim
                            className={
                              errors[`${errorPrefix}_unit`]
                                ? "border-destructive"
                                : ""
                            }
                          />
                        </Field>
                      )}
                    </div>
                  )}

                {/* Type-specific specification + advance spec */}
                {materialType === "Fabric" && (
                  <FabricSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Yarn" && (
                  <YarnSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Foam" && (
                  <FoamSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Fiber" && (
                  <FiberSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Packaging" && (
                  <PackagingSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Artwork" && (
                  <ArtworkSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "CompanyEssentials" && (
                  <CompanyEssentialsSpecFields
                    material={material}
                    materialIndex={index}
                    handleChange={updateMaterial}
                    errors={errors}
                    errorPrefix={errorPrefix}
                  />
                )}

                {materialType === "Trim & Accessory" && (
                  <div style={{ marginTop: "2rem" }}>
                    <div
                      className="flex flex-col"
                      style={{ width: 280, marginBottom: 20 }}
                    >
                      <label className="text-sm font-bold text-foreground mb-2">
                        TRIM/ACCESSORY{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <SearchableDropdown
                        value={material.trimAccessory || ""}
                        onChange={(value) =>
                          updateMaterial(index, "trimAccessory", value)
                        }
                        options={TRIM_OPTIONS}
                        placeholder="Select or type Trim/Accessory"
                        className={
                          errors[`${errorPrefix}_trimAccessory`]
                            ? "border-destructive"
                            : ""
                        }
                      />
                    </div>
                    <TrimAccessoryFields
                      material={material}
                      materialIndex={index}
                      handleChange={updateMaterial}
                      errors={errors}
                      errorPrefix={errorPrefix}
                    />
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
      <div>
        <button
          type="button"
          onClick={addMaterial}
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" /> Add material
        </button>
      </div>
    </div>
  );
};

export default AddNewMaterials;
