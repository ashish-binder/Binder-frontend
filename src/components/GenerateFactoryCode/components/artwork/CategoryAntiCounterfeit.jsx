// CategoryAntiCounterfeit — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import { ANTI_COUNTERFEIT_TYPES, ANTI_COUNTERFEIT_MATERIALS, ANTI_COUNTERFEIT_SECURITY_FEATURES, ANTI_COUNTERFEIT_HOLOGRAM_TYPES, ANTI_COUNTERFEIT_NUMBERING_OPTIONS, ANTI_COUNTERFEIT_TESTING_REQUIREMENTS, ANTI_COUNTERFEIT_APPROVAL_OPTIONS, ANTI_COUNTERFEIT_VERIFICATION_OPTIONS, ANTI_COUNTERFEIT_QR_CODE_CONTENT_OPTIONS, ANTI_COUNTERFEIT_APPLICATION_OPTIONS, ANTI_COUNTERFEIT_TAMPER_EVIDENCE_OPTIONS, ANTI_COUNTERFEIT_DATABASE_OPTIONS, ANTI_COUNTERFEIT_GUMMING_QUALITY_OPTIONS } from '../../data/antiCounterfeitData';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ARTWORK_QTY_UNIT_OPTIONS } from './artworkConstants';

const CategoryAntiCounterfeit = ({
  material,
  actualIndex,
  errors,
  handleArtworkMaterialChange,
}) => (
  <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                        {/* TYPE - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TYPE</label>
                                                    <SearchableDropdown
                            value={material.antiCounterfeitType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitTypeText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {material.antiCounterfeitType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                              value={material.antiCounterfeitTypeText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitTypeText', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitTypeText`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Enter TYPE"
                            />
                          )}
                        </div>

                        {/* MATERIAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>MATERIAL</label>
                                                    <SearchableDropdown
                            value={material.antiCounterfeitMaterial || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitMaterial', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitMaterialText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_MATERIALS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitMaterial`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {material.antiCounterfeitMaterial === 'OTHERS (TEXT)' && (
                            <input
                              type="text"
                              value={material.antiCounterfeitMaterialText || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitMaterialText', e.target.value)}
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
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
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'artworkSpecFile', f); }}
                                  className="hidden"
                                  id={`anti-counterfeit-artwork-${actualIndex}`}
                                />
                                <label
                                  htmlFor={`anti-counterfeit-artwork-${actualIndex}`}
                                  className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="truncate">{material.artworkSpecFile ? 'UPLOADED' : 'UPLOAD'}</span>
                                </label>
                              </div>
                            </div>

                            {/* SIZE */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SIZE</label>
                              <div className="flex items-center gap-3">
                          <input
                            type="text"
                                  value={material.antiCounterfeitSizeWidth || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitSizeWidth', e.target.value)}
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="WIDTH"
                                />
                                <span className="text-gray-600" style={{ flexShrink: 0 }}>x</span>
                                <input
                                  type="text"
                                  value={material.antiCounterfeitSizeHeight || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitSizeHeight', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
                                  style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                                  placeholder="HEIGHT"
                                />
                                                          <SearchableDropdown
                            value={material.antiCounterfeitSizeUnit || ''}
                            onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitSizeUnit', selectedValue)}
                            options={UNIT_OPTIONS_WITH_PCS}
                            strictMode
                            placeholder="Select unit"
                            placeholderDim
                            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
                            style={{ width: '120px' }}
                          />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECURITY FEATURE, HOLOGRAM TYPE, NUMBERING in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {/* SECURITY FEATURE - Dropdown with Others option */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SECURITY <span className="text-red-500">*</span></label>
                                                        <SearchableDropdown
                            value={material.securityFeature || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'securityFeature', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'securityFeatureText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_SECURITY_FEATURES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_securityFeature`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_securityFeature`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_securityFeature`]}</span>}
                              {material.securityFeature === 'OTHERS (TEXT)' && (
                                <input
                                  type="text"
                                  value={material.securityFeatureText || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'securityFeatureText', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                                  style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter SECURITY"
                                />
                              )}
                        </div>

                            {/* HOLOGRAM TYPE - Dropdown with Others option */}
                        <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>HOLOGRAM TYPE <span className="text-red-500">*</span></label>
                                                        <SearchableDropdown
                            value={material.hologramType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hologramType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hologramTypeText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_HOLOGRAM_TYPES}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_hologramType`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_hologramType`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_hologramType`]}</span>}
                              {material.hologramType === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                                  value={material.hologramTypeText || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hologramTypeText', e.target.value)}
                                  className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none mt-2"
                            style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter HOLOGRAM TYPE"
                          />
                              )}
                        </div>

                            {/* NUMBERING - Dropdown with Others option */}
                        <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>NUMBERING <span className="text-red-500">*</span></label>
                                                        <SearchableDropdown
                            value={material.numbering || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'numbering', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'numberingText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_NUMBERING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_numbering`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_numbering`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_numbering`]}</span>}
                              {material.numbering === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                                  value={material.numberingText || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'numberingText', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_numberingText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter NUMBERING"
                          />
                              )}
                        </div>
                          </div>
                        </div>

                        {/* PLACEMENT - Full width in grid */}
                        <div className="col-span-full flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>PLACEMENT <span className="text-red-500">*</span></label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={material.antiCounterfeitPlacement || ''}
                              onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitPlacement', e.target.value)}
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-1 ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitPlacement`] ? 'border-red-600' : 'border-border'}`}
                              style={{ padding: '10px 14px', height: '44px' }}
                              placeholder="Text"
                            />
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'placementImageRef', f); }}
                              className="hidden"
                              id={`anti-counterfeit-placement-${actualIndex}`}
                            />
                            <label
                              htmlFor={`anti-counterfeit-placement-${actualIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border"
                              style={{ padding: '10px 14px', height: '44px', minWidth: '200px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{material.placementImageRef ? 'UPLOADED' : 'UPLOAD IMAGE REFERENCE'}</span>
                            </label>
                          </div>
                          {errors[`artworkMaterial_${actualIndex}_antiCounterfeitPlacement`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_antiCounterfeitPlacement`]}</span>}
                        </div>

                        {/* TESTING REQUIREMENTS, QTY, UNIT, SURPLUS % */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(100px,100px)_minmax(130px,1fr)] gap-x-5 gap-y-5">
                            {/* TESTING REQUIREMENTS - full width row */}
                            <div className="md:col-span-3 flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>TESTING REQUIREMENTS <span className="text-red-500">*</span></label>
                              <MultiSelectDropdown
                                value={material.testingRequirements || []}
                                onChange={(selectedValues) => handleArtworkMaterialChange(actualIndex, 'testingRequirements', selectedValues)}
                                options={ANTI_COUNTERFEIT_TESTING_REQUIREMENTS}
                                placeholder="Select Testing Requirements"
                                hasError={!!errors[`artworkMaterial_${actualIndex}_testingRequirements`]}
                              />
                              {errors[`artworkMaterial_${actualIndex}_testingRequirements`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_testingRequirements`]}</span>}
                            </div>
                            {/* QTY - Pieces */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>QTY <span className="text-red-500">*</span></label>
                              <input
                                type="number"
                                value={material.antiCounterfeitQty || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitQty', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitQty`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Pieces"
                              />
                              {errors[`artworkMaterial_${actualIndex}_antiCounterfeitQty`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_antiCounterfeitQty`]}</span>}
                            </div>
                            {/* UNIT */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>UNIT <span className="text-red-500">*</span></label>
                              <select
                                value={material.antiCounterfeitQtyUnit || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitQtyUnit', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitQtyUnit`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                              >
                                <option value="">Select</option>
                                {ARTWORK_QTY_UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                              </select>
                              {errors[`artworkMaterial_${actualIndex}_antiCounterfeitQtyUnit`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_antiCounterfeitQtyUnit`]}</span>}
                            </div>
                            {/* SURPLUS % */}
                            <div className="flex flex-col min-w-0">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>SURPLUS % <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={material.antiCounterfeitSurplus || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitSurplus', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitSurplus`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="%AGE"
                              />
                              {errors[`artworkMaterial_${actualIndex}_antiCounterfeitSurplus`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_antiCounterfeitSurplus`]}</span>}
                            </div>
                          </div>
                        </div>

                        {/* APPROVAL and REMARKS in one row */}
                        <div className="col-span-full flex flex-col">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            {/* APPROVAL - Dropdown with Others option */}
                        <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>APPROVAL <span className="text-red-500">*</span></label>
                                                        <SearchableDropdown
                            value={material.antiCounterfeitApproval || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApproval', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApprovalText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitApproval`] ? 'border-red-600' : 'border-border'}`}
                          />
                          {errors[`artworkMaterial_${actualIndex}_antiCounterfeitApproval`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_antiCounterfeitApproval`]}</span>}
                              {material.antiCounterfeitApproval === 'OTHERS (TEXT)' && (
                          <input
                            type="text"
                                  value={material.antiCounterfeitApprovalText || ''}
                                  onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApprovalText', e.target.value)}
                                  className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitApprovalText`] ? 'border-red-600' : 'border-border'}`}
                            style={{ padding: '10px 14px', height: '44px' }}
                                  placeholder="Enter APPROVAL"
                                />
                              )}
                            </div>

                            {/* REMARKS */}
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700 mb-2" style={{ whiteSpace: 'nowrap' }}>REMARKS</label>
                              <input
                                type="text"
                                value={material.antiCounterfeitRemarks || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitRemarks', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none w-full border-border`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Text"
                              />
                            </div>
                          </div>
                        </div>
                        </div>
  </>
);

export default CategoryAntiCounterfeit;
