// Finishing (Cut, Sew & Finishing → part 3). IPC-level checklist: the 16 standard
// finishing processes, each with preset PROCESS TYPE options (multi-select; the
// UI also lets users type-to-add custom types). Users may add extra custom rows.

export const FINISHING_PROCESSES = [
  { process: 'Thread Trimming', types: ['Manual', 'Electric', 'Precision'] },
  { process: 'Shearing', types: ['Full Surface', 'Pattern', 'High-Low'] },
  { process: 'Clipping', types: ['Loop', 'Surface', 'Pattern'] },
  { process: 'Brushing', types: ['Soft', 'Hard', 'One-way'] },
  { process: 'Spot Cleaning', types: ['Water', 'Solvent', 'Foam'] },
  { process: 'Lint Removal', types: ['Vacuum', 'Roller', 'Air Blow'] },
  { process: 'Pressing', types: ['Steam', 'Flat', 'Roller'] },
  { process: 'Fringe Knotting', types: ['Single', 'Double', 'Decorative'] },
  { process: 'Shape Correction', types: ['Manual', 'Steam Blocking'] },
  { process: 'Label Attachment', types: ['Sewn', 'Heat Transfer'] },
  { process: 'Measurement Check', types: ['100%', 'Sampling'] },
  { process: 'Folding', types: ['Retail', 'Flat', 'Roll'] },
  { process: 'Metal Detection', types: ['Manual'] },
  { process: 'Barcode Application', types: ['Manual'] },
  { process: 'Polybag Packing', types: ['Individual', 'Set Pack'] },
  { process: 'Carton Packing', types: ['Bulk', 'Retail', 'Assorted'] },
];

// Quick lookup: process name -> preset types. Also used to tell a standard row
// (fixed name) from a user-added custom row (editable name, empty preset list).
export const FINISHING_TYPE_MAP = FINISHING_PROCESSES.reduce((acc, p) => {
  acc[p.process] = p.types;
  return acc;
}, {});

// The prefilled 16 rows for a fresh IPC. `components` = which of the IPC's
// components this finishing process applies to (multi-select, filled in the UI).
export const getInitialFinishing = () =>
  FINISHING_PROCESSES.map((p) => ({ process: p.process, processTypes: [], remarks: '', components: [] }));
