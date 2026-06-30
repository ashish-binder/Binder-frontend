// FiberPolyester — extracted from FiberSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FiberPolyester = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
  mergeOptions,
  addCustomOption,
}) => (
  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* FIBER TYPE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2">FIBER TYPE <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.fiberFiberType || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberFiberType', selectedValue)}
                            options={mergeOptions(['Polyester (PET)', 'Recycled Polyester (rPET)'], 'Fiber', 'fiberFiberType')}
                            onCustomValue={(val) => addCustomOption('Fiber', 'fiberFiberType', '', val)}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors[`rawMaterial_${actualIndex}_fiberFiberType`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                          />
                          {errors[`rawMaterial_${actualIndex}_fiberFiberType`] && <span className="text-red-600 text-xs mt-1">{errors[`rawMaterial_${actualIndex}_fiberFiberType`]}</span>}
                        </div>

                      {/* SUBTYPE */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">SUBTYPE <span className="text-red-500">*</span></label>
                        <SearchableDropdown
                          value={material.fiberSubtype || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberSubtype', selectedValue)}
                          options={mergeOptions(['Virgin', 'Recycled', 'Conjugate', 'Hollow Conjugate'], 'Fiber', 'fiberSubtype', material.fiberFiberType || '')}
                          onCustomValue={(val) => addCustomOption('Fiber', 'fiberSubtype', material.fiberFiberType || '', val)}
                          placeholder="Select or type"
                          className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors[`rawMaterial_${actualIndex}_fiberSubtype`] ? 'border-red-600' : 'border-[#e5e7eb]'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                        {errors[`rawMaterial_${actualIndex}_fiberSubtype`] && <span className="text-red-600 text-xs mt-1">{errors[`rawMaterial_${actualIndex}_fiberSubtype`]}</span>}
                      </div>

                      {/* FORM */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">FORM</label>
                        <SearchableDropdown
                          value={material.fiberForm || ''}
                          onChange={(selectedValue) => {
                            handleRawMaterialChange(actualIndex, 'fiberForm', selectedValue);
                            // Clear dependent fields when form changes
                            if (selectedValue !== material.fiberForm) {
                              handleRawMaterialChange(actualIndex, 'fiberQty', '');
                              handleRawMaterialChange(actualIndex, 'fiberGsm', '');
                              handleRawMaterialChange(actualIndex, 'fiberLength', '');
                              handleRawMaterialChange(actualIndex, 'fiberWidth', '');
                              handleRawMaterialChange(actualIndex, 'fiberQtyValue', '');
                              handleRawMaterialChange(actualIndex, 'fiberQtyType', '');
                            }
                          }}
                          options={['Loose Fiber', 'Wadding/Batt', 'Carded Cotton', 'Bleached Cotton', 'Linter']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* DENIER */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">DENIER</label>
                        <SearchableDropdown
                          value={material.fiberDenier || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberDenier', selectedValue)}
                          options={['1D', '1.2D', '3D', '6D', '7D', '10D', '15D']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* SILICONIZED */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">SILICONIZED</label>
                        <SearchableDropdown
                          value={material.fiberSiliconized || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberSiliconized', selectedValue)}
                          options={['Non-Siliconized', 'Siliconized (slick finish)', 'Super Siliconized']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* CONJUGATE/CRIMP */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">CONJUGATE/CRIMP</label>
                        <SearchableDropdown
                          value={material.fiberConjugateCrimp || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberConjugateCrimp', selectedValue)}
                          options={['Non-Conjugate (straight)', 'Conjugate (crimped)', '3D Crimp']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* COLOUR */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COLOUR</label>
                        <SearchableDropdown
                          value={material.fiberColour || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberColour', selectedValue)}
                          options={['Optical White', 'Natural White', 'Dope Dyed (solution dyed)']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* TESTING REQUIREMENTS - Multi-select with chips */}
                      <div className="flex flex-col col-span-1 md:col-span-2 lg:col-span-4">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TESTING REQUIREMENTS</label>
                        <div style={{ position: 'relative' }}>
                          <div
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus-within:border-indigo-500 focus-within:outline-none"
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
                            {(Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : []).map((req, index) => (
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
                                    const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
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
                              id={`fiber-testing-wrapper-${actualIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                                                            <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Fiber Fineness', 'Loft Recovery', 'Compression Resilience', 'Cleanliness'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Fiber Fineness', 'Loft Recovery', 'Compression Resilience', 'Cleanliness']}
                                placeholder={(Array.isArray(material.fiberTestingRequirements) && material.fiberTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
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
                                      const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                                      const options = ['Fiber Fineness', 'Loft Recovery', 'Compression Resilience', 'Cleanliness'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
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
                                    const options = ['Fiber Fineness', 'Loft Recovery', 'Compression Resilience', 'Cleanliness'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                                      }
                                    }
                                    input.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Conditional Fields based on FORM */}
                      {material.fiberForm === 'Loose Fiber' && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2">QTY</label>
                          <input
                            type="text"
                            value={material.fiberQty || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberQty', e.target.value)}
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 14px', height: '44px', width: '300px' }}
                            placeholder="Enter QTY in KGS"
                          />
                        </div>
                      )}

                      {material.fiberForm === 'Wadding/Batt' && (
                        <>
                          {/* SIZE SPEC Section */}
                          <div className="col-span-1 md:col-span-2 lg:col-span-4" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                            <label className="text-sm font-bold text-gray-800 mb-4 block">SIZE SPEC</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* GSM */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">GSM</label>
                                <input
                                  type="text"
                                  value={material.fiberGsm || ''}
                                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberGsm', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter GSM"
                                />
                              </div>
                              
                              {/* LENGTH (CM) */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">LENGTH (CM)</label>
                                <input
                                  type="text"
                                  value={material.fiberLength || ''}
                                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberLength', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter length"
                                />
                              </div>
                              
                              {/* WIDTH (CM) */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">WIDTH (CM)</label>
                                <input
                                  type="text"
                                  value={material.fiberWidth || ''}
                                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberWidth', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter width"
                                />
                              </div>
                            </div>
                            
                            {/* QTY with dropdown (KGS/Yardage) - Full width below the grid */}
                            <div className="flex flex-col" style={{ marginTop: '16px' }}>
                              <label className="text-sm font-semibold text-gray-700 mb-2">QTY</label>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: 'fit-content' }}>
                                <SearchableDropdown
                                  value={material.fiberQtyType || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberQtyType', selectedValue)}
                                  options={['KGS', 'Yardage']}
                                  placeholder="Select"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px', width: '120px', flexShrink: 0 }}
                                />
                                <input
                                  type="text"
                                  value={material.fiberQtyValue || ''}
                                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberQtyValue', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px', width: '200px', flexShrink: 0 }}
                                  placeholder="Enter value"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* SURPLUS % */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS %</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={material.fiberSurplus || ''}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                              handleRawMaterialChange(actualIndex, 'fiberSurplus', numericValue);
                            }}
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 32px 10px 14px', width: '100%', height: '44px' }}
                            placeholder="2-5%"
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                        </div>
                      </div>

                      {/* WASTAGE % */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">WASTAGE %</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={material.fiberWastage || ''}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                              handleRawMaterialChange(actualIndex, 'fiberWastage', numericValue);
                            }}
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 32px 10px 14px', width: '100%', height: '44px' }}
                            placeholder="2-5%"
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                        </div>
                      </div>

                      {/* APPROVAL */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                        <SearchableDropdown
                          value={material.fiberApproval || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberApproval', selectedValue)}
                          options={MATERIAL_APPROVAL_OPTIONS}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* REMARKS */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">REMARKS</label>
                        <textarea
                          value={material.fiberRemarks || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberRemarks', e.target.value)}
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', minHeight: '44px' }}
                          rows="1"
                          placeholder="7D Hollow Siliconized for premium pillows, Ball fiber for machine washable products"
                        />
                      </div>

                      {/* ADVANCE SPEC Button and Fields */}
                      <div className="col-span-1 md:col-span-2 lg:col-span-4 w-full" style={{ marginTop: '20px' }}>
                        <button
                          type="button"
                          onClick={() => handleRawMaterialChange(actualIndex, 'showFiberAdvancedSpec', !material.showFiberAdvancedSpec)}
                          style={{
                            backgroundColor: material.showFiberAdvancedSpec ? '#667eea' : '#ffffff',
                            borderColor: material.showFiberAdvancedSpec ? '#667eea' : '#e5e7eb',
                            color: material.showFiberAdvancedSpec ? '#ffffff' : '#374151',
                            border: '2px solid',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.2s',
                            boxShadow: material.showFiberAdvancedSpec ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!material.showFiberAdvancedSpec) {
                              e.target.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!material.showFiberAdvancedSpec) {
                              e.target.style.backgroundColor = '#ffffff';
                            }
                          }}
                        >
                          {material.showFiberAdvancedSpec ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                        </button>
                        {material.showFiberAdvancedSpec && (
                          <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* FIBER LENGTH */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">FIBER LENGTH</label>
                                <SearchableDropdown
                                  value={material.fiberFiberLength || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberFiberLength', selectedValue)}
                                  options={['32mm', '51mm', '64mm (Staple Length)']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* STRUCTURE */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">STRUCTURE</label>
                                <SearchableDropdown
                                  value={material.fiberStructure || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberStructure', selectedValue)}
                                  options={['Solid', 'Hollow (2-hole)', 'Hollow (4-hole)', 'Hollow (7-hole)', 'Spiral Hollow']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* THERMAL BONDED */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">THERMAL BONDED</label>
                                <SearchableDropdown
                                  value={material.fiberThermalBonded || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberThermalBonded', selectedValue)}
                                  options={['Non-Bonded', 'Thermal Bonded', 'Spray Bonded', 'Resin Bonded']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* ANTI-MICROBIAL */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">ANTI-MICROBIAL</label>
                                <SearchableDropdown
                                  value={material.fiberAntiMicrobial || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberAntiMicrobial', selectedValue)}
                                  options={['Standard', 'Anti-Microbial Treated', 'Anti-Bacterial']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* FIRE RETARDANT */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">FIRE RETARDANT</label>
                                <SearchableDropdown
                                  value={material.fiberFireRetardant || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberFireRetardant', selectedValue)}
                                  options={['Standard', 'FR Treated (CFR 1633)', 'FR Treated (TB 117)']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* CERTIFICATION */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">CERTIFICATION</label>
                                <SearchableDropdown
                                  value={material.fiberCertification || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberCertification', selectedValue)}
                                  options={['OEKO-TEX Standard 100', 'GRS (Global Recycled Standard)', 'Bluesign']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>

                              {/* LOFT / FILL POWER */}
                              <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">LOFT / FILL POWER</label>
                                <SearchableDropdown
                                  value={material.fiberLoftFillPower || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberLoftFillPower', selectedValue)}
                                  options={['Low Loft', 'Medium Loft', 'High Loft (specify inches)']}
                                  placeholder="Select or type"
                                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Quality Verification - after Advance Spec, inside top-border block */}
                        <div className="w-full" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <QualityVerificationToggle
                            value={material.qualityVerification}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'qualityVerification', value)}
                            width="lg"
                            className="mb-3"
                          />
                        </div>
                      </div>
                    </div>
  </>
);

export default FiberPolyester;
