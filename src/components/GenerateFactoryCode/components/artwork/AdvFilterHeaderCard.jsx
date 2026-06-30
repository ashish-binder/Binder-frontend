// AdvFilterHeaderCard — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { HEADER_CARDS_TYPES, HEADER_CARDS_MATERIALS, HEADER_CARDS_TESTING_REQUIREMENTS, HEADER_CARDS_APPROVAL_OPTIONS, HEADER_CARDS_FUNCTION_OPTIONS, HEADER_CARDS_CONTENT_OPTIONS, HEADER_CARDS_PRINTING_OPTIONS, HEADER_CARDS_FINISH_OPTIONS, HEADER_CARDS_STIFFNESS_OPTIONS, HEADER_CARDS_ACID_FREE_OPTIONS, HEADER_CARDS_BRANDING_OPTIONS } from '../../data/headerCardsData';

const AdvFilterHeaderCard = ({
  material,
  actualIndex,
  handleArtworkMaterialChange,
}) => (
  <>
                  <div className="w-full" style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showHeaderCardsAdvancedFilter', !material.showHeaderCardsAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showHeaderCardsAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showHeaderCardsAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showHeaderCardsAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showHeaderCardsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showHeaderCardsAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    {material.showHeaderCardsAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">FUNCTION</label>
                            <SearchableDropdown
                              value={material.headerCardFunction || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardFunction', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardFunctionText', '');
                              }}
                              options={HEADER_CARDS_FUNCTION_OPTIONS}
                              placeholder="Select or type"
                              className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border`}
                            />
                            {material.headerCardFunction === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardFunctionText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardFunctionText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter FUNCTION" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">CONTENT</label>
                            <SearchableDropdown
                              value={material.headerCardContent || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardContent', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardContentText', '');
                              }}
                              options={HEADER_CARDS_CONTENT_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardContent === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardContentText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardContentText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter CONTENT" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">PRINTING</label>
                            <SearchableDropdown
                              value={material.headerCardPrinting || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardPrinting', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardPrintingText', '');
                              }}
                              options={HEADER_CARDS_PRINTING_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardPrinting === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardPrintingText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardPrintingText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter PRINTING" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">FINISH</label>
                            <SearchableDropdown
                              value={material.headerCardFinish || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardFinish', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardFinishText', '');
                              }}
                              options={HEADER_CARDS_FINISH_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardFinish === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardFinishText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardFinishText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter FINISH" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">STIFFNESS</label>
                            <SearchableDropdown
                              value={material.headerCardStiffness || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardStiffness', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardStiffnessText', '');
                              }}
                              options={HEADER_CARDS_STIFFNESS_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardStiffness === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardStiffnessText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardStiffnessText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter STIFFNESS" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">ACID-FREE</label>
                            <SearchableDropdown
                              value={material.headerCardAcidFree || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardAcidFree', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardAcidFreeText', '');
                              }}
                              options={HEADER_CARDS_ACID_FREE_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardAcidFree === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardAcidFreeText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardAcidFreeText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter ACID-FREE" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">BRANDING</label>
                            <SearchableDropdown
                              value={material.headerCardBranding || ''}
                              onChange={(selectedValue) => {
                                handleArtworkMaterialChange(actualIndex, 'headerCardBranding', selectedValue);
                                if (selectedValue === 'OTHERS (TEXT)') handleArtworkMaterialChange(actualIndex, 'headerCardBrandingText', '');
                              }}
                              options={HEADER_CARDS_BRANDING_OPTIONS}
                              placeholder="Select or type"
                              className="border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none border-border"
                            />
                            {material.headerCardBranding === 'OTHERS (TEXT)' && (
                              <input type="text" value={material.headerCardBrandingText || ''} onChange={(e) => handleArtworkMaterialChange(actualIndex, 'headerCardBrandingText', e.target.value)} className="border-2 rounded-lg text-sm mt-2 bg-background text-foreground border-border" style={{ padding: '10px 14px', height: '44px' }} placeholder="Enter BRANDING" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  </>
);

export default AdvFilterHeaderCard;
