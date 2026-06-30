// Shared option lists for the raw-material spec blocks (Step 2 — BOM & WIP).
// Extracted from Step2.jsx so the per-material-type spec components and the
// parent step can share a single source of truth.

export const YARN_TESTING_REQUIREMENT_OPTIONS = [
  'Linear density',
  'Strength',
  'Twist per unit length',
  'Evenness/Irregularity',
  'Yarn Hairiness',
  'Moisture Regain/Content',
];

export const FABRIC_TESTING_REQUIREMENT_OPTIONS = [
  'Physical Properties',
  'Tensile Strength',
  'Tear strength',
  'Bursting Strength',
  'Abrasion Resistance',
  'Pilling Resistance',
  'Dimensional Stability',
  'Color Fastness',
];
