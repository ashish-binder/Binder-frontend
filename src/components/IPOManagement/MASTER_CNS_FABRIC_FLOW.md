# IPC Master CNS — Fabric sheet & Check Stock flow

Scope: the **Fabric** category of the IPO/IPC Master CNS
([IPOMasterCNS.jsx](./IPOMasterCNS.jsx)). Fabric rows are **derived** from the
IPC Derived CNS (`buildFabricRowsFromDerived`) — nothing is hand-keyed except the
manual cells listed below. Yarn/Fiber/Foam/Trim tables are unchanged by this work.

> Change date: 2026-07-10. No git in this repo — the **build is the safety net**
> (`npx vite build` for FE, `manage.py check` for BE).

## 1. Fabric columns (updated to match the spec sheet)

IPC# and CLUB/SINGLE are **not** columns — they are rendered by the table shell as
row grouping (left IPC# rowSpan block) and the trailing Club/Single badge column.

| # | Column | Source | Notes |
|---|---|---|---|
| 1 | Material Description | derived (`material_description`) | sticky first column |
| 2 | **Component** | derived (`component`) | **new** — component the fabric maps to |
| 3 | Overage QTY | derived (`overage_qty`) | |
| 4 | Net Length CNS/PC | derived (`net_length_cns_pc`) | Cut & Sew cutting length |
| 5 | Gross Length Wastage | derived (`gross_wastage_length` %) | |
| 6 | Gross Length CNS/PC | computed `grossLengthPc()` | Net Length × (1 + wastage%) |
| 7 | Net Width CNS/PC | derived (`net_width_cns_pc`) | Cut & Sew cutting width |
| 8 | Gross Width Wastage | derived (`gross_wastage_width` %) | DYEING shrinkage width |
| 9 | Gross Width CNS/PC | computed `grossWidthPc()` | Net Width × (1 + wastage%) |
| 10 | Purchase Width | **manual** (`purchase_width`) | validated > Gross Width CNS; sums across a club |
| 11 | Unit | derived (`unit`) | |
| 12 | **Gross Purchase QTY (Unit)** | **manual** (`gross_purchase_qty`) | **new** — user-entered; sums across a club |
| 13 | **Remarks / Status** | **manual** (`remarks`) | **new** — free text, per row |

### Removed from the previous Fabric table
Gross Width CNS · Gross Length QTY · Purchase Length QTY · Gross Width Multiple ·
Balance Gross Width Wastage · Balance Gross Width Wastage %.

`fabricGrossWidthCns()` is **kept** as a helper (drives the Purchase Width
validation + club aggregation) even though Gross Width CNS is no longer a column.

### Persistence (implemented)
All three manual fields persist via `POST ims/ipos/{id}/master-cns/save-rows/`:
`purchase_width`, `gross_purchase_qty`, `remarks` (backend whitelist extended;
`RawMaterial.gross_purchase_qty` + `RawMaterial.remarks` added, migration `0020`).
The master-cns payload returns them so values reload on open.

**Derived-row → RawMaterial matching.** Fabric rows come from the Derived CNS with
synthetic ids (`derived-fabric-…`), which the save endpoint (keyed by
`RawMaterial` UUID) can't match. The `fabricRowsFromDerived` memo therefore stamps
each derived row's `id` with its persisted `RawMaterial` UUID by matching
IPC + material description + component (falling back to IPC + description). Rows
with no backend match keep their derived id and simply don't persist. This makes
both Save **and** the on-load seed key correctly.

### Save actions
- **Per-row / per-club** — the Action Button's "Save" saves that row/club.
- **Top-level "Save"** — sits to the left of "Share to Purchase"; saves every row
  that has manual inputs (`handleSaveAll`).

### Editable Net Length / Net Width (carry-forward to Purchase)
When the Derived CNS has **no** cutting size, **Net Length CNS/PC** and **Net
Width CNS/PC** render as manual number inputs (editable *only when empty* — a
derived value shows read-only). The typed value:
- feeds **Gross Length/Width CNS/PC** live (`fabricGrossLengthPc` /
  `fabricGrossWidthPc` use the effective net = derived ?? manual), and
- persists on Save (`RawMaterial.net_length_cns_pc` / `net_width_cns_pc`,
  migration `0021`), then
- **carries forward to the Purchase grid**: the master-cns payload merges the
  manual value into `net_length_cns_pc`/`net_width_cns_pc` (used to build the
  Purchase rows in `_shape_rows`, surfaced under the row `extras`).

Seeding uses distinct payload keys `net_length_manual` / `net_width_manual` so
only user-typed values are re-loaded into the editable cells (not the derived
cutting size).

### (i) info buttons
Column defs support an optional `info` string; a `HeaderInfo` (i) button renders
next to the header and shows the note (base-unit MM→Meter conversion) on
hover/click. Currently on **Net Length CNS/PC** and **Net Width CNS/PC**.

## 2. Check Stock popup

Every Fabric row (and each club summary row) has a **CHECK** button. It opens a
modal that lists live stock for that row's **Material Description**, matched on
description only — regardless of Purchase Width (per spec).

- Single row → the one description. Club → the union of the clubbed rows'
  descriptions (queried by category, filtered client-side by
  `filterStockByDescriptions`).
- Category is mapped from the active subtab via `SUBTAB_STOCK_CATEGORY`
  (`fabric → FABRIC`, `fiber → FIBER`, `foam → FOAM`, `trim → TRIMS_ACCESSORY`,
  `yarn → YARN`), so the same flow works for the other Raw-Material subtabs.

### Popup table columns
UIN Stock ID · Material Description · Available Width/Unit · QTY · Unit · UQR ·
Request UQR.

- **UQR** shows the lot's latest status (`UQR# FILE-N/A` when none, else the status).
- **Request UQR** shows a **REQUEST UQR** button only when status is `na`; after a
  successful request the row refreshes and shows **Requested ✓**.

### Data source (backend — already existed, reused)
- `GET ims/stock/?category=<..>&material=<..>&ipo=<..>` → `getStockLookup()`
  (`purchase_views.stock_lookup`). Sources stock from `StockSheet` /
  `StockSheetItem` (both "From IPO" and manual "Add New" lots), plus the latest
  `UQRRequest` status per lot.
- `POST ims/stock/uqr/` → `requestUqr()` (`purchase_views.uqr_request_create`).

### Backend change made for this flow
Added **`available_width`** to each `stock_lookup` result row (read from the stock
item's frozen `details` snapshot). Additive only — see the Change log in
[flowbase-backend.md](../../../../Binder-backend/flowbase-backend.md).

## 3. Files touched
- FE `components/IPOManagement/IPOMasterCNS.jsx` — Fabric columns, `ManualTextCell`,
  Check Stock state/handlers + modal.
- FE `services/integration.js` — reuses existing `getStockLookup` / `requestUqr`.
- BE `inventory_management/purchase_views.py` — `available_width` in `stock_lookup`.
- BE `flowbase-backend.md` — Change log row.