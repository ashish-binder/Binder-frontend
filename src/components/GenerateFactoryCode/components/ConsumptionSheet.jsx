import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TRIM_ACCESSORY_SCHEMAS } from '@/utils/validationSchemas';
import { isQualityYes, mapArtworkCategoryToFormKey, mapRawMaterialToFormKey } from '@/utils/uqrMappings';

// Explicit column templates for the desktop CNS tables. Equal columns made the
// (now longer, slash-joined) MATERIAL DESCRIPTION too narrow, so it overflowed
// into the next column. These give the description column real width while
// keeping every track shrinkable (minmax(0,…)) so text wraps instead of bleeding.
const RAW_MAT_GRID =
  'minmax(0,1.2fr) minmax(0,2.8fr) minmax(0,0.9fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,0.7fr)';
const PKG_STD_GRID =
  'minmax(0,1.1fr) minmax(0,2.6fr) minmax(0,1.3fr) minmax(0,1.4fr) minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,1fr) minmax(0,1.1fr)';
// Reusable wrap rule for free-text cells: lets the flex child shrink and break
// long unspaced tokens (e.g. "muslin/100%Cotton/220GSM/…") so it never overflows.
const CELL_WRAP = 'min-w-0 break-words [overflow-wrap:anywhere]';

const ARTWORK_DESCRIPTION_FIELD_MAP = {
  'LABELS (BRAND/MAIN)': {
    typeKey: 'labelsBrandType',
    typeTextKey: 'labelsBrandTypeText',
    materialKey: 'labelsBrandMaterial',
    materialTextKey: 'labelsBrandMaterialText',
  },
  'CARE & COMPOSITION': {
    typeKey: 'careCompositionType',
    typeTextKey: 'careCompositionTypeText',
    materialKey: 'careCompositionMaterial',
    materialTextKey: 'careCompositionMaterialText',
  },
  'RFID / SECURITY TAGS': {
    typeKey: 'rfidType',
    typeTextKey: 'rfidTypeText',
    materialKey: 'rfidFormFactor',
    materialTextKey: 'rfidFormFactorText',
  },
  'LAW LABEL / CONTENTS TAG': {
    typeKey: 'lawLabelType',
    typeTextKey: 'lawLabelTypeText',
    materialKey: 'lawLabelMaterial',
    materialTextKey: 'lawLabelMaterialText',
  },
  'HANG TAG SEALS / STRINGS': {
    typeKey: 'hangTagSealsType',
    typeTextKey: 'hangTagSealsTypeText',
    materialKey: 'hangTagSealsMaterial',
    materialTextKey: 'hangTagSealsMaterialText',
  },
  'HEAT TRANSFER LABELS': {
    typeKey: 'heatTransferType',
    typeTextKey: 'heatTransferTypeText',
    materialKey: 'heatTransferMaterialBase',
    materialTextKey: 'heatTransferMaterialBaseText',
  },
  'UPC LABEL / BARCODE STICKER': {
    typeKey: 'upcBarcodeType',
    typeTextKey: 'upcBarcodeTypeText',
    materialKey: 'upcBarcodeMaterial',
    materialTextKey: 'upcBarcodeMaterialText',
  },
  'PRICE TICKET / BARCODE TAG': {
    typeKey: 'priceTicketType',
    typeTextKey: 'priceTicketTypeText',
    materialKey: 'priceTicketMaterial',
    materialTextKey: 'priceTicketMaterialText',
  },
  'ANTI-COUNTERFEIT & HOLOGRAMS': {
    typeKey: 'antiCounterfeitType',
    typeTextKey: 'antiCounterfeitTypeText',
    materialKey: 'antiCounterfeitMaterial',
    materialTextKey: 'antiCounterfeitMaterialText',
  },
  'QC / INSPECTION LABELS': {
    typeKey: 'qcInspectionType',
    typeTextKey: 'qcInspectionTypeText',
    materialKey: 'qcInspectionMaterial',
    materialTextKey: 'qcInspectionMaterialText',
  },
  'BELLY BAND / WRAPPER': {
    typeKey: 'bellyBandType',
    typeTextKey: 'bellyBandTypeText',
    materialKey: 'bellyBandMaterial',
    materialTextKey: 'bellyBandMaterialText',
  },
  'SIZE LABELS (INDIVIDUAL)': {
    typeKey: 'sizeLabelsType',
    typeTextKey: 'sizeLabelsTypeText',
    materialKey: 'sizeLabelsMaterial',
    materialTextKey: 'sizeLabelsMaterialText',
  },
  'TAGS & SPECIAL LABELS': {
    typeKey: 'tagsSpecialLabelsType',
    typeTextKey: 'tagsSpecialLabelsTypeText',
    materialKey: 'tagsSpecialLabelsMaterial',
    materialTextKey: 'tagsSpecialLabelsMaterialText',
  },
  'FLAMMABILITY / SAFETY LABELS': {
    typeKey: 'flammabilitySafetyType',
    typeTextKey: 'flammabilitySafetyTypeText',
    materialKey: 'flammabilitySafetyMaterial',
    materialTextKey: 'flammabilitySafetyMaterialText',
  },
  'INSERT CARDS': {
    typeKey: 'insertCardsType',
    typeTextKey: 'insertCardsTypeText',
    materialKey: 'insertCardsMaterial',
    materialTextKey: 'insertCardsMaterialText',
  },
  'HEADER CARD': {
    typeKey: 'headerCardType',
    typeTextKey: 'headerCardTypeText',
    materialKey: 'headerCardMaterial',
    materialTextKey: 'headerCardMaterialText',
  },
  'RIBBONS': {
    typeKey: 'ribbonsType',
    typeTextKey: 'ribbonsTypeText',
    materialKey: 'ribbonsMaterial',
    materialTextKey: 'ribbonsMaterialText',
  },
};

const PACKAGING_DESCRIPTION_FIELD_MAP = {
  'CARTON BOX': [
    { label: 'Material Type', keys: ['cartonBoxType'] },
    { label: 'Plys', keys: ['cartonBoxNoOfPlys'] },
    { label: 'Stiffener Plys', keys: ['cartonBoxStiffenerNoOfPlys'] },
    { label: 'Board Grade', keys: ['cartonBoxBoardGrade'] },
  ],
  'CORNER PROTECTORS': [
    { label: 'Type', keys: ['cornerProtectorType'] },
    { label: 'Material', keys: ['cornerProtectorMaterial'] },
  ],
  'EDGE PROTECTORS': [
    { label: 'Type', keys: ['edgeProtectorType'] },
    { label: 'Material', keys: ['edgeProtectorMaterial'] },
    { label: 'Ply Layers', keys: ['edgeProtectorPlyLayers'] },
  ],
  'FOAM INSERT': [
    { label: 'Type', keys: ['foamInsertType'] },
    { label: 'Material', keys: ['foamInsertMaterial'] },
    { label: 'Density', keys: ['foamInsertDensity'] },
  ],
  'PALLET STRAP': [
    { label: 'Type', keys: ['palletStrapType'] },
    { label: 'Application', keys: ['palletStrapApplication'] },
    { label: 'Width', keys: ['palletStrapWidth'] },
  ],
  'POLYBAG~Bale': [
    { label: 'Packaging Type', keys: ['polybagBalePackagingType'] },
    { label: 'Type', keys: ['polybagBaleType'] },
    { label: 'Material', keys: ['polybagBaleMaterial'] },
  ],
  'POLYBAG~POLYBAG-FLAP': [
    { label: 'Packaging Type', keys: ['polybagPolybagFlapPackagingType'] },
    { label: 'Type', keys: ['polybagPolybagFlapType'] },
    { label: 'Material', keys: ['polybagPolybagFlapMaterial'] },
    { label: 'Flap Required', keys: ['polybagPolybagFlapFlapRequired'] },
  ],
  'SILICA GEL DESICCANT': [
    { label: 'Type', keys: ['silicaGelDesiccantType'] },
    { label: 'Form', keys: ['silicaGelDesiccantForm'] },
    { label: 'Unit Size', keys: ['silicaGelDesiccantUnitSize'] },
  ],
  'SHRINK TAPE': [
    { label: 'Type', keys: ['stretchWrapType'] },
    { label: 'Material', keys: ['stretchWrapMaterial'] },
    { label: 'Width', keys: ['stretchWrapWidth'] },
  ],
  'VOID~FILL': [
    { label: 'Type', keys: ['voidFillType'] },
    { label: 'Material', keys: ['voidFillMaterial'] },
    { label: 'Paper Type', keys: ['voidFillPaperType'] },
  ],
  DIVIDER: [
    { label: 'Type', keys: ['dividerType'] },
    { label: 'Material', keys: ['dividerMaterial'] },
    { label: 'Cell Config', keys: ['dividerCellConfiguration'] },
  ],
  TAPE: [
    { label: 'Type', keys: ['tapeType'] },
    { label: 'Material', keys: ['tapeMaterial'] },
    { label: 'Width', keys: ['tapeWidth'] },
  ],
  'SHIPPING MARK': [
    { label: 'Type', keys: ['shippingMarkType'] },
    { label: 'Material', keys: ['shippingMarkMaterial'] },
    { label: 'Barcode', keys: ['shippingMarkBarcodeStandard'] },
  ],
};

const PACKAGING_SIZE_FIELD_MAP = {
  'CARTON BOX': [
    { label: 'L', keys: ['cartonBoxLength'], unitKeys: ['cartonBoxDimensionsUnit'] },
    { label: 'W', keys: ['cartonBoxWidth'], unitKeys: ['cartonBoxDimensionsUnit'] },
    { label: 'H', keys: ['cartonBoxHeight'], unitKeys: ['cartonBoxDimensionsUnit'] },
  ],
  'CORNER PROTECTORS': [
    { label: 'Leg L', keys: ['cornerProtectorLegLength'], unitKeys: ['cornerProtectorLegLengthUnit'] },
    { label: 'Thickness', keys: ['cornerProtectorThickness'], unitKeys: ['cornerProtectorThicknessUnit'] },
    { label: 'Height L', keys: ['cornerProtectorHeightLength'], unitKeys: ['cornerProtectorHeightLengthUnit'] },
  ],
  'EDGE PROTECTORS': [
    { label: 'Wing Size', keys: ['edgeProtectorWingSize'] },
    { label: 'Thickness', keys: ['edgeProtectorThickness'] },
    { label: 'Length', keys: ['edgeProtectorLength'] },
  ],
  'FOAM INSERT': [
    { label: 'L', keys: ['foamInsertLength'], unitKeys: ['foamInsertDimensionsUnit'] },
    { label: 'W', keys: ['foamInsertWidth'], unitKeys: ['foamInsertDimensionsUnit'] },
    { label: 'H', keys: ['foamInsertHeight'], unitKeys: ['foamInsertDimensionsUnit'] },
  ],
  'PALLET STRAP': [
    { label: 'Width', keys: ['palletStrapWidth'] },
  ],
  'POLYBAG~Bale': [
    { label: 'Roll Width', keys: ['polybagBaleRollWidth'], unitKeys: ['polybagBaleRollWidthUnit'] },
  ],
  'POLYBAG~POLYBAG-FLAP': [
    { label: 'L', keys: ['polybagPolybagFlapLength'] },
    { label: 'W', keys: ['polybagPolybagFlapWidth'] },
  ],
  'SILICA GEL DESICCANT': [
    { label: 'Unit Size', keys: ['silicaGelDesiccantUnitSize'] },
  ],
  'SHRINK TAPE': [
    { label: 'Width', keys: ['stretchWrapWidth'] },
    { label: 'Thickness', keys: ['stretchWrapThicknessGauge'] },
  ],
  'VOID~FILL': [
    { label: 'Pillow Size', keys: ['voidFillPillowSize'] },
    { label: 'Bubble Size', keys: ['voidFillBubbleSize'] },
  ],
  DIVIDER: [
    { label: 'Cell L', keys: ['dividerCellSizeLength'], unitKeys: ['dividerCellSizeUnit'] },
    { label: 'Cell W', keys: ['dividerCellSizeWidth'], unitKeys: ['dividerCellSizeUnit'] },
    { label: 'Height', keys: ['dividerHeight'], unitKeys: ['dividerHeightUnit'] },
  ],
  TAPE: [
    { label: 'Thickness', keys: ['tapeGaugeThickness'] },
    { label: 'Width', keys: ['tapeWidth'], unitKeys: ['tapeWidthUnit'] },
    { label: 'Length', keys: ['tapeLength'], unitKeys: ['tapeLengthUnit'] },
  ],
  'SHIPPING MARK': [
    { label: 'W', keys: ['shippingMarkSizeWidth'], unitKeys: ['shippingMarkSizeUnit'] },
    { label: 'H', keys: ['shippingMarkSizeHeight'], unitKeys: ['shippingMarkSizeUnit'] },
  ],
};

/**
 * ConsumptionSheet Component
 *
 * Displays all IPCs, their products/subproducts, and components in order:
 * - IPC 1 → Product (main) → Component A, B, ... (each with full block: Raw Material row → Spec → Work Orders → Artwork)
 * - IPC 1 → Subproduct (if any) → Component A, B, ... (same structure)
 * - IPC 2 → Product → Components...
 * - Packaging (at product/IPC level)
 * - etc.
 *
 * Each component block shows:
 * - Row 1: IPC Code
 * - Row 2: Product (or Subproduct name)
 * - Row 3: Component name
 * - Row 4: Raw Material, Net CNS, Overage Qty, Gross Wastage, Gross CNS, Unit
 * - Row 5: Spec (Cut Size, Sew Size)
 * - Row 6: Work Orders
 * - Row 7: Artwork (after work orders, per component)
 */
const ConsumptionSheet = forwardRef(({ formData = {}, isEditMode = false, onEditSection }, ref) => {
  const PURCHASE_SHARE_KEY = 'purchaseSharedData';

  const editSectionProps = (sectionKey, product) => {
    if (!isEditMode) return {};
    const skuId = product?.type === 'subproduct'
      ? `subproduct_${product.skuIndex}_${product.spIndex}`
      : `product_${product?.skuIndex ?? 0}`;
    return {
      role: 'button',
      tabIndex: 0,
      style: { cursor: 'pointer' },
      className: 'cns-editable-section',
      onClick: (e) => { e.stopPropagation(); onEditSection?.(sectionKey, skuId); },
      onKeyDown: (e) => { if (e.key === 'Enter') { e.stopPropagation(); onEditSection?.(sectionKey, skuId); } },
    };
  };
  // Single layout on screen: only mobile OR desktop (avoids duplicate render)
  const [isMobileCns, setIsMobileCns] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const set = () => setIsMobileCns(mql.matches);
    set();
    mql.addEventListener('change', set);
    return () => mql.removeEventListener('change', set);
  }, []);

  // Helper: Calculate overage qty from PO Qty and overage percentage
  const calculateOverageQty = (poQty, overagePercentage) => {
    const qty = parseFloat(poQty) || 0;
    const overage = parseFloat(overagePercentage?.replace('%', '')) || 0;
    return (qty * (1 + overage / 100)).toFixed(2);
  };

  // Helper: Calculate compound wastage from multiple wastage/surplus values
  // Formula: compoundFactor = (1 + w1/100) * (1 + w2/100) * (1 + w3/100)...
  // Gross Wastage % = (compoundFactor - 1) * 100
  const calculateCompoundWastage = (wastageList) => {
    if (!wastageList || wastageList.length === 0) return 0;

    const compoundFactor = wastageList.reduce((factor, w) => {
      const wastageVal = parseFloat(String(w).replace('%', '')) || 0;
      return factor * (1 + wastageVal / 100);
    }, 1);

    return ((compoundFactor - 1) * 100).toFixed(2);
  };

  // Helper: Sum wastage/surplus values without compounding
  const calculateTotalWastage = (wastageList) => {
    if (!wastageList || wastageList.length === 0) return '0.00';
    const total = wastageList.reduce((sum, w) => {
      const wastageVal = parseFloat(String(w).replace('%', '')) || 0;
      return sum + wastageVal;
    }, 0);
    return total.toFixed(2);
  };

  // Helper: Calculate compound factor directly from wastage list (avoids precision loss from rounding)
  const calculateCompoundFactor = (wastageList) => {
    if (!wastageList || wastageList.length === 0) return 1;
    return wastageList.reduce((factor, w) => {
      const wastageVal = parseFloat(String(w).replace('%', '')) || 0;
      return factor * (1 + wastageVal / 100);
    }, 1);
  };

  // Helper: Calculate gross CNS per piece with compound wastage (using compound factor directly)
  const calculateGrossCnsPerPiece = (wastageList, netCns) => {
    const net = parseFloat(netCns) || 0;
    const compoundFactor = calculateCompoundFactor(wastageList);
    return (net * compoundFactor).toFixed(6); // Higher precision for per-piece calculation
  };

  // Helper: Calculate gross CNS for PO (gross CNS per piece × overage qty)
  const calculateGrossCns = (overageQty, wastageList, netCns) => {
    const overage = parseFloat(overageQty) || 0;
    const grossCnsPerPiece = parseFloat(calculateGrossCnsPerPiece(wastageList, netCns)) || 0;
    return (grossCnsPerPiece * overage).toFixed(3);
  };

  // Helper: Recursively extract ALL wastage values from an object (any key containing "wastage" or "surplus")
  const extractAllWastages = (obj, wastageList = []) => {
    if (!obj || typeof obj !== 'object') return wastageList;

    if (Array.isArray(obj)) {
      obj.forEach((item) => extractAllWastages(item, wastageList));
      return wastageList;
    }

    for (const key in obj) {
      const value = obj[key];
      const keyLower = key.toLowerCase();

      // Extract both wastage and surplus (surplus is treated like wastage for compounding)
      if ((keyLower.includes('wastage') || keyLower.includes('surplus')) && 
          value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          extractAllWastages(value, wastageList);
        } else {
          wastageList.push(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        extractAllWastages(value, wastageList);
      }
    }

    return wastageList;
  };

  // Helper: Extract artwork wastage/surplus — use recursive extraction so we pick up
  // generic (surplus, surplusForSection), category-specific (labelsBrandSurplus, rfidSurplus, etc.),
  // and any future fields for every artwork material (fixes 2nd+ materials showing 0).
  const extractArtworkWastageSurplus = (artworkMaterial) => {
    const values = [];
    extractAllWastages(artworkMaterial, values);
    return values;
  };

  // Helper: Extract packaging wastage/surplus based on packagingMaterialType
  const extractPackagingWastageSurplus = (packagingMaterial) => {
    const values = [];
    const type = packagingMaterial.packagingMaterialType;
    
    if (!type) return values;
    
    // Map packaging type to its specific wastage and surplus fields
    const typeFieldMap = {
      'CARTON BOX': { wastage: 'cartonBoxWastage', surplus: 'cartonBoxSurplus' },
      'CORNER PROTECTORS': { wastage: 'cornerProtectorWastage', surplus: 'cornerProtectorSurplus' },
      'EDGE PROTECTORS': { wastage: 'edgeProtectorWastage', surplus: 'edgeProtectorSurplus' },
      'FOAM INSERT': { wastage: 'foamInsertWastage', surplus: 'foamInsertSurplus' },
      'PALLET STRAP': { wastage: 'palletStrapWastage', surplus: 'palletStrapSurplus' },
      'POLYBAG~Bale': { wastage: 'polybagBaleWastage', surplus: 'polybagBaleSurplus' },
      'POLYBAG~POLYBAG-FLAP': { wastage: 'polybagPolybagFlapWastage', surplus: 'polybagPolybagFlapSurplus' },
      'SILICA GEL DESICCANT': { wastage: 'silicaGelDesiccantWastage', surplus: 'silicaGelDesiccantSurplus' },
      'SHRINK TAPE': { wastage: 'stretchWrapWastage', surplus: 'stretchWrapSurplus' },
      'TAPE': { wastage: 'tapeWastage', surplus: 'tapeSurplus' },
      'SHIPPING MARK': { surplus: 'shippingMarkSurplus' },
      'VOID~FILL': { wastage: 'voidFillWastage', surplus: 'voidFillSurplus' },
      // Default/Divider
      'DIVIDER': { wastage: 'dividerWastage', surplus: 'dividerSurplus' },
    };
    
    const fields = typeFieldMap[type] || typeFieldMap['DIVIDER'];
    if (fields) {
      if (packagingMaterial[fields.wastage]) values.push(packagingMaterial[fields.wastage]);
      if (packagingMaterial[fields.surplus]) values.push(packagingMaterial[fields.surplus]);
    }
    
    // Also extract from workOrders
    if (packagingMaterial.workOrders) {
      packagingMaterial.workOrders.forEach((wo) => {
        if (wo.wastage) values.push(wo.wastage);
      });
    }
    
    return values;
  };

  // Helper: Determine if a raw material is complete enough to appear in CNS sheet
  const isRawMaterialCompleteForCns = (material) => {
    if (!material) return false;
    const materialType = material.materialType?.toString().trim();
    const materialDescription = material.materialDescription?.toString().trim();
    const isStitchingThread = materialType === 'Yarn' && material.subMaterial?.toString().trim() === 'Stitching Thread';
    if (isStitchingThread) {
      // Stitching Thread: single qty + unit (with backward compat for old yardage/kgs)
      const qty = material.stitchingThreadQty?.toString().trim() ||
        material.stitchingThreadQtyYardage?.toString().trim() ||
        material.stitchingThreadQtyKgs?.toString().trim();
      const unit = material.stitchingThreadUnit?.trim() ||
        (material.stitchingThreadQtyYardage != null && String(material.stitchingThreadQtyYardage).trim() !== '' ? 'Yardage' : null) ||
        (material.stitchingThreadQtyKgs != null && String(material.stitchingThreadQtyKgs).trim() !== '' ? 'Kgs' : null);
      return Boolean(materialType && materialDescription && qty && unit);
    }
    const netConsumption = material.netConsumption?.toString().trim();
    const unit = material.unit?.toString().trim();
    return Boolean(materialType && materialDescription && netConsumption && unit);
  };

  // For Stitching Thread: get net cns value and unit (single qty + unit, with backward compat)
  const getStitchingThreadNetCnsAndUnit = (material) => {
    if (!material) return { netCns: 0, unit: '-' };
    const isStitchingThread = material.materialType?.toString().trim() === 'Yarn' && material.subMaterial?.toString().trim() === 'Stitching Thread';
    if (!isStitchingThread) return null;
    if (material.stitchingThreadQty != null && material.stitchingThreadQty !== '') {
      const n = parseFloat(String(material.stitchingThreadQty).replace(/[^0-9.-]/g, ''));
      return { netCns: isNaN(n) ? 0 : n, unit: (material.stitchingThreadUnit || '-').toString().trim() || '-' };
    }
    if (material.stitchingThreadQtyYardage != null && String(material.stitchingThreadQtyYardage).trim() !== '') {
      const n = parseFloat(String(material.stitchingThreadQtyYardage).replace(/[^0-9.-]/g, ''));
      return { netCns: isNaN(n) ? 0 : n, unit: 'Yardage' };
    }
    if (material.stitchingThreadQtyKgs != null && String(material.stitchingThreadQtyKgs).trim() !== '') {
      const n = parseFloat(String(material.stitchingThreadQtyKgs).replace(/[^0-9.-]/g, ''));
      return { netCns: isNaN(n) ? 0 : n, unit: 'Kgs' };
    }
    return { netCns: 0, unit: '-' };
  };

  // Helper: Get raw materials for a component from stepData (Step-2)
  const getRawMaterialsForComponent = (componentName, stepData) => {
    return (
      stepData?.rawMaterials?.filter(
        (m) => m.componentName === componentName && isRawMaterialCompleteForCns(m)
      ) || []
    );
  };

  const normalizeComponentName = (value) =>
    String(value || '').trim().toLowerCase();

  const componentMatches = (componentValue, componentName) => {
    if (!componentValue) return false;
    if (Array.isArray(componentValue)) {
      return componentValue.some((v) => normalizeComponentName(v) === normalizeComponentName(componentName));
    }
    return normalizeComponentName(componentValue) === normalizeComponentName(componentName);
  };

  // Helper: Get consumption materials for a component from stepData (Step-3)
  const getConsumptionMaterialsForComponent = (componentName, stepData, productComponents = []) => {
    const materials = stepData?.consumptionMaterials || [];
    return materials.filter((m) => {
      const comp = m?.components;
      if (componentMatches(comp, componentName)) return true;
      // If component isn't set and product has only one component, attach it
      if (!comp && (productComponents || []).length === 1) return true;
      return false;
    });
  };

  // Helper: Get artwork materials for a component from stepData (Step-4)
  const getArtworkMaterialsForComponent = (componentName, stepData) => {
    return stepData?.artworkMaterials?.filter((m) => (m.components || '') === componentName) || [];
  };

  // Helper: Get quantity from artwork material based on category-specific qty field
  const getArtworkQuantity = (artwork) => {
    if (!artwork) return '';
    const cat = (artwork.artworkCategory || '').trim();
    const qtyFieldMap = {
      'LABELS (BRAND/MAIN)': 'labelsBrandQty',
      'CARE & COMPOSITION': 'careCompositionQty',
      'TAGS & SPECIAL LABELS': 'tagsSpecialLabelsQty',
      'FLAMMABILITY / SAFETY LABELS': 'flammabilitySafetyQty',
      'RFID / SECURITY TAGS': 'rfidQty',
      'LAW LABEL / CONTENTS TAG': 'lawLabelQty',
      'HANG TAG SEALS / STRINGS': 'hangTagSealsQty',
      'PRICE TICKET / BARCODE TAG': 'priceTicketQty',
      'HEAT TRANSFER LABELS': 'heatTransferQty',
      'UPC LABEL / BARCODE STICKER': 'upcBarcodeQty',
      'SIZE LABELS (INDIVIDUAL)': 'sizeLabelsQty',
      'ANTI-COUNTERFEIT & HOLOGRAMS': 'antiCounterfeitQty',
      'QC / INSPECTION LABELS': 'qcInspectionQty',
      'BELLY BAND / WRAPPER': 'bellyBandQty',
      'INSERT CARDS': 'insertCardsQty',
      'HEADER CARD': 'headerCardQty',
      'RIBBONS': 'ribbonsQty'
    };
    const field = qtyFieldMap[cat] || 'lengthQuantity';
    const val = artwork[field];
    return val != null && val !== '' ? String(val).trim() : '';
  };

  // Helper: Get qty unit (cm, kgs, pcs) from artwork material based on category
  const getArtworkQtyUnit = (artwork) => {
    if (!artwork) return '';
    const cat = (artwork.artworkCategory || '').trim();
    const unitFieldMap = {
      'LABELS (BRAND/MAIN)': 'labelsBrandQtyUnit',
      'CARE & COMPOSITION': 'careCompositionQtyUnit',
      'TAGS & SPECIAL LABELS': 'tagsSpecialLabelsQtyUnit',
      'FLAMMABILITY / SAFETY LABELS': 'flammabilitySafetyQtyUnit',
      'RFID / SECURITY TAGS': 'rfidQtyUnit',
      'LAW LABEL / CONTENTS TAG': 'lawLabelQtyUnit',
      'HANG TAG SEALS / STRINGS': 'hangTagSealsQtyUnit',
      'PRICE TICKET / BARCODE TAG': 'priceTicketQtyUnit',
      'HEAT TRANSFER LABELS': 'heatTransferQtyUnit',
      'UPC LABEL / BARCODE STICKER': 'upcBarcodeQtyUnit',
      'SIZE LABELS (INDIVIDUAL)': 'sizeLabelsQtyUnit',
      'ANTI-COUNTERFEIT & HOLOGRAMS': 'antiCounterfeitQtyUnit',
      'QC / INSPECTION LABELS': 'qcInspectionQtyUnit',
      'BELLY BAND / WRAPPER': 'bellyBandQtyUnit',
      'INSERT CARDS': 'insertCardsQtyUnit',
      'HEADER CARD': 'headerCardQtyUnit',
      'RIBBONS': 'ribbonsQtyUnit'
    };
    const field = unitFieldMap[cat];
    const val = field ? artwork[field] : '';
    return val != null && val !== '' ? String(val).trim() : '';
  };

  const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getArtworkCasepackQty = (artwork, fallbackCasepack = 0) => {
    if (!artwork) return 0;
    const cat = (artwork.artworkCategory || '').trim();
    if (cat !== 'HEADER CARD') return 0;
    const headerCardCasepack = parseNumericValue(artwork.headerCardCasepackQty);
    if (headerCardCasepack > 0) return headerCardCasepack;
    return fallbackCasepack > 0 ? fallbackCasepack : 0;
  };

  const formatCasepackDisplay = (value) => {
    if (!value || value <= 0) return '-';
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(3).replace(/\.?0+$/, '');
  };

  // Header Card is consumed per casepack in CNS; others remain per-piece.
  const getArtworkEffectiveNetCns = (artwork, fallbackCasepack = 0) => {
    const qty = parseNumericValue(getArtworkQuantity(artwork));
    if (!artwork) return qty;
    const cat = (artwork.artworkCategory || '').trim();
    if (cat !== 'HEADER CARD') return qty;
    const casepackQty = getArtworkCasepackQty(artwork, fallbackCasepack);
    return casepackQty > 0 ? (qty / casepackQty) : qty;
  };

  // Helper: Get quantity + unit display string for artwork (e.g. "100 pcs")
  const getArtworkQtyWithUnit = (artwork) => {
    const qty = getArtworkQuantity(artwork);
    const unit = getArtworkQtyUnit(artwork);
    if (!qty) return '';
    return unit ? `${qty} ${unit}` : qty;
  };

  // Helper: Get PO qty for an IPC from skus (for packaging req material calc)
  const getPoQtyForIpc = (skus, ipc) => {
    if (!ipc || !Array.isArray(skus)) return 0;
    const isSub = /\/SP-?\d+$/i.test(ipc);
    const baseIpc = (ipc || '').replace(/\/SP-?\d+$/i, '');
    const spNum = isSub ? parseInt(ipc.replace(/.*\/SP-?(\d+)$/i, '$1'), 10) : 0;
    for (const sku of skus) {
      const skuBase = sku.ipcCode?.replace(/\/SP-?\d+$/i, '') || sku.ipcCode || '';
      if (skuBase !== baseIpc) continue;
      if (!isSub) return parseFloat(sku.poQty ?? '0') || 0;
      const sub = sku.subproducts?.[spNum - 1];
      return sub ? (parseFloat(sub.poQty ?? '0') || 0) : 0;
    }
    return 0;
  };

  // Helper: Get Set Of for an IPC from skus (for packaging total material requirement calc)
  const getSetOfForIpc = (skus, ipc) => {
    if (!ipc || !Array.isArray(skus)) return 1;
    const isSub = /\/SP-?\d+$/i.test(ipc);
    const baseIpc = (ipc || '').replace(/\/SP-?\d+$/i, '');
    const spNum = isSub ? parseInt(ipc.replace(/.*\/SP-?(\d+)$/i, '$1'), 10) : 0;
    for (const sku of skus) {
      const skuBase = sku.ipcCode?.replace(/\/SP-?\d+$/i, '') || sku.ipcCode || '';
      if (skuBase !== baseIpc) continue;
      if (!isSub) return parseFloat(sku.setOf ?? '1') || 1;
      const sub = sku.subproducts?.[spNum - 1];
      return parseFloat(sub?.setOf ?? sku.setOf ?? '1') || 1;
    }
    return 1;
  };

  // Helper: Find packaging config from formData (top-level) or any sku's stepData
  // Prefer the config with the most materials (main + extraPacks)
  const getPackagingConfig = (formData) => {
    let best = null;
    let bestCount = 0;
    const totalMaterials = (pkg) => {
      const main = pkg?.materials?.length || 0;
      const extra = (pkg?.extraPacks || []).reduce((s, ep) => s + (ep?.materials?.length || 0), 0);
      return main + extra;
    };
    const consider = (pkg) => {
      if (!pkg) return;
      const n = totalMaterials(pkg);
      if (n > bestCount) {
        bestCount = n;
        best = pkg;
      }
    };
    consider(formData?.packaging);
    (formData?.skus || []).forEach((sku) => {
      consider(sku?.stepData?.packaging);
      (sku?.subproducts || []).forEach((sub) => consider(sub?.stepData?.packaging));
    });
    return best;
  };

  // Helper: Get packaging config for a product (prefer current product's sku packaging)
  const getPackagingConfigForProduct = (stepData, formData) => {
    if (stepData?.packaging) return stepData.packaging;
    if (formData?.packaging) return formData.packaging;
    return getPackagingConfig(formData);
  };

  // Helper: Check if material has meaningful data (type or description)
  const hasMaterialData = (m) => {
    const type = (m?.packagingMaterialType || '').toString().trim();
    const desc = (m?.materialDescription || '').toString().trim();
    return !!(type || desc);
  };

  // Helper: Get ALL packaging blocks (main + extraPacks) from ALL sources (formData + every sku)
  const getAllPackagingBlocks = (formData, stepData) => {
    const blocks = [];
    const seenExtraKeys = new Set();
    const addBlocksFromPkg = (pkg, isFromStepData) => {
      if (!pkg) return;
      const mainMats = (pkg?.materials || []).filter(hasMaterialData);
      if (mainMats.length > 0 && blocks.length === 0) {
        blocks.push({ config: pkg, materials: mainMats, label: 'Packaging', isExtra: false });
      }
      (pkg?.extraPacks || []).forEach((ep) => {
        const mats = (ep?.materials || []).filter(hasMaterialData);
        if (mats.length > 0) {
          const key = `${ep?.toBeShipped}-${(ep?.productSelection || []).join(',')}`;
          if (!seenExtraKeys.has(key)) {
            seenExtraKeys.add(key);
            blocks.push({ config: ep, materials: mats, label: `Packaging ${blocks.length + 1}`, isExtra: true });
          }
        }
      });
    };
    addBlocksFromPkg(stepData?.packaging, true);
    addBlocksFromPkg(formData?.packaging, false);
    (formData?.skus || []).forEach((sku) => {
      addBlocksFromPkg(sku?.stepData?.packaging, false);
      (sku?.subproducts || []).forEach((sub) => addBlocksFromPkg(sub?.stepData?.packaging, false));
    });
    return blocks;
  };

  // Helper: Get merged IPCs/products from productSelection
  const getMergedIpcsProducts = (productSelection, formData) => {
    if (!productSelection || !Array.isArray(productSelection) || productSelection.length === 0) {
      return [];
    }

    const mergedItems = [];
    formData.skus?.forEach((sku) => {
      // Check if main IPC matches
      const ipcCode = sku.ipcCode || '';
      if (productSelection.includes(ipcCode)) {
        sku.stepData?.products?.forEach((product) => {
          mergedItems.push({
            ipcCode: ipcCode,
            productName: product.name || sku.product || '',
            isSubproduct: false
          });
        });
      }

      // Check subproducts - subproduct IPC is always base/SP-{n}, never same as main
      sku.subproducts?.forEach((subproduct, spIndex) => {
        const subproductIpc = `${(ipcCode || '').replace(/\/SP-?\d+$/i, '')}/SP-${spIndex + 1}`;
        if (productSelection.includes(subproductIpc)) {
          subproduct.stepData?.products?.forEach((product) => {
            mergedItems.push({
              ipcCode: subproductIpc,
              productName: product.name || subproduct.subproduct || '',
              isSubproduct: true
            });
          });
        }
      });
    });

    return mergedItems;
  };




  // Known wastage/surplus keys on a raw material (Step-2): foam, fiber, fabric, trim&accessory, yarn categories + work orders.
  // Explicit list so we never miss a category; extractAllWastages(m) still runs to catch any nested or future keys.
  const RAW_MATERIAL_WASTAGE_SURPLUS_KEYS = [
    'surplus', 'wastage',
    'fabricSurplus', 'fabricWastage',
    'foamSurplus', 'foamWastage', 'foamPeEpeSurplus', 'foamPeEpeWastage', 'foamPuSurplus', 'foamPuWastage',
    'foamRebondedSurplus', 'foamRebondedWastage', 'foamGelInfusedSurplus', 'foamGelInfusedWastage',
    'foamLatexSurplus', 'foamLatexWastage', 'foamMemorySurplus', 'foamMemoryWastage', 'foamHrSurplus', 'foamHrWastage',
    'fiberSurplus', 'fiberWastage',
    'stitchingThreadSurplus', 'stitchingThreadWastage',
  ];

  // Human-readable labels for raw material wastage/surplus keys (for trace/breakdown)
  const RAW_MATERIAL_WASTAGE_LABELS = {
    surplus: 'Surplus',
    wastage: 'Wastage',
    fabricSurplus: 'Fabric surplus',
    fabricWastage: 'Fabric wastage',
    foamSurplus: 'Foam surplus',
    foamWastage: 'Foam wastage',
    foamPeEpeSurplus: 'Foam PE/EPE surplus',
    foamPeEpeWastage: 'Foam PE/EPE wastage',
    foamPuSurplus: 'Foam PU surplus',
    foamPuWastage: 'Foam PU wastage',
    foamRebondedSurplus: 'Foam rebonded surplus',
    foamRebondedWastage: 'Foam rebonded wastage',
    foamGelInfusedSurplus: 'Foam gel infused surplus',
    foamGelInfusedWastage: 'Foam gel infused wastage',
    foamLatexSurplus: 'Foam latex surplus',
    foamLatexWastage: 'Foam latex wastage',
    foamMemorySurplus: 'Foam memory surplus',
    foamMemoryWastage: 'Foam memory wastage',
    foamHrSurplus: 'Foam HR surplus',
    foamHrWastage: 'Foam HR wastage',
    fiberSurplus: 'Fiber surplus',
    fiberWastage: 'Fiber wastage',
    stitchingThreadSurplus: 'Stitching thread surplus',
    stitchingThreadWastage: 'Stitching thread wastage',
  };

  const formatWastageLabel = (key) => {
    if (RAW_MATERIAL_WASTAGE_LABELS[key]) return RAW_MATERIAL_WASTAGE_LABELS[key];
    return String(key)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const getTrimAccessoryWastageValues = (material) => {
    if (!material || material.materialType !== 'Trim & Accessory') return [];
    const trimType = material.trimAccessory?.toString().trim();
    const schema = trimType ? TRIM_ACCESSORY_SCHEMAS?.[trimType] : null;
    const keys = [
      ...(schema?.required || []),
      ...(schema?.advanced || []),
      ...Object.keys(schema?.conditional || {})
    ];
    const values = [];
    keys.forEach((key) => {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('wastage') || keyLower.includes('surplus')) {
        const value = material[key];
        if (value !== undefined && value !== null && value !== '') values.push({ key, value });
      }
    });
    // Also include generic surplus/wastage if present
    if (material.surplus !== undefined && material.surplus !== null && material.surplus !== '') {
      values.push({ key: 'surplus', value: material.surplus });
    }
    if (material.wastage !== undefined && material.wastage !== null && material.wastage !== '') {
      values.push({ key: 'wastage', value: material.wastage });
    }
    return values;
  };

  // Returns [{ source: string, value: number }] for one raw material only: this material's surplus/wastage + this material's work orders' wastage. No component.
  const getRawMaterialWastageBreakdown = (material) => {
    const breakdown = [];
    const added = new Set();
    const add = (source, value) => {
      const key = `${source}::${value}`;
      if (added.has(key)) return;
      added.add(key);
      const num = parseFloat(String(value).replace('%', '')) || 0;
      if (num > 0) breakdown.push({ source, value: num });
    };

    RAW_MATERIAL_WASTAGE_SURPLUS_KEYS.forEach((key) => {
      if (material[key] !== undefined && material[key] !== null && material[key] !== '') {
        add(RAW_MATERIAL_WASTAGE_LABELS[key] || key, material[key]);
      }
    });
    getTrimAccessoryWastageValues(material).forEach(({ key, value }) => {
      add(formatWastageLabel(key), value);
    });
    (material.workOrders || []).forEach((wo, idx) => {
      const woValues = [];
      extractAllWastages(wo, woValues);
      const woLabel = wo.workOrder ? `Work order (${wo.workOrder})` : `Work order ${idx + 1}`;
      woValues.forEach((v, i) => {
        add(woValues.length > 1 ? `${woLabel} #${i + 1}` : woLabel, v);
      });
    });

    return breakdown;
  };





  // Helper: Get unit for a component from rawMaterials
  const getUnitForComponent = (componentName, stepData) => {
    const rawMats = getRawMaterialsForComponent(componentName, stepData);
    if (rawMats.length > 0 && rawMats[0].unit) {
      return rawMats[0].unit;
    }
    return 'CM';
  };


  // Helper: Get component details from Step-1 products (cutting size, sew size)
  const getComponentDetails = (componentName, productComponents) => {
    for (const comp of productComponents || []) {
      if (comp.productComforter === componentName) {
        return comp;
      }
    }
    return null;
  };

  // Helper: Format packaging type name (convert "CARTON BOX" to "Carton Box")
  const formatPackagingTypeName = (type) => {
    if (!type) return '-';
    // Convert to title case: "CARTON BOX" -> "Carton Box"
    return type
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const normalizeDisplayValue = (value) => {
    const normalized = String(value ?? '').trim();
    if (!normalized || normalized === '-' || normalized === '–') return '';
    return normalized;
  };

  const resolveSelectWithCustomText = (source, valueKey, textKey) => {
    const selectedValue = normalizeDisplayValue(source?.[valueKey]);
    if (!selectedValue) return '';
    if (/^OTHERS?\s*\(TEXT\)$/i.test(selectedValue) && textKey) {
      return normalizeDisplayValue(source?.[textKey]) || selectedValue;
    }
    return selectedValue;
  };

  const getArtworkDescription = (artwork) => {
    if (!artwork) return '-';
    const category = normalizeDisplayValue(artwork.artworkCategory);
    const manualDescription = normalizeDisplayValue(artwork.materialDescription);
    const fieldMap = ARTWORK_DESCRIPTION_FIELD_MAP[category] || {};

    const typeValue = fieldMap.typeKey
      ? resolveSelectWithCustomText(artwork, fieldMap.typeKey, fieldMap.typeTextKey)
      : normalizeDisplayValue(artwork.specificType || artwork.type);
    const materialValue = fieldMap.materialKey
      ? resolveSelectWithCustomText(artwork, fieldMap.materialKey, fieldMap.materialTextKey)
      : normalizeDisplayValue(artwork.material);

    const parts = [];
    if (category) parts.push(`Category: ${category}`);
    if (typeValue) parts.push(`Type: ${typeValue}`);
    if (materialValue) parts.push(`Material: ${materialValue}`);

    if (parts.length > 0) return parts.join('\n');
    return manualDescription || '-';
  };

  const getFirstDisplayValue = (source, keys = []) => {
    for (const key of keys) {
      const value = normalizeDisplayValue(source?.[key]);
      if (!value) continue;
      if (/^OTHERS?\s*\(TEXT\)$/i.test(value)) {
        const customText = normalizeDisplayValue(source?.[`${key}Text`]);
        return customText || value;
      }
      return value;
    }
    return '';
  };

  const getPackagingDescription = (packaging) => {
    if (!packaging) return '-';
    const manualDescription = normalizeDisplayValue(packaging.materialDescription);
    const packagingType = normalizeDisplayValue(packaging.packagingMaterialType);
    const detailFieldConfig = PACKAGING_DESCRIPTION_FIELD_MAP[packagingType] || [];

    const detailParts = detailFieldConfig
      .map(({ label, keys }) => {
        const value = getFirstDisplayValue(packaging, keys);
        return value ? `${label}: ${value}` : '';
      })
      .filter(Boolean);

    if (detailParts.length === 0) return manualDescription || '-';
    if (!manualDescription) return detailParts.join('\n');

    const containsManual = detailParts.some((part) => part.toLowerCase().includes(manualDescription.toLowerCase()));
    if (containsManual) return detailParts.join('\n');
    return `${manualDescription}\n${detailParts.join('\n')}`;
  };

  const getPackagingSize = (packaging) => {
    if (!packaging) return '-';
    const packagingType = normalizeDisplayValue(packaging.packagingMaterialType);
    const sizeFieldConfig = PACKAGING_SIZE_FIELD_MAP[packagingType] || [];

    if (sizeFieldConfig.length === 0) return '-';

    const sizeParts = sizeFieldConfig
      .map(({ label, keys, unitKeys }) => {
        const value = getFirstDisplayValue(packaging, keys);
        if (!value) return '';
        
        // Get unit if available
        let unit = '';
        if (unitKeys && unitKeys.length > 0) {
          unit = getFirstDisplayValue(packaging, unitKeys);
        }
        
        return unit ? `${value}${unit}` : value;
      })
      .filter(Boolean);

    if (sizeParts.length === 0) return '-';
    return sizeParts.join(' x ');
  };

  const getStiffenerQuantityForCartonBox = (packaging, totalMatReq) => {
    if (!packaging) return null;
    const packagingType = normalizeDisplayValue(packaging.packagingMaterialType);
    
    // Only for CARTON BOX material type
    if (packagingType !== 'CARTON BOX') return null;
    
    // Check if stiffener is required
    const stiffenerRequired = normalizeDisplayValue(packaging.cartonBoxStiffenerRequired);
    if (stiffenerRequired !== 'YES') return null;
    
    // Get stiffener quantity from form (quantity per piece)
    const stiffenerQtyPerPiece = parseFloat(String(packaging.cartonBoxQuantity || '').trim()) || 0;
    
    // If no stiffener quantity in form, return null
    if (stiffenerQtyPerPiece === 0) return null;
    
    // Calculate total stiffener quantity: per piece × total material requirement
    const reqMatNum = typeof totalMatReq === 'string' ? parseFloat(totalMatReq) : totalMatReq;
    const totalStiffenerQty = Math.round(stiffenerQtyPerPiece * reqMatNum);
    
    return totalStiffenerQty;
  };

  const getPackagingDescriptionWithStiffener = (packaging, totalMatReq) => {
    const baseDesc = getPackagingDescription(packaging);
    
    // Check if this is CARTON BOX with stiffener quantity
    const stiffenerQty = getStiffenerQuantityForCartonBox(packaging, totalMatReq);
    
    if (stiffenerQty === null) {
      return baseDesc;
    }
    
    // Append stiffener quantity to description
    const stiffenerInfo = `Stiffener Quantity: ${stiffenerQty}`;
    if (baseDesc === '-') {
      return stiffenerInfo;
    }
    return `${baseDesc}\n${stiffenerInfo}`;
  };

  const buildPurchaseSharePayload = () => {
    const ipcs = [];
    const getUqrFormsForStepData = (stepData) => {
      const formKeys = new Set();
      const sd = stepData || {};

      (sd.rawMaterials || []).forEach((material) => {
        const hasMaterialQualityYes = isQualityYes(material?.qualityVerification);
        const hasWorkOrderQualityYes = Array.isArray(material?.workOrders)
          && material.workOrders.some((workOrder) => isQualityYes(workOrder?.qualityVerification));
        if (!hasMaterialQualityYes && !hasWorkOrderQualityYes) return;

        const formKey = mapRawMaterialToFormKey(material);
        if (formKey) formKeys.add(formKey);
      });

      (sd.artworkMaterials || []).forEach((material) => {
        const artworkCategory = material?.artworkCategory;
        const qualityValue =
          material?.qualityVerificationByCategory?.[artworkCategory] ?? material?.qualityVerification;
        if (!isQualityYes(qualityValue)) return;

        const formKey = mapArtworkCategoryToFormKey(artworkCategory);
        if (formKey) formKeys.add(formKey);
      });

      return Array.from(formKeys).sort();
    };

    const addIpc = (ipcCode, stepData) => {
      if (!ipcCode) return;
      const sd = stepData || {};
      const rawSet = new Set();
      (sd.rawMaterials || []).forEach((m) => {
        if (!isRawMaterialCompleteForCns(m)) return;
        const label = m.materialDescription || m.materialType || '';
        if (label) rawSet.add(label);
      });

      const trimSet = new Set();
      (sd.consumptionMaterials || []).forEach((m) => {
        const label = (m.materialDescription || '').trim();
        const net = (m.netConsumption || '').toString().trim();
        if (label && net) trimSet.add(label);
      });

      const artworkSet = new Set();
      (sd.artworkMaterials || []).forEach((m) => {
        const label = (m.artworkCategory || m.material || '').toString().trim();
        if (label) artworkSet.add(label);
      });

      const packagingSet = new Set();
      (formData?.packaging?.materials || sd.packaging?.materials || []).forEach((m) => {
        const label = formatPackagingTypeName(m.packagingMaterialType || '');
        if (label && label !== '-') packagingSet.add(label);
      });

      ipcs.push({
        ipcCode,
        uqrForms: getUqrFormsForStepData(sd),
        categories: {
          rawMaterials: Array.from(rawSet),
          trimsAccessory: Array.from(trimSet),
          artworkLabeling: Array.from(artworkSet),
          packaging: Array.from(packagingSet)
        }
      });
    };

    formData.skus?.forEach((sku, skuIndex) => {
      const ipcCode = sku.ipcCode || `IPC-${skuIndex + 1}`;
      addIpc(ipcCode, sku.stepData);
      sku.subproducts?.forEach((subproduct, spIndex) => {
        const spCode = `${(ipcCode || `IPC-${skuIndex + 1}`).replace(/\/SP-?\d+$/i, '')}/SP-${spIndex + 1}`;
        addIpc(spCode, subproduct.stepData);
      });
    });

    const code = formData.ipoCode || formData.buyerCode || '';
    return {
      code,
      orderType: formData.orderType || '',
      sharedAt: new Date().toISOString(),
      ipcs
    };
  };

  const handleShareToPurchase = () => {
    const payload = buildPurchaseSharePayload();
    if (!payload.code) return false;
    const existing = JSON.parse(localStorage.getItem(PURCHASE_SHARE_KEY) || '[]');
    const next = Array.isArray(existing) ? [...existing] : [];
    const idx = next.findIndex((entry) => entry.code === payload.code && entry.orderType === payload.orderType);
    if (idx >= 0) {
      next[idx] = payload;
    } else {
      next.push(payload);
    }
    localStorage.setItem(PURCHASE_SHARE_KEY, JSON.stringify(next));
    return true;
  };

  useImperativeHandle(ref, () => ({
    shareToPurchase: handleShareToPurchase
  }), [formData.skus, formData.ipoCode, formData.buyerCode, formData.orderType]);

  // Build flat list: IPC → Product/Subproduct → Components (in form order)
  const allProducts = useMemo(() => {
    const products = [];
    formData.skus?.forEach((sku, skuIndex) => {
      // Main product(s) for this IPC
      sku.stepData?.products?.forEach((product, productIndex) => {
        products.push({
          type: 'main',
          skuIndex,
          productIndex,
          ipcCode: sku.ipcCode || `IPC-${skuIndex + 1}`,
          productName: product.name || sku.product || '',
          setOf: sku.setOf || '',
          poQty: sku.poQty,
          overagePercentage: sku.overagePercentage,
          isSubproduct: false,
          stepData: sku.stepData,
          productComponents: product.components || [],
          components: product.components || []
        });
      });
      // Subproducts for this IPC
      sku.subproducts?.forEach((subproduct, spIndex) => {
        subproduct.stepData?.products?.forEach((product, productIndex) => {
          products.push({
            type: 'subproduct',
            skuIndex,
            spIndex,
            productIndex,
            ipcCode: `${(sku.ipcCode || `IPC-${skuIndex + 1}`).replace(/\/SP-?\d+$/i, '')}/SP-${spIndex + 1}`,
            productName: product.name || subproduct.subproduct || '',
            setOf: sku.setOf || '',
            poQty: subproduct.poQty,
            overagePercentage: subproduct.overagePercentage,
            isSubproduct: true,
            spLabel: `SP${spIndex + 1}`,
            stepData: subproduct.stepData,
            productComponents: product.components || [],
            components: product.components || []
          });
        });
      });
    });
    return products;
  }, [formData.skus]);

  // Component Row: full block from Raw Material rows to Work Orders to Artwork
  const ComponentRow = ({ componentName, component, product }) => {
    const stepData = product.stepData;
    const productComponents = product.productComponents || [];

    const unit = getUnitForComponent(componentName, stepData);
    const rawMats = getRawMaterialsForComponent(componentName, stepData);
    const allConsumptionMats = getConsumptionMaterialsForComponent(componentName, stepData, productComponents);
    const componentDetails = component || getComponentDetails(componentName, productComponents);
    const artworkMats = getArtworkMaterialsForComponent(componentName, stepData);
    const artworkFallbackCasepack = parseNumericValue(getPackagingConfigForProduct(stepData, formData)?.casepackQty);
    const overageQty = calculateOverageQty(product.poQty || 0, product.overagePercentage || '0');
    const setOfNumber = parseFloat(String(product.setOf || '').trim()) || 1;

    let componentWastage = null;
    for (const comp of productComponents || []) {
      if (comp.productComforter === componentName && comp.wastage) {
        componentWastage = comp.wastage;
        break;
      }
    }

    const row4Cell = 'min-w-0 border-r border-border bg-muted/5 flex items-center';
    const row4Last = 'min-w-0 border-border bg-muted/5 flex items-center';
    const desktopTableCell = { padding: '14px 18px' };
    const desktopHeaderCell = { padding: '12px 18px' };

    const renderInfoIcon = (message, options = {}) => {
      const { align: alignOption = 'center', size = 'md' } = options;
      const align = size === 'sm' && alignOption === 'center' ? 'left' : alignOption;
      const sizeMap = {
        sm: { button: 12, icon: 8 },
        md: { button: 14, icon: 9 }
      };
      const { button, icon } = sizeMap[size] || sizeMap.md;
      const tooltipStyle = {
        left: '50%',
        top: '110%',
        transform: 'translateX(-50%)',
        minWidth: '180px',
        maxWidth: 'calc(100vw - 32px)',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.1)',
        background: 'white',
        color: '#111827',
        fontSize: '11px',
        lineHeight: '1.4',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        whiteSpace: 'pre-line'
      };

      if (align === 'right') {
        tooltipStyle.left = 'auto';
        tooltipStyle.right = 0;
        tooltipStyle.transform = 'translateX(0)';
      } else if (align === 'left') {
        tooltipStyle.left = 0;
        tooltipStyle.transform = 'translateX(0)';
      }

      return (
      <span className="relative inline-flex items-center group shrink-0" style={{ marginInline: '2px' }}>
        <button
          type="button"
          className="inline-flex items-center justify-center border border-black/60 text-muted-foreground bg-transparent hover:bg-black/5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          style={{
            width: `${button}px`,
            height: `${button}px`,
            minWidth: `${button}px`,
            padding: 0,
            lineHeight: `${button}px`,
            borderRadius: '9999px',
            boxSizing: 'border-box',
            flex: '0 0 auto'
          }}
          aria-label={message}
        >
          <svg
            viewBox="0 0 20 20"
            width={icon}
            height={icon}
            aria-hidden="true"
            className="block"
          >
            <line x1="10" y1="8" x2="10" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="5.3" r="1.4" fill="currentColor" />
          </svg>
        </button>
        <span
          className="pointer-events-none absolute z-20 hidden group-hover:block group-focus-visible:block"
          style={tooltipStyle}
        >
          {message}
        </span>
      </span>
      );
    };

    const hasMeaningfulValue = (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return !Number.isNaN(value);
      if (typeof value === 'boolean') return value === true;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
      return false;
    };

    const getConsumptionWastages = (material) => {
      const list = [];
      const addedKeys = new Set();
      const pushValue = (key, value) => {
        if (value === undefined || value === null || value === '') return;
        if (addedKeys.has(key)) return;
        addedKeys.add(key);
        list.push(value);
      };

      // Generic extraction (recursive)
      extractAllWastages(material, list);

      // Explicit trim/accessory keys (defensive: ensure ribbing, etc. are captured)
      const trimType = material?.trimAccessory?.toString().trim();
      const schema = trimType ? TRIM_ACCESSORY_SCHEMAS?.[trimType] : null;
      const schemaKeys = [
        ...(schema?.required || []),
        ...(schema?.advanced || []),
        ...Object.keys(schema?.conditional || {})
      ];
      schemaKeys
        .filter((k) => {
          const kLower = k.toLowerCase();
          return kLower.includes('wastage') || kLower.includes('surplus');
        })
        .forEach((key) => pushValue(key, material?.[key]));

      // Also include generic surplus/wastage if present
      pushValue('surplus', material?.surplus);
      pushValue('wastage', material?.wastage);

      return list;
    };

    const isMeaningfulConsumptionMaterial = (material) => {
      if (!material) return false;
      const hasCore =
        hasMeaningfulValue(material.trimAccessory) ||
        hasMeaningfulValue(material.materialDescription) ||
        hasMeaningfulValue(material.netConsumption) ||
        hasMeaningfulValue(material.unit) ||
        hasMeaningfulValue(material.workOrder);
      const wastages = getConsumptionWastages(material);
      return hasCore || wastages.length > 0;
    };

    const consumptionMats = (allConsumptionMats || []).filter(isMeaningfulConsumptionMaterial);

    const filterValidWorkOrders = (workOrders = []) => {
      return workOrders.filter((wo) => {
        if (!wo || typeof wo !== 'object') return false;
        return Object.values(wo).some((value) => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'number') return value !== 0 && !Number.isNaN(value);
          if (typeof value === 'boolean') return value === true;
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'object') return Object.values(value).some((v) => v !== null && v !== undefined && `${v}`.trim() !== '');
          return false;
        });
      });
    };

    const renderMaterialWorkOrders = (workOrders) => {
      if (!workOrders || workOrders.length === 0) {
        return (
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Work orders –</div>
        );
      }
      return (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Work orders</span>
          <div className="flex flex-wrap gap-3">
            {workOrders.map((wo, idx) => (
              <div
                key={`${wo.workOrder || 'wo'}-${idx}`}
                className="bg-muted/10 border border-border rounded-lg text-sm"
                style={{ padding: '8px 12px' }}
              >
                <span className="font-semibold text-foreground">{wo.workOrder || `WO ${idx + 1}`}</span>
                {wo.wastage && (
                  <span className="text-muted-foreground text-xs block mt-1">Wastage: {wo.wastage}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderDesktopMaterialBlock = (material, matIdx) => {
      const stitchingData = getStitchingThreadNetCnsAndUnit(material);
      const matNetCns = stitchingData !== null
        ? stitchingData.netCns
        : (material.netConsumption != null ? parseFloat(material.netConsumption) : 0);
      const wastageBreakdown = getRawMaterialWastageBreakdown(material);
      const matWastages = wastageBreakdown.map((b) => b.value);
      const matCompoundWastage = calculateCompoundWastage(matWastages);
      const matTotalWastage = calculateTotalWastage(matWastages);
      const matGrossCns = calculateGrossCns(overageQty, matWastages, matNetCns);
      const matGrossCnsSet = (parseFloat(matGrossCns) || 0) * setOfNumber;
      const matUnit = stitchingData !== null ? stitchingData.unit : (material.unit || unit || '-');
      const materialWorkOrders = filterValidWorkOrders(material.workOrders || []);
      const wastageTraceTitle = wastageBreakdown.length > 0
        ? `Gross wastage from (compounded): ${wastageBreakdown.map((b) => `${b.source} ${b.value}%`).join(' → ')}`
        : '';

      return (
        <div key={matIdx} className="min-w-0 border-b border-border">
          <div className="grid min-w-0" style={{ gridTemplateColumns: RAW_MAT_GRID }}>
            <div className={row4Cell} style={desktopTableCell}>
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground">{matIdx + 1}.</span>
                <span className={`text-sm text-foreground ${CELL_WRAP}`}>{material.materialType || '-'}</span>
              </div>
            </div>
            <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground ${CELL_WRAP}`}>{material.materialDescription || '-'}</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{matNetCns || '-'}</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{overageQty}</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{matTotalWastage}%</span></div>
            <div className={row4Cell} style={desktopTableCell} title={wastageTraceTitle}><span className="text-base font-bold text-foreground">{matCompoundWastage}%</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-primary">{matGrossCns}</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-primary">{matGrossCnsSet.toFixed(3)}</span></div>
            <div className={row4Last} style={desktopTableCell}><span className="text-base font-bold text-foreground uppercase">{matUnit}</span></div>
          </div>
          <div className="border-t border-border/70 bg-muted/5" style={{ padding: '14px 18px' }}>
            {renderMaterialWorkOrders(materialWorkOrders)}
          </div>
        </div>
      );
    };

    const renderDesktopConsumptionBlock = (material, matIdx) => {
      const hasNet = material.netConsumption !== null && material.netConsumption !== undefined && String(material.netConsumption).trim() !== '';
      const netCns = hasNet ? parseFloat(material.netConsumption) || 0 : null;
      const wastages = getConsumptionWastages(material);
      const totalWastage = calculateTotalWastage(wastages);
      const compoundWastage = calculateCompoundWastage(wastages);
      const grossCns = hasNet ? calculateGrossCns(overageQty, wastages, netCns) : '-';
      const label = material.trimAccessory || material.materialDescription || `Consumption ${matIdx + 1}`;
      const matUnit = material.unit || '-';

      return (
        <div key={matIdx} className="min-w-0 border-b border-border">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 min-w-0">
            <div className={row4Cell} style={desktopTableCell}>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-muted-foreground">{matIdx + 1}.</span>
                <span className={`text-sm text-foreground ${CELL_WRAP}`}>{label}</span>
              </div>
            </div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{netCns ?? '-'}</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{totalWastage}%</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{compoundWastage}%</span></div>
            <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-primary">{grossCns}</span></div>
            <div className={row4Last} style={desktopTableCell}><span className="text-base font-bold text-foreground uppercase">{matUnit}</span></div>
          </div>
        </div>
      );
    };

    const renderMobileTimelineBlock = (material, matIdx) => {
      const stitchingData = getStitchingThreadNetCnsAndUnit(material);
      const matNetCns = stitchingData !== null
        ? stitchingData.netCns
        : (material.netConsumption != null ? parseFloat(material.netConsumption) : 0);
      const wastageBreakdown = getRawMaterialWastageBreakdown(material);
      const matWastages = wastageBreakdown.map((b) => b.value);
      const matCompoundWastage = calculateCompoundWastage(matWastages);
      const matTotalWastage = calculateTotalWastage(matWastages);
      const matGrossCns = calculateGrossCns(overageQty, matWastages, matNetCns);
      const matGrossCnsSet = (parseFloat(matGrossCns) || 0) * setOfNumber;
      const matUnit = (stitchingData !== null ? stitchingData.unit : (material.unit || unit || '-')).toString().toUpperCase();
      const materialWorkOrders = filterValidWorkOrders(material.workOrders || []);

      return (
        <div key={matIdx} className="rounded-xl border border-border bg-white shadow-sm">
          <div style={{ padding: '16px 18px' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Material {matIdx + 1}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">#{matIdx + 1}</span>
              </div>
              <p className="mt-1.5 text-base font-semibold text-foreground leading-snug">{material.materialType || 'Raw material'}</p>
              {material.materialDescription && (
                <p className="mt-1 text-sm text-muted-foreground leading-snug break-words">{material.materialDescription}</p>
              )}
            </div>
            <div className="space-y-3 mt-3">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Sum of net consumption for this raw material', { size: 'sm' })} Net CNS
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{matNetCns !== 0 ? matNetCns : '–'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('PO Qty with overage applied', { size: 'sm' })} Overage Qty
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{overageQty}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Sum of all wastage/surplus values for this raw material and its work orders', { size: 'sm' })} Wastage
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{matTotalWastage}%</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon(`Extra material needed after compounding all wastage and surplus required.
Formula:
Gross Wastage % = ((1+w1/100) × (1+w2/100) × ... − 1) × 100`, { size: 'sm' })} Gross Wastage
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{matCompoundWastage}%</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Unit from raw material', { size: 'sm' })} Unit
                </span>
                <span className="text-sm font-semibold text-foreground uppercase">{matUnit}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3 pt-2 mt-1 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Gross CNS per piece multiplied by overage quantity', { size: 'sm' })} Gross CNS
                </span>
                <span className="text-base font-bold text-primary tabular-nums">{matGrossCns}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Gross CNS multiplied by Set Of', { size: 'sm' })} Gross CNS
                  <span className="text-[11px] text-muted-foreground">Set of {setOfNumber}</span>
                </span>
                <span className="text-base font-bold text-primary tabular-nums">{matGrossCnsSet.toFixed(3)}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/70 bg-muted/5" style={{ padding: '14px 18px' }}>
            {renderMaterialWorkOrders(materialWorkOrders)}
          </div>
        </div>
      );
    };

    const renderMobileConsumptionBlock = (material, matIdx) => {
      const hasNet = material.netConsumption !== null && material.netConsumption !== undefined && String(material.netConsumption).trim() !== '';
      const netCns = hasNet ? parseFloat(material.netConsumption) || 0 : null;
      const wastages = getConsumptionWastages(material);
      const totalWastage = calculateTotalWastage(wastages);
      const compoundWastage = calculateCompoundWastage(wastages);
      const grossCns = hasNet ? calculateGrossCns(overageQty, wastages, netCns) : '-';
      const label = material.trimAccessory || material.materialDescription || `Consumption ${matIdx + 1}`;
      const matUnit = (material.unit || '-').toString().toUpperCase();

      return (
        <div key={matIdx} className="rounded-xl border border-border bg-white shadow-sm">
          <div style={{ padding: '16px 18px' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Consumption {matIdx + 1}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">#{matIdx + 1}</span>
              </div>
              <p className="mt-1.5 text-base font-semibold text-foreground leading-snug">{label}</p>
            </div>
            <div className="space-y-3 mt-3">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Net consumption for this trim/accessory', { size: 'sm' })} Net CNS
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{netCns ?? '–'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Sum of all wastage/surplus values for this trim/accessory', { size: 'sm' })} Wastage
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{totalWastage}%</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Compounded wastage/surplus for this trim/accessory', { size: 'sm' })} Gross Wastage
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{compoundWastage}%</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Gross CNS per piece multiplied by overage quantity', { size: 'sm' })} Gross CNS
                </span>
                <span className="text-base font-bold text-primary tabular-nums">{grossCns}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                  {renderInfoIcon('Unit from consumption material', { size: 'sm' })} Unit
                </span>
                <span className="text-sm font-semibold text-foreground uppercase">{matUnit}</span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="w-full min-w-0">
        <div className="border border-border rounded-xl bg-card shadow-sm min-w-0" style={{ padding: '20px' }}>
          {/* ROW 1-3: IPC / Product / Component — Product Spec */}
          <div {...editSectionProps('product-spec', product)}>
            <div className="border-b border-border bg-gradient-to-r from-muted/40 to-muted/20" style={{ padding: '16px 20px' }}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">IPC Code</span>
              <span className="text-lg font-bold text-foreground">{product.ipcCode}</span>
            </div>
            <div className="border-b border-border bg-gradient-to-r from-muted/30 to-muted/10 flex items-center justify-between gap-4" style={{ padding: '16px 20px' }}>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {product.isSubproduct ? 'Subproduct' : 'Product'}
                </span>
                <span className="text-base font-semibold text-foreground">{product.productName || '-'}</span>
              </div>
              {product.setOf && (
                <span className="text-sm font-medium text-muted-foreground shrink-0">Set of {product.setOf}</span>
              )}
            </div>
            <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent" style={{ padding: '16px 20px' }}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Component</span>
              <span className="text-base font-bold text-primary">{componentName || '-'}</span>
            </div>
          </div>

          {/* ROW 4: One row per raw material — grouped layout */}
          <div className="border-b border-border min-w-0" {...editSectionProps('raw-material', product)}>
            {isMobileCns ? (
              <div className="bg-muted/5" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {rawMats.length > 0 ? (
                  rawMats.map((material, mIdx) => renderMobileTimelineBlock(material, mIdx))
                ) : (
                  <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden p-5 text-sm font-medium text-muted-foreground">
                    No raw material
                  </div>
                )}
              </div>
            ) : (
              <div className="min-w-0">
                <div className="grid min-w-0 border-b border-border bg-muted/30" style={{ gridTemplateColumns: RAW_MAT_GRID }}>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Raw Material {renderInfoIcon('Each row is a raw material; its work orders are listed below')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Material Description {renderInfoIcon('Description of the raw material')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Net CNS {renderInfoIcon('Sum of net consumption for this raw material')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Overage Qty {renderInfoIcon('PO Qty with overage applied')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Wastage {renderInfoIcon('Sum of all wastage/surplus values for this raw material and its work orders')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Gross Wastage {renderInfoIcon(`Extra material needed after compounding all wastage and surplus required.
Formula:
Gross Wastage % = ((1+w1/100) × (1+w2/100) × ... − 1) × 100`)}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Gross CNS {renderInfoIcon('Gross CNS per piece multiplied by overage quantity')}
                    </span>
                  </div>
                  <div className={row4Cell} style={desktopHeaderCell}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Gross CNS {renderInfoIcon('Gross CNS multiplied by Set Of', { align: 'right' })}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Set of {setOfNumber}</span>
                    </div>
                  </div>
                  <div className={row4Last} style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Unit {renderInfoIcon('Unit from raw material', { align: 'right' })}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  {rawMats.length > 0 ? (
                    rawMats.map((material, mIdx) => renderDesktopMaterialBlock(material, mIdx))
                  ) : (
                  <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden p-5 text-sm font-medium text-muted-foreground">
                    No raw material
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
          {/* CONSUMPTION MATERIALS SECTION */}
          {consumptionMats.length > 0 && (
            <div className="border-b border-border bg-muted/5" style={isMobileCns ? { padding: '18px 16px' } : { padding: '20px' }} {...editSectionProps('raw-material', product)}>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-4">Consumption Materials</span>
              {isMobileCns ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {consumptionMats.map((material, idx) => renderMobileConsumptionBlock(material, idx))}
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 min-w-0 border-b border-border bg-muted/30">
                    <div className={row4Cell} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Trim/Accessory {renderInfoIcon('Each row is a trim/accessory from Step-3')}
                      </span>
                    </div>
                    <div className={row4Cell} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Net CNS {renderInfoIcon('Net consumption for this trim/accessory')}
                      </span>
                    </div>
                    <div className={row4Cell} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Wastage {renderInfoIcon('Sum of all wastage/surplus values for this trim/accessory')}
                      </span>
                    </div>
                    <div className={row4Cell} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Gross Wastage {renderInfoIcon('Compounded wastage/surplus for this trim/accessory')}
                      </span>
                    </div>
                    <div className={row4Cell} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Gross CNS {renderInfoIcon('Gross CNS per piece multiplied by overage quantity')}
                      </span>
                    </div>
                    <div className={row4Last} style={desktopHeaderCell}>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Unit {renderInfoIcon('Unit from consumption material', { align: 'right' })}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    {consumptionMats.map((material, idx) => renderDesktopConsumptionBlock(material, idx))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ROW 5: SPEC */}
          <div className="border-b border-border bg-muted/5" style={isMobileCns ? { padding: '18px 16px' } : { padding: '20px' }} {...editSectionProps('cut-sew', product)}>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-4">Specification</span>
            <div className="grid grid-cols-2" style={isMobileCns ? { gap: '16px' } : { gap: '20px' }}>
              <div className="bg-white rounded-lg border border-border shadow-sm" style={{ padding: isMobileCns ? '16px 18px' : '18px 20px' }}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Cut Size</span>
                {String(componentDetails?.unit || unit || '').toUpperCase() === 'KGS' ? (
                  <span className="text-base font-medium text-foreground">
                    {componentDetails?.cuttingSize?.consumption ?? '-'}
                    <span className="text-muted-foreground font-normal"> kgs</span>
                  </span>
                ) : (
                  <span className="text-base font-medium text-foreground">
                    {componentDetails?.cuttingSize?.length || '-'} × {componentDetails?.cuttingSize?.width || '-'} cm
                  </span>
                )}
              </div>
              <div className="bg-white rounded-lg border border-border shadow-sm" style={{ padding: isMobileCns ? '16px 18px' : '18px 20px' }}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Sew Size</span>
                {String(componentDetails?.unit || unit || '').toUpperCase() === 'KGS' ? (
                  <span className="text-base font-medium text-foreground">
                    {componentDetails?.sewSize?.consumption ?? '-'}
                    <span className="text-muted-foreground font-normal"> kgs</span>
                  </span>
                ) : (
                  <span className="text-base font-medium text-foreground">
                    {componentDetails?.sewSize?.length || '-'} × {componentDetails?.sewSize?.width || '-'} cm
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ARTWORK SECTION */}
          {artworkMats.length > 0 && (
            <div className="border-b border-border bg-muted/5 min-w-0" style={isMobileCns ? { padding: '18px 16px' } : { padding: '20px' }} {...editSectionProps('artwork', product)}>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-4">Artwork</span>
              {isMobileCns ? (
              /* Mobile: grouped cards */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {artworkMats.map((artwork, idx) => {
                  const artworkQty = getArtworkQuantity(artwork);
                  const artworkCasepack = getArtworkCasepackQty(artwork, artworkFallbackCasepack);
                  const artworkQtyNum = getArtworkEffectiveNetCns(artwork, artworkFallbackCasepack);
                  const artworkWastageSurplus = extractArtworkWastageSurplus(artwork);
                  const artworkCompoundWastage = calculateCompoundWastage(artworkWastageSurplus);
                  const artworkGrossCns = calculateGrossCns(overageQty, artworkWastageSurplus, artworkQtyNum);
                  const artworkGrossCnsSet = (parseFloat(artworkGrossCns) || 0) * setOfNumber;
                  const artUnit = (getArtworkQtyUnit(artwork) || artwork.unit || '-').toString().toUpperCase();
                  return (
                    <div key={idx} className="rounded-xl border border-border bg-white shadow-sm min-w-0">
                      <div style={{ padding: '16px 18px' }}>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Artwork {idx + 1}</span>
                        <p className="mt-1.5 text-base font-semibold text-foreground leading-snug break-words whitespace-pre-line">{getArtworkDescription(artwork) || '–'}</p>
                      </div>
                      <div className="border-t border-border bg-muted/20" style={{ padding: '14px 18px' }}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-baseline gap-3">
                            <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Quantity from artwork material', { size: 'sm' })} Quantity
                            </span>
                            <span className="text-sm font-semibold text-foreground tabular-nums">{artworkQty || '–'}</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-3">
                            <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Header Card casepack from Artwork; falls back to Packaging casepack when blank', { size: 'sm' })} Casepack
                            </span>
                            <span className="text-sm font-semibold text-foreground tabular-nums">{formatCasepackDisplay(artworkCasepack)}</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-3">
                            <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Sum of all wastage/surplus values for this artwork material', { size: 'sm' })} Wastage
                            </span>
                            <span className="text-sm font-semibold text-foreground tabular-nums">{artworkCompoundWastage}%</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-3">
                            <span className="text-xs font-medium text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Unit from artwork material', { size: 'sm' })} Unit
                            </span>
                            <span className="text-sm font-semibold text-foreground uppercase">{artUnit}</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-3 pt-2 mt-1 border-t border-border/60">
                            <span className="text-xs font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Gross CNS per piece multiplied by overage quantity. For HEADER CARD, effective qty = qty / casepack.', { size: 'sm' })} Gross CNS
                            </span>
                            <span className="text-base font-bold text-primary tabular-nums">{artworkGrossCns}</span>
                          </div>
                          <div className="flex justify-between items-baseline gap-3">
                            <span className="text-xs font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-2">
                              {renderInfoIcon('Gross CNS multiplied by Set Of', { size: 'sm' })} Gross CNS
                              <span className="text-[11px] text-muted-foreground">Set of {setOfNumber}</span>
                            </span>
                            <span className="text-base font-bold text-primary tabular-nums">{artworkGrossCnsSet.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
              /* Desktop: table with header row + data rows */
              <div className="min-w-0 rounded-lg border border-border overflow-hidden bg-card">
                <div className="grid grid-cols-2 sm:grid-cols-7 min-w-0 border-b border-border bg-muted/30">
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material Description</span></div>
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Quantity {renderInfoIcon('Quantity from artwork material')}
                    </span>
                  </div>
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Casepack {renderInfoIcon('Header Card casepack from Artwork; falls back to Packaging casepack when blank')}
                    </span>
                  </div>
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Wastage {renderInfoIcon('Sum of all wastage/surplus values for this artwork material')}
                    </span>
                  </div>
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Gross CNS {renderInfoIcon('Gross CNS per piece multiplied by overage quantity. For HEADER CARD, effective qty = qty / casepack.')}
                    </span>
                  </div>
                  <div className="min-w-0 border-r border-border" style={desktopHeaderCell}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                        Gross CNS {renderInfoIcon('Gross CNS multiplied by Set Of', { align: 'right' })}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Set of {setOfNumber}</span>
                    </div>
                  </div>
                  <div className="min-w-0 border-border" style={desktopHeaderCell}>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider inline-flex items-center gap-2">
                      Unit {renderInfoIcon('Unit from artwork material', { align: 'right' })}
                    </span>
                  </div>
                </div>
                {artworkMats.map((artwork, idx) => {
                  const artworkQty = getArtworkQuantity(artwork);
                  const artworkCasepack = getArtworkCasepackQty(artwork, artworkFallbackCasepack);
                  const artworkQtyNum = getArtworkEffectiveNetCns(artwork, artworkFallbackCasepack);
                  const artworkWastageSurplus = extractArtworkWastageSurplus(artwork);
                  const artworkCompoundWastage = calculateCompoundWastage(artworkWastageSurplus);
                  const artworkGrossCns = calculateGrossCns(overageQty, artworkWastageSurplus, artworkQtyNum);
                  const artworkGrossCnsSet = (parseFloat(artworkGrossCns) || 0) * setOfNumber;
                  const artCellClass = 'min-w-0 border-r border-border bg-muted/5';
                  const artLastClass = 'min-w-0 border-border bg-muted/5';
                  return (
                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-7 min-w-0 border-b border-border last:border-b-0">
                      <div className={artCellClass} style={desktopTableCell}><span className={`text-sm text-foreground whitespace-pre-line ${CELL_WRAP}`}>{getArtworkDescription(artwork) || '-'}</span></div>
                      <div className={artCellClass} style={desktopTableCell}><span className="text-base font-bold text-foreground">{getArtworkQtyWithUnit(artwork) || '-'}</span></div>
                      <div className={artCellClass} style={desktopTableCell}><span className="text-base font-bold text-foreground">{formatCasepackDisplay(artworkCasepack)}</span></div>
                      <div className={artCellClass} style={desktopTableCell}><span className="text-base font-bold text-foreground">{artworkCompoundWastage}%</span></div>
                      <div className={artCellClass} style={desktopTableCell}><span className="text-base font-bold text-primary">{artworkGrossCns}</span></div>
                      <div className={artCellClass} style={desktopTableCell}><span className="text-base font-bold text-primary">{artworkGrossCnsSet.toFixed(3)}</span></div>
                      <div className={artLastClass} style={desktopTableCell}><span className="text-base font-bold text-foreground uppercase">{getArtworkQtyUnit(artwork) || artwork.unit || '-'}</span></div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Packaging Row: renders one packaging block (main or extra pack)
  const PackagingRow = ({ product, formData, isMobile, pkgBlock }) => {
    const { config: pkgConfig, materials: packagingMats, label: blockLabel } = pkgBlock;
    const skus = formData.skus || [];

    if (!packagingMats || packagingMats.length === 0) return null;

    const packagingType = (pkgConfig?.toBeShipped || '').toLowerCase();
    const isMerged = packagingType === 'merged';
    const productSelection = pkgConfig?.productSelection || [];
    const selectedIpcs = Array.isArray(productSelection) ? productSelection : (productSelection ? [productSelection] : []);
    const mergedItems = isMerged ? getMergedIpcsProducts(productSelection, formData) : [];
    // For inner polybag table: use selected IPCs when merged, else current product's IPC (standalone)
    const ipcsForInnerTable = isMerged && selectedIpcs.length > 0 ? selectedIpcs : (product.ipcCode ? [product.ipcCode] : []);
    const formCasepack = parseFloat(String(pkgConfig?.casepackQty || '').trim()) || 0;

    const ipcsDisplay = isMerged && mergedItems.length > 0
      ? mergedItems.map((i) => i.ipcCode).join(', ')
      : (product.ipcCode || '');

    const mergedIpcsForCalc = selectedIpcs.length > 0
      ? Array.from(new Set(selectedIpcs))
      : Array.from(new Set(mergedItems.map((item) => item.ipcCode)));
    const totalPoSetQtyForMerged = mergedIpcsForCalc.reduce(
      (sum, ipcCode) => sum + (getPoQtyForIpc(skus, ipcCode) * getSetOfForIpc(skus, ipcCode)),
      0
    );
    const poQtyForStandalone = getPoQtyForIpc(skus, product.ipcCode);
    const setOfForStandalone = getSetOfForIpc(skus, product.ipcCode);

    const row4Cell = 'min-w-0 border-r border-border bg-muted/5 flex items-center';
    const row4Last = 'min-w-0 border-border bg-muted/5 flex items-center';
    const desktopHeaderCell = { padding: '12px 18px' };
    const desktopTableCell = { padding: '14px 18px' };

    const isPolybagInner = (p) => {
      const type = String(p.packagingMaterialType || '').trim();
      const innerType = String(p.polybagBalePackagingType || '').trim();
      const isPolybagBale = /polybag\s*[~-]?\s*bale/i.test(type) || type === 'POLYBAG~Bale';
      const isInnerCasepack = /inner\s*[~-]?\s*caseapack/i.test(innerType) || /inner/i.test(innerType);
      return isPolybagBale && isInnerCasepack;
    };
    const standardMats = packagingMats.filter((p) => !isPolybagInner(p));
    const innerMats = packagingMats.filter(isPolybagInner);

    return (
      <div className="w-full min-w-0" {...editSectionProps('packaging', product)}>
        <div className="border border-border rounded-xl bg-card shadow-sm min-w-0" style={{ padding: isMobile ? '18px 16px' : '20px' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{blockLabel}</span>
            {isMerged ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                Merged
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground border border-border">
                Standalone
              </span>
            )}
          </div>
          <div className="min-w-0 rounded-lg border border-border overflow-hidden bg-card">
          {standardMats.length > 0 && (
            <>
              <div className="grid min-w-0 border-b border-border bg-muted/30" style={{ gridTemplateColumns: PKG_STD_GRID }}>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mat</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mat Desc</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IPCs</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wastage/Surplus</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Casepack</span></div>
                <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total mat req</span></div>
                <div className={row4Last} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Total mat req</span></div>
              </div>
              {standardMats.map((packaging, idx) => {
                const packagingWastageSurplus = extractPackagingWastageSurplus(packaging);
                const packagingCompoundWastage = calculateCompoundWastage(packagingWastageSurplus);
                const matType = formatPackagingTypeName(packaging.packagingMaterialType);
                const matCasepack = parseFloat(String(packaging.casepack || '').trim()) || formCasepack;
                const totalMatReqBase = isMerged
                  ? totalPoSetQtyForMerged
                  : (poQtyForStandalone * setOfForStandalone);
                const reqMat = matCasepack > 0 ? (totalMatReqBase / matCasepack).toFixed(2) : '-';
                const matDesc = getPackagingDescriptionWithStiffener(packaging, reqMat);
                const matSize = getPackagingSize(packaging);
                const reqMatNum = typeof reqMat === 'string' ? parseFloat(reqMat) : reqMat;
                const wastagePercent = parseFloat(packagingCompoundWastage) || 0;
                const grossTotalMatReq = reqMatNum !== '-' && !isNaN(reqMatNum) ? Math.floor((reqMatNum + (reqMatNum * wastagePercent / 100)) + 0.6) : '-';
                return (
                  <div key={`std-${idx}`} className="grid min-w-0 border-b border-border last:border-b-0" style={{ gridTemplateColumns: PKG_STD_GRID }}>
                    <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground ${CELL_WRAP}`}>{matType || '-'}</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground whitespace-pre-line ${CELL_WRAP}`}>{matDesc || '-'}</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground ${CELL_WRAP}`}>{matSize || '-'}</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground ${CELL_WRAP}`}>{ipcsDisplay || '-'}</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{packagingCompoundWastage}%</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{matCasepack || '-'}</span></div>
                    <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-primary">{reqMat}</span></div>
                    <div className={row4Last} style={desktopTableCell}><span className="text-base font-bold text-primary">{grossTotalMatReq}</span></div>
                  </div>
                );
              })}
            </>
          )}
          {innerMats.map((packaging, idx) => {
            const packagingWastageSurplus = extractPackagingWastageSurplus(packaging);
            const packagingCompoundWastage = calculateCompoundWastage(packagingWastageSurplus);
            const matDesc = getPackagingDescription(packaging);
            const matCasepack = parseFloat(String(packaging.casepack || '').trim()) || formCasepack;
            const polybagNum = parseFloat(String(packaging.polybagBalePolybagCount || '').trim()) || 0;
            const innerQty = polybagNum > 0 ? matCasepack / polybagNum : 0;
            const assdByIpc = packaging.polybagBaleAssdQtyByIpc && typeof packaging.polybagBaleAssdQtyByIpc === 'object'
              ? packaging.polybagBaleAssdQtyByIpc : {};

            if (ipcsForInnerTable.length === 0) return null;

            return (
              <div key={`inner-${idx}`} className="border-b border-border last:border-b-0">
                <div className="grid grid-cols-4 min-w-0 border-b border-border bg-muted/30">
                  <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mat</span></div>
                  <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mat Desc</span></div>
                  <div className={row4Cell} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Casepack</span></div>
                  <div className={row4Last} style={desktopHeaderCell}><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wastage/Surplus</span></div>
                </div>
                <div className="grid grid-cols-4 min-w-0 border-b border-border">
                  <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground ${CELL_WRAP}`}>{formatPackagingTypeName(packaging.packagingMaterialType) || '-'}</span></div>
                  <div className={row4Cell} style={desktopTableCell}><span className={`text-sm text-foreground whitespace-pre-line ${CELL_WRAP}`}>{matDesc || '-'}</span></div>
                  <div className={row4Cell} style={desktopTableCell}><span className="text-base font-bold text-foreground">{matCasepack || '-'}</span></div>
                  <div className={row4Last} style={desktopTableCell}><span className="text-base font-bold text-foreground">{packagingCompoundWastage}%</span></div>
                </div>
                <div className="pt-2 pb-2">
                    <div className="rounded-lg border border-border overflow-hidden bg-card mt-2">
                      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="text-left font-semibold text-muted-foreground uppercase text-xs border-r border-border last:border-r-0" style={desktopHeaderCell}>PO</th>
                            <th className="text-left font-semibold text-muted-foreground uppercase text-xs border-r border-border last:border-r-0" style={desktopHeaderCell}>IPC</th>
                            <th className="text-left font-semibold text-muted-foreground uppercase text-xs border-r border-border last:border-r-0" style={desktopHeaderCell}>ASSD QTY</th>
                            <th className="text-left font-semibold text-muted-foreground uppercase text-xs border-r border-border last:border-r-0" style={desktopHeaderCell}>INNER QTY</th>
                            <th className="text-left font-semibold text-muted-foreground uppercase text-xs" style={desktopHeaderCell}>REQ MAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ipcsForInnerTable.map((ipc) => {
                            const poQty = getPoQtyForIpc(skus, ipc);
                            const assd = parseFloat(String(assdByIpc[ipc] ?? '').trim()) || 0;
                            const reqMat = innerQty > 0 ? assd / innerQty : 0;
                            return (
                              <tr key={ipc} className="border-b border-border/70 last:border-b-0 bg-muted/5">
                                <td className="text-foreground border-r border-border" style={desktopTableCell}>{poQty || '-'}</td>
                                <td className="font-medium text-foreground border-r border-border" style={desktopTableCell}>{ipc}</td>
                                <td className="text-foreground border-r border-border" style={desktopTableCell}>{assd || '-'}</td>
                                <td className="text-foreground border-r border-border" style={desktopTableCell}>{innerQty > 0 ? innerQty.toFixed(2) : '-'}</td>
                                <td className="font-semibold text-primary" style={desktopTableCell}>{reqMat > 0 ? reqMat.toFixed(2) : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isEditMode && (
        <style>{`
          .cns-editable-section {
            position: relative;
            transition: box-shadow 0.15s, outline 0.15s;
            border-radius: 4px;
          }
          .cns-editable-section:hover {
            box-shadow: inset 0 0 0 2px rgba(59,130,246,0.45);
            outline: 2px solid rgba(59,130,246,0.25);
            outline-offset: -2px;
          }
        `}</style>
      )}
      <div
        className="w-full min-w-0 overflow-y-auto overflow-x-auto flex-1"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
      >
        {allProducts.length > 0 ? (
          (() => {
            // 1. Collect all packaging rows to render at the end (same dedup logic)
            const packagingRows = [];
            const shownMergedKeys = new Set();
            const shownStandaloneBlockKeys = new Set();
            allProducts.forEach((product, idx) => {
              const blocks = getAllPackagingBlocks(formData, product.stepData);
              blocks.forEach((pkgBlock, blockIdx) => {
                const pkgConfig = pkgBlock.config;
                const packagingType = (pkgConfig?.toBeShipped || '').toLowerCase();
                const isMerged = packagingType === 'merged';
                const productSelection = pkgConfig?.productSelection ?? [];
                const selArr = Array.isArray(productSelection) ? productSelection : (productSelection ? [productSelection] : []);
                const mergedKey = [...selArr].sort().join(',');
                const productIpc = product.ipcCode || '';

                let shouldShow = false;
                if (isMerged) {
                  const key = `${blockIdx}:${mergedKey}`;
                  if (mergedKey && !shownMergedKeys.has(key)) {
                    shownMergedKeys.add(key);
                    shouldShow = true;
                  }
                } else {
                  if (selArr.length > 0) {
                    shouldShow = selArr.includes(productIpc) && !shownStandaloneBlockKeys.has(`${blockIdx}:${productIpc}`);
                    if (shouldShow) shownStandaloneBlockKeys.add(`${blockIdx}:${productIpc}`);
                  } else {
                    shouldShow = !shownStandaloneBlockKeys.has(`block-${blockIdx}`);
                    if (shouldShow) shownStandaloneBlockKeys.add(`block-${blockIdx}`);
                  }
                }

                if (shouldShow) {
                  packagingRows.push({ product, pkgBlock, key: `pkg-${idx}-${blockIdx}` });
                }
              });
            });

            return (
              <>
                {/* 2. Render all product components first */}
                {allProducts.map((product, idx) => (
                  <div key={idx}>
                    {product.components.map((component, cIdx) =>
                      component.productComforter ? (
                        <ComponentRow
                          key={`${idx}-${cIdx}`}
                          componentName={component.productComforter}
                          component={component}
                          product={product}
                        />
                      ) : null
                    )}
                  </div>
                ))}
                {/* 3. Render all packaging at the end */}
                {packagingRows.map(({ product, pkgBlock, key }) => (
                  <PackagingRow
                    key={key}
                    product={product}
                    formData={formData}
                    isMobile={isMobileCns}
                    pkgBlock={pkgBlock}
                  />
                ))}
              </>
            );
          })()
        ) : (
          <div className="text-center py-12 text-muted-foreground">No products found. Please complete previous steps first.</div>
        )}
      </div>
    </div>
  );
});

ConsumptionSheet.displayName = 'ConsumptionSheet';

export default ConsumptionSheet;

