// Component + Assign Placement options for the Product Spec step (Step 0).
//
// Components are now named — and their placement assigned — on the Product Spec
// page (per SKU and per subproduct). These entries live in each entity's
// stepData.products[0].components[] (component name = `productComforter`,
// placement = `placement`), the SAME array the Cut & Sew step reads, so they
// pre-fill that step. The backend wizard payload already serializes component
// `name` + `placement` (see utils/wizardPayload.js → sanitizeComponent), so this
// is additive and does not change the DB contract.
//
// Both dropdowns allow typing a custom value (SearchableDropdown strictMode=false)
// which is persisted tenant-wide via the material-options API (useMaterialOptions)
// under materialType 'Component', fieldKeys 'component' / 'placement'.

export const COMPONENT_NAME_OPTIONS = [
  'FRONT PANEL',
  'FRONT INTERLINING',
  'BACK INTERLINING',
  'BACK PANEL',
];

export const PLACEMENT_OPTIONS = [
  'TOP PLACEMENT',
  'MID PLACEMENT-1',
  'MID PLACEMENT-2',
  'BOTTOM PLACEMENT',
];
