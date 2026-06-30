// CategoryLabelsBrand — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { LABELS_BRAND_TYPES, LABELS_BRAND_MATERIALS, LABELS_BRAND_ATTACHMENT_OPTIONS, LABELS_BRAND_TESTING_REQUIREMENTS, LABELS_BRAND_APPROVAL_OPTIONS } from '../../data/labelsBrandData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryLabelsBrand = ({
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
                            value={material.labelsBrandType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'labelsBrandType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'labelsBrandTypeText', '');
                              }
                            }}
                            options={LABELS_BRAND_TYPES}
                            placeholder="Select or type Type"
                            className={errors[`artworkMaterial_${actualIndex}_labelsBrandType`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_labelsBrandType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandType`]}</span>}
                          {material.labelsBrandType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.labelsBrandTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_labelsBrandTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.labelsBrandMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'labelsBrandMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'labelsBrandMaterialText', '');
                              }
                            }}
                            options={LABELS_BRAND_MATERIALS}
                            placeholder="Select or type Material"
                            className={errors[`artworkMaterial_${actualIndex}_labelsBrandMaterial`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_labelsBrandMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandMaterial`]}</span>}
                          {material.labelsBrandMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.labelsBrandMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_labelsBrandMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'labelsBrandArtworkSpecFile', f); }}
                            className="hidden"
                            id={`labels-brand-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`labels-brand-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.labelsBrandArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                          <div className="flex items-center gap-3">
                        <input
                          type="text"
                                  value={material.labelsBrandSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_labelsBrandSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.labelsBrandSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_labelsBrandSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                <SearchableDropdown
                                  value={material.labelsBrandSizeUnit || ''}
                                  onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'labelsBrandSizeUnit', selectedValue)}
                                  options={UNIT_OPTIONS_WITH_PCS}
                                  strictMode
                                  placeholder="Select unit"
                                  placeholderDim
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
                              value={material.labelsBrandPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_labelsBrandPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'labelsBrandPlacementImageRef', f); }}
                              className="hidden"
                              id={`labels-brand-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`labels-brand-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.labelsBrandPlacementImageRef ? 'UPLOADED' : 'UPLOAD (REFERENCE IMAGE)'}</span>
                            </label>
                        </div>
                        </div>

                        {/* ATTACHMENT - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ATTACHMENT <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.labelsBrandAttachment || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'labelsBrandAttachment', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'labelsBrandAttachmentText', '');
                              }
                            }}
                            options={LABELS_BRAND_ATTACHMENT_OPTIONS}
                            placeholder="Select or type Attachment"
                            className={errors[`artworkMaterial_${actualIndex}_labelsBrandAttachment`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_labelsBrandAttachment`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandAttachment`]}</span>}
                          {material.labelsBrandAttachment === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.labelsBrandAttachmentText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandAttachmentText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_labelsBrandAttachmentText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter ATTACHMENT"
                          />
                          )}
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                          <MultiSelectDropdown
                            value={material.labelsBrandTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'labelsBrandTestingRequirements', selectedValues)}
                            options={LABELS_BRAND_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_labelsBrandTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_labelsBrandTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandTestingRequirements`]}</span>}
                          {(material.labelsBrandTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.labelsBrandTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_labelsBrandTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces/R LENGTH */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.labelsBrandQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_labelsBrandQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces/R LENGTH"
                              />
                              {errors[`artworkMaterial_${actualIndex}_labelsBrandQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.labelsBrandQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_labelsBrandQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_labelsBrandQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.labelsBrandSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_labelsBrandSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_labelsBrandSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_labelsBrandSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.labelsBrandApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'labelsBrandApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'labelsBrandApprovalText', '');
                              }
                            }}
                            className={errors[`artworkMaterial_${actualIndex}_labelsBrandApproval`] ? 'border-red-600' : ''}
                            options={LABELS_BRAND_APPROVAL_OPTIONS}
                            placeholder="Select or type Approval"
                          />
                          {material.labelsBrandApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.labelsBrandApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_labelsBrandApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.labelsBrandRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'labelsBrandRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryLabelsBrand;
