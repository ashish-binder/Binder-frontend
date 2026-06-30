// CategoryHeaderCard — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { HEADER_CARDS_TYPES, HEADER_CARDS_MATERIALS, HEADER_CARDS_TESTING_REQUIREMENTS, HEADER_CARDS_APPROVAL_OPTIONS, HEADER_CARDS_FUNCTION_OPTIONS, HEADER_CARDS_CONTENT_OPTIONS, HEADER_CARDS_PRINTING_OPTIONS, HEADER_CARDS_FINISH_OPTIONS, HEADER_CARDS_STIFFNESS_OPTIONS, HEADER_CARDS_ACID_FREE_OPTIONS, HEADER_CARDS_BRANDING_OPTIONS } from '../../data/headerCardsData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryHeaderCard = ({
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
                            value={material.headerCardType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'headerCardType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'headerCardTypeText', '');
                              }
                            }}
                            options={HEADER_CARDS_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_headerCardType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardType`]}</span>}
                          {material.headerCardType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.headerCardTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_headerCardTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.headerCardMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'headerCardMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'headerCardMaterialText', '');
                              }
                            }}
                            options={HEADER_CARDS_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_headerCardMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardMaterial`]}</span>}
                          {material.headerCardMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.headerCardMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_headerCardMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'headerCardArtworkSpecFile', f); }}
                              className="hidden"
                              id={`header-card-artwork-spec-${actualIndex}`}
                            />
                            <label
                              htmlFor={`header-card-artwork-spec-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.headerCardArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                            </label>
                          </div>
                          {errors[`artworkMaterial_${actualIndex}_headerCardArtworkSpecFile`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardArtworkSpecFile`]}</span>}
                        </div>

                        {/* SIZE - Length, Width, Gusset + Unit (Header Card only) */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE <span className="text-red-500">*</span></label>
                          <div className="flex flex-row flex-nowrap items-center gap-3">
                            <input
                              type="text"
                              value={material.headerCardSizeLength || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardSizeLength', e.target.value)}
                              className={`flex-shrink-0 border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_headerCardSizeLength`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                              placeholder="LENGTH"
                            />
                            <input
                              type="text"
                              value={material.headerCardSizeWidth || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardSizeWidth', e.target.value)}
                              className={`flex-shrink-0 border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_headerCardSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                              placeholder="WIDTH"
                            />
                            <input
                              type="text"
                              value={material.headerCardSizeGusset || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardSizeGusset', e.target.value)}
                              className={`flex-shrink-0 border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_headerCardSizeGusset`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                              placeholder="GUSSET"
                            />
                            <div style={{ width: '120px', flexShrink: 0 }}>
                              <SearchableDropdown
                                value={material.headerCardSizeUnit || ''}
                                onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'headerCardSizeUnit', selectedValue)}
                                options={UNIT_OPTIONS_WITH_PCS}
                                strictMode
                                placeholder="Select unit"
                                placeholderDim
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>
                          {(errors[`artworkMaterial_${actualIndex}_headerCardSizeLength`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeWidth`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeGusset`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardSizeLength`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeWidth`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeGusset`] || errors[`artworkMaterial_${actualIndex}_headerCardSizeUnit`]}</span>}
                        </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.headerCardPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_headerCardPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'headerCardPlacementImageRef', f); }}
                              className="hidden"
                              id={`header-card-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`header-card-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.headerCardPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                        </div>
                          {errors[`artworkMaterial_${actualIndex}_headerCardPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardPlacement`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.headerCardTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'headerCardTestingRequirements', selectedValues)}
                            options={HEADER_CARDS_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_headerCardTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_headerCardTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardTestingRequirements`]}</span>}
                          {(material.headerCardTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.headerCardTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_headerCardTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                        </div>

                        {/* QTY, UNIT, CASEPACK QTY, SURPLUS % */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(140px,1fr)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.headerCardQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_headerCardQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.headerCardQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_headerCardQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardQtyUnit`]}</span>}
                            </div>
                            {/* CASEPACK QTY */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>CASEPACK QTY <span className="text-red-500">*</span></label>
                              <input
                                type="number"
                                value={material.headerCardCasepackQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardCasepackQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardCasepackQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="10"
                              />
                              {errors[`artworkMaterial_${actualIndex}_headerCardCasepackQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardCasepackQty`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.headerCardSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_headerCardSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.headerCardApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'headerCardApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'headerCardApprovalText', '');
                              }
                            }}
                            options={HEADER_CARDS_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_headerCardApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_headerCardApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_headerCardApproval`]}</span>}
                          {material.headerCardApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.headerCardApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_headerCardApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.headerCardRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px', resize: 'vertical' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryHeaderCard;
