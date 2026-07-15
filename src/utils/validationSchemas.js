/**
 * Comprehensive Validation Schemas for Factory Code Generation
 * Covers all material types, work orders, artwork, and packaging
 * 
 * Structure:
 * - required: fields that MUST be filled (non-empty)
 * - advanced: fields that are optional (inside "Advance Spec" sections)
 * - conditional: fields that are required based on other field values
 */

import { SIMPLE_REQUIREMENT_WORK_ORDERS } from './workOrderOptions';

// ==================== FABRIC SCHEMA ====================
export const FABRIC_SCHEMA = {
  required: [
    'fabricFiberType',
    'fabricName', 
    'fabricComposition',
    'gsm',
    'fabricSurplus',
    'fabricWastage',
    'fabricTestingRequirements',
    'fabricApproval',
    'fabricRemarks'
  ],
  advanced: [
    'constructionType',
    'weaveKnitType',
    'fabricMachineType',
    'fabricFiberCategory',
    'fabricOrigin',
    'fabricCertifications'
  ]
};

// ==================== YARN SCHEMAS ====================
export const YARN_BASE_SCHEMA = {
  required: [
    'fiberType',
    'yarnType',
    'yarnComposition',
    'yarnCountRange',
    'yarnDoublingOptions',
    'yarnPlyOptions',
    'windingOptions',
    'surplus',
    'wastage',
    'testingRequirements',
    'approval',
    'remarks'
  ],
  advanced: [
    'spinningType',
    'spinningMethod',
    'fiberCategory',
    'origin',
    'certifications'
  ]
};

export const STITCHING_THREAD_SCHEMA = {
  required: [
    'stitchingThreadType',
    'stitchingThreadFibreContent',
    'stitchingThreadCountTicket',
    'stitchingThreadUseType',
    'stitchingThreadTex',
    'stitchingThreadPly',
    'stitchingThreadColour',
    'stitchingThreadRef',
    'stitchingThreadTestingRequirements',
    'stitchingThreadQty',
    'stitchingThreadUnit',
    'stitchingThreadSurplus',
    'stitchingThreadWastage',
    'stitchingThreadApproval',
    'stitchingThreadRemarks'
  ],
  advanced: [
    'stitchingThreadFinish',
    'stitchingThreadBrand'
  ]
};

// ==================== WORK ORDER SCHEMAS ====================
// Starting / completion dates were removed from the IPC Spec work-order form, so they
// are no longer required. Kept as empty spreads so the per-schema `required` lists and
// `fieldLabels` below stay untouched (each `...WORK_ORDER_DATE_*` is now a no-op).
const WORK_ORDER_DATE_FIELDS = [];
const WORK_ORDER_DATE_LABELS = {};

export const WORK_ORDER_SCHEMAS = {
  ...Object.fromEntries(
    SIMPLE_REQUIREMENT_WORK_ORDERS.map((workOrderType) => [
      workOrderType,
      {
        required: ['isRequired'],
        fieldLabels: { isRequired: 'Requirement selection' }
      }
    ])
  ),
  'BRAIDING': {
    required: ['machineType', 'strandCount', 'widthDiameter', 'gsm', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'braidingDesign', 'pattern'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'KNITTING': {
    required: ['machineType', 'knittingDesignRef', 'knittingGauge', 'knittingGsm', 'knittingWalesRatio', 'knittingCoursesRatio', 'knittingRatioWeightWales', 'knittingRatioWeightCourses', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['knittingDesign', 'knittingVariant'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'QUILTING': {
    required: ['quiltingType', 'stitchLength', 'patternRepeat', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'quiltingDesign', 'needleSpacing'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'PRINTING': {
    required: ['printingType', 'repeatSize', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'printingDesign', 'numberOfScreens', 'colors', 'coveragePercent', 'resolution'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'SEWING': {
    required: ['spi', 'threadType', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['sewingMachineType', 'stitchType', 'variants', 'needleSize'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'FRINGE/TASSELS': {
    // fringeMaterial and tapeHeaderWidth are only applicable when the attachment
    // method isn't "Self-Knotted (through-fabric)" — the form hides those two
    // fields in that mode, so validation must skip them too. See conditional below.
    required: ['fringeType', 'fringeAttachmentMethod', 'dropLength', 'fringeColour', 'fringePlacement', 'fringeQtyType', 'fringeTestingRequirements', 'fringeSurplus', 'fringeWastage', 'fringeApproval', 'fringeRemarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['fringeColourRefImage', 'fringePlacementRefImage', 'fringeFinish', 'fringeConstruction'],
    fieldLabels: WORK_ORDER_DATE_LABELS,
    conditional: {
      'fringeQtyPcs': { when: 'fringeQtyType', equals: 'PCS' },
      'fringeQtyCnsPerPc': { when: 'fringeQtyType', equals: 'LENGTH' },
      'fringeMaterial': { when: 'fringeAttachmentMethod', notEquals: 'Self-Knotted (through-fabric)' },
      'tapeHeaderWidth': { when: 'fringeAttachmentMethod', notEquals: 'Self-Knotted (through-fabric)' }
    }
  },
  'DYEING': {
    required: ['dyeingType', 'colorRef', 'referenceType', 'dyeingReference', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants'],
    fieldLabels: WORK_ORDER_DATE_LABELS,
    conditional: {
      'shrinkageWidthPercent': { when: 'dyeingType', notEmpty: true },
      'shrinkageLengthPercent': { when: 'dyeingType', notEmpty: true }
    }
  },
  'WEAVING': {
    required: ['machineType', 'reed', 'pick', 'gsm', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'weavingDesign', 'advancedWarpRatio', 'advancedWeftRatio'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'TUFTING': {
    required: ['machineType', 'gsm', 'pileHeight', 'tpi', 'wastage', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['tuftingDesign', 'variants', 'machineGauge', 'stitchRate'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'CARPET': {
    required: ['machineType', 'gsm', 'pileHeight', 'tpiKpsi', 'knotType', 'pitchRows', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'carpetDesign'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  },
  'CUTTING': {
    required: ['machineType', 'variants', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['cutType', 'layers', 'nesting', 'wastage'],
    fieldLabels: { machineType: 'Tool type', ...WORK_ORDER_DATE_LABELS }
  },
  'EMBROIDERY': {
    required: ['machineType', 'approval', 'remarks', ...WORK_ORDER_DATE_FIELDS],
    advanced: ['variants', 'embroideryDesign', 'threadColors', 'stitchCount', 'hoopFrameSize'],
    fieldLabels: WORK_ORDER_DATE_LABELS
  }
};

// ==================== TRIM & ACCESSORY SCHEMAS ====================
export const TRIM_ACCESSORY_SCHEMAS = {
  'VELCRO': {
    required: ['velcroPart', 'velcroType', 'velcroMaterial', 'velcroAttachment', 'velcroPlacement', 'velcroGsm', 'velcroLengthCm', 'velcroWidthCm', 'velcroYardageCns', 'velcroKgsCns', 'velcroQtyType', 'velcroSurplus', 'velcroWastage', 'velcroApproval'],
    advanced: ['velcroColour', 'velcroColorReference', 'velcroHookDensity', 'velcroLoopType', 'velcroCycleLife', 'velcroFlameRetardant'],
    conditional: {
      'velcroYardagePerPc': { when: 'velcroQtyType', equals: 'YARDAGE' },
      'velcroKgsPerPc': { when: 'velcroQtyType', equals: 'KGS' }
    }
  },
  'BUTTONS': {
    required: ['buttonType', 'buttonMaterial', 'buttonSize', 'buttonLigne', 'buttonHoles', 'buttonFinishColour', 'buttonPlacement', 'buttonTestingRequirements', 'buttonQty', 'buttonSurplus', 'buttonWastage', 'buttonApproval'],
    advanced: ['buttonAttachment', 'buttonFunction', 'buttonLogo']
  },
  'RIVETS': {
    required: ['rivetType', 'rivetMaterial', 'rivetCapSize', 'rivetPostHeight', 'rivetFinishPlating', 'rivetPlacement', 'rivetTestingRequirements', 'rivetQty', 'rivetSurplus', 'rivetWastage', 'rivetApproval'],
    advanced: ['rivetLogo', 'rivetSetting']
  },
  'NIWAR-WEBBING': {
    required: ['niwarType', 'niwarMaterial', 'niwarColour', 'niwarPlacement', 'niwarTestingRequirements', 'niwarGsm', 'niwarLengthCm', 'niwarWidthCm', 'niwarYardageCns', 'niwarKgsCns', 'niwarQtyType', 'niwarSurplus', 'niwarWastage', 'niwarApproval'],
    advanced: ['niwarThickness', 'niwarFinish', 'niwarTensileStrength', 'niwarEdgeType'],
    conditional: {
      'niwarQtyYardage': { when: 'niwarQtyType', equals: 'YARDAGE' },
      'niwarQtyKgs': { when: 'niwarQtyType', equals: 'KGS' }
    }
  },
  'LACE': {
    required: ['laceType', 'laceMaterial', 'laceColour', 'laceDesignRef', 'lacePlacement', 'laceTestingRequirements', 'laceGsm', 'laceLengthCm', 'laceWidthCm', 'laceSurplus', 'laceWastage', 'laceApproval'],
    advanced: ['laceFinishing', 'laceStretch', 'lacePatternType', 'laceWidth'],
    conditional: {
      'laceQtyYardage': { when: 'laceQtyType', equals: 'YARDAGE' },
      'laceQtyKgs': { when: 'laceQtyType', equals: 'KGS' }
    }
  },
  'ZIPPERS': {
    required: ['zipNumber', 'zipType', 'brand', 'teeth', 'puller', 'pullerType', 'testingRequirement', 'length', 'unitAdditional', 'surplus', 'approval'],
    advanced: ['zipSliderType', 'zipFinish', 'zipLengthTolerance']
  },
  'FELT': {
    required: ['feltType', 'feltMaterial', 'feltColour', 'feltGsm', 'feltLengthCm', 'feltWidthCm', 'feltTestingRequirements', 'feltSurplus', 'feltWastage', 'feltApproval'],
    advanced: ['feltThickness', 'feltFinishForm', 'feltApplication', 'feltStiffness'],
    conditional: {
      'feltYardage': { when: 'feltQtyType', equals: 'YARDAGE' },
      'feltKgs': { when: 'feltQtyType', equals: 'KGS' }
    }
  },
  'INTERLINING(FUSING)': {
    required: ['interliningType', 'interliningMaterial', 'interliningAdhesiveType', 'interliningColour', 'interliningPlacement', 'interliningGsm', 'interliningLength', 'interliningWidth', 'interliningSurplus', 'interliningWastage', 'interliningApproval'],
    advanced: ['interliningDotDensity', 'interliningStretch', 'interliningFusingSpec', 'interliningHandFeel'],
    conditional: {
      'interliningYardage': { when: 'interliningQtyType', equals: 'YARDAGE' },
      'interliningKgs': { when: 'interliningQtyType', equals: 'KGS' }
    }
  },
  'HOOKS-EYES': {
    required: ['hookEyeType', 'hookEyeMaterial', 'hookEyeSize', 'hookEyeColourFinish', 'hookEyeFinishType', 'hookEyePlacement', 'hookEyeQty', 'hookEyeTestingRequirements', 'hookEyeSurplus', 'hookEyeWastage', 'hookEyeApproval'],
    advanced: ['hookEyeStrength', 'hookEyeApplication']
  },
  'BUCKLES': {
    required: ['bucklesType', 'bucklesMaterial', 'bucklesSize', 'bucklesFinishColour', 'bucklesPlacement', 'bucklesTestingRequirements', 'bucklesQty', 'bucklesSurplus', 'bucklesWastage', 'bucklesApproval'],
    advanced: ['bucklesFunction', 'bucklesTensileStrength', 'bucklesSafety']
  },
  'SHOULDER PADS': {
    required: ['shoulderPadType', 'shoulderPadMaterial', 'shoulderPadSize', 'shoulderPadThickness', 'shoulderPadShape', 'shoulderPadCovering', 'shoulderPadCoveringColour', 'shoulderPadAttachment', 'shoulderPadDensity', 'shoulderPadPlacement', 'shoulderPadQty', 'shoulderPadSurplus', 'shoulderPadWastage', 'shoulderPadApproval'],
    advanced: []
  },
  'RIBBING': {
    required: ['ribbingType', 'ribbingMaterial', 'ribbingColour', 'ribbingSurplus', 'ribbingWastage', 'ribbingApproval'],
    advanced: ['ribbingStretchPercent', 'ribbingCutting', 'ribbingSpandexContent', 'ribbingAntiCurl'],
    conditional: {
      'ribbingQtyYardage': { when: 'ribbingQtyType', equals: 'YARDAGE' },
      'ribbingQtyKgs': { when: 'ribbingQtyType', equals: 'KGS' }
    }
  },
  'CABLE-TIES': {
    required: ['cableTieType', 'cableTieMaterial', 'cableTieSize', 'cableTieColour', 'cableTiePlacement', 'cableTieTestingRequirements', 'cableTieQty', 'cableTieSurplus', 'cableTieWastage', 'cableTieApproval'],
    advanced: ['cableTieTensileStrength', 'cableTieFinish', 'cableTieUvResistance']
  },
  'SEAM TAPE': {
    required: ['seamTapeType', 'seamTapeMaterial', 'seamTapeWidth', 'seamTapeColour', 'seamTapeAdhesiveType', 'seamTapePlacement', 'seamTapeTestingRequirements', 'seamTapeQty', 'seamTapeSurplus', 'seamTapeWastage', 'seamTapeApproval'],
    advanced: ['seamTapeApplicationSpec', 'seamTapeElasticity', 'seamTapeBreathability']
  },
  'REFLECTIVE TAPES': {
    required: ['reflectiveTapeType', 'reflectiveTapeMaterial', 'reflectiveTapeColour', 'reflectiveTapeBaseFabric', 'reflectiveTapePlacement', 'reflectiveTapeTestingRequirements', 'reflectiveTapeGsm', 'reflectiveTapeLengthCm', 'reflectiveTapeWidthCm', 'reflectiveTapeSurplus', 'reflectiveTapeWastage', 'reflectiveTapeApproval'],
    advanced: ['reflectiveTapeCertification', 'reflectiveTapeWashDurability', 'reflectiveTapeReflectivity'],
    conditional: {
      'reflectiveTapeYardage': { when: 'reflectiveTapeQtyType', equals: 'YARDAGE' },
      'reflectiveTapeKgs': { when: 'reflectiveTapeQtyType', equals: 'KGS' }
    }
  },
  'FIRE RETARDANT (FR) TRIMS': {
    required: ['frTrimsType', 'frTrimsMaterial', 'frTrimsCompliance', 'frTrimsColour', 'frTrimsTestingRequirements', 'frTrimsPlacement', 'frTrimsSurplus', 'frTrimsWastage', 'frTrimsApproval'],
    advanced: ['frTrimsDurability', 'frTrimsFrComponents', 'frTrimsLoi', 'frTrimsCharLength'],
    conditional: {
      'frTrimsQtyYardage': { when: 'frTrimsQtyType', equals: 'YARDAGE' },
      'frTrimsQtyPieces': { when: 'frTrimsQtyType', equals: 'PIECES' }
    }
  },
  'CORD STOPS': {
    required: ['cordStopType', 'cordStopMaterial', 'cordStopSize', 'cordStopColour', 'cordStopLockingMechanism', 'cordStopPlacement', 'cordStopTestingRequirements', 'cordStopQty', 'cordStopSurplus', 'cordStopWastage', 'cordStopApproval'],
    advanced: ['cordStopFunction', 'cordStopBreakaway']
  },
  'RINGS-LOOPS': {
    required: ['ringsLoopsType', 'ringsLoopsMaterial', 'ringsLoopsSize', 'ringsLoopsThicknessGauge', 'ringsLoopsFinishPlating', 'ringsLoopsPlacement', 'ringsLoopsTestingRequirements', 'ringsLoopsQty', 'ringsLoopsSurplus', 'ringsLoopsWastage', 'ringsLoopsApproval'],
    advanced: ['ringsLoopsLoadRating', 'ringsLoopsWelded', 'ringsLoopsApplication']
  },
  'PIN-BARBS': {
    required: ['pinBarbType', 'pinBarbMaterial', 'pinBarbSize', 'pinBarbColour', 'pinBarbHeadType', 'pinBarbPlacement', 'pinBarbTestingRequirements', 'pinBarbQty', 'pinBarbSurplus', 'pinBarbWastage', 'pinBarbApproval'],
    advanced: ['pinBarbTensileStrength', 'pinBarbApplication', 'pinBarbMagazineCartridge']
  },
  'MAGNETIC CLOSURE': {
    required: ['magneticClosureType', 'magneticClosureMaterial', 'magneticClosureSize', 'magneticClosurePlacement', 'magneticClosureTestingRequirements', 'magneticClosureQty', 'magneticClosureSurplus', 'magneticClosureWastage', 'magneticClosureApproval'],
    advanced: ['magneticClosureStrength', 'magneticClosurePolarity', 'magneticClosureApplication', 'magneticClosureEncasing', 'magneticClosureShielding']
  }
};

// Auto-require mapping for trim/accessory fields (all non-upload, non-remarks, non-advanced)
const TRIM_ACCESSORY_AUTO_PREFIX = {
  'BUTTONS': 'button',
  'VELCRO': 'velcro',
  'RIVETS': 'rivet',
  'NIWAR-WEBBING': 'niwar',
  'LACE': 'lace',
  'FELT': 'felt',
  'INTERLINING(FUSING)': 'interlining',
  'HOOKS-EYES': 'hookEye',
  'BUCKLES': 'buckles',
  'SHOULDER PADS': 'shoulderPad',
  'RIBBING': 'ribbing',
  'CABLE-TIES': 'cableTie',
  'SEAM TAPE': 'seamTape',
  'REFLECTIVE TAPES': 'reflectiveTape',
  'FIRE RETARDANT (FR) TRIMS': 'frTrims',
  'CORD STOPS': 'cordStop',
  'RINGS-LOOPS': 'ringsLoops',
  'PIN-BARBS': 'pinBarb',
  'MAGNETIC CLOSURE': 'magneticClosure'
  // ZIPPERS is excluded because required fields don't share a single prefix
};

Object.entries(TRIM_ACCESSORY_AUTO_PREFIX).forEach(([trimType, prefix]) => {
  if (TRIM_ACCESSORY_SCHEMAS[trimType]) {
    TRIM_ACCESSORY_SCHEMAS[trimType].autoRequirePrefix = prefix;
  }
});

// ==================== FOAM SCHEMAS ====================
export const FOAM_SCHEMAS = {
  'EVA-foam': {
    required: ['foamType', 'foamSubtype', 'foamVaContent', 'foamColour', 'foamThickness', 'foamShape', 'foamSheetPcs', 'foamGsm', 'foamLengthCm', 'foamWidthCm', 'foamKgsCns', 'foamYardageCns', 'foamTestingRequirements', 'foamSurplus', 'foamWastage', 'foamApproval', 'foamRemarks'],
    advanced: ['foamShoreHardness', 'foamCellStructure', 'foamCompressionSet', 'foamTensileStrength', 'foamElongation', 'foamWaterResistance', 'foamUvResistance', 'foamFireRetardant', 'foamSurfaceTexture', 'foamAntiSlip', 'foamInterlocking', 'foamCertification', 'foamDensity']
  },
  'pe-epe': {
    required: ['foamPeEpeType', 'foamPeEpeSubtype', 'foamPeEpeColour', 'foamPeEpeThickness', 'foamPeEpeShape', 'foamPeEpeSheetPcs', 'foamPeEpeGsm', 'foamPeEpeLengthCm', 'foamPeEpeWidthCm', 'foamPeEpeKgsCns', 'foamPeEpeYardageCns', 'foamPeEpeTestingRequirements', 'foamPeEpeSurplus', 'foamPeEpeWastage', 'foamPeEpeApproval', 'foamPeEpeRemarks'],
    advanced: ['foamPeEpeCellStructure', 'foamPeEpeLamination', 'foamPeEpeCrossLinked', 'foamPeEpeAntiStatic', 'foamPeEpeWaterResistance', 'foamPeEpeCushioning', 'foamPeEpeFireRetardant', 'foamPeEpeThermalInsulation', 'foamPeEpeCertification', 'foamPeEpeDensity']
  },
  'pu-foam': {
    required: ['foamPuType', 'foamPuSubtype', 'foamPuGrade', 'foamPuColour', 'foamPuThickness', 'foamPuShape', 'foamPuSheetPcs', 'foamPuGsm', 'foamPuLengthCm', 'foamPuWidthCm', 'foamPuKgsCns', 'foamPuYardageCns', 'foamPuTestingRequirements', 'foamPuSurplus', 'foamPuWastage', 'foamPuApproval', 'foamPuRemarks'],
    advanced: ['foamPuIld', 'foamPuSupportFactor', 'foamPuResilience', 'foamPuCellStructure', 'foamPuCompressionSet', 'foamPuTensileStrength', 'foamPuElongation', 'foamPuFireRetardant', 'foamPuAntiMicrobial', 'foamPuDensity', 'foamPuCertification']
  },
  'rebonded-foam': {
    required: ['foamRebondedType', 'foamRebondedSubtype', 'foamRebondedBonding', 'foamRebondedColour', 'foamRebondedThickness', 'foamRebondedShape', 'foamRebondedSheetPcs', 'foamRebondedGsm', 'foamRebondedLengthCm', 'foamRebondedWidthCm', 'foamRebondedKgsCns', 'foamRebondedYardageCns', 'foamRebondedTestingRequirements', 'foamRebondedSurplus', 'foamRebondedWastage', 'foamRebondedApproval', 'foamRebondedRemarks'],
    advanced: ['foamRebondedIld', 'foamRebondedCompressionSet', 'foamRebondedFireRetardant', 'foamRebondedCertification', 'foamRebondedDensity'],
    conditional: {
      'foamRebondedChipSource': { when: 'foamRebondedType', contains: 'chip' },
      'foamRebondedChipSize': { when: 'foamRebondedType', contains: 'chip' }
    }
  },
  'gel-infused-foam': {
    required: ['foamGelInfusedType', 'foamGelInfusedBaseFoam', 'foamGelInfusedGelType', 'foamGelInfusedGelContent', 'foamGelInfusedSubtype', 'foamGelInfusedColour', 'foamGelInfusedThickness', 'foamGelInfusedShape', 'foamGelInfusedSheetPcs', 'foamGelInfusedGsm', 'foamGelInfusedLengthCm', 'foamGelInfusedWidthCm', 'foamGelInfusedKgsCns', 'foamGelInfusedYardageCns', 'foamGelInfusedTestingRequirements', 'foamGelInfusedSurplus', 'foamGelInfusedWastage', 'foamGelInfusedApproval', 'foamGelInfusedRemarks'],
    advanced: ['foamGelInfusedDensity', 'foamGelInfusedIld', 'foamGelInfusedTemperatureRegulation', 'foamGelInfusedResponseTime', 'foamGelInfusedBreathability', 'foamGelInfusedFireRetardant', 'foamGelInfusedCoolingEffect', 'foamGelInfusedCertification']
  },
  'latex-foam': {
    required: ['foamLatexType', 'foamLatexLatexType', 'foamLatexNaturalContent', 'foamLatexProcess', 'foamLatexSubtype', 'foamLatexColour', 'foamLatexThickness', 'foamLatexShape', 'foamLatexSheetPcs', 'foamLatexGsm', 'foamLatexLengthCm', 'foamLatexWidthCm', 'foamLatexKgsCns', 'foamLatexYardageCns', 'foamLatexTestingRequirements', 'foamLatexSurplus', 'foamLatexWastage', 'foamLatexApproval', 'foamLatexRemarks'],
    advanced: ['foamLatexIld', 'foamLatexResilience', 'foamLatexCompressionSet', 'foamLatexPincorePattern', 'foamLatexZoneConfiguration', 'foamLatexBreathability', 'foamLatexHypoallergenic', 'foamLatexAntiMicrobial', 'foamLatexFireRetardant', 'foamLatexCertification', 'foamLatexDensity']
  },
  'memory-foam': {
    required: ['foamMemoryType', 'foamMemorySubtype', 'foamMemoryGrade', 'foamMemoryColour', 'foamMemoryThickness', 'foamMemoryShape', 'foamMemorySheetPcs', 'foamMemoryGsm', 'foamMemoryLengthCm', 'foamMemoryWidthCm', 'foamMemoryKgsCns', 'foamMemoryYardageCns', 'foamMemoryTestingRequirements', 'foamMemorySurplus', 'foamMemoryWastage', 'foamMemoryApproval', 'foamMemoryRemarks'],
    advanced: ['foamMemoryIld', 'foamMemoryResponseTime', 'foamMemoryTemperatureSensitivity', 'foamMemoryActivationTemperature', 'foamMemoryCompressionSet', 'foamMemoryResilience', 'foamMemoryBreathability', 'foamMemoryInfusion', 'foamMemoryCoolingTechnology', 'foamMemoryFireRetardant', 'foamMemoryVocEmissions', 'foamMemoryDensity', 'foamMemoryCertification']
  },
  'HR-foam': {
    required: ['foamHrType', 'foamHrSubtype', 'foamHrGrade', 'foamHrColour', 'foamHrThickness', 'foamHrShape', 'foamHrSheetPcs', 'foamHrGsm', 'foamHrLengthCm', 'foamHrWidthCm', 'foamHrKgsCns', 'foamHrYardageCns', 'foamHrTestingRequirements', 'foamHrSurplus', 'foamHrWastage', 'foamHrApproval', 'foamHrRemarks'],
    advanced: []
  }
};

// ==================== FIBER SCHEMAS ====================
export const FIBER_SCHEMAS = {
  'Polyester-Fills': {
    required: ['fiberFiberType', 'fiberSubtype', 'fiberForm', 'fiberDenier', 'fiberSiliconized', 'fiberConjugateCrimp', 'fiberColour', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberFiberLength', 'fiberStructure', 'fiberThermalBonded', 'fiberAntiMicrobial', 'fiberFireRetardant', 'fiberCertification', 'fiberLoftFillPower'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyType': { when: 'fiberForm', equals: 'Wadding/Batt' }
    }
  },
  'Down-Feather': {
    required: ['fiberFiberType', 'fiberBirdType', 'fiberForm', 'fiberOrigin', 'fiberDownPercentage', 'fiberColour', 'fiberDownProofRequired', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberFillPower', 'fiberProcessing', 'fiberOxygenNumber', 'fiberTurbidity', 'fiberOdor', 'fiberAntiMicrobial', 'fiberTraceability', 'fiberClusterSize', 'fiberCertification'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding' },
      'fiberQtyType': { when: 'fiberForm', equals: 'Wadding' }
    }
  },
  'Wool-Natural': {
    required: ['fiberFiberType', 'fiberWoolType', 'fiberSubtype', 'fiberForm', 'fiberMicron', 'fiberColour', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberProcessing', 'fiberLanolinContent', 'fiberTemperatureRegulating', 'fiberMoistureWicking', 'fiberFireRetardant', 'fiberMulesingFree', 'fiberOrganicCertified'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyType': { when: 'fiberForm', equals: 'Wadding/Batt' }
    }
  },
  'Specialty-Fills': {
    required: ['fiberFiberType', 'fiberForm', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberBlending', 'fiberEcoCertification', 'fiberBiodegradable'],
    conditional: {
      'fiberKapokSource': { when: 'fiberFiberType', equals: 'Kapok' },
      'fiberKapokProperties': { when: 'fiberFiberType', equals: 'Kapok' },
      'fiberBambooType': { when: 'fiberFiberType', equals: 'Bamboo Fiber' },
      'fiberBambooProperties': { when: 'fiberFiberType', equals: 'Bamboo Fiber' },
      'fiberSilkFlossType': { when: 'fiberFiberType', equals: 'Silk Floss' },
      'fiberSilkFlossGrade': { when: 'fiberFiberType', equals: 'Silk Floss' },
      'fiberRecycledSource': { when: 'fiberFiberType', equals: 'Recycled Fiber' },
      'fiberRecycledCertification': { when: 'fiberFiberType', equals: 'Recycled Fiber' },
      'fiberTencelType': { when: 'fiberFiberType', equals: 'Tencel/Lyocell Fill' },
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyType': { when: 'fiberForm', equals: 'Wadding/Batt' }
    }
  },
  'Microfiber-Fill': {
    required: ['fiberFiberType', 'fiberSubtype', 'fiberForm', 'fiberDenier', 'fiberSiliconized', 'fiberColour', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberMicrofiberFiberLength', 'fiberMicrofiberStructure', 'fiberMicrofiberClusterType', 'fiberMicrofiberClusterSize', 'fiberMicrofiberAntiMicrobial', 'fiberMicrofiberHypoallergenic', 'fiberMicrofiberLoftFillPower', 'fiberMicrofiberHandFeel', 'fiberMicrofiberCertification'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding' }
    }
  },
  'Down-Alternative': {
    required: ['fiberFiberType', 'fiberSubtype', 'fiberForm', 'fiberDownAlternativeConstruction', 'fiberDenier', 'fiberSiliconized', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberDownAlternativeLoftRating', 'fiberDownAlternativeFillPowerEquivalent', 'fiberDownAlternativeWarmthToWeight', 'fiberDownAlternativeWaterResistance', 'fiberDownAlternativeQuickDry', 'fiberDownAlternativeHypoallergenic', 'fiberDownAlternativeAntiMicrobial', 'fiberDownAlternativeVeganCrueltyFree', 'fiberDownAlternativeCertification', 'fiberDownAlternativeMachineWashable'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fill' },
      'fiberGsm': { when: 'fiberForm', equals: 'wadding' },
      'fiberLength': { when: 'fiberForm', equals: 'wadding' },
      'fiberWidth': { when: 'fiberForm', equals: 'wadding' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'wadding' }
    }
  },
  'Cotton-Fill': {
    required: ['fiberFiberType', 'fiberSubtype', 'fiberForm', 'fiberCottonGrade', 'fiberColour', 'fiberTestingRequirements', 'fiberSurplus', 'fiberWastage', 'fiberApproval', 'fiberRemarks'],
    advanced: ['fiberCottonStapleLength', 'fiberCottonProcessing', 'fiberCottonBonding', 'fiberCottonNeedlePunched', 'fiberCottonFireRetardant', 'fiberCottonDustTrashContent'],
    conditional: {
      'fiberQty': { when: 'fiberForm', equals: 'Loose Fiber' },
      'fiberGsm': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberLength': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberWidth': { when: 'fiberForm', equals: 'Wadding/Batt' },
      'fiberQtyValue': { when: 'fiberForm', equals: 'Wadding/Batt' }
    }
  }
};

// ==================== ARTWORK SCHEMAS ====================
export const ARTWORK_SCHEMAS = {
  'LABELS (BRAND/MAIN)': {
    required: ['labelsBrandType', 'labelsBrandMaterial', 'labelsBrandSizeWidth', 'labelsBrandSizeHeight', 'labelsBrandSizeUnit', 'labelsBrandPlacement', 'labelsBrandAttachment', 'labelsBrandTestingRequirements', 'labelsBrandQty', 'labelsBrandQtyUnit', 'labelsBrandSurplus', 'labelsBrandApproval'],
    advanced: [],
    conditional: {
      'labelsBrandTypeText': { when: 'labelsBrandType', equals: 'OTHERS (TEXT)' },
      'labelsBrandMaterialText': { when: 'labelsBrandMaterial', equals: 'OTHERS (TEXT)' },
      'labelsBrandAttachmentText': { when: 'labelsBrandAttachment', equals: 'OTHERS (TEXT)' },
      'labelsBrandTestingRequirementsText': { when: 'labelsBrandTestingRequirements', equals: 'OTHERS (TEXT)' },
      'labelsBrandApprovalText': { when: 'labelsBrandApproval', equals: 'OTHERS (TEXT)' }
    }
  },
  'CARE & COMPOSITION': {
    required: ['careCompositionType', 'careCompositionMaterial', 'careCompositionSizeWidth', 'careCompositionSizeLength', 'careCompositionSizeUnit', 'careCompositionPlacement', 'careCompositionTestingRequirements', 'careCompositionQty', 'careCompositionQtyUnit', 'careCompositionSurplus', 'careCompositionApproval'],
    advanced: ['careCompositionPrintType', 'careCompositionInkType', 'careCompositionManufacturerId', 'careCompositionPermanence', 'careCompositionLanguage'],
    conditional: {
      'careCompositionTypeText': { when: 'careCompositionType', equals: 'OTHERS (TEXT)' },
      'careCompositionMaterialText': { when: 'careCompositionMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'RFID / SECURITY TAGS': {
    required: ['rfidType', 'rfidFormFactor', 'rfidChipModel', 'rfidSizeWidth', 'rfidSizeHeight', 'rfidSizeUnit', 'rfidPlacementText', 'rfidTestingRequirements', 'rfidQty', 'rfidQtyUnit', 'rfidSurplus'],
    advanced: [],
    conditional: {
      'rfidTypeText': { when: 'rfidType', equals: 'OTHERS (TEXT)' },
      'rfidFormFactorText': { when: 'rfidFormFactor', equals: 'OTHERS (TEXT)' },
      'rfidChipModelText': { when: 'rfidChipModel', equals: 'OTHERS (TEXT)' }
    }
  },
  'LAW LABEL / CONTENTS TAG': {
    required: ['lawLabelType', 'lawLabelMaterial', 'lawLabelSizeWidth', 'lawLabelSizeHeight', 'lawLabelSizeUnit', 'lawLabelPlacement', 'lawLabelTestingRequirements', 'lawLabelQty', 'lawLabelQtyUnit', 'lawLabelSurplus', 'lawLabelApproval'],
    advanced: [],
    conditional: {
      'lawLabelTypeText': { when: 'lawLabelType', equals: 'OTHERS (TEXT)' },
      'lawLabelMaterialText': { when: 'lawLabelMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'HANG TAG SEALS / STRINGS': {
    required: ['hangTagSealsType', 'hangTagSealsMaterial', 'hangTagSealsSizeWidth', 'hangTagSealsSizeHeight', 'hangTagSealsSizeUnit', 'hangTagSealsPlacement', 'hangTagSealsTestingRequirements', 'hangTagSealsQty', 'hangTagSealsQtyUnit', 'hangTagSealsSurplus', 'hangTagSealsApproval'],
    advanced: ['hangTagSealsFastening', 'hangTagSealsPreStringing', 'hangTagSealsStringFinish', 'hangTagSealsSealShape', 'hangTagSealsColour', 'hangTagSealsLogoBranding'],
    conditional: {
      'hangTagSealsTypeText': { when: 'hangTagSealsType', equals: 'OTHERS (TEXT)' },
      'hangTagSealsMaterialText': { when: 'hangTagSealsMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'HEAT TRANSFER LABELS': {
    required: ['heatTransferType', 'heatTransferMaterialBase', 'heatTransferSizeWidth', 'heatTransferSizeHeight', 'heatTransferSizeUnit', 'heatTransferPlacement', 'heatTransferTestingRequirements', 'heatTransferQty', 'heatTransferQtyUnit', 'heatTransferSurplus', 'heatTransferApproval'],
    advanced: ['heatTransferInkType', 'heatTransferFabricCompatibility', 'heatTransferApplicationSpec', 'heatTransferPeelType', 'heatTransferFinishHandFeel', 'heatTransferStretch'],
    conditional: {
      'heatTransferTypeText': { when: 'heatTransferType', equals: 'OTHERS (TEXT)' },
      'heatTransferMaterialBaseText': { when: 'heatTransferMaterialBase', equals: 'OTHERS (TEXT)' }
    }
  },
  'UPC LABEL / BARCODE STICKER': {
    required: ['upcBarcodeType', 'upcBarcodeMaterial', 'upcBarcodeSizeWidth', 'upcBarcodeSizeHeight', 'upcBarcodeSizeUnit', 'upcBarcodePlacement', 'upcBarcodeTestingRequirements', 'upcBarcodeQty', 'upcBarcodeQtyUnit', 'upcBarcodeSurplus', 'upcBarcodeApproval'],
    advanced: [],
    conditional: {
      'upcBarcodeTypeText': { when: 'upcBarcodeType', equals: 'OTHERS (TEXT)' },
      'upcBarcodeMaterialText': { when: 'upcBarcodeMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'PRICE TICKET / BARCODE TAG': {
    required: ['priceTicketType', 'priceTicketMaterial', 'priceTicketSizeWidth', 'priceTicketSizeHeight', 'priceTicketSizeUnit', 'priceTicketPlacement', 'priceTicketTestingRequirements', 'priceTicketQty', 'priceTicketQtyUnit', 'priceTicketSurplus', 'priceTicketApproval'],
    advanced: [],
    conditional: {
      'priceTicketTypeText': { when: 'priceTicketType', equals: 'OTHERS (TEXT)' },
      'priceTicketMaterialText': { when: 'priceTicketMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'ANTI-COUNTERFEIT & HOLOGRAMS': {
    required: ['antiCounterfeitType', 'antiCounterfeitMaterial', 'antiCounterfeitSizeWidth', 'antiCounterfeitSizeHeight', 'antiCounterfeitSizeUnit', 'securityFeature', 'hologramType', 'numbering', 'antiCounterfeitPlacement', 'testingRequirements', 'antiCounterfeitQty', 'antiCounterfeitQtyUnit', 'antiCounterfeitSurplus', 'antiCounterfeitApproval'],
    advanced: ['verification', 'qrCodeContent', 'antiCounterfeitApplication', 'tamperEvidence', 'antiCounterfeitDatabase', 'gummingQuality'],
    conditional: {
      'antiCounterfeitTypeText': { when: 'antiCounterfeitType', equals: 'OTHERS (TEXT)' },
      'antiCounterfeitMaterialText': { when: 'antiCounterfeitMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'QC / INSPECTION LABELS': {
    required: ['qcInspectionType', 'qcInspectionMaterial', 'qcInspectionSizeWidth', 'qcInspectionSizeHeight', 'qcInspectionSizeUnit', 'qcInspectionContent', 'qcInspectionCodingSystem', 'qcInspectionGummingQuality', 'qcInspectionPlacement', 'qcInspectionTestingRequirements', 'qcInspectionQty', 'qcInspectionQtyUnit', 'qcInspectionSurplus', 'qcInspectionApproval'],
    advanced: [],
    conditional: {
      'qcInspectionTypeText': { when: 'qcInspectionType', equals: 'OTHERS (TEXT)' },
      'qcInspectionMaterialText': { when: 'qcInspectionMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'BELLY BAND / WRAPPER': {
    required: ['bellyBandType', 'bellyBandMaterial', 'bellyBandSizeWidth', 'bellyBandSizeHeight', 'bellyBandSizeUnit', 'bellyBandClosure', 'bellyBandTestingRequirements', 'bellyBandPlacement', 'bellyBandQty', 'bellyBandQtyUnit', 'bellyBandSurplus', 'bellyBandApproval', 'permanence'],
    advanced: ['bellyBandProductFit', 'bellyBandPrinting', 'bellyBandFoldLines', 'bellyBandDurability', 'bellyBandContent', 'bellyBandColours', 'bellyBandFinish', 'bellyBandDieCut', 'bellyBandGummingQuality'],
    conditional: {
      'bellyBandTypeText': { when: 'bellyBandType', equals: 'OTHERS (TEXT)' },
      'bellyBandMaterialText': { when: 'bellyBandMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'SIZE LABELS (INDIVIDUAL)': {
    required: ['sizeLabelsType', 'sizeLabelsMaterial', 'sizeLabelsSizeWidth', 'sizeLabelsSizeHeight', 'sizeLabelsSizeUnit', 'sizeLabelsSizeSystem', 'sizeLabelsSizeCode', 'sizeLabelsFoldType', 'sizeLabelsPlacementText', 'sizeLabelsTestingRequirements', 'sizeLabelsQty', 'sizeLabelsQtyUnit', 'sizeLabelsSurplus', 'sizeLabelsApproval'],
    advanced: [],
    conditional: {
      'sizeLabelsTypeText': { when: 'sizeLabelsType', equals: 'OTHERS (TEXT)' },
      'sizeLabelsMaterialText': { when: 'sizeLabelsMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'TAGS & SPECIAL LABELS': {
    required: ['tagsSpecialLabelsType', 'tagsSpecialLabelsMaterial', 'tagsSpecialLabelsSizeWidth', 'tagsSpecialLabelsSizeHeight', 'tagsSpecialLabelsSizeUnit', 'tagsSpecialLabelsAttachment', 'tagsSpecialLabelsFinishing', 'tagsSpecialLabelsPlacement', 'tagsSpecialLabelsQty', 'tagsSpecialLabelsQtyUnit', 'tagsSpecialLabelsSurplus', 'tagsSpecialLabelsTestingRequirements', 'tagsSpecialLabelsApproval'],
    advanced: [],
    conditional: {
      'tagsSpecialLabelsTypeText': { when: 'tagsSpecialLabelsType', equals: 'OTHERS (TEXT)' },
      'tagsSpecialLabelsMaterialText': { when: 'tagsSpecialLabelsMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'FLAMMABILITY / SAFETY LABELS': {
    required: ['flammabilitySafetyType', 'flammabilitySafetyMaterial', 'flammabilitySafetySizeWidth', 'flammabilitySafetySizeHeight', 'flammabilitySafetySizeUnit', 'flammabilitySafetyPlacement', 'flammabilitySafetyTestingRequirements', 'flammabilitySafetyQty', 'flammabilitySafetyQtyUnit', 'flammabilitySafetySurplus', 'flammabilitySafetyApproval'],
    advanced: ['flammabilitySafetyRegulation', 'flammabilitySafetyFontSize', 'flammabilitySafetyPermanence', 'flammabilitySafetySymbol', 'flammabilitySafetyInkDurability', 'flammabilitySafetyCertificationId'],
    conditional: {
      'flammabilitySafetyTypeText': { when: 'flammabilitySafetyType', equals: 'OTHERS (TEXT)' },
      'flammabilitySafetyMaterialText': { when: 'flammabilitySafetyMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'INSERT CARDS': {
    required: ['insertCardsType', 'insertCardsMaterial', 'insertCardsArtworkSpec', 'insertCardsSizeWidth', 'insertCardsSizeHeight', 'insertCardsSizeUnit', 'insertCardsPlacement', 'insertCardsTestingRequirements', 'insertCardsQty', 'insertCardsQtyUnit', 'insertCardsSurplus', 'insertCardsApproval'],
    advanced: ['insertCardsFunction', 'insertCardsContent', 'insertCardsPrinting', 'insertCardsFinish', 'insertCardsStiffness', 'insertCardsAcidFree', 'insertCardsBranding'],
    conditional: {
      'insertCardsTypeText': { when: 'insertCardsType', equals: 'OTHERS (TEXT)' },
      'insertCardsMaterialText': { when: 'insertCardsMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'HEADER CARD': {
    required: ['headerCardType', 'headerCardMaterial', 'headerCardArtworkSpecFile', 'headerCardSizeLength', 'headerCardSizeWidth', 'headerCardSizeGusset', 'headerCardSizeUnit', 'headerCardPlacement', 'headerCardTestingRequirements', 'headerCardQty', 'headerCardQtyUnit', 'headerCardCasepackQty', 'headerCardSurplus', 'headerCardApproval'],
    advanced: ['headerCardFunction', 'headerCardContent', 'headerCardPrinting', 'headerCardFinish', 'headerCardStiffness', 'headerCardAcidFree', 'headerCardBranding'],
    conditional: {
      'headerCardTypeText': { when: 'headerCardType', equals: 'OTHERS (TEXT)' },
      'headerCardMaterialText': { when: 'headerCardMaterial', equals: 'OTHERS (TEXT)' }
    }
  },
  'RIBBONS': {
    required: ['ribbonsType', 'ribbonsMaterial', 'ribbonsWidth', 'ribbonsRollLength', 'ribbonsTestingRequirements', 'ribbonsQty', 'ribbonsQtyUnit', 'ribbonsSurplus'],
    advanced: [],
    conditional: {
      'ribbonsTypeText': { when: 'ribbonsType', equals: 'OTHERS (TEXT)' },
      'ribbonsMaterialText': { when: 'ribbonsMaterial', equals: 'OTHERS (TEXT)' }
    }
  }
};

// ==================== PACKAGING SCHEMAS ====================
export const PACKAGING_HEADER_SCHEMA = {
  required: ['casepackQty'],
  conditional: {
    'assortedSkuLink': { when: 'type', equals: 'ASSORTED (LINK IPC#)' }
  }
};

export const PACKAGING_COMMON_SCHEMA = {
  required: ['components', 'materialDescription', 'netConsumptionPerPc', 'unit', 'placement', 'packagingMaterialType']
};

export const PACKAGING_MATERIAL_SCHEMAS = {
  'CARTON BOX': {
    required: ['cartonBoxType', 'cartonBoxNoOfPlys', 'cartonBoxBoardGrade', 'cartonBoxJointType', 'cartonBoxBurstingStrength', 'cartonBoxDimensionsUnit', 'cartonBoxStiffenerRequired', 'cartonBoxTestingRequirements', 'cartonBoxSurplus', 'cartonBoxWastage'],
    advanced: [],
    // Stiffener size (L x W) required only when Stiffener is YES; form uses Length + Width, not a single Dimensions field
    conditional: {
      'cartonBoxStiffenerNoOfPlys': { when: 'cartonBoxStiffenerRequired', equals: 'YES' },
      'cartonBoxQuantity': { when: 'cartonBoxStiffenerRequired', equals: 'YES' },
      'cartonBoxStiffenerLength': { when: 'cartonBoxStiffenerRequired', equals: 'YES' },
      'cartonBoxStiffenerWidth': { when: 'cartonBoxStiffenerRequired', equals: 'YES' },
      'cartonBoxStiffenerUnit': { when: 'cartonBoxStiffenerRequired', equals: 'YES' }
    }
  },
  'CORNER PROTECTORS': {
    required: ['cornerProtectorType', 'cornerProtectorMaterial', 'cornerProtectorLegLength', 'cornerProtectorLegLengthUnit', 'cornerProtectorThickness', 'cornerProtectorThicknessUnit', 'cornerProtectorHeightLength', 'cornerProtectorHeightLengthUnit', 'cornerProtectorLoadCapacity', 'cornerProtectorColor', 'cornerProtectorQuantity', 'cornerProtectorSurplus', 'cornerProtectorWastage'],
    advanced: []
  },
  'EDGE PROTECTORS': {
    required: ['edgeProtectorType', 'edgeProtectorMaterial', 'edgeProtectorWingSize', 'edgeProtectorThickness', 'edgeProtectorLength', 'edgeProtectorPlyLayers', 'edgeProtectorColor', 'edgeProtectorQuantity', 'edgeProtectorSurplus', 'edgeProtectorWastage'],
    advanced: []
  },
  'FOAM INSERT': {
    required: ['foamInsertType', 'foamInsertMaterial', 'foamInsertDensity', 'foamInsertThickness', 'foamInsertColor', 'foamInsertQuantity', 'foamInsertSurplus', 'foamInsertWastage'],
    advanced: []
  },
  'PALLET STRAP': {
    required: ['palletStrapType', 'palletStrapApplication', 'palletStrapWidth', 'palletStrapSealType', 'palletStrapSealSize', 'palletStrapColor', 'palletStrapQuantity', 'palletStrapSurplus', 'palletStrapWastage'],
    advanced: []
  },
  'POLYBAG~Bale': {
    required: ['polybagBalePackagingType', 'polybagBaleInnerCasepack', 'polybagBaleType', 'polybagBaleMaterial', 'polybagBaleGaugeGsm', 'polybagBaleRollWidth', 'polybagBaleRollWidthUnit', 'polybagBaleColour', 'polybagBaleTestingRequirements', 'polybagBaleQuantity', 'polybagBaleQuantityUnit', 'polybagBaleSurplus', 'polybagBaleWastage'],
    advanced: []
  },
  'POLYBAG~POLYBAG-FLAP': {
    required: ['polybagPolybagFlapPackagingType', 'polybagPolybagFlapInnerCasepack', 'polybagPolybagFlapType', 'polybagPolybagFlapMaterial', 'polybagPolybagFlapFlapRequired', 'polybagPolybagFlapTestingRequirements', 'polybagPolybagFlapQuantity', 'polybagPolybagFlapQuantityUnit', 'polybagPolybagFlapSurplus', 'polybagPolybagFlapWastage'],
    advanced: [],
    conditional: {
      'polybagPolybagFlapFlapDimensions': { when: 'polybagPolybagFlapFlapRequired', equals: 'YES' }
    }
  },
  'SILICA GEL DESICCANT': {
    required: ['silicaGelDesiccantType', 'silicaGelDesiccantForm', 'silicaGelDesiccantUnitSize', 'silicaGelDesiccantColor', 'silicaGelDesiccantPlacement', 'silicaGelDesiccantQuantity', 'silicaGelDesiccantCasepackLogic', 'silicaGelDesiccantSurplus', 'silicaGelDesiccantWastage'],
    advanced: ['silicaGelDesiccantAbsorptionCapacity', 'silicaGelDesiccantIndicatingType', 'silicaGelDesiccantPacketMaterial', 'silicaGelDesiccantPacketSize', 'silicaGelDesiccantFoodSafe']
  },
  'SHRINK TAPE': {
    required: ['stretchWrapType', 'stretchWrapMaterial', 'stretchWrapWidth', 'stretchWrapThicknessGauge', 'stretchWrapCling', 'stretchWrapColor', 'stretchWrapQuantity', 'stretchWrapSurplus', 'stretchWrapWastage'],
    advanced: []
  },
  'VOID~FILL': {
    required: ['voidFillType', 'voidFillMaterial', 'voidFillPaperType', 'voidFillPaperWeight', 'voidFillColor', 'voidFillQuantity', 'voidFillQuantityUnit', 'voidFillSurplus', 'voidFillWastage'],
    advanced: [],
    conditional: {
      'voidFillPillowSize': { when: 'voidFillType', equals: 'Air Pillows' },
      'voidFillFillPercent': { when: 'voidFillType', equals: 'Air Pillows' },
      'voidFillBubbleSize': { when: 'voidFillType', equals: 'Bubble Wrap' },
      'voidFillLayer': { when: 'voidFillType', equals: 'Bubble Wrap' }
    }
  },
  'DIVIDER': {
    required: ['dividerType', 'dividerMaterial', 'dividerCellConfiguration', 'dividerCellSizeLength', 'dividerCellSizeWidth', 'dividerCellSizeUnit', 'dividerHeight', 'dividerHeightUnit', 'dividerBoardThickness', 'dividerSlotDepth', 'dividerColor', 'dividerQuantity', 'dividerSurplus', 'dividerWastage'],
    advanced: []
  },
  'TAPE': {
    required: ['tapeType', 'tapeMaterial', 'tapeGaugeThickness', 'tapeWidth', 'tapeWidthUnit', 'tapeLength', 'tapeLengthUnit', 'tapeGummingQuality', 'tapeApplication', 'tapeTestingRequirements', 'tapeSurplus', 'tapeWastage'],
    advanced: []
  },
  'SHIPPING MARK': {
    required: ['shippingMarkType', 'shippingMarkMaterial', 'shippingMarkArtworkSpecFile', 'shippingMarkSizeWidth', 'shippingMarkSizeHeight', 'shippingMarkSizeUnit', 'shippingMarkPlacementText', 'shippingMarkTestingRequirements', 'shippingMarkQty', 'shippingMarkQtyUnit', 'shippingMarkSurplus'],
    advanced: ['shippingMarkPlacementReferenceImage', 'shippingMarkQuality', 'shippingMarkBarcodeStandard', 'shippingMarkPrintMethod', 'shippingMarkVariableData', 'shippingMarkGummingQuality'],
    fieldLabels: {
      shippingMarkArtworkSpecFile: 'Artwork spec',
      shippingMarkSizeWidth: 'Width',
      shippingMarkSizeHeight: 'Height',
      shippingMarkSizeUnit: 'Size unit',
      shippingMarkPlacementText: 'Placement',
      shippingMarkTestingRequirements: 'Testing requirements',
      shippingMarkQty: 'Qty',
      shippingMarkQtyUnit: 'Qty unit',
      shippingMarkSurplus: 'Surplus %'
    }
  }
};

// ==================== VALIDATION HELPER FUNCTIONS ====================

/**
 * Check if a field value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof File) return false; // File uploads are not empty
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if a conditional field should be validated
 */
export const shouldValidateConditional = (condition, material) => {
  if (!condition) return false;

  if (condition.equals !== undefined) {
    return material[condition.when] === condition.equals;
  }
  if (condition.notEquals !== undefined) {
    return material[condition.when] !== condition.notEquals;
  }
  if (condition.notEmpty !== undefined) {
    return !isEmpty(material[condition.when]);
  }
  if (condition.contains !== undefined) {
    const value = material[condition.when];
    return typeof value === 'string' && value.toLowerCase().includes(condition.contains.toLowerCase());
  }
  return false;
};

/**
 * Validate a material against its schema
 * Returns { isValid: boolean, errors: { fieldKey: message } }
 */
export const validateMaterialAgainstSchema = (material, schema, errorPrefix = '') => {
  const errors = {};
  
  const getFieldLabel = (field) => {
    return (schema.fieldLabels && schema.fieldLabels[field]) || formatFieldName(field);
  };

  // Validate required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (isEmpty(material[field])) {
        const fieldKey = errorPrefix ? `${errorPrefix}_${field}` : field;
        errors[fieldKey] = `${getFieldLabel(field)} is required`;
      }
    }
  }
  
  // Validate conditional fields
  if (schema.conditional) {
    for (const [field, condition] of Object.entries(schema.conditional)) {
      if (shouldValidateConditional(condition, material) && isEmpty(material[field])) {
        const fieldKey = errorPrefix ? `${errorPrefix}_${field}` : field;
        errors[fieldKey] = `${getFieldLabel(field)} is required`;
      }
    }
  }

  // Auto-require fields for trim/accessory based on prefix (excluding uploads/remarks/advanced/conditional)
  if (schema.autoRequirePrefix) {
    const prefix = schema.autoRequirePrefix;
    const excluded = new Set([
      ...(schema.advanced || []),
      ...Object.keys(schema.conditional || {})
    ]);
    const isOptionalAutoField = (field) => {
      if (/remarks$/i.test(field)) return true;
      if (/TestingRequirementFile$/i.test(field)) return true;
      if (/ReferenceImage$/i.test(field)) return true;
      if (/ColorReference$/i.test(field)) return true;
      if (/ColourReference$/i.test(field)) return true;
      if (/PlacementReferenceImage$/i.test(field)) return true;
      if (/Reference$/i.test(field) && /Image/i.test(field)) return true;
      return false;
    };

    Object.keys(material || {}).forEach((field) => {
      if (!field.startsWith(prefix)) return;
      if (excluded.has(field)) return;
      if (isOptionalAutoField(field)) return;
      if (isEmpty(material[field])) {
        const fieldKey = errorPrefix ? `${errorPrefix}_${field}` : field;
        if (!errors[fieldKey]) {
          errors[fieldKey] = `${getFieldLabel(field)} is required`;
        }
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format field name for display (camelCase to Title Case)
 */
export const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
};

/**
 * Get schema for a specific trim accessory type
 */
export const getTrimAccessorySchema = (trimType) => {
  return TRIM_ACCESSORY_SCHEMAS[trimType] || null;
};

/**
 * Get schema for a specific foam type
 */
export const getFoamSchema = (foamType) => {
  return FOAM_SCHEMAS[foamType] || null;
};

/**
 * Get schema for a specific fiber type
 */
export const getFiberSchema = (fiberType) => {
  return FIBER_SCHEMAS[fiberType] || null;
};

/**
 * Get schema for a specific artwork category
 */
export const getArtworkSchema = (artworkCategory) => {
  return ARTWORK_SCHEMAS[artworkCategory] || null;
};

/**
 * Get schema for a specific packaging material type
 */
export const getPackagingMaterialSchema = (packagingType) => {
  return PACKAGING_MATERIAL_SCHEMAS[packagingType] || null;
};

/**
 * Get schema for a specific work order type
 */
export const getWorkOrderSchema = (workOrderType) => {
  return WORK_ORDER_SCHEMAS[workOrderType] || null;
};
