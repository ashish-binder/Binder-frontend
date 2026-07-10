# Stock Sheet — Add-New Material Spec

The manual material editor for the Stock Sheet **"Add New"** flow. It lets a user
build materials with full specification + advance specification for the supported
categories, **reusing the FactoryCode wizard's standalone pieces** (field
components, description generator, unit constants, `ui/` primitives) without
touching the wizard's `Step2`.

Used only when `source = ADD_NEW` in `../StockSheet.jsx`.

---

## Data flow

```
StockSheet.jsx (category, yarnSubMaterial)
   │
   ▼
AddNewMaterials.jsx
   │  holds `materials[]` (one object per material row)
   │  renders the per-category spec fields:
   │    Yarn → YarnSpecFields · Fabric → FabricSpecFields · Fiber → FiberSpecFields
   │    Foam → FoamSpecFields · Trims → TrimAccessoryFields (wizard) · Artwork → ArtworkSpecFields
   │    Packaging → PackagingSpecFields · Company Essentials → CompanyEssentialsSpecFields
   │
   ├─ applyMaterialChange(material, patch)      # applyMaterialChange.js
   │     regenerates materialDescription from spec fields; toggles advance-spec flag
   │
   ▼  (on Save, back in StockSheet.jsx)
validateMaterials(materials, materialType)      # buildStockItems.js:110
buildItemsFromMaterials(materials)               # buildStockItems.js:45  → { items, item_columns }
```

Each material object → one `StockSheetItem` on the backend. Non-empty spec fields
become that item's `details` JSON and drive `item_columns`, so `MasterStockSheet`
renders the same columns the user saw at entry.

---

## Category → material type

`CATEGORY_TO_MATERIAL_TYPE` (applyMaterialChange.js) maps the Stock Sheet
category to the wizard's `materialType` label:

| Stock Sheet category  | materialType         |
| --------------------- | -------------------- |
| `YARN`                | `Yarn`               |
| `FABRIC`              | `Fabric`             |
| `FIBER`               | `Fiber`              |
| `FOAM`                | `Foam`               |
| `TRIMS_ACCESSORY`     | `Trim & Accessory`   |
| `PACKAGING`           | `Packaging`          |
| `ARTWORK_LABELLING`   | `Artwork`            |
| `COMPANY_ESSENTIALS`  | `CompanyEssentials`  |

`SUPPORTED_CATEGORIES` = the keys above. A category with no mapping is rejected
in `StockSheet.handleSave` with a "manual entry isn't supported" message.

---

## Files

| File                             | Responsibility                                             |
| -------------------------------- | ---------------------------------------------------------- |
| `AddNewMaterials.jsx`            | Hosts material rows; picks the spec-field component by type |
| `YarnSpecFields.jsx`             | Yarn spec + advance spec (Stitching Thread vs regular yarn) |
| `FabricSpecFields.jsx`           | Fabric spec + advance spec                                  |
| `FiberSpecFields.jsx`            | Fiber spec fields                                           |
| `FoamSpecFields.jsx`             | Foam spec fields                                            |
| `ArtworkSpecFields.jsx`          | Artwork & Labelling spec fields                             |
| `PackagingSpecFields.jsx`        | Packaging spec fields                                       |
| `CompanyEssentialsSpecFields.jsx`| Company Essentials spec fields                              |
| `applyMaterialChange.js`         | Description regenerator, advance-spec flags, category map   |
| `buildStockItems.js`             | `validateMaterials` + `buildItemsFromMaterials` (→ payload) |
| `Reveal.jsx`                     | Collapsible advance-spec container                          |

---

## Validation

`validateMaterials` (buildStockItems.js) enforces required fields per material
type (`REQUIRED` map + `yarnRequired` for the two yarn sub-modes). Error keys are
`item_<index>_<field>` to match each field component's `errorPrefix`. `unit` is
required for every type except Packaging / Artwork / Company Essentials (which
carry their own per-type units).

See `../README.md` (frontend) and
`Binder-backend/inventory_management/stock_sheet/README.md` (backend) for the
full round trip and how saved Add-New stock surfaces everywhere stock is checked.
