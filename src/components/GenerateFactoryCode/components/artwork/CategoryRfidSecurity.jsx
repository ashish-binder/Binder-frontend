// CategoryRfidSecurity — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { RFID_TYPES, RFID_FORM_FACTORS, RFID_CHIP_MODELS, RFID_TESTING_REQUIREMENTS } from '../../data/rfidSecurityData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryRfidSecurity = ({
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
                            value={material.rfidType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'rfidType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'rfidTypeText', '');
                              }
                            }}
                            options={RFID_TYPES}
                            placeholder="Select or type Type"
                            className={errors[`artworkMaterial_${actualIndex}_rfidType`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_rfidType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidType`]}</span>}
                          {material.rfidType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.rfidTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_rfidTypeText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                          />
                          )}
                    </div>

                        {/* FORM FACTOR - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>FORM FACTOR <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.rfidFormFactor || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'rfidFormFactor', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'rfidFormFactorText', '');
                              }
                            }}
                            options={RFID_FORM_FACTORS}
                            placeholder="Select or type Form Factor"
                            className={errors[`artworkMaterial_${actualIndex}_rfidFormFactor`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_rfidFormFactor`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidFormFactor`]}</span>}
                          {material.rfidFormFactor === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.rfidFormFactorText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidFormFactorText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_rfidFormFactorText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter FORM FACTOR"
                          />
                          )}
                  </div>

                        {/* ARTWORK SPEC */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>ARTWORK SPEC</label>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'rfidArtworkSpecFile', f); }}
                            className="hidden"
                            id={`rfid-artwork-${actualIndex}`}
                          />
                          <label
                            htmlFor={`rfid-artwork-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.rfidArtworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* CHIP MODEL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>CHIP MODEL <span className="text-red-500">*</span></label>
                          <SearchableDropdown
                            value={material.rfidChipModel || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'rfidChipModel', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                                handleArtworkMaterialChange(actualIndex, 'rfidChipModelText', '');
                              }
                            }}
                            options={RFID_CHIP_MODELS}
                            placeholder="Select or type Chip Model"
                            className={errors[`artworkMaterial_${actualIndex}_rfidChipModel`] ? 'border-red-600' : ''}
                          />
                          {errors[`artworkMaterial_${actualIndex}_rfidChipModel`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidChipModel`]}</span>}
                          {material.rfidChipModel === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.rfidChipModelText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidChipModelText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_rfidChipModelText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter CHIP MODEL"
                          />
                          )}
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                          <div className="flex items-center gap-3">
                          <input
                            type="text"
                                  value={material.rfidSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidSizeWidth', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_rfidSizeWidth`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.rfidSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidSizeHeight', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_rfidSizeHeight`] ? 'border-red-600' : 'border-border'}`}
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                <SearchableDropdown
                                  value={material.rfidSizeUnit || ''}
                                  onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'rfidSizeUnit', selectedValue)}
                                  options={UNIT_OPTIONS_WITH_PCS}
                                  strictMode
                                  placeholder="Select unit"
                                  placeholderDim
                                  style={{ width: '120px' }}
                                />
                              </div>
                            </div>

                        {/* PLACEMENT - Text input with Upload Image Reference */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-2">
                          <input
                            type="text"
                              value={material.rfidPlacementText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidPlacementText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_rfidPlacementText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'rfidPlacementImageRef', f); }}
                              className="hidden"
                              id={`rfid-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`rfid-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border flex-shrink-0"
                              style={{ padding: '10px 14px', height: '44px', width: '150px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.rfidPlacementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                          </div>
                        </div>

                        {/* TESTING REQUIREMENTS - Dropdown with Others option and Upload */}
                        <div className="flex flex-col col-span-full">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                          <MultiSelectDropdown
                            value={material.rfidTestingRequirements || []}
                            onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'rfidTestingRequirements', selectedValues)}
                            options={RFID_TESTING_REQUIREMENTS}
                            placeholder="Select Testing Requirements"
                            hasError={!!errors[`artworkMaterial_${actualIndex}_rfidTestingRequirements`]}
                          />
                          {errors[`artworkMaterial_${actualIndex}_rfidTestingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidTestingRequirements`]}</span>}
                          {(material.rfidTestingRequirements || []).includes('OTHERS (TEXT FIELD)') && (
                          <input
                            type="text"
                              value={material.rfidTestingRequirementsText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidTestingRequirementsText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_rfidTestingRequirementsText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TESTING REQUIREMENTS"
                          />
                          )}
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'rfidTestingRequirementsFile', f); }}
                            className="hidden"
                            id={`rfid-testing-${actualIndex}`}
                          />
                          <label
                            htmlFor={`rfid-testing-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.rfidTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* QTY, UNIT, SURPLUS % in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* QTY - Pieces */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.rfidQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_rfidQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_rfidQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.rfidQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_rfidQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_rfidQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.rfidSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_rfidSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_rfidSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_rfidSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL - Upload */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL</label>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'rfidApprovalFile', f); }}
                            className="hidden"
                            id={`rfid-approval-${actualIndex}`}
                          />
                          <label
                            htmlFor={`rfid-approval-${actualIndex}`}
                            className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                            style={{ padding: '10px 14px', height: '44px' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span className="truncate">{material.rfidApprovalFile ? 'UPLOADED' : 'UPLOAD'}</span>
                          </label>
                        </div>

                        {/* REMARKS - Full width */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                          <textarea
                            value={material.rfidRemarks || ''}
                            onChange={(e) => handleArtworkMaterialChange(actualIndex, 'rfidRemarks', e.target.value)}
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                            style={{ padding: '10px 14px', minHeight: '80px' }}
                            placeholder="Text"
                          />
                        </div>
                      </div>
  </>
);

export default CategoryRfidSecurity;
