// AdvFilterFlammabilitySafety — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { FLAMMABILITY_SAFETY_TYPES, FLAMMABILITY_SAFETY_MATERIALS, FLAMMABILITY_SAFETY_TESTING_REQUIREMENTS, FLAMMABILITY_SAFETY_APPROVAL_OPTIONS, FLAMMABILITY_SAFETY_REGULATION_OPTIONS, FLAMMABILITY_SAFETY_FONT_SIZE_OPTIONS, FLAMMABILITY_SAFETY_PERMANENCE_OPTIONS, FLAMMABILITY_SAFETY_SYMBOL_OPTIONS, FLAMMABILITY_SAFETY_INK_DURABILITY_OPTIONS, FLAMMABILITY_SAFETY_CERTIFICATION_ID_OPTIONS } from '../../data/flammabilitySafetyData';

const AdvFilterFlammabilitySafety = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showFlammabilitySafetyAdvancedFilter', !material.showFlammabilitySafetyAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showFlammabilitySafetyAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showFlammabilitySafetyAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showFlammabilitySafetyAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showFlammabilitySafetyAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showFlammabilitySafetyAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showFlammabilitySafetyAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* REGULATION - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              REGULATION
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetyRegulation || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyRegulation', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyRegulationText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_REGULATION_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyRegulation`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetyRegulation === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetyRegulationText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyRegulationText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyRegulationText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter REGULATION"
                              />
                            )}
                          </div>
                          
                          {/* FONT SIZE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FONT SIZE
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetyFontSize || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyFontSize', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyFontSizeText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_FONT_SIZE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyFontSize`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetyFontSize === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetyFontSizeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyFontSizeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyFontSizeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FONT SIZE"
                              />
                            )}
                          </div>
                          
                          {/* PERMANENCE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PERMANENCE
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetyPermanence || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyPermanence', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyPermanenceText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_PERMANENCE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyPermanence`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetyPermanence === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetyPermanenceText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyPermanenceText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyPermanenceText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PERMANENCE"
                              />
                            )}
                          </div>
                          
                          {/* SYMBOL - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              SYMBOL
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetySymbol || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySymbol', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySymbolText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_SYMBOL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySymbol`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetySymbol === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetySymbolText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetySymbolText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetySymbolText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter SYMBOL"
                              />
                            )}
                          </div>
                          
                          {/* INK DURABILITY - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              INK DURABILITY
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetyInkDurability || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyInkDurability', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyInkDurabilityText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_INK_DURABILITY_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyInkDurability`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetyInkDurability === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetyInkDurabilityText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyInkDurabilityText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyInkDurabilityText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter INK DURABILITY"
                              />
                            )}
                          </div>
                          
                          {/* CERTIFICATION ID - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              CERTIFICATION ID
                            </label>
                                                      <SearchableDropdown
                            value={material.flammabilitySafetyCertificationId || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyCertificationId', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyCertificationIdText', '');
                              }
                            }}
                            options={FLAMMABILITY_SAFETY_CERTIFICATION_ID_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyCertificationId`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.flammabilitySafetyCertificationId === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.flammabilitySafetyCertificationIdText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'flammabilitySafetyCertificationIdText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_flammabilitySafetyCertificationIdText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter CERTIFICATION ID"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterFlammabilitySafety;
