// AdvFilterHeatTransfer — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { HEAT_TRANSFER_TYPES, HEAT_TRANSFER_MATERIAL_BASE_OPTIONS, HEAT_TRANSFER_TESTING_REQUIREMENTS, HEAT_TRANSFER_APPROVAL_OPTIONS, HEAT_TRANSFER_INK_TYPE_OPTIONS, HEAT_TRANSFER_FABRIC_COMPATIBILITY_OPTIONS, HEAT_TRANSFER_APPLICATION_SPEC_OPTIONS, HEAT_TRANSFER_PEEL_TYPE_OPTIONS, HEAT_TRANSFER_FINISH_HAND_FEEL_OPTIONS, HEAT_TRANSFER_STRETCH_OPTIONS } from '../../data/heatTransferData';

const AdvFilterHeatTransfer = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showHeatTransferAdvancedFilter', !material.showHeatTransferAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showHeatTransferAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showHeatTransferAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showHeatTransferAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showHeatTransferAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showHeatTransferAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showHeatTransferAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* INK TYPE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              INK TYPE
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferInkType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferInkType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferInkTypeText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_INK_TYPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferInkType`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferInkType === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferInkTypeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferInkTypeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferInkTypeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter INK TYPE"
                              />
                )}
              </div>
                          
                          {/* FABRIC COMPATIBILITY - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FABRIC COMPATIBILITY
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferFabricCompatibility || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferFabricCompatibility', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferFabricCompatibilityText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_FABRIC_COMPATIBILITY_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferFabricCompatibility`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferFabricCompatibility === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferFabricCompatibilityText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferFabricCompatibilityText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferFabricCompatibilityText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FABRIC COMPATIBILITY"
                              />
                            )}
                          </div>
                          
                          {/* APPLICATION SPEC - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              APPLICATION SPEC
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferApplicationSpec || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferApplicationSpec', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferApplicationSpecText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_APPLICATION_SPEC_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferApplicationSpec`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferApplicationSpec === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferApplicationSpecText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferApplicationSpecText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferApplicationSpecText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter APPLICATION SPEC"
                              />
                            )}
                          </div>
                          
                          {/* PEEL TYPE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PEEL TYPE
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferPeelType || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferPeelType', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferPeelTypeText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_PEEL_TYPE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferPeelType`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferPeelType === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferPeelTypeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferPeelTypeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferPeelTypeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PEEL TYPE"
                              />
                            )}
                          </div>
                          
                          {/* FINISH / HAND FEEL - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FINISH / HAND FEEL
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferFinishHandFeel || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferFinishHandFeel', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferFinishHandFeelText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_FINISH_HAND_FEEL_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferFinishHandFeel`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferFinishHandFeel === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferFinishHandFeelText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferFinishHandFeelText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferFinishHandFeelText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FINISH / HAND FEEL"
                              />
                            )}
                          </div>
                          
                          {/* STRETCH - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              STRETCH
                            </label>
                                                      <SearchableDropdown
                            value={material.heatTransferStretch || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferStretch', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'heatTransferStretchText', '');
                              }
                            }}
                            options={HEAT_TRANSFER_STRETCH_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_heatTransferStretch`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.heatTransferStretch === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.heatTransferStretchText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'heatTransferStretchText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_heatTransferStretchText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter STRETCH"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterHeatTransfer;
