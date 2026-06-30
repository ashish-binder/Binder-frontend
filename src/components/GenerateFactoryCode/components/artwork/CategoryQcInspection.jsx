// CategoryQcInspection — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { QC_INSPECTION_TYPES, QC_INSPECTION_MATERIALS, QC_INSPECTION_CONTENT, QC_INSPECTION_CODING_SYSTEM, QC_INSPECTION_GUMMING_QUALITY, QC_INSPECTION_TESTING_REQUIREMENTS, QC_INSPECTION_APPROVAL_OPTIONS } from '../../data/qcInspectionData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryQcInspection = ({
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
                            value={material.qcInspectionType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionTypeText', '');
                              }
                            }}
                            options={QC_INSPECTION_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionType`]}</span>}
                          {material.qcInspectionType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qcInspectionTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.qcInspectionMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionMaterialText', '');
                              }
                            }}
                            options={QC_INSPECTION_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionMaterial`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionMaterial`]}</span>}
                          {material.qcInspectionMaterial === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionMaterialText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qcInspectionMaterialText`] ? 'border-red-600' : 'border-border'}`}
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
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'qcInspectionArtworkSpecFile', f); }}
                            className="hidden"
                            id={`qc-inspection-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`qc-inspection-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.qcInspectionArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                          <div className="flex items-center gap-3">
                          <input
                            type="text"
                              value={material.qcInspectionSizeWidth || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_qcInspectionSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.qcInspectionSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_qcInspectionSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.qcInspectionSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'qcInspectionSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
                            style={{ width: '120px' }}
                          />
                              </div>
                          {(errors[`artworkMaterial_${actualIndex}_qcInspectionSizeWidth`] || errors[`artworkMaterial_${actualIndex}_qcInspectionSizeHeight`] || errors[`artworkMaterial_${actualIndex}_qcInspectionSizeUnit`]) && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionSizeWidth`] || errors[`artworkMaterial_${actualIndex}_qcInspectionSizeHeight`] || errors[`artworkMaterial_${actualIndex}_qcInspectionSizeUnit`]}</span>}
                            </div>

                        {/* CONTENT - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>CONTENT <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.qcInspectionContent || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionContent', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionContentText', '');
                              }
                            }}
                            options={QC_INSPECTION_CONTENT}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionContent`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionContent`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionContent`]}</span>}
                          {material.qcInspectionContent === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionContentText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionContentText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qcInspectionContentText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter CONTENT"
                          />
                          )}
                        </div>

                        {/* CODING SYSTEM - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>CODING SYSTEM <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.qcInspectionCodingSystem || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionCodingSystem', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionCodingSystemText', '');
                              }
                            }}
                            options={QC_INSPECTION_CODING_SYSTEM}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionCodingSystem`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionCodingSystem`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionCodingSystem`]}</span>}
                          {material.qcInspectionCodingSystem === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionCodingSystemText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionCodingSystemText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qcInspectionCodingSystemText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter CODING SYSTEM"
                          />
                          )}
                        </div>

                        {/* GUMMING QUALITY - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>GUMMING QU. <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.qcInspectionGummingQuality || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionGummingQuality', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionGummingQualityText', '');
                              }
                            }}
                            options={QC_INSPECTION_GUMMING_QUALITY}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionGummingQuality`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionGummingQuality`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionGummingQuality`]}</span>}
                          {material.qcInspectionGummingQuality === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionGummingQualityText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionGummingQualityText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qcInspectionGummingQualityText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter GUMMING QUALITY"
                          />
                          )}
                        </div>

                        {/* PLACEMENT - Text input with Upload Image Reference */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-2">
                          <input
                            type="text"
                              value={material.qcInspectionPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_qcInspectionPlacement`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'qcInspectionPlacementImageFile', f); }}
                              className="hidden"
                              id={`qc-inspection-placement-image-${actualIndex}`}
                            />
                            <label
                              htmlFor={`qc-inspection-placement-image-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border flex-shrink-0"
                              style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.qcInspectionPlacementImageFile ? 'DONE' : 'UPLOAD'}</span>
                            </label>
                          </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                                                    <MultiSelectDropdown
                            value={material.qcInspectionTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'qcInspectionTestingRequirements', selectedValues)}
                            options={QC_INSPECTION_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_qcInspectionTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionTestingRequirements`]}</span>}
                          {(material.qcInspectionTestingRequirements || []).includes('OTHERS (TEXT)') && (
                          <input
                            type="text"
                              value={material.qcInspectionTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionTestingRequirementsText', e.target.value)}
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
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.qcInspectionQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_qcInspectionQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.qcInspectionQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_qcInspectionQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.qcInspectionSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_qcInspectionSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                    <SearchableDropdown
                            value={material.qcInspectionApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qcInspectionApprovalText', '');
                              }
                            }}
                            options={QC_INSPECTION_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_qcInspectionApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_qcInspectionApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_qcInspectionApproval`]}</span>}
                          {material.qcInspectionApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.qcInspectionApprovalText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionApprovalText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter APPROVAL"
                            />
                          )}
                        </div>

                        {/* REMARKS - Text input */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <input
                            type="text"
                            value={material.qcInspectionRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qcInspectionRemarks', e.target.value)}
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none w-full"
                            style={{ padding: '10px 14px', height: '44px' }}
                            placeholder="Enter REMARKS"
                          />
                        </div>
                        </div>
  </>
);

export default CategoryQcInspection;
