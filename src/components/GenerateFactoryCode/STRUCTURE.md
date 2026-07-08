# Generate Factory Code — module structure

A multi-SKU wizard for generating factory codes for textile/manufacturing orders.
One orchestrator owns **all** state and logic; the `Step*` files are presentational
views it renders by phase.

> Quick mental model: `GenerateFactoryCode.jsx` is the brain (state + handlers +
> validation + draft/save/hydrate). Everything under `components/steps/` is a dumb
> view that receives `formData`, `errors`, and handler props.

---

## 1. Flow / state machine

The orchestrator drives a `flowPhase` state. `currentStep` indexes the IPC sub-flow.

| `flowPhase`        | What renders                         | File                         | Heading                              |
|--------------------|--------------------------------------|------------------------------|--------------------------------------|
| `step0`            | Product / SKU spec                   | `components/steps/Step0.jsx` | PRODUCT SPEC                         |
| `ipcSelector`      | IPC picker (inline in orchestrator)  | —                            | —                                   |
| `ipcFlow` step 0   | BOM & WO (Bill of Material & WO)      | `components/steps/Step2.jsx` | PART-1 BOM & WO                     |
| `ipcFlow` step 1   | Artwork & Labeling                   | `components/steps/Step4.jsx` | PART-2 ARTWORK & LABELING          |
| `ipcFlow` step 2   | Cut & Sew spec                       | `components/steps/Step1.jsx` | PART-3 CUT & SEW SPEC              |
| `packaging`        | Packaging                            | `components/steps/Step5.jsx` | PACKAGING                           |

`ConsumptionSheet.jsx` is rendered as an **overlay** (read-only summary), not as a step.

> ⚠️ Naming note (reordered in "Change 3"): the ipcFlow order is now
> **BOM & WO → Artwork → Cut & Sew**, but the file names still read Step1/2/4.
> So **file number ≠ UI order**: `Step2`=step 0, `Step4`=step 1, `Step1`=step 2.
> There is no `Step3.jsx` (removed — see §5). The orchestrator's
> `step3Saved`/`handleSaveStep3` track the **artwork** step; `handleSaveStep1`/
> `step1Saved` track **Cut & Sew**; `handleSaveStep2`/`step2SavedComponents` track
> **BOM & WO**. See `Brain Flow ChangeIPC.md` §4 for the full mapping.

---

## 2. Form data shape (high level)

```
formData
├─ orderType, programName, ipoCode, ipoId, poSrNo, type, buyerCode
├─ skus[]                       ← Step 0
│   ├─ sku, product, setOf, poQty, overagePercentage, deliveryDueDate, image
│   ├─ subproducts[]            ← same shape as an sku (nested)
│   └─ stepData                 ← per-SKU wizard data
│       ├─ products[].components[]   ← Step 1 (cut & sew)
│       ├─ rawMaterials[]            ← Step 2 (BOM, each with workOrders[])
│       ├─ consumptionMaterials[]    ← (consumption; see §5)
│       ├─ artworkMaterials[]        ← Step 4 (artwork, one of 17 categories each)
│       ├─ packaging                 ← Step 5 (materials[] + extraPacks[])
│       └─ ipcSavedState, rawSavedComponents
└─ products / rawMaterials / artworkMaterials / packaging  ← top-level working copy
```

The orchestrator keeps a top-level working copy and merges it into the currently
selected SKU's `stepData` via `getMergedFormData()` / `updateSelectedSkuStepData()`.

---

## 3. Directory map

```
GenerateFactoryCode/
├─ index.jsx                      re-export
├─ GenerateFactoryCode.jsx        orchestrator: state, handlers, validation,
│                                 draft localStorage, image compression,
│                                 backend save/hydrate, render switch
├─ STRUCTURE.md                   this file
├─ components/
│   ├─ steps/
│   │   ├─ Step0.jsx              product / SKU spec
│   │   ├─ Step1.jsx              cut & sew spec
│   │   ├─ Step2.jsx              BOM & WIP  (material types + work orders)
│   │   ├─ Step4.jsx              artwork & labeling (17 categories)
│   │   └─ Step5.jsx              packaging
│   ├─ ConsumptionSheet.jsx       read-only consumption summary (overlay)
│   ├─ SearchableDropdown.jsx     shared dropdown w/ search + custom values
│   ├─ UnitDropdown.jsx           CM / KGS / PCS
│   ├─ WorkOrderDateFields.jsx    start / completion date inputs
│   ├─ QualityVerificationToggle.jsx
│   ├─ ValidationErrorsDialog.jsx
│   ├─ TrimAccessoryFields.jsx          trim/accessory type-specific fields (20 types)
│   ├─ TrimAccessoryAdvancedSpecs.jsx   per-trim "advanced spec" sub-forms
│   ├─ PackagingMaterialTypeFields.jsx  packaging material type-specific fields
│   ├─ rawMaterials/                    Step 2 per-material-type spec blocks (split out)
│   │   ├─ FabricSpec.jsx               "Fabric" material spec
│   │   ├─ YarnSpec.jsx                 "Yarn" (non-stitching) spec
│   │   ├─ StitchingThreadSpec.jsx      "Yarn → Stitching Thread" spec
│   │   ├─ FoamSpec.jsx                 "Foam" — table-type selector + dispatch to foamTypes/
│   │   ├─ FiberSpec.jsx                "Fiber" — table-type selector + dispatch to fiberTypes/
│   │   └─ specConstants.js             shared testing-requirement option lists
│   ├─ foamTypes/                       8 foam table-type blocks (Foam*.jsx, one each)
│   ├─ fiberTypes/                      7 fiber table-type blocks (Fiber*.jsx, one each)
│   ├─ workOrders/                      Step 2 work-orders block (split out)
│   │   ├─ WorkOrdersSection.jsx        WORK ORDERS list + add (15 WO types — still large)
│   │   └─ workOrderHelpers.js          isSimpleRequirementWorkOrder()
│   └─ artwork/                         Step 4 spec blocks (split out — 25 short files)
│       ├─ Category*.jsx                17 artwork-category blocks (one per category)
│       ├─ AdvFilter*.jsx               8 advanced-filter blocks (one per category)
│       ├─ MultiSelectDropdown.jsx      chip-style multi-select used by the blocks
│       └─ artworkConstants.js          ARTWORK_QTY_UNIT_OPTIONS
├─ constants/
│   └─ unitOptions.js
├─ data/                          ~45 lookup/option files (see §4)
└─ utils/                         pure helpers + 1 hook (see §4)
```

---

## 4. data/ and utils/

**`data/`** — option lists and lookup tables, grouped by domain:
- Textile/fiber: `textileFabricData.js` (largest), `textileFiberData.js`,
  `fabricData.js`, `textileFabricHelpers.js`, `textileFiberData` query helpers.
- Processes (work orders): `dyeing`, `printing`, `weaving`, `knitting`, `sewing`,
  `embroidery`, `tufting`, `quilting`, `braiding`, `carpet`, `cutting` `*Data.js`.
- Artwork/labels: `labelsBrand`, `careComposition`, `lawLabel`, `sizeLabels`,
  `tagsSpecialLabels`, `hangTagSeals`, `priceTicket`, `headerCards`, `insertCards`,
  `heatTransfer`, `antiCounterfeit`, `upcBarcode`, `rfidSecurity`, `bellyBand`,
  `qcInspection`, `flammabilitySafety`, `ribbons` `*Data.js`.
- Misc: `approvalOptions.js`, `advancedFilterData.js`, `productSubproductData.js`.

**`utils/`**
- `initializers.js` — build initial `rawMaterials` / `consumptionMaterials` rows.
- `calculations.js` — wastage + gross-consumption math.
- `yarnHelpers.js` — query helpers over `textileFiberData`.
- `materialDescription.js` — single source of truth for the auto-generated
  "MATERIAL DESC" strings (fabric/yarn/foam/fiber/trim, artwork, packaging).
- `wizardPayload.js` — transform `formData` → backend wizard API payload.
- `hydrateFromCommitted.js` — load committed factory codes back into draft state.
- `useMaterialOptions.js` — hook for tenant-scoped custom dropdown options.

---

## 5. Cleanup history (dead/commented code removed)

- **Deleted `components/steps/Step3.jsx`** — was imported but never rendered;
  ~4,900 lines, ~4,600 of which were already dead (`{false && ...}`).
- **`Step4.jsx`** — removed a ~7,227-line commented-out **old duplicate** of the
  whole component at the top of the file, plus two live `{false && (...)}` JSX gates.
  (14,512 → ~7,078 lines.)
- **`GenerateFactoryCode.jsx`** — removed unused imports and ~13 orphaned
  functions/handlers (the consumption step's handlers, `addProduct`/`removeProduct`,
  unused packaging handlers, etc.) plus an unused state hook. (~6,671 → ~5,853 lines.)
- **`ConsumptionSheet.jsx`** — removed ~10 orphaned helper functions + a
  commented-out function.
- **Step2 / Step5 / PackagingMaterialTypeFields** — removed unused imports and
  dead local helpers.

Validator: `npm run build` (vite) is green after every removal. There is no git
in this folder, so the build is the safety net for this cleanup.

### Intentionally kept (flagged by lint but not dead)
- `saveMessage`, `shippingGroups` — value unused but their setters are still called.
- Unused **props** (`validateStep2`, `addExtraPack`, `handleNext`, `showSaveMessage`)
  — kept to preserve component prop contracts.
- Unused catch/param bindings (`error`, `label`, `isFromStepData`, `placeholder`).

---

## 6. Refactor progress

### Step2 — DONE (11,673 → ~800 lines)
Step2.jsx is now a thin dispatcher. The per-material-type spec blocks and the
work-orders block were extracted into `components/rawMaterials/` and
`components/workOrders/` (see §3). Verified by `npm run build` + eslint
`no-undef`/`jsx-no-undef` after every step (the latter matters: esbuild does NOT
error on an undefined JSX component, so a missing child import is a *runtime*
crash — always confirm each extracted child is imported by the parent).

Second-level split — DONE for Foam & Fiber:
- `FoamSpec.jsx` 3.3k → ~420 (selector + dispatch); 8 blocks in `foamTypes/`.
- `FiberSpec.jsx` 4.1k → ~250 (selector + dispatch); 7 blocks in `fiberTypes/`.

`WorkOrdersSection.jsx` (~2.6k) is intentionally NOT split by type: its per-type
conditionals (`workOrder.workOrder === 'X'`) are scattered and repeated across the
work-order card (e.g. KNITTING and BRAIDING each appear in two separate sections,
interleaved) — ~23 gates for ~12 types, not contiguous. A clean per-type split
would require restructuring the card itself, which is unsafe without runtime
tests. Left as one focused file.

### Step4 — DONE (7,078 → ~690 lines)
Step4.jsx is now a thin dispatcher. The 17 artwork-category blocks and 8
advanced-filter blocks were extracted to `components/artwork/` (one short file
each, ~115–360 lines), plus `MultiSelectDropdown.jsx` and `artworkConstants.js`.
Verified by `npm run build` + eslint `no-undef`/`jsx-no-undef` with all files
reachable. Every child is imported by Step4 (confirmed by grep — see the esbuild
caveat above).

---

## 7. WorkOrdersSection — developer guide

File: `components/workOrders/WorkOrdersSection.jsx` (~2.6k lines, one focused file
— see "Why one file" below). Rendered once per raw material (from `FabricSpec` /
`YarnSpec` / `FoamSpec` / `FiberSpec` etc. via Step 2). Helper:
`components/workOrders/workOrderHelpers.js` → `isSimpleRequirementWorkOrder()`.

### Props & conventions
```
material               the raw-material row (holds material.workOrders[])
materialIndex          its index within the selected component's filtered list (used in element ids)
actualIndex            its index in formData.rawMaterials (used in handlers + error keys)
errors                 validation errors map
handleWorkOrderChange  (actualIndex, woIndex, field, value) => void   ← all field writes
addWorkOrder           (actualIndex) => void
removeWorkOrder        (actualIndex, woIndex) => void
```
- Every field reads `workOrder.<field>` and writes via
  `handleWorkOrderChange(actualIndex, woIndex, '<field>', value)`.
- Every error key is `` errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_<field>`] ``.
- The component maps over `material.workOrders` with `(workOrder, woIndex)`.

### Anatomy of one work-order card (top → bottom)
Line numbers drift; the **grep anchors** in parentheses are stable.
1. Card header + Remove button (`WORK ORDER {woIndex + 1}`).
2. **WORK ORDER type selector** — `SearchableDropdown` over
   `RAW_MATERIAL_WORK_ORDER_OPTIONS` (anchor: `'workOrder', selectedValue`). Setting
   this drives everything below.
3. **WASTAGE %** — negative-gated: hidden for KNITTING/PRINTING/QUILTING/SEWING/
   TUFTING/WEAVING/FRINGE-TASSELS and for simple work orders, because those render
   their own wastage (anchor: `WASTAGE % <span`, the `!== 'KNITTING'` chain).
4. **Conditional fields container** — `{workOrder.workOrder && ( <div flex-wrap> … )}`.
   Inside, fields fall into FIVE categories (this is the key mental model):

   | Category | Gate shape | Examples | Where it lives |
   |---|---|---|---|
   | **Simple-requirement** | `isSimpleRequirementWorkOrder(wo)` | "Is this required?" toggle | one block near top (anchor `Is this required?`) |
   | **Positive-shared** | `['WEAVING','TUFTING','KNITTING','EMBROIDERY','BRAIDING','CARPET','CUTTING'].includes(wo)` | MACHINE TYPE / TOOL TYPE | one block (anchor `.includes(workOrder.workOrder)`) |
   | **Per-type** | `workOrder.workOrder === 'X'` | strand count, gauge, dyeing colour ref… | **scattered** — most types have a "main" block and a later "advanced" block |
   | **Negative-shared** | `wo !== 'A' && wo !== 'B' && … ` | Image Upload / DESIGN REF fallback | interleaved among the per-type blocks (anchor `!== 'CUTTING' && workOrder.workOrder !== 'BRAIDING'`) |
   | **Trailing-shared** | always (inside the container, after all per-type blocks) | `QualityVerificationToggle` + `WorkOrderDateFields` (start/completion dates) | end of container |
5. **Add Work Order** button (anchor `+ Add Work Order`).

### Work-order types and their data sources
12 complex types, each backed by a `../../data/<x>Data.js` file (option lists +
`get*` helper fns), plus "simple" types (Testing Requirement + Approval only):

| Type | Data file | Key helpers |
|---|---|---|
| BRAIDING | `braidingData.js` | getBraidingVariants/Designs/PatternType/StrandCount/WidthDiameter |
| CARPET | `carpetData.js` | getCarpetVariants/Designs, KNOT_TYPE_OPTIONS |
| CUTTING | `cuttingData.js` | getCuttingVariants/CutTypes, NESTING_OPTIONS |
| DYEING | `dyeingData.js` | getDyeingColorRefOptions/ReferenceTypeOptions/Variants, isShrinkageWidth/LengthApplicable |
| EMBROIDERY | `embroideryData.js` | getEmbroidery* |
| KNITTING | `knittingData.js` | getKnitting* |
| PRINTING | `printingData.js` | getPrinting* |
| QUILTING | `quiltingData.js` | getQuilting* |
| SEWING | `sewingData.js` | getSewing*, SEWING_THREAD_TYPE_OPTIONS |
| TUFTING | `tuftingData.js` | getTufting* |
| WEAVING | `weavingData.js` | getWeaving* |
| FRINGE/TASSELS | (inline in the component) | — large block, has its own sub-variants |

Approval options: `MATERIAL_APPROVAL_OPTIONS` + each type's `*_APPROVAL_OPTIONS`.
The set of selectable work orders + which count as "simple" live in
`@/utils/workOrderOptions` (`RAW_MATERIAL_WORK_ORDER_OPTIONS`,
`SIMPLE_REQUIREMENT_WORK_ORDERS`).

### Recipe: fix a bug in an existing type
1. `grep -n "workOrder.workOrder === 'TYPE'" WorkOrdersSection.jsx` — a type usually
   has **two** matches (main fields, then an advanced/extra section). Check both.
2. Field value comes from `workOrder.<field>`; the write is the matching
   `handleWorkOrderChange(actualIndex, woIndex, '<field>', …)`. The validation message
   keys off `` `rawMaterial_${actualIndex}_workOrder_${woIndex}_<field>` ``.
3. Option lists come from that type's `../../data/<x>Data.js` — fix data there, not
   in the JSX.

### Recipe: add a NEW work-order type
1. Add the type's label to `RAW_MATERIAL_WORK_ORDER_OPTIONS` in
   `@/utils/workOrderOptions` (and to `SIMPLE_REQUIREMENT_WORK_ORDERS` if it only
   needs Testing Requirement + Approval).
2. If it has machine/tool selection, add the label to the **positive-shared**
   `.includes([...])` array (anchor at category table above) and extend the
   machine-type option ternary.
3. Create `../../data/<newType>Data.js` (mirror an existing one) and import its
   option lists / `get*` helpers at the top of WorkOrdersSection.
4. Add a per-type block `{workOrder.workOrder === 'NEW TYPE' && ( … )}` inside the
   conditional-fields container, after the positive-shared MACHINE TYPE block. Use
   the same `<Field>` + `handleWorkOrderChange` + error-key conventions.
5. If the type should NOT show a shared field (e.g. the generic Image Upload), add
   its name to that field's negative-gate `!==` chain.
6. Initialize any new `workOrder.<field>` defaults in `utils/initializers.js` if the
   field must exist up-front, and map it for the backend in `utils/wizardPayload.js`
   (`sanitizeWorkOrder`).
7. Run `npm run build` (must pass) and
   `eslint WorkOrdersSection.jsx` (no `no-undef`).

### Why this file is NOT split into one file per type (do not auto-split)
A mechanical per-type split was attempted and reverted. The blocker: the per-type
blocks are **interleaved with negative-gated shared fields** (e.g. the Image Upload
gated by `wo !== 'CUTTING' && wo !== 'BRAIDING' && …`, rendered for most types) and
a positive-shared MACHINE TYPE field. Because a type's two fragments are separated
by these shared fields, any "grab everything between this type's gate and the next"
extraction wrongly swallows the shared fields into one type's component (breaks the
build / traps a shared field under one type). A safe split would first require
hand-lifting ALL shared fields (positive, negative, simple, trailing) into the
parent so each type's fragments become truly contiguous — a manual refactor best
done with the app running. Until then, keep this as one file.
