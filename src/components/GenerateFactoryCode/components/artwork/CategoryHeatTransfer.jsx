// CategoryHeatTransfer — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { HEAT_TRANSFER_TYPES, HEAT_TRANSFER_MATERIAL_BASE_OPTIONS, HEAT_TRANSFER_TESTING_REQUIREMENTS, HEAT_TRANSFER_APPROVAL_OPTIONS, HEAT_TRANSFER_INK_TYPE_OPTIONS, HEAT_TRANSFER_FABRIC_COMPATIBILITY_OPTIONS, HEAT_TRANSFER_APPLICATION_SPEC_OPTIONS, HEAT_TRANSFER_PEEL_TYPE_OPTIONS, HEAT_TRANSFER_FINISH_HAND_FEEL_OPTIONS, HEAT_TRANSFER_STRETCH_OPTIONS } from '../../data/heatTransferData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryHeatTransfer = ({
  material,
  actualIndex,
  errors,
  handleArtworkMaterialChange,
}) => (
  <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                        {/* TYPE - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TYPE</label>
                                                    <SearchableDropdown
                            value={material.heatTransferType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'heatTransferTypeText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_\${actualIndex}_heatTransferType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {material.heatTransferType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.heatTransferTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_\${actualIndex}_heatTransferTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL BASE - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL BASE</label>
                                                    <SearchableDropdown
                            value={material.heatTransferMaterialBase || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferMaterialBase', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'heatTransferMaterialBaseText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_MATERIAL_BASE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_\${actualIndex}_heatTransferMaterialBase`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {material.heatTransferMaterialBase === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.heatTransferMaterialBaseText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferMaterialBaseText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_\${actualIndex}_heatTransferMaterialBaseText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter MATERIAL BASE"
                            />
                          )}
                        </div>

                        {/* SIZE */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                          <div className="flex items-center gap-3">
                        <input
                          type="text"
                                  value={material.heatTransferSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_\${actualIndex}_heatTransferSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.heatTransferSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_\${actualIndex}_heatTransferSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.heatTransferSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'heatTransferSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_\${actualIndex}_heatTransferSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '120px' }}
                          />
                              </div>
                            </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.heatTransferPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_\${actualIndex}_heatTransferPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'heatTransferPlacementImageRef', f); }}
                              className="hidden"
                              id={`heat-transfer-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`heat-transfer-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.heatTransferPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                        </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Simple Dropdown */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS</label>
                                                    <MultiSelectDropdown
                            value={material.heatTransferTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'heatTransferTestingRequirements', selectedValues)}
                            options={HEAT_TRANSFER_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_heatTransferTestingRequirements`]}
                          />
                          {(material.heatTransferTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.heatTransferTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_\${actualIndex}_heatTransferTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces / Sheets */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY</label>
                              <input
                                type="text"
                                value={material.heatTransferQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_heatTransferQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces / Sheets (rolls of transfer film)"
                              />
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.heatTransferQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_heatTransferQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_heatTransferQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_heatTransferQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS %</label>
                              <input
                                type="text"
                                value={material.heatTransferSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_heatTransferSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL</label>
                                                    <SearchableDropdown
                            value={material.heatTransferApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'heatTransferApprovalText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_\${actualIndex}_heatTransferApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {material.heatTransferApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.heatTransferApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_\${actualIndex}_heatTransferApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.heatTransferRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_\${actualIndex}_heatTransferRemarks`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryHeatTransfer;
