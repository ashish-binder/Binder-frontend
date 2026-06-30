// CategoryFlammabilitySafety — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { FLAMMABILITY_SAFETY_TYPES, FLAMMABILITY_SAFETY_MATERIALS, FLAMMABILITY_SAFETY_TESTING_REQUIREMENTS, FLAMMABILITY_SAFETY_APPROVAL_OPTIONS, FLAMMABILITY_SAFETY_REGULATION_OPTIONS, FLAMMABILITY_SAFETY_FONT_SIZE_OPTIONS, FLAMMABILITY_SAFETY_PERMANENCE_OPTIONS, FLAMMABILITY_SAFETY_SYMBOL_OPTIONS, FLAMMABILITY_SAFETY_INK_DURABILITY_OPTIONS, FLAMMABILITY_SAFETY_CERTIFICATION_ID_OPTIONS } from '../../data/flammabilitySafetyData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryFlammabilitySafety = ({
  material,
  actualIndex,
  errors,
  handleArtworkMaterialChange,
}) => (
  <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                        {/* TYPE - Dropdown with Others option */}
                      <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TYPE <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.flammabilitySafetyType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyTypeText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyType`]}</span>}
                          {material.flammabilitySafetyType === 'OTHERS (TEXT)' && (
                  <input
                    type="text"
                              value={material.flammabilitySafetyTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyTypeText`] ? 'border-red-600' : 'border-border'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                        />
                          )}
                      </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL</label>
                                                    <SearchableDropdown
                            value={material.flammabilitySafetyMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyMaterialText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyMaterial`]}</span>}
                          {material.flammabilitySafetyMaterial === 'OTHERS (TEXT)' && (
                            <input
                              type="text"
                              value={material.flammabilitySafetyMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyMaterialText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter MATERIAL"
                            />
                          )}
                        </div>

                        {/* ARTWORK SPEC and SIZE in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            {/* ARTWORK SPEC - Upload */}
                      <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ARTWORK SPEC</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyArtworkSpecFile', f); }}
                                  className="hidden"
                                  id={`flammability-safety-artwork-${actualIndex}`}
                                />
                                <label
                                  htmlFor={`flammability-safety-artwork-${actualIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.flammabilitySafetyArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>

                            {/* SIZE */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE <span className="text-red-500">*</span></label>
                              <div className="flex items-center gap-3">
                        <input
                          type="text"
                                  value={material.flammabilitySafetySizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySizeWidth', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.flammabilitySafetySizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.flammabilitySafetySizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '120px' }}
                          />
                              </div>
                          {(errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeWidth`] || errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeHeight`] || errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeWidth`] || errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeHeight`] || errors[`artworkMaterial_${actualIndex}_flammabilitySafetySizeUnit`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.flammabilitySafetyPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyPlacement`] ? 'border-red-600' : 'border-border'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyPlacementImageRef', f); }}
                              className="hidden"
                              id={`flammability-safety-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`flammability-safety-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.flammabilitySafetyPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                      </div>
                          {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyPlacement`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS - Simple Dropdown */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.flammabilitySafetyTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyTestingRequirements', selectedValues)}
                            options={FLAMMABILITY_SAFETY_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_flammabilitySafetyTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyTestingRequirements`]}</span>}
                          {(material.flammabilitySafetyTestingRequirements || []).includes('OTHERS (TEXT)') && (
                            <input
                              type="text"
                              value={material.flammabilitySafetyTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                            />
                          )}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.flammabilitySafetyQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.flammabilitySafetyQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.flammabilitySafetySurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_flammabilitySafetySurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetySurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.flammabilitySafetyApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyApprovalText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_flammabilitySafetyApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_flammabilitySafetyApproval`]}</span>}
                          {material.flammabilitySafetyApproval === 'OTHERS (TEXT)' && (
                            <input
                              type="text"
                              value={material.flammabilitySafetyApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyApprovalText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <input
                            type="text"
                            value={material.flammabilitySafetyRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="Text"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryFlammabilitySafety;
