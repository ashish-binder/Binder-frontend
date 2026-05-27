// Column schemas for the Purchase Master CNS Sheet grid (Section 8 of spec).
//
// Each schema describes the columns for ONE (tab, category) pair. The
// <PurchaseGrid> renders rows using the schema, so we write each table ONCE
// here instead of 16 separate components.
//
// Column shape:
//   { key, label, align?, width?, editable?, formatter? }
// Editable columns PATCH back to /ims/purchase/line-items/{source_type}/{id}/

const fixedFront = (extra = []) => [
  { key: '_ipc', label: 'IPC#', align: 'left', width: 120, group: true },
  { key: '_select', label: '', align: 'center', width: 56 },
  ...extra,
];

const balanceCol = { key: '_balance', label: 'Balance Qty / Unit', align: 'right', width: 160 };
const unitCol = { key: 'unit', label: 'Unit', align: 'center', width: 96, editable: true };

export const TOP_TABS = [
  { key: 'raw_material', label: 'Raw Material' },
  { key: 'artwork', label: 'Artwork & Labeling' },
  { key: 'packaging', label: 'Packaging' },
];

export const CATEGORY_CHIPS = {
  raw_material: [
    { key: 'yarn', label: 'Yarn' },
    { key: 'fabric', label: 'Fabric' },
    { key: 'fiber', label: 'Fiber' },
    { key: 'foam', label: 'Foam' },
    { key: 'trims', label: 'Trims' },
  ],
  artwork: [
    { key: 'law_label', label: 'Law Label' },
    { key: 'wash_care', label: 'Wash Care' },
    { key: 'brand_label', label: 'Brand Label' },
    { key: 'ribbon', label: 'Ribbon' },
  ],
  packaging: [
    { key: 'carton_box', label: 'Carton Box' },
    { key: 'stiffener', label: 'Stiffener' },
    { key: 'polybag', label: 'Polybag' },
    { key: 'silica_gel', label: 'Silica Gel' },
    { key: 'tape', label: 'Tape' },
    { key: 'shipping_mark', label: 'Shipping Mark' },
    { key: 'shrink_tape', label: 'Shrink Tape' },
  ],
};

export const COLUMN_SCHEMAS = {
  // ------------------------- RAW MATERIAL ----------------------------------
  'raw_material:yarn': [
    ...fixedFront([
      { key: 'component', label: 'IPC / Component', align: 'left', width: 180 },
      { key: 'material_description', label: 'Material Description', align: 'left', width: 280 },
      { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
      unitCol,
    ]),
    balanceCol,
  ],

  'raw_material:fabric': [
    ...fixedFront([
      { key: 'material_description', label: 'Raw Material', align: 'left', width: 280 },
      { key: 'purchase_width', label: 'Purchase Width / Unit', align: 'right', width: 160 },
      { key: 'purchase_length_qty', label: 'Purchase Length Qty', align: 'right', width: 160 },
      unitCol,
    ]),
    balanceCol,
  ],

  'raw_material:fiber': [
    ...fixedFront([
      { key: 'material_description', label: 'Raw Material Description', align: 'left', width: 280 },
      { key: 'gross_length_cns', label: 'Gross Length CNS / Unit', align: 'right', width: 170 },
      { key: 'purchase_width', label: 'Purchase Width / Unit', align: 'right', width: 160 },
      { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
      unitCol,
    ]),
    balanceCol,
  ],

  'raw_material:foam': [
    ...fixedFront([
      { key: 'material_description', label: 'Raw Material', align: 'left', width: 280 },
      { key: 'gross_length_cns', label: 'Gross Length CNS / Unit', align: 'right', width: 170 },
      { key: 'gross_weight_cns', label: 'Gross Weight CNS / Unit', align: 'right', width: 170 },
      { key: 'purchase_width', label: 'Purchase Width / Unit', align: 'right', width: 160 },
      { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
      unitCol,
    ]),
    balanceCol,
  ],

  'raw_material:trims': [
    ...fixedFront([
      { key: 'material_description', label: 'Raw Material', align: 'left', width: 280 },
      { key: 'purchase_width', label: 'Purchase Width', align: 'right', width: 130 },
      { key: 'purchase_length_qty', label: 'Purchase Length Qty / Unit', align: 'right', width: 180 },
      { key: 'purchase_weight_qty', label: 'Purchase Weight Qty', align: 'right', width: 160 },
      { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
      unitCol,
    ]),
    balanceCol,
  ],

  // ------------------------- ARTWORK & LABELING ----------------------------
  // Law Label / Wash Care / Brand Label / Ribbon share the same columns.
  ...['law_label', 'wash_care', 'brand_label', 'ribbon'].reduce((acc, cat) => {
    acc[`artwork:${cat}`] = [
      ...fixedFront([
        { key: 'material_description', label: 'Artwork / Label', align: 'left', width: 280 },
        { key: 'purchase_width', label: 'Purchase Width / Unit', align: 'right', width: 160 },
        { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
        unitCol,
      ]),
      balanceCol,
    ];
    return acc;
  }, {}),

  // ------------------------- PACKAGING -------------------------------------
  // All 7 packaging sub-tabs share the same columns.
  ...['carton_box', 'stiffener', 'polybag', 'silica_gel', 'tape', 'shipping_mark', 'shrink_tape'].reduce(
    (acc, cat) => {
      acc[`packaging:${cat}`] = [
        ...fixedFront([
          { key: 'material_description', label: 'Packaging', align: 'left', width: 280 },
          { key: 'purchase_qty', label: 'Purchase Qty', align: 'right', width: 130 },
          unitCol,
        ]),
        balanceCol,
      ];
      return acc;
    },
    {}
  ),
};

export const getColumnSchema = (tab, category) => COLUMN_SCHEMAS[`${tab}:${category}`] || null;

// Material description rendering — pipe-delimited, category-specific. Render
// as stored (Section 11.2 of spec) but wrap nicely for long strings.
export const formatMaterialDescription = (category, value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};
