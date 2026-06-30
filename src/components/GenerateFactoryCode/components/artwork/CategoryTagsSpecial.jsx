// CategoryTagsSpecial — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { TAGS_SPECIAL_LABELS_TYPES, TAGS_SPECIAL_LABELS_MATERIALS, TAGS_SPECIAL_LABELS_ATTACHMENT_OPTIONS, TAGS_SPECIAL_LABELS_FINISHING_OPTIONS, TAGS_SPECIAL_LABELS_TESTING_REQUIREMENTS, TAGS_SPECIAL_LABELS_APPROVAL_OPTIONS } from '../../data/tagsSpecialLabelsData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryTagsSpecial = ({
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
                            value={material.tagsSpecialLabelsType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsTypeText', '');
                              }
                            }}
                            options={TAGS_SPECIAL_LABELS_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsType`]}</span>}
                          {material.tagsSpecialLabelsType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsTypeText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.tagsSpecialLabelsMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsMaterialText', '');
                              }
                            }}
                            options={TAGS_SPECIAL_LABELS_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsMaterial`]}</span>}
                          {material.tagsSpecialLabelsMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsMaterialText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter MATERIAL"
                          />
                          )}
                        </div>

                        {/* ARTWORK SPEC - File Upload */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ARTWORK SPEC</label>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsArtworkSpecFile', f); }}
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none w-full"
                            style={{ padding: '10px 14px', height: '44px' }}
                          />
                        </div>

                        {/* SIZE - Width, Height, Unit */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                            value={material.tagsSpecialLabelsSizeWidth || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsSizeWidth', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="WIDTH"
                            />
                            <span className="text-gray-500">×</span>
                            <input
                              type="text"
                            value={material.tagsSpecialLabelsSizeHeight || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsSizeHeight', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="HEIGHT"
                            />
                                                      <SearchableDropdown
                            value={material.tagsSpecialLabelsSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '100px' }}
                          />
                          </div>
                          {(errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSizeUnit`]}</span>}
                        </div>

                        {/* ATTACHMENT - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ATTACHMENT</label>
                                                    <SearchableDropdown
                            value={material.tagsSpecialLabelsAttachment || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsAttachment', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsAttachmentText', '');
                              }
                            }}
                            options={TAGS_SPECIAL_LABELS_ATTACHMENT_OPTIONS}
                            placeholder="Select or type"
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none w-full"
                          />
                          {material.tagsSpecialLabelsAttachment === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsAttachmentText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsAttachmentText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter ATTACHMENT"
                          />
                          )}
                        </div>

                        {/* FINISHING - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>FINISHING <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.tagsSpecialLabelsFinishing || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsFinishing', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsFinishingText', '');
                              }
                            }}
                            options={TAGS_SPECIAL_LABELS_FINISHING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsFinishing`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsFinishing`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsFinishing`]}</span>}
                          {material.tagsSpecialLabelsFinishing === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsFinishingText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsFinishingText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter FINISHING"
                          />
                          )}
                        </div>

                        {/* PLACEMENT - Text input with Upload Image Reference */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT</label>
                          <div className="flex items-center gap-2">
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsPlacementImageFile', f); }}
                              className="hidden"
                              id={`tags-special-labels-placement-image-${actualIndex}`}
                            />
                            <label
                              htmlFor={`tags-special-labels-placement-image-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border flex-shrink-0"
                              style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              UPLOAD
                            </label>
                            <input
                              type="text"
                              value={material.tagsSpecialLabelsPlacementImageRef || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsPlacementImageRef', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
                              style={{ padding: '10px 14px', height: '44px', width: '120px' }}
                              placeholder="REFERENCE"
                            />
                          </div>
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsPlacement`]}</span>}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - PCS/R LENGTH */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.tagsSpecialLabelsQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="PCS/R LENGTH"
                              />
                              {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.tagsSpecialLabelsQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.tagsSpecialLabelsSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option and File Upload */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQ. <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.tagsSpecialLabelsTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsTestingRequirements', selectedValues)}
                            options={TAGS_SPECIAL_LABELS_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsTestingRequirements`]}</span>}
                          {(material.tagsSpecialLabelsTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsTestingRequirementsText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsTestingRequirementsFile', f); }}
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                          />
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.tagsSpecialLabelsApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsApprovalText', '');
                              }
                            }}
                            options={TAGS_SPECIAL_LABELS_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_tagsSpecialLabelsApproval`]}</span>}
                          {material.tagsSpecialLabelsApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.tagsSpecialLabelsApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsApprovalText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsApprovalFile', f); }}
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                          />
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.tagsSpecialLabelsRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tagsSpecialLabelsRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px' }}
                            placeholder="Text"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryTagsSpecial;
