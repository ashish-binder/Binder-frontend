# Stock Sheet — Frontend Flow

UI for creating and viewing Stock Sheets in the IMS. This folder owns the
**Add Stock** form; `../MasterStockSheet.jsx` owns the read/list grid.

This document covers the **complete frontend flow**, with emphasis on the
**"Add New" (manual) entry** path and how that stock then **shows up everywhere
stock is asked for**.

---

## 1. Where it mounts

`dashboard/DashboardContent.jsx` renders:

- `<StockSheet />` — the Add Stock form (this folder's `StockSheet.jsx`).
- `<MasterStockSheet />` — the list/database grid.

`IMSContent.jsx` exposes the "Add Stock" button via `onOpenStockSheet`.

---

## 2. The two entry modes

`StockSheet.jsx` has an **Entry Mode** toggle (`source` state):

| Mode       | `source`   | Behaviour                                              |
| ---------- | ---------- | ----------------------------------------------------- |
| From IPO   | `FROM_IPO` | Pick IPO Type → IPO → IPC → Category. Item grid is WIP (placeholder). |
| **Add New**| `ADD_NEW`  | Pick Category (+ Yarn sub-material), build materials manually. |

Switching mode (`handleSourceChange`, StockSheet.jsx:216) clears IPO context and
materials so the two paths never leak state into each other.

---

## 3. Add-New flow (the focus)

```
StockSheet.jsx  (source = ADD_NEW)
   │  user picks Category (+ Yarn Sub-Material if YARN)
   ▼
AddNewMaterials.jsx            # materialSpec/ — manual material editor
   │  per-category spec fields (Yarn/Fabric/Fiber/Foam/Trims/Artwork/Packaging/CompanyEssentials)
   ▼
handleSave()                   # StockSheet.jsx:228
   ├─ CATEGORY_TO_MATERIAL_TYPE[category]     # applyMaterialChange.js — guards supported types
   ├─ validateMaterials(materials, type)      # buildStockItems.js:110 — required-field check
   └─ buildItemsFromMaterials(materials)      # buildStockItems.js:45 — → { items, item_columns }
   │
   ▼
payload {                                     # StockSheet.jsx:282
   source: 'ADD_NEW',
   ipo_type: null, ipo: null, ipc: null,      # dropped for Add-New
   category, yarn_sub_category,
   num_packages, total_qty, rate, amount,
   item_columns, items, packages,
}
   │
   ▼
createStockSheet(payload)      # services/integration.js:1206  → POST /api/ims/stock-sheets/
   │
   ▼
onSaved(res.data)              # parent closes the form / refreshes the grid
```

Package rows (`packageRows`) are rebuilt whenever `# of Packages` changes
(StockSheet.jsx:180); `total_qty` is their summed `qty` (StockSheet.jsx:200).

### Sub-files (`materialSpec/`)

See `materialSpec/README.md`. In short: `AddNewMaterials.jsx` hosts the rows,
one `*SpecFields.jsx` per category renders the fields, `applyMaterialChange.js`
regenerates the material description, and `buildStockItems.js` validates + maps
to the API payload.

---

## 4. Where the saved stock shows up

Once saved, an Add-New lot (no IPO link) is visible in **every** place stock is
asked for:

| Surface                           | Call                                   | Notes                                        |
| --------------------------------- | -------------------------------------- | -------------------------------------------- |
| `MasterStockSheet.jsx`            | `getStockSheets()` (integration:1195)  | Lists all sheets, both sources.              |
| Purchase → `StockUqrPanel.jsx`    | `getStockLookup()` (integration:1561)  | Add-New stock (ipo=null) is available against **any** IPO. |
| UQR request                       | `requestUqr()` (integration:1571)      | Raise a UQR on a stock lot.                  |
| Issue stock to IPO                | `issueStockToIpo()` (integration:1584) | Allocate the lot to a purchase row.          |

The "available against any IPO" behaviour is enforced server-side in
`stock_lookup` — see the backend doc at
`Binder-backend/inventory_management/stock_sheet/README.md` §5.

---

## 5. Service layer (`services/integration.js`)

| Function                       | Endpoint                                  |
| ------------------------------ | ----------------------------------------- |
| `createStockSheet`             | `POST ims/stock-sheets/`                  |
| `getStockSheets`               | `GET  ims/stock-sheets/`                  |
| `getStockSheet(id)`            | `GET  ims/stock-sheets/:id/`              |
| `deleteStockSheet(id)`         | `DELETE ims/stock-sheets/:id/`            |
| `getStockSheetChoices`         | `GET  ims/stock-sheets/choices/`          |
| `getStockSheetMaterialItems`   | `GET  ims/stock-sheets/material-items/`   |
| `getStockLookup`               | `GET  ims/stock/`                         |

---

## 6. File map

| File                          | Responsibility                                   |
| ----------------------------- | ------------------------------------------------ |
| `StockSheet.jsx`              | Add Stock form; From-IPO + Add-New modes; save   |
| `ThemedSelect.jsx`            | react-select styled to the flat theme            |
| `AdvanceSpecButton.jsx`       | Shared advance-spec toggle                        |
| `StockSheet.css`              | Scoped styles                                     |
| `materialSpec/`               | Add-New material editor + per-category fields     |
| `../MasterStockSheet.jsx`     | Read/list grid                                    |
| `../purchase/StockUqrPanel.jsx` | Stock lookup + UQR + issue-to-IPO consumer      |
