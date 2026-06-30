// StitchingThreadSpec — extracted from Step2.jsx (BOM & WIP). Pure presentational; all
// state lives in the GenerateFactoryCode orchestrator and arrives via props.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const StitchingThreadSpec = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
  handleProcurementDateChange,
  todayDate,
}) => (
  <>
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                  <h3 className="text-sm font-bold text-gray-800 mb-4">STITCHING THREAD SPECIFICATIONS</h3>
                  
                  <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* TYPE */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TYPE</label>
                        <SearchableDropdown
                          value={material.stitchingThreadType || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadType', value)}
                          options={['Spun Polyester', 'Cotton', 'Core Spun', 'Nylon/Polyamide', 'Textured', 'Bonded']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* FIBRE CONTENT */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">FIBRE CONTENT</label>
                        <SearchableDropdown
                          value={material.stitchingThreadFibreContent || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadFibreContent', value)}
                          options={['100% Spun Poly', '100% Cotton', 'Poly/Cotton Core', '100% Nylon']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* COUNT/TICKET */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COUNT/TICKET</label>
                        <SearchableDropdown
                          value={material.stitchingThreadCountTicket || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadCountTicket', value)}
                          options={['Ticket No. (T-70)', '40/2', '60/3', '120/2', 'Metric (Nm)']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* Use Type */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Use Type</label>
                        <SearchableDropdown
                          value={material.stitchingThreadUseType || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadUseType', value)}
                          options={['Main Seam', 'Overlock', 'Embroidery', 'Top Stitch', 'Buttonhole', 'Bartack']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* TEX */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">TEX</label>
                        <input
                          type="text"
                          value={material.stitchingThreadTex || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'stitchingThreadTex', e.target.value)}
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Enter TEX"
                        />
                      </div>

                      {/* PLY */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">PLY</label>
                        <SearchableDropdown
                          value={material.stitchingThreadPly || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadPly', value)}
                          options={['2 Ply', '3 Ply', '4 Ply']}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* COLOUR */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">COLOUR</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <SearchableDropdown
                            value={material.stitchingThreadColour || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadColour', value)}
                            options={['Pantone TPX/TCX', 'Shade Card Reference', 'DTM']}
                            placeholder="Select or type"
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 14px', height: '44px', flex: 1 }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleRawMaterialChange(actualIndex, 'stitchingThreadColourRefImage', reader.result);
                                  handleRawMaterialChange(actualIndex, 'stitchingThreadColourRefFile', file);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id={`stitching-thread-colour-upload-${actualIndex}`}
                          />
                          <label
                            htmlFor={`stitching-thread-colour-upload-${actualIndex}`}
                            className="border-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-[#e5e7eb] hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600"
                            style={{ padding: '10px 14px', height: '44px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}
                          >
                            UPLOAD
                          </label>
                        </div>
                        {material.stitchingThreadColourRefImage && (
                          <div style={{ marginTop: '8px' }}>
                            <img src={material.stitchingThreadColourRefImage} alt="Color reference" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                          </div>
                        )}
                      </div>

                      {/* REF */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">REF</label>
                        <input
                          type="text"
                          value={material.stitchingThreadRef || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'stitchingThreadRef', e.target.value)}
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Enter reference"
                        />
                      </div>

                      {/* TESTING REQUIREMENTS - SearchableDropdown with text key (same as fiber) */}
                      <div className="flex flex-col col-span-1 md:col-span-2 lg:col-span-3">
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
                            {(Array.isArray(material.stitchingThreadTestingRequirements) ? material.stitchingThreadTestingRequirements : []).map((req, index) => (
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
                                    const current = Array.isArray(material.stitchingThreadTestingRequirements) ? material.stitchingThreadTestingRequirements : [];
                                    const updated = current.filter((_, i) => i !== index);
                                    handleRawMaterialChange(actualIndex, 'stitchingThreadTestingRequirements', updated);
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
                              id={`stitching-thread-testing-wrapper-${actualIndex}`}
                              style={{ flex: 1, minWidth: '200px' }}
                            >
                              <SearchableDropdown
                                value=""
                                strictMode={false}
                                onChange={(selectedValue) => {
                                  const options = ['Tensile Strength', 'Elongation', 'Abrasion', 'Colour Fastness'];
                                  if (selectedValue && options.includes(selectedValue)) {
                                    const current = Array.isArray(material.stitchingThreadTestingRequirements) ? material.stitchingThreadTestingRequirements : [];
                                    if (!current.includes(selectedValue)) {
                                      const updated = [...current, selectedValue];
                                      handleRawMaterialChange(actualIndex, 'stitchingThreadTestingRequirements', updated);
                                    }
                                  }
                                }}
                                options={['Tensile Strength', 'Elongation', 'Abrasion', 'Colour Fastness']}
                                placeholder={(Array.isArray(material.stitchingThreadTestingRequirements) && material.stitchingThreadTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
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
                                      const current = Array.isArray(material.stitchingThreadTestingRequirements) ? material.stitchingThreadTestingRequirements : [];
                                      const options = ['Tensile Strength', 'Elongation', 'Abrasion', 'Colour Fastness'];
                                      if (!current.includes(newValue)) {
                                        if (!options.includes(newValue)) {
                                          const updated = [...current, newValue];
                                          handleRawMaterialChange(actualIndex, 'stitchingThreadTestingRequirements', updated);
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
                                    const options = ['Tensile Strength', 'Elongation', 'Abrasion', 'Colour Fastness'];
                                    if (!options.includes(typedValue)) {
                                      const current = Array.isArray(material.stitchingThreadTestingRequirements) ? material.stitchingThreadTestingRequirements : [];
                                      if (!current.includes(typedValue)) {
                                        const updated = [...current, typedValue];
                                        handleRawMaterialChange(actualIndex, 'stitchingThreadTestingRequirements', updated);
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

                      {/* QTY (CNS) - single field */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">QTY (CNS) <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={material.stitchingThreadQty ?? ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'stitchingThreadQty', e.target.value)}
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Enter quantity"
                        />
                      </div>

                      {/* UNIT - Yardage or Kgs */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">UNIT <span className="text-red-600">*</span></label>
                        <SearchableDropdown
                          value={material.stitchingThreadUnit || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadUnit', value)}
                          options={['Yardage', 'Kgs']}
                          placeholder="Select unit"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* SURPLUS % */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS %</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={material.stitchingThreadSurplus || ''}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                              handleRawMaterialChange(actualIndex, 'stitchingThreadSurplus', numericValue);
                            }}
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 32px 10px 14px', height: '44px', width: '100%' }}
                            placeholder=""
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
                            value={material.stitchingThreadWastage || ''}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                              handleRawMaterialChange(actualIndex, 'stitchingThreadWastage', numericValue);
                            }}
                            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                            style={{ padding: '10px 32px 10px 14px', height: '44px', width: '100%' }}
                            placeholder=""
                          />
                          <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
                        </div>
                      </div>

                      {/* APPROVAL */}
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                        <SearchableDropdown
                          value={material.stitchingThreadApproval || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadApproval', value)}
                          options={MATERIAL_APPROVAL_OPTIONS}
                          placeholder="Select or type"
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                        />
                      </div>

                      {/* REMARKS */}
                      <div className="flex flex-col col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-semibold text-gray-700 mb-2">REMARKS</label>
                        <input
                          type="text"
                          value={material.stitchingThreadRemarks || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'stitchingThreadRemarks', e.target.value)}
                          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="Enter remarks"
                        />
                      </div>
                    </div>

                    {/* ADV DATA Button and ADVANCE SPEC Section */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 w-full" style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => handleRawMaterialChange(actualIndex, 'showStitchingThreadAdvancedSpec', !material.showStitchingThreadAdvancedSpec)}
                        style={{
                          backgroundColor: material.showStitchingThreadAdvancedSpec ? '#667eea' : '#ffffff',
                          borderColor: material.showStitchingThreadAdvancedSpec ? '#667eea' : '#e5e7eb',
                          color: material.showStitchingThreadAdvancedSpec ? '#ffffff' : '#374151',
                          border: '2px solid',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.2s',
                          boxShadow: material.showStitchingThreadAdvancedSpec ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showStitchingThreadAdvancedSpec) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showStitchingThreadAdvancedSpec) {
                            e.target.style.backgroundColor = '#ffffff';
                          }
                        }}
                      >
                        {material.showStitchingThreadAdvancedSpec ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
                      </button>
                      {material.showStitchingThreadAdvancedSpec && (
                        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                          <h4 className="text-sm font-semibold text-gray-800 mb-4">ADVANCE SPEC</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* FINISH */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">FINISH</label>
                              <SearchableDropdown
                                value={material.stitchingThreadFinish || ''}
                                onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadFinish', value)}
                                options={['Bonded', 'Lubricated', 'Matte', 'Glossy', 'Mercerized', 'Soft']}
                                placeholder="Select or type"
                                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                style={{ padding: '10px 14px', height: '44px' }}
                              />
                            </div>

                            {/* BRAND */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2">BRAND</label>
                              <SearchableDropdown
                                value={material.stitchingThreadBrand || ''}
                                onChange={(value) => handleRawMaterialChange(actualIndex, 'stitchingThreadBrand', value)}
                                options={['Coats', 'A&E', 'Gunold', 'Madeira', 'Unbranded', 'Others']}
                                placeholder="Select or type"
                                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                                style={{ padding: '10px 14px', height: '44px' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Quality Verification - after Advance Spec, inside top-border block */}
                    <div className="w-full" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <QualityVerificationToggle
                        value={material.qualityVerification}
                        onChange={(value) => handleRawMaterialChange(actualIndex, 'qualityVerification', value)}
                        width="lg"
                        className="mb-3"
                      />
                    </div>
                    <div className="w-full max-w-sm" style={{ marginTop: '12px' }}>
                      <Field
                        label="PROCUREMENT DATE"
                        required
                        width="sm"
                        error={errors[`rawMaterial_${actualIndex}_procurementDate`]}
                      >
                        <Input
                          type="date"
                          min={todayDate}
                          value={material.procurementDate || ''}
                          aria-invalid={errors[`rawMaterial_${actualIndex}_procurementDate`] ? true : undefined}
                          onChange={(e) => handleProcurementDateChange(actualIndex, e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
  </>
);

export default StitchingThreadSpec;
