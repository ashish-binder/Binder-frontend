// AdvFilterBellyBand — extracted from Step4.jsx (PART-3 Artwork & Labeling). Pure
// presentational; state lives in the GenerateFactoryCode orchestrator and
// arrives via props.
import SearchableDropdown from '../SearchableDropdown';
import { BELLY_BAND_TYPES, BELLY_BAND_MATERIALS, BELLY_BAND_CLOSURE_OPTIONS, BELLY_BAND_TESTING_REQUIREMENTS, BELLY_BAND_APPROVAL_OPTIONS, BELLY_BAND_PRODUCT_FIT_OPTIONS, BELLY_BAND_PRINTING_OPTIONS, BELLY_BAND_FOLD_LINES_OPTIONS, BELLY_BAND_DURABILITY_OPTIONS, BELLY_BAND_CONTENT_OPTIONS, BELLY_BAND_COLOURS_OPTIONS, BELLY_BAND_FINISH_OPTIONS, BELLY_BAND_DIE_CUT_OPTIONS, BELLY_BAND_GUMMING_QUALITY_OPTIONS } from '../../data/bellyBandData';

const AdvFilterBellyBand = ({
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
                        onClick={() => handleArtworkMaterialChange(actualIndex, 'showBellyBandAdvancedFilter', !material.showBellyBandAdvancedFilter)}
                        className="border-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          padding: '10px 20px',
                          height: '44px',
                          backgroundColor: material.showBellyBandAdvancedFilter ? 'var(--primary)' : 'var(--card)',
                          borderColor: material.showBellyBandAdvancedFilter ? 'var(--primary)' : 'var(--border)',
                          color: material.showBellyBandAdvancedFilter ? 'var(--primary-foreground)' : 'var(--foreground)'
                        }}
                        onMouseEnter={(e) => {
                          if (!material.showBellyBandAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!material.showBellyBandAdvancedFilter) {
                            e.currentTarget.style.backgroundColor = 'var(--card)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        Advance Filter
                      </button>
                    </div>
                    
                    {/* Advanced Filter UI Table */}
                    {material.showBellyBandAdvancedFilter && (
                      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
                        <h4 className="text-sm font-semibold text-gray-800 mb-6">ADVANCE SPEC~UI</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* PRODUCT FIT - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PRODUCT FIT
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandProductFit || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandProductFit', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandProductFitText', '');
                              }
                            }}
                            options={BELLY_BAND_PRODUCT_FIT_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandProductFit`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandProductFit === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandProductFitText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandProductFitText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandProductFitText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PRODUCT FIT"
                              />
                            )}
                          </div>
                          
                          {/* PRINTING - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              PRINTING
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandPrinting || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandPrinting', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandPrintingText', '');
                              }
                            }}
                            options={BELLY_BAND_PRINTING_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandPrinting`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandPrinting === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandPrintingText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandPrintingText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandPrintingText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter PRINTING"
                              />
                            )}
                          </div>
                          
                          {/* FOLD LINES - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FOLD LINES
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandFoldLines || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandFoldLines', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandFoldLinesText', '');
                              }
                            }}
                            options={BELLY_BAND_FOLD_LINES_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandFoldLines`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandFoldLines === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandFoldLinesText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandFoldLinesText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandFoldLinesText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FOLD LINES"
                              />
                            )}
                          </div>
                          
                          {/* DURABILITY - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              DURABILITY
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandDurability || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandDurability', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandDurabilityText', '');
                              }
                            }}
                            options={BELLY_BAND_DURABILITY_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandDurability`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandDurability === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandDurabilityText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandDurabilityText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandDurabilityText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter DURABILITY"
                              />
                            )}
                          </div>
                          
                          {/* CONTENT - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              CONTENT
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandContent || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandContent', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandContentText', '');
                              }
                            }}
                            options={BELLY_BAND_CONTENT_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandContent`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandContent === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandContentText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandContentText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandContentText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter CONTENT"
                              />
                            )}
                          </div>
                          
                          {/* COLOURS - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              COLOURS
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandColours || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandColours', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandColoursText', '');
                              }
                            }}
                            options={BELLY_BAND_COLOURS_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandColours`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandColours === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandColoursText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandColoursText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandColoursText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter COLOURS"
                              />
                            )}
                          </div>
                          
                          {/* FINISH - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              FINISH
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandFinish || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandFinish', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandFinishText', '');
                              }
                            }}
                            options={BELLY_BAND_FINISH_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandFinish`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandFinish === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandFinishText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandFinishText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandFinishText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter FINISH"
                              />
                            )}
                          </div>
                          
                          {/* DIE-CUT - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              DIE-CUT
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandDieCut || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandDieCut', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandDieCutText', '');
                              }
                            }}
                            options={BELLY_BAND_DIE_CUT_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandDieCut`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandDieCut === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandDieCutText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandDieCutText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandDieCutText`] ? 'border-red-600' : 'border-border'}`}
                                style={{ padding: '10px 14px', height: '44px' }}
                                placeholder="Enter DIE-CUT"
                              />
                            )}
                          </div>
                          
                          {/* GUMMING QUALITY - Dropdown with Others option */}
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                              GUMMING QUALITY
                            </label>
                                                      <SearchableDropdown
                            value={material.bellyBandGummingQuality || ''}
                            onChange={(selectedValue) => {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandGummingQuality', selectedValue);
                              if (selectedValue === 'OTHERS (TEXT)') {
                              handleArtworkMaterialChange(actualIndex, 'bellyBandGummingQualityText', '');
                              }
                            }}
                            options={BELLY_BAND_GUMMING_QUALITY_OPTIONS}
                            placeholder="Select or type"
                            className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_bellyBandGummingQuality`] ? 'border-red-600' : 'border-border'}`}
                          />
                            {material.bellyBandGummingQuality === 'OTHERS (TEXT)' && (
                              <input
                                type="text"
                                value={material.bellyBandGummingQualityText || ''}
                                onChange={(e) => handleArtworkMaterialChange(actualIndex, 'bellyBandGummingQualityText', e.target.value)}
                                className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none mt-2 ${errors[`artworkMaterial_${actualIndex}_bellyBandGummingQualityText`] ? 'border-red-600' : 'border-border'}`}
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

export default AdvFilterBellyBand;
