import SearchableDropdown from './SearchableDropdown';
import UnitDropdown from './UnitDropdown';
import { PACKAGING_APPROVAL_OPTIONS } from '../data/approvalOptions';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import { cn } from '@/lib/utils';

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  const v = String(value).trim();
  return v ? [v] : [];
};

const extractNumbers = (value) => {
  if (!value) return [];
  const matches = String(value).match(/\d+(\.\d+)?/g);
  return matches || [];
};

const parseTripletDimensions = (value) => {
  const nums = extractNumbers(value);
  return {
    length: nums[0] || '',
    width: nums[1] || '',
    height: nums[2] || '',
  };
};

const CARTON_PLY_OPTIONS = ['3 Ply', '5 Ply', '7 Ply', '9 Ply'];
const SHIPPING_MARK_TYPE_OPTIONS = [
  'Adhesive Sticker (on packaging/hang tag)',
  'Pre-Printed on Carton',
  'Pre-Printed Barcode Area',
];
const SHIPPING_MARK_MATERIAL_OPTIONS = [
  'Thermal Transfer Paper',
  'Direct Thermal Paper',
  'White Matte Label Stock',
  'Synthetic',
];
const SHIPPING_MARK_TESTING_OPTIONS = [
  'Colour Fastness (Wash/Rubbing)',
  'Shrinkage',
  'Needle Detection (metallic thread)',
  'Barcode Verification Report (Grade A/B)',
  'Scan Rate Audit (100% POS)',
];
const SHIPPING_MARK_QUALITY_OPTIONS = [
  'Print Contrast Ratio',
  'Edge Definition',
  'Minimum Grade A/B Check',
];
const SHIPPING_MARK_BARCODE_OPTIONS = [
  'UPC-A (12 digit)',
  'EAN-13 (13 digit)',
  'Code 128',
  'ITF-14 (carton)',
];
const SHIPPING_MARK_PRINT_METHOD_OPTIONS = [
  'Thermal Transfer',
  'Direct Thermal',
  'Laser',
  'Pre-Printed',
];
const SHIPPING_MARK_VARIABLE_DATA_OPTIONS = [
  'SKU',
  'Size',
  'Color',
  'Price',
  'Sequential Number',
];
const SHIPPING_MARK_GUMMING_OPTIONS = [
  'Removable (peel cleanly)',
  'Permanent (shipping carton)',
];

const getPoQtyAndImageForIpc = (skus, ipc) => {
  if (!ipc || !Array.isArray(skus)) return { poQty: '', imagePreview: null };
  const isSub = /\/SP-?\d+$/i.test(ipc);
  const baseIpc = (ipc || '').replace(/\/SP-?\d+$/i, '');
  const spNum = isSub ? parseInt(ipc.replace(/.*\/SP-?(\d+)$/i, '$1'), 10) : 0;
  for (const sku of skus) {
    const skuBase = sku.ipcCode?.replace(/\/SP-?\d+$/i, '') || sku.ipcCode || '';
    if (skuBase !== baseIpc) continue;
    if (!isSub) return { poQty: sku.poQty ?? '', imagePreview: sku.imagePreview ?? null };
    const sub = sku.subproducts?.[spNum - 1];
    return sub ? { poQty: sub.poQty ?? '', imagePreview: sub.imagePreview ?? null } : { poQty: '', imagePreview: null };
  }
  return { poQty: '', imagePreview: null };
};

const PackagingMaterialTypeFields = ({ material, onChange, errorKeyPrefix, errors, materialIndex = 0, casepackQty, productSelection, skus }) => {
  if (!material || typeof material !== 'object') return null;
  const safeIndex = Number.isFinite(materialIndex) ? materialIndex : 0;
  const typeFieldWidth = 280;
  const selectedIpcs = Array.isArray(productSelection) ? productSelection : (productSelection ? [productSelection] : []);
  const casepack = typeof casepackQty === 'number' ? casepackQty : parseFloat(String(casepackQty || '').trim()) || 0;
  const polybagNum = parseFloat(String(material.polybagBalePolybagCount || '').trim()) || 0;
  const innerQty = polybagNum > 0 ? casepack / polybagNum : 0;
  const assdByIpc = material.polybagBaleAssdQtyByIpc && typeof material.polybagBaleAssdQtyByIpc === 'object' ? material.polybagBaleAssdQtyByIpc : {};
  return (
  <>
    {material.packagingMaterialType && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6">
                  
                  {/* Specific Fields for CARTON BOX - Completely new section */}
                  {material.packagingMaterialType === 'CARTON BOX' && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cartonBoxType || ''}
                          onChange={(selectedValue) => onChange('cartonBoxType', selectedValue)}
                          options={['Die-Cut', 'FOL (Full Overlap)', 'HSC (Half Slotted)', 'Inner Carton', 'Master Carton', 'RSC (Regular Slotted Container)', 'Telescope']}
                          placeholder="Select or type Type"
                          className={errors?.[`${errorKeyPrefix}_cartonBoxType`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2"># OF PLYS <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cartonBoxNoOfPlys || ''}
                          onChange={(selectedValue) => onChange('cartonBoxNoOfPlys', selectedValue)}
                          options={CARTON_PLY_OPTIONS}
                          placeholder="Select or type # of Plys"
                          className={errors?.[`${errorKeyPrefix}_cartonBoxNoOfPlys`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxNoOfPlys`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxNoOfPlys`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">BOARD GRADE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cartonBoxBoardGrade || ''}
                          onChange={(selectedValue) => onChange('cartonBoxBoardGrade', selectedValue)}
                          options={['Duplex', 'Kraft (Brown)', 'Test Liner', 'Virgin Kraft', 'White Top']}
                          placeholder="Select or type Board Grade"
                          className={errors?.[`${errorKeyPrefix}_cartonBoxBoardGrade`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxBoardGrade`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxBoardGrade`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">JOINT TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cartonBoxJointType || ''}
                          onChange={(selectedValue) => onChange('cartonBoxJointType', selectedValue)}
                          options={['Glued/Binded', 'Staple/Stitched', 'Taped']}
                          placeholder="Select or type Joint Type"
                          className={errors?.[`${errorKeyPrefix}_cartonBoxJointType`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxJointType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxJointType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">BURSTING STRENGTH <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.cartonBoxBurstingStrength || ''}
                          onChange={(e) => onChange('cartonBoxBurstingStrength', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxBurstingStrength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="e.g., 175 lbs, 200 lbs, 275 lbs"
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxBurstingStrength`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxBurstingStrength`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">STIFFENER REQUIRED <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cartonBoxStiffenerRequired || ''}
                          onChange={(selectedValue) => onChange('cartonBoxStiffenerRequired', selectedValue)}
                          options={['YES', 'NO']}
                          placeholder="Select YES or NO"
                          className={errors?.[`${errorKeyPrefix}_cartonBoxStiffenerRequired`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cartonBoxStiffenerRequired`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxStiffenerRequired`]}</span>}
                      </div>
                      {material.cartonBoxStiffenerRequired === 'YES' && (
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2"># OF PLYS <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.cartonBoxStiffenerNoOfPlys || ''}
                            onChange={(selectedValue) => onChange('cartonBoxStiffenerNoOfPlys', selectedValue)}
                            options={CARTON_PLY_OPTIONS}
                            placeholder="Select or type # of Plys"
                            className={errors?.[`${errorKeyPrefix}_cartonBoxStiffenerNoOfPlys`] ? 'border-red-600' : ''}
                          />
                          {errors?.[`${errorKeyPrefix}_cartonBoxStiffenerNoOfPlys`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxStiffenerNoOfPlys`]}</span>}
                        </div>
                      )}
                      {material.cartonBoxStiffenerRequired === 'YES' && (
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2">QUANTITY <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={material.cartonBoxQuantity || ''}
                            onChange={(e) => onChange('cartonBoxQuantity', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="Pieces"
                          />
                          {errors?.[`${errorKeyPrefix}_cartonBoxQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxQuantity`]}</span>}
                        </div>
                      )}
                      {/* DIMENSIONS for CARTON BOX */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                          DIMENSIONS (L x W x H)
                        </label>
                        {(() => {
                          const legacy = parseTripletDimensions(material.cartonBoxDimensions);
                          const lengthVal = material.cartonBoxLength || legacy.length;
                          const widthVal = material.cartonBoxWidth || legacy.width;
                          const heightVal = material.cartonBoxHeight || legacy.height;
                          const isStiffenerYes = material.cartonBoxStiffenerRequired === 'YES';
                          return (
                            <div className="flex items-end gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">L</label>
                                  <input
                                    type="text"
                                    value={lengthVal}
                                    onChange={(e) => onChange('cartonBoxLength', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Length"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">W</label>
                                  <input
                                    type="text"
                                    value={widthVal}
                                    onChange={(e) => onChange('cartonBoxWidth', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Width"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">H</label>
                                  <input
                                    type="text"
                                    value={heightVal}
                                    onChange={(e) => onChange('cartonBoxHeight', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Height"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_cartonBoxDimensionsUnit`] ? 'text-red-600' : 'text-gray-600'}`}>
                                    UNIT <span className="text-red-500">*</span>
                                  </label>
                                  <UnitDropdown
                                    value={material.cartonBoxDimensionsUnit ?? ''}
                                    onChange={(v) => onChange('cartonBoxDimensionsUnit', v)}
                                    placeholder="Select Unit"
                                    className={`border-2 rounded-lg transition-all bg-white focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxDimensionsUnit`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                                    style={{ height: '44px', width: '100%' }}
                                  />
                                  {errors?.[`${errorKeyPrefix}_cartonBoxDimensionsUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxDimensionsUnit`]}</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      {material.cartonBoxStiffenerRequired === 'YES' && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                          <label className="text-sm font-semibold text-gray-700 mb-2">STIFFENER SIZE (L x W) <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex flex-col">
                              <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerLength`] ? 'text-red-600' : 'text-gray-600'}`}>
                                L <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={material.cartonBoxStiffenerLength || ''}
                                onChange={(e) => onChange('cartonBoxStiffenerLength', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerLength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Stiffener Length"
                              />
                              {errors?.[`${errorKeyPrefix}_cartonBoxStiffenerLength`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxStiffenerLength`]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerWidth`] ? 'text-red-600' : 'text-gray-600'}`}>
                                W <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={material.cartonBoxStiffenerWidth || ''}
                                onChange={(e) => onChange('cartonBoxStiffenerWidth', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Stiffener Width"
                              />
                              {errors?.[`${errorKeyPrefix}_cartonBoxStiffenerWidth`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxStiffenerWidth`]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerUnit`] ? 'text-red-600' : 'text-gray-600'}`}>
                                UNIT <span className="text-red-500">*</span>
                              </label>
                              <UnitDropdown
                                value={material.cartonBoxStiffenerUnit ?? ''}
                                onChange={(v) => onChange('cartonBoxStiffenerUnit', v)}
                                placeholder="Select Unit"
                                className={`border-2 rounded-lg transition-all bg-white focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxStiffenerUnit`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                                style={{ height: '44px', width: '100%' }}
                              />
                              {errors?.[`${errorKeyPrefix}_cartonBoxStiffenerUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxStiffenerUnit`]}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* TESTING REQUIREMENTS - Multi-select with chips (SAME AS FIBER/FOAM) */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative' }}>
                          <div
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus-within:outline-none ${errors?.[`${errorKeyPrefix}_cartonBoxTestingRequirements`] ? 'border-red-600' : 'border-[#e5e7eb] focus-within:border-indigo-500'}`}
                            style={{ 
                              padding: '8px 12px',
                              minHeight: '44px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              alignItems: 'center',
                              cursor: 'text'
                            }}
                          >
                            {/* Selected chips */}
                            {(Array.isArray(material.cartonBoxTestingRequirements) ? material.cartonBoxTestingRequirements : []).map((req, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  border: '1px solid #c7d2fe'
                                }}
                              >
                                {req}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = Array.isArray(material.cartonBoxTestingRequirements) ? material.cartonBoxTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    onChange('cartonBoxTestingRequirements', updated);
                                  }}
                                  style={{
                                    marginLeft: '4px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: '#4338ca',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    lineHeight: '1',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {/* Dropdown for selecting new options */}
                            <div 
                              id={`carton-box-testing-wrapper-${safeIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                              <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Bursting Strength Test', 'ECT Test', 'Drop Test', 'Compression Test'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.cartonBoxTestingRequirements) ? material.cartonBoxTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      onChange('cartonBoxTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Bursting Strength Test', 'Compression Test', 'Drop Test', 'ECT Test']}
                                placeholder={(Array.isArray(material.cartonBoxTestingRequirements) && material.cartonBoxTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
                                className="border-0 outline-none"
                                style={{ 
                                  padding: '4px 0', 
                                  height: 'auto', 
                                  minHeight: '32px',
                                  backgroundColor: 'transparent', 
                                  boxShadow: 'none',
                                  border: 'none',
                                  borderWidth: '0',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  const input = e.target;
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#667eea';
                                    container.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                  }
                                  const handleKeyDown = (keyEvent) => {
                                    if (keyEvent.key === 'Enter' && input.value && input.value.trim()) {
                                      keyEvent.preventDefault();
                                      keyEvent.stopPropagation();
                                      const newValue = input.value.trim();
                                      const current = Array.isArray(material.cartonBoxTestingRequirements) ? material.cartonBoxTestingRequirements : [];
                                      const options = ['Bursting Strength Test', 'ECT Test', 'Drop Test', 'Compression Test'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          onChange('cartonBoxTestingRequirements', updated);
                                        }
                                        input.value = '';
                                        input.blur();
                                      }
                                    }
                                  };
                                  input.addEventListener('keydown', handleKeyDown);
                                  input._enterHandler = handleKeyDown;
                                }}
                                onBlur={(e) => {
                                  const input = e.target;
                                  if (input._enterHandler) {
                                    input.removeEventListener('keydown', input._enterHandler);
                                    input._enterHandler = null;
                                  }
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#e5e7eb';
                                    container.style.boxShadow = 'none';
                                  }
                                  if (input.value && input.value.trim()) {
                                    const typedValue = input.value.trim();
                                    const options = ['Bursting Strength Test', 'ECT Test', 'Drop Test', 'Compression Test'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.cartonBoxTestingRequirements) ? material.cartonBoxTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        onChange('cartonBoxTestingRequirements', updated);
                                      }
                                    }
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.[`${errorKeyPrefix}_cartonBoxTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cartonBoxTestingRequirements`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for CORNER PROTECTORS */}
                  {material.packagingMaterialType === 'CORNER PROTECTORS' && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cornerProtectorType || ''}
                          onChange={(selectedValue) => onChange('cornerProtectorType', selectedValue)}
                          options={['Edge Guard', 'L-Shape', 'U-Shape', 'Wrap-Around']}
                          placeholder="Select or type Type"
                          className={errors?.[`${errorKeyPrefix}_cornerProtectorType`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cornerProtectorType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cornerProtectorMaterial || ''}
                          onChange={(selectedValue) => onChange('cornerProtectorMaterial', selectedValue)}
                          options={['Cardboard', 'Corrugated Board', 'Foam (EPE/EVA)', 'Plastic (PP/PE)', 'Wood']}
                          placeholder="Select or type Material"
                          className={errors?.[`${errorKeyPrefix}_cornerProtectorMaterial`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cornerProtectorMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">LEG LENGTH <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_cornerProtectorLegLength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.cornerProtectorLegLength || ''}
                            onChange={(e) => onChange('cornerProtectorLegLength', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="25"
                          />
                          <UnitDropdown
                            value={material.cornerProtectorLegLengthUnit ?? ''}
                            onChange={(v) => onChange('cornerProtectorLegLengthUnit', v)}
                          />
                        </div>
                        {errors?.[`${errorKeyPrefix}_cornerProtectorLegLength`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorLegLength`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">THICKNESS <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_cornerProtectorThickness`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.cornerProtectorThickness || ''}
                            onChange={(e) => onChange('cornerProtectorThickness', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="3"
                          />
                          <UnitDropdown
                            value={material.cornerProtectorThicknessUnit ?? ''}
                            onChange={(v) => onChange('cornerProtectorThicknessUnit', v)}
                          />
                        </div>
                        {errors?.[`${errorKeyPrefix}_cornerProtectorThickness`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorThickness`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">HEIGHT/LENGTH <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_cornerProtectorHeightLength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.cornerProtectorHeightLength || ''}
                            onChange={(e) => onChange('cornerProtectorHeightLength', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="50"
                          />
                          <UnitDropdown
                            value={material.cornerProtectorHeightLengthUnit ?? ''}
                            onChange={(v) => onChange('cornerProtectorHeightLengthUnit', v)}
                          />
                        </div>
                        {errors?.[`${errorKeyPrefix}_cornerProtectorHeightLength`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorHeightLength`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">LOAD CAPACITY <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cornerProtectorLoadCapacity || ''}
                          onChange={(selectedValue) => onChange('cornerProtectorLoadCapacity', selectedValue)}
                          options={['Heavy (>25kg)', 'Light (<10kg)', 'Medium (10-25kg)']}
                          placeholder="Select or type Load Capacity"
                          className={errors?.[`${errorKeyPrefix}_cornerProtectorLoadCapacity`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cornerProtectorLoadCapacity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorLoadCapacity`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.cornerProtectorColor || ''}
                          onChange={(selectedValue) => onChange('cornerProtectorColor', selectedValue)}
                          options={['Black', 'Brown (Kraft)', 'Custom', 'White']}
                          placeholder="Select or type Color"
                          className={errors?.[`${errorKeyPrefix}_cornerProtectorColor`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_cornerProtectorColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.cornerProtectorQuantity || ''}
                          onChange={(e) => onChange('cornerProtectorQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_cornerProtectorQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Pcs"
                        />
                        {errors?.[`${errorKeyPrefix}_cornerProtectorQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_cornerProtectorQuantity`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for EDGE PROTECTORS */}
                  {material.packagingMaterialType === 'EDGE PROTECTORS' && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorType || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorType', selectedValue)}
                          options={['Flat Strip', 'L-Board', 'U-Channel', 'V-Board', 'Wrap-Around']}
                          placeholder="Select or type Type"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorType`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorMaterial || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorMaterial', selectedValue)}
                          options={['Corrugated', 'Laminated Board', 'Metal (Aluminum)', 'Plastic', 'Solid Board']}
                          placeholder="Select or type Material"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorMaterial`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">WING SIZE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorWingSize || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorWingSize', selectedValue)}
                          options={['30x30mm', '35x35mm', '40x40mm', '50x35mm (unequal)', '50x50mm']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorWingSize`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorWingSize`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorWingSize`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">THICKNESS <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorThickness || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorThickness', selectedValue)}
                          options={['2mm', '3mm', '4mm', '5mm', '6mm']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorThickness`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorThickness`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorThickness`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">LENGTH <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorLength || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorLength', selectedValue)}
                          options={['1200mm (48")', '2400mm', '600mm (24")', '900mm (36")', 'Custom']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorLength`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorLength`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorLength`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">PLY/LAYERS <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorPlyLayers || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorPlyLayers', selectedValue)}
                          options={['Multi-Ply (laminated)', 'Single Ply']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorPlyLayers`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorPlyLayers`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorPlyLayers`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.edgeProtectorColor || ''}
                          onChange={(selectedValue) => onChange('edgeProtectorColor', selectedValue)}
                          options={['Brown', 'Custom Print', 'White']}
                          placeholder="Select or type Color"
                          className={errors?.[`${errorKeyPrefix}_edgeProtectorColor`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_edgeProtectorColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_edgeProtectorColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.edgeProtectorQuantity || ''}
                          onChange={(e) => onChange('edgeProtectorQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_edgeProtectorQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="PCS"
                        />
                      </div>
                    </>
                  )}

                  {/* Specific Fields for FOAM INSERT */}
                  {material.packagingMaterialType === 'FOAM INSERT' && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.foamInsertType || ''}
                          onChange={(selectedValue) => onChange('foamInsertType', selectedValue)}
                          options={['Convoluted (Egg Crate)', 'Corner Block', 'Custom Molded', 'Die-Cut Insert', 'Sheet']}
                          placeholder="Select or type Type"
                          className={errors?.[`${errorKeyPrefix}_foamInsertType`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.foamInsertMaterial || ''}
                          onChange={(selectedValue) => onChange('foamInsertMaterial', selectedValue)}
                          options={['EPE (Polyethylene)', 'EPS (Styrofoam)', 'EVA', 'PU (Polyurethane)', 'XPE (Cross-linked PE)']}
                          placeholder="Select or type Material"
                          className={errors?.[`${errorKeyPrefix}_foamInsertMaterial`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">DENSITY <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.foamInsertDensity || ''}
                          onChange={(selectedValue) => onChange('foamInsertDensity', selectedValue)}
                          options={['18 kg/m³', '20 kg/m³', '25 kg/m³', '30 kg/m³', '35 kg/m³', '45 kg/m³']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_foamInsertDensity`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertDensity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertDensity`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">THICKNESS <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.foamInsertThickness || ''}
                          onChange={(selectedValue) => onChange('foamInsertThickness', selectedValue)}
                          options={['10mm', '15mm', '20mm', '25mm', '30mm', '5mm', '50mm']}
                          placeholder="Select or type"
                          className={errors?.[`${errorKeyPrefix}_foamInsertThickness`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertThickness`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertThickness`]}</span>}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <label className="text-sm font-semibold text-gray-700 mb-2">DIMENSIONS</label>
                        {(() => {
                          const legacy = parseTripletDimensions(material.foamInsertDimensions);
                          const lengthVal = material.foamInsertLength || legacy.length;
                          const widthVal = material.foamInsertWidth || legacy.width;
                          const heightVal = material.foamInsertHeight || legacy.height;
                          return (
                            <div className="flex items-end gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">L</label>
                                  <input
                                    type="text"
                                    value={lengthVal}
                                    onChange={(e) => onChange('foamInsertLength', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Length"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">W</label>
                                  <input
                                    type="text"
                                    value={widthVal}
                                    onChange={(e) => onChange('foamInsertWidth', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Width"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs text-gray-600 mb-1">H</label>
                                  <input
                                    type="text"
                                    value={heightVal}
                                    onChange={(e) => onChange('foamInsertHeight', e.target.value)}
                                    className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                    style={{ padding: '10px 14px', height: '44px' }}
                                    placeholder="Height"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">UNIT</label>
                                <UnitDropdown
                                  value={material.foamInsertDimensionsUnit ?? ''}
                                  onChange={(v) => onChange('foamInsertDimensionsUnit', v)}
                                  className="border-2 rounded-lg transition-all bg-white focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                  style={{ height: '44px', width: '120px' }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.foamInsertColor || ''}
                          onChange={(selectedValue) => onChange('foamInsertColor', selectedValue)}
                          options={['Black', 'Blue', 'Custom', 'Pink (Anti-Static)', 'White']}
                          placeholder="Select or type Color"
                          className={errors?.[`${errorKeyPrefix}_foamInsertColor`] ? 'border-red-600' : ''}
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.foamInsertQuantity || ''}
                          onChange={(e) => onChange('foamInsertQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_foamInsertQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="PCS"
                        />
                        {errors?.[`${errorKeyPrefix}_foamInsertQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_foamInsertQuantity`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for PALLET STRAP */}
                  {material.packagingMaterialType === 'PALLET STRAP' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapType || ''}
                          onChange={(selectedValue) => onChange('palletStrapType', selectedValue)}
                          options={['Composite (Woven)', 'PET Strapping', 'PP Strapping', 'Steel Strapping']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapApplication`] ? 'text-red-600' : 'text-gray-700'}`}>APPLICATION <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapApplication || ''}
                          onChange={(selectedValue) => onChange('palletStrapApplication', selectedValue)}
                          options={['Automatic Machine', 'Manual (Hand Tool)', 'Semi-Auto']}
                          placeholder="Select or type Application"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapApplication`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapApplication`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapApplication`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapWidth`] ? 'text-red-600' : 'text-gray-700'}`}>WIDTH <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapWidth || ''}
                          onChange={(selectedValue) => onChange('palletStrapWidth', selectedValue)}
                          options={['12mm', '15mm', '16mm', '19mm', '25mm', '32mm', '9mm']}
                          placeholder="Select or type Width"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapWidth`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapWidth`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapSealType`] ? 'text-red-600' : 'text-gray-700'}`}>SEAL TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapSealType || ''}
                          onChange={(selectedValue) => onChange('palletStrapSealType', selectedValue)}
                          options={['Buckle', 'Friction Weld', 'Heat Seal', 'Metal Seals']}
                          placeholder="Select or type Seal Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapSealType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapSealType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapSealType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapSealSize`] ? 'text-red-600' : 'text-gray-700'}`}>SEAL SIZE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapSealSize || ''}
                          onChange={(selectedValue) => onChange('palletStrapSealSize', selectedValue)}
                          options={['12mm', '13mm', '15mm', '16mm', '19mm']}
                          placeholder="Select or type Seal Size"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapSealSize`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapSealSize`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapSealSize`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapColor`] ? 'text-red-600' : 'text-gray-700'}`}>COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.palletStrapColor || ''}
                          onChange={(selectedValue) => onChange('palletStrapColor', selectedValue)}
                          options={['Black', 'Blue', 'Custom', 'Green', 'White', 'Yellow']}
                          placeholder="Select or type Color"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapColor`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_palletStrapQuantity`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.palletStrapQuantity || ''}
                          onChange={(e) => onChange('palletStrapQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_palletStrapQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="METER"
                        />
                        {errors?.[`${errorKeyPrefix}_palletStrapQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_palletStrapQuantity`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for POLYBAG~Bale */}
                  {material.packagingMaterialType === 'POLYBAG~Bale' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBalePackagingType`] ? 'text-red-600' : 'text-gray-700'}`}>PACKAGING TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagBalePackagingType || ''}
                          onChange={(selectedValue) => onChange('polybagBalePackagingType', selectedValue)}
                          options={['STANDARD', 'INNER~CASEAPACK', 'PC']}
                          placeholder="Select or type Packaging Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBalePackagingType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBalePackagingType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBalePackagingType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleInnerCasepack`] ? 'text-red-600' : 'text-gray-700'}`}>INNER CASEPACK <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={material.polybagBaleInnerCasepack || ''}
                          onChange={(e) => onChange('polybagBaleInnerCasepack', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleInnerCasepack`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Numeric"
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBaleInnerCasepack`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleInnerCasepack`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagBaleType || ''}
                          onChange={(selectedValue) => onChange('polybagBaleType', selectedValue)}
                          options={['Bale Wrap (for shipping bales)', 'Pallet Wrap', 'Polysheet (Flat)', 'Shrink Film', 'Stretch Film']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBaleType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagBaleMaterial || ''}
                          onChange={(selectedValue) => onChange('polybagBaleMaterial', selectedValue)}
                          options={['HDPE', 'LDPE', 'LLDPE (Stretch)', 'PVC (Shrink)', 'Recycled PE']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBaleMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleGaugeGsm`] ? 'text-red-600' : 'text-gray-700'}`}>GAUGE/GSM <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.polybagBaleGaugeGsm || ''}
                          onChange={(e) => onChange('polybagBaleGaugeGsm', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleGaugeGsm`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="e.g., 150, 200, 300 gauge or GSM"
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBaleGaugeGsm`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleGaugeGsm`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleRollWidth`] || errors?.[`${errorKeyPrefix}_polybagBaleRollWidthUnit`] ? 'text-red-600' : 'text-gray-700'}`}>ROLL WIDTH <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_polybagBaleRollWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.polybagBaleRollWidth || ''}
                            onChange={(e) => onChange('polybagBaleRollWidth', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="36"
                          />
                          <UnitDropdown
                            value={material.polybagBaleRollWidthUnit ?? ''}
                            onChange={(v) => onChange('polybagBaleRollWidthUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_polybagBaleRollWidth`] || errors?.[`${errorKeyPrefix}_polybagBaleRollWidthUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleRollWidth`] || errors[`${errorKeyPrefix}_polybagBaleRollWidthUnit`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleColour`] ? 'text-red-600' : 'text-gray-700'}`}>COLOUR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagBaleColour || ''}
                          onChange={(selectedValue) => onChange('polybagBaleColour', selectedValue)}
                          options={['Black', 'Clear/Transparent', 'Tinted (Blue)', 'Tinted (Green)', 'White']}
                          placeholder="Select or type Colour"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleColour`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagBaleColour`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleColour`]}</span>}
                      </div>
                      {/* TESTING REQUIREMENTS - Multi-select with chips (SAME AS CARTON BOX) */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleTestingRequirements`] ? 'text-red-600' : 'text-gray-700'}`}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative' }}>
                          <div
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus-within:border-indigo-500 focus-within:outline-none ${errors?.[`${errorKeyPrefix}_polybagBaleTestingRequirements`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ 
                              padding: '8px 12px',
                              minHeight: '44px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              alignItems: 'center',
                              cursor: 'text'
                            }}
                          >
                            {/* Selected chips */}
                            {(Array.isArray(material.polybagBaleTestingRequirements) ? material.polybagBaleTestingRequirements : []).map((req, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  border: '1px solid #c7d2fe'
                                }}
                              >
                                {req}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = Array.isArray(material.polybagBaleTestingRequirements) ? material.polybagBaleTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    onChange('polybagBaleTestingRequirements', updated);
                                  }}
                                  style={{
                                    marginLeft: '4px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: '#4338ca',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    lineHeight: '1',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {/* Dropdown for selecting new options */}
                            <div 
                              id={`polybag-bale-testing-wrapper-${safeIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                              <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Tear Strength', 'Puncture Resistance', 'Stretch %'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.polybagBaleTestingRequirements) ? material.polybagBaleTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      onChange('polybagBaleTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Puncture Resistance', 'Stretch %', 'Tear Strength']}
                                placeholder={(Array.isArray(material.polybagBaleTestingRequirements) && material.polybagBaleTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
                                className="border-0 outline-none"
                                style={{ 
                                  padding: '4px 0', 
                                  height: 'auto', 
                                  minHeight: '32px',
                                  backgroundColor: 'transparent', 
                                  boxShadow: 'none',
                                  border: 'none',
                                  borderWidth: '0',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  const input = e.target;
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#667eea';
                                    container.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                  }
                                  const handleKeyDown = (keyEvent) => {
                                    if (keyEvent.key === 'Enter' && input.value && input.value.trim()) {
                                      keyEvent.preventDefault();
                                      keyEvent.stopPropagation();
                                      const newValue = input.value.trim();
                                      const current = Array.isArray(material.polybagBaleTestingRequirements) ? material.polybagBaleTestingRequirements : [];
                                      const options = ['Tear Strength', 'Puncture Resistance', 'Stretch %'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          onChange('polybagBaleTestingRequirements', updated);
                                        }
                                        input.value = '';
                                        input.blur();
                                      }
                                    }
                                  };
                                  input.addEventListener('keydown', handleKeyDown);
                                  input._enterHandler = handleKeyDown;
                                }}
                                onBlur={(e) => {
                                  const input = e.target;
                                  if (input._enterHandler) {
                                    input.removeEventListener('keydown', input._enterHandler);
                                    input._enterHandler = null;
                                  }
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#e5e7eb';
                                    container.style.boxShadow = 'none';
                                  }
                                  if (input.value && input.value.trim()) {
                                    const typedValue = input.value.trim();
                                    const options = ['Tear Strength', 'Puncture Resistance', 'Stretch %'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.polybagBaleTestingRequirements) ? material.polybagBaleTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        onChange('polybagBaleTestingRequirements', updated);
                                      }
                                    }
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.[`${errorKeyPrefix}_polybagBaleTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleTestingRequirements`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagBaleQuantity`] || errors?.[`${errorKeyPrefix}_polybagBaleQuantityUnit`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_polybagBaleQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.polybagBaleQuantity || ''}
                            onChange={(e) => onChange('polybagBaleQuantity', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="100"
                          />
                          <UnitDropdown
                            value={material.polybagBaleQuantityUnit ?? ''}
                            onChange={(v) => onChange('polybagBaleQuantityUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_polybagBaleQuantity`] || errors?.[`${errorKeyPrefix}_polybagBaleQuantityUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagBaleQuantity`] || errors[`${errorKeyPrefix}_polybagBaleQuantityUnit`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for POLYBAG~POLYBAG-FLAP */}
                  {material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapPackagingType`] ? 'text-red-600' : 'text-gray-700'}`}>PACKAGING TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagPolybagFlapPackagingType || ''}
                          onChange={(selectedValue) => onChange('polybagPolybagFlapPackagingType', selectedValue)}
                          options={['STANDARD', 'INNER~CASEAPACK', 'PC']}
                          placeholder="Select or type Packaging Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapPackagingType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapPackagingType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapPackagingType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapInnerCasepack`] ? 'text-red-600' : 'text-gray-700'}`}>INNER CASEPACK <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={material.polybagPolybagFlapInnerCasepack || ''}
                          onChange={(e) => onChange('polybagPolybagFlapInnerCasepack', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapInnerCasepack`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Numeric"
                        />
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapInnerCasepack`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapInnerCasepack`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagPolybagFlapType || ''}
                          onChange={(selectedValue) => onChange('polybagPolybagFlapType', selectedValue)}
                          options={['Drawstring Bag', 'Flat Bag (Open Top)', 'Gusseted Bag', 'Wicketed Bag', 'Zip Lock Bag']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagPolybagFlapMaterial || ''}
                          onChange={(selectedValue) => onChange('polybagPolybagFlapMaterial', selectedValue)}
                          options={['Biodegradable', 'CPP', 'HDPE (High Density)', 'LDPE (Low Density Polyethylene)', 'PP (Polypropylene)', 'Recycled PE']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapMaterial`]}</span>}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">DIMENSIONS</label>
                        {(() => {
                          const lengthVal = material.polybagPolybagFlapLength ?? '';
                          const widthVal = material.polybagPolybagFlapWidth ?? '';
                          const gVal = material.polybagPolybagFlapGaugeThickness ?? '';
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">L</label>
                                <input
                                  type="text"
                                  value={lengthVal}
                                  onChange={(e) => onChange('polybagPolybagFlapLength', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Length"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">W</label>
                                <input
                                  type="text"
                                  value={widthVal}
                                  onChange={(e) => onChange('polybagPolybagFlapWidth', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Width"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">GAUGE/GAUSS</label>
                                <input
                                  type="text"
                                  value={gVal}
                                  onChange={(e) => onChange('polybagPolybagFlapGaugeThickness', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Gauge / Gauss"
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapRequired`] ? 'text-red-600' : 'text-gray-700'}`}>FLAP REQUIRED <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.polybagPolybagFlapFlapRequired || ''}
                          onChange={(selectedValue) => onChange('polybagPolybagFlapFlapRequired', selectedValue)}
                          options={['YES', 'NO']}
                          placeholder="Select YES or NO"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapRequired`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapRequired`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapFlapRequired`]}</span>}
                      </div>
                      {material.polybagPolybagFlapFlapRequired === 'YES' && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                          <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapDimensions`] ? 'text-red-600' : 'text-gray-700'}`}>FLAP DIMENSIONS <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={material.polybagPolybagFlapFlapDimensions || ''}
                            onChange={(e) => onChange('polybagPolybagFlapFlapDimensions', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapDimensions`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 14px', height: '44px', width: '100%' }}
                            placeholder="L x W x H (CM)"
                          />
                          {errors?.[`${errorKeyPrefix}_polybagPolybagFlapFlapDimensions`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapFlapDimensions`]}</span>}
                        </div>
                      )}
                      {/* TESTING REQUIREMENTS - Multi-select with chips (SAME AS POLYBAG~Bale) */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapTestingRequirements`] ? 'text-red-600' : 'text-gray-700'}`}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative' }}>
                          <div
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus-within:border-indigo-500 focus-within:outline-none ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapTestingRequirements`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ 
                              padding: '8px 12px',
                              minHeight: '44px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              alignItems: 'center',
                              cursor: 'text'
                            }}
                          >
                            {/* Selected chips */}
                            {(Array.isArray(material.polybagPolybagFlapTestingRequirements) ? material.polybagPolybagFlapTestingRequirements : []).map((req, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  border: '1px solid #c7d2fe'
                                }}
                              >
                                {req}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = Array.isArray(material.polybagPolybagFlapTestingRequirements) ? material.polybagPolybagFlapTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    onChange('polybagPolybagFlapTestingRequirements', updated);
                                  }}
                                  style={{
                                    marginLeft: '4px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: '#4338ca',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    lineHeight: '1',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {/* Dropdown for selecting new options */}
                            <div 
                              id={`polybag-polybag-flap-testing-wrapper-${safeIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                              <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Seal Strength', 'Dart Drop Impact', 'Clarity Test'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.polybagPolybagFlapTestingRequirements) ? material.polybagPolybagFlapTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      onChange('polybagPolybagFlapTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Clarity Test', 'Dart Drop Impact', 'Seal Strength']}
                                placeholder={(Array.isArray(material.polybagPolybagFlapTestingRequirements) && material.polybagPolybagFlapTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
                                className="border-0 outline-none"
                                style={{ 
                                  padding: '4px 0', 
                                  height: 'auto', 
                                  minHeight: '32px',
                                  backgroundColor: 'transparent', 
                                  boxShadow: 'none',
                                  border: 'none',
                                  borderWidth: '0',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  const input = e.target;
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#667eea';
                                    container.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                  }
                                  const handleKeyDown = (keyEvent) => {
                                    if (keyEvent.key === 'Enter' && input.value && input.value.trim()) {
                                      keyEvent.preventDefault();
                                      keyEvent.stopPropagation();
                                      const newValue = input.value.trim();
                                      const current = Array.isArray(material.polybagPolybagFlapTestingRequirements) ? material.polybagPolybagFlapTestingRequirements : [];
                                      const options = ['Seal Strength', 'Dart Drop Impact', 'Clarity Test'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          onChange('polybagPolybagFlapTestingRequirements', updated);
                                        }
                                        input.value = '';
                                        input.blur();
                                      }
                                    }
                                  };
                                  input.addEventListener('keydown', handleKeyDown);
                                  input._enterHandler = handleKeyDown;
                                }}
                                onBlur={(e) => {
                                  const input = e.target;
                                  if (input._enterHandler) {
                                    input.removeEventListener('keydown', input._enterHandler);
                                    input._enterHandler = null;
                                  }
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#e5e7eb';
                                    container.style.boxShadow = 'none';
                                  }
                                  if (input.value && input.value.trim()) {
                                    const typedValue = input.value.trim();
                                    const options = ['Seal Strength', 'Dart Drop Impact', 'Clarity Test'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.polybagPolybagFlapTestingRequirements) ? material.polybagPolybagFlapTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        onChange('polybagPolybagFlapTestingRequirements', updated);
                                      }
                                    }
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.[`${errorKeyPrefix}_polybagPolybagFlapTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapTestingRequirements`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapQuantity`] || errors?.[`${errorKeyPrefix}_polybagPolybagFlapQuantityUnit`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_polybagPolybagFlapQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.polybagPolybagFlapQuantity || ''}
                            onChange={(e) => onChange('polybagPolybagFlapQuantity', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="100"
                          />
                          <UnitDropdown
                            value={material.polybagPolybagFlapQuantityUnit ?? ''}
                            onChange={(v) => onChange('polybagPolybagFlapQuantityUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_polybagPolybagFlapQuantity`] || errors?.[`${errorKeyPrefix}_polybagPolybagFlapQuantityUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_polybagPolybagFlapQuantity`] || errors[`${errorKeyPrefix}_polybagPolybagFlapQuantityUnit`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for SILICA GEL DESICCANT */}
                  {material.packagingMaterialType === 'SILICA GEL DESICCANT' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.silicaGelDesiccantType || ''}
                          onChange={(selectedValue) => onChange('silicaGelDesiccantType', selectedValue)}
                          options={['Activated Carbon', 'Calcium Chloride', 'Clay (Montmorillonite)', 'Molecular Sieve', 'Silica Gel']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantForm`] ? 'text-red-600' : 'text-gray-700'}`}>FORM <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.silicaGelDesiccantForm || ''}
                          onChange={(selectedValue) => onChange('silicaGelDesiccantForm', selectedValue)}
                          options={['Canisters', 'Poles/Hanging', 'Sachets/Packets', 'Sheets', 'Strips']}
                          placeholder="Select or type Form"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantForm`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantForm`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantForm`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantUnitSize`] ? 'text-red-600' : 'text-gray-700'}`}>UNIT SIZE <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <SearchableDropdown
                            value={material.silicaGelDesiccantUnitSize || ''}
                            onChange={(selectedValue) => onChange('silicaGelDesiccantUnitSize', selectedValue)}
                            options={['1g', '10g', '100g', '2g', '200g', '25g', '5g', '50g', '500g']}
                            placeholder="Select or type"
                            style={{ paddingRight: '60px' }}
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none w-full ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantUnitSize`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>GRAMS</span>
                        </div>
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantUnitSize`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantUnitSize`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantColor`] ? 'text-red-600' : 'text-gray-700'}`}>COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.silicaGelDesiccantColor || ''}
                          onChange={(selectedValue) => onChange('silicaGelDesiccantColor', selectedValue)}
                          options={['Blue', 'Orange (indicating)', 'White']}
                          placeholder="Select or type Color"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantColor`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantColor`]}</span>}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantPlacement`] ? 'text-red-600' : 'text-gray-700'}`}>PLACEMENT <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.silicaGelDesiccantPlacement || ''}
                          onChange={(e) => onChange('silicaGelDesiccantPlacement', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantPlacement`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px', width: '100%' }}
                          placeholder="Placement details"
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantPlacement`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantQuantity`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.silicaGelDesiccantQuantity || ''}
                          onChange={(e) => onChange('silicaGelDesiccantQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="PCS"
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantQuantity`]}</span>}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">UPLOAD IMAGE REFERENCE</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            onChange={(e) => onChange('silicaGelDesiccantImageReference', e.target.files[0])}
                            className="hidden"
                            id={`silica-gel-desiccant-image-${safeIndex}`}
                          />
                          <label
                            htmlFor={`silica-gel-desiccant-image-${safeIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                            style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.silicaGelDesiccantImageReference ? 'DONE' : 'UPLOAD'}</span>
                          </label>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantCasepackLogic`] ? 'text-red-600' : 'text-gray-700'}`}>CASEPACK LOGIC <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.silicaGelDesiccantCasepackLogic || ''}
                          onChange={(e) => onChange('silicaGelDesiccantCasepackLogic', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_silicaGelDesiccantCasepackLogic`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px', width: '100%' }}
                          placeholder="Casepack logic"
                        />
                        {errors?.[`${errorKeyPrefix}_silicaGelDesiccantCasepackLogic`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_silicaGelDesiccantCasepackLogic`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for SHRINK TAPE */}
                  {material.packagingMaterialType === 'SHRINK TAPE' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.stretchWrapType || ''}
                          onChange={(selectedValue) => onChange('stretchWrapType', selectedValue)}
                          options={['Hand Wrap', 'Machine Wrap', 'Pre-Stretch', 'Bundling Film', 'Colored/Tinted']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.stretchWrapMaterial || ''}
                          onChange={(selectedValue) => onChange('stretchWrapMaterial', selectedValue)}
                          options={['LLDPE (Linear Low)', 'LDPE', 'Cast Film', 'Blown Film']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapWidth`] ? 'text-red-600' : 'text-gray-700'}`}>WIDTH <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <SearchableDropdown
                            value={material.stretchWrapWidth || ''}
                            onChange={(selectedValue) => onChange('stretchWrapWidth', selectedValue)}
                            options={['100mm', '450mm', '500mm', '600mm', '750mm']}
                            placeholder="Select or type"
                            style={{ paddingRight: '50px' }}
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none w-full ${errors?.[`${errorKeyPrefix}_stretchWrapWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>CM</span>
                        </div>
                        {errors?.[`${errorKeyPrefix}_stretchWrapWidth`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapWidth`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapThicknessGauge`] ? 'text-red-600' : 'text-gray-700'}`}>THICKNESS/GAUGE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.stretchWrapThicknessGauge || ''}
                          onChange={(selectedValue) => onChange('stretchWrapThicknessGauge', selectedValue)}
                          options={['17 micron', '20 micron', '23 micron', '25 micron', '30 micron']}
                          placeholder="Select or type Thickness/Gauge"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapThicknessGauge`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapThicknessGauge`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapThicknessGauge`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapCling`] ? 'text-red-600' : 'text-gray-700'}`}>CLING <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.stretchWrapCling || ''}
                          onChange={(selectedValue) => onChange('stretchWrapCling', selectedValue)}
                          options={['One-Side Cling', 'Two-Side Cling']}
                          placeholder="Select or type Cling"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapCling`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapCling`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapCling`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapColor`] ? 'text-red-600' : 'text-gray-700'}`}>COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.stretchWrapColor || ''}
                          onChange={(selectedValue) => onChange('stretchWrapColor', selectedValue)}
                          options={['Clear', 'Black', 'Blue', 'Green', 'White Opaque']}
                          placeholder="Select or type Color"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapColor`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_stretchWrapQuantity`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.stretchWrapQuantity || ''}
                          onChange={(e) => onChange('stretchWrapQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_stretchWrapQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Number of rolls"
                        />
                        {errors?.[`${errorKeyPrefix}_stretchWrapQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_stretchWrapQuantity`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for VOID~FILL */}
                  {material.packagingMaterialType === 'VOID~FILL' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.voidFillType || ''}
                          onChange={(selectedValue) => onChange('voidFillType', selectedValue)}
                          options={['Air Pillows', 'Paper Fill (Kraft)', 'Packing Peanuts', 'Bubble Wrap', 'Tissue/Newsprint']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_voidFillType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.voidFillMaterial || ''}
                          onChange={(selectedValue) => onChange('voidFillMaterial', selectedValue)}
                          options={['HDPE (Air Pillows)', 'Kraft Paper', 'EPS (Peanuts)', 'PE (Bubble)', 'Recycled Paper']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_voidFillMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillMaterial`]}</span>}
                      </div>
                      {/* Conditional fields for AIR PILLOW */}
                      {material.voidFillType === 'Air Pillows' && (
                        <>
                          <div className="flex flex-col">
                            <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillPillowSize`] ? 'text-red-600' : 'text-gray-700'}`}>PILLOW SIZE <span className="text-red-500">*</span></label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <SearchableDropdown
                                value={material.voidFillPillowSize || ''}
                                onChange={(selectedValue) => onChange('voidFillPillowSize', selectedValue)}
                                options={['100x200mm', '200x200mm', '200x400mm']}
                                placeholder="Select or type"
                                style={{ paddingRight: '50px' }}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none w-full ${errors?.[`${errorKeyPrefix}_voidFillPillowSize`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              />
                              <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>CM</span>
                            </div>
                            {errors?.[`${errorKeyPrefix}_voidFillPillowSize`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillPillowSize`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillFillPercent`] ? 'text-red-600' : 'text-gray-700'}`}>FILL % <span className="text-red-500">*</span></label>
                            <SearchableDropdown
                              value={material.voidFillFillPercent || ''}
                              onChange={(selectedValue) => onChange('voidFillFillPercent', selectedValue)}
                              options={['80%', '90%', 'Full Inflation']}
                              placeholder="Select or type Fill %"
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillFillPercent`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            />
                            {errors?.[`${errorKeyPrefix}_voidFillFillPercent`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillFillPercent`]}</span>}
                          </div>
                        </>
                      )}
                      {/* Conditional fields for BUBBLE WRAP */}
                      {material.voidFillType === 'Bubble Wrap' && (
                        <>
                          <div className="flex flex-col">
                            <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillBubbleSize`] ? 'text-red-600' : 'text-gray-700'}`}>BUBBLE SIZE <span className="text-red-500">*</span></label>
                            <SearchableDropdown
                              value={material.voidFillBubbleSize || ''}
                              onChange={(selectedValue) => onChange('voidFillBubbleSize', selectedValue)}
                              options={['10mm (Small)', '25mm (Medium)', '30mm (Large)']}
                              placeholder="Select or type Bubble Size"
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillBubbleSize`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            />
                            {errors?.[`${errorKeyPrefix}_voidFillBubbleSize`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillBubbleSize`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillLayer`] ? 'text-red-600' : 'text-gray-700'}`}>LAYER <span className="text-red-500">*</span></label>
                            <SearchableDropdown
                              value={material.voidFillLayer || ''}
                              onChange={(selectedValue) => onChange('voidFillLayer', selectedValue)}
                              options={['Single', 'Double Layer']}
                              placeholder="Select or type Layer"
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillLayer`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            />
                            {errors?.[`${errorKeyPrefix}_voidFillLayer`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillLayer`]}</span>}
                          </div>
                        </>
                      )}
                      {/* Paper Type and Paper Weight - always visible */}
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillPaperType`] ? 'text-red-600' : 'text-gray-700'}`}>PAPER TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.voidFillPaperType || ''}
                          onChange={(selectedValue) => onChange('voidFillPaperType', selectedValue)}
                          options={['Kraft', 'Newsprint', 'Tissue', 'Honeycomb']}
                          placeholder="Select or type Paper Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillPaperType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_voidFillPaperType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillPaperType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillPaperWeight`] ? 'text-red-600' : 'text-gray-700'}`}>PAPER WEIGHT <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.voidFillPaperWeight || ''}
                          onChange={(selectedValue) => onChange('voidFillPaperWeight', selectedValue)}
                          options={['30gsm', '40gsm', '50gsm', '70gsm']}
                          placeholder="Select or type Paper Weight"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillPaperWeight`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_voidFillPaperWeight`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillPaperWeight`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillColor`] ? 'text-red-600' : 'text-gray-700'}`}>COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.voidFillColor || ''}
                          onChange={(selectedValue) => onChange('voidFillColor', selectedValue)}
                          options={['Clear', 'White', 'Kraft Brown', 'Pink (Anti-Static)']}
                          placeholder="Select or type Color"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_voidFillColor`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_voidFillColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_voidFillQuantity`] || errors?.[`${errorKeyPrefix}_voidFillQuantityUnit`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_voidFillQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.voidFillQuantity || ''}
                            onChange={(e) => onChange('voidFillQuantity', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="100"
                          />
                          <UnitDropdown
                            value={material.voidFillQuantityUnit ?? ''}
                            onChange={(v) => onChange('voidFillQuantityUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_voidFillQuantity`] || errors?.[`${errorKeyPrefix}_voidFillQuantityUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_voidFillQuantity`] || errors[`${errorKeyPrefix}_voidFillQuantityUnit`]}</span>}
                      </div>
                    </>
                  )}

                  {/* Specific Fields for DIVIDER */}
                  {material.packagingMaterialType === 'DIVIDER' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerType || ''}
                          onChange={(selectedValue) => onChange('dividerType', selectedValue)}
                          options={['Cell Divider (Grid)', 'Partition (Single)', 'Z-Fold', 'Layer Pad', 'Custom']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerMaterial || ''}
                          onChange={(selectedValue) => onChange('dividerMaterial', selectedValue)}
                          options={['Corrugated Board (B/C/E Flute)', 'Solid Board', 'Chipboard', 'Plastic (PP)']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerCellConfiguration`] ? 'text-red-600' : 'text-gray-700'}`}>CELL CONFIGURATION <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerCellConfiguration || ''}
                          onChange={(selectedValue) => onChange('dividerCellConfiguration', selectedValue)}
                          options={['6-cell (2x3)', '8-cell (2x4)', '12-cell (3x4)', '24-cell (4x6)', 'Custom']}
                          placeholder="Select or type Cell Configuration"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerCellConfiguration`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerCellConfiguration`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerCellConfiguration`]}</span>}
                      </div>
                      {/* CELL SIZE - with LENGTH and WIDTH */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${(errors?.[`${errorKeyPrefix}_dividerCellSizeLength`] || errors?.[`${errorKeyPrefix}_dividerCellSizeWidth`] || errors?.[`${errorKeyPrefix}_dividerCellSizeUnit`]) ? 'text-red-600' : 'text-gray-700'}`}>CELL SIZE <span className="text-red-500">*</span></label>
                        <div className="flex items-end gap-4">
                          <div className="flex flex-col flex-1">
                            <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_dividerCellSizeLength`] ? 'text-red-600' : 'text-gray-600'}`}>
                              LENGTH <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={material.dividerCellSizeLength || ''}
                              onChange={(e) => onChange('dividerCellSizeLength', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerCellSizeLength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Length"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_dividerCellSizeWidth`] ? 'text-red-600' : 'text-gray-600'}`}>
                              WIDTH <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={material.dividerCellSizeWidth || ''}
                              onChange={(e) => onChange('dividerCellSizeWidth', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerCellSizeWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Width"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className={`text-xs mb-1 ${errors?.[`${errorKeyPrefix}_dividerCellSizeUnit`] ? 'text-red-600' : 'text-gray-600'}`}>
                              UNIT <span className="text-red-500">*</span>
                            </label>
                            <UnitDropdown
                              value={material.dividerCellSizeUnit ?? ''}
                              onChange={(v) => onChange('dividerCellSizeUnit', v)}
                              placeholder="Select Unit"
                              className={`border-2 rounded-lg transition-all bg-white focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerCellSizeUnit`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ height: '44px', width: '120px' }}
                            />
                          </div>
                        </div>
                        {(errors?.[`${errorKeyPrefix}_dividerCellSizeLength`] || errors?.[`${errorKeyPrefix}_dividerCellSizeWidth`] || errors?.[`${errorKeyPrefix}_dividerCellSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerCellSizeLength`] || errors[`${errorKeyPrefix}_dividerCellSizeWidth`] || errors[`${errorKeyPrefix}_dividerCellSizeUnit`]}</span>}
                      </div>
                      {/* HEIGHT */}
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerHeight`] ? 'text-red-600' : 'text-gray-700'}`}>HEIGHT <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_dividerHeight`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.dividerHeight || ''}
                            onChange={(e) => onChange('dividerHeight', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="50"
                          />
                          <UnitDropdown
                            value={material.dividerHeightUnit ?? ''}
                            onChange={(v) => onChange('dividerHeightUnit', v)}
                          />
                        </div>
                        {errors?.[`${errorKeyPrefix}_dividerHeight`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerHeight`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerBoardThickness`] ? 'text-red-600' : 'text-gray-700'}`}>BOARD THICKNESS <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerBoardThickness || ''}
                          onChange={(selectedValue) => onChange('dividerBoardThickness', selectedValue)}
                          options={['2mm', '3mm (E-Flute)', '4mm (B-Flute)', '5mm (C-Flute)']}
                          placeholder="Select or type Board Thickness"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerBoardThickness`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerBoardThickness`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerBoardThickness`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerSlotDepth`] ? 'text-red-600' : 'text-gray-700'}`}>SLOT DEPTH <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerSlotDepth || ''}
                          onChange={(selectedValue) => onChange('dividerSlotDepth', selectedValue)}
                          options={['50%', '60%', '70% of divider height']}
                          placeholder="Select or type Slot Depth"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerSlotDepth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerSlotDepth`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerSlotDepth`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerColor`] ? 'text-red-600' : 'text-gray-700'}`}>COLOR <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.dividerColor || ''}
                          onChange={(selectedValue) => onChange('dividerColor', selectedValue)}
                          options={['Brown (Kraft)', 'White', 'Printed']}
                          placeholder="Select or type Color"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerColor`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_dividerColor`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerColor`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_dividerQuantity`] ? 'text-red-600' : 'text-gray-700'}`}>QUANTITY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.dividerQuantity || ''}
                          onChange={(e) => onChange('dividerQuantity', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_dividerQuantity`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Pcs"
                        />
                        {errors?.[`${errorKeyPrefix}_dividerQuantity`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_dividerQuantity`]}</span>}
                      </div>
                    </>
                  )}

                

                  {/* Specific Fields for TAPE */}
                  {material.packagingMaterialType === 'TAPE' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.tapeType || ''}
                          onChange={(selectedValue) => onChange('tapeType', selectedValue)}
                          options={['BOPP Tape (Clear/Brown)', 'Printed Tape', 'Paper Tape (Kraft)', 'Masking Tape', 'Strapping Tape', 'Double-Sided']}
                          placeholder="Select or type Type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_tapeType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_tapeType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.tapeMaterial || ''}
                          onChange={(selectedValue) => onChange('tapeMaterial', selectedValue)}
                          options={['BOPP (Biaxially Oriented Polypropylene)', 'PVC', 'Paper (Kraft)', 'Cloth/Duct', 'Filament/Strapping']}
                          placeholder="Select or type Material"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_tapeMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_tapeMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeGaugeThickness`] ? 'text-red-600' : 'text-gray-700'}`}>GAUGE / THICKNESS <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                            value={material.tapeGaugeThickness || ''}
                            onChange={(e) => onChange('tapeGaugeThickness', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_tapeGaugeThickness`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 60px 10px 14px', width: '100%', height: '44px' }}
                            placeholder="e.g., 40, 45, 50"
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>Micron</span>
                        </div>
                        {errors?.[`${errorKeyPrefix}_tapeGaugeThickness`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeGaugeThickness`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeWidth`] || errors?.[`${errorKeyPrefix}_tapeWidthUnit`] ? 'text-red-600' : 'text-gray-700'}`}>WIDTH <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_tapeWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.tapeWidth || ''}
                            onChange={(e) => onChange('tapeWidth', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200 placeholder:text-gray-400"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="2"
                          />
                          <UnitDropdown
                            value={material.tapeWidthUnit ?? ''}
                            onChange={(v) => onChange('tapeWidthUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_tapeWidth`] || errors?.[`${errorKeyPrefix}_tapeWidthUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeWidth`] || errors[`${errorKeyPrefix}_tapeWidthUnit`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeLength`] || errors?.[`${errorKeyPrefix}_tapeLengthUnit`] ? 'text-red-600' : 'text-gray-700'}`}>LENGTH <span className="text-red-500">*</span></label>
                        <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-all ${errors?.[`${errorKeyPrefix}_tapeLength`] ? 'border-red-600' : 'border-[#e5e7eb]'}`} style={{ height: '44px' }}>
                          <input
                            type="text"
                            value={material.tapeLength || ''}
                            onChange={(e) => onChange('tapeLength', e.target.value)}
                            className="text-sm bg-transparent text-gray-900 focus:outline-none border-r border-gray-200"
                            style={{ padding: '10px 14px', width: '80px' }}
                            placeholder="100"
                          />
                          <UnitDropdown
                            value={material.tapeLengthUnit ?? ''}
                            onChange={(v) => onChange('tapeLengthUnit', v)}
                          />
                        </div>
                        {(errors?.[`${errorKeyPrefix}_tapeLength`] || errors?.[`${errorKeyPrefix}_tapeLengthUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeLength`] || errors[`${errorKeyPrefix}_tapeLengthUnit`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeGummingQuality`] ? 'text-red-600' : 'text-gray-700'}`}>GUMMING QUALITY <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.tapeGummingQuality || ''}
                          onChange={(selectedValue) => onChange('tapeGummingQuality', selectedValue)}
                          options={['Strong', 'Standard']}
                          placeholder="Select or type Gumming Quality"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_tapeGummingQuality`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_tapeGummingQuality`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeGummingQuality`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeApplication`] ? 'text-red-600' : 'text-gray-700'}`}>APPLICATION <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.tapeApplication || ''}
                          onChange={(selectedValue) => onChange('tapeApplication', selectedValue)}
                          options={['6 WAYS', '6 WAYS +ROUND ABOUT', '6 WAYS Xtwice', '6 WAYS XTWICE + ROUND ABOUT', '6 WAYS +TOP & BOTTOM TWICE', '6 WAYS +TOP & BOTTOM TWICE + ROUND ABOUT']}
                          placeholder="Select or type Application"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_tapeApplication`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_tapeApplication`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeApplication`]}</span>}
                      </div>
                      {/* TESTING REQUIREMENTS - Multi-select with chips (SAME AS CARTON BOX) */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_tapeTestingRequirements`] ? 'text-red-600' : 'text-gray-700'}`}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative' }}>
                          <div
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus-within:border-indigo-500 focus-within:outline-none ${errors?.[`${errorKeyPrefix}_tapeTestingRequirements`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ 
                              padding: '8px 12px',
                              minHeight: '44px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              alignItems: 'center',
                              cursor: 'text'
                            }}
                          >
                            {/* Selected chips */}
                            {(Array.isArray(material.tapeTestingRequirements) ? material.tapeTestingRequirements : []).map((req, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  border: '1px solid #c7d2fe'
                                }}
                              >
                                {req}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = Array.isArray(material.tapeTestingRequirements) ? material.tapeTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    onChange('tapeTestingRequirements', updated);
                                  }}
                                  style={{
                                    marginLeft: '4px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: '#4338ca',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    lineHeight: '1',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {/* Dropdown for selecting new options */}
                            <div 
                              id={`tape-testing-wrapper-${safeIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                              <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Adhesion Test', 'Tensile Strength', 'Elongation'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.tapeTestingRequirements) ? material.tapeTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      onChange('tapeTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Adhesion Test', 'Tensile Strength', 'Elongation']}
                                placeholder={(Array.isArray(material.tapeTestingRequirements) && material.tapeTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
                                className="border-0 outline-none"
                                style={{ 
                                  padding: '4px 0', 
                                  height: 'auto', 
                                  minHeight: '32px',
                                  backgroundColor: 'transparent', 
                                  boxShadow: 'none',
                                  border: 'none',
                                  borderWidth: '0',
                                  outline: 'none'
                                }}
                                onFocus={(e) => {
                                  const input = e.target;
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#667eea';
                                    container.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                  }
                                  const handleKeyDown = (keyEvent) => {
                                    if (keyEvent.key === 'Enter' && input.value && input.value.trim()) {
                                      keyEvent.preventDefault();
                                      keyEvent.stopPropagation();
                                      const newValue = input.value.trim();
                                      const current = Array.isArray(material.tapeTestingRequirements) ? material.tapeTestingRequirements : [];
                                      const options = ['Adhesion Test', 'Tensile Strength', 'Elongation'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          onChange('tapeTestingRequirements', updated);
                                        }
                                        input.value = '';
                                        input.blur();
                                      }
                                    }
                                  };
                                  input.addEventListener('keydown', handleKeyDown);
                                  input._enterHandler = handleKeyDown;
                                }}
                                onBlur={(e) => {
                                  const input = e.target;
                                  if (input._enterHandler) {
                                    input.removeEventListener('keydown', input._enterHandler);
                                    input._enterHandler = null;
                                  }
                                  input.style.border = 'none';
                                  input.style.borderWidth = '0';
                                  input.style.outline = 'none';
                                  input.style.boxShadow = 'none';
                                  const container = input.closest('[class*="border-2"]');
                                  if (container) {
                                    container.style.borderColor = '#e5e7eb';
                                    container.style.boxShadow = 'none';
                                  }
                                  if (input.value && input.value.trim()) {
                                    const typedValue = input.value.trim();
                                    const options = ['Adhesion Test', 'Tensile Strength', 'Elongation'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.tapeTestingRequirements) ? material.tapeTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        onChange('tapeTestingRequirements', updated);
                                      }
                                    }
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {errors?.[`${errorKeyPrefix}_tapeTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_tapeTestingRequirements`]}</span>}
                      </div>
                    </>
                  )}

                  {material.packagingMaterialType === 'SHIPPING MARK' && (
                    <>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkType`] ? 'text-red-600' : 'text-gray-700'}`}>TYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.shippingMarkType || ''}
                          onChange={(selectedValue) => onChange('shippingMarkType', selectedValue)}
                          options={SHIPPING_MARK_TYPE_OPTIONS}
                          placeholder="Select or type Type"
                          strictMode={false}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_shippingMarkType`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkType`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkMaterial`] ? 'text-red-600' : 'text-gray-700'}`}>MATERIAL <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.shippingMarkMaterial || ''}
                          onChange={(selectedValue) => onChange('shippingMarkMaterial', selectedValue)}
                          options={SHIPPING_MARK_MATERIAL_OPTIONS}
                          placeholder="Select or type Material"
                          strictMode={false}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkMaterial`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_shippingMarkMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkMaterial`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkArtworkSpecFile`] ? 'text-red-600' : 'text-gray-700'}`}>ARTWORK SPEC <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            onChange={(e) => onChange('shippingMarkArtworkSpecFile', e.target.files?.[0] || null)}
                            className="hidden"
                            id={`shipping-mark-artwork-${safeIndex}`}
                          />
                          <label
                            htmlFor={`shipping-mark-artwork-${safeIndex}`}
                            className={`border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 flex-shrink-0 ${errors?.[`${errorKeyPrefix}_shippingMarkArtworkSpecFile`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.shippingMarkArtworkSpecFile ? 'DONE' : 'UPLOAD'}</span>
                          </label>
                        </div>
                        {errors?.[`${errorKeyPrefix}_shippingMarkArtworkSpecFile`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkArtworkSpecFile`]}</span>}
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <label className={`text-sm font-semibold mb-2 ${(errors?.[`${errorKeyPrefix}_shippingMarkSizeUnit`] || errors?.[`${errorKeyPrefix}_shippingMarkSizeWidth`] || errors?.[`${errorKeyPrefix}_shippingMarkSizeHeight`]) ? 'text-red-600' : 'text-gray-700'}`}>SIZE <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">UNIT</label>
                            <UnitDropdown
                              value={material.shippingMarkSizeUnit ?? ''}
                              onChange={(v) => onChange('shippingMarkSizeUnit', v)}
                              placeholder="Select Unit"
                              className={`border-2 rounded-lg transition-all bg-white focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkSizeUnit`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ height: '44px', width: '100%' }}
                            />
                            {errors?.[`${errorKeyPrefix}_shippingMarkSizeUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkSizeUnit`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">WIDTH</label>
                            <input
                              type="text"
                              value={material.shippingMarkSizeWidth || ''}
                              onChange={(e) => onChange('shippingMarkSizeWidth', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkSizeWidth`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Width"
                            />
                            {errors?.[`${errorKeyPrefix}_shippingMarkSizeWidth`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkSizeWidth`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-600 mb-1">HEIGHT</label>
                            <input
                              type="text"
                              value={material.shippingMarkSizeHeight || ''}
                              onChange={(e) => onChange('shippingMarkSizeHeight', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkSizeHeight`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Height"
                            />
                            {errors?.[`${errorKeyPrefix}_shippingMarkSizeHeight`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkSizeHeight`]}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkPlacementText`] ? 'text-red-600' : 'text-gray-700'}`}>PLACEMENT <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px] gap-3 items-end">
                          <div className="flex flex-col">
                            <input
                              type="text"
                              value={material.shippingMarkPlacementText || ''}
                              onChange={(e) => onChange('shippingMarkPlacementText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkPlacementText`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter placement"
                            />
                            {errors?.[`${errorKeyPrefix}_shippingMarkPlacementText`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkPlacementText`]}</span>}
                          </div>
                          <div className="flex flex-col">
                            <input
                              type="file"
                              onChange={(e) => onChange('shippingMarkPlacementReferenceImage', e.target.files?.[0] || null)}
                              className="hidden"
                              id={`shipping-mark-placement-${safeIndex}`}
                            />
                            <label
                              htmlFor={`shipping-mark-placement-${safeIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb]"
                              style={{ padding: '10px 14px', height: '44px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.shippingMarkPlacementReferenceImage ? 'DONE' : 'UPLOAD REF'}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkTestingRequirements`] ? 'text-red-600' : 'text-gray-700'}`}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                        <TestingRequirementsInput
                          value={asArray(material.shippingMarkTestingRequirements)}
                          onChange={(vals) => onChange('shippingMarkTestingRequirements', vals)}
                          options={SHIPPING_MARK_TESTING_OPTIONS}
                          placeholder="Type to search or select..."
                          error={errors?.[`${errorKeyPrefix}_shippingMarkTestingRequirements`]}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkQty`] ? 'text-red-600' : 'text-gray-700'}`}>QTY <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={material.shippingMarkQty || ''}
                          onChange={(e) => onChange('shippingMarkQty', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkQty`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Enter quantity"
                        />
                        {errors?.[`${errorKeyPrefix}_shippingMarkQty`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkQty`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkQtyUnit`] ? 'text-red-600' : 'text-gray-700'}`}>QTY UNIT <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.shippingMarkQtyUnit || ''}
                          onChange={(selectedValue) => onChange('shippingMarkQtyUnit', selectedValue)}
                          options={['Pieces', 'Rolls']}
                          placeholder="Select or type Qty Unit"
                          strictMode={false}
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkQtyUnit`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        />
                        {errors?.[`${errorKeyPrefix}_shippingMarkQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkQtyUnit`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className={`text-sm font-semibold mb-2 ${errors?.[`${errorKeyPrefix}_shippingMarkSurplus`] ? 'text-red-600' : 'text-gray-700'}`}>SURPLUS % <span className="text-red-500">*</span></label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={material.shippingMarkSurplus || ''}
                            onChange={(e) => onChange('shippingMarkSurplus', e.target.value.replace(/[^0-9.]/g, ''))}
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkSurplus`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 32px 10px 14px', height: '44px' }}
                            placeholder="5"
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                        </div>
                        {errors?.[`${errorKeyPrefix}_shippingMarkSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkSurplus`]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                        <SearchableDropdown
                          value={material.shippingMarkApproval || ''}
                          onChange={(selectedValue) => onChange('shippingMarkApproval', selectedValue)}
                          options={PACKAGING_APPROVAL_OPTIONS}
                          placeholder="Select or type Approval"
                          strictMode={false}
                        />
                      </div>
                    </>
                  )}

                  {/* PRINTING REF with UPLOAD for POLY BAG WITH FLAP */}
                  {material.packagingMaterialType === 'POLY BAG WITH FLAP' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING REF</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={(e) => onChange('printingRef', e.target?.files?.[0] ?? null)}
                          className="hidden"
                          id={`pkg-file-${safeIndex}`}
                        />
                        <label
                          htmlFor={`pkg-file-${safeIndex}`}
                          className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                          style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="truncate">{material.printingRef ? 'DONE' : 'UPLOAD'}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  

                

                  {/* Surplus & For Section - Special handling for CARTON BOX, CORNER PROTECTORS, EDGE PROTECTORS, FOAM INSERT, PALLET STRAP, POLYBAG~Bale, POLYBAG~POLYBAG-FLAP, SILICA GEL DESICCANT, SHRINK TAPE, TAPE, VOID~FILL, and DIVIDER with absolute % signs */}
                  {material.packagingMaterialType === 'SHIPPING MARK' ? null : (material.packagingMaterialType === 'CARTON BOX' || material.packagingMaterialType === 'CORNER PROTECTORS' || material.packagingMaterialType === 'EDGE PROTECTORS' || material.packagingMaterialType === 'FOAM INSERT' || material.packagingMaterialType === 'PALLET STRAP' || material.packagingMaterialType === 'POLYBAG~Bale' || material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' || material.packagingMaterialType === 'SILICA GEL DESICCANT' || material.packagingMaterialType === 'SHRINK TAPE' || material.packagingMaterialType === 'TAPE' || material.packagingMaterialType === 'VOID~FILL' || material.packagingMaterialType === 'DIVIDER') ? (
                    <>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex items-end gap-4">
                        <div className="flex flex-col" style={{ width: `${typeFieldWidth}px` }}>
                          <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS % <span className="text-red-500">*</span></label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={
                                material.packagingMaterialType === 'CARTON BOX' ? (material.cartonBoxSurplus || '') :
                                material.packagingMaterialType === 'CORNER PROTECTORS' ? (material.cornerProtectorSurplus || '') :
                                material.packagingMaterialType === 'EDGE PROTECTORS' ? (material.edgeProtectorSurplus || '') :
                                material.packagingMaterialType === 'FOAM INSERT' ? (material.foamInsertSurplus || '') :
                                material.packagingMaterialType === 'PALLET STRAP' ? (material.palletStrapSurplus || '') :
                                material.packagingMaterialType === 'POLYBAG~Bale' ? (material.polybagBaleSurplus || '') :
                                material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' ? (material.polybagPolybagFlapSurplus || '') :
                                material.packagingMaterialType === 'SILICA GEL DESICCANT' ? (material.silicaGelDesiccantSurplus || '') :
                                material.packagingMaterialType === 'SHRINK TAPE' ? (material.stretchWrapSurplus || '') :
                                material.packagingMaterialType === 'TAPE' ? (material.tapeSurplus || '') :
                                material.packagingMaterialType === 'VOID~FILL' ? (material.voidFillSurplus || '') :
                                (material.dividerSurplus || '')
                              }
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                if (material.packagingMaterialType === 'CARTON BOX') {
                                  onChange('cartonBoxSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'CORNER PROTECTORS') {
                                  onChange('cornerProtectorSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'EDGE PROTECTORS') {
                                  onChange('edgeProtectorSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'FOAM INSERT') {
                                  onChange('foamInsertSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'PALLET STRAP') {
                                  onChange('palletStrapSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'POLYBAG~Bale') {
                                  onChange('polybagBaleSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP') {
                                  onChange('polybagPolybagFlapSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'SILICA GEL DESICCANT') {
                                  onChange('silicaGelDesiccantSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'SHRINK TAPE') {
                                  onChange('stretchWrapSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'TAPE') {
                                  onChange('tapeSurplus', numericValue);
                                } else if (material.packagingMaterialType === 'VOID~FILL') {
                                  onChange('voidFillSurplus', numericValue);
                                } else {
                                  onChange('dividerSurplus', numericValue);
                                }
                              }}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${(
                                (material.packagingMaterialType === 'CARTON BOX' && errors?.[`${errorKeyPrefix}_cartonBoxSurplus`]) ||
                                (material.packagingMaterialType === 'CORNER PROTECTORS' && errors?.[`${errorKeyPrefix}_cornerProtectorSurplus`]) ||
                                (material.packagingMaterialType === 'EDGE PROTECTORS' && errors?.[`${errorKeyPrefix}_edgeProtectorSurplus`]) ||
                                (material.packagingMaterialType === 'FOAM INSERT' && errors?.[`${errorKeyPrefix}_foamInsertSurplus`]) ||
                                (material.packagingMaterialType === 'PALLET STRAP' && errors?.[`${errorKeyPrefix}_palletStrapSurplus`]) ||
                                (material.packagingMaterialType === 'POLYBAG~Bale' && errors?.[`${errorKeyPrefix}_polybagBaleSurplus`]) ||
                                (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors?.[`${errorKeyPrefix}_polybagPolybagFlapSurplus`]) ||
                                (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors?.[`${errorKeyPrefix}_silicaGelDesiccantSurplus`]) ||
                                (material.packagingMaterialType === 'SHRINK TAPE' && errors?.[`${errorKeyPrefix}_stretchWrapSurplus`]) ||
                                (material.packagingMaterialType === 'TAPE' && errors?.[`${errorKeyPrefix}_tapeSurplus`]) ||
                                (material.packagingMaterialType === 'VOID~FILL' && errors?.[`${errorKeyPrefix}_voidFillSurplus`]) ||
                                (material.packagingMaterialType === 'DIVIDER' && errors?.[`${errorKeyPrefix}_dividerSurplus`])
                              ) ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 32px 10px 14px', width: `${typeFieldWidth}px`, height: '44px' }}
                              placeholder=""
                            />
                            <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                          </div>
                          {(material.packagingMaterialType === 'CARTON BOX' && errors?.[`${errorKeyPrefix}_cartonBoxSurplus`]) || (material.packagingMaterialType === 'CORNER PROTECTORS' && errors?.[`${errorKeyPrefix}_cornerProtectorSurplus`]) || (material.packagingMaterialType === 'EDGE PROTECTORS' && errors?.[`${errorKeyPrefix}_edgeProtectorSurplus`]) || (material.packagingMaterialType === 'FOAM INSERT' && errors?.[`${errorKeyPrefix}_foamInsertSurplus`]) || (material.packagingMaterialType === 'PALLET STRAP' && errors?.[`${errorKeyPrefix}_palletStrapSurplus`]) || (material.packagingMaterialType === 'POLYBAG~Bale' && errors?.[`${errorKeyPrefix}_polybagBaleSurplus`]) || (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors?.[`${errorKeyPrefix}_polybagPolybagFlapSurplus`]) || (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors?.[`${errorKeyPrefix}_silicaGelDesiccantSurplus`]) || (material.packagingMaterialType === 'SHRINK TAPE' && errors?.[`${errorKeyPrefix}_stretchWrapSurplus`]) || (material.packagingMaterialType === 'TAPE' && errors?.[`${errorKeyPrefix}_tapeSurplus`]) || (material.packagingMaterialType === 'VOID~FILL' && errors?.[`${errorKeyPrefix}_voidFillSurplus`]) || (material.packagingMaterialType === 'DIVIDER' && errors?.[`${errorKeyPrefix}_dividerSurplus`]) ? (
                            <span className="text-red-600 text-xs mt-1">
                              {(material.packagingMaterialType === 'CARTON BOX' && errors[`${errorKeyPrefix}_cartonBoxSurplus`]) || (material.packagingMaterialType === 'CORNER PROTECTORS' && errors[`${errorKeyPrefix}_cornerProtectorSurplus`]) || (material.packagingMaterialType === 'EDGE PROTECTORS' && errors[`${errorKeyPrefix}_edgeProtectorSurplus`]) || (material.packagingMaterialType === 'FOAM INSERT' && errors[`${errorKeyPrefix}_foamInsertSurplus`]) || (material.packagingMaterialType === 'PALLET STRAP' && errors[`${errorKeyPrefix}_palletStrapSurplus`]) || (material.packagingMaterialType === 'POLYBAG~Bale' && errors[`${errorKeyPrefix}_polybagBaleSurplus`]) || (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors[`${errorKeyPrefix}_polybagPolybagFlapSurplus`]) || (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors[`${errorKeyPrefix}_silicaGelDesiccantSurplus`]) || (material.packagingMaterialType === 'SHRINK TAPE' && errors[`${errorKeyPrefix}_stretchWrapSurplus`]) || (material.packagingMaterialType === 'TAPE' && errors[`${errorKeyPrefix}_tapeSurplus`]) || (material.packagingMaterialType === 'VOID~FILL' && errors[`${errorKeyPrefix}_voidFillSurplus`]) || (material.packagingMaterialType === 'DIVIDER' && errors[`${errorKeyPrefix}_dividerSurplus`])}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col" style={{ width: `${typeFieldWidth}px` }}>
                          <label className="text-sm font-semibold text-gray-700 mb-2">WASTAGE % <span className="text-red-500">*</span></label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={
                                material.packagingMaterialType === 'CARTON BOX' ? (material.cartonBoxWastage || '') :
                                material.packagingMaterialType === 'CORNER PROTECTORS' ? (material.cornerProtectorWastage || '') :
                                material.packagingMaterialType === 'EDGE PROTECTORS' ? (material.edgeProtectorWastage || '') :
                                material.packagingMaterialType === 'FOAM INSERT' ? (material.foamInsertWastage || '') :
                                material.packagingMaterialType === 'PALLET STRAP' ? (material.palletStrapWastage || '') :
                                material.packagingMaterialType === 'POLYBAG~Bale' ? (material.polybagBaleWastage || '') :
                                material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' ? (material.polybagPolybagFlapWastage || '') :
                                material.packagingMaterialType === 'SILICA GEL DESICCANT' ? (material.silicaGelDesiccantWastage || '') :
                                material.packagingMaterialType === 'SHRINK TAPE' ? (material.stretchWrapWastage || '') :
                                material.packagingMaterialType === 'TAPE' ? (material.tapeWastage || '') :
                                material.packagingMaterialType === 'VOID~FILL' ? (material.voidFillWastage || '') :
                                (material.dividerWastage || '')
                              }
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                if (material.packagingMaterialType === 'CARTON BOX') {
                                  onChange('cartonBoxWastage', numericValue);
                                } else if (material.packagingMaterialType === 'CORNER PROTECTORS') {
                                  onChange('cornerProtectorWastage', numericValue);
                                } else if (material.packagingMaterialType === 'EDGE PROTECTORS') {
                                  onChange('edgeProtectorWastage', numericValue);
                                } else if (material.packagingMaterialType === 'FOAM INSERT') {
                                  onChange('foamInsertWastage', numericValue);
                                } else if (material.packagingMaterialType === 'PALLET STRAP') {
                                  onChange('palletStrapWastage', numericValue);
                                } else if (material.packagingMaterialType === 'POLYBAG~Bale') {
                                  onChange('polybagBaleWastage', numericValue);
                                } else if (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP') {
                                  onChange('polybagPolybagFlapWastage', numericValue);
                                } else if (material.packagingMaterialType === 'SILICA GEL DESICCANT') {
                                  onChange('silicaGelDesiccantWastage', numericValue);
                                } else if (material.packagingMaterialType === 'SHRINK TAPE') {
                                  onChange('stretchWrapWastage', numericValue);
                                } else if (material.packagingMaterialType === 'TAPE') {
                                  onChange('tapeWastage', numericValue);
                                } else if (material.packagingMaterialType === 'VOID~FILL') {
                                  onChange('voidFillWastage', numericValue);
                                } else {
                                  onChange('dividerWastage', numericValue);
                                }
                              }}
                              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${(
                                (material.packagingMaterialType === 'CARTON BOX' && errors?.[`${errorKeyPrefix}_cartonBoxWastage`]) ||
                                (material.packagingMaterialType === 'CORNER PROTECTORS' && errors?.[`${errorKeyPrefix}_cornerProtectorWastage`]) ||
                                (material.packagingMaterialType === 'EDGE PROTECTORS' && errors?.[`${errorKeyPrefix}_edgeProtectorWastage`]) ||
                                (material.packagingMaterialType === 'FOAM INSERT' && errors?.[`${errorKeyPrefix}_foamInsertWastage`]) ||
                                (material.packagingMaterialType === 'PALLET STRAP' && errors?.[`${errorKeyPrefix}_palletStrapWastage`]) ||
                                (material.packagingMaterialType === 'POLYBAG~Bale' && errors?.[`${errorKeyPrefix}_polybagBaleWastage`]) ||
                                (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors?.[`${errorKeyPrefix}_polybagPolybagFlapWastage`]) ||
                                (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors?.[`${errorKeyPrefix}_silicaGelDesiccantWastage`]) ||
                                (material.packagingMaterialType === 'SHRINK TAPE' && errors?.[`${errorKeyPrefix}_stretchWrapWastage`]) ||
                                (material.packagingMaterialType === 'TAPE' && errors?.[`${errorKeyPrefix}_tapeWastage`]) ||
                                (material.packagingMaterialType === 'VOID~FILL' && errors?.[`${errorKeyPrefix}_voidFillWastage`]) ||
                                (material.packagingMaterialType === 'DIVIDER' && errors?.[`${errorKeyPrefix}_dividerWastage`])
                              ) ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              style={{ padding: '10px 32px 10px 14px', width: `${typeFieldWidth}px`, height: '44px' }}
                              placeholder=""
                            />
                            <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                          </div>
                          {(material.packagingMaterialType === 'CARTON BOX' && errors?.[`${errorKeyPrefix}_cartonBoxWastage`]) || (material.packagingMaterialType === 'CORNER PROTECTORS' && errors?.[`${errorKeyPrefix}_cornerProtectorWastage`]) || (material.packagingMaterialType === 'EDGE PROTECTORS' && errors?.[`${errorKeyPrefix}_edgeProtectorWastage`]) || (material.packagingMaterialType === 'FOAM INSERT' && errors?.[`${errorKeyPrefix}_foamInsertWastage`]) || (material.packagingMaterialType === 'PALLET STRAP' && errors?.[`${errorKeyPrefix}_palletStrapWastage`]) || (material.packagingMaterialType === 'POLYBAG~Bale' && errors?.[`${errorKeyPrefix}_polybagBaleWastage`]) || (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors?.[`${errorKeyPrefix}_polybagPolybagFlapWastage`]) || (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors?.[`${errorKeyPrefix}_silicaGelDesiccantWastage`]) || (material.packagingMaterialType === 'SHRINK TAPE' && errors?.[`${errorKeyPrefix}_stretchWrapWastage`]) || (material.packagingMaterialType === 'TAPE' && errors?.[`${errorKeyPrefix}_tapeWastage`]) || (material.packagingMaterialType === 'VOID~FILL' && errors?.[`${errorKeyPrefix}_voidFillWastage`]) || (material.packagingMaterialType === 'DIVIDER' && errors?.[`${errorKeyPrefix}_dividerWastage`]) ? (
                            <span className="text-red-600 text-xs mt-1">
                              {(material.packagingMaterialType === 'CARTON BOX' && errors[`${errorKeyPrefix}_cartonBoxWastage`]) || (material.packagingMaterialType === 'CORNER PROTECTORS' && errors[`${errorKeyPrefix}_cornerProtectorWastage`]) || (material.packagingMaterialType === 'EDGE PROTECTORS' && errors[`${errorKeyPrefix}_edgeProtectorWastage`]) || (material.packagingMaterialType === 'FOAM INSERT' && errors[`${errorKeyPrefix}_foamInsertWastage`]) || (material.packagingMaterialType === 'PALLET STRAP' && errors[`${errorKeyPrefix}_palletStrapWastage`]) || (material.packagingMaterialType === 'POLYBAG~Bale' && errors[`${errorKeyPrefix}_polybagBaleWastage`]) || (material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && errors[`${errorKeyPrefix}_polybagPolybagFlapWastage`]) || (material.packagingMaterialType === 'SILICA GEL DESICCANT' && errors[`${errorKeyPrefix}_silicaGelDesiccantWastage`]) || (material.packagingMaterialType === 'SHRINK TAPE' && errors[`${errorKeyPrefix}_stretchWrapWastage`]) || (material.packagingMaterialType === 'TAPE' && errors[`${errorKeyPrefix}_tapeWastage`]) || (material.packagingMaterialType === 'VOID~FILL' && errors[`${errorKeyPrefix}_voidFillWastage`]) || (material.packagingMaterialType === 'DIVIDER' && errors[`${errorKeyPrefix}_dividerWastage`])}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex items-end gap-4">
                    <div className="flex flex-col" style={{ width: `${typeFieldWidth}px` }}>
                      <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS</label>
                      <input
                        type="text"
                        value={material.surplus || ''}
                        onChange={(e) => onChange('surplus', e.target.value)}
                        className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_surplus`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        style={{ padding: '10px 14px', height: '44px', width: `${typeFieldWidth}px` }}
                        placeholder="%AGE"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">FOR-SECTION</label>
                      <input
                        type="text"
                        value={material.surplusForSection || ''}
                        onChange={(e) => onChange('surplusForSection', e.target.value)}
                        className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_surplusForSection`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                        style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                        placeholder="FOR"
                      />
                    </div>
                  </div>
                  )}

                  {/* Approval Against - Special handling for CARTON BOX, CORNER PROTECTORS, EDGE PROTECTORS, FOAM INSERT, PALLET STRAP, POLYBAG~Bale, POLYBAG~POLYBAG-FLAP, SILICA GEL DESICCANT, SHRINK TAPE, TAPE, VOID~FILL, and DIVIDER */}
                  {material.packagingMaterialType === 'SHIPPING MARK' ? null : material.packagingMaterialType === 'CARTON BOX' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.cartonBoxApproval || ''}
                        onChange={(selectedValue) => onChange('cartonBoxApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'CORNER PROTECTORS' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.cornerProtectorApproval || ''}
                        onChange={(selectedValue) => onChange('cornerProtectorApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'EDGE PROTECTORS' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.edgeProtectorApproval || ''}
                        onChange={(selectedValue) => onChange('edgeProtectorApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'FOAM INSERT' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.foamInsertApproval || ''}
                        onChange={(selectedValue) => onChange('foamInsertApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'PALLET STRAP' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.palletStrapApproval || ''}
                        onChange={(selectedValue) => onChange('palletStrapApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'POLYBAG~Bale' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.polybagBaleApproval || ''}
                        onChange={(selectedValue) => onChange('polybagBaleApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.polybagPolybagFlapApproval || ''}
                        onChange={(selectedValue) => onChange('polybagPolybagFlapApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'SILICA GEL DESICCANT' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.silicaGelDesiccantApproval || ''}
                        onChange={(selectedValue) => onChange('silicaGelDesiccantApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'SHRINK TAPE' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.stretchWrapApproval || ''}
                        onChange={(selectedValue) => onChange('stretchWrapApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'TAPE' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.tapeApproval || ''}
                        onChange={(selectedValue) => onChange('tapeApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'VOID~FILL' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.voidFillApproval || ''}
                        onChange={(selectedValue) => onChange('voidFillApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : material.packagingMaterialType === 'DIVIDER' ? (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                      <SearchableDropdown
                        value={material.dividerApproval || ''}
                        onChange={(selectedValue) => onChange('dividerApproval', selectedValue)}
                        options={PACKAGING_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                      />
                    </div>
                  ) : (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL AGAINST</label>
                    <SearchableDropdown
                      value={material.approvalAgainst || ''}
                      onChange={(selectedValue) => onChange('approvalAgainst', selectedValue)}
                      options={PACKAGING_APPROVAL_OPTIONS}
                      placeholder="Select or type Approval Against"
                    />
                  </div>
                  )}

                  {/* Remarks - For all types */}
                  <div className="col-span-full flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">REMARKS</label>
                    <textarea
                      value={material.remarks || ''}
                      onChange={(e) => onChange('remarks', e.target.value)}
                      className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_remarks`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                      style={{ padding: '10px 14px', width: '100%' }}
                      rows="2"
                      placeholder="Additional notes..."
                    ></textarea>
                  </div>

                  {/* SHIPPING MARK - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'SHIPPING MARK' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showShippingMarkAdvancedData', !material.showShippingMarkAdvancedData)}
                        style={{
                          backgroundColor: material.showShippingMarkAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showShippingMarkAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showShippingMarkAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showShippingMarkAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showShippingMarkAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showShippingMarkAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showShippingMarkAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showShippingMarkAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">QUALITY</label>
                              <SearchableDropdown
                                value={material.shippingMarkQuality || ''}
                                onChange={(selectedValue) => onChange('shippingMarkQuality', selectedValue)}
                                options={SHIPPING_MARK_QUALITY_OPTIONS}
                                placeholder="Select or type Quality"
                                strictMode={false}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkQuality`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              />
                              {errors?.[`${errorKeyPrefix}_shippingMarkQuality`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkQuality`]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">BARCODE STANDARD</label>
                              <SearchableDropdown
                                value={material.shippingMarkBarcodeStandard || ''}
                                onChange={(selectedValue) => onChange('shippingMarkBarcodeStandard', selectedValue)}
                                options={SHIPPING_MARK_BARCODE_OPTIONS}
                                placeholder="Select or type Barcode Standard"
                                strictMode={false}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkBarcodeStandard`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              />
                              {errors?.[`${errorKeyPrefix}_shippingMarkBarcodeStandard`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkBarcodeStandard`]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT METHOD</label>
                              <SearchableDropdown
                                value={material.shippingMarkPrintMethod || ''}
                                onChange={(selectedValue) => onChange('shippingMarkPrintMethod', selectedValue)}
                                options={SHIPPING_MARK_PRINT_METHOD_OPTIONS}
                                placeholder="Select or type Print Method"
                                strictMode={false}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkPrintMethod`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              />
                              {errors?.[`${errorKeyPrefix}_shippingMarkPrintMethod`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkPrintMethod`]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">GUMMING QUALITY</label>
                              <SearchableDropdown
                                value={material.shippingMarkGummingQuality || ''}
                                onChange={(selectedValue) => onChange('shippingMarkGummingQuality', selectedValue)}
                                options={SHIPPING_MARK_GUMMING_OPTIONS}
                                placeholder="Select or type Gumming Quality"
                                strictMode={false}
                                className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.[`${errorKeyPrefix}_shippingMarkGummingQuality`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                              />
                              {errors?.[`${errorKeyPrefix}_shippingMarkGummingQuality`] && <span className="text-red-600 text-xs mt-1">{errors[`${errorKeyPrefix}_shippingMarkGummingQuality`]}</span>}
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">VARIABLE DATA</label>
                              <TestingRequirementsInput
                                value={asArray(material.shippingMarkVariableData)}
                                onChange={(vals) => onChange('shippingMarkVariableData', vals)}
                                options={SHIPPING_MARK_VARIABLE_DATA_OPTIONS}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_shippingMarkVariableData`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* POLYBAG~Bale INNER~CASEAPACK: Polybag count + summary + per-IPC table - placed after Remarks */}
                  {material.packagingMaterialType === 'POLYBAG~Bale' && material.polybagBalePackagingType === 'INNER~CASEAPACK' && (
                    <div className="col-span-full" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px', padding: '24px', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>POLYBAG (count)</label>
                        <input
                          type="number"
                          min={1}
                          value={material.polybagBalePolybagCount ?? ''}
                          onChange={(e) => onChange('polybagBalePolybagCount', e.target.value)}
                          className={cn('border-2 rounded-lg text-sm bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]')}
                          style={{ padding: '10px 14px', height: '44px', width: '120px' }}
                          placeholder="e.g. 3"
                        />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', padding: '16px 20px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Casepack:</span>
                        <span style={{ fontSize: '14px', color: '#111827' }}>{casepack || '—'}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginLeft: '8px' }}>Inner QTY:</span>
                        <span style={{ fontSize: '14px', color: '#111827' }}>{innerQty > 0 ? Math.round(innerQty * 100) / 100 : '—'}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginLeft: '8px' }}>Polybag:</span>
                        <span style={{ fontSize: '14px', color: '#111827' }}>{polybagNum || '—'}</span>
                      </div>
                      {selectedIpcs.length > 0 && (
                        <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>PO</th>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>IPC</th>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>IMAGE</th>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>ASSD QTY</th>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>INNER QTY</th>
                                  <th style={{ textAlign: 'left', fontWeight: 600, color: '#374151', padding: '14px 16px' }}>REQUIRED MATERIAL QTY</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedIpcs.map((ipc) => {
                                  const { poQty, imagePreview } = getPoQtyAndImageForIpc(skus, ipc);
                                  const assd = parseFloat(String(assdByIpc[ipc] ?? '').trim()) || 0;
                                  const reqMaterial = innerQty > 0 ? assd / innerQty : 0;
                                  return (
                                    <tr key={ipc} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                      <td style={{ padding: '14px 16px', color: '#111827' }}>{poQty !== '' && poQty !== undefined ? poQty : '—'}</td>
                                      <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 500 }}>{ipc}</td>
                                      <td style={{ padding: '12px 16px' }}>
                                        {imagePreview ? (
                                          <img src={imagePreview} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', border: '1px solid #e5e7eb', objectFit: 'cover' }} />
                                        ) : (
                                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" strokeWidth="1.5" /></svg>
                                          </div>
                                        )}
                                      </td>
                                      <td style={{ padding: '12px 16px' }}>
                                        <input
                                          type="number"
                                          min={0}
                                          value={assdByIpc[ipc] ?? ''}
                                          onChange={(e) => {
                                            const next = { ...assdByIpc, [ipc]: e.target.value };
                                            onChange('polybagBaleAssdQtyByIpc', next);
                                          }}
                                          className={cn('border-2 rounded-lg text-sm w-full bg-white text-gray-900 focus:border-indigo-500 focus:outline-none border-[#e5e7eb]')}
                                          style={{ padding: '8px 12px', maxWidth: '100px' }}
                                          placeholder="0"
                                        />
                                      </td>
                                      <td style={{ padding: '14px 16px', color: '#111827' }}>{innerQty > 0 ? Math.round(innerQty * 100) / 100 : '—'}</td>
                                      <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 500 }}>{reqMaterial > 0 ? Math.round(reqMaterial * 100) / 100 : '—'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FOAM INSERT - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'FOAM INSERT' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showFoamInsertAdvancedData', !material.showFoamInsertAdvancedData)}
                        style={{
                          backgroundColor: material.showFoamInsertAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showFoamInsertAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showFoamInsertAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showFoamInsertAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showFoamInsertAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showFoamInsertAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showFoamInsertAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showFoamInsertAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CAVITY/CUT-OUT</label>
                              <TestingRequirementsInput
                                value={asArray(material.foamInsertCavityCutout)}
                                onChange={(vals) => onChange('foamInsertCavityCutout', vals)}
                                options={['Single Cavity', 'Multi-Cavity', 'Through-Cut', 'Partial Cut']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_foamInsertCavityCutout`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ANTI-STATIC</label>
                              <TestingRequirementsInput
                                value={asArray(material.foamInsertAntiStatic)}
                                onChange={(vals) => onChange('foamInsertAntiStatic', vals)}
                                options={['Standard', 'Anti-Static (Pink/Black)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_foamInsertAntiStatic`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">LAMINATION</label>
                              <TestingRequirementsInput
                                value={asArray(material.foamInsertLamination)}
                                onChange={(vals) => onChange('foamInsertLamination', vals)}
                                options={['None', 'PE Film', 'Fabric', 'Foil']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_foamInsertLamination`]}
                              />
                            </div>
                  </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PALLET STRAP - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'PALLET STRAP' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showPalletStrapAdvancedData', !material.showPalletStrapAdvancedData)}
                        style={{
                          backgroundColor: material.showPalletStrapAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showPalletStrapAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showPalletStrapAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showPalletStrapAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showPalletStrapAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showPalletStrapAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showPalletStrapAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showPalletStrapAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">TENSILE STRENGTH</label>
                              <TestingRequirementsInput
                                value={asArray(material.palletStrapTensileStrength)}
                                onChange={(vals) => onChange('palletStrapTensileStrength', vals)}
                                options={['150 kg', '200 kg', '250 kg', '300 kg', '400 kg', '500 kg+']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_palletStrapTensileStrength`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CORE SIZE</label>
                              <TestingRequirementsInput
                                value={asArray(material.palletStrapCoreSize)}
                                onChange={(vals) => onChange('palletStrapCoreSize', vals)}
                                options={['200mm', '400mm', '406mm (16\")']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_palletStrapCoreSize`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* POLYBAG~Bale - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'POLYBAG~Bale' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showPolybagBaleAdvancedData', !material.showPolybagBaleAdvancedData)}
                        style={{
                          backgroundColor: material.showPolybagBaleAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showPolybagBaleAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showPolybagBaleAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showPolybagBaleAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showPolybagBaleAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showPolybagBaleAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showPolybagBaleAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showPolybagBaleAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ARTWORK SPEC</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => onChange('polybagBaleArtworkSpec', e.target.files[0])}
                                  className="hidden"
                                  id={`polybag-bale-artwork-${safeIndex}`}
                                />
                                <label
                                  htmlFor={`polybag-bale-artwork-${safeIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                                  style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.polybagBaleArtworkSpec ? 'DONE' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBalePrinting)}
                                onChange={(vals) => onChange('polybagBalePrinting', vals)}
                                options={['Plain/Unprinted', '1-2 Color Printed', 'Repeating Logo']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBalePrinting`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CORE SIZE</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBaleCoreSize)}
                                onChange={(vals) => onChange('polybagBaleCoreSize', vals)}
                                options={['3\" core', '6\" core']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBaleCoreSize`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PERFORATION</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBalePerforation)}
                                onChange={(vals) => onChange('polybagBalePerforation', vals)}
                                options={['None', 'Perforated at intervals', 'Easy-Tear Perforation']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBalePerforation`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CLING/TACK</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBaleClingTack)}
                                onChange={(vals) => onChange('polybagBaleClingTack', vals)}
                                options={['Standard', 'High Cling (stretch wrap)', 'Low Cling']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBaleClingTack`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">UV STABILIZED</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBaleUvStabilized)}
                                onChange={(vals) => onChange('polybagBaleUvStabilized', vals)}
                                options={['Standard', 'UV Stabilized (outdoor storage)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBaleUvStabilized`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ANTI-STATIC</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagBaleAntiStatic)}
                                onChange={(vals) => onChange('polybagBaleAntiStatic', vals)}
                                options={['Standard', 'Anti-Static']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagBaleAntiStatic`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* POLYBAG~POLYBAG-FLAP - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'POLYBAG~POLYBAG-FLAP' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showPolybagPolybagFlapAdvancedData', !material.showPolybagPolybagFlapAdvancedData)}
                        style={{
                          backgroundColor: material.showPolybagPolybagFlapAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showPolybagPolybagFlapAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showPolybagPolybagFlapAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showPolybagPolybagFlapAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showPolybagPolybagFlapAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showPolybagPolybagFlapAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showPolybagPolybagFlapAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showPolybagPolybagFlapAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">SEAL TYPE</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapSealType)}
                                onChange={(vals) => onChange('polybagPolybagFlapSealType', vals)}
                                options={['Open Top (unsealed)', 'Heat Seal', 'Adhesive Seal', 'Zip Lock', 'Drawstring']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapSealType`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">VENT HOLES</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapVentHoles)}
                                onChange={(vals) => onChange('polybagPolybagFlapVentHoles', vals)}
                                options={['None', 'Single Hole', 'Multiple Holes', 'Perforated']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapVentHoles`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">SUFFOCATION WARNING</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapSuffocationWarning)}
                                onChange={(vals) => onChange('polybagPolybagFlapSuffocationWarning', vals)}
                                options={['Required (printed warning text per ASTM D3951)', 'Not Required']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapSuffocationWarning`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ARTWORK SPEC</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => onChange('polybagPolybagFlapArtworkSpec', e.target.files[0])}
                                  className="hidden"
                                  id={`polybag-polybag-flap-artwork-${safeIndex}`}
                                />
                                <label
                                  htmlFor={`polybag-polybag-flap-artwork-${safeIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                                  style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.polybagPolybagFlapArtworkSpec ? 'DONE' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapPrinting)}
                                onChange={(vals) => onChange('polybagPolybagFlapPrinting', vals)}
                                options={['Plain/Unprinted', '1 Color', '2 Color', 'Full Color']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapPrinting`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT COLOUR</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapPrintColour)}
                                onChange={(vals) => onChange('polybagPolybagFlapPrintColour', vals)}
                                options={['Black', 'White', 'Pantone', 'Custom']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapPrintColour`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT POSITION</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => onChange('polybagPolybagFlapPrintPosition', e.target.files[0])}
                                  className="hidden"
                                  id={`polybag-polybag-flap-print-position-${safeIndex}`}
                                />
                                <label
                                  htmlFor={`polybag-polybag-flap-print-position-${safeIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                                  style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.polybagPolybagFlapPrintPosition ? 'DONE' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ANTI-STATIC</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapAntiStatic)}
                                onChange={(vals) => onChange('polybagPolybagFlapAntiStatic', vals)}
                                options={['Standard', 'Anti-Static (ESD Safe)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapAntiStatic`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">FOOD GRADE</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapFoodGrade)}
                                onChange={(vals) => onChange('polybagPolybagFlapFoodGrade', vals)}
                                options={['Standard', 'FDA Approved Food Grade']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapFoodGrade`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">RECYCLABLE</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapRecyclable)}
                                onChange={(vals) => onChange('polybagPolybagFlapRecyclable', vals)}
                                options={['Standard', 'Recyclable Symbol Printed', 'Compostable']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapRecyclable`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CLARITY</label>
                              <TestingRequirementsInput
                                value={asArray(material.polybagPolybagFlapClarity)}
                                onChange={(vals) => onChange('polybagPolybagFlapClarity', vals)}
                                options={['Clear', 'Frosted/Matte', 'Opaque White', 'Opaque Black', 'Tinted']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_polybagPolybagFlapClarity`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SILICA GEL DESICCANT - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'SILICA GEL DESICCANT' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showSilicaGelDesiccantAdvancedData', !material.showSilicaGelDesiccantAdvancedData)}
                        style={{
                          backgroundColor: material.showSilicaGelDesiccantAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showSilicaGelDesiccantAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showSilicaGelDesiccantAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showSilicaGelDesiccantAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showSilicaGelDesiccantAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showSilicaGelDesiccantAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showSilicaGelDesiccantAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showSilicaGelDesiccantAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ABSORPTION CAPACITY</label>
                              <TestingRequirementsInput
                                value={asArray(material.silicaGelDesiccantAbsorptionCapacity)}
                                onChange={(vals) => onChange('silicaGelDesiccantAbsorptionCapacity', vals)}
                                options={['20% of own weight', '30% of own weight', '40% of own weight']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_silicaGelDesiccantAbsorptionCapacity`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">INDICATING TYPE</label>
                              <TestingRequirementsInput
                                value={asArray(material.silicaGelDesiccantIndicatingType)}
                                onChange={(vals) => onChange('silicaGelDesiccantIndicatingType', vals)}
                                options={['Non-Indicating', 'Blue (Cobalt)', 'Orange (Cobalt-free)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_silicaGelDesiccantIndicatingType`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PACKET MATERIAL</label>
                              <TestingRequirementsInput
                                value={asArray(material.silicaGelDesiccantPacketMaterial)}
                                onChange={(vals) => onChange('silicaGelDesiccantPacketMaterial', vals)}
                                options={['Tyvek', 'Non-Woven', 'Cotton Paper', 'OPP Film']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_silicaGelDesiccantPacketMaterial`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PACKET SIZE</label>
                              <TestingRequirementsInput
                                value={asArray(material.silicaGelDesiccantPacketSize)}
                                onChange={(vals) => onChange('silicaGelDesiccantPacketSize', vals)}
                                options={['25x35mm', '30x50mm', '50x70mm', 'Custom']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_silicaGelDesiccantPacketSize`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">FOOD SAFE</label>
                              <TestingRequirementsInput
                                value={asArray(material.silicaGelDesiccantFoodSafe)}
                                onChange={(vals) => onChange('silicaGelDesiccantFoodSafe', vals)}
                                options={['FDA Compliant', 'Food Contact Safe']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_silicaGelDesiccantFoodSafe`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SHRINK TAPE - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'SHRINK TAPE' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showStretchWrapAdvancedData', !material.showStretchWrapAdvancedData)}
                        style={{
                          backgroundColor: material.showStretchWrapAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showStretchWrapAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showStretchWrapAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showStretchWrapAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showStretchWrapAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showStretchWrapAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showStretchWrapAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showStretchWrapAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">STRETCH %</label>
                              <TestingRequirementsInput
                                value={asArray(material.stretchWrapStretchPercent)}
                                onChange={(vals) => onChange('stretchWrapStretchPercent', vals)}
                                options={['100%', '150%', '200%', '250%', '300%']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_stretchWrapStretchPercent`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CORE SIZE</label>
                              <TestingRequirementsInput
                                value={asArray(material.stretchWrapCoreSize)}
                                onChange={(vals) => onChange('stretchWrapCoreSize', vals)}
                                options={['38mm', '50mm (hand)', '76mm (machine)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_stretchWrapCoreSize`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">UV STABILIZED</label>
                              <TestingRequirementsInput
                                value={asArray(material.stretchWrapUvStabilized)}
                                onChange={(vals) => onChange('stretchWrapUvStabilized', vals)}
                                options={['Standard', 'UV Protected']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_stretchWrapUvStabilized`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">VCI (Anti-Corrosion)</label>
                              <TestingRequirementsInput
                                value={asArray(material.stretchWrapVci)}
                                onChange={(vals) => onChange('stretchWrapVci', vals)}
                                options={['Standard', 'VCI Film']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_stretchWrapVci`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAPE - Advance Data Button and Fields */}
                  {material.packagingMaterialType === 'TAPE' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showTapeAdvancedData', !material.showTapeAdvancedData)}
                        style={{
                          backgroundColor: material.showTapeAdvancedData ? '#667eea' : '#ffffff',
                          borderColor: material.showTapeAdvancedData ? '#667eea' : '#e5e7eb',
                          color: material.showTapeAdvancedData ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showTapeAdvancedData ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showTapeAdvancedData) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showTapeAdvancedData) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showTapeAdvancedData ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showTapeAdvancedData && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">COLOUR</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapeColour)}
                                onChange={(vals) => onChange('tapeColour', vals)}
                                options={['Clear/Transparent', 'Brown/Tan', 'White', 'Black', 'Custom Color']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapeColour`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ADHESIVE TYPE</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapeAdhesiveType)}
                                onChange={(vals) => onChange('tapeAdhesiveType', vals)}
                                options={['Acrylic (general)', 'Hot Melt (strong)', 'Solvent/Rubber (economy)', 'Water-Activated (paper)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapeAdhesiveType`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ARTWORK SPEC</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => onChange('tapeArtworkSpec', e.target.files[0])}
                                  className="hidden"
                                  id={`tape-artwork-${safeIndex}`}
                                />
                                <label
                                  htmlFor={`tape-artwork-${safeIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                                  style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.tapeArtworkSpec ? 'DONE' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapePrinting)}
                                onChange={(vals) => onChange('tapePrinting', vals)}
                                options={['Plain/Unprinted', '1 Color', '2 Color', 'Full Color']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapePrinting`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT REPEAT</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapePrintRepeat)}
                                onChange={(vals) => onChange('tapePrintRepeat', vals)}
                                options={['Continuous repeat distance (e.g., every 6 inches)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapePrintRepeat`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CORE SIZE</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapeCoreSize)}
                                onChange={(vals) => onChange('tapeCoreSize', vals)}
                                options={['3\" core', '1\" core', '1.5\" core', 'Custom']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapeCoreSize`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">NOISE LEVEL</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapeNoiseLevel)}
                                onChange={(vals) => onChange('tapeNoiseLevel', vals)}
                                options={['Standard (noisy)', 'Low Noise/Quiet']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapeNoiseLevel`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">TEMPERATURE RANGE</label>
                              <TestingRequirementsInput
                                value={asArray(material.tapeTemperatureRange)}
                                onChange={(vals) => onChange('tapeTemperatureRange', vals)}
                                options={['Standard', 'Cold Temperature', 'High Temperature']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_tapeTemperatureRange`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CARTON BOX - Advance Spec Button and Fields */}
                  {material.packagingMaterialType === 'CARTON BOX' && (
                    <div className="col-span-full w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => onChange('showCartonBoxAdvancedSpec', !material.showCartonBoxAdvancedSpec)}
                        style={{
                          backgroundColor: material.showCartonBoxAdvancedSpec ? '#667eea' : '#ffffff',
                          borderColor: material.showCartonBoxAdvancedSpec ? '#667eea' : '#e5e7eb',
                          color: material.showCartonBoxAdvancedSpec ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showCartonBoxAdvancedSpec ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showCartonBoxAdvancedSpec) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showCartonBoxAdvancedSpec) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showCartonBoxAdvancedSpec ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showCartonBoxAdvancedSpec && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ARTWORK SPEC</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => onChange('cartonBoxArtworkSpec', e.target.files[0])}
                                  className="hidden"
                                  id={`carton-box-artwork-${safeIndex}`}
                                />
                                <label
                                  htmlFor={`carton-box-artwork-${safeIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb] flex-shrink-0"
                                  style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.cartonBoxArtworkSpec ? 'DONE' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PAPER GSM</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxPaperGsm)}
                                onChange={(vals) => onChange('cartonBoxPaperGsm', vals)}
                                options={['150/120/180 GSM', '180/150/200 GSM', '200/150/250 GSM']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxPaperGsm`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">FLUTE TYPE</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxFluteType)}
                                onChange={(vals) => onChange('cartonBoxFluteType', vals)}
                                options={['A Flute (5mm)', 'B Flute (3mm)', 'C Flute (4mm)', 'E Flute (1.5mm)', 'F Flute (0.8mm)', 'BC Double Wall', 'EB Double Wall']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxFluteType`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">ECT (Edge Crush Test)</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxEct)}
                                onChange={(vals) => onChange('cartonBoxEct', vals)}
                                options={['32 ECT', '44 ECT', '48 ECT', '52 ECT']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxEct`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxPrinting)}
                                onChange={(vals) => onChange('cartonBoxPrinting', vals)}
                                options={['Plain/Unprinted', '1 Color', '2 Color', 'Full Color (Flexo/Litho Laminated)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxPrinting`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT CONTENT</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxPrintContent)}
                                onChange={(vals) => onChange('cartonBoxPrintContent', vals)}
                                options={['Shipping Marks', 'Brand Logo', 'Handling Instructions', 'Barcode']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxPrintContent`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">PRINT COLOUR</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxPrintColour)}
                                onChange={(vals) => onChange('cartonBoxPrintColour', vals)}
                                options={['Black', 'Blue', 'Red', 'Pantone', 'Process (CMYK)']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxPrintColour`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">COATING/TREATMENT</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxCoatingTreatment)}
                                onChange={(vals) => onChange('cartonBoxCoatingTreatment', vals)}
                                options={['None', 'Wax Coated (moisture)', 'PE Laminated', 'Water Resistant']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxCoatingTreatment`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">HAND HOLES</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxHandHoles)}
                                onChange={(vals) => onChange('cartonBoxHandHoles', vals)}
                                options={['None', 'Punched Hand Holes', 'Die-Cut Hand Holes']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxHandHoles`]}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">CERTIFICATION</label>
                              <TestingRequirementsInput
                                value={asArray(material.cartonBoxCertification)}
                                onChange={(vals) => onChange('cartonBoxCertification', vals)}
                                options={['FSC Certified', 'ISO Certified', 'None']}
                                placeholder="Type to search or select..."
                                error={errors?.[`${errorKeyPrefix}_cartonBoxCertification`]}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
      </div>
    )}
  </>
  );
};

export default PackagingMaterialTypeFields;
