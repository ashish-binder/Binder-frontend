// AdvFilterHangTagSeals — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { HANG_TAG_SEALS_TYPES, HANG_TAG_SEALS_MATERIALS, HANG_TAG_SEALS_TESTING_REQUIREMENTS, HANG_TAG_SEALS_APPROVAL_OPTIONS, HANG_TAG_SEALS_FASTENING_OPTIONS, HANG_TAG_SEALS_PRE_STRINGING_OPTIONS, HANG_TAG_SEALS_STRING_FINISH_OPTIONS, HANG_TAG_SEALS_SEAL_SHAPE_OPTIONS, HANG_TAG_SEALS_COLOUR_OPTIONS, HANG_TAG_SEALS_LOGO_BRANDING_OPTIONS } from '../../data/hangTagSealsData';

const AdvFilterHangTagSeals = ({
  material,
  actualIndex,
  errors,
  handleArtworkMaterialChange,
}) => (
  <>
                  <div className="w-full" style={{ marginTop: '20px' }}>
                    {/* Show/Hide Advance Filter Button */}
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showHangTagSealsAdvancedFilter', !material.showHangTagSealsAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showHangTagSealsAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showHangTagSealsAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showHangTagSealsAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showHangTagSealsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showHangTagSealsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showHangTagSealsAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* FASTENING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FASTENING
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsFastening || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsFastening', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsFasteningText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_FASTENING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsFastening`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsFastening === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsFasteningText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsFasteningText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsFasteningText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FASTENING"
                              />
                )}
              </div>
                          
                          {/* PRE-STRINGING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PRE-STRINGING
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsPreStringing || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsPreStringing', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsPreStringingText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_PRE_STRINGING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsPreStringing`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsPreStringing === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsPreStringingText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsPreStringingText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsPreStringingText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PRE-STRINGING"
                              />
                            )}
                          </div>
                          
                          {/* STRING FINISH - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              STRING FINISH
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsStringFinish || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsStringFinish', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsStringFinishText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_STRING_FINISH_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsStringFinish`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsStringFinish === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsStringFinishText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsStringFinishText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsStringFinishText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter STRING FINISH"
                              />
                            )}
                          </div>
                          
                          {/* SEAL SHAPE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              SEAL SHAPE
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsSealShape || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsSealShape', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsSealShapeText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_SEAL_SHAPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsSealShape`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsSealShape === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsSealShapeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsSealShapeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsSealShapeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter SEAL SHAPE"
                              />
                            )}
                          </div>
                          
                          {/* COLOUR - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              COLOUR
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsColour || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsColour', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsColourText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_COLOUR_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsColour`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsColour === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsColourText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsColourText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsColourText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter COLOUR"
                              />
                            )}
                          </div>
                          
                          {/* LOGO/BRANDING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              LOGO/BRANDING
                            </label>
                                                      <SearchableDropdown
                            value={material.hangTagSealsLogoBranding || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsLogoBranding', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'hangTagSealsLogoBrandingText', '');
                              }
                            }}
                            options={HANG_TAG_SEALS_LOGO_BRANDING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_hangTagSealsLogoBranding`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.hangTagSealsLogoBranding === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.hangTagSealsLogoBrandingText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'hangTagSealsLogoBrandingText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_hangTagSealsLogoBrandingText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter LOGO/BRANDING"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterHangTagSeals;
