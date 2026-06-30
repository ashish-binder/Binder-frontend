// AdvFilterAntiCounterfeit — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { ANTI_COUNTERFEIT_TYPES, ANTI_COUNTERFEIT_MATERIALS, ANTI_COUNTERFEIT_SECURITY_FEATURES, ANTI_COUNTERFEIT_HOLOGRAM_TYPES, ANTI_COUNTERFEIT_NUMBERING_OPTIONS, ANTI_COUNTERFEIT_TESTING_REQUIREMENTS, ANTI_COUNTERFEIT_APPROVAL_OPTIONS, ANTI_COUNTERFEIT_VERIFICATION_OPTIONS, ANTI_COUNTERFEIT_QR_CODE_CONTENT_OPTIONS, ANTI_COUNTERFEIT_APPLICATION_OPTIONS, ANTI_COUNTERFEIT_TAMPER_EVIDENCE_OPTIONS, ANTI_COUNTERFEIT_DATABASE_OPTIONS, ANTI_COUNTERFEIT_GUMMING_QUALITY_OPTIONS } from '../../data/antiCounterfeitData';

const AdvFilterAntiCounterfeit = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showAntiCounterfeitAdvancedFilter', !material.showAntiCounterfeitAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showAntiCounterfeitAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showAntiCounterfeitAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showAntiCounterfeitAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showAntiCounterfeitAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showAntiCounterfeitAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
              </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showAntiCounterfeitAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* VERIFICATION - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              VERIFICATION
                            </label>
                                                      <SearchableDropdown
                            value={material.verification || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'verification', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'verificationText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_VERIFICATION_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_verification`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.verification === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.verificationText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'verificationText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_verificationText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter VERIFICATION"
                              />
                )}
              </div>
                          
                          {/* QR/CODE CONTENT - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              QR/CODE CONTENT
                            </label>
                                                      <SearchableDropdown
                            value={material.qrCodeContent || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'qrCodeContent', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'qrCodeContentText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_QR_CODE_CONTENT_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_qrCodeContent`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.qrCodeContent === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.qrCodeContentText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'qrCodeContentText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_qrCodeContentText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter QR/CODE CONTENT"
                              />
                            )}
                          </div>
                          
                          {/* APPLICATION - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              APPLICATION
                            </label>
                                                      <SearchableDropdown
                            value={material.antiCounterfeitApplication || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApplication', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApplicationText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_APPLICATION_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitApplication`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.antiCounterfeitApplication === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.antiCounterfeitApplicationText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitApplicationText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitApplicationText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter APPLICATION"
                              />
                            )}
                          </div>
                          
                          {/* TAMPER EVIDENCE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              TAMPER EVIDENCE
                            </label>
                                                      <SearchableDropdown
                            value={material.tamperEvidence || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'tamperEvidence', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'tamperEvidenceText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_TAMPER_EVIDENCE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_tamperEvidence`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.tamperEvidence === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.tamperEvidenceText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'tamperEvidenceText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_tamperEvidenceText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter TAMPER EVIDENCE"
                              />
                            )}
                          </div>
                          
                          {/* DATABASE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              DATABASE
                            </label>
                                                      <SearchableDropdown
                            value={material.antiCounterfeitDatabase || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitDatabase', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'antiCounterfeitDatabaseText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_DATABASE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitDatabase`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.antiCounterfeitDatabase === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.antiCounterfeitDatabaseText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'antiCounterfeitDatabaseText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_antiCounterfeitDatabaseText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter DATABASE"
                              />
                            )}
                          </div>
                          
                          {/* GUMMING QUALITY - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              GUMMING QUALITY
                            </label>
                                                      <SearchableDropdown
                            value={material.gummingQuality || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'gummingQuality', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'gummingQualityText', '');
                              }
                            }}
                            options={ANTI_COUNTERFEIT_GUMMING_QUALITY_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_gummingQuality`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.gummingQuality === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.gummingQualityText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'gummingQualityText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_gummingQualityText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter GUMMING QUALITY"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterAntiCounterfeit;
