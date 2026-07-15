/**
 * Material Description generator.
 *
 * Builds the canonical "MATERIAL DESC" string for a raw material row from its
 * specification fields, following the RAW MATERIAL syntax:
 *
 *   FABRIC : Fabric Name | Composition | GSM | Construction Type | Weave/Knit Type
 *   YARN   : Doubling/Count×Ply | Count-System | Composition | Yarn Type | Winding
 *   FOAM   : Foam Type | Subtype | VA Content | Colour | Thickness | Sheet/Pcs | GSM |
 *            Length x Width | (advance) Shore | Cell | FR | UV | Density | Certification
 *   FIBER  : Fiber Type | Subtype | Form | Denier | Siliconized | Conjugate/Crimp | Colour |
 *            (advance) Fiber Length | Structure | Thermal Bonded | Anti-Microbial | FR |
 *            Certification | Loft/Fill Power
 *
 * Output format (per product decision): parts joined by "/" with no surrounding
 * spaces. Empty parts (e.g. unfilled Advance Spec fields) are omitted, so a
 * fabric with no construction/weave type becomes "Duck/100%Cotton/220GSM".
 *
 * Keep this file as the single source of truth: the regeneration hook, the
 * read-only field display and the edit-via-source highlight all read from here.
 */

const SEP = '/';

// ---- per-field value formatters -------------------------------------------

const clean = (v) => (v === null || v === undefined ? '' : String(v).trim());

// Composition collapses internal whitespace: "100% Cotton" -> "100%Cotton"
const composition = (v) => clean(v).replace(/\s+/g, '');

// Numeric "GSM" suffix: "220" -> "220GSM"; already-suffixed values are left as-is.
const gsm = (v) => {
  const s = clean(v);
  if (!s) return '';
  return /gsm/i.test(s) ? s : `${s}GSM`;
};

// ---- per-material-type field definitions ----------------------------------
// Each entry: { key, format? }. `format` defaults to `clean`.
// `dims` is a synthetic part built from two keys.

const FABRIC_FIELDS = [
  { key: 'fabricName' },
  { key: 'fabricComposition', format: composition },
  { key: 'gsm', format: gsm },
  { key: 'constructionType' },
  { key: 'weaveKnitType' },
];

// Foam has one field-group per sub-type, each with its own key prefix, chosen by
// `foamTableType`. Rather than a fixed list we read a common suffix set off the
// active prefix; suffixes that don't exist for a sub-type resolve to '' and drop
// out (e.g. VaContent is EVA-only, Grade is HR/PU/Memory-only).
const FOAM_PREFIX_BY_TABLE = {
  'EVA-foam': 'foam',
  'memory-foam': 'foamMemory',
  'HR-foam': 'foamHr',
  'pu-foam': 'foamPu',
  'pe-epe': 'foamPeEpe',
  'rebonded-foam': 'foamRebonded',
  'gel-infused-foam': 'foamGelInfused',
  'latex-foam': 'foamLatex',
};
const FOAM_BASIC_SUFFIXES = ['Type', 'Subtype', 'Grade', 'VaContent', 'Colour', 'Thickness', 'SheetPcs'];
const FOAM_ADV_SUFFIXES = ['ShoreHardness', 'Ild', 'CellStructure', 'FireRetardant', 'UvResistance', 'Density', 'Certification'];

const foamPrefix = (material) => FOAM_PREFIX_BY_TABLE[material.foamTableType] || 'foam';

const buildFoamParts = (material) => {
  const p = foamPrefix(material);
  const parts = FOAM_BASIC_SUFFIXES.map((suf) => clean(material[`${p}${suf}`]));
  parts.push(gsm(material[`${p}Gsm`]));
  const l = clean(material[`${p}LengthCm`]);
  const w = clean(material[`${p}WidthCm`]);
  parts.push(l && w ? `${l}x${w}cm` : '');
  FOAM_ADV_SUFFIXES.forEach((suf) => parts.push(clean(material[`${p}${suf}`])));
  return parts;
};

const foamSourceFields = (material) => {
  const p = foamPrefix(material);
  const suffixes = [...FOAM_BASIC_SUFFIXES, 'Gsm', 'LengthCm', 'WidthCm', ...FOAM_ADV_SUFFIXES];
  return ['foamTableType', ...suffixes.map((s) => `${p}${s}`)];
};

const FIBER_FIELDS = [
  { key: 'fiberFiberType' },
  { key: 'fiberSubtype' },
  { key: 'fiberForm' },
  { key: 'fiberDenier' },
  { key: 'fiberSiliconized' },
  { key: 'fiberConjugateCrimp' },
  { key: 'fiberColour' },
  // Advance Spec (only contribute when filled)
  { key: 'fiberFiberLength' },
  { key: 'fiberStructure' },
  { key: 'fiberThermalBonded' },
  { key: 'fiberAntiMicrobial' },
  { key: 'fiberFireRetardant' },
  { key: 'fiberCertification' },
  { key: 'fiberLoftFillPower' },
];

// Yarn is built specially because its first token is itself a "Doubling/Count×Ply"
// composite. The remaining tokens follow the generic rule.
const YARN_TAIL_FIELDS = [
  { key: 'yarnComposition', format: composition },
  { key: 'yarnType' },
  { key: 'windingOptions' },
  { key: 'yarnColour' },
];

// Stitching Thread is a Yarn sub-material with its own spec fields (no
// doubling/count/ply). It leads with a "Stitching Thread" label.
const STITCHING_THREAD_LABEL = 'Stitching Thread';
const STITCHING_THREAD_FIELDS = [
  { key: 'stitchingThreadType' },
  { key: 'stitchingThreadFibreContent', format: composition },
  { key: 'stitchingThreadCountTicket' },
  { key: 'stitchingThreadTex' },
  { key: 'stitchingThreadPly' },
  { key: 'stitchingThreadColour' },
  { key: 'stitchingThreadFinish' },
  { key: 'stitchingThreadBrand' },
];

// ---- Trim & Accessory --------------------------------------------------------
// Each trim category has its own BASIC syntax. The generated description leads
// with the category label, then the category's basic spec fields (advance-spec
// fields are intentionally excluded). `dims` builds "<len>x<wid><suffix>" and a
// `GSM` token gets the numeric "GSM" suffix; all other values are kept verbatim.

// Leading category-name token, matching the syntax sheet's wording.
const TRIM_CATEGORY_LABEL = {
  BUCKLES: 'Buckles',
  BUTTONS: 'Buttons',
  'CABLE-TIES': 'Cable-Ties',
  'CORD STOPS': 'Cord Stops',
  FELT: 'Felt',
  'HOOKS-EYES': 'Hooks-Eyes',
  'INTERLINING(FUSING)': 'Interlining (Fusing)',
  'MAGNETIC CLOSURE': 'Magnetic Closure',
  'PIN-BARBS': 'Pin-Barbs',
  'REFLECTIVE TAPES': 'Reflective Tapes',
  'RINGS-LOOPS': 'Rings-Loops',
  RIVETS: 'Rivets',
  'SEAM TAPE': 'Seam Tape',
  'SHOULDER PADS': 'Shoulder Pads',
  VELCRO: 'Velcro',
  'NIWAR-WEBBING': 'Niwar-Webbing',
  RIBBING: 'Ribbing',
  LACE: 'Lace',
  'FIRE RETARDANT (FR) TRIMS': 'FR Trims',
  ZIPPERS: 'Zippers',
};

// token === 'GSM' -> numeric GSM suffix; { lengthKey, widthKey, suffix } -> dims.
const TRIM_FIELD_MAP = {
  ZIPPERS: [
    { token: 'Zip #', key: 'zipNumber' },
    { token: 'Type', key: 'zipType' },
    { token: 'Brand', key: 'brand' },
    { token: 'Teeth', key: 'teeth' },
    { token: 'Puller', key: 'puller' },
    { token: 'Puller Type', key: 'pullerType' },
    { token: 'Length', key: 'length' },
  ],
  BUTTONS: [
    { token: 'Type', key: 'buttonType' },
    { token: 'Material', key: 'buttonMaterial' },
    { token: 'Size', key: 'buttonSize' },
    { token: 'Ligne', key: 'buttonLigne' },
    { token: 'Holes', key: 'buttonHoles' },
    { token: 'Finish/Colour', key: 'buttonFinishColour' },
    { token: 'Placement', key: 'buttonPlacement' },
  ],
  VELCRO: [
    { token: 'Part', key: 'velcroPart' },
    { token: 'Type', key: 'velcroType' },
    { token: 'Material', key: 'velcroMaterial' },
    { token: 'Attachment', key: 'velcroAttachment' },
    { token: 'GSM', key: 'velcroGsm' },
    { lengthKey: 'velcroLengthCm', widthKey: 'velcroWidthCm', suffix: 'cm' },
    { token: 'Placement', key: 'velcroPlacement' },
  ],
  RIVETS: [
    { token: 'Type', key: 'rivetType' },
    { token: 'Material', key: 'rivetMaterial' },
    { token: 'Cap Size', key: 'rivetCapSize' },
    { token: 'Post Height', key: 'rivetPostHeight' },
    { token: 'Finish/Plating', key: 'rivetFinishPlating' },
    { token: 'Placement', key: 'rivetPlacement' },
  ],
  'NIWAR-WEBBING': [
    { token: 'Type', key: 'niwarType' },
    { token: 'Material', key: 'niwarMaterial' },
    { token: 'No of Colours', key: 'niwarColour' },
    { token: 'Weave Pattern', key: 'niwarWeavePattern' },
    { token: 'GSM', key: 'niwarGsm' },
    { lengthKey: 'niwarLengthCm', widthKey: 'niwarWidthCm', suffix: 'cm' },
    { token: 'Placement', key: 'niwarPlacement' },
  ],
  LACE: [
    { token: 'Type', key: 'laceType' },
    { token: 'Material', key: 'laceMaterial' },
    { token: 'Colour', key: 'laceColour' },
    { token: 'Design Ref', key: 'laceDesignRef' },
    { token: 'GSM', key: 'laceGsm' },
    { lengthKey: 'laceLengthCm', widthKey: 'laceWidthCm', suffix: 'cm' },
    { token: 'Placement', key: 'lacePlacement' },
  ],
  FELT: [
    { token: 'Type', key: 'feltType' },
    { token: 'Material', key: 'feltMaterial' },
    { token: 'Colour', key: 'feltColour' },
    { token: 'GSM', key: 'feltGsm' },
    { lengthKey: 'feltLengthCm', widthKey: 'feltWidthCm', suffix: 'cm' },
  ],
  'INTERLINING(FUSING)': [
    { token: 'Type', key: 'interliningType' },
    { token: 'Material', key: 'interliningMaterial' },
    { token: 'Adhesive Type', key: 'interliningAdhesiveType' },
    { token: 'Colour', key: 'interliningColour' },
    { token: 'GSM', key: 'interliningGsm' },
    { lengthKey: 'interliningLength', widthKey: 'interliningWidth', suffix: 'cm' },
    { token: 'Placement', key: 'interliningPlacement' },
  ],
  'HOOKS-EYES': [
    { token: 'Type', key: 'hookEyeType' },
    { token: 'Material', key: 'hookEyeMaterial' },
    { token: 'Size', key: 'hookEyeSize' },
    { token: 'Colour Finish', key: 'hookEyeColourFinish' },
    { token: 'Finish Type', key: 'hookEyeFinishType' },
    { token: 'Placement', key: 'hookEyePlacement' },
  ],
  BUCKLES: [
    { token: 'Type', key: 'bucklesType' },
    { token: 'Material Desc.', key: 'bucklesMaterial' },
    { token: 'Size', key: 'bucklesSize' },
    { token: 'Finish/Colour', key: 'bucklesFinishColour' },
    { token: 'Placement', key: 'bucklesPlacement' },
  ],
  'SHOULDER PADS': [
    { token: 'Type', key: 'shoulderPadType' },
    { token: 'Material', key: 'shoulderPadMaterial' },
    { token: 'Size Spec', key: 'shoulderPadSize' },
    { token: 'Thickness', key: 'shoulderPadThickness' },
    { token: 'Shape', key: 'shoulderPadShape' },
    { token: 'Covering', key: 'shoulderPadCovering' },
    { token: 'Covering Colour', key: 'shoulderPadCoveringColour' },
    { token: 'Attachment', key: 'shoulderPadAttachment' },
    { token: 'Density', key: 'shoulderPadDensity' },
    { token: 'Placement', key: 'shoulderPadPlacement' },
  ],
  RIBBING: [
    { token: 'Type', key: 'ribbingType' },
    { token: 'Material', key: 'ribbingMaterial' },
    { token: 'No of Colours', key: 'ribbingColour' },
    { token: 'Placement', key: 'ribbingPlacement' },
  ],
  'CABLE-TIES': [
    { token: 'Type', key: 'cableTieType' },
    { token: 'Material', key: 'cableTieMaterial' },
    { token: 'Size Spec', key: 'cableTieSize' },
    { token: 'Colour', key: 'cableTieColour' },
    { token: 'Placement', key: 'cableTiePlacement' },
  ],
  'SEAM TAPE': [
    { token: 'Type', key: 'seamTapeType' },
    { token: 'Material', key: 'seamTapeMaterial' },
    { token: 'Width', key: 'seamTapeWidth' },
    { token: 'Colour', key: 'seamTapeColour' },
    { token: 'Adhesive Type', key: 'seamTapeAdhesiveType' },
    { token: 'Placement', key: 'seamTapePlacement' },
  ],
  'REFLECTIVE TAPES': [
    { token: 'Type', key: 'reflectiveTapeType' },
    { token: 'Material', key: 'reflectiveTapeMaterial' },
    { token: 'Colour', key: 'reflectiveTapeColour' },
    { token: 'Base Fabric', key: 'reflectiveTapeBaseFabric' },
    { token: 'GSM', key: 'reflectiveTapeGsm' },
    { lengthKey: 'reflectiveTapeLengthCm', widthKey: 'reflectiveTapeWidthCm', suffix: 'cm' },
    { token: 'Placement', key: 'reflectiveTapePlacement' },
  ],
  'FIRE RETARDANT (FR) TRIMS': [
    { token: 'Type', key: 'frTrimsType' },
    { token: 'Material', key: 'frTrimsMaterial' },
    { token: 'Compliance', key: 'frTrimsCompliance' },
    { token: 'Colour', key: 'frTrimsColour' },
    { token: 'Placement', key: 'frTrimsPlacement' },
  ],
  'CORD STOPS': [
    { token: 'Type', key: 'cordStopType' },
    { token: 'Material', key: 'cordStopMaterial' },
    { token: 'Size Spec', key: 'cordStopSize' },
    { token: 'Colour', key: 'cordStopColour' },
    { token: 'Locking Mechanism', key: 'cordStopLockingMechanism' },
    { token: 'Placement', key: 'cordStopPlacement' },
  ],
  'RINGS-LOOPS': [
    { token: 'Type', key: 'ringsLoopsType' },
    { token: 'Material', key: 'ringsLoopsMaterial' },
    { token: 'Size Spec', key: 'ringsLoopsSize' },
    { token: 'Thickness/Gauge', key: 'ringsLoopsThicknessGauge' },
    { token: 'Finish/Plating', key: 'ringsLoopsFinishPlating' },
    { token: 'Placement', key: 'ringsLoopsPlacement' },
  ],
  'PIN-BARBS': [
    { token: 'Type', key: 'pinBarbType' },
    { token: 'Material', key: 'pinBarbMaterial' },
    { token: 'Size Spec', key: 'pinBarbSize' },
    { token: 'Colour', key: 'pinBarbColour' },
    { token: 'Head Type', key: 'pinBarbHeadType' },
    { token: 'Placement', key: 'pinBarbPlacement' },
  ],
  'MAGNETIC CLOSURE': [
    { token: 'Type', key: 'magneticClosureType' },
    { token: 'Material', key: 'magneticClosureMaterial' },
    { token: 'Size Spec', key: 'magneticClosureSize' },
    { token: 'Placement', key: 'magneticClosurePlacement' },
  ],
};

const buildTrimPart = (material, def) => {
  if (def.lengthKey) {
    const a = clean(material[def.lengthKey]);
    const b = clean(material[def.widthKey]);
    if (!a || !b) return '';
    return `${a}x${b}${def.suffix || ''}`;
  }
  const raw = clean(material[def.key]);
  if (!raw) return '';
  return def.token === 'GSM' ? gsm(raw) : raw;
};

// ---- Artwork & Labeling ------------------------------------------------------
// Each artwork category has dedicated, prefixed spec fields (e.g. labelsBrand*),
// many with an "OTHERS (TEXT)" dropdown option that stores the real value in a
// sibling `*Text` field. "Size" is stored as separate width/height/unit (and a
// gusset for Header Card). The description leads with the category label.

const ARTWORK_CATEGORY_LABEL = {
  'LABELS (BRAND/MAIN)': 'Label',
  'CARE & COMPOSITION': 'Care & Composition',
  'TAGS & SPECIAL LABELS': 'Tags & Special Labels',
  'FLAMMABILITY / SAFETY LABELS': 'Flammability / Safety Labels',
  'RFID / SECURITY TAGS': 'RFID / Security Tags',
  'LAW LABEL / CONTENTS TAG': 'Law Label / Contents Tag',
  'PRICE TICKET / BARCODE TAG': 'Price Ticket / Barcode Tag',
  'HEAT TRANSFER LABELS': 'Heat Transfer Labels',
  'UPC LABEL / BARCODE STICKER': 'UPC Label / Barcode Sticker',
  'SIZE LABELS (INDIVIDUAL)': 'Size Labels (Individual)',
  'ANTI-COUNTERFEIT & HOLOGRAMS': 'Anti-Counterfeit & Holograms',
  'QC / INSPECTION LABELS': 'QC / Inspection Labels',
  'BELLY BAND / WRAPPER': 'Belly Band / Wrapper',
  'INSERT CARDS': 'Insert Cards',
  'HEADER CARD': 'Header Card',
  RIBBONS: 'Ribbons',
  'HANG TAG SEALS / STRINGS': 'Hang Tag Seals / Strings',
};

// Descriptor shapes:
//   { token, key, textKey? }                              simple value (textKey = OTHERS fallback)
//   { token: 'Size', widthKey, heightKey, unitKey }       2-D size -> "WxH<unit>"
//   { token: 'Size', lengthKey, widthKey, gussetKey, unitKey }  3-D size -> "LxWxG<unit>"
//   { literal: 'Brand/Main' }                             fixed token (no field)
const ARTWORK_FIELD_MAP = {
  'LABELS (BRAND/MAIN)': [
    { literal: 'Brand/Main' },
    { token: 'Type', key: 'labelsBrandType', textKey: 'labelsBrandTypeText' },
    { token: 'Material', key: 'labelsBrandMaterial', textKey: 'labelsBrandMaterialText' },
    { token: 'Attachment', key: 'labelsBrandAttachment', textKey: 'labelsBrandAttachmentText' },
    { token: 'Size', widthKey: 'labelsBrandSizeWidth', heightKey: 'labelsBrandSizeHeight', unitKey: 'labelsBrandSizeUnit' },
    { token: 'Placement', key: 'labelsBrandPlacement' },
  ],
  'CARE & COMPOSITION': [
    { token: 'Type', key: 'careCompositionType', textKey: 'careCompositionTypeText' },
    { token: 'Material', key: 'careCompositionMaterial', textKey: 'careCompositionMaterialText' },
    { token: 'Size', widthKey: 'careCompositionSizeWidth', heightKey: 'careCompositionSizeLength', unitKey: 'careCompositionSizeUnit' },
    { token: 'Placement', key: 'careCompositionPlacement' },
  ],
  'TAGS & SPECIAL LABELS': [
    { token: 'Type', key: 'tagsSpecialLabelsType', textKey: 'tagsSpecialLabelsTypeText' },
    { token: 'Material', key: 'tagsSpecialLabelsMaterial', textKey: 'tagsSpecialLabelsMaterialText' },
    { token: 'Size', widthKey: 'tagsSpecialLabelsSizeWidth', heightKey: 'tagsSpecialLabelsSizeHeight', unitKey: 'tagsSpecialLabelsSizeUnit' },
    { token: 'Attachment', key: 'tagsSpecialLabelsAttachment', textKey: 'tagsSpecialLabelsAttachmentText' },
    { token: 'Finishing', key: 'tagsSpecialLabelsFinishing', textKey: 'tagsSpecialLabelsFinishingText' },
    { token: 'Placement', key: 'tagsSpecialLabelsPlacement' },
  ],
  'FLAMMABILITY / SAFETY LABELS': [
    { token: 'Type', key: 'flammabilitySafetyType', textKey: 'flammabilitySafetyTypeText' },
    { token: 'Material', key: 'flammabilitySafetyMaterial', textKey: 'flammabilitySafetyMaterialText' },
    { token: 'Size', widthKey: 'flammabilitySafetySizeWidth', heightKey: 'flammabilitySafetySizeHeight', unitKey: 'flammabilitySafetySizeUnit' },
    { token: 'Placement', key: 'flammabilitySafetyPlacement' },
  ],
  'RFID / SECURITY TAGS': [
    { token: 'Type', key: 'rfidType', textKey: 'rfidTypeText' },
    { token: 'Form Factor', key: 'rfidFormFactor', textKey: 'rfidFormFactorText' },
    { token: 'Chip Model', key: 'rfidChipModel', textKey: 'rfidChipModelText' },
    { token: 'Size', widthKey: 'rfidSizeWidth', heightKey: 'rfidSizeHeight', unitKey: 'rfidSizeUnit' },
  ],
  'LAW LABEL / CONTENTS TAG': [
    { token: 'Type', key: 'lawLabelType', textKey: 'lawLabelTypeText' },
    { token: 'Material', key: 'lawLabelMaterial', textKey: 'lawLabelMaterialText' },
    { token: 'Size', widthKey: 'lawLabelSizeWidth', heightKey: 'lawLabelSizeHeight', unitKey: 'lawLabelSizeUnit' },
    { token: 'Placement', key: 'lawLabelPlacement' },
  ],
  'PRICE TICKET / BARCODE TAG': [
    { token: 'Type', key: 'priceTicketType', textKey: 'priceTicketTypeText' },
    { token: 'Material', key: 'priceTicketMaterial', textKey: 'priceTicketMaterialText' },
    { token: 'Size', widthKey: 'priceTicketSizeWidth', heightKey: 'priceTicketSizeHeight', unitKey: 'priceTicketSizeUnit' },
    { token: 'Placement', key: 'priceTicketPlacement' },
  ],
  'HEAT TRANSFER LABELS': [
    { token: 'Type', key: 'heatTransferType', textKey: 'heatTransferTypeText' },
    { token: 'Material Base', key: 'heatTransferMaterialBase', textKey: 'heatTransferMaterialBaseText' },
    { token: 'Size', widthKey: 'heatTransferSizeWidth', heightKey: 'heatTransferSizeHeight', unitKey: 'heatTransferSizeUnit' },
    { token: 'Placement', key: 'heatTransferPlacement' },
  ],
  'UPC LABEL / BARCODE STICKER': [
    { token: 'Type', key: 'upcBarcodeType', textKey: 'upcBarcodeTypeText' },
    { token: 'Material', key: 'upcBarcodeMaterial', textKey: 'upcBarcodeMaterialText' },
    { token: 'Adhesive', key: 'adhesive' },
    { token: 'Size', widthKey: 'upcBarcodeSizeWidth', heightKey: 'upcBarcodeSizeHeight', unitKey: 'upcBarcodeSizeUnit' },
    { token: 'Placement', key: 'upcBarcodePlacement' },
  ],
  'SIZE LABELS (INDIVIDUAL)': [
    { token: 'Type', key: 'sizeLabelsType', textKey: 'sizeLabelsTypeText' },
    { token: 'Material', key: 'sizeLabelsMaterial', textKey: 'sizeLabelsMaterialText' },
    { token: 'Size', widthKey: 'sizeLabelsSizeWidth', heightKey: 'sizeLabelsSizeHeight', unitKey: 'sizeLabelsSizeUnit' },
    { token: 'Size System', key: 'sizeLabelsSizeSystem', textKey: 'sizeLabelsSizeSystemText' },
    { token: 'Size/Code', key: 'sizeLabelsSizeCode', textKey: 'sizeLabelsSizeCodeText' },
    { token: 'Fold Type', key: 'sizeLabelsFoldType', textKey: 'sizeLabelsFoldTypeText' },
    { token: 'Placement', key: 'sizeLabelsPlacementText' },
  ],
  'ANTI-COUNTERFEIT & HOLOGRAMS': [
    { token: 'Type', key: 'antiCounterfeitType', textKey: 'antiCounterfeitTypeText' },
    { token: 'Material', key: 'antiCounterfeitMaterial', textKey: 'antiCounterfeitMaterialText' },
    { token: 'Size', widthKey: 'antiCounterfeitSizeWidth', heightKey: 'antiCounterfeitSizeHeight', unitKey: 'antiCounterfeitSizeUnit' },
    { token: 'Security', key: 'securityFeature', textKey: 'securityFeatureText' },
    { token: 'Hologram Type', key: 'hologramType', textKey: 'hologramTypeText' },
    { token: 'Numbering', key: 'numbering', textKey: 'numberingText' },
    { token: 'Placement', key: 'antiCounterfeitPlacement' },
  ],
  'QC / INSPECTION LABELS': [
    { token: 'Type', key: 'qcInspectionType', textKey: 'qcInspectionTypeText' },
    { token: 'Material', key: 'qcInspectionMaterial', textKey: 'qcInspectionMaterialText' },
    { token: 'Size', widthKey: 'qcInspectionSizeWidth', heightKey: 'qcInspectionSizeHeight', unitKey: 'qcInspectionSizeUnit' },
    { token: 'Content', key: 'qcInspectionContent', textKey: 'qcInspectionContentText' },
    { token: 'Coding System', key: 'qcInspectionCodingSystem', textKey: 'qcInspectionCodingSystemText' },
    { token: 'Gumming Quality', key: 'qcInspectionGummingQuality', textKey: 'qcInspectionGummingQualityText' },
    { token: 'Placement', key: 'qcInspectionPlacement' },
  ],
  'BELLY BAND / WRAPPER': [
    { token: 'Type', key: 'bellyBandType', textKey: 'bellyBandTypeText' },
    { token: 'Material', key: 'bellyBandMaterial', textKey: 'bellyBandMaterialText' },
    { token: 'Durability', key: 'permanence' },
    { token: 'Size', widthKey: 'bellyBandSizeWidth', heightKey: 'bellyBandSizeHeight', unitKey: 'bellyBandSizeUnit' },
    { token: 'Closure', key: 'bellyBandClosure', textKey: 'bellyBandClosureText' },
    { token: 'Placement', key: 'bellyBandPlacement' },
  ],
  'INSERT CARDS': [
    { token: 'Type', key: 'insertCardsType', textKey: 'insertCardsTypeText' },
    { token: 'Material', key: 'insertCardsMaterial', textKey: 'insertCardsMaterialText' },
    { token: 'Size', widthKey: 'insertCardsSizeWidth', heightKey: 'insertCardsSizeHeight', unitKey: 'insertCardsSizeUnit' },
    { token: 'Placement', key: 'insertCardsPlacement' },
  ],
  'HEADER CARD': [
    { token: 'Type', key: 'headerCardType', textKey: 'headerCardTypeText' },
    { token: 'Material', key: 'headerCardMaterial', textKey: 'headerCardMaterialText' },
    { token: 'Size', lengthKey: 'headerCardSizeLength', widthKey: 'headerCardSizeWidth', gussetKey: 'headerCardSizeGusset', unitKey: 'headerCardSizeUnit' },
    { token: 'Placement', key: 'headerCardPlacement' },
  ],
  RIBBONS: [
    { token: 'Type', key: 'ribbonsType', textKey: 'ribbonsTypeText' },
    { token: 'Material', key: 'ribbonsMaterial', textKey: 'ribbonsMaterialText' },
    { token: 'Width', key: 'ribbonsWidth' },
    { token: 'Roll Length', key: 'ribbonsRollLength' },
  ],
  'HANG TAG SEALS / STRINGS': [
    { token: 'Type', key: 'hangTagSealsType', textKey: 'hangTagSealsTypeText' },
    { token: 'Material', key: 'hangTagSealsMaterial', textKey: 'hangTagSealsMaterialText' },
    { token: 'Size', widthKey: 'hangTagSealsSizeWidth', heightKey: 'hangTagSealsSizeHeight', unitKey: 'hangTagSealsSizeUnit' },
    { token: 'Placement', key: 'hangTagSealsPlacement' },
  ],
};

// Resolve a value, falling back to the "OTHERS (TEXT)" sibling when the dropdown
// is set to OTHERS (or empty) and a text value exists.
const resolveArtworkValue = (material, def) => {
  let v = clean(material[def.key]);
  if (def.textKey && (v === '' || /others/i.test(v))) {
    const t = clean(material[def.textKey]);
    if (t) v = t;
  }
  return v;
};

const buildArtworkPart = (material, def) => {
  if (def.literal) return def.literal;
  if (def.token === 'Size') {
    const unit = clean(material[def.unitKey]);
    if (def.gussetKey) {
      const l = clean(material[def.lengthKey]);
      const w = clean(material[def.widthKey]);
      const g = clean(material[def.gussetKey]);
      if (!l || !w) return '';
      const dims = g ? `${l}x${w}x${g}` : `${l}x${w}`;
      return `${dims}${unit}`;
    }
    const w = clean(material[def.widthKey]);
    const h = clean(material[def.heightKey]);
    if (!w || !h) return '';
    return `${w}x${h}${unit}`;
  }
  return resolveArtworkValue(material, def);
};

// ---- Packaging Materials -----------------------------------------------------
// Categories keyed by `packagingMaterialType`. Unlike artwork, the packaging
// sheet lists "Unit" as its OWN token (separate from the dimensions), so dims
// build to "LxWxH" (or "LxW"/"WxH") with no unit, and Unit is a normal field.
// Dimension values already carry their own units in other fields (e.g.
// "175 lbs", "40 Gauge", "80 GSM"), so those stay verbatim.

const PACKAGING_CATEGORY_LABEL = {
  'CARTON BOX': 'Carton Box',
  'CORNER PROTECTORS': 'Corner Protectors',
  'EDGE PROTECTORS': 'Edge Protectors',
  'FOAM INSERT': 'Foam Insert',
  'PALLET STRAP': 'Pallet Strap',
  DIVIDER: 'Divider',
  TAPE: 'Tape',
  'POLYBAG~POLYBAG-FLAP': 'Polybag~Polybag-Flap',
  'POLYBAG~Bale': 'Polybag~Bale',
  'SILICA GEL DESICCANT': 'Silica Gel Desiccant',
  'VOID~FILL': 'Void~Fill',
  'SHIPPING MARK': 'Shipping Mark',
};

// Descriptor shapes:
//   { token, key, textKey? }                                   simple value
//   { token: 'Dimensions', lengthKey, widthKey, heightKey? }   -> "LxWxH" / "LxW"
//   { token: 'Size', widthKey, heightKey }                     -> "WxH"
//   { token: 'Unit', key }                                     the dimension unit, own token
const PACKAGING_FIELD_MAP = {
  'CARTON BOX': [
    { token: 'Type', key: 'cartonBoxType' },
    { token: '# of Plys', key: 'cartonBoxNoOfPlys' },
    { token: 'Board Grade', key: 'cartonBoxBoardGrade' },
    { token: 'Joint Type', key: 'cartonBoxJointType' },
    { token: 'Bursting Strength', key: 'cartonBoxBurstingStrength' },
    { token: 'Stiffener Required', key: 'cartonBoxStiffenerRequired' },
    { token: 'Dimensions', lengthKey: 'cartonBoxLength', widthKey: 'cartonBoxWidth', heightKey: 'cartonBoxHeight' },
    { token: 'Unit', key: 'cartonBoxDimensionsUnit' },
  ],
  'CORNER PROTECTORS': [
    { token: 'Type', key: 'cornerProtectorType' },
    { token: 'Material', key: 'cornerProtectorMaterial' },
    { token: 'Leg Length', key: 'cornerProtectorLegLength' },
    { token: 'Thickness', key: 'cornerProtectorThickness' },
    { token: 'Height/Length', key: 'cornerProtectorHeightLength' },
    { token: 'Load Capacity', key: 'cornerProtectorLoadCapacity' },
    { token: 'Color', key: 'cornerProtectorColor' },
  ],
  'EDGE PROTECTORS': [
    { token: 'Type', key: 'edgeProtectorType' },
    { token: 'Material', key: 'edgeProtectorMaterial' },
    { token: 'Wing Size', key: 'edgeProtectorWingSize' },
    { token: 'Thickness', key: 'edgeProtectorThickness' },
    { token: 'Length', key: 'edgeProtectorLength' },
    { token: 'Ply/Layers', key: 'edgeProtectorPlyLayers' },
    { token: 'Color', key: 'edgeProtectorColor' },
  ],
  'FOAM INSERT': [
    { token: 'Type', key: 'foamInsertType' },
    { token: 'Material', key: 'foamInsertMaterial' },
    { token: 'Density', key: 'foamInsertDensity' },
    { token: 'Thickness', key: 'foamInsertThickness' },
    { token: 'Dimensions', lengthKey: 'foamInsertLength', widthKey: 'foamInsertWidth', heightKey: 'foamInsertHeight' },
    { token: 'Unit', key: 'foamInsertDimensionsUnit' },
    { token: 'Color', key: 'foamInsertColor' },
  ],
  'PALLET STRAP': [
    { token: 'Type', key: 'palletStrapType' },
    { token: 'Application', key: 'palletStrapApplication' },
    { token: 'Width', key: 'palletStrapWidth' },
    { token: 'Seal Type', key: 'palletStrapSealType' },
    { token: 'Seal Size', key: 'palletStrapSealSize' },
    { token: 'Color', key: 'palletStrapColor' },
  ],
  DIVIDER: [
    { token: 'Type', key: 'dividerType' },
    { token: 'Material', key: 'dividerMaterial' },
    { token: 'Cell Configuration', key: 'dividerCellConfiguration' },
    { token: 'Cell Size', lengthKey: 'dividerCellSizeLength', widthKey: 'dividerCellSizeWidth' },
    { token: 'Unit', key: 'dividerCellSizeUnit' },
    { token: 'Height', key: 'dividerHeight' },
    { token: 'Board Thickness', key: 'dividerBoardThickness' },
    { token: 'Slot Depth', key: 'dividerSlotDepth' },
    { token: 'Color', key: 'dividerColor' },
  ],
  TAPE: [
    { token: 'Type', key: 'tapeType' },
    { token: 'Material', key: 'tapeMaterial' },
    { token: 'Gauge/Thickness (Micron)', key: 'tapeGaugeThickness' },
    { token: 'Width', key: 'tapeWidth' },
    { token: 'Length', key: 'tapeLength' },
    { token: 'Gumming Quality', key: 'tapeGummingQuality' },
  ],
  'POLYBAG~POLYBAG-FLAP': [
    { token: 'Packaging Type', key: 'polybagPolybagFlapPackagingType' },
    { token: 'Inner Casepack', key: 'polybagPolybagFlapInnerCasepack' },
    { token: 'Type', key: 'polybagPolybagFlapType' },
    { token: 'Material', key: 'polybagPolybagFlapMaterial' },
    { token: 'Dimensions', lengthKey: 'polybagPolybagFlapLength', widthKey: 'polybagPolybagFlapWidth' },
    { token: 'Gauge/Gauss', key: 'polybagPolybagFlapGaugeThickness' },
    { token: 'Flap Required', key: 'polybagPolybagFlapFlapRequired' },
  ],
  'POLYBAG~Bale': [
    { token: 'Packaging Type', key: 'polybagBalePackagingType' },
    { token: 'Inner Casepack', key: 'polybagBaleInnerCasepack' },
    { token: 'Type', key: 'polybagBaleType' },
    { token: 'Material', key: 'polybagBaleMaterial' },
    { token: 'Gauge/GSM', key: 'polybagBaleGaugeGsm' },
    { token: 'Roll Width', key: 'polybagBaleRollWidth' },
    { token: 'Unit', key: 'polybagBaleRollWidthUnit' },
    { token: 'Colour', key: 'polybagBaleColour' },
  ],
  'SILICA GEL DESICCANT': [
    { token: 'Type', key: 'silicaGelDesiccantType' },
    { token: 'Form', key: 'silicaGelDesiccantForm' },
    { token: 'Unit Size (Grams)', key: 'silicaGelDesiccantUnitSize' },
    { token: 'Color', key: 'silicaGelDesiccantColor' },
    { token: 'Placement', key: 'silicaGelDesiccantPlacement' },
  ],
  'VOID~FILL': [
    { token: 'Type', key: 'voidFillType' },
    { token: 'Material', key: 'voidFillMaterial' },
    { token: 'Paper Type', key: 'voidFillPaperType' },
    { token: 'Paper Weight', key: 'voidFillPaperWeight' },
    { token: 'Color', key: 'voidFillColor' },
  ],
  'SHIPPING MARK': [
    { token: 'Type', key: 'shippingMarkType' },
    { token: 'Material', key: 'shippingMarkMaterial' },
    { token: 'Size', widthKey: 'shippingMarkSizeWidth', heightKey: 'shippingMarkSizeHeight' },
    { token: 'Unit', key: 'shippingMarkSizeUnit' },
    { token: 'Placement', key: 'shippingMarkPlacementText' },
  ],
};

// Dimensions builder: joins length/width/height (in that fixed order) with 'x',
// dropping trailing empties so a carton with no height (stiffener variant)
// becomes "LxW". Requires at least two dimensions; a gap between present dims
// is treated as incomplete.
const buildDims = (material, def) => {
  let vals = ['lengthKey', 'widthKey', 'heightKey']
    .filter((k) => def[k])
    .map((k) => clean(material[def[k]]));
  while (vals.length && vals[vals.length - 1] === '') vals.pop();
  if (vals.length < 2 || vals.some((v) => v === '')) return '';
  return vals.join('x');
};

const buildPackagingPart = (material, def) => {
  if (def.lengthKey || def.widthKey) return buildDims(material, def);
  const v = clean(material[def.key]);
  if (def.textKey && (v === '' || /others/i.test(v))) {
    const t = clean(material[def.textKey]);
    if (t) return t;
  }
  return v;
};

export const MATERIAL_TYPE_FIELDS = {
  Fabric: FABRIC_FIELDS,
  // Foam is handled specially (prefix per sub-type) via buildFoamParts.
  Fiber: FIBER_FIELDS,
  Yarn: [
    { key: 'yarnDoublingOptions' },
    { key: 'yarnCountRange' },
    { key: 'yarnPlyOptions' },
    ...YARN_TAIL_FIELDS,
  ],
};

const buildPart = (material, def) => {
  if (def.dims) {
    const a = clean(material[def.dims[0]]);
    const b = clean(material[def.dims[1]]);
    if (!a || !b) return '';
    return `${a}x${b}${def.suffix || ''}`;
  }
  const fmt = def.format || clean;
  return fmt(material[def.key]);
};

const yarnFirstToken = (material) => {
  const doubling = clean(material.yarnDoublingOptions);
  const count = clean(material.yarnCountRange);
  const ply = clean(material.yarnPlyOptions);
  if (!count) {
    // No count: fall back to whatever we have, joined by "/"
    return [doubling, ply].filter(Boolean).join(SEP);
  }
  const countPly = ply ? `${count}x${ply}` : count;
  return doubling ? `${doubling}${SEP}${countPly}` : countPly;
};

/**
 * Build the material description for a raw-material row. Returns '' when there
 * is nothing to build from (so callers can avoid clobbering an existing value).
 *
 * @param {object} material - a single rawMaterials[] entry
 * @returns {string}
 */
export const generateMaterialDescription = (material) => {
  if (!material) return '';
  const type = material.materialType;

  if (type === 'Yarn') {
    // Stitching Thread sub-material has its own fields (no doubling/count/ply).
    if (material.subMaterial === 'Stitching Thread') {
      const parts = [STITCHING_THREAD_LABEL, ...STITCHING_THREAD_FIELDS.map((d) => buildPart(material, d))];
      return parts.filter(Boolean).join(SEP);
    }
    const parts = [yarnFirstToken(material), ...YARN_TAIL_FIELDS.map((d) => buildPart(material, d))];
    return parts.filter(Boolean).join(SEP);
  }

  if (type === 'Trim & Accessory') {
    const defs = TRIM_FIELD_MAP[material.trimAccessory];
    if (!defs) return '';
    const label = TRIM_CATEGORY_LABEL[material.trimAccessory] || material.trimAccessory;
    const parts = [label, ...defs.map((d) => buildTrimPart(material, d))];
    return parts.filter(Boolean).join(SEP);
  }

  if (type === 'Foam') {
    return buildFoamParts(material).filter(Boolean).join(SEP);
  }

  const defs = MATERIAL_TYPE_FIELDS[type];
  if (!defs) return ''; // Artwork/Packaging handled elsewhere

  return defs.map((d) => buildPart(material, d)).filter(Boolean).join(SEP);
};

/**
 * Field keys that drive the description for a given material type. Used to (a)
 * decide whether a change should trigger regeneration and (b) know which source
 * inputs to surface when the user clicks the read-only MATERIAL DESC field.
 *
 * @param {string} materialType
 * @returns {string[]}
 */
export const getDescriptionSourceFields = (materialType, trimCategory, material) => {
  if (materialType === 'Yarn') {
    return [
      // `fiberType` is the top-level Yarn selector; changing it clears the spec
      // fields, so regenerate (typically clearing the description) when it changes.
      // `subMaterial` switches between regular yarn and stitching thread.
      'fiberType',
      'subMaterial',
      'yarnDoublingOptions',
      'yarnCountRange',
      'yarnPlyOptions',
      ...YARN_TAIL_FIELDS.map((d) => d.key),
      ...STITCHING_THREAD_FIELDS.map((d) => d.key),
    ];
  }
  if (materialType === 'Trim & Accessory') {
    const defs = TRIM_FIELD_MAP[trimCategory];
    if (!defs) return [];
    return defs.flatMap((d) => (d.lengthKey ? [d.lengthKey, d.widthKey] : [d.key]));
  }
  if (materialType === 'Foam') {
    // Prefix depends on the selected foamTableType; source keys track that prefix.
    return foamSourceFields(material || {});
  }
  const defs = MATERIAL_TYPE_FIELDS[materialType];
  if (!defs) return [];
  const fields = defs.flatMap((d) => (d.dims ? d.dims : [d.key])).filter((k) => k && k !== '__dims__');
  // Sub-type table selectors reset the dependent spec fields; treat them as
  // triggers so the description regenerates (clears) when they change.
  if (materialType === 'Fiber') fields.push('fiberTableType');
  return fields;
};

/**
 * Build the MATERIAL DESC for an Artwork & Labeling row. Artwork materials are a
 * separate array (keyed by `artworkCategory`, not `materialType`), so they have
 * their own generator. Returns '' when there's nothing to build from.
 *
 * @param {object} material - a single artworkMaterials[] entry
 * @returns {string}
 */
export const generateArtworkDescription = (material) => {
  if (!material) return '';
  const defs = ARTWORK_FIELD_MAP[material.artworkCategory];
  if (!defs) return '';
  const label = ARTWORK_CATEGORY_LABEL[material.artworkCategory] || material.artworkCategory;
  const parts = [label, ...defs.map((d) => buildArtworkPart(material, d))];
  return parts.filter(Boolean).join(SEP);
};

/** Field keys that drive the artwork description for a given category. */
export const getArtworkDescriptionSourceFields = (category) => {
  const defs = ARTWORK_FIELD_MAP[category];
  if (!defs) return [];
  const keys = [];
  defs.forEach((d) => {
    if (d.literal) return;
    if (d.token === 'Size') {
      [d.widthKey, d.heightKey, d.lengthKey, d.gussetKey, d.unitKey].forEach((k) => k && keys.push(k));
    } else {
      if (d.key) keys.push(d.key);
      if (d.textKey) keys.push(d.textKey);
    }
  });
  return keys;
};

/**
 * Build the MATERIAL DESC for a Packaging material row (keyed by
 * `packagingMaterialType`). Returns '' when there's nothing to build from.
 *
 * @param {object} material - a single packaging.materials[] entry
 * @returns {string}
 */
export const generatePackagingDescription = (material) => {
  if (!material) return '';
  const defs = PACKAGING_FIELD_MAP[material.packagingMaterialType];
  if (!defs) return '';
  const label = PACKAGING_CATEGORY_LABEL[material.packagingMaterialType] || material.packagingMaterialType;
  const parts = [label, ...defs.map((d) => buildPackagingPart(material, d))];
  return parts.filter(Boolean).join(SEP);
};

/** Field keys that drive the packaging description for a given category. */
export const getPackagingDescriptionSourceFields = (packagingType) => {
  const defs = PACKAGING_FIELD_MAP[packagingType];
  if (!defs) return [];
  const keys = [];
  defs.forEach((d) => {
    if (d.lengthKey || d.widthKey) {
      [d.lengthKey, d.widthKey, d.heightKey].forEach((k) => k && keys.push(k));
    } else {
      if (d.key) keys.push(d.key);
      if (d.textKey) keys.push(d.textKey);
    }
  });
  return keys;
};

// ---- Syntax templates (shown as the empty-field placeholder) -----------------
// While the spec fields are still empty, the read-only MATERIAL DESC field shows
// the expected token order so the user sees the structure they're building. As
// soon as any field is filled, the generated value replaces this.
const FABRIC_SYNTAX = 'Fabric Name/Composition/GSM/Construction Type/Weave-Knit Type';
const YARN_SYNTAX = 'Doubling/Count×Ply/Composition/Yarn Type/Winding/Colour';
const STITCHING_THREAD_SYNTAX = 'Stitching Thread/Type/Fibre Content/Count-Ticket/Tex/Ply/Colour/Finish/Brand';
const FOAM_SYNTAX = 'Foam Type/Subtype/VA Content/Colour/Thickness/Sheet-Pcs/GSM/LxW';
const FIBER_SYNTAX = 'Fiber Type/Subtype/Form/Denier/Siliconized/Conjugate-Crimp/Colour';

/** Placeholder syntax for a raw-material / trim row (by materialType + trimAccessory). */
export const getMaterialDescriptionSyntax = (material) => {
  if (!material) return '';
  const type = material.materialType;
  if (type === 'Fabric') return FABRIC_SYNTAX;
  if (type === 'Yarn') return material.subMaterial === 'Stitching Thread' ? STITCHING_THREAD_SYNTAX : YARN_SYNTAX;
  if (type === 'Foam') return FOAM_SYNTAX;
  if (type === 'Fiber') return FIBER_SYNTAX;
  if (type === 'Trim & Accessory') {
    const defs = TRIM_FIELD_MAP[material.trimAccessory];
    if (!defs) return '';
    const label = TRIM_CATEGORY_LABEL[material.trimAccessory] || material.trimAccessory;
    return [label, ...defs.map((d) => d.token || 'Size')].join(SEP);
  }
  return '';
};

/** Placeholder syntax for an artwork row (by artworkCategory). */
export const getArtworkDescriptionSyntax = (category) => {
  const defs = ARTWORK_FIELD_MAP[category];
  if (!defs) return '';
  const label = ARTWORK_CATEGORY_LABEL[category] || category;
  return [label, ...defs.map((d) => d.literal || d.token || 'Size')].join(SEP);
};

/** Placeholder syntax for a packaging row (by packagingMaterialType). */
export const getPackagingDescriptionSyntax = (packagingType) => {
  const defs = PACKAGING_FIELD_MAP[packagingType];
  if (!defs) return '';
  const label = PACKAGING_CATEGORY_LABEL[packagingType] || packagingType;
  return [label, ...defs.map((d) => d.token || 'Dimensions')].join(SEP);
};

/** Material types whose description is auto-generated (vs. manually typed). */
export const AUTO_DESCRIPTION_TYPES = ['Fabric', 'Yarn', 'Foam', 'Fiber', 'Trim & Accessory'];

export const isAutoDescriptionType = (materialType) =>
  AUTO_DESCRIPTION_TYPES.includes(materialType);
