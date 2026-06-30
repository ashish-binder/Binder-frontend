// CategoryInsertCards — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { INSERT_CARDS_TYPES, INSERT_CARDS_MATERIALS, INSERT_CARDS_TESTING_REQUIREMENTS, INSERT_CARDS_APPROVAL_OPTIONS, INSERT_CARDS_FUNCTION_OPTIONS, INSERT_CARDS_CONTENT_OPTIONS, INSERT_CARDS_PRINTING_OPTIONS, INSERT_CARDS_FINISH_OPTIONS, INSERT_CARDS_STIFFNESS_OPTIONS, INSERT_CARDS_ACID_FREE_OPTIONS, INSERT_CARDS_BRANDING_OPTIONS } from '../../data/insertCardsData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryInsertCards = ({
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
                            value={material.insertCardsType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsTypeText', '');
                              }
                            }}
                            options={INSERT_CARDS_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_insertCardsType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsType`]}</span>}
                          {material.insertCardsType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.insertCardsTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.insertCardsMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsMaterialText', '');
                              }
                            }}
                            options={INSERT_CARDS_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_insertCardsMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsMaterial`]}</span>}
                          {material.insertCardsMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.insertCardsMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsMaterialText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter MATERIAL"
                          />
                          )}
                        </div>

                        {/* ARTWORK SPEC - Upload */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ARTWORK SPEC <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'insertCardsArtworkSpecFile', f); }}
                              className="hidden"
                              id={`insert-cards-artwork-spec-${actualIndex}`}
                            />
                            <label
                              htmlFor={`insert-cards-artwork-spec-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.insertCardsArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                            </label>
                          </div>
                          {errors[`artworkMaterial_${actualIndex}_insertCardsArtworkSpecFile`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsArtworkSpecFile`]}</span>}
                        </div>

                        {/* SIZE */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                        <input
                          type="text"
                                  value={material.insertCardsSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.insertCardsSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.insertCardsSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'insertCardsSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '120px' }}
                          />
                              </div>
                          {(errors[`artworkMaterial_${actualIndex}_insertCardsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_insertCardsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_insertCardsSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_insertCardsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_insertCardsSizeUnit`]}</span>}
                            </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.insertCardsPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_insertCardsPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'insertCardsPlacementImageRef', f); }}
                              className="hidden"
                              id={`insert-cards-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`insert-cards-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.insertCardsPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                        </div>
                          {errors[`artworkMaterial_${actualIndex}_insertCardsPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsPlacement`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS - Simple Dropdown */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.insertCardsTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'insertCardsTestingRequirements', selectedValues)}
                            options={INSERT_CARDS_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_insertCardsTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_insertCardsTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsTestingRequirements`]}</span>}
                          {(material.insertCardsTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.insertCardsTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
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
                                value={material.insertCardsQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_insertCardsQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.insertCardsQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_insertCardsQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.insertCardsSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_insertCardsSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.insertCardsApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsApprovalText', '');
                              }
                            }}
                            options={INSERT_CARDS_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_insertCardsApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_insertCardsApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_insertCardsApproval`]}</span>}
                          {material.insertCardsApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.insertCardsApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.insertCardsRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryInsertCards;
