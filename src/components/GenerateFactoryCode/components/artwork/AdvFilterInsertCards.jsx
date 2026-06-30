// AdvFilterInsertCards — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { INSERT_CARDS_TYPES, INSERT_CARDS_MATERIALS, INSERT_CARDS_TESTING_REQUIREMENTS, INSERT_CARDS_APPROVAL_OPTIONS, INSERT_CARDS_FUNCTION_OPTIONS, INSERT_CARDS_CONTENT_OPTIONS, INSERT_CARDS_PRINTING_OPTIONS, INSERT_CARDS_FINISH_OPTIONS, INSERT_CARDS_STIFFNESS_OPTIONS, INSERT_CARDS_ACID_FREE_OPTIONS, INSERT_CARDS_BRANDING_OPTIONS } from '../../data/insertCardsData';

const AdvFilterInsertCards = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showInsertCardsAdvancedFilter', !material.showInsertCardsAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showInsertCardsAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showInsertCardsAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showInsertCardsAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showInsertCardsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showInsertCardsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showInsertCardsAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* FUNCTION - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FUNCTION
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsFunction || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsFunction', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsFunctionText', '');
                              }
                            }}
                            options={INSERT_CARDS_FUNCTION_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsFunction`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsFunction === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsFunctionText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsFunctionText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsFunctionText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FUNCTION"
                              />
                )}
              </div>

                          {/* CONTENT - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              CONTENT
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsContent || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsContent', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsContentText', '');
                              }
                            }}
                            options={INSERT_CARDS_CONTENT_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsContent`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsContent === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsContentText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsContentText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsContentText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter CONTENT"
                              />
                            )}
                          </div>

                          {/* PRINTING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PRINTING
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsPrinting || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsPrinting', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsPrintingText', '');
                              }
                            }}
                            options={INSERT_CARDS_PRINTING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsPrinting`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsPrinting === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsPrintingText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsPrintingText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsPrintingText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PRINTING"
                              />
                            )}
                          </div>

                          {/* FINISH - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FINISH
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsFinish || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsFinish', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsFinishText', '');
                              }
                            }}
                            options={INSERT_CARDS_FINISH_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsFinish`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsFinish === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsFinishText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsFinishText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsFinishText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FINISH"
                              />
                            )}
                          </div>

                          {/* STIFFNESS - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              STIFFNESS
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsStiffness || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsStiffness', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsStiffnessText', '');
                              }
                            }}
                            options={INSERT_CARDS_STIFFNESS_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsStiffness`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsStiffness === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsStiffnessText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsStiffnessText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsStiffnessText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter STIFFNESS"
                              />
                            )}
                          </div>

                          {/* ACID-FREE - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              ACID-FREE
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsAcidFree || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsAcidFree', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsAcidFreeText', '');
                              }
                            }}
                            options={INSERT_CARDS_ACID_FREE_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsAcidFree`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsAcidFree === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsAcidFreeText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsAcidFreeText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsAcidFreeText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter ACID-FREE"
                              />
                            )}
                          </div>

                          {/* BRANDING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              BRANDING
                            </label>
                                                      <SearchableDropdown
                            value={material.insertCardsBranding || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsBranding', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'insertCardsBrandingText', '');
                              }
                            }}
                            options={INSERT_CARDS_BRANDING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_insertCardsBranding`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.insertCardsBranding === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.insertCardsBrandingText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'insertCardsBrandingText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_insertCardsBrandingText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter BRANDING"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterInsertCards;
