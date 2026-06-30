// CategorySizeLabels — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { SIZE_LABELS_TYPES, SIZE_LABELS_MATERIALS, SIZE_LABELS_SIZE_SYSTEM_OPTIONS, SIZE_LABELS_SIZE_CODE_OPTIONS, SIZE_LABELS_FOLD_TYPE_OPTIONS, SIZE_LABELS_TESTING_REQUIREMENTS, SIZE_LABELS_APPROVAL_OPTIONS } from '../../data/sizeLabelsData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategorySizeLabels = ({
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
                            value={material.sizeLabelsType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsTypeText', '');
                              }
                            }}
                            options={SIZE_LABELS_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsType`]}</span>}
                          {material.sizeLabelsType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_sizeLabelsTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.sizeLabelsMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsMaterialText', '');
                              }
                            }}
                            options={SIZE_LABELS_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsMaterial`]}</span>}
                          {material.sizeLabelsMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_sizeLabelsMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'sizeLabelsArtworkSpecFile', f); }}
                            className="hidden"
                            id={`size-labels-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`size-labels-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.sizeLabelsArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                          <input
                            type="text"
                                  value={material.sizeLabelsSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.sizeLabelsSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.sizeLabelsSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeUnit`] ? 'border-red-600' : 'border-border'}`}
                            style={{ width: '120px' }}
                          />
                              </div>
                          {(errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeWidth`] || errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeHeight`] || errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeUnit`]}</span>}
                            </div>

                        {/* SIZE SYSTEM - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE SYSTEM <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.sizeLabelsSizeSystem || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeSystem', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeSystemText', '');
                              }
                            }}
                            options={SIZE_LABELS_SIZE_SYSTEM_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeSystem`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeSystem`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeSystem`]}</span>}
                          {material.sizeLabelsSizeSystem === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsSizeSystemText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeSystemText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter SIZE SYSTEM"
                          />
                          )}
                        </div>

                        {/* SIZE / CODE - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE / CODE <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.sizeLabelsSizeCode || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeCode', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeCodeText', '');
                              }
                            }}
                            options={SIZE_LABELS_SIZE_CODE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeCode`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeCode`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeCode`]}</span>}
                          {material.sizeLabelsSizeCode === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsSizeCodeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSizeCodeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSizeCodeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter SIZE / CODE"
                          />
                          )}
                        </div>

                        {/* FOLD TYPE - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>FOLD TYPE <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.sizeLabelsFoldType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsFoldType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsFoldTypeText', '');
                              }
                            }}
                            options={SIZE_LABELS_FOLD_TYPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsFoldType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsFoldType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsFoldType`]}</span>}
                          {material.sizeLabelsFoldType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsFoldTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsFoldTypeText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter FOLD TYPE"
                          />
                          )}
                        </div>

                        {/* PLACEMENT - Text input with Upload Image Reference */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT</label>
                          <div className="flex items-center gap-2">
                          <input
                            type="text"
                              value={material.sizeLabelsPlacementText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsPlacementText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none flex-1"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'sizeLabelsPlacementImageRef', f); }}
                              className="hidden"
                              id={`size-labels-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`size-labels-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border flex-shrink-0"
                              style={{ padding: '10px 14px', height: '44px', width: '150px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.sizeLabelsPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                          </div>
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsPlacementText`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsPlacementText`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.sizeLabelsTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsTestingRequirements', selectedValues)}
                            options={SIZE_LABELS_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_sizeLabelsTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsTestingRequirements`]}</span>}
                          {(material.sizeLabelsTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.sizeLabelsTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsTestingRequirementsText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces or Rolls */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.sizeLabelsQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces or Rolls"
                              />
                              {errors[`artworkMaterial_${actualIndex}_sizeLabelsQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.sizeLabelsQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_sizeLabelsQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.sizeLabelsSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_sizeLabelsSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.sizeLabelsApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'sizeLabelsApprovalText', '');
                              }
                            }}
                            options={SIZE_LABELS_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_sizeLabelsApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_sizeLabelsApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_sizeLabelsApproval`]}</span>}
                          {material.sizeLabelsApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.sizeLabelsApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsApprovalText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_sizeLabelsApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                          />
                          )}
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.sizeLabelsRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'sizeLabelsRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px' }}
                            placeholder="Text"
                          />
                        </div>
                        </div>
  </>
);

export default CategorySizeLabels;
