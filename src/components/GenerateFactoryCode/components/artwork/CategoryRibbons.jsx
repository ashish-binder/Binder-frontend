// CategoryRibbons — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { RIBBONS_TYPES, RIBBONS_MATERIALS, RIBBONS_TESTING_REQUIREMENTS } from '../../data/ribbonsData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryRibbons = ({
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
                            value={material.ribbonsType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'ribbonsType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'ribbonsTypeText', '');
                              }
                            }}
                            options={RIBBONS_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_ribbonsType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsType`]}</span>}
                          {material.ribbonsType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.ribbonsTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_ribbonsTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.ribbonsMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'ribbonsMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'ribbonsMaterialText', '');
                              }
                            }}
                            options={RIBBONS_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_ribbonsMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsMaterial`]}</span>}
                          {material.ribbonsMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.ribbonsMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_ribbonsMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'ribbonsArtworkSpecFile', f); }}
                            className="hidden"
                            id={`ribbons-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`ribbons-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.ribbonsArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* WIDTH */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>WIDTH <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={material.ribbonsWidth || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsWidth`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="e.g., 10mm, 1 inch"
                          />
                          {errors[`artworkMaterial_${actualIndex}_ribbonsWidth`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsWidth`]}</span>}
                        </div>

                        {/* ROLL LENGTH */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ROLL LENGTH <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={material.ribbonsRollLength || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsRollLength', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsRollLength`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="e.g., 100m, 500 yards"
                          />
                          {errors[`artworkMaterial_${actualIndex}_ribbonsRollLength`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsRollLength`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.ribbonsTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'ribbonsTestingRequirements', selectedValues)}
                            options={RIBBONS_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_ribbonsTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_ribbonsTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsTestingRequirements`]}</span>}
                          {(material.ribbonsTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.ribbonsTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsTestingRequirementsText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
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
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY</label>
                              <input
                                type="text"
                                value={material.ribbonsQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_ribbonsQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.ribbonsQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_ribbonsQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.ribbonsSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_ribbonsSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_ribbonsSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Upload */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'ribbonsApprovalFile', f); }}
                            className="hidden"
                            id={`ribbons-approval-${actualIndex}`}
                          />
                          <label
                            htmlFor={`ribbons-approval-${actualIndex}`}
                            className={`border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 ${errors[`artworkMaterial_${actualIndex}_ribbonsApprovalFile`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.ribbonsApprovalFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                          {errors[`artworkMaterial_${actualIndex}_ribbonsApprovalFile`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_ribbonsApprovalFile`]}</span>}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.ribbonsRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'ribbonsRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px' }}
                            placeholder="Text"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryRibbons;
