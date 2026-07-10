import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormCard } from '@/components/ui/form-layout';
import { getIPOMasterCNS, saveIPOMasterCNSRows, getFactoryCodeDraft, shareIpoToPurchase } from '../../services/integration';
import { useLoading } from '../../context/LoadingContext';

// Excel-style frozen pane: top header row sticks to top; the leftmost columns
// (SR# / IPC# / Select / Material Description) stick to the left.
const COL_WIDTHS = { sr: 56, ipc: 110, select: 64, matDesc: 160 };
const STICKY_HEADER_STYLE = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: '#ffffff',
};
const stickyHeaderLeft = (left, width) => ({
  position: 'sticky',
  top: 0,
  left,
  zIndex: 3,
  width,
  minWidth: width,
  maxWidth: width,
  background: '#ffffff',
});
const stickyBodyLeft = (left, width, bg) => ({
  position: 'sticky',
  left,
  zIndex: 1,
  width,
  minWidth: width,
  maxWidth: width,
  background: bg || '#ffffff',
});

// Wrap any token containing "/" (e.g. "CNS/PC") — and a "/" flanked by spaces
// (e.g. "Club / Single") — in a nowrap span so the header can use break-word
// elsewhere without ever splitting those slash tokens.
const formatHeader = (s) => {
  const NBSP = '\u00A0';
  const str = String(s ?? '').replace(/\s+\/\s+/g, NBSP + '/' + NBSP);
  return str.split(/( +)/).map((part, i) =>
    part.includes('/') ? (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
};

const normKey = (s) => String(s || '').trim().toLowerCase();

// Build a lookup keyed by (ipcCode, materialDescription) → { netCns, unit }
// by walking skus[*].stepData.rawMaterials and skus[*].subproducts[*].stepData.rawMaterials.
const buildYarnLookup = (formData) => {
  const lookup = new Map();
  if (!formData || typeof formData !== 'object') return lookup;
  const addRm = (rm, ipcCode) => {
    if (!rm || typeof rm !== 'object') return;
    const ipcNorm = normKey(ipcCode);
    const descCandidates = [
      rm.materialDescription, rm.material_description,
      rm.materialName, rm.material_name,
      rm.fabricName, rm.yarnType, rm.fiberType,
      rm.fabricComposition, rm.yarnComposition,
    ];
    const net = rm.netConsumption ?? rm.net_consumption ?? rm.consumption;
    const unit = rm.unit || rm.consumptionUnit || '';
    const entry = { netCns: net, unit };
    descCandidates.forEach((d) => {
      const k = normKey(d);
      if (!k) return;
      if (!lookup.has(`${ipcNorm}::${k}`)) {
        lookup.set(`${ipcNorm}::${k}`, entry);
      }
      // Also register under description alone so any-IPC fallback still works.
      if (!lookup.has(`::${k}`)) {
        lookup.set(`::${k}`, entry);
      }
    });
  };
  const walk = (stepdata, ipcCode) => {
    (stepdata?.rawMaterials || []).forEach((rm) => addRm(rm, ipcCode));
  };
  (formData.skus || []).forEach((sku) => {
    const skuIpc = sku?.ipcCode || sku?.ipc_code || sku?.sku || '';
    walk(sku?.stepData, skuIpc);
    (sku?.subproducts || []).forEach((sub) => {
      const subIpc = sub?.ipcCode || sub?.ipc_code || sub?.subproduct || skuIpc;
      walk(sub?.stepData, subIpc);
    });
  });
  return lookup;
};

const lookupDerived = (lookup, ipc, description) => {
  const descNorm = normKey(description);
  if (!descNorm) return null;
  const ipcNorm = normKey(ipc);
  return (
    lookup.get(`${ipcNorm}::${descNorm}`) ||
    lookup.get(`::${descNorm}`) ||
    null
  );
};

// Walk object/array picking up every value whose key contains "wastage"
// or "surplus" — matches ConsumptionSheet.extractAllWastages on the frontend.
const extractAllWastages = (obj, acc = []) => {
  if (!obj || typeof obj !== 'object') return acc;
  if (Array.isArray(obj)) {
    obj.forEach((item) => extractAllWastages(item, acc));
    return acc;
  }
  for (const k in obj) {
    const v = obj[k];
    const kl = String(k).toLowerCase();
    const isW = kl.includes('wastage') || kl.includes('surplus');
    if (isW && v !== undefined && v !== null && v !== '' && v !== false) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        extractAllWastages(v, acc);
      } else if (Array.isArray(v)) {
        v.forEach((item) => {
          if (item !== null && item !== undefined && item !== '' && item !== false) acc.push(item);
        });
      } else {
        acc.push(v);
      }
    } else if (typeof v === 'object' && v !== null) {
      extractAllWastages(v, acc);
    }
  }
  return acc;
};

const compoundFactor = (wastages) =>
  (wastages || []).reduce((f, w) => {
    const num = parseFloat(String(w).replace('%', '').trim()) || 0;
    return f * (1 + num / 100);
  }, 1);

const derivedGrossWastagePct = (rm) => {
  const wastages = extractAllWastages(rm);
  if (!wastages.length) return 0;
  return (compoundFactor(wastages) - 1) * 100;
};

const computeSkuOverage = (poQty, overagePct) => {
  const qty = parseFloat(poQty) || 0;
  const pct = parseFloat(String(overagePct || '').replace('%', '').trim()) || 0;
  if (!qty) return null;
  return qty * (1 + pct / 100);
};

const isYarnType = (mt) => /yarn|thread/i.test(String(mt || ''));
const isFabricType = (mt) => /fabric/i.test(String(mt || ''));
const isFiberType = (mt) => /fiber|fibre/i.test(String(mt || ''));
const isFoamType = (mt) => /foam/i.test(String(mt || ''));
const isTrimType = (mt) => /trim|accessory|accessor/i.test(String(mt || ''));

// Pick the first non-blank value out of several candidate field names.
const pickFirst = (rm, keys) => {
  for (const k of keys) {
    const v = rm?.[k];
    if (v !== undefined && v !== null && v !== '' && v !== false) return v;
  }
  return null;
};
const pickFloat = (rm, keys) => {
  const raw = pickFirst(rm, keys);
  if (raw === null) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

// Net Weight CNS/PC in grams: BOM & WIP netConsumption × 1000 when unit is KGS,
// otherwise 0. Used by fiber & foam subtabs.
const netWeightGramsFromBom = (rm) => {
  const unit = String(rm?.unit || rm?.consumptionUnit || '').toUpperCase().trim();
  if (unit !== 'KGS' && unit !== 'KG') return 0;
  const net = pickFloat(rm, ['netConsumption', 'net_consumption', 'consumption']);
  return net !== null ? net * 1000 : 0;
};

// Locate the component definition in Step-1 products/components by name.
// Cutting size (length/width) lives on that component.
const findComponentInStep = (stepdata, componentName) => {
  if (!componentName) return null;
  const target = normKey(componentName);
  for (const prod of stepdata?.products || []) {
    if (!prod) continue;
    for (const comp of prod.components || []) {
      if (!comp) continue;
      const name = comp.productComforter || comp.name || '';
      if (normKey(name) === target) return comp;
    }
  }
  return null;
};

// Pull shrinkageWidthPercent from the fabric material's DYEING work order.
// Returns 0 when no DYEING work order exists.
const getDyeingShrinkageWidth = (rm) => {
  for (const wo of rm?.workOrders || []) {
    if (!wo) continue;
    const woType = String(wo.workOrder || wo.work_order || '').toUpperCase();
    if (woType !== 'DYEING') continue;
    const psd = wo.processSpecificData || wo.process_specific_data || {};
    const raw =
      (psd && psd.shrinkageWidthPercent) ??
      wo.shrinkageWidthPercent ??
      null;
    if (raw === null || raw === undefined || raw === '') return 0;
    const n = parseFloat(String(raw).replace('%', '').trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

// Stitching Thread stores Net CNS/Unit in a different shape than generic yarn.
// Mirror ConsumptionSheet.getStitchingThreadNetCnsAndUnit so those values
// still populate the Yarn subtab correctly.
const getStitchingThreadNetCnsAndUnit = (rm) => {
  const isStitchingThread =
    String(rm?.materialType || '').trim() === 'Yarn' &&
    String(rm?.subMaterial || '').trim() === 'Stitching Thread';
  if (!isStitchingThread) return null;
  const strip = (v) => parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  if (rm.stitchingThreadQty != null && rm.stitchingThreadQty !== '') {
    const n = strip(rm.stitchingThreadQty);
    return {
      netCns: Number.isFinite(n) ? n : 0,
      unit: (rm.stitchingThreadUnit || '').toString().trim() || '-',
    };
  }
  if (rm.stitchingThreadQtyYardage != null && String(rm.stitchingThreadQtyYardage).trim() !== '') {
    const n = strip(rm.stitchingThreadQtyYardage);
    return { netCns: Number.isFinite(n) ? n : 0, unit: 'Yardage' };
  }
  if (rm.stitchingThreadQtyKgs != null && String(rm.stitchingThreadQtyKgs).trim() !== '') {
    const n = strip(rm.stitchingThreadQtyKgs);
    return { netCns: Number.isFinite(n) ? n : 0, unit: 'Kgs' };
  }
  return { netCns: 0, unit: '-' };
};

// Build yarn rows DIRECTLY from Derived CNS Sheet formData, bypassing the
// backend's material_type classification entirely. Each yarn rawMaterial in
// the wizard drafts becomes one row with values pulled straight from the
// Derived Sheet — Net CNS/PC, Unit, Gross Wastage %, Overage QTY PCS — keyed
// by (IPC, Material Description).
const buildYarnRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  const processStep = (stepdata, ipcCode, overage) => {
    (stepdata?.rawMaterials || []).forEach((rm, idx) => {
      if (!rm || typeof rm !== 'object') return;
      if (!isYarnType(rm.materialType || rm.material_type)) return;
      const description =
        rm.materialDescription ||
        rm.material_description ||
        rm.materialName ||
        rm.material_name ||
        rm.yarnType ||
        '';
      // Stitching Thread stores Net CNS and Unit on dedicated fields; fall
      // back to the generic netConsumption/unit for other yarn types.
      const stitchingThread = getStitchingThreadNetCnsAndUnit(rm);
      const netCns = stitchingThread
        ? stitchingThread.netCns
        : (rm.netConsumption ?? rm.net_consumption ?? rm.consumption ?? null);
      const unit = stitchingThread
        ? stitchingThread.unit
        : (rm.unit || rm.consumptionUnit || '');
      const grossWastage = derivedGrossWastagePct(rm);
      rows.push({
        id: `derived-yarn-${ipcCode}-${idx}-${normKey(description)}`,
        ipc: ipcCode,
        component: rm.componentName || rm.component_name || '',
        material_type: rm.materialType || 'Yarn',
        material_description: description,
        net_cns_pc: netCns,
        overage_qty_pcs: overage,
        overage_qty: overage,
        gross_wastage: grossWastage,
        unit,
      });
    });
  };
  (formData.skus || []).forEach((sku) => {
    if (!sku || typeof sku !== 'object') return;
    const skuIpc = sku.ipcCode || sku.ipc_code || sku.sku || '';
    const skuOverage = computeSkuOverage(sku.poQty, sku.overagePercentage);
    processStep(sku.stepData, skuIpc, skuOverage);
    (sku.subproducts || []).forEach((sub) => {
      if (!sub || typeof sub !== 'object') return;
      const subIpc = sub.ipcCode || sub.ipc_code || sub.subproduct || skuIpc;
      const subOverage = computeSkuOverage(sub.poQty, sub.overagePercentage) ?? skuOverage;
      processStep(sub.stepData, subIpc, subOverage);
    });
  });
  return rows;
};

// Reusable iterator: walks every (stepdata, ipcCode, overage) tuple across
// SKUs and subproducts. Lets each subtab builder share the same SKU/subproduct
// traversal logic.
const forEachStepData = (formData, fn) => {
  (formData?.skus || []).forEach((sku) => {
    if (!sku || typeof sku !== 'object') return;
    const skuIpc = sku.ipcCode || sku.ipc_code || sku.sku || '';
    const skuOverage = computeSkuOverage(sku.poQty, sku.overagePercentage);
    fn(sku.stepData, skuIpc, skuOverage);
    (sku.subproducts || []).forEach((sub) => {
      if (!sub || typeof sub !== 'object') return;
      const subIpc = sub.ipcCode || sub.ipc_code || sub.subproduct || skuIpc;
      const subOverage = computeSkuOverage(sub.poQty, sub.overagePercentage) ?? skuOverage;
      fn(sub.stepData, subIpc, subOverage);
    });
  });
};

// Fiber rows from the Derived CNS Sheet.
// Per spec: from the IPC Spec File BOM & WIP section, find raw materials where
// Fiber is selected, and pull GSM + Denier for the matching Material Description.
const buildFiberRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  forEachStepData(formData, (stepdata, ipcCode, overage) => {
    (stepdata?.rawMaterials || []).forEach((rm, idx) => {
      if (!rm || typeof rm !== 'object') return;
      if (!isFiberType(rm.materialType || rm.material_type)) return;
      const description =
        rm.materialDescription ||
        rm.material_description ||
        rm.materialName ||
        rm.material_name ||
        rm.fiberType ||
        '';
      const componentName = rm.componentName || rm.component_name || '';
      const comp = findComponentInStep(stepdata, componentName);
      const cutting = (comp && comp.cuttingSize) || {};
      const netLength = pickFloat({ v: cutting.length }, ['v']);
      const netWidth = pickFloat({ v: cutting.width }, ['v']);
      // GSM is stored on the Cut & Sew Spec component itself, not on the
      // fiber raw-material entry.
      const gsm = comp ? pickFirst(comp, ['gsm', 'GSM', 'componentGsm']) : null;
      // Denier on the wizard form is a dropdown string like "0.7D - 1.5D
      // (fine for down-like)" — keep it as a string; don't parse to number.
      const denier = pickFirst(rm, ['denier', 'fiberDenier', 'fibreDenier', 'Denier']);
      const fiberNetWeightGrams = netWeightGramsFromBom(rm);
      rows.push({
        id: `derived-fiber-${ipcCode}-${idx}-${normKey(description)}`,
        ipc: ipcCode,
        component: componentName,
        material_type: rm.materialType || 'Fiber',
        material_description: description,
        overage_qty_pcs: overage,
        overage_qty: overage,
        net_length_cns_pc: netLength,
        net_width_cns_pc: netWidth,
        net_weight_cns_pc_grams: fiberNetWeightGrams,
        // No Gross Wastage Weight is captured on the form — Gross Weight equals
        // Net Weight by spec.
        gross_weight_cns_pc_grams: fiberNetWeightGrams,
        gross_wastage_length: derivedGrossWastagePct(rm),
        gross_wastage_width: getDyeingShrinkageWidth(rm),
        gsm,
        denier,
        unit: rm.unit || rm.consumptionUnit || '',
      });
    });
  });
  return rows;
};

// Foam rows from the Derived CNS Sheet.
// Net Length/Width sourced from the matched component's cuttingSize (Cut & Sew Spec).
const buildFoamRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  forEachStepData(formData, (stepdata, ipcCode, overage) => {
    (stepdata?.rawMaterials || []).forEach((rm, idx) => {
      if (!rm || typeof rm !== 'object') return;
      if (!isFoamType(rm.materialType || rm.material_type)) return;
      const description =
        rm.materialDescription ||
        rm.material_description ||
        rm.materialName ||
        rm.material_name ||
        rm.foamType ||
        '';
      const componentName = rm.componentName || rm.component_name || '';
      const comp = findComponentInStep(stepdata, componentName);
      const cutting = (comp && comp.cuttingSize) || {};
      const netLength = pickFloat({ v: cutting.length }, ['v']);
      const netWidth = pickFloat({ v: cutting.width }, ['v']);
      // GSM comes from the Cut & Sew Spec component (same source as fiber & trim).
      const gsm = comp ? pickFirst(comp, ['gsm', 'GSM', 'componentGsm']) : null;
      const foamNetWeightGrams = netWeightGramsFromBom(rm);
      rows.push({
        id: `derived-foam-${ipcCode}-${idx}-${normKey(description)}`,
        ipc: ipcCode,
        component: componentName,
        material_type: rm.materialType || 'Foam',
        material_description: description,
        overage_qty_pcs: overage,
        overage_qty: overage,
        net_length_cns_pc: netLength,
        net_width_cns_pc: netWidth,
        net_weight_cns_pc_grams: foamNetWeightGrams,
        // No Gross Wastage Weight is captured on the form — Gross Weight equals
        // Net Weight by spec.
        gross_weight_cns_pc_grams: foamNetWeightGrams,
        gross_wastage_length: derivedGrossWastagePct(rm),
        gross_wastage_width: getDyeingShrinkageWidth(rm),
        gsm,
        unit: rm.unit || rm.consumptionUnit || '',
      });
    });
  });
  return rows;
};

// Trim & Accessory rows from the Derived CNS Sheet.
// Net Length/Width sourced from the matched component's cuttingSize (Cut & Sew Spec).
const buildTrimRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  forEachStepData(formData, (stepdata, ipcCode, overage) => {
    // Trims live in stepData.rawMaterials when materialType is "Trim ..." and
    // also in stepData.consumptionMaterials (Step-3). Walk both.
    const sources = [
      ...(stepdata?.rawMaterials || []).map((m) => ({ m, src: 'rm' })),
      ...(stepdata?.consumptionMaterials || []).map((m) => ({ m, src: 'cm' })),
    ];
    sources.forEach(({ m, src }, idx) => {
      if (!m || typeof m !== 'object') return;
      const mt = m.materialType || m.material_type || m.trimAccessory || m.trim_accessory;
      if (!isTrimType(mt)) return;
      const description =
        m.materialDescription ||
        m.material_description ||
        m.materialName ||
        m.material_name ||
        m.trimAccessory ||
        '';
      // Step 2 raw materials store the component on `componentName`; Step 3
      // consumption materials store it on `components` (string or array).
      const rawComponent =
        m.componentName ||
        m.component_name ||
        (Array.isArray(m.components) ? m.components[0] : m.components) ||
        '';
      const componentName = String(rawComponent || '').trim();
      const comp = findComponentInStep(stepdata, componentName);
      const cutting = (comp && comp.cuttingSize) || {};
      const netLength = pickFloat({ v: cutting.length }, ['v']);
      const netWidth = pickFloat({ v: cutting.width }, ['v']);
      // GSM is stored on the Cut & Sew Spec component itself.
      // CNS/PC comes from the row's own Net CNS/PC field on the BOM & WIP form.
      const gsm = comp ? pickFirst(comp, ['gsm', 'GSM', 'componentGsm']) : null;
      const cnsPcRaw = pickFloat(m, ['netConsumption', 'net_consumption', 'consumption']);
      // Trim weight in grams: Net CNS/PC × 1000 when unit is KGS; otherwise 0.
      // No Gross Wastage Weight on the form, so Gross Weight CNS/PC = Net.
      const trimNetWeightGrams = netWeightGramsFromBom(m);
      const unit = m.unit || m.consumptionUnit || '';
      const isPcs = String(unit).toUpperCase().trim() === 'PCS';
      // PCS-based trims (buttons, eyelets, …) don't carry meaningful length /
      // width measurements — zero those out. Conversely, length-based trims
      // (zippers in CM, etc.) don't use the per-piece consumption value.
      const cnsPc = isPcs ? cnsPcRaw : 0;
      const netLengthOut = isPcs ? 0 : netLength;
      const netWidthOut = isPcs ? 0 : netWidth;
      rows.push({
        id: `derived-trim-${ipcCode}-${src}-${idx}-${normKey(description)}`,
        ipc: ipcCode,
        component: componentName,
        material_type: m.trimAccessory || mt || 'Trim / Accessory',
        material_description: description,
        overage_qty_pcs: overage,
        overage_qty: overage,
        cns_pc: cnsPc,
        net_length_cns_pc: netLengthOut,
        net_width_cns_pc: netWidthOut,
        net_weight_cns_pc_grams: trimNetWeightGrams,
        gross_weight_cns_pc_grams: trimNetWeightGrams,
        gross_wastage_length: derivedGrossWastagePct(m),
        gross_wastage_width: getDyeingShrinkageWidth(m),
        gsm,
        unit,
      });
    });
  });
  return rows;
};

// Artwork & Labeling rows from the Derived CNS Sheet.
// One row per non-empty artworkMaterial in each SKU/subproduct.
//   artwork_label        → "<artworkCategory>-IPC-<n>"
//   overage_qty          → SKU poQty × (1 + overagePercentage/100)
//   cns_pc               → component.cuttingSize.consumption (Cut & Sew Spec)
//   net_length_cns_pc    → component.cuttingSize.length
//   net_width_cns_pc     → component.cuttingSize.width
//   gross_wastage_pc     → compound of all wastage/surplus values on the artwork row
//   gross_wastage_length → compound wastage from the matching component's RM
//   gross_wastage_width  → DYEING shrinkageWidthPercent on that RM (0 if none)
//   unit                 → artwork material's `unit` field
// Map each artwork category to the field-name prefix the Artwork & Labelling
// form uses for its category-specific QTY and QTY UNIT inputs (e.g. for
// "LABELS (BRAND/MAIN)" the unit lives on `labelsBrandQtyUnit`).
const ARTWORK_CATEGORY_FIELD_PREFIX = {
  'LABELS (BRAND/MAIN)': 'labelsBrand',
  'CARE & COMPOSITION': 'careComposition',
  'RFID / SECURITY TAGS': 'rfid',
  'LAW LABEL / CONTENTS TAG': 'lawLabel',
  'HANG TAG SEALS / STRINGS': 'hangTagSeals',
  'HEAT TRANSFER LABELS': 'heatTransfer',
  'UPC LABEL / BARCODE STICKER': 'upcBarcode',
  'PRICE TICKET / BARCODE TAG': 'priceTicket',
  'ANTI-COUNTERFEIT & HOLOGRAMS': 'antiCounterfeit',
  'QC / INSPECTION LABELS': 'qcInspection',
  'BELLY BAND / WRAPPER': 'bellyBand',
  'SIZE LABELS (INDIVIDUAL)': 'sizeLabels',
  'TAGS & SPECIAL LABELS': 'tagsSpecialLabels',
  'FLAMMABILITY / SAFETY LABELS': 'flammabilitySafety',
  'INSERT CARDS': 'insertCards',
  'HEADER CARD': 'headerCard',
  'RIBBONS': 'ribbons',
};

const getArtworkUnit = (am, category) => {
  const prefix = ARTWORK_CATEGORY_FIELD_PREFIX[category];
  if (prefix) {
    const v = am?.[`${prefix}QtyUnit`];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return am?.unit || '';
};

// CNS/PC for an artwork row — same value the Derived Consumption Sheet shows.
// Mirrors ConsumptionSheet.getArtworkEffectiveNetCns: pulls the category's
// own Qty field and, for HEADER CARD only, divides by casepack qty.
const getArtworkCnsPc = (am, category) => {
  const prefix = ARTWORK_CATEGORY_FIELD_PREFIX[category];
  let raw = null;
  if (prefix) {
    raw = am?.[`${prefix}Qty`];
  }
  if (raw === undefined || raw === null || raw === '') {
    raw = am?.lengthQuantity;
  }
  const qty = pickFloat({ v: raw }, ['v']);
  if (qty === null) return null;
  if (category === 'HEADER CARD') {
    const casepack = pickFloat({ v: am?.headerCardCasepackQty }, ['v']);
    if (casepack && casepack > 0) return qty / casepack;
  }
  return qty;
};

// True when the artwork material carries something beyond the category
// dropdown — picking a category alone shouldn't create a row in the table
// (matches the validation skip rule in GenerateFactoryCode).
const artworkRowHasSubstance = (am) => {
  const f = (k) => String(am?.[k] || '').trim();
  if (f('componentName') || f('component_name')) return true;
  const comps = am?.components;
  if (Array.isArray(comps) ? comps.some((c) => String(c || '').trim()) : f('components')) return true;
  return Boolean(f('materialDescription') || f('placement') || f('unit') || f('workOrder'));
};

const buildArtworkRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  const seen = new Set();
  forEachStepData(formData, (stepdata, ipcCode, overage) => {
    (stepdata?.artworkMaterials || []).forEach((am, idx) => {
      if (!am || typeof am !== 'object') return;
      const category = (am.artworkCategory || am.artwork_category || '').toString().trim();
      if (!category) return;
      // Scaffold rows (category set, nothing else) shouldn't appear as a row.
      if (!artworkRowHasSubstance(am)) return;
      // Pull "IPC-n" out of the full IPC code (e.g. CHD/103A/PO-1/IPC-1 → IPC-1).
      const ipcMatch = String(ipcCode).match(/IPC-(\d+)/i);
      const ipcLabel = ipcMatch ? `IPC-${ipcMatch[1]}` : (ipcCode || 'IPC-?');
      const artworkLabel = `${category}-${ipcLabel}`;

      const rawComponent =
        am.componentName ||
        am.component_name ||
        (Array.isArray(am.components) ? am.components[0] : am.components) ||
        '';
      const componentName = String(rawComponent || '').trim();
      const comp = findComponentInStep(stepdata, componentName);
      const cutting = (comp && comp.cuttingSize) || {};
      // CNS/PC matches the Derived CNS Sheet — pull from the category's own
      // Qty field on the artwork material (with HEADER CARD casepack division).
      const cnsPc = getArtworkCnsPc(am, category);
      const netLength = pickFloat({ v: cutting.length }, ['v']);
      const netWidth = pickFloat({ v: cutting.width }, ['v']);

      // "Respective component" gross wastage: compound from the first RM whose
      // componentName matches this artwork's component. DYEING shrinkage too.
      const matchingRm = (stepdata?.rawMaterials || []).find((rm) => {
        const rmComp = String(rm?.componentName || rm?.component_name || '').trim();
        return rmComp.toLowerCase() === componentName.toLowerCase();
      });
      const grossWastageLength = matchingRm ? derivedGrossWastagePct(matchingRm) : 0;
      const grossWastageWidth = matchingRm ? getDyeingShrinkageWidth(matchingRm) : 0;

      // Per-PC wastage from the artwork form (compound of all wastage/surplus
      // fields on the artwork material — covers generic + category-specific keys).
      const grossWastagePc = derivedGrossWastagePct(am);

      // Dedupe: same IPC + same artwork label + same component + same material
      // description should only render one row. Guards against the wizard
      // saving both a scaffold and a real entry under the same category.
      const dedupeKey = [
        normKey(ipcCode),
        normKey(artworkLabel),
        normKey(componentName),
        normKey(am.materialDescription),
      ].join('::');
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      rows.push({
        id: `derived-artwork-${ipcCode}-${idx}-${normKey(category)}`,
        ipc: ipcCode,
        component: componentName,
        material_type: category,
        material_description: am.materialDescription || '',
        artwork_label: artworkLabel,
        overage_qty: overage,
        overage_qty_pcs: overage,
        cns_pc: cnsPc,
        net_length_cns_pc: netLength,
        net_width_cns_pc: netWidth,
        gross_wastage_pc: grossWastagePc,
        gross_wastage_length: grossWastageLength,
        gross_wastage_width: grossWastageWidth,
        // Unit comes from the category-specific QtyUnit field on the artwork
        // form (e.g., labelsBrandQtyUnit for "LABELS (BRAND/MAIN)").
        unit: getArtworkUnit(am, category),
      });
    });
  });
  return rows;
};

// Fabric rows from the Derived CNS Sheet.
// Attribute sources (per spec):
//   overage_qty_pcs   → SKU poQty × (1 + overagePercentage/100)
//   net_length_cns_pc → component cuttingSize.length (Cut & Sew Spec)
//   net_width_cns_pc  → component cuttingSize.width  (Cut & Sew Spec)
//   gross_wastage_length → compound of all wastage/surplus values on the RM
//   gross_wastage_width  → DYEING work order shrinkageWidthPercent (0 if none)
// Gross Length/Width CNS/PC, Gross Width CNS, Gross Length Qty, Balance Gross
// Width Wastage %, etc. are already derived inside FABRIC_COLUMNS renderers
// from these primitives plus the user's manual Purchase Width input.
const buildFabricRowsFromDerived = (formData) => {
  if (!formData || typeof formData !== 'object') return [];
  const rows = [];
  const processStep = (stepdata, ipcCode, overage) => {
    (stepdata?.rawMaterials || []).forEach((rm, idx) => {
      if (!rm || typeof rm !== 'object') return;
      if (!isFabricType(rm.materialType || rm.material_type)) return;
      const description =
        rm.materialDescription ||
        rm.material_description ||
        rm.materialName ||
        rm.material_name ||
        rm.fabricName ||
        '';
      const componentName = rm.componentName || rm.component_name || '';
      const comp = findComponentInStep(stepdata, componentName);
      const cutting = (comp && comp.cuttingSize) || {};
      const netLengthRaw = cutting.length;
      const netWidthRaw = cutting.width;
      const netLength = netLengthRaw !== undefined && netLengthRaw !== null && netLengthRaw !== ''
        ? parseFloat(netLengthRaw)
        : null;
      const netWidth = netWidthRaw !== undefined && netWidthRaw !== null && netWidthRaw !== ''
        ? parseFloat(netWidthRaw)
        : null;
      rows.push({
        id: `derived-fabric-${ipcCode}-${idx}-${normKey(description)}`,
        ipc: ipcCode,
        component: componentName,
        material_type: rm.materialType || 'Fabric',
        material_description: description,
        overage_qty_pcs: overage,
        overage_qty: overage,
        net_length_cns_pc: Number.isFinite(netLength) ? netLength : null,
        net_width_cns_pc: Number.isFinite(netWidth) ? netWidth : null,
        gross_wastage_length: derivedGrossWastagePct(rm),
        gross_wastage_width: getDyeingShrinkageWidth(rm),
        unit: rm.unit || rm.consumptionUnit || '',
      });
    });
  };
  (formData.skus || []).forEach((sku) => {
    if (!sku || typeof sku !== 'object') return;
    const skuIpc = sku.ipcCode || sku.ipc_code || sku.sku || '';
    const skuOverage = computeSkuOverage(sku.poQty, sku.overagePercentage);
    processStep(sku.stepData, skuIpc, skuOverage);
    (sku.subproducts || []).forEach((sub) => {
      if (!sub || typeof sub !== 'object') return;
      const subIpc = sub.ipcCode || sub.ipc_code || sub.subproduct || skuIpc;
      const subOverage = computeSkuOverage(sub.poQty, sub.overagePercentage) ?? skuOverage;
      processStep(sub.stepData, subIpc, subOverage);
    });
  });
  return rows;
};

const TABS = [
  { key: 'raw_material', label: 'Raw Material' },
  { key: 'artwork_labeling', label: 'Artwork & Labeling' },
  { key: 'packaging', label: 'Packaging' },
];

const RAW_SUBTABS = [
  { key: 'fabric', label: 'Fabric', matches: (t) => /fabric/i.test(t) },
  { key: 'fiber', label: 'Fiber', matches: (t) => /fiber|fibre/i.test(t) },
  { key: 'foam', label: 'Foam', matches: (t) => /foam/i.test(t) },
  { key: 'trim', label: 'Trim & Accessory', matches: (t) => /trim|accessory|accessor/i.test(t) },
  { key: 'yarn', label: 'Yarn', matches: (t) => /yarn|thread/i.test(t) },
];

const formatNumber = (value, { decimals = 3, suffix = '' } = {}) => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `${n.toFixed(decimals)}${suffix}`;
};

const toNum = (v) => {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

// Derived fabric values (pure helpers; same row shape as backend)
const grossLengthPc = (row) => {
  const n = toNum(row.net_length_cns_pc);
  const w = toNum(row.gross_wastage_length);
  if (!Number.isFinite(n)) return NaN;
  return n * (1 + (Number.isFinite(w) ? w : 0) / 100);
};
const grossWidthPc = (row) => {
  const n = toNum(row.net_width_cns_pc);
  const w = toNum(row.gross_wastage_width);
  if (!Number.isFinite(n)) return NaN;
  return n * (1 + (Number.isFinite(w) ? w : 0) / 100);
};
const fabricGrossWidthCns = (row, ctx) => {
  if (!ctx?.isClub) return grossWidthPc(row);
  return ctx.clubRows.reduce((acc, r) => {
    const v = grossWidthPc(r);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};
// Same shape as fabricGrossWidthCns: single → per-piece value; club → sum of
// per-piece values across all clubbed rows.
const grossLengthCnsAggregated = (row, ctx) => {
  if (!ctx?.isClub) return grossLengthPc(row);
  return ctx.clubRows.reduce((acc, r) => {
    const v = grossLengthPc(r);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};
const grossWeightCnsAggregated = (row, ctx) => {
  const ofRow = (r) => toNum(r.gross_weight_cns_pc_grams);
  if (!ctx?.isClub) return ofRow(row);
  return ctx.clubRows.reduce((acc, r) => {
    const v = ofRow(r);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};
const fabricPurchaseWidthTotal = (row, ctx) => {
  const readOne = (id) => toNum(ctx?.manualInputs?.[id]?.purchase_width);
  if (!ctx?.isClub) return readOne(row.id);
  return ctx.clubRows.reduce((acc, r) => {
    const v = readOne(r.id);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};

// Sum a manual-input field across all rows in a club (or single value when not clubbed).
const sumManualAcrossClub = (row, ctx, field) => {
  const readOne = (id) => toNum(ctx?.manualInputs?.[id]?.[field]);
  if (!ctx?.isClub) return readOne(row.id);
  return ctx.clubRows.reduce((acc, r) => {
    const v = readOne(r.id);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};

// Sum a per-row computed value across all rows in a club (or single value when not clubbed).
const sumComputedAcrossClub = (row, ctx, computeOne) => {
  if (!ctx?.isClub) return computeOne(row);
  return ctx.clubRows.reduce((acc, r) => {
    const v = computeOne(r);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
};

// Pull Net CNS/PC and Unit for a yarn row from the Derived Sheet lookup
// (keyed by IPC + material description). Falls back to the row's own values.
const yarnNetCns = (row, ctx) => {
  const hit = ctx?.yarnLookup ? lookupDerived(ctx.yarnLookup, row.ipc, row.material_description) : null;
  if (hit && hit.netCns !== undefined && hit.netCns !== null && hit.netCns !== '') {
    return hit.netCns;
  }
  return row.net_cns_pc;
};
const yarnUnit = (row, ctx) => {
  const hit = ctx?.yarnLookup ? lookupDerived(ctx.yarnLookup, row.ipc, row.material_description) : null;
  if (hit && hit.unit) return hit.unit;
  return row.unit || '';
};

const yarnGrossCns = (row, ctx) => {
  const net = toNum(yarnNetCns(row, ctx));
  if (!Number.isFinite(net)) return NaN;
  const w = toNum(row.gross_wastage);
  return net * (1 + (Number.isFinite(w) ? w : 0) / 100);
};

const YARN_COLUMNS = [
  { key: 'material_description', header: 'Material Description', align: 'left',
    render: (r) => r.material_description || '-' },
  { key: 'net_cns_pc', header: 'Net CNS/PC', align: 'right',
    render: (r, ctx) => formatNumber(yarnNetCns(r, ctx)) },
  { key: 'overage_qty_pcs', header: 'Overage QTY PCS', align: 'right',
    render: (r) => formatNumber(r.overage_qty_pcs, { decimals: 2 }) },
  { key: 'gross_wastage', header: 'Gross Wastage', align: 'right',
    render: (r) => formatNumber(r.gross_wastage, { decimals: 2, suffix: '%' }) },
  { key: 'gross_cns', header: 'Gross CNS', align: 'right',
    render: (r, ctx) => formatNumber(yarnGrossCns(r, ctx)) },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r, ctx) => yarnUnit(r, ctx) || '-' },
];

const numberInputStyle = (invalid) => ({
  width: 90,
  padding: '4px 6px',
  fontSize: 13,
  border: `1px solid ${invalid ? '#dc2626' : '#d1d5db'}`,
  borderRadius: 4,
  background: invalid ? '#fef2f2' : '#ffffff',
  textAlign: 'right',
  outline: 'none',
});

const ManualNumberCell = ({ rowId, field, ctx, invalid }) => {
  const value = ctx?.manualInputs?.[rowId]?.[field] ?? '';
  return (
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => ctx?.setManualInput?.(rowId, field, e.target.value)}
      style={numberInputStyle(invalid)}
      title={invalid ? 'Purchase Width must be greater than Gross Width CNS' : undefined}
    />
  );
};

// When a "purchase_*" manual-input column is clubbed, show the sum of inputs across
// the club (in the summary row); otherwise show the editable per-row input cell.
const renderManualPurchase = (field) => (r, ctx) => {
  if (ctx?.isClub) {
    return (
      <span style={{ fontWeight: 600 }}>
        {formatNumber(sumManualAcrossClub(r, ctx, field), { decimals: 2 })}
      </span>
    );
  }
  return <ManualNumberCell rowId={r.id} field={field} ctx={ctx} />;
};

// When a "gross_*" counterpart column is clubbed, show the sum of the per-row computed
// value across the club; otherwise show the per-row computed value.
const renderSumComputed = (computeOne, decimals = 2) => (r, ctx) => {
  const value = sumComputedAcrossClub(r, ctx, computeOne);
  if (!Number.isFinite(value)) return '-';
  if (ctx?.isClub) {
    return <span style={{ fontWeight: 600 }}>{formatNumber(value, { decimals })}</span>;
  }
  return formatNumber(value, { decimals });
};

const FABRIC_COLUMNS = [
  { key: 'material_description', header: 'Material Description', align: 'left',
    render: (r) => r.material_description || '-' },
  { key: 'overage_qty', header: 'Overage QTY', align: 'right',
    render: (r) => formatNumber(r.overage_qty ?? r.overage_qty_pcs, { decimals: 2 }) },
  { key: 'net_length_cns_pc', header: 'Net Length CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_length_cns_pc) },
  { key: 'net_width_cns_pc', header: 'Net Width CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_width_cns_pc) },
  { key: 'gross_wastage_length', header: 'Gross Wastage Length', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_length, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_width', header: 'Gross Wastage Width', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_width, { decimals: 2, suffix: '%' }) },
  { key: 'gross_length_cns_pc', header: 'Gross Length CNS/PC', align: 'right',
    render: (r) => formatNumber(grossLengthPc(r)) },
  { key: 'gross_width_cns_pc', header: 'Gross Width CNS/PC', align: 'right',
    render: (r) => formatNumber(grossWidthPc(r)) },
  { key: 'gross_width_cns', header: 'Gross Width CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(fabricGrossWidthCns(r, ctx)) },
  { key: 'purchase_width', header: 'Purchase Width', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const scopePurchase = fabricPurchaseWidthTotal(r, ctx);
      const scopeGross = fabricGrossWidthCns(r, ctx);
      const invalid = Number.isFinite(scopePurchase) && Number.isFinite(scopeGross)
        && scopePurchase > 0 && scopePurchase <= scopeGross;
      if (ctx?.isClub) {
        return (
          <span
            style={{
              fontWeight: 600,
              color: invalid ? '#dc2626' : undefined,
            }}
            title={invalid ? 'Purchase Width sum must be greater than Gross Width CNS' : undefined}
          >
            {formatNumber(scopePurchase, { decimals: 2 })}
          </span>
        );
      }
      return <ManualNumberCell rowId={r.id} field="purchase_width" ctx={ctx} invalid={invalid} />;
    } },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r) => r.unit || '-' },
  { key: 'gross_length_qty', header: 'Gross Length QTY', align: 'right',
    aggregatedInClub: true,
    render: renderSumComputed((row) => {
      const glPc = grossLengthPc(row);
      const overage = toNum(row.overage_qty ?? row.overage_qty_pcs);
      if (!Number.isFinite(glPc) || !Number.isFinite(overage)) return NaN;
      return glPc * overage;
    }) },
  { key: 'purchase_length_qty', header: 'Purchase Length QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_length_qty') },
  { key: 'gross_width_multiple', header: 'Gross Width Multiple', align: 'right',
    render: (r, ctx) => <ManualNumberCell rowId={r.id} field="gross_width_multiple" ctx={ctx} /> },
  { key: 'balance_gross_width_wastage', header: 'Balance Gross Width Wastage', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw)) return '-';
      return formatNumber(pw - gw, { decimals: 2 });
    } },
  { key: 'balance_gross_width_wastage_pct', header: 'Balance Gross Width Wastage %', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw) || pw === 0) return '-';
      return formatNumber(((pw - gw) / pw) * 100, { decimals: 2, suffix: '%' });
    } },
];

const TRIM_COLUMNS = [
  { key: 'material_description', header: 'Material Description', align: 'left',
    render: (r) => r.material_description || '-' },
  { key: 'overage_qty', header: 'Overage QTY', align: 'right',
    render: (r) => formatNumber(r.overage_qty, { decimals: 2 }) },
  { key: 'gsm', header: 'GSM', align: 'right',
    render: (r) => {
      const v = r.gsm;
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(2) : String(v);
    } },
  { key: 'cns_pc', header: 'CNS/PC', align: 'right',
    render: (r) => formatNumber(r.cns_pc) },
  { key: 'net_length_cns_pc', header: 'Net Length CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_length_cns_pc) },
  { key: 'net_width_cns_pc', header: 'Net Width CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_width_cns_pc) },
  { key: 'gross_wastage_length', header: 'Gross Wastage Length', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_length, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_width', header: 'Gross Wastage Width', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_width, { decimals: 2, suffix: '%' }) },
  { key: 'gross_length_pc_cns', header: 'Gross Length CNS/PC', align: 'right',
    render: (r) => formatNumber(grossLengthPc(r)) },
  { key: 'gross_width_cns_pc', header: 'Gross Width CNS/PC', align: 'right',
    render: (r) => formatNumber(grossWidthPc(r)) },
  { key: 'purchase_width', header: 'Purchase Width', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_width') },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r) => r.unit || '-' },
  { key: 'gross_length_cns', header: 'Gross Length CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossLengthCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'purchase_length_qty', header: 'Purchase Length QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_length_qty') },
  { key: 'gross_qty_pcs', header: 'Gross QTY PCS', align: 'right',
    aggregatedInClub: true,
    render: renderSumComputed((row) => {
      // Gross QTY PCS = Gross CNS/PC × Overage Quantity
      // where Gross CNS/PC = Net CNS/PC × (1 + Gross Wastage% / 100)
      const cns = toNum(row.cns_pc);
      const overage = toNum(row.overage_qty ?? row.overage_qty_pcs);
      if (!Number.isFinite(cns) || !Number.isFinite(overage)) return NaN;
      const w = toNum(row.gross_wastage_length ?? row.gross_wastage);
      const grossPerPc = cns * (1 + (Number.isFinite(w) ? w : 0) / 100);
      return grossPerPc * overage;
    }) },
  { key: 'purchase_qty_pcs', header: 'Purchase QTY PCS', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_qty_pcs') },
  { key: 'gross_weight_qty', header: 'Gross Weight QTY', align: 'right',
    aggregatedInClub: true,
    render: renderSumComputed((row) => {
      // Gross Weight QTY = Gross Weight CNS/PC × Overage Quantity
      // (per-piece weight is in grams; 0 when Unit is not KGS)
      const gwPc = toNum(row.gross_weight_cns_pc_grams);
      const overage = toNum(row.overage_qty ?? row.overage_qty_pcs);
      if (!Number.isFinite(gwPc) || !Number.isFinite(overage)) return NaN;
      return gwPc * overage;
    }) },
  { key: 'purchase_weight_qty', header: 'Purchase Weight QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_weight_qty') },
];

const FIBER_COLUMNS = [
  { key: 'material_description', header: 'Material Description', align: 'left',
    render: (r) => r.material_description || '-' },
  { key: 'overage_qty', header: 'Overage QTY', align: 'right',
    render: (r) => formatNumber(r.overage_qty, { decimals: 2 }) },
  { key: 'denier', header: 'Denier', align: 'left',
    render: (r) => {
      const v = r.denier;
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      return Number.isFinite(n) && String(v).trim() === String(n) ? n.toFixed(2) : String(v);
    } },
  { key: 'gsm', header: 'GSM', align: 'right',
    render: (r) => {
      const v = r.gsm;
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(2) : String(v);
    } },
  { key: 'net_length_cns_pc', header: 'Net Length CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_length_cns_pc) },
  { key: 'net_width_cns_pc', header: 'Net Width CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_width_cns_pc) },
  { key: 'net_weight_cns_pc_grams', header: 'Net Weight CNS/PC (Grams)', align: 'right',
    render: (r) => formatNumber(r.net_weight_cns_pc_grams, { decimals: 2 }) },
  { key: 'gross_wastage_length', header: 'Gross Wastage Length', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_length, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_width', header: 'Gross Wastage Width', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_width, { decimals: 2, suffix: '%' }) },
  { key: 'gross_length_pc_cns', header: 'Gross Length CNS/PC', align: 'right',
    render: (r) => formatNumber(grossLengthPc(r)) },
  { key: 'gross_width_cns_pc', header: 'Gross Width CNS/PC', align: 'right',
    render: (r) => formatNumber(grossWidthPc(r)) },
  { key: 'gross_weight_cns_pc_grams', header: 'Gross Weight CNS/PC (Grams)', align: 'right',
    render: (r) => formatNumber(r.gross_weight_cns_pc_grams, { decimals: 2 }) },
  { key: 'purchase_width', header: 'Purchase Width', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_width') },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r) => r.unit || '-' },
  { key: 'gross_length_cns', header: 'Gross Length CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossLengthCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'gross_weight_cns', header: 'Gross Weight CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossWeightCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'purchase_weight_qty', header: 'Purchase Weight QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_weight_qty') },
  { key: 'gross_width_multiple', header: 'Gross Width Multiple', align: 'right',
    render: (r, ctx) => <ManualNumberCell rowId={r.id} field="gross_width_multiple" ctx={ctx} /> },
  { key: 'balance_gross_width_wastage', header: 'Balance Gross Width Wastage', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw)) return '-';
      return formatNumber(pw - gw, { decimals: 2 });
    } },
  { key: 'balance_gross_width_wastage_pct', header: 'Balance Gross Width Wastage %', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw) || pw === 0) return '-';
      return formatNumber(((pw - gw) / pw) * 100, { decimals: 2, suffix: '%' });
    } },
];

const FOAM_COLUMNS = [
  { key: 'material_description', header: 'Material Description', align: 'left',
    render: (r) => r.material_description || '-' },
  { key: 'overage_qty', header: 'Overage QTY', align: 'right',
    render: (r) => formatNumber(r.overage_qty, { decimals: 2 }) },
  { key: 'gsm', header: 'GSM', align: 'right',
    render: (r) => {
      const v = r.gsm;
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(2) : String(v);
    } },
  { key: 'net_length_cns_pc', header: 'Net Length CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_length_cns_pc) },
  { key: 'net_width_cns_pc', header: 'Net Width CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_width_cns_pc) },
  { key: 'net_weight_cns_pc_grams', header: 'Net Weight CNS/PC (Grams)', align: 'right',
    render: (r) => formatNumber(r.net_weight_cns_pc_grams, { decimals: 2 }) },
  { key: 'gross_wastage_length', header: 'Gross Wastage Length', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_length, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_width', header: 'Gross Wastage Width', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_width, { decimals: 2, suffix: '%' }) },
  { key: 'gross_length_pc_cns', header: 'Gross Length CNS/PC', align: 'right',
    render: (r) => formatNumber(grossLengthPc(r)) },
  { key: 'gross_width_cns_pc', header: 'Gross Width CNS/PC', align: 'right',
    render: (r) => formatNumber(grossWidthPc(r)) },
  { key: 'gross_weight_cns_pc_grams', header: 'Gross Weight CNS/PC (Grams)', align: 'right',
    render: (r) => formatNumber(r.gross_weight_cns_pc_grams, { decimals: 2 }) },
  { key: 'purchase_width', header: 'Purchase Width', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_width') },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r) => r.unit || '-' },
  { key: 'gross_length_cns', header: 'Gross Length CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossLengthCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'gross_weight_cns', header: 'Gross Weight CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossWeightCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'purchase_weight_qty', header: 'Purchase Weight QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_weight_qty') },
  { key: 'gross_width_multiple', header: 'Gross Width Multiple', align: 'right',
    render: (r, ctx) => <ManualNumberCell rowId={r.id} field="gross_width_multiple" ctx={ctx} /> },
  { key: 'balance_gross_width_wastage', header: 'Balance Gross Width Wastage', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw)) return '-';
      return formatNumber(pw - gw, { decimals: 2 });
    } },
  { key: 'balance_gross_width_wastage_pct', header: 'Balance Gross Width Wastage %', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const pw = fabricPurchaseWidthTotal(r, ctx);
      const gw = fabricGrossWidthCns(r, ctx);
      if (!Number.isFinite(pw) || !Number.isFinite(gw) || pw === 0) return '-';
      return formatNumber(((pw - gw) / pw) * 100, { decimals: 2, suffix: '%' });
    } },
];

const ARTWORK_COLUMNS = [
  { key: 'artwork_label', header: 'Artwork/Label', align: 'left',
    render: (r) => r.artwork_label || r.material_type || '-' },
  { key: 'overage_qty', header: 'Overage Quantity', align: 'right',
    render: (r) => formatNumber(r.overage_qty ?? r.overage_qty_pcs, { decimals: 2 }) },
  { key: 'cns_pc', header: 'CNS/PC', align: 'right',
    render: (r) => formatNumber(r.cns_pc) },
  { key: 'net_length_cns_pc', header: 'Net Length CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_length_cns_pc) },
  { key: 'net_width_cns_pc', header: 'Net Width CNS/PC', align: 'right',
    render: (r) => formatNumber(r.net_width_cns_pc) },
  { key: 'gross_wastage_pc', header: 'Gross Wastage/PC', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_pc, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_length', header: 'Gross Wastage Length', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_length, { decimals: 2, suffix: '%' }) },
  { key: 'gross_wastage_width', header: 'Gross Wastage Width', align: 'right',
    render: (r) => formatNumber(r.gross_wastage_width, { decimals: 2, suffix: '%' }) },
  { key: 'gross_length_cns_pc', header: 'Gross Length CNS/PC', align: 'right',
    render: (r) => formatNumber(grossLengthPc(r)) },
  { key: 'gross_width_cns_pc', header: 'Gross Width CNS/PC', align: 'right',
    render: (r) => formatNumber(grossWidthPc(r)) },
  { key: 'purchase_width', header: 'Purchase Width', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => {
      const scopePurchase = fabricPurchaseWidthTotal(r, ctx);
      const scopeGross = fabricGrossWidthCns(r, ctx);
      const invalid = Number.isFinite(scopePurchase) && Number.isFinite(scopeGross)
        && scopePurchase > 0 && scopePurchase <= scopeGross;
      if (ctx?.isClub) {
        return (
          <span
            style={{ fontWeight: 600, color: invalid ? '#dc2626' : undefined }}
            title={invalid ? 'Purchase Width sum must be greater than Gross Width CNS' : undefined}
          >
            {formatNumber(scopePurchase, { decimals: 2 })}
          </span>
        );
      }
      return <ManualNumberCell rowId={r.id} field="purchase_width" ctx={ctx} invalid={invalid} />;
    } },
  { key: 'unit', header: 'Unit', align: 'left',
    render: (r) => r.unit || '-' },
  { key: 'gross_length_cns', header: 'Gross Length CNS', align: 'right',
    aggregatedInClub: true,
    render: (r, ctx) => formatNumber(grossLengthCnsAggregated(r, ctx), { decimals: 2 }) },
  { key: 'purchase_length_qty', header: 'Purchase Length QTY', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_length_qty') },
  { key: 'gross_qty_pcs', header: 'Gross QTY PCS', align: 'right',
    aggregatedInClub: true,
    render: renderSumComputed((row) => {
      // Gross QTY PCS = Overage Quantity × (1 + Gross Wastage/PC % / 100)
      const overage = toNum(row.overage_qty ?? row.overage_qty_pcs);
      if (!Number.isFinite(overage)) return NaN;
      const w = toNum(row.gross_wastage_pc);
      return overage * (1 + (Number.isFinite(w) ? w : 0) / 100);
    }) },
  { key: 'purchase_qty_pcs', header: 'Purchase QTY PCS', align: 'right',
    aggregatedInClub: true,
    render: renderManualPurchase('purchase_qty_pcs') },
];

const SUBTAB_CONFIG = {
  yarn:   { columns: YARN_COLUMNS,   showSrNumber: false, ipcAfterSelect: false },
  fabric: { columns: FABRIC_COLUMNS, showSrNumber: false, ipcAfterSelect: false },
  trim:   { columns: TRIM_COLUMNS,   showSrNumber: true,  ipcAfterSelect: true  },
  fiber:  { columns: FIBER_COLUMNS,  showSrNumber: true,  ipcAfterSelect: true  },
  foam:   { columns: FOAM_COLUMNS,   showSrNumber: true,  ipcAfterSelect: true  },
};

// Layout for the Artwork & Labeling tab (no subtabs).
const ARTWORK_TAB_CONFIG = { columns: ARTWORK_COLUMNS, showSrNumber: true, ipcAfterSelect: true };

const IPOMasterCNS = ({ ipo }) => {
  const [activeTab, setActiveTab] = useState('raw_material');
  const [rawSubtab, setRawSubtab] = useState('fabric');
  // Clubs: array of { id, rowIds: [string], label: 'Club N' }
  const [clubs, setClubs] = useState([]);
  // Which clubs are currently checked (by club.id)
  const [selectedClubs, setSelectedClubs] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({});
  const [manualInputs, setManualInputs] = useState({});
  const [derivedFormData, setDerivedFormData] = useState(null);
  const [sharedToPurchase, setSharedToPurchase] = useState(false);
  const [sharingToPurchase, setSharingToPurchase] = useState(false);
  const [shareError, setShareError] = useState('');
  const { showLoading, hideLoading } = useLoading();

  const handleShareToPurchase = async () => {
    const ipoId = ipo?.ipoId || ipo?.id;
    if (!ipoId || sharedToPurchase || sharingToPurchase) return;
    setSharingToPurchase(true);
    setShareError('');
    try {
      const res = await shareIpoToPurchase(ipoId);
      if (res?.shared_to_purchase) {
        setSharedToPurchase(true);
      } else if (res?.detail) {
        setShareError(res.detail);
      }
    } catch (err) {
      setShareError(err?.message || 'Failed to share IPO to Purchase.');
    } finally {
      setSharingToPurchase(false);
    }
  };
  const setManualInput = (rowId, field, value) => {
    setManualInputs((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [field]: value },
    }));
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      showLoading();
      setError('');
      try {
        const response = await getIPOMasterCNS(ipo.ipoId || ipo.id);
        if (!cancelled) {
          setData(response);
          setSharedToPurchase(Boolean(response?.shared_to_purchase || ipo?.shared_to_purchase));
          const seed = {};
          const seedFields = [
            'purchase_width',
            'purchase_length_qty',
            'gross_width_multiple',
            'purchase_qty_pcs',
            'purchase_weight_qty',
          ];
          (response?.raw_material || []).forEach((r) => {
            const entry = {};
            seedFields.forEach((f) => {
              if (r[f] !== null && r[f] !== undefined) {
                entry[f] = String(r[f]);
              }
            });
            if (Object.keys(entry).length) seed[r.id] = entry;
          });
          setManualInputs(seed);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load IPO Master CNS.');
      } finally {
        if (!cancelled) setLoading(false);
        hideLoading();
      }
    };
    if (ipo?.ipoId || ipo?.id) run();
    return () => { cancelled = true; };
  }, [ipo?.ipoId, ipo?.id]);

  // Load the same Derived CNS Sheet data that IPODerivedCNS uses — from the
  // database only (the per-IPO server draft). No localStorage.
  useEffect(() => {
    let cancelled = false;
    const ipoCode = ipo?.ipoCode || ipo?.code || '';
    const ipoId = ipo?.ipoId || ipo?.id || null;
    if (!ipoId && !ipoCode) return () => {};
    (async () => {
      try {
        const res = await getFactoryCodeDraft(ipoId);
        if (cancelled) return;
        const payload = res?.payload;
        if (payload && typeof payload === 'object') {
          setDerivedFormData(payload);
        }
      } catch {
        // Non-fatal: yarn subtab will just fall back to backend values.
      }
    })();
    return () => { cancelled = true; };
  }, [ipo?.ipoCode, ipo?.code, ipo?.ipoId, ipo?.id]);

  const yarnLookup = useMemo(() => buildYarnLookup(derivedFormData), [derivedFormData]);
  const yarnRowsFromDerived = useMemo(
    () => buildYarnRowsFromDerived(derivedFormData),
    [derivedFormData]
  );
  const fabricRowsFromDerived = useMemo(
    () => buildFabricRowsFromDerived(derivedFormData),
    [derivedFormData]
  );
  const fiberRowsFromDerived = useMemo(
    () => buildFiberRowsFromDerived(derivedFormData),
    [derivedFormData]
  );
  const foamRowsFromDerived = useMemo(
    () => buildFoamRowsFromDerived(derivedFormData),
    [derivedFormData]
  );
  const trimRowsFromDerived = useMemo(
    () => buildTrimRowsFromDerived(derivedFormData),
    [derivedFormData]
  );
  const artworkRowsFromDerived = useMemo(
    () => buildArtworkRowsFromDerived(derivedFormData),
    [derivedFormData]
  );

  // Debug snapshot shown only on Yarn subtab when no rows resolve. Lets us
  // see whether derivedFormData loaded at all, how many SKUs / rawMaterials
  // it has, and what materialType values are present so the user can spot
  // a wizard-form field mismatch without reading code.
  const yarnDebug = useMemo(() => {
    const ipoCodeForKey = ipo?.ipoCode || ipo?.code || '';
    const allLocalKeys = [];
    const skus = Array.isArray(derivedFormData?.skus) ? derivedFormData.skus : [];
    const allRms = [];
    skus.forEach((sku) => {
      const skuIpc = sku?.ipcCode || sku?.ipc_code || sku?.sku || '';
      (sku?.stepData?.rawMaterials || []).forEach((rm) => {
        allRms.push({ ipc: skuIpc, materialType: rm?.materialType, desc: rm?.materialDescription || rm?.materialName });
      });
      (sku?.subproducts || []).forEach((sub) => {
        const subIpc = sub?.ipcCode || sub?.ipc_code || sub?.subproduct || skuIpc;
        (sub?.stepData?.rawMaterials || []).forEach((rm) => {
          allRms.push({ ipc: subIpc, materialType: rm?.materialType, desc: rm?.materialDescription || rm?.materialName });
        });
      });
    });
    return {
      ipoProp: { ipoCode: ipo?.ipoCode, code: ipo?.code, ipoId: ipo?.ipoId, id: ipo?.id },
      lookupKeyTried: ipoCodeForKey ? `factoryCodeFormData:${ipoCodeForKey}` : '(none — no ipoCode/code on ipo prop)',
      matchingLocalStorageKeys: allLocalKeys,
      derivedFormDataLoaded: !!derivedFormData,
      skuCount: skus.length,
      rawMaterialsCount: allRms.length,
      uniqueMaterialTypes: Array.from(new Set(allRms.map((r) => r.materialType || '(empty)'))),
      sampleRawMaterials: allRms.slice(0, 5),
      yarnRowsBuilt: yarnRowsFromDerived.length,
    };
  }, [ipo?.ipoCode, ipo?.code, ipo?.ipoId, ipo?.id, derivedFormData, yarnRowsFromDerived]);

  const rows = useMemo(() => {
    // Artwork & Labeling — sourced from the Derived Sheet's artworkMaterials.
    if (activeTab === 'artwork_labeling') return artworkRowsFromDerived;
    if (activeTab !== 'raw_material') return data ? data[activeTab] || [] : [];
    // Yarn and Fabric are sourced directly from the Derived CNS Sheet, matched
    // by IPC + component + material description. Bypasses backend material_type
    // classification so these subtabs always reflect what's on the Derived Sheet.
    if (rawSubtab === 'yarn') return yarnRowsFromDerived;
    if (rawSubtab === 'fabric') return fabricRowsFromDerived;
    if (rawSubtab === 'fiber') return fiberRowsFromDerived;
    if (rawSubtab === 'foam') return foamRowsFromDerived;
    if (rawSubtab === 'trim') return trimRowsFromDerived;
    const all = data ? data.raw_material || [] : [];
    const sub = RAW_SUBTABS.find((s) => s.key === rawSubtab);
    if (!sub) return all;
    return all.filter((r) => sub.matches(String(r.material_type || '')));
  }, [data, activeTab, rawSubtab, yarnRowsFromDerived, fabricRowsFromDerived, fiberRowsFromDerived, foamRowsFromDerived, trimRowsFromDerived, artworkRowsFromDerived]);

  // Hide tabs/subtabs that resolve to zero rows so the user only sees views
  // that actually have data. Auto-switch the current selection if it becomes
  // empty (e.g. wizard data changes and the active subtab disappears).
  const availableSubtabs = useMemo(() => {
    const has = {
      fabric: fabricRowsFromDerived.length > 0,
      fiber: fiberRowsFromDerived.length > 0,
      foam: foamRowsFromDerived.length > 0,
      trim: trimRowsFromDerived.length > 0,
      yarn: yarnRowsFromDerived.length > 0,
    };
    return RAW_SUBTABS.filter((s) => has[s.key]);
  }, [fabricRowsFromDerived, fiberRowsFromDerived, foamRowsFromDerived, trimRowsFromDerived, yarnRowsFromDerived]);

  const availableTabs = useMemo(() => {
    const has = {
      raw_material: availableSubtabs.length > 0,
      artwork_labeling: artworkRowsFromDerived.length > 0,
      packaging: (data?.packaging?.length || 0) > 0,
    };
    return TABS.filter((t) => has[t.key]);
  }, [availableSubtabs, artworkRowsFromDerived, data]);

  useEffect(() => {
    if (availableTabs.length === 0) return;
    if (!availableTabs.some((t) => t.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    if (activeTab !== 'raw_material' || availableSubtabs.length === 0) return;
    if (!availableSubtabs.some((s) => s.key === rawSubtab)) {
      setRawSubtab(availableSubtabs[0].key);
    }
  }, [availableSubtabs, activeTab, rawSubtab]);

  const activeConfig = activeTab === 'artwork_labeling'
    ? ARTWORK_TAB_CONFIG
    : (SUBTAB_CONFIG[rawSubtab] || SUBTAB_CONFIG.yarn);
  const columns = activeConfig.columns;
  const { showSrNumber, ipcAfterSelect } = activeConfig;
  const totalCols = columns.length + 5 + (showSrNumber ? 1 : 0);

  // Cumulative left-offsets for the frozen left columns (Excel-style freeze pane).
  // Layout depends on whether SR# is shown and whether IPC# is rendered before
  // or after the Select column.
  const stickyLeft = {
    sr: 0,
    leadingIpc: showSrNumber ? COL_WIDTHS.sr : 0,
    select: (showSrNumber ? COL_WIDTHS.sr : 0) + (!ipcAfterSelect ? COL_WIDTHS.ipc : 0),
    trailingIpc: (showSrNumber ? COL_WIDTHS.sr : 0) + COL_WIDTHS.select,
    matDesc: (showSrNumber ? COL_WIDTHS.sr : 0) + COL_WIDTHS.select + COL_WIDTHS.ipc,
  };

  const clubbedIdSet = useMemo(() => {
    const s = new Set();
    clubs.forEach((c) => c.rowIds.forEach((id) => s.add(id)));
    return s;
  }, [clubs]);

  // Rows not in any club — these keep the default IPC grouping.
  const unclubbedRows = useMemo(
    () => rows.filter((r) => !clubbedIdSet.has(r.id)),
    [rows, clubbedIdSet]
  );

  // Compute rowSpan groupings: consecutive rows sharing the same IPC are clubbed
  // under one IPC cell. Rows are already sorted by IPC then component on the backend.
  const groupedRows = useMemo(() => {
    const result = [];
    let currentIpc = null;
    unclubbedRows.forEach((row, idx) => {
      const isFirst = row.ipc !== currentIpc;
      if (isFirst) {
        currentIpc = row.ipc;
        let span = 1;
        for (let j = idx + 1; j < unclubbedRows.length && unclubbedRows[j].ipc === currentIpc; j += 1) {
          span += 1;
        }
        result.push({ ...row, _ipcRowSpan: span, _firstOfIpc: true });
      } else {
        result.push({ ...row, _ipcRowSpan: 0, _firstOfIpc: false });
      }
    });
    for (let i = 0; i < result.length; i += 1) {
      const next = result[i + 1];
      result[i]._lastOfIpc = !next || next._firstOfIpc;
    }
    return result;
  }, [unclubbedRows]);

  // Hydrate clubs for the active view: resolve ids back to row objects
  // (skipping rows that are filtered out by the current tab/subtab).
  const activeClubs = useMemo(() => {
    const byId = new Map(rows.map((r) => [r.id, r]));
    return clubs
      .map((c) => ({
        ...c,
        resolvedRows: c.rowIds.map((id) => byId.get(id)).filter(Boolean),
      }))
      .filter((c) => c.resolvedRows.length > 0);
  }, [clubs, rows]);

  const serialMap = useMemo(() => {
    const m = new Map();
    let n = 1;
    activeClubs.forEach((c) => c.resolvedRows.forEach((r) => { m.set(r.id, n); n += 1; }));
    groupedRows.forEach((r) => { m.set(r.id, n); n += 1; });
    return m;
  }, [activeClubs, groupedRows]);

  const isComplete = !!data?.is_complete;
  const totalRows = useMemo(() => {
    const backend = data
      ? ['raw_material', 'artwork_labeling', 'packaging'].reduce((n, k) => n + (data[k]?.length || 0), 0)
      : 0;
    // Yarn and Fabric rows are sourced from the Derived CNS Sheet, not the
    // backend. Count them here so the "No IPC data has been saved" short-circuit
    // doesn't hide the table when only the Derived Sheet has data.
    return backend
      + yarnRowsFromDerived.length
      + fabricRowsFromDerived.length
      + fiberRowsFromDerived.length
      + foamRowsFromDerived.length
      + trimRowsFromDerived.length
      + artworkRowsFromDerived.length;
  }, [data, yarnRowsFromDerived, fabricRowsFromDerived, fiberRowsFromDerived, foamRowsFromDerived, trimRowsFromDerived, artworkRowsFromDerived]);

  const normalizeDesc = (d) => String(d || '').trim().toLowerCase();

  // Any material_description present among currently selected rows in the active view.
  // While non-empty, only rows matching one of these descriptions may be selected.
  const lockedDescriptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (selected[r.id]) set.add(normalizeDesc(r.material_description));
    });
    return set;
  }, [rows, selected]);

  const isRowDisabled = (row) => {
    if (lockedDescriptions.size === 0) return false;
    return !lockedDescriptions.has(normalizeDesc(row.material_description));
  };

  const toggleRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (row && isRowDisabled(row) && !selected[id]) return;
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = useMemo(
    () => rows.reduce((n, r) => n + (selected[r.id] ? 1 : 0), 0),
    [rows, selected]
  );
  const showClub = selectedCount >= 2;

  const handleClub = () => {
    const pickedIds = rows.filter((r) => selected[r.id]).map((r) => r.id);
    if (pickedIds.length < 2) return;
    setClubs((prev) => [
      ...prev,
      {
        id: `club-${Date.now()}`,
        rowIds: pickedIds,
        label: `Club ${prev.length + 1}`,
      },
    ]);
    // Clear selections on clubbed rows
    setSelected((prev) => {
      const next = { ...prev };
      pickedIds.forEach((id) => { delete next[id]; });
      return next;
    });
  };

  const toggleClub = (clubId) => {
    setSelectedClubs((prev) => ({ ...prev, [clubId]: !prev[clubId] }));
  };

  const selectedClubCount = useMemo(
    () => Object.values(selectedClubs).filter(Boolean).length,
    [selectedClubs]
  );
  const showUnclub = selectedClubCount >= 1;

  const handleUnclub = () => {
    const toRemove = new Set(
      Object.entries(selectedClubs).filter(([, v]) => v).map(([k]) => k)
    );
    if (toRemove.size === 0) return;
    setClubs((prev) =>
      prev
        .filter((c) => !toRemove.has(c.id))
        .map((c, i) => ({ ...c, label: `Club ${i + 1}` }))
    );
    setSelectedClubs((prev) => {
      const next = { ...prev };
      toRemove.forEach((id) => { delete next[id]; });
      return next;
    });
  };

  const [savingKey, setSavingKey] = useState(null);
  const [saveError, setSaveError] = useState('');
  // Per-row/club selection of which action the Action Button column should fire.
  // Default is 'save'; user can flip to 'send' via the dropdown arrow.
  const [actionSelections, setActionSelections] = useState({});
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const buildSavePayload = (rowIds) => rowIds.map((id) => {
    const entry = manualInputs[id] || {};
    const payload = { id };
    const writable = [
      'purchase_width',
      'purchase_length_qty',
      'gross_width_multiple',
      'purchase_qty_pcs',
      'purchase_weight_qty',
    ];
    writable.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(entry, field)) {
        const v = entry[field];
        payload[field] = v === '' ? null : v;
      }
    });
    return payload;
  });

  const handleSaveRow = async (saveCtx) => {
    const ipoId = ipo?.ipoId || ipo?.id;
    if (!ipoId) return;
    let rowIds = [];
    let key = '';
    if (saveCtx?.type === 'row') {
      rowIds = [saveCtx.rowId];
      key = `row:${saveCtx.rowId}`;
    } else if (saveCtx?.type === 'club') {
      const club = clubs.find((c) => c.id === saveCtx.clubId);
      rowIds = club?.rowIds || [];
      key = `club:${saveCtx.clubId}`;
    }
    if (!rowIds.length) return;
    setSavingKey(key);
    setSaveError('');
    try {
      await saveIPOMasterCNSRows(ipoId, buildSavePayload(rowIds));
    } catch (e) {
      setSaveError(e?.message || 'Failed to save.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSendToPurchase = (ctx) => { console.log('SEND TO PURCHASE', ctx); };

  const handleCheckStock = (ctx) => { console.log('CHECK STOCK', ctx); };

  const actionBtnStyle = {
    background: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const ACTION_OPTIONS = [
    { key: 'save', label: 'Save' },
    { key: 'send', label: 'Send to Purchase' },
  ];

  const actionKey = (ctx) => (ctx.type === 'club' ? `club:${ctx.clubId}` : `row:${ctx.rowId}`);

  // Close the dropdown on any click outside the action menu.
  useEffect(() => {
    if (!actionMenuOpen) return undefined;
    const handler = (e) => {
      if (!e.target.closest('[data-action-menu]')) setActionMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [actionMenuOpen]);

  const renderActionButton = (ctx) => {
    const key = actionKey(ctx);
    const selected = actionSelections[key] || 'save';
    const isOpen = actionMenuOpen === key;
    const isSavingThis = savingKey === key;
    const baseLabel = selected === 'send' ? 'SEND TO PURCHASE' : 'SAVE';
    const label = selected === 'save' && isSavingThis ? 'SAVING…' : baseLabel;
    const disabled = selected === 'save' && isSavingThis;
    return (
      <div data-action-menu style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => (selected === 'save' ? handleSaveRow(ctx) : handleSendToPurchase(ctx))}
          style={{
            ...actionBtnStyle,
            paddingRight: 28,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {label}
        </button>
        <button
          type="button"
          aria-label="Change action"
          onClick={() => setActionMenuOpen((prev) => (prev === key ? null : key))}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 22,
            background: 'rgba(0, 0, 0, 0.18)',
            border: 'none',
            color: '#ffffff',
            fontSize: 9,
            cursor: 'pointer',
            borderRadius: '0 4px 4px 0',
          }}
        >
          ▼
        </button>
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              zIndex: 50,
              minWidth: 160,
              overflow: 'hidden',
            }}
          >
            {ACTION_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setActionSelections((prev) => ({ ...prev, [key]: opt.key }));
                  setActionMenuOpen(null);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  background: selected === opt.key ? '#f3f4f6' : '#ffffff',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#111827',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };


  if (loading) {
    return <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: 24 }}>Loading…</FormCard>;
  }
  if (error) {
    return <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: 24, color: 'crimson' }}>{error}</FormCard>;
  }

  return (
    <div>
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {availableTabs.map((t) => (
            <Button
              key={t.key}
              type="button"
              variant={activeTab === t.key ? 'default' : 'outline'}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {shareError && (
            <span style={{ fontSize: 12, color: 'crimson' }}>{shareError}</span>
          )}
          {sharedToPurchase ? (
            <Button type="button" variant="outline" disabled>
              Shared to Purchase ✓
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleShareToPurchase}
              disabled={sharingToPurchase}
            >
              {sharingToPurchase ? 'Sharing…' : 'Share to Purchase'}
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'raw_material' && (
        <div
          style={{
            position: 'relative',
            marginLeft: 16,
            marginBottom: 12,
            paddingLeft: 16,
            borderLeft: '2px solid #f97316',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -2,
              top: -12,
              width: 16,
              height: 12,
              borderLeft: '2px solid #f97316',
              borderBottom: '2px solid #f97316',
              borderBottomLeftRadius: 8,
            }}
            aria-hidden="true"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>
              Category
            </span>
            {availableSubtabs.map((s) => {
              const active = rawSubtab === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setRawSubtab(s.key)}
                  style={{
                    background: active ? '#f97316' : '#ffffff',
                    color: active ? '#ffffff' : '#374151',
                    border: active ? '1px solid #f97316' : '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '3px 10px',
                    fontSize: 12,
                    lineHeight: 1.4,
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'packaging' ? (
        <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#6b7280' }}>In Progress</div>
        </FormCard>
      ) : activeTab === 'raw_material' && !SUBTAB_CONFIG[rawSubtab] ? (
        <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#6b7280' }}>In Progress</div>
        </FormCard>
      ) : totalRows === 0 ? (
        <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: 24 }}>
          <div>
            No IPC data has been saved for IPO <strong>{data?.ipo_code}</strong> yet.
            Open <strong>IPO</strong> from the sidebar tree, complete the wizard, and the rows will appear here.
          </div>
          {data?.diagnostics && (
            <details style={{ marginTop: 12, fontSize: 12, color: '#374151' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Diagnostics</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, background: '#f9fafb', padding: 8, borderRadius: 6 }}>
                {JSON.stringify(data.diagnostics, null, 2)}
              </pre>
            </details>
          )}
        </FormCard>
      ) : (
        <>
          {!isComplete && (
            <FormCard
              className="rounded-2xl"
              style={{
                padding: 12,
                marginBottom: 12,
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                color: '#78350f',
                fontSize: 13,
              }}
            >
              Some IPCs for <strong>{data?.ipo_code}</strong> are still in draft. The table below shows data entered so far; values will update as the remaining IPCs are completed.
            </FormCard>
          )}
          {saveError && (
            <FormCard
              className="rounded-2xl"
              style={{
                padding: 12,
                marginBottom: 12,
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                fontSize: 13,
              }}
            >
              {saveError}
            </FormCard>
          )}
          <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleClub}
            aria-hidden={!showClub}
            tabIndex={showClub ? 0 : -1}
            style={{
              position: 'absolute',
              top: 0,
              right: 24,
              background: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: showClub ? '0 -4px 10px rgba(249,115,22,0.25)' : 'none',
              cursor: 'pointer',
              transform: showClub ? 'translateY(-100%)' : 'translateY(0)',
              transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease 180ms',
              zIndex: 0,
              pointerEvents: showClub ? 'auto' : 'none',
            }}
          >
            CLUB ({selectedCount})
          </button>
          <button
            type="button"
            onClick={handleUnclub}
            aria-hidden={!showUnclub}
            tabIndex={showUnclub ? 0 : -1}
            style={{
              position: 'absolute',
              top: 0,
              right: 24,
              background: '#475569',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              boxShadow: showUnclub ? '0 -4px 10px rgba(71,85,105,0.3)' : 'none',
              cursor: 'pointer',
              transform: showUnclub ? 'translateY(-100%)' : 'translateY(0)',
              transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease 180ms',
              zIndex: 0,
              pointerEvents: showUnclub ? 'auto' : 'none',
            }}
          >
            UNCLUB ({selectedClubCount})
          </button>
          <FormCard
            className="rounded-2xl border-border bg-card"
            style={{
              padding: 0,
              position: 'relative',
              zIndex: 1,
              background: '#ffffff',
            }}
          >
          <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                {showSrNumber && (
                  <th style={{ ...stickyHeaderLeft(stickyLeft.sr, COL_WIDTHS.sr), padding: '8px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>SR#</th>
                )}
                {!ipcAfterSelect && (
                  <th style={{ ...stickyHeaderLeft(stickyLeft.leadingIpc, COL_WIDTHS.ipc), padding: '8px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>IPC#</th>
                )}
                <th style={{ ...stickyHeaderLeft(stickyLeft.select, COL_WIDTHS.select), padding: '8px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>Select</th>
                {ipcAfterSelect && (
                  <th style={{ ...stickyHeaderLeft(stickyLeft.trailingIpc, COL_WIDTHS.ipc), padding: '8px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>IPC#</th>
                )}
                {columns.map((c, idx) => (
                  <th
                    key={c.key}
                    style={{
                      ...(idx === 0
                        ? stickyHeaderLeft(stickyLeft.matDesc, COL_WIDTHS.matDesc)
                        : STICKY_HEADER_STYLE),
                      padding: '8px',
                      textAlign: 'center',
                      whiteSpace: 'normal',
                      wordBreak: 'normal',
                      overflowWrap: 'normal',
                      lineHeight: 1.2,
                      verticalAlign: 'bottom',
                      boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb',
                    }}
                  >
                    {formatHeader(c.header)}
                  </th>
                ))}
                <th style={{ ...STICKY_HEADER_STYLE, padding: '8px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>{formatHeader('Club / Single')}</th>
                <th style={{ ...STICKY_HEADER_STYLE, padding: '8px 4px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>Action Button</th>
                <th style={{ ...STICKY_HEADER_STYLE, padding: '8px 4px', textAlign: 'center', lineHeight: 1.2, verticalAlign: 'bottom', boxShadow: 'inset 0 -1px 0 #e5e7eb, inset -1px 0 0 #e5e7eb' }}>Check Stock</th>
              </tr>
            </thead>
            <tbody>
              {activeClubs.map((club) => {
                const uniqueIpcs = Array.from(new Set(club.resolvedRows.map((r) => r.ipc)));
                return (
                  <React.Fragment key={club.id}>
                    {club.resolvedRows.map((row, idx) => {
                      const isFirst = idx === 0;
                      const cellBase = {
                        padding: '8px',
                        borderBottom: '1px solid #fde2c3',
                        borderRight: '1px solid #fdba74',
                        textAlign: 'center',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        background: '#fff7ed',
                      };
                      const ipcCell = isFirst && (
                        <td
                          rowSpan={club.resolvedRows.length + 1}
                          style={{
                            padding: '8px',
                            fontWeight: 600,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            borderRight: '1px solid #fdba74',
                            borderBottom: '2px solid #f97316',
                            borderTop: '2px solid #f97316',
                            ...stickyBodyLeft(
                              ipcAfterSelect ? stickyLeft.trailingIpc : stickyLeft.leadingIpc,
                              COL_WIDTHS.ipc,
                              '#ffedd5',
                            ),
                          }}
                        >
                          {uniqueIpcs.map((ipc) => (
                            <div key={ipc} style={{ lineHeight: 1.4 }}>{ipc}</div>
                          ))}
                          <div
                            style={{
                              marginTop: 6,
                              paddingTop: 6,
                              borderTop: '1px dashed #f97316',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#9a3412',
                              letterSpacing: 0.5,
                            }}
                          >
                            ({club.label})
                          </div>
                        </td>
                      );
                      const selectCell = isFirst && (
                        <td
                          rowSpan={club.resolvedRows.length + 1}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            borderRight: '1px solid #fdba74',
                            borderBottom: '2px solid #f97316',
                            borderTop: '2px solid #f97316',
                            ...stickyBodyLeft(stickyLeft.select, COL_WIDTHS.select, '#ffedd5'),
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedClubs[club.id]}
                            onChange={() => toggleClub(club.id)}
                            aria-label={`Select ${club.label}`}
                          />
                        </td>
                      );
                      return (
                        <tr key={row.id}>
                          {showSrNumber && (
                            <td style={{ ...cellBase, textAlign: 'center', fontWeight: 600, ...stickyBodyLeft(stickyLeft.sr, COL_WIDTHS.sr, '#fff7ed') }}>
                              {serialMap.get(row.id) ?? ''}
                            </td>
                          )}
                          {!ipcAfterSelect && ipcCell}
                          {selectCell}
                          {ipcAfterSelect && ipcCell}
                          {(() => {
                            // isClub:false so aggregated columns render their per-row UI
                            // (e.g. ManualNumberCell input) — the summary row below uses
                            // isClub:true to show the rolled-up total.
                            const ctx = {
                              isClub: false,
                              clubRows: club.resolvedRows,
                              manualInputs,
                              setManualInput,
                              yarnLookup,
                            };
                            return columns.map((c, idx) => {
                              const isMatDesc = idx === 0;
                              return (
                                <td
                                  key={c.key}
                                  style={{
                                    ...cellBase,
                                    ...(isMatDesc
                                      ? stickyBodyLeft(stickyLeft.matDesc, COL_WIDTHS.matDesc, '#fff7ed')
                                      : { whiteSpace: 'nowrap' }),
                                  }}
                                >
                                  {c.render(row, ctx)}
                                </td>
                              );
                            });
                          })()}
                          {/* Club/Single, Action, Check Stock moved to summary row below */}
                        </tr>
                      );
                    })}
                    {(() => {
                      const summaryRow = club.resolvedRows[0];
                      const summaryCtx = {
                        isClub: true,
                        clubRows: club.resolvedRows,
                        manualInputs,
                        setManualInput,
                        yarnLookup,
                      };
                      const summaryCellStyle = {
                        padding: '8px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: '#ffedd5',
                        borderTop: '2px solid #f97316',
                        borderBottom: '2px solid #f97316',
                        borderRight: '1px solid #fdba74',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        fontWeight: 600,
                      };
                      return (
                        <tr key={`${club.id}-summary`}>
                          {showSrNumber && (
                            <td style={{ ...summaryCellStyle, ...stickyBodyLeft(stickyLeft.sr, COL_WIDTHS.sr, '#ffedd5') }} />
                          )}
                          {/* IPC# and Select cells already covered by rowSpan from the first data row */}
                          {columns.map((c, idx) => {
                            const isMatDesc = idx === 0;
                            const stickyOverride = isMatDesc
                              ? stickyBodyLeft(stickyLeft.matDesc, COL_WIDTHS.matDesc, '#ffedd5')
                              : { whiteSpace: 'nowrap' };
                            if (c.aggregatedInClub) {
                              return (
                                <td key={c.key} style={{ ...summaryCellStyle, ...stickyOverride }}>
                                  {c.render(summaryRow, summaryCtx)}
                                </td>
                              );
                            }
                            return <td key={c.key} style={{ ...summaryCellStyle, ...stickyOverride }} />;
                          })}
                          <td style={summaryCellStyle}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: 999,
                                background: '#f97316',
                                color: '#ffffff',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                              }}
                            >
                              CLUB
                            </span>
                          </td>
                          <td style={{ ...summaryCellStyle, padding: '6px 4px' }}>
                            {renderActionButton({ type: 'club', clubId: club.id })}
                          </td>
                          <td style={{ ...summaryCellStyle, padding: '6px 4px' }}>
                            <button
                              type="button"
                              style={actionBtnStyle}
                              onClick={() => handleCheckStock({ type: 'club', clubId: club.id })}
                            >
                              CHECK
                            </button>
                          </td>
                        </tr>
                      );
                    })()}
                  </React.Fragment>
                );
              })}

              {groupedRows.length === 0 && activeClubs.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                    No rows in this category.
                    {rawSubtab === 'yarn' && (
                      <pre style={{ textAlign: 'left', marginTop: 12, fontSize: 11, background: '#f9fafb', padding: 8, borderRadius: 4, color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(yarnDebug, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ) : groupedRows.map((row) => {
                const divider = row._lastOfIpc ? '2px solid #9ca3af' : '1px solid #f1f5f9';
                const disabled = isRowDisabled(row);
                const cellBase = {
                  padding: '8px',
                  borderBottom: divider,
                  borderRight: '1px solid #e5e7eb',
                  textAlign: 'center',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  color: disabled ? '#9ca3af' : undefined,
                  background: disabled ? '#f9fafb' : undefined,
                };
                const ipcCell = row._firstOfIpc && (
                  <td
                    rowSpan={row._ipcRowSpan}
                    style={{
                      padding: '8px',
                      fontWeight: 600,
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      borderRight: '1px solid #e5e7eb',
                      borderBottom: '2px solid #9ca3af',
                      ...stickyBodyLeft(
                        ipcAfterSelect ? stickyLeft.trailingIpc : stickyLeft.leadingIpc,
                        COL_WIDTHS.ipc,
                        '#f9fafb',
                      ),
                    }}
                  >
                    {row.ipc}
                  </td>
                );
                const selectCell = (
                  <td
                    style={{
                      ...cellBase,
                      textAlign: 'center',
                      ...stickyBodyLeft(stickyLeft.select, COL_WIDTHS.select, cellBase.background || '#ffffff'),
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected[row.id]}
                      disabled={disabled}
                      onChange={() => toggleRow(row.id)}
                      style={disabled ? { cursor: 'not-allowed', opacity: 0.5 } : undefined}
                    />
                  </td>
                );
                return (
                  <tr key={row.id}>
                    {showSrNumber && (
                      <td style={{ ...cellBase, textAlign: 'center', fontWeight: 600, ...stickyBodyLeft(stickyLeft.sr, COL_WIDTHS.sr, cellBase.background || '#ffffff') }}>
                        {serialMap.get(row.id) ?? ''}
                      </td>
                    )}
                    {!ipcAfterSelect && ipcCell}
                    {selectCell}
                    {ipcAfterSelect && ipcCell}
                    {(() => {
                      const ctx = {
                        isClub: false,
                        clubRows: [row],
                        manualInputs,
                        setManualInput,
                        yarnLookup,
                      };
                      return columns.map((c, idx) => (
                        <td
                          key={c.key}
                          style={{
                            ...cellBase,
                            ...(idx === 0
                              ? stickyBodyLeft(stickyLeft.matDesc, COL_WIDTHS.matDesc, cellBase.background || '#ffffff')
                              : { whiteSpace: 'nowrap' }),
                          }}
                        >
                          {c.render(row, ctx)}
                        </td>
                      ));
                    })()}
                    <td style={{ ...cellBase, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 999,
                          background: '#e5e7eb',
                          color: '#374151',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        SINGLE
                      </span>
                    </td>
                    <td style={{ ...cellBase, padding: '6px 4px', textAlign: 'center' }}>
                      {renderActionButton({ type: 'row', rowId: row.id })}
                    </td>
                    <td style={{ ...cellBase, padding: '6px 4px', textAlign: 'center' }}>
                      <button
                        type="button"
                        style={actionBtnStyle}
                        onClick={() => handleCheckStock({ type: 'row', rowId: row.id })}
                      >
                        CHECK
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </FormCard>
          </div>
        </>
      )}
    </div>
  );
};

export default IPOMasterCNS;
