import { calculateTotalWastage, calculateGrossConsumption } from './calculations';

export const initializeRawMaterials = (formData) => {
  // Initialize raw materials based on products and components from Step 1
  const rawMaterials = [];
  (formData.products || []).forEach((product, productIndex) => {
    (product.components || []).forEach((component, componentIndex) => {
      rawMaterials.push({
        productIndex,
        componentIndex,
        productName: product.name,
        componentName: component.productComforter,
        srNo: component.srNo,
        materialDescription: '',
        netConsumption: '',
        unit: component.unit || '',
        qualityVerification: '',
        materialType: '', // 'Yarn' or 'Fabric'
        procurementDate: '',
        fiberType: '',
        yarnType: '',
        spinningMethod: '',
        yarnComposition: '',
        yarnCountRange: '',
        yarnDoublingOptions: '',
        yarnPlyOptions: '',
        yarnColour: '',
        surplus: '',
        approval: [],
        remarks: '',
        // Advanced Filter Fields
        showAdvancedFilter: false,
        // Fabric Specifications Fields
        fabricFiberType: '',
        fabricName: '',
        fabricComposition: '',
        gsm: '',
        fabricSurplus: '',
        fabricApproval: [],
        fabricRemarks: '',
        showFabricAdvancedFilter: false,
        constructionType: '',
        weaveKnitType: '',
        fabricMachineType: '',
        fabricTestingRequirements: [],
        fabricFiberCategory: '',
        fabricOrigin: '',
        fabricCertifications: '',
        spinningType: '',
        testingRequirements: [],
        fiberCategory: '',
        origin: '',
        certifications: '',
        workOrders: [{
          workOrder: '',
          receivedUnit: '',
          processUnit: '',
          dispatchUnit: '',
          // Cut & Sew fills these per CUTTING / SEWING work order (Section-1 spec):
          cutLength: '',
          cutWidth: '',
          cutUnit: '',
          cutWastage: '',
          sewLength: '',
          sewWidth: '',
          sewUnit: '',
          sewWastage: '',
          // Finishing (per FINISHING work order): process + types + remarks.
          finishingProcess: '',
          finishingTypes: [],
          isRequired: '',
          wastage: '',
          forField: '',
          approvalAgainst: '',
          remarks: '',
          design: '',
          imageRef: null,
          qualityVerification: '',
          startDate: '',
          dateOfCompletion: '',
          machineType: '',
          reed: '',
          pick: '',
          warp: false,
          weft: false,
          ratioWarp: '',
          ratioWeft: '',
          ratioWeightWarp: '',
          ratioWeightWeft: '',
          pileHeight: '',
          tpi: '',
          quiltingType: '',
          printingType: '',
          wales: false,
          courses: false,
          ratioWales: '',
          ratioCourses: '',
          ratioWeightWales: '',
          ratioWeightCourses: '',
          receivedColorReference: '',
          referenceType: '',
          shrinkageWidth: false,
          shrinkageLength: false,
          shrinkageWidthPercent: '',
          shrinkageLengthPercent: '',
          ratioWidth: '',
          ratioLength: '',
          forSection: '',
          forSectionWidth: '',
          forSectionLength: '',
          cutType: '',
          cutSize: '',
          // Compatibility
          dyeingType: '',
          shrinkage: '',
          width: '',
          length: '',
          weavingType: '',
          warpWeft: '',
          ratio: '',
        }],
      });
    });
  });
  return rawMaterials;
};

export const initializeConsumptionMaterials = (formData) => {
  // Initialize consumption materials based on raw materials from Step 2
  if (!formData.rawMaterials || formData.rawMaterials.length === 0) {
    return [{
      srNo: 1,
      productName: '',
      componentName: '',
      materialDescription: '',
      netConsumption: '',
      unit: '',
      qualityVerification: '',
      workOrder: '',
      wastage: '',
      forField: '',
      totalWastage: '0%',
      overage: formData.overagePercentage || '',
      poQty: formData.poQty || '',
      grossConsumption: '0',
    }];
  }
  
  const consumptionMaterials = formData.rawMaterials.map((material, index) => {
    if (!material) return null;
    const totalWastage = calculateTotalWastage(material.workOrders || []);
    return {
      srNo: material.srNo || index + 1,
      productName: material.productName || '',
      componentName: material.componentName || '',
      materialDescription: material.materialDescription || '',
      netConsumption: material.netConsumption || '',
      unit: material.unit || '',
      qualityVerification: material.qualityVerification ?? '',
      workOrder: material.workOrders?.[0]?.workOrder || '',
      wastage: material.workOrders?.[0]?.wastage || '',
      forField: material.workOrders?.[0]?.forField || '',
      totalWastage: `${totalWastage}%`,
      overage: formData.overagePercentage || '',
      poQty: formData.poQty || '',
      grossConsumption: calculateGrossConsumption(
        material.netConsumption || '0',
        totalWastage,
        formData.overagePercentage || '0',
        formData.poQty || '0'
      ),
    };
  }).filter(Boolean); // Remove any null entries
  return consumptionMaterials;
};
