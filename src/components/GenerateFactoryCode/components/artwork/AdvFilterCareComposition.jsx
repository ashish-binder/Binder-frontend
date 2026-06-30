// AdvFilterCareComposition — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { CARE_COMPOSITION_TYPES, CARE_COMPOSITION_MATERIALS, CARE_COMPOSITION_TESTING_REQUIREMENTS, CARE_COMPOSITION_APPROVAL_OPTIONS, CARE_COMPOSITION_PRINT_TYPE_OPTIONS, CARE_COMPOSITION_INK_TYPE_OPTIONS, CARE_COMPOSITION_MANUFACTURER_ID_OPTIONS, CARE_COMPOSITION_PERMANENCE_OPTIONS, CARE_COMPOSITION_LANGUAGE_OPTIONS } from '../../data/careCompositionData';

const AdvFilterCareComposition = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showCareCompositionAdvancedFilter', !material.showCareCompositionAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showCareCompositionAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showCareCompositionAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showCareCompositionAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showCareCompositionAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showCareCompositionAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showCareCompositionAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* PRINT TYPE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PRINT TYPE
                            </label>
                                                      <SearchableDropdown
                            value={material.careCompositionPrintType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionPrintType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionPrintTypeText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_PRINT_TYPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionPrintType`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.careCompositionPrintType === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.careCompositionPrintTypeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionPrintTypeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionPrintTypeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PRINT TYPE"
                              />
                            )}
                          </div>
                          
                          {/* INK TYPE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              INK TYPE
                            </label>
                                                      <SearchableDropdown
                            value={material.careCompositionInkType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionInkType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionInkTypeText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_INK_TYPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionInkType`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.careCompositionInkType === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.careCompositionInkTypeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionInkTypeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionInkTypeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter INK TYPE"
                              />
                            )}
                          </div>
                          
                          {/* MANUFACTURER ID - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              MANUFACTURER ID
                            </label>
                                                      <SearchableDropdown
                            value={material.careCompositionManufacturerId || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionManufacturerId', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionManufacturerIdText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_MANUFACTURER_ID_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionManufacturerId`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.careCompositionManufacturerId === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.careCompositionManufacturerIdText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionManufacturerIdText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionManufacturerIdText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter MANUFACTURER ID"
                              />
                            )}
                          </div>
                          
                          {/* PERMANENCE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PERMANENCE
                            </label>
                                                      <SearchableDropdown
                            value={material.careCompositionPermanence || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionPermanence', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionPermanenceText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_PERMANENCE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionPermanence`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.careCompositionPermanence === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.careCompositionPermanenceText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionPermanenceText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionPermanenceText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PERMANENCE"
                              />
                            )}
                          </div>
                          
                          {/* LANGUAGE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              LANGUAGE
                            </label>
                                                      <SearchableDropdown
                            value={material.careCompositionLanguage || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionLanguage', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'careCompositionLanguageText', '');
                              }
                            }}
                            options={CARE_COMPOSITION_LANGUAGE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_careCompositionLanguage`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.careCompositionLanguage === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.careCompositionLanguageText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'careCompositionLanguageText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_careCompositionLanguageText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter LANGUAGE"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterCareComposition;
