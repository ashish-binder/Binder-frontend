# Brain Flow — ChangeIPC

Working document for the upcoming changes to **IPC code creation**, **IPO / IPC
management**, and the **IPC spec** flow inside `GenerateFactoryCode/`.

Purpose: this is the "brain" we align against while we rename steps and realign
the flows. §1–§4 capture the **current** behavior (baseline, verified against the
code). §5 is the running **change log** — we fill it as we decide/apply changes.

> Companion doc: `STRUCTURE.md` (module/file map). This doc is about the **flow**,
> not the file layout. No git in this folder — `npm run build` is the safety net.

---

## 1. The three flows, in one picture

```
   ┌────────────┐   create SKUs/IPCs    ┌───────────────┐   pick one IPC   ┌──────────────┐
   │   step0    │ ───────────────────▶  │  ipcSelector  │ ───────────────▶ │   ipcFlow    │
   │ PRODUCT    │                       │  (IPC manage) │ ◀─────────────── │ (IPC spec)   │
   │ SPEC       │ ◀──────────────────── │               │   save & close   │ 3 sub-steps  │
   └────────────┘                       └───────┬───────┘                  └──────────────┘
                                                │ all IPCs complete
                                                ▼
                                        ┌──────────────┐
                                        │  packaging   │
                                        └──────────────┘
```

The orchestrator (`GenerateFactoryCode.jsx`) drives everything with two state vars:

- `flowPhase` — `'step0' | 'ipcSelector' | 'ipcFlow' | 'packaging'` ([:236](GenerateFactoryCode.jsx#L236))
- `currentStep` — index **inside** `ipcFlow` (0/1/2) ([:234](GenerateFactoryCode.jsx#L234))

`ipcFlowTotalSteps = 2`, labels = `['BOM & WO', 'Artwork & Labeling', 'Cut & Sew Spec']`
(reordered — Change 3) ([:956](GenerateFactoryCode.jsx#L956)).

---

## 2. Flow A — IPC **code creation** (`step0`)

Screen: `components/steps/Step0.jsx` (heading **PRODUCT SPEC**).

- User defines `formData.skus[]` — each SKU = one IPC; each SKU can have
  `subproducts[]` (rendered as `/SP-n` children).
- IPC codes are assigned on save (`handleSaveStep1`, [:2998](GenerateFactoryCode.jsx#L2998)):
  - Product: `CHD/{buyerCode}/PO-{poSrNo}/IPC-{ipcNumber}`
  - Subproduct: `{parentIpcCode}/SP-{n}`
- `Duplicate IPC` clones an SKU + all its data, bumping the IPC number and re-suffixing
  subproducts ([:1334](GenerateFactoryCode.jsx#L1334)).
- **Next** from `step0` → sets `flowPhase = 'ipcSelector'` ([:4544](GenerateFactoryCode.jsx#L4544)).

---

## 3. Flow B — IPO / IPC **management** (`ipcSelector`)

Screen: `renderIPCSelectorScreen()` ([:4677](GenerateFactoryCode.jsx#L4677)) — inline in the
orchestrator, no separate file. Heading **"Select SKU to proceed"**.

- Lists every IPC item = each SKU (`product_{idx}`) + each subproduct
  (`subproduct_{idx}_{spIdx}`).
- Per-IPC completion badges come from `getNormalizedIpcSavedState()` ([:1507](GenerateFactoryCode.jsx#L1507)),
  three flags: **Cut & Sew** (`cut`), **BOM & WIP** (`raw`), **Artwork** (`artwork`).
- Row actions: open the IPC (→ `ipcFlow`, `currentStep=0`), **Duplicate IPC**, **Remove IPC**.
- **Proceed to Packaging →** is gated: every IPC must have `cut && raw && artwork`
  or it shows *"Fill all IPCs … to continue for packaging"* and blocks ([:4796](GenerateFactoryCode.jsx#L4796)).

---

## 4. Flow C — IPC **spec** (`ipcFlow`) — the per-IPC sub-wizard

3 sub-steps indexed by `currentStep`. **Order reordered in Change 3.** Note the
**file-number vs UI-order mismatch** is now even stronger — the file names no
longer hint at position:

| `currentStep` | UI label / heading              | File                         | Saved-state flag | Save handler        |
|---------------|---------------------------------|------------------------------|------------------|---------------------|
| `0`           | BOM & WO / **PART-1**           | `components/steps/Step2.jsx` | `raw`            | `handleSaveStep2` ([:2878](GenerateFactoryCode.jsx#L2878)) |
| `1`           | Artwork & Labeling / **PART-2** | `components/steps/Step4.jsx` | `artwork`        | `handleSaveStep3` ([:2918](GenerateFactoryCode.jsx#L2918)) |
| `2`           | Cut & Sew Spec / **PART-3**     | `components/steps/Step1.jsx` | `cut`            | `handleSaveStep1` ([:3035](GenerateFactoryCode.jsx#L3035)) |

> ⚠️ Legacy naming traps — do **not** "fix" casually, they're wired throughout:
> - File ≠ order: `Step2`=1st, `Step4`=2nd, `Step1`=3rd. There is no `Step3.jsx`.
> - `handleSaveStep3` / `step3Saved` track the **artwork** step (now step 1).
> - The `ipcSavedState` key for artwork is `artwork`, Step2's is `raw`, Step1's is `cut`.
> - `handleSaveStep1` = Cut & Sew (now last); `handleSaveStep2` = BOM (now first).

### Navigation inside `ipcFlow` (`handleNext` [:4428](GenerateFactoryCode.jsx#L4428), `handlePrev` [:4558](GenerateFactoryCode.jsx#L4558))
- Each step is **save-gated**: Next blocks with "Save first" until the step's
  saved flag is true (`step1Saved` / all components in `step2SavedComponents` /
  `step3Saved`).
- Next from `currentStep 2` (artwork, last) → back to `ipcSelector`.
- Prev from `currentStep 0` → back to `ipcSelector`.
- The **X / close** button (`renderStepCloseButton` [:4821](GenerateFactoryCode.jsx#L4821)) saves and
  returns to `ipcSelector` from any step.
- Left vertical progress bar (`renderVerticalProgressBar` [:4839](GenerateFactoryCode.jsx#L4839)) shows the
  3 dots — **only** in `ipcFlow`. The SKU selector strip is **hidden** in `ipcFlow`
  ([:5136](GenerateFactoryCode.jsx#L5136)).

### Data plumbing
- All step edits go into a **top-level working copy** (`formData.products`,
  `.rawMaterials`, `.artworkMaterials`, `.packaging`) and are merged into the
  selected SKU's `stepData` via `getMergedFormData()` ([:4633](GenerateFactoryCode.jsx#L4633)) /
  `updateSelectedSkuStepData()`.
- `selectedSku` = the IPC item id (`product_0`, `subproduct_1_0`, …). `parseSelectedSku()`
  resolves it to `{ type, skuIndex, subproductIndex }`.

---

## 5. Change log — ChangeIPC (fill as we go)

> Format per change: **What / Why / Touch points / Status**. Keep §1–§4 updated
> when a change lands so the baseline never drifts.

### Change 1 — Move COMPONENT + ASSIGN PLACEMENT to Product Spec — ✅ DONE
**What:** On the **Product Spec page (Step0)**, each SKU *and* each subproduct now
has a **Components** list — rows of **COMPONENT** + **ASSIGN PLACEMENT**
(dropdown-or-type-to-save, both required, chosen independently). Previously
components were named only later in Cut & Sew.

**Why:** Assign a component's placement at the moment it's named (business rule:
"at the time of component naming, placement should be assigned").

**Data model (single source of truth):** entries live in
`<entity>.stepData.products[0].components[]` — the **same array Cut & Sew reads**,
so Step0 entries **pre-fill** that step automatically. Component name =
`productComforter`; placement = new `placement` field.

**DB safety:** No schema change. The backend payload already serialized
component `name` + `placement` (`utils/wizardPayload.js` → `sanitizeComponent`,
`c.placement ?? ''`). Pre-existing records simply had `placement = ''`; the new
UI just fills it. Additive only — nothing pre-existing breaks.

**Touch points:**
- `data/componentPlacementData.js` — NEW: `COMPONENT_NAME_OPTIONS`,
  `PLACEMENT_OPTIONS`.
- `GenerateFactoryCode.jsx` — added `placement: ''` to the component shape (initial
  formData, `getInitialStepData`, `addComponent`); new handlers
  `makeEmptyComponent` / `updateStep0Components` / `handleStep0ComponentChange` /
  `addStep0Component` / `removeStep0Component` (+ `step0ComponentErrorKey`);
  `validateStep0` now requires component + placement per SKU and per subproduct;
  passed the 3 new handlers to `<Step0>`.
- `components/steps/Step0.jsx` — `useMaterialOptions()` for type-to-save tenant
  persistence (materialType `Component`, fieldKeys `component`/`placement`);
  `renderComponentsSection(skuIndex, subproductIndex)` rendered on the SKU card
  (before Subproducts) and on each subproduct card (after its image).

**Error-key convention:** SKU → `sku_{i}_component_{c}_{field}`; subproduct →
`subproduct_{i}_{s}_component_{c}_{field}` (field = `productComforter`|`placement`).

**Verified:** `npm run build` green; eslint shows no new `no-undef`/`jsx-no-undef`
(only the 3 pre-existing intentional unused vars).

> Note: Cut & Sew (Step1) still shows the NAME field editable and does not yet
> surface placement — the components simply arrive pre-named/pre-placed. Surfacing
> placement (read-only) in Cut & Sew is a possible follow-up if wanted.

### Change 2 — Add RECEIVED / PROCESS / DISPATCH UNIT to each work order — ✅ DONE
**What:** Every work order in **BOM & WO** (Step2 → `WorkOrdersSection.jsx`) now has
three unit dropdowns — **RECEIVED UNIT**, **PROCESS UNIT**, **DISPATCH UNIT** —
shown for all WO types, right under the WO type/wastage row. Options:
`Yardage (CM)`, `PCS`, `KGS` (fixed list, `strictMode`); **empty default**;
**optional** (no validation yet).

**Why:** Capture per-WO WIP units (received/processed/dispatched) — from the
"BOM & WO" spec image.

**Scope note:** Chose "only add units" — did NOT hide the CUTTING/SEW spec fields
or add the "fill in Cut & Sew" note (deferred). REMARKS, per-component grouping,
raw material, WO types, and SAVE already existed.

**DB safety:** No payload change. `utils/wizardPayload.js → sanitizeWorkOrder`
spreads `{ ...wo }`, so `receivedUnit`/`processUnit`/`dispatchUnit` flow to the
backend automatically. Additive; old WOs read as `''`.

**Touch points:**
- `constants/unitOptions.js` — NEW `WORK_ORDER_UNIT_OPTIONS`.
- `components/workOrders/WorkOrdersSection.jsx` — import + 3 unit `<Field>`s after
  the type/wastage row. Error keys:
  `rawMaterial_{actualIndex}_workOrder_{woIndex}_{receivedUnit|processUnit|dispatchUnit}`
  (reserved; not enforced yet).
- `utils/initializers.js` + `GenerateFactoryCode.jsx` (`addWorkOrder`) — seed the 3
  fields as `''` in the WO shape.

**Verified:** `npm run build` green; no `no-undef`.

### Change 3 — Rename BOM & WIP → BOM & WO, reorder flow, CUTTING/SEW note — ✅ DONE
**What (three parts):**
1. **Rename** BOM & WIP → **BOM & WO** everywhere (label, headings, selector badge,
   selector subtitle, packaging-gate message, progress-bar two-line label).
2. **Reorder** the ipcFlow sub-steps: **0 = BOM & WO, 1 = Artwork & Labeling,
   2 = Cut & Sew Spec** (was Cut → BOM → Artwork). PART headings renumbered:
   Step2 = PART-1, Step4 = PART-2, Step1 = PART-3.
3. **CUTTING / SEWING work orders** in BOM & WO now hide their detailed spec and
   show a note *"Please fill the Cutting/Sewing Spec details in the CUT & SEW
   Section…"* + REMARKS + the unit triplet only.

**Why:** Components are named in Product Spec now (Change 1), so BOM & WO can come
first; Cut & Sew (dimensions) moves last. Cutting/sewing spec lives in Cut & Sew.

**How the reorder was done (single indirection was NOT used — surgical remap):**
`currentStep` still 0/1/2, but each index's meaning was remapped in the 4 places
that branch on it:
- `handleNext` ipcFlow gates ([:4536](GenerateFactoryCode.jsx#L4536)) — 0=BOM save-check, 1=artwork `step3Saved`+`validateStep4`, 2=cut `step1Saved`+`validateStep1`.
- Render switch ([:5015](GenerateFactoryCode.jsx#L5015)) — case 0→`<Step2>`, 1→`<Step4>`, 2→`<Step1>`.
- Nav buttons — artwork Save-nav gated to `currentStep === 1`; BOM/Cut (identical Prev+Next) to 0 / 2.
- Progress bar + `ipcFlowStepLabels` reordered; selector badges reordered.
`handlePrev`, the save-state restore effect, and the packaging gate are
order-independent (keyed by `cut`/`raw`/`artwork` names), so untouched.

**CUTTING/SEW note mechanics (safe — no touching the scattered per-type blocks):**
In `WorkOrdersSection.jsx`: the whole spec container gate now excludes
`'CUTTING'`/`'SEWING'`; a new note+REMARKS block renders for those two instead;
WASTAGE also hidden for `'CUTTING'`. Save-gate validators (`validateStep2` /
`validateComponentMaterials`) only check **material-level** fields, not WO spec
fields, so hiding them does not block save. (`validateField`'s Tool/Machine-Type
requirement is on-blur only and never fires for hidden fields.)

**DB safety:** Pure UI/flow reorder + text. No data-shape or payload change.
Per-IPC `stepData` and saved-state keys (`cut`/`raw`/`artwork`) unchanged.

**Touch points:** `GenerateFactoryCode.jsx` (labels, `handleNext`, render switch,
nav buttons, progress bar, selector badges/subtitle/gate text); `Step1.jsx` /
`Step2.jsx` / `Step4.jsx` (PART headings + BOM & WO name);
`WorkOrdersSection.jsx` (container gate, note+REMARKS block, wastage gate).

**Verified:** `npm run build` green; no `no-undef`/`jsx-no-undef`.

> Follow-ups still open: should the 3 WO unit fields be **required**? Should Cut &
> Sew (now last) surface component **placement** (read-only)?

---

## 6. Backend persistence model (verified — READ THIS before adding fields)

The wizard has **two persistence layers with different fidelity**:

1. **Draft** — `FactoryCodeDraft.payload` (a single `JSONField`), endpoint
   `PUT/GET ims/factory-codes/draft/?ipo_id=`. Stores the **entire** wizard payload
   verbatim (all `skus/stepData/products/components/rawMaterials/...`). **Lossless** —
   any new frontend field auto-persists here, no backend change. The wizard
   **rehydrates from the draft**, so for the IPC-Spec UX (fill → save → reopen) the
   draft is what matters. Adding fields here **cannot break the DB** (schema-free JSON).
2. **Committed relational rows** — `Component` / `RawMaterial` / `WorkOrder` tables,
   written by `FactoryCodeWizardCreateSerializer.create()` on final submit. **Strict
   whitelist**: a field persists only if it's (a) declared on the Create serializer
   AND (b) explicitly copied to a column or into the JSONField by hand. Unknown fields
   are **silently dropped** on commit.

Consequences for our changes:
- **Change 1 (component `placement`)** — ✅ persists on BOTH layers. Committed path
  stores it in `Component.specifications` JSON (`_build_component_kwargs`,
  `serializers.py:2430`).
- **Change 2 (WO `receivedUnit`/`processUnit`/`dispatchUnit`)** — ⚠️ persists in the
  **draft only**. On commit they are **dropped** (not columns, not in
  `process_specific_data`, not whitelisted). To land them in committed rows, the
  backend `WorkOrderCreateSerializer` + `process_specific_data` builder must be edited.

Backend files: `inventory_management/serializers.py`
(`FactoryCodeWizardCreateSerializer` ~3650, `_build_component_kwargs` ~2430,
`ComponentCreateSerializer` ~2409, `WorkOrderCreateSerializer` ~2509),
`inventory_management/views.py` (`wizard` ~1998, `draft` ~2179),
`inventory_management/models.py` (`Component` 2330, `WorkOrder` 2447, `FactoryCodeDraft` 3801).

**None** of these exist yet in the backend: cutting-process, isolation/club grouping,
stitching-line, per-WO cut size (L/W/unit/wastage).

---

## 7. Change 4 (planned) — Cut & Sew → "Cut, Sew & Finishing"

Rename `Cut & Sew` → **Cut, Sew & Finishing**; 3 parts, each with sub-sections:
- **Cutting** — Section-1 `CUTTING` (spec), Section-2 `CUTTING PROCESS` (isolation/club)
- **Sewing** — Section-1 `SEWING`, Section-2 `SEWING PROCESS`  *(later)*
- **Finishing** — 1 section  *(later)*

Scope now = **Cutting, both sections** (Sewing/Finishing later).

**Cutting Section-1 (`CUTTING` spec):** pick a component → for each of its **CUTTING**
work orders (defined in BOM & WO): show **FETCHED** received/process/dispatch unit +
material (read-only, from BOM), and capture **CUT SIZE** (L, W, unit, wastage %) +
specs/advanced-filter tables. Save = complete details for all components.

**Cutting Section-2 (`CUTTING PROCESS`):** two modes —
- **ISOLATION**: each selected component/placement processed separately; a component
  picked here is **inactive** in Club; components with complete saved details show
  **Active**, others **Inactive**.
- **CLUB**: select multiple components/placements to process together.
- Button **"Save & Forward to Stitching Line"** = **navigate to the Sewing section**
  (next category) — not an external module.

**Storage decision (DB-safe):** store all new Cutting data in `stepData` (draft JSON,
lossless) → the feature works end-to-end with **zero DB risk**. Committed-relational
persistence (backend serializer + optional migration for cut-size / units / process)
is a deliberate **Phase B** follow-up.

### Change 4 · Phase A — Cutting + Sewing (both sections each), frontend — ✅ DONE
Step1 (`components/steps/Step1.jsx`) is a **tabbed shell** — title `PART-3 CUT, SEW &
FINISHING`, tabs **Cutting | Sewing | Finishing** (`activeTab`) with a **step-level
Save** in the tab bar. Each of Cutting & Sewing has a Section toggle
(`spec` | `process`) rendered by two **generic, shared** components:

- `components/cutting/SpecSection.jsx` — pick a component → its work orders of
  `woType` (`CUTTING` or `SEWING`, from BOM & WO) each show FETCHED (RO)
  received/process/dispatch unit + material, and capture size
  `${prefix}Length/Width/Unit/Wastage` (`cut*` / `sew*`) via
  `handleWoSpecChange(actualIndex, woIndex, field, value)`; "Specs & advanced filter
  tables" placeholder below.
- `components/cutting/ProcessSection.jsx` — ISOLATION/CLUB toggle; single assignment
  per component per `kind` (`cutting`/`sewing`) via `setProcessAssignment(kind,
  componentName, mode)` (picked in one mode → greyed in the other); Active/Inactive =
  all its `woType` WOs have size filled; placements from Product Spec (Change 1).
  **Save & Forward** button saves the step then advances the tab (Cutting→Sewing,
  Sewing→Finishing).

**Finishing** tab = placeholder. The legacy per-component GSM/cut/sew-size form was
**removed** (superseded by per-WO spec); `validateStep1` is now **lenient** (returns
valid) so Save is never blocked — per-WO size validation can be tightened later.

**Data (draft-backed, DB-safe):**
- WO shape gained `cutLength/cutWidth/cutUnit/cutWastage` **and**
  `sewLength/sewWidth/sewUnit/sewWastage` (`utils/initializers.js` + `addWorkOrder`).
- `stepData.processAssignments = { cutting: {}, sewing: {} }` — each maps
  `componentName → 'isolation'|'club'` (`getInitialStepData` + `ensureStepDataShape`,
  which also tolerates the earlier `cuttingProcess.assignments` shape).
- Orchestrator handlers `handleWoSpecChange` + `setProcessAssignment` (both mark
  `cut` unsaved via `withUpdatedIpcSavedState`), passed to `<Step1>`.

> Legacy orchestrator handlers (`handleComponentChange`, `addComponent`,
> `handleComponentCuttingSizeChange`, `handleComponentSewSizeChange`, `removeComponent`)
> are now unused by Step1 but still defined — safe to prune later.

**Verified:** `npm run build` green; no `no-undef`/`jsx-no-undef`.

### Change 4 · Phase B — per-section JSON store (NOT the big wizard JSON) — ✅ FOUNDATION + CUT/SEW DONE
Pivot (per Vikram): the monolithic `FactoryCodeDraft.payload` was too big/slow. So
instead of fattening it (or `process_specific_data`), new/large data goes into a
**separate per-section JSON table with its own endpoint**, saved on each step's Save.

**Backend — dedicated package `inventory_management/ipo_management/`** (kept out of the
huge `models.py`/`views.py` for debuggability; fully commented):
- `models.py` → `FactoryCodeSection` (one generic table, `db_table=factory_code_sections`):
  one row per **(ipo, sku_key, section)**, `payload` JSONField. `Meta.app_label =
  'inventory_management'`; imported at the end of `inventory_management/models.py` so
  Django/migrations discover it.
- `views.py` → `SectionView` (GET/PUT one slice) + `SectionsListView` (GET all for an
  IPO, for rehydrate). Tenant-guarded like the draft endpoint.
- `urls.py` → `factory-codes/section/` + `factory-codes/sections/`, included in
  `inventory_management/urls.py` **before** the router (so they beat `factory-codes/<pk>/`).
- Migration `migrations/0018_factorycodesection.py`. **Verified:** `manage.py
  makemigrations --check` = no changes; `manage.py check` = 0 issues.
  ⚠️ **Run `python manage.py migrate` to create the table before the endpoint works.**

**Frontend:**
- `services/integration.js` → `getFactoryCodeSection` / `saveFactoryCodeSection` /
  `getFactoryCodeSections`.
- Cut & Sew Save (`handleSaveStep1`) now also PUTs a **compact cutsew slice**
  (`processAssignments` + per-WO cut/sew specs, via `buildCutSewSlice`) to
  `section='cutsew'`, keyed by `(formData.ipoId, selectedSku)`. Guarded + non-blocking
  (never breaks the local save; no-op until the IPO exists).

**Model/pattern is generic** — extending to BOM/Artwork/Packaging = call
`saveFactoryCodeSection(ipoId, skuKey, '<section>', slice)` on each step's Save, and
(later) rehydrate via `getFactoryCodeSections` + trim those out of the draft.

**Also (Change 4 tweaks):** Cutting's forward button renamed **"Save & Forward to
Sewing"** (= go to Sewing section); `stitching line` == Sewing.

### Change 4 · Sewing deltas — ✅ DONE
Sewing reuses the generic `SpecSection`/`ProcessSection`. Confirmed with Vikram:
- **Section-1**: no change — `woType='SEWING'` already covers it; **INTERLOCKING is a
  variant of SEWING** (not a separate type); units/material FETCH from BOM & WO per WO.
- **Section-2 deltas** (drove a `ProcessSection` generalization — actions are now
  injected via `modeAction {label,onClick,notice}` + optional `finalAction
  {label,onClick,requireAllAssigned}` + an `allAssigned` gate + a small popup):
  - Per-mode button **"Save & Move to IPC Assembly"** → saves + shows a popup
    ("moving to the assembly line") + sets `stepData.sewAssemblyMoved` (orchestrator
    `markSewMovedToAssembly`). *IPC Assembly is just a popup + remembered flag, no new
    screen.*
  - Final **"Sew as IPC & Forward to Pack"** → enabled only when **every** component is
    assigned (isolation/club); navigates to the **Finishing** tab.
  - Cutting keeps a single `modeAction` "Save & Forward to Sewing" (no finalAction).

**Inheritance model (per Vikram):** BOM & WO / Artwork → **Cutting → Sewing →
Finishing**; each category is a filtered view of the component's work orders by family
(Cutting=CUTTING, Sewing=SEWING, Finishing=FINISHING) and FETCHED cells inherit down.
Today FETCH reads the WO's own BOM value (chosen); true cross-stage inheritance
(Cutting dispatch → Sewing received) is a later refinement.

**Verified:** `npm run build` green; no `no-undef`.

### Change 5 — Persistence audit + reliable/visible DB save — ✅ DONE
**Concern (Vikram):** the IPC Spec is a **weeks-long** process; every Save must land in
the **DB** (fetchable across days/devices), not just the device.

**Audit finding — DB persistence already works:** `saveToLocalStorage` (misnamed) does
**two** things — writes a light localStorage cache **and** `saveFactoryCodeDraft(...)`
→ `PUT ims/factory-codes/draft/` → **Postgres `FactoryCodeDraft`**. Every step Save
(`handleSaveStep0/1/2/3/4`) calls it, and load (`getFactoryCodeDraft(ipoId)`) fetches
it back. So cross-day/device persistence was **already happening** via the draft.

**The real gap (fixed):** the DB save was **fire-and-forget with a silent `.catch`** —
a failed server save still showed "Saved" (dangerous for weeks-long work). Now:
- `serverSaveState` state (`idle|saving|saved|error|local`); `saveToLocalStorage`
  sets it around the DB call.
- A visible **breadcrumb-bar indicator**: "Saving to server…" / "✓ Saved to server" /
  "⚠ Not saved to server + Retry" / "On this device only — create the IPO to sync"
  (the last when there's no `ipoId` yet — a genuine local-only case).

**Verified:** `npm run build` green; no `no-undef`.

### Change 6 — Finishing (Cut, Sew & Finishing · part 3) — ✅ DONE
Finishing is a **different shape** from Cutting/Sewing — **IPC-level** (not per
component), no fetched/inherited fields:
- `components/finishing/FinishingSection.jsx` — a table `SR# | FINISHING PROCESS |
  PROCESS TYPES | REMARKS`, **prefilled with the 16 standard processes**
  (`data/finishingData.js`). PROCESS TYPES = `MultiSelectDropdown` (reused from
  artwork) with per-process presets **+ type-to-add** custom. Users can **+ Add
  Process** custom rows (editable name, removable); standard rows have fixed names.
- Data: `stepData.finishing` (draft-backed) — array of `{process, processTypes[],
  remarks}`; default 16 rows in `getInitialStepData` + `ensureStepDataShape`.
- Orchestrator handlers `handleFinishingChange` / `addFinishingRow` /
  `removeFinishingRow`.
- **Mandatory gate:** `isFinishingComplete` = ≥1 row with a process + ≥1 type.
  `handleSaveStep1` now sets the **`cut`** completion flag = `isFinishingComplete`
  (so the IPC-selector "Cut & Sew ✓" badge and the packaging gate only pass once
  Finishing is done — Vikram: "without it it will be a miss in loop, it is mandatory").
- Finishing tab has a **"Save & Proceed to Packaging"** button (disabled until
  complete) → saves + returns to the **IPC selector** (`goToIpcSelector`), where the
  existing "Proceed to Packaging" gate lives. **Packaging unchanged.**

**Verified:** `npm run build` green; no `no-undef`. This completes the **Cut, Sew &
Finishing** trilogy (Cutting ✓ Sewing ✓ Finishing ✓).

### Change 7 — Leftovers: section-store rollout + decisions + flow audit — ✅ DONE (safe parts)
**Flow audit (Product Spec → Packaging):** coherent. Completion flags
`cut`/`raw`/`artwork` are each set on their step's Save and invalidated on any edit;
the IPC-selector badges (`getNormalizedIpcSavedState`) and the "Proceed to Packaging"
gate read them consistently. `cut` now = `isFinishingComplete` (Finishing mandatory).
Order BOM(0) → Artwork(1) → Cut,Sew&Finishing(2) is sound (Cut/Sew reads BOM's WOs;
BOM is first). No bugs found.

**#1 (partial — section-store WRITE rollout, safe):** every step's Save now mirrors
its slice to the DB section store via a guarded `persistSection(section, slice)`:
`bomwo` (rawMaterials + consumption), `artwork` (artworkMaterials), `cutsew`
(processAssignments + WO cut/sew specs + finishing), `packaging`. Additive +
non-blocking; the **draft still saves everything** (zero data-loss risk).

**#2 — DECISION (locked):** the **section store + draft are the source of truth** for
the IPC-Spec wizard (per Vikram's "separate tables/endpoints, don't fatten the JSON").
We do **NOT** duplicate the new fields into committed relational
rows/`process_specific_data` (that earlier approach was explicitly rejected). Downstream
that needs this data reads the section store.

**#3 — RESOLVED (by design, no risky code):** validation for a weeks-long process must
allow **partial saves**, so `validateStep1` stays lenient; correctness is enforced by
the **mandatory gates** instead — Finishing → `cut` completion, and the packaging gate
(`cut && raw && artwork`) — plus the per-WO **Active/Inactive** indicators. **Cross-stage
inheritance is intentionally NOT wired**: Vikram chose FETCH = "from BOM & WO per WO",
not "Cutting dispatch → Sewing received".

**Verified:** `npm run build` green; no `no-undef`.

### Change 8 — Cut/Sew/Finishing design polish + mobile — ✅ DONE
The Cut, Sew & Finishing UI looked stretched/unaligned (full-width sparse content) and
wasn't mobile-friendly. Fixed:
- `Step1.jsx`: content constrained to `maxWidth: 1040px` (aligns like a form instead of
  stretching); header, tab bar and Section toggle now **flex-wrap** (mobile); tab
  container padding tightened (`bg-muted/60`).
- `SpecSection.jsx`: added a "Select component" label; component chips styled
  consistently; the "No … work orders" message is now a proper dashed empty-state card.
- `ProcessSection.jsx`: the component/placement table is now **horizontally scrollable**
  on small screens (`overflow-x-auto` + `min-width`), status column right-aligned,
  action row wraps.
- `FinishingSection.jsx`: the finishing table is **horizontally scrollable** on mobile
  (`overflow-x-auto` + `min-width: 640px`).

**Verified:** `npm run build` green; no `no-undef`.

### Change 9 — Cut/Sew rebuild: reuse the FULL work-order form (fix regression) — ✅ DONE
Earlier I mis-scoped Cut/Sew as a thin "fetched units + cut size" view, which dropped
the rich work-order visuals and left BOM unfillable. Corrected per Vikram:
**CUTTING/SEWING WOs are declared in BOM & WO but FILLED in Cut/Sew with the full form.**

- **`WorkOrdersSection.jsx`** gained a **reuse mode** via new props `restrictType`
  (CUTTING|SEWING), `showSizeFields`, `sizePrefix`, `sizeLabel`, `unitsReadOnly`,
  `hideAdd`. In reuse mode it shows the **full per-type spec** (Tool Type/SPI,
  Variants, Thread Type, Approval, Remarks, **Advance Spec**, quality, dates) —
  not the BOM "fill in Cut & Sew" note — plus **read-only FETCHED** received/process/
  dispatch units + editable **CUT/SEW SIZE** (L/W/unit/wastage), locks the type
  selector, and hides Add. BOM behaviour unchanged (defaults off).
- **`components/cutting/SpecSection.jsx`** rewritten: SELECT COMPONENT → for each of
  the component's raw materials, render `WorkOrdersSection` **pre-filtered** to the
  type. Because WOs are indexed per material, it passes a filtered material copy and
  **wraps `handleWorkOrderChange`/`removeWorkOrder` to translate the filtered index
  back to the original**. WOs are added in BOM (hideAdd here).
- **`Step1.jsx`** + orchestrator: pass `errors`, `handleWorkOrderChange`,
  `removeWorkOrder` to Step1/SpecSection (dropped the obsolete thin `handleWoSpecChange`).
- **BOM validation fix:** `validateComponentMaterials` now **skips** the WO-schema
  validation for CUTTING/SEWING (their spec is filled in Cut/Sew) → removes the
  "Tool type / Variants / Approval / dates required" popup in BOM & WO.
- **Old per-component GSM/cut/sew-size form: stays removed** (per Vikram — sizes are
  per-WO now).

**Known minor wrinkle:** editing a cut/sew WO in the Cut/Sew section goes through the
shared `handleWorkOrderChange`, which marks BOM (`raw`) unsaved — so the "BOM & WO ✓"
badge may clear when you edit here. Not data loss; can be refined to mark `cut` instead.

**Verified:** `npm run build` green; no `no-undef`. Needs an app pass to confirm the
full WO form renders correctly inside Cutting/Sewing.

### Change 10 — Cut/Sew Process (Section 2): clubbing UX like IPO Master CNS — ✅ DONE
Replaced the isolation/club mode-toggle with the **IPO Master CNS clubbing pattern**
(`components/IPOManagement/IPOMasterCNS.jsx`): components are **SINGLE (isolation)** by
default; tick **≥2** and the orange **CLUB** button **slides up from behind the card**
(`transform 380ms cubic-bezier(0.22,1,0.36,1)` — copied verbatim) to group them into
**Club N**; tick a club and the slate **UNCLUB** button slides up to split. Clubs get a
colored left-border tint + label; each row shows Single/Club mode + Active/Inactive.
- Data model: `stepData.processAssignments[kind] = { clubs: [{ id, label, components[] }] }`
  (id = sorted member names; anything not in a club = single). Orchestrator handlers
  `clubComponents(kind, names)` / `unclubClub(kind, id)` (replaced `setProcessAssignment`).
- `getInitialStepData` + `ensureStepDataShape` updated to the clubs shape (old
  assignment-map drafts reset to empty clubs). `ProcessSection.jsx` rebuilt;
  `Step1.jsx` passes `clubs` + the two club handlers. modeAction/finalAction unchanged
  (Sewing still "Save & Move to IPC Assembly" + gated "Forward to Pack").

**Carry-forward rule:** "Save & Forward to Sewing" now **propagates the Cutting
grouping into Sewing** (`propagateClubs('cutting','sewing')`) — clubbed components go
to Sewing **together**, singles go **alone**. Sewing is seeded with the same clubs and
can still be adjusted there.

**Merged-component semantics:** a club renders as **one merged row** — the member names
joined (`A  +  B`) with a **"Merged"** badge and a colored tint — meaning they're cut &
sewn **together** and flow into Sewing as a single merged unit. The split button is
labelled **ISOLATE** (tick the merged component → ISOLATE slides up → splits back to
singles). Active only when all members' sizes are filled.

**Verified:** `npm run build` green; no `no-undef`.

### Change 15 — Cut/Sew batch: dates, club rules, popup, reopen fix — ✅ PARTLY DONE
Done this pass:
- **Removed start/completion date fields** (+ their `*`) in the Cut/Sew reuse
  (`WorkOrdersSection` gates `WorkOrderDateFields` on `!restrictType`). Still shown in BOM.
- **Removed the club "same-plan" validation** — any 2+ components can now club
  (reverses Change 13's rule, per Vikram: "no size/work-order justification, just save").
- **Club naming** → `Club N cutting` / `Club N sewing` (for inward/outward).
- **Removed the isolation/club intro paragraph** from the process section.
- **Fixed data-not-visible-on-reopen**: `SpecSection` now re-selects a valid component
  when the list loads async (`useEffect` on `names`).
- **Forward/assembly popup shows the club/single breakdown** (which components merge /
  stay single) — cutting & sewing.

Second pass (answers A/B/C):
- **A — club/single → DB**: confirmed already persisted — `buildCutSewSlice` includes
  `processAssignments` (clubs+singles) and is saved to the `cutsew` section + draft on
  the cutting/sewing save buttons. Inward/outward forms can read it from there.
- **B — honest "Saved"**: the Save button is now green **only when the step's data is
  COMPLETE and unchanged since last save/load** ("Save" when incomplete or edited).
  Driven by a data signature snapshot (`stepSig`/`savedSigRef`) + a completeness check
  (all CUTTING/SEWING WOs have size L/W/unit; all FINISHING WOs have process+type).
  Reopening a saved IPC shows "Saved" without re-clicking.
- **C — Save beside Next**: moved the Save button out of the top tab bar into each
  section's **bottom action row** (beside Next / the forward button). Sewing's
  **"Save & Move to IPC Assembly"** is itself the save there.
- **D — WASTAGE/front-panel save**: the reopen-display fix likely covered it; awaiting
  Vikram's retest for confirmation of the specific field.

### Change 14 — Finishing rebuilt to per-component / per-FINISHING-WO — ✅ DONE
Supersedes the earlier IPC-level finishing table (Change 6/13). Finishing now mirrors
Cutting/Sewing: **SELECT a component that has a FINISHING work order** (declared in
BOM & WO) → fill **3 fields per work order**:
1. **FINISHING PROCESS** — `SearchableDropdown` (select or type; options = the 16
   standard processes).
2. **PROCESS TYPE** — `MultiSelectDropdown` (preset variants for the chosen process +
   type-to-add).
3. **REMARKS** — optional.
- Stored on the FINISHING work order (`wo.finishingProcess`, `wo.finishingTypes`,
  `wo.remarks`) via the shared `handleWorkOrderChange` — no separate finishing model.
- WO shape gained `finishingProcess: ''`, `finishingTypes: []` (initializers +
  `addWorkOrder`). Removed `stepData.finishing` + `getInitialFinishing` +
  `handleFinishingChange`/`addFinishingRow`/`removeFinishingRow`.
- **Mandatory**: every FINISHING work order must have a process + ≥1 type
  (`isFinishingComplete`; vacuously true if the IPC has no FINISHING WOs). Gates the
  `cut` completion flag + the "Save & Proceed to Packaging" button.
- `buildCutSewSlice.workOrderSpecs` now also includes FINISHING WOs (process/types/remarks).

**Verified:** `npm run build` green; no `no-undef`.

### Change 13 — Clubbing rule, finishing components, linear Next, popup — ✅ DONE
- **Club match rule**: components can only be clubbed when they share the **same work
  orders + size** for the stage (`planSig` in `ProcessSection` compares each
  component's `woType` work orders' size `L/W/unit`). Mismatch → a popup explains they
  stay single; no club created.
- **Cutting → Sewing popup**: "Save & Forward to Sewing Line" now saves + propagates
  clubs, shows **"Saved and moved to the sewing line."** with a **Continue →** button
  that opens the Sewing section (via `modeAction.onContinue`).
- **Finishing per-process COMPONENTS**: each finishing row got a **Components**
  multi-select (`row.components`, options = the IPC's components). Row shape +
  `getInitialFinishing` + `addFinishingRow` updated.
- **Linear Next flow**: a **Next →** on each Spec section advances to that tab's
  Process; combined with the existing forward buttons the order is
  **cutting-spec → cutting-process → sewing-spec → sewing-process → finishing → IPC
  Selector** (→ packaging). Forwarding into Sewing resets it to its Spec section.
- **Individual DB saving** — confirmed already done (Change 7 `persistSection`:
  `bomwo`/`artwork`/`cutsew`/`packaging` each save to their own section row).
- **Derived CNS** — confirmed: `IPODerivedCNS.jsx` reads `getFactoryCodeDraft`, so the
  completed IPC (draft is saved on every step) surfaces there; nothing new needed.

**Verified:** `npm run build` green; no `no-undef`.

### Change 15 — Finishing = repeatable process GROUPS — ✅ DONE
(Supersedes an earlier wrong take where only the Process field became multi-select —
rolled back.)
- Each FINISHING work order now holds a **list of finishing-process groups**. One group
  = **{ FINISHING PROCESS (select/type), PROCESS TYPE (multi-select), REMARKS }**, and a
  **"+ Add finishing process"** button appends another group; each group past the first
  gets a **Remove**. Process Type options track that group's own process
  (`FINISHING_TYPE_MAP[g.process]`).
- New field **`finishingGroups: []`** on the work order (initializers + wizard WO
  scaffold + `buildCutSewSlice` persist). Legacy flat `finishingProcess`/`finishingTypes`/
  `remarks` are still read via `getFinishingGroups(wo)`, which wraps them into one group.
- Completeness (`isFinishingComplete` + Step1's Finishing gate): a WO is done when it has
  **≥1 group** and **every group** has a process + **≥1 type** (remark optional).
  **Build green.**

### Change 14 — Nav swap + trustworthy selector badges — ✅ DONE
- **Nav swap** (Step1 bottom row): the two actions were reversed.
  - **Next →** now advances to the **Finishing** section (`saveAndGo('finishing')`).
  - **Sew as IPC & Forward to Pack →** now finalises and returns to the **IPC
    selector** (packaging) via `onNext`/`handleNext`. Still shown only on Sewing ·
    Process, between Previous and Next.
- **Selector "saved" badges now reflect the DB, not just the in-session flags.**
  `getIpcCompletion` used to read only `ipcSavedState.{raw,cut,artwork}`. Those flags
  are fragile — `raw` needs the whole BOM saved in one session (the in-session Set
  resets on reload) and `cut` gets reset to false by unrelated edits. So a reloaded
  IPC with all data saved could show BOM & WO ○ / Cut & Sew ○ while only Artwork ✓.
  Fixed by **also deriving completion from the persisted draft data** and OR-ing it in:
  - **raw** = flag **OR** every component that has materials is in the persisted
    `rawSavedComponents`.
  - **cut** = flag **OR** every CUTTING/SEWING work order is sized **and** every
    FINISHING work order is filled (`isFinishingComplete`).
  - **artwork** = unchanged (its flag round-trips reliably).
  This is the same completeness bar the save handlers use, just recomputed from
  persisted data — so it can't green a genuinely-incomplete section (the Proceed-to-
  Packaging gate stays honest). **Build green.**

### Change 13 — "Sew as IPC & Forward to Pack →" into the bottom nav — ✅ DONE
- Step1 now owns its own bottom navigation row: **[← Previous] · [Sew as IPC &
  Forward to Pack →] · [Next →]**. The middle button only appears while viewing the
  **Sewing · Process** section (`activeTab === 'sewing' && sewingSection === 'process'`)
  and runs `saveAndGo('finishing')` (save → open Finishing tab).
- Removed the sewing `finalAction` from `ProcessSection`'s in-card action row (only the
  "Save & Move to IPC Assembly" mode button remains there).
- Orchestrator: the `currentStep === 2` bottom-nav block is now `null` (Step1 renders
  its own); `onPrev={handlePrevious}` / `onNext={handleNext}` passed into Step1.
- **Build green.**

### Change 12 — Process flow polish — ✅ DONE
- Cutting forward button → **"Save & Forward to Sewing Line."**
- Sewing process shows a persistent **"✓ In IPC assembly line"** marker once
  `sewAssemblyMoved` is set (in addition to the "Save & Move to IPC Assembly" popup).
- Confirmed flow (unchanged): Cutting → **Save & Forward to Sewing Line** (clubs carry
  together, singles alone) → Sewing → **Save & Move to IPC Assembly** (popup + marker) →
  **Sew as IPC & Forward to Pack** (gated: all components assigned) → **Finishing** →
  Packaging. Same isolation/club UI on both Cutting & Sewing.

### Change 11 — Product Spec component/placement field rules — ✅ DONE
`Step0.jsx` renderComponentsSection:
- **COMPONENT** is now a plain **text input** (was a SearchableDropdown).
- **ASSIGN PLACEMENT** adapts to the entity's component count: **1** → dropdown
  `[TOP PLACEMENT]`; **2** → `[TOP PLACEMENT, BOTTOM PLACEMENT]`; **3+** → free-text
  input. (Confirmed: constrained dropdown, not auto-assign.)
- Removed the now-unused `useMaterialOptions` hook + `COMPONENT_NAME_OPTIONS`/
  `PLACEMENT_OPTIONS` imports from Step0. **Build green.**

### Still open
1. **Latency win — the draft TRIM + REHYDRATE flip (the only remaining real work):**
   read slices back from the section store on load and **remove** those slices from the
   draft so it shrinks. Deliberately **not** done blind — it needs validation against the
   now-migrated live DB, and there's a model caveat: **cut/sew fields are nested inside
   `rawMaterials.workOrders`**, so the `cutsew` and `bomwo` slices overlap; a clean trim
   needs either a small `stepData` restructure or accepting that overlap. Do as a focused,
   tested pass. Until then: no latency change, but full DB safety (draft authoritative).
2. Optional: tighten per-WO size to be required for `cut` completion (currently only
   Finishing is required) — only if Vikram wants a stricter gate.
