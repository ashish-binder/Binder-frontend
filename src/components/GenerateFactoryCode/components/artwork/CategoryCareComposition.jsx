// CategoryCareComposition — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { CARE_COMPOSITION_TYPES, CARE_COMPOSITION_MATERIALS, CARE_COMPOSITION_TESTING_REQUIREMENTS, CARE_COMPOSITION_APPROVAL_OPTIONS, CARE_COMPOSITION_PRINT_TYPE_OPTIONS, CARE_COMPOSITION_INK_TYPE_OPTIONS, CARE_COMPOSITION_MANUFACTURER_ID_OPTIONS, CARE_COMPOSITION_PERMANENCE_OPTIONS, CARE_COMPOSITION_LANGUAGE_OPTIONS } from '../../data/careCompositionData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryCareComposition = ({
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
                            value={material.careCompositionType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'careCompositionTypeText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_TYPES}
                            placeholder="Select or type Type"
                            className={errors[`artworkMaterial_${actualIndex}_careCompositionType`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_careCompositionType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionType`]}</span>}
                          {material.careCompositionType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.careCompositionTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.careCompositionMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'careCompositionMaterialText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_MATERIALS}
                            placeholder="Select or type Material"
                            className={errors[`artworkMaterial_${actualIndex}_careCompositionMaterial`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_careCompositionMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionMaterial`]}</span>}
                          {material.careCompositionMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.careCompositionMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'careCompositionArtworkSpecFile', f); }}
                                  className="hidden"
                                  id={`care-composition-artwork-${actualIndex}`}
                                />
                                <label
                                  htmlFor={`care-composition-artwork-${actualIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.careCompositionArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>

                            {/* SIZE */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={material.careCompositionSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="Width"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.careCompositionSizeLength || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionSizeLength', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionSizeLength`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="Length"
                                />
                                <SearchableDropdown
                                  value={material.careCompositionSizeUnit || ''}
                                  onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'careCompositionSizeUnit', selectedValue)}
                                  options={UNIT_OPTIONS_WITH_PCS}
                                  strictMode
                                  placeholder="Select unit"
                                  placeholderDim
                                  style={{ width: '120px' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.careCompositionPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_careCompositionPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'careCompositionPlacementImageRef', f); }}
                              className="hidden"
                              id={`care-composition-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`care-composition-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.careCompositionPlacementImageRef ? 'UPLOADED' : 'UPLOAD (REFERENCE IMAGE)'}</span>
                            </label>
                          </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Simple Dropdown */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                          <MultiSelectDropdown
                            value={material.careCompositionTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'careCompositionTestingRequirements', selectedValues)}
                            options={CARE_COMPOSITION_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_careCompositionTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_careCompositionTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionTestingRequirements`]}</span>}
                          {(material.careCompositionTestingRequirements || []).includes('OTHERS (TEXT)') && (
                            <input
                              type="text"
                              value={material.careCompositionTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                            />
                          )}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces/ R LENGTH */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.careCompositionQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_careCompositionQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces/ R LENGTH"
                              />
                              {errors[`artworkMaterial_${actualIndex}_careCompositionQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.careCompositionQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_careCompositionQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_careCompositionQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.careCompositionSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_careCompositionSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_careCompositionSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.careCompositionApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'careCompositionApprovalText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_APPROVAL_OPTIONS}
                            placeholder="Select or type Approval"
                            className={errors[`artworkMaterial_${actualIndex}_careCompositionApproval`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_careCompositionApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_careCompositionApproval`]}</span>}
                          {material.careCompositionApproval === 'OTHERS (TEXT)' && (
                            <input
                              type="text"
                              value={material.careCompositionApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionApprovalText`] ? 'border-red-600' : 'border-border'}`}
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
                            value={material.careCompositionRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="Text"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryCareComposition;
