// CategoryLawLabel — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { LAW_LABEL_TYPES, LAW_LABEL_MATERIALS, LAW_LABEL_TESTING_REQUIREMENTS, LAW_LABEL_APPROVAL_OPTIONS } from '../../data/lawLabelData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryLawLabel = ({
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
                            value={material.lawLabelType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'lawLabelType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'lawLabelTypeText', '');
                              }
                            }}
                            options={LAW_LABEL_TYPES}
                            placeholder="select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_lawLabelType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelType`]}</span>}
                          {material.lawLabelType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.lawLabelTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_lawLabelTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL</label>
                                                    <SearchableDropdown
                            value={material.lawLabelMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'lawLabelMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'lawLabelMaterialText', '');
                              }
                            }}
                            options={LAW_LABEL_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_lawLabelMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelMaterial`]}</span>}
                          {material.lawLabelMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.lawLabelMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_lawLabelMaterialText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter MATERIAL"
                          />
                          )}
                        </div>

                        {/* ARTWORK SPEC */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ARTWORK SPEC</label>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'lawLabelArtworkSpecFile', f); }}
                            className="hidden"
                            id={`law-label-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`law-label-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.lawLabelArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                          <div className="flex items-center gap-3">
                          <input
                            type="text"
                                  value={material.lawLabelSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_lawLabelSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.lawLabelSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_lawLabelSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.lawLabelSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'lawLabelSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_lawLabelSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '120px' }}
                          />
                              </div>
                            </div>

                        {/* PLACEMENT - Full width with text input and upload */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.lawLabelPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_lawLabelPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'lawLabelPlacementImageRef', f); }}
                              className="hidden"
                              id={`law-label-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`law-label-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.lawLabelPlacementImageRef ? 'UPLOADED' : 'UPLOAD (REFERENCE IMAGE)'}</span>
                            </label>
                        </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.lawLabelTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'lawLabelTestingRequirements', selectedValues)}
                            options={LAW_LABEL_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_lawLabelTestingRequirements`]}
                          />
                          {(material.lawLabelTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.lawLabelTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_lawLabelTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
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
                                value={material.lawLabelQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_lawLabelQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.lawLabelQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_lawLabelQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.lawLabelSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_lawLabelSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.lawLabelApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'lawLabelApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'lawLabelApprovalText', '');
                              }
                            }}
                            options={LAW_LABEL_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_lawLabelApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_lawLabelApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_lawLabelApproval`]}</span>}
                          {material.lawLabelApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.lawLabelApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_lawLabelApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.lawLabelRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lawLabelRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryLawLabel;
