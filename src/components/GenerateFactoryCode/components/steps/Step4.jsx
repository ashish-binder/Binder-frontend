import { useEffect, useRef, useState } from 'react';
import { getArtworkDescriptionSyntax } from '../../utils/materialDescription';
import SearchableDropdown from '../SearchableDropdown';
import { ARTWORK_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import QualityVerificationToggle from '../QualityVerificationToggle';
// Step 4 artwork category + advanced-filter spec blocks (one file each)
import CategoryLabelsBrand from '../artwork/CategoryLabelsBrand';
import CategoryCareComposition from '../artwork/CategoryCareComposition';
import CategoryRfidSecurity from '../artwork/CategoryRfidSecurity';
import CategoryLawLabel from '../artwork/CategoryLawLabel';
import CategoryHangTagSeals from '../artwork/CategoryHangTagSeals';
import CategoryHeatTransfer from '../artwork/CategoryHeatTransfer';
import CategoryUpcBarcode from '../artwork/CategoryUpcBarcode';
import CategoryPriceTicket from '../artwork/CategoryPriceTicket';
import CategoryAntiCounterfeit from '../artwork/CategoryAntiCounterfeit';
import CategoryQcInspection from '../artwork/CategoryQcInspection';
import CategoryBellyBand from '../artwork/CategoryBellyBand';
import CategorySizeLabels from '../artwork/CategorySizeLabels';
import CategoryTagsSpecial from '../artwork/CategoryTagsSpecial';
import CategoryFlammabilitySafety from '../artwork/CategoryFlammabilitySafety';
import CategoryInsertCards from '../artwork/CategoryInsertCards';
import CategoryHeaderCard from '../artwork/CategoryHeaderCard';
import CategoryRibbons from '../artwork/CategoryRibbons';
import AdvFilterInsertCards from '../artwork/AdvFilterInsertCards';
import AdvFilterHeaderCard from '../artwork/AdvFilterHeaderCard';
import AdvFilterHeatTransfer from '../artwork/AdvFilterHeatTransfer';
import AdvFilterHangTagSeals from '../artwork/AdvFilterHangTagSeals';
import AdvFilterAntiCounterfeit from '../artwork/AdvFilterAntiCounterfeit';
import AdvFilterCareComposition from '../artwork/AdvFilterCareComposition';
import AdvFilterFlammabilitySafety from '../artwork/AdvFilterFlammabilitySafety';
import AdvFilterBellyBand from '../artwork/AdvFilterBellyBand';


const Step4 = ({
  formData,
  errors,
  renderHeaderAction,
  handleArtworkMaterialChange,
  addArtworkMaterial,
  removeArtworkMaterial,
  step3SelectedComponentRef
}) => {
  const [selectedComponent, setSelectedComponent] = useState('');
  const prevMaterialsLengthRef = useRef(formData.artworkMaterials?.length || 0);
  const isInitialMountRef = useRef(true);

  // Sync selected component to parent so Save validates only this component
  useEffect(() => {
    if (step3SelectedComponentRef) {
      step3SelectedComponentRef.current = selectedComponent;
    }
  }, [selectedComponent, step3SelectedComponentRef]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevMaterialsLengthRef.current = formData.artworkMaterials?.length || 0;
      return;
    }
    
    const currentMaterialsLength = formData.artworkMaterials?.length || 0;
    if (currentMaterialsLength > prevMaterialsLengthRef.current) {
      setTimeout(() => {
        const lastMaterial = document.querySelector('[data-artwork-material-index]:last-child');
        if (lastMaterial) {
          lastMaterial.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    prevMaterialsLengthRef.current = currentMaterialsLength;
  }, [formData.artworkMaterials?.length]);

  // Get list of component names from Step 1 products/components
  const getComponentOptions = () => {
    const names = [];
    (formData.products || []).forEach((product) => {
      (product.components || []).forEach((component) => {
        if (component?.productComforter) {
          names.push(component.productComforter);
        }
      });
    });
    return [...new Set(names)];
  };

  // Artwork materials for the selected component only (like Part-2 raw materials per component)
  const getArtworkMaterialsForSelectedComponent = () => {
    if (!selectedComponent) return [];
    return (formData.artworkMaterials || []).filter((m) => (m.components || '') === selectedComponent);
  };

  const materialsForComponent = getArtworkMaterialsForSelectedComponent();

  return (
<div className="w-full">
      {/* Header with proper spacing */}
      <div style={{ marginBottom: '28px' }} className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">PART-2 ARTWORK & LABELING</h2>
          <p className="text-sm text-gray-600">Artwork & packaging materials</p>
        </div>
        {renderHeaderAction}
      </div>

      {/* Component Selection - OUTSIDE form border (like Part-2) */}
      <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '300px' }}>
          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', marginBottom: '8px' }}>
            COMPONENT
          </label>
          <SearchableDropdown
            value={selectedComponent || ''}
            onChange={(val) => setSelectedComponent(val || '')}
            options={getComponentOptions()}
            placeholder="Select component"
            className="border-2 rounded-lg text-sm transition-all bg-background text-foreground border-border focus:border-primary focus:outline-none"
            style={{ padding: '10px 14px', height: '44px', width: '100%' }}
          />
        </div>
      </div>

      {/* Artwork Materials for selected component */}
      {selectedComponent && (
        <div>
          {materialsForComponent.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-200" style={{ padding: '40px 24px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>Add artwork materials for this component</p>
              <button
                type="button"
                onClick={() => addArtworkMaterial(selectedComponent)}
                className="border-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                style={{ padding: '10px 20px', backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                + Add Artwork Material
              </button>
            </div>
          ) : (
            <>
              {materialsForComponent.map((material, filteredIndex) => {
                const allMaterials = formData.artworkMaterials || [];
                const actualIndex = allMaterials.findIndex((m) => m === material);
                if (actualIndex === -1) return null;
                const materialNumber = filteredIndex + 1;
                return (
          <div key={`${selectedComponent}-${actualIndex}`} id={`artwork-material-${actualIndex}`} data-artwork-material-index={actualIndex} className="bg-gray-50 rounded-xl border border-gray-200" style={{ padding: '24px', marginBottom: '24px' }}>
            {/* Material Header with Remove Button */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h4 className="text-sm font-bold text-gray-700">MATERIAL {materialNumber}</h4>
              {materialsForComponent.length >= 1 && (
                <button
                  type="button"
                  onClick={() => removeArtworkMaterial(actualIndex)}
                  className="border rounded-md cursor-pointer text-xs font-medium transition-all hover:-translate-x-0.5"
                  style={{
                    backgroundColor: '#f3f4f6',
                    borderColor: '#d1d5db',
                    color: 'var(--foreground)',
                    padding: '4px 10px',
                    height: '28px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* ARTWORK CATEGORY SELECTOR */}
              <div className="w-full" style={{ marginTop: 0 }}>
                <div className="flex flex-col" style={{ width: '280px', marginBottom: '20px' }}>
                  <label className="text-sm font-bold text-gray-800 mb-2">ARTWORK CATEGORY</label>
                  <SearchableDropdown
                    value={material.artworkCategory || ''}
                    onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'artworkCategory', selectedValue)}
                    options={['LABELS (BRAND/MAIN)', 'CARE & COMPOSITION', 'TAGS & SPECIAL LABELS', 'FLAMMABILITY / SAFETY LABELS', 'RFID / SECURITY TAGS', 'LAW LABEL / CONTENTS TAG', 'HANG TAG SEALS / STRINGS', 'PRICE TICKET / BARCODE TAG', 'HEAT TRANSFER LABELS', 'UPC LABEL / BARCODE STICKER', 'SIZE LABELS (INDIVIDUAL)', 'ANTI-COUNTERFEIT & HOLOGRAMS', 'QC / INSPECTION LABELS', 'BELLY BAND / WRAPPER', 'INSERT CARDS', 'HEADER CARD', 'RIBBONS']}
                    placeholder="Select or type Category"
                    style={{ width: '280px' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                  />
                </div>

                {material.artworkCategory && (
                  <>
                  {/* Auto-generated MATERIAL DESC (read-only). Clicking reveals the
                      source spec fields below so the user edits the origin. */}
                  <div className="flex flex-col" style={{ width: '100%', maxWidth: '640px', marginBottom: '20px' }}>
                    <label className="text-sm font-bold text-gray-800 mb-2">MATERIAL DESC</label>
                    <div
                      role="textbox"
                      tabIndex={0}
                      onClick={() => {
                        if (typeof document !== 'undefined') {
                          const card = document.querySelector(`[data-artwork-material-index="${actualIndex}"]`);
                          const anchor = card?.querySelector('[data-spec-anchor]') || card;
                          anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      title="Auto-generated from specifications — click to edit the source fields"
                      className="border-2 rounded-lg text-sm bg-gray-100 border-border cursor-pointer focus:outline-none w-full break-words [overflow-wrap:anywhere]"
                      style={{ padding: '10px 14px', minHeight: '44px' }}
                    >
                      {material.materialDescription
                        ? <span className="text-gray-900">{material.materialDescription}</span>
                        : <span className="text-gray-400">{getArtworkDescriptionSyntax(material.artworkCategory) || 'Fill specifications below'}</span>}
                    </div>
                  </div>
                  <div data-spec-anchor className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-5">
                    {/* TYPE Field */}
                    {!['RFID / SECURITY TAGS', 'LAW LABEL / CONTENTS TAG', 'HANG TAG SEALS / STRINGS', 'PRICE TICKET / BARCODE TAG', 'HEAT TRANSFER LABELS', 'UPC LABEL / BARCODE STICKER', 'SIZE LABELS (INDIVIDUAL)', 'ANTI-COUNTERFEIT & HOLOGRAMS', 'QC / INSPECTION LABELS', 'BELLY BAND / WRAPPER', 'CARE & COMPOSITION', 'FLAMMABILITY / SAFETY LABELS', 'INSERT CARDS', 'HEADER CARD', 'LABELS (BRAND/MAIN)', 'RIBBONS', 'TAGS & SPECIAL LABELS'].includes(material.artworkCategory) && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">TYPE</label>
                      <SearchableDropdown
                        value={material.specificType || ''}
                        onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'specificType', selectedValue)}
                        options={
                          material.artworkCategory === 'LABELS (BRAND/MAIN)' ? ['Woven (Damask, Taffeta, Satin)', 'Printed (Satin, Cotton)', 'Heat Transfer', 'Leather', 'Metal'] :
                          material.artworkCategory === 'CARE & COMPOSITION' ? ['Woven', 'Printed', 'Heat Transfer'] :
                          material.artworkCategory === 'FLAMMABILITY / SAFETY LABELS' ? ['Permanent Sew-in Label', 'Removable Hang Tag'] :
                          material.artworkCategory === 'PRICE TICKET / BARCODE TAG' ? ['Adhesive Sticker', 'Printed Area', 'Dedicated Small Tag'] :
                          material.artworkCategory === 'ANTI-COUNTERFEIT & HOLOGRAMS' ? ['Hologram Sticker', 'Void/Tamper-Evident Label', 'Authenticity Patch', 'Invisible Ink Print'] :
                          material.artworkCategory === 'QC / INSPECTION LABELS' ? ['Passed/Inspected Sticker', 'Hold/Defective Sticker', 'Audit Sample Tag'] :
                          material.artworkCategory === 'BELLY BAND / WRAPPER' ? ['Cardboard Sleeve', 'Printed Paper Band', 'Plastic Film Wrapper'] :
                          []
                        }
                        placeholder="Select or type Type"
                      />
                    </div>
                    )}

                    {/* MATERIAL Field */}
                    {!['RFID / SECURITY TAGS', 'LAW LABEL / CONTENTS TAG', 'HANG TAG SEALS / STRINGS', 'PRICE TICKET / BARCODE TAG', 'HEAT TRANSFER LABELS', 'UPC LABEL / BARCODE STICKER', 'SIZE LABELS (INDIVIDUAL)', 'ANTI-COUNTERFEIT & HOLOGRAMS', 'QC / INSPECTION LABELS', 'BELLY BAND / WRAPPER', 'CARE & COMPOSITION', 'FLAMMABILITY / SAFETY LABELS', 'INSERT CARDS', 'HEADER CARD', 'LABELS (BRAND/MAIN)', 'RIBBONS', 'TAGS & SPECIAL LABELS'].includes(material.artworkCategory) && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                          {material.artworkCategory === 'CARE & COMPOSITION' ? 'FIBER CONTENT' : 'MATERIAL'}
                      </label>
                      <input
                        type="text"
                        value={material.material}
                        onChange={(e) => handleArtworkMaterialChange(actualIndex, 'material', e.target.value)}
                        className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_material`] ? 'border-red-600' : 'border-border'}`}
                        style={{ padding: '10px 14px', height: '44px' }}
                          placeholder={
                            material.artworkCategory === 'CARE & COMPOSITION' ? 'Fiber Content' : 
                            material.artworkCategory === 'BELLY BAND / WRAPPER' ? 'Card Stock GSM' : 
                            'e.g., Polyester'
                          }
                      />
                    </div>
                    )}

                    {/* Specific Fields for LABELS (BRAND/MAIN) */}
                    {material.artworkCategory === 'LABELS (BRAND/MAIN)' && (
                      <CategoryLabelsBrand
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for CARE & COMPOSITION */}
                    {material.artworkCategory === 'CARE & COMPOSITION' && (
                      <CategoryCareComposition
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for RFID / SECURITY TAGS */}
                    {material.artworkCategory === 'RFID / SECURITY TAGS' && (
                      <CategoryRfidSecurity
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for LAW LABEL / CONTENTS TAG */}
                    {material.artworkCategory === 'LAW LABEL / CONTENTS TAG' && (
                      <CategoryLawLabel
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for HANG TAG SEALS / STRINGS */}
                    {material.artworkCategory === 'HANG TAG SEALS / STRINGS' && (
                      <CategoryHangTagSeals
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for HEAT TRANSFER LABELS */}
                    {material.artworkCategory === 'HEAT TRANSFER LABELS' && (
                      <CategoryHeatTransfer
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}


                    {/* Specific Fields for UPC LABEL / BARCODE STICKER */}
                    {material.artworkCategory === 'UPC LABEL / BARCODE STICKER' && (
                      <CategoryUpcBarcode
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for PRICE TICKET / BARCODE TAG */}
                    {material.artworkCategory === 'PRICE TICKET / BARCODE TAG' && (
                      <CategoryPriceTicket
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}


                    {/* Specific Fields for ANTI-COUNTERFEIT & HOLOGRAMS */}
                    {material.artworkCategory === 'ANTI-COUNTERFEIT & HOLOGRAMS' && (
                      <CategoryAntiCounterfeit
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for QC / INSPECTION LABELS */}
                    {material.artworkCategory === 'QC / INSPECTION LABELS' && (
                      <CategoryQcInspection
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for BELLY BAND / WRAPPER */}
                    {material.artworkCategory === 'BELLY BAND / WRAPPER' && (
                      <CategoryBellyBand
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}


                    {/* Specific Fields for SIZE LABELS (INDIVIDUAL) */}
                    {material.artworkCategory === 'SIZE LABELS (INDIVIDUAL)' && (
                      <CategorySizeLabels
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for TAGS & SPECIAL LABELS */}
                    {material.artworkCategory === 'TAGS & SPECIAL LABELS' && (
                      <CategoryTagsSpecial
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                
                
                    {/* Specific Fields for FLAMMABILITY / SAFETY LABELS */}
                    {material.artworkCategory === 'FLAMMABILITY / SAFETY LABELS' && (
                      <CategoryFlammabilitySafety
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}
                

                    {/* PERMANENCE / DURABILITY Field - Excluded for CARE & COMPOSITION (has its own in Advanced Filter) */}
                    {(['BELLY BAND / WRAPPER'].includes(material.artworkCategory)) && (
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                          {material.artworkCategory === 'BELLY BAND / WRAPPER' ? 'DURABILITY' : 'PERMANENCE'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={material.permanence}
                          onChange={(e) => handleArtworkMaterialChange(actualIndex, 'permanence', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_permanence`] ? 'border-red-600' : 'border-border'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="e.g., Permanent"
                        />
                        {errors[`artworkMaterial_${actualIndex}_permanence`] && <span className="text-red-600 text-xs mt-1">{errors[`artworkMaterial_${actualIndex}_permanence`]}</span>}
                      </div>
                    )}

                    {/* ADHESIVE Field */}
                    {(['UPC LABEL / BARCODE STICKER'].includes(material.artworkCategory)) && (
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">ADHESIVE</label>
                        <input
                          type="text"
                          value={material.adhesive}
                          onChange={(e) => handleArtworkMaterialChange(actualIndex, 'adhesive', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_adhesive`] ? 'border-red-600' : 'border-border'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="e.g., High-bond"
                        />
                      </div>
                    )}

                    {/* APPLICATION SPEC Field */}



                    {/* Specific Fields for INSERT CARDS */}
                    {material.artworkCategory === 'INSERT CARDS' && (
                      <CategoryInsertCards
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for HEADER CARD - Exact replica of INSERT CARDS */}
                    {material.artworkCategory === 'HEADER CARD' && (
                      <CategoryHeaderCard
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}

                    {/* Specific Fields for RIBBONS */}
                    {material.artworkCategory === 'RIBBONS' && (
                      <CategoryRibbons
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleArtworkMaterialChange={handleArtworkMaterialChange}
                      />
                    )}


                    {/* TESTING REQUIREMENT Field with Image Upload - For all except LAW LABEL / CONTENTS TAG, ANTI-COUNTERFEIT & HOLOGRAMS, BELLY BAND / WRAPPER, CARE & COMPOSITION, FLAMMABILITY / SAFETY LABELS, HANG TAG SEALS / STRINGS, HEAT TRANSFER LABELS, INSERT CARDS, LABELS (BRAND/MAIN), PRICE TICKET / BARCODE TAG, QC / INSPECTION LABELS, RFID / SECURITY TAGS, RIBBONS, SIZE LABELS (INDIVIDUAL), TAGS & SPECIAL LABELS, and UPC LABEL / BARCODE STICKER */}
                    {material.artworkCategory !== 'LAW LABEL / CONTENTS TAG' && material.artworkCategory !== 'ANTI-COUNTERFEIT & HOLOGRAMS' && material.artworkCategory !== 'BELLY BAND / WRAPPER' && material.artworkCategory !== 'CARE & COMPOSITION' && material.artworkCategory !== 'FLAMMABILITY / SAFETY LABELS' && material.artworkCategory !== 'HANG TAG SEALS / STRINGS' && material.artworkCategory !== 'HEAT TRANSFER LABELS' && material.artworkCategory !== 'INSERT CARDS' && material.artworkCategory !== 'HEADER CARD' && material.artworkCategory !== 'LABELS (BRAND/MAIN)' && material.artworkCategory !== 'PRICE TICKET / BARCODE TAG' && material.artworkCategory !== 'QC / INSPECTION LABELS' && material.artworkCategory !== 'RFID / SECURITY TAGS' && material.artworkCategory !== 'RIBBONS' && material.artworkCategory !== 'SIZE LABELS (INDIVIDUAL)' && material.artworkCategory !== 'TAGS & SPECIAL LABELS' && material.artworkCategory !== 'UPC LABEL / BARCODE STICKER' && (
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2">TESTING REQUIREMENT</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                            value={material.testingRequirement || ''}
                          onChange={(e) => handleArtworkMaterialChange(actualIndex, 'testingRequirement', e.target.value)}
                          className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none flex-grow ${errors[`artworkMaterial_${actualIndex}_testingRequirement`] ? 'border-red-600' : 'border-border'}`}
                          style={{ padding: '10px 14px', height: '44px' }}
                          placeholder="e.g., Wash Fastness"
                        />
                        <input
                          type="file"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArtworkMaterialChange(actualIndex, 'referenceImage', f); }}
                          className="hidden"
                          id={`art-file-${actualIndex}`}
                        />
                        <label
                          htmlFor={`art-file-${actualIndex}`}
                          className="border-2 rounded-lg text-sm transition-all bg-background cursor-pointer hover:bg-muted flex items-center justify-center gap-2 text-foreground border-border flex-shrink-0"
                          style={{ padding: '10px 14px', height: '44px', width: '110px' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="truncate">{material.referenceImage ? 'DONE' : 'UPLOAD'}</span>
                        </label>
                      </div>
                    </div>
                    )}


                    {/* LENGTH / QUANTITY Field - For all except LAW LABEL / CONTENTS TAG, ANTI-COUNTERFEIT & HOLOGRAMS, BELLY BAND / WRAPPER, CARE & COMPOSITION, FLAMMABILITY / SAFETY LABELS, HANG TAG SEALS / STRINGS, HEAT TRANSFER LABELS, INSERT CARDS, LABELS (BRAND/MAIN), PRICE TICKET / BARCODE TAG, QC / INSPECTION LABELS, RFID / SECURITY TAGS, RIBBONS, SIZE LABELS (INDIVIDUAL), TAGS & SPECIAL LABELS, and UPC LABEL / BARCODE STICKER */}
                    {material.artworkCategory !== 'LAW LABEL / CONTENTS TAG' && material.artworkCategory !== 'ANTI-COUNTERFEIT & HOLOGRAMS' && material.artworkCategory !== 'BELLY BAND / WRAPPER' && material.artworkCategory !== 'CARE & COMPOSITION' && material.artworkCategory !== 'FLAMMABILITY / SAFETY LABELS' && material.artworkCategory !== 'HANG TAG SEALS / STRINGS' && material.artworkCategory !== 'HEAT TRANSFER LABELS' && material.artworkCategory !== 'INSERT CARDS' && material.artworkCategory !== 'HEADER CARD' && material.artworkCategory !== 'LABELS (BRAND/MAIN)' && material.artworkCategory !== 'PRICE TICKET / BARCODE TAG' && material.artworkCategory !== 'QC / INSPECTION LABELS' && material.artworkCategory !== 'RFID / SECURITY TAGS' && material.artworkCategory !== 'RIBBONS' && material.artworkCategory !== 'SIZE LABELS (INDIVIDUAL)' && material.artworkCategory !== 'TAGS & SPECIAL LABELS' && material.artworkCategory !== 'UPC LABEL / BARCODE STICKER' && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">LENGTH / QUANTITY</label>
                      <input
                        type="text"
                          value={material.lengthQuantity || ''}
                        onChange={(e) => handleArtworkMaterialChange(actualIndex, 'lengthQuantity', e.target.value)}
                        className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_lengthQuantity`] ? 'border-red-600' : 'border-border'}`}
                        style={{ padding: '10px 14px', height: '44px' }}
                        placeholder="e.g., 5000 pcs"
                      />
                    </div>
                    )}


                    {/* SURPLUS Field with FOR SECTION - For all except LAW LABEL / CONTENTS TAG, ANTI-COUNTERFEIT & HOLOGRAMS, BELLY BAND / WRAPPER, CARE & COMPOSITION, FLAMMABILITY / SAFETY LABELS, HANG TAG SEALS / STRINGS, HEAT TRANSFER LABELS, INSERT CARDS, LABELS (BRAND/MAIN), PRICE TICKET / BARCODE TAG, QC / INSPECTION LABELS, RFID / SECURITY TAGS, RIBBONS, SIZE LABELS (INDIVIDUAL), TAGS & SPECIAL LABELS, and UPC LABEL / BARCODE STICKER */}
                    {material.artworkCategory !== 'LAW LABEL / CONTENTS TAG' && material.artworkCategory !== 'ANTI-COUNTERFEIT & HOLOGRAMS' && material.artworkCategory !== 'BELLY BAND / WRAPPER' && material.artworkCategory !== 'CARE & COMPOSITION' && material.artworkCategory !== 'FLAMMABILITY / SAFETY LABELS' && material.artworkCategory !== 'HANG TAG SEALS / STRINGS' && material.artworkCategory !== 'HEAT TRANSFER LABELS' && material.artworkCategory !== 'INSERT CARDS' && material.artworkCategory !== 'HEADER CARD' && material.artworkCategory !== 'LABELS (BRAND/MAIN)' && material.artworkCategory !== 'PRICE TICKET / BARCODE TAG' && material.artworkCategory !== 'QC / INSPECTION LABELS' && material.artworkCategory !== 'RFID / SECURITY TAGS' && material.artworkCategory !== 'RIBBONS' && material.artworkCategory !== 'SIZE LABELS (INDIVIDUAL)' && material.artworkCategory !== 'TAGS & SPECIAL LABELS' && material.artworkCategory !== 'UPC LABEL / BARCODE STICKER' && (
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS (%AGE / FOR)</label>
                      <div className={`flex items-center gap-0 border-2 rounded-lg bg-white overflow-hidden focus-within:border-primary transition-all ${errors[`artworkMaterial_${actualIndex}_surplus`] || errors[`artworkMaterial_${actualIndex}_surplusForSection`] ? 'border-red-600' : 'border-border'}`} style={{ height: '44px' }}>
                        <input
                          type="text"
                            value={material.surplus || ''}
                          onChange={(e) => handleArtworkMaterialChange(actualIndex, 'surplus', e.target.value)}
                          className="text-sm bg-transparent text-foreground focus:outline-none border-r border-border"
                          style={{ padding: '10px 14px', width: '80px' }}
                          placeholder="5%"
                        />
                        <input
                          type="text"
                            value={material.surplusForSection || ''}
                          onChange={(e) => handleArtworkMaterialChange(actualIndex, 'surplusForSection', e.target.value)}
                          className="text-sm bg-transparent text-foreground focus:outline-none flex-grow"
                          style={{ padding: '10px 14px' }}
                          placeholder="FOR SECTION (e.g., PACKAGING / QUALITY)"
                        />
                      </div>
                    </div>
                    )}


                    {/* APPROVAL Field - Excluded for ANTI-COUNTERFEIT & HOLOGRAMS, BELLY BAND / WRAPPER, CARE & COMPOSITION, FLAMMABILITY / SAFETY LABELS, HANG TAG SEALS / STRINGS, HEAT TRANSFER LABELS, INSERT CARDS, LABELS (BRAND/MAIN), LAW LABEL / CONTENTS TAG, PRICE TICKET / BARCODE TAG, QC / INSPECTION LABELS, RFID / SECURITY TAGS, RIBBONS, SIZE LABELS (INDIVIDUAL), TAGS & SPECIAL LABELS, and UPC LABEL / BARCODE STICKER (have their own) */}
                    {material.artworkCategory !== 'ANTI-COUNTERFEIT & HOLOGRAMS' && material.artworkCategory !== 'BELLY BAND / WRAPPER' && material.artworkCategory !== 'CARE & COMPOSITION' && material.artworkCategory !== 'FLAMMABILITY / SAFETY LABELS' && material.artworkCategory !== 'HANG TAG SEALS / STRINGS' && material.artworkCategory !== 'HEAT TRANSFER LABELS' && material.artworkCategory !== 'INSERT CARDS' && material.artworkCategory !== 'HEADER CARD' && material.artworkCategory !== 'LABELS (BRAND/MAIN)' && material.artworkCategory !== 'LAW LABEL / CONTENTS TAG' && material.artworkCategory !== 'PRICE TICKET / BARCODE TAG' && material.artworkCategory !== 'QC / INSPECTION LABELS' && material.artworkCategory !== 'RFID / SECURITY TAGS' && material.artworkCategory !== 'RIBBONS' && material.artworkCategory !== 'SIZE LABELS (INDIVIDUAL)' && material.artworkCategory !== 'TAGS & SPECIAL LABELS' && material.artworkCategory !== 'UPC LABEL / BARCODE STICKER' && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
                  <SearchableDropdown
                        value={material.approval || ''}
                        onChange={(selectedValue) => handleArtworkMaterialChange(actualIndex, 'approval', selectedValue)}
                        options={ARTWORK_APPROVAL_OPTIONS}
                        placeholder="Select or type Approval"
                        className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_approval`] ? 'border-red-600' : 'border-border'}`}
                      />
                </div>
                    )}

                    {/* REMARKS Field - Excluded for ANTI-COUNTERFEIT & HOLOGRAMS, BELLY BAND / WRAPPER, CARE & COMPOSITION, FLAMMABILITY / SAFETY LABELS, HANG TAG SEALS / STRINGS, HEAT TRANSFER LABELS, INSERT CARDS, LABELS (BRAND/MAIN), LAW LABEL / CONTENTS TAG, PRICE TICKET / BARCODE TAG, QC / INSPECTION LABELS, RFID / SECURITY TAGS, RIBBONS, SIZE LABELS (INDIVIDUAL), TAGS & SPECIAL LABELS, and UPC LABEL / BARCODE STICKER (have their own) */}
                    {material.artworkCategory !== 'ANTI-COUNTERFEIT & HOLOGRAMS' && material.artworkCategory !== 'BELLY BAND / WRAPPER' && material.artworkCategory !== 'CARE & COMPOSITION' && material.artworkCategory !== 'FLAMMABILITY / SAFETY LABELS' && material.artworkCategory !== 'HANG TAG SEALS / STRINGS' && material.artworkCategory !== 'HEAT TRANSFER LABELS' && material.artworkCategory !== 'INSERT CARDS' && material.artworkCategory !== 'HEADER CARD' && material.artworkCategory !== 'LABELS (BRAND/MAIN)' && material.artworkCategory !== 'LAW LABEL / CONTENTS TAG' && material.artworkCategory !== 'PRICE TICKET / BARCODE TAG' && material.artworkCategory !== 'QC / INSPECTION LABELS' && material.artworkCategory !== 'RFID / SECURITY TAGS' && material.artworkCategory !== 'RIBBONS' && material.artworkCategory !== 'SIZE LABELS (INDIVIDUAL)' && material.artworkCategory !== 'TAGS & SPECIAL LABELS' && material.artworkCategory !== 'UPC LABEL / BARCODE STICKER' && (
                    <div className="col-span-full flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">REMARKS</label>
                      <textarea
                        value={material.remarks}
                        onChange={(e) => handleArtworkMaterialChange(actualIndex, 'remarks', e.target.value)}
                        className={`border-2 rounded-lg text-sm transition-all bg-background text-foreground focus:border-primary focus:outline-none ${errors[`artworkMaterial_${actualIndex}_remarks`] ? 'border-red-600' : 'border-border'}`}
                        style={{ padding: '10px 14px', width: '100%' }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                        onBlur={(e) => e.target.style.boxShadow = ''}
                        rows="1"
                        placeholder="Additional notes..."
                      ></textarea>
                    </div>
                    )}
                  </div>

                  {/* Advanced Filter for INSERT CARDS - At the very bottom after all fields */}
                  {material.artworkCategory === 'INSERT CARDS' && (
                    <AdvFilterInsertCards
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for HEADER CARD - Same as INSERT CARDS */}
                  {material.artworkCategory === 'HEADER CARD' && (
                    <AdvFilterHeaderCard
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for HEAT TRANSFER LABELS - At the very bottom after all fields */}
                  {material.artworkCategory === 'HEAT TRANSFER LABELS' && (
                    <AdvFilterHeatTransfer
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for HANG TAG SEALS / STRINGS - At the very bottom after all fields */}
                  {material.artworkCategory === 'HANG TAG SEALS / STRINGS' && (
                    <AdvFilterHangTagSeals
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for ANTI-COUNTERFEIT & HOLOGRAMS - At the very bottom after all fields */}
                  {material.artworkCategory === 'ANTI-COUNTERFEIT & HOLOGRAMS' && (
                    <AdvFilterAntiCounterfeit
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for CARE & COMPOSITION - At the very bottom after all fields */}
                  {material.artworkCategory === 'CARE & COMPOSITION' && (
                    <AdvFilterCareComposition
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for FLAMMABILITY / SAFETY LABELS - At the very bottom after all fields */}
                  {material.artworkCategory === 'FLAMMABILITY / SAFETY LABELS' && (
                    <AdvFilterFlammabilitySafety
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}

                  {/* Advanced Filter for BELLY BAND / WRAPPER - At the very bottom after all fields */}
                  {material.artworkCategory === 'BELLY BAND / WRAPPER' && (
                    <AdvFilterBellyBand
                      material={material}
                      actualIndex={actualIndex}
                      errors={errors}
                      handleArtworkMaterialChange={handleArtworkMaterialChange}
                    />
                  )}
              <div className="w-full col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <QualityVerificationToggle
                  value={material.qualityVerificationByCategory?.[material.artworkCategory] ?? material.qualityVerification}
                  onChange={(value) => handleArtworkMaterialChange(actualIndex, 'qualityVerificationByCategory', { ...(material.qualityVerificationByCategory || {}), [material.artworkCategory]: value })}
                  width="lg"
                />
              </div>
                  </>
                )}
              </div>
          </div>
                );
              })}
              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => addArtworkMaterial(selectedComponent)}
                  className="border-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  style={{ padding: '10px 20px', backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  + Add Artwork Material
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Step4;
