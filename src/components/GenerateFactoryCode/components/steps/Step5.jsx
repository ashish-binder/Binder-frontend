import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import SearchableDropdown from '../SearchableDropdown';
import PackagingMaterialTypeFields from '../PackagingMaterialTypeFields';
import { cn } from '@/lib/utils';

const PACKAGING_MATERIAL_TYPE_OPTIONS = [
  'CARTON BOX',
  'CORNER PROTECTORS',
  'EDGE PROTECTORS',
  'FOAM INSERT',
  'PALLET STRAP',
  'DIVIDER',
  'TAPE',
  'POLYBAG~POLYBAG-FLAP',
  'POLYBAG~Bale',
  'SILICA GEL DESICCANT',
  'SHRINK TAPE',
  'VOID~FILL',
  'SHIPPING MARK',
];

const Step5 = ({
  formData,
  errors,
  renderHeaderAction,
  handlePackagingChange,
  handlePackagingMaterialChange,
  addPackagingMaterial,
  removePackagingMaterial,
  addExtraPack,
  handleExtraPackChange,
  handleExtraPackMaterialChange,
  addExtraPackMaterial,
  removeExtraPackMaterial,
}) => {
  const prevMaterialsLengthRef = useRef(formData.packaging?.materials?.length || 0);
  const isInitialMountRef = useRef(true);
  const [ipcDropdownOpen, setIpcDropdownOpen] = useState(false);
  const [ipcSearchTerm, setIpcSearchTerm] = useState('');
  const [mergedSearchTerm, setMergedSearchTerm] = useState('');
  const ipcDropdownRef = useRef(null);
  const mergedDropdownRef = useRef(null);
  const [extraMergedOpenIndex, setExtraMergedOpenIndex] = useState(null);
  const [extraMergedSearchTerm, setExtraMergedSearchTerm] = useState('');
  const [extraStandaloneOpenIndex, setExtraStandaloneOpenIndex] = useState(null);
  const [extraStandaloneSearchTerm, setExtraStandaloneSearchTerm] = useState('');

  // Normalize productSelection to array (legacy may be string)
  const mainProductSelection = (() => {
    const v = formData.packaging?.productSelection;
    if (Array.isArray(v)) return v;
    if (v === undefined || v === null || v === '') return [];
    return [String(v)];
  })();
  const isStandalone = (formData.packaging?.toBeShipped || '').toLowerCase() === 'standalone';
  const extraPacks = formData.packaging?.extraPacks || [];

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevMaterialsLengthRef.current = formData.packaging?.materials?.length || 0;
      return;
    }
    
    const currentMaterialsLength = formData.packaging?.materials?.length || 0;
    if (currentMaterialsLength > prevMaterialsLengthRef.current) {
      setTimeout(() => {
        const lastMaterial = document.querySelector('[data-packaging-material-index]:last-child');
        if (lastMaterial) {
          lastMaterial.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    prevMaterialsLengthRef.current = currentMaterialsLength;
  }, [formData.packaging?.materials?.length]);


  // IPC options from this session only: IPCs created in Step 0 for this runtime (main + subproducts, with images)
  const getIpcOptionsWithImages = () => {
    const resolvePreview = (item) =>
      item?.imagePreview ||
      item?.imageBase64?.data ||
      (typeof item?.image === 'string' ? item.image : null);
    const options = [];
    (formData.skus || []).forEach((sku) => {
      const baseIpc = sku.ipcCode?.replace(/\/SP-?\d+$/i, '') || sku.ipcCode || '';
      if (baseIpc) {
        options.push({
          value: baseIpc,
          label: baseIpc,
          imagePreview: resolvePreview(sku),
        });
      }
      (sku.subproducts || []).forEach((sub, idx) => {
        const spIpc = `${baseIpc}/SP-${idx + 1}`;
        options.push({
          value: spIpc,
          label: spIpc,
          imagePreview: resolvePreview(sub),
        });
      });
    });
    return options;
  };

  const ipcOptionsWithImages = getIpcOptionsWithImages();
  const allIpcValues = ipcOptionsWithImages.map((o) => o.value);

  // Leftover IPCs after main and previous extra packs (for clone blocks)
  const getLeftover = (afterExtraIndex) => {
    const selected = new Set(mainProductSelection);
    for (let i = 0; i <= afterExtraIndex && i < extraPacks.length; i++) {
      const arr = extraPacks[i]?.productSelection;
      (Array.isArray(arr) ? arr : arr ? [arr] : []).forEach((ipc) => selected.add(ipc));
    }
    return allIpcValues.filter((v) => !selected.has(v));
  };

  const filteredIpcOptions = ipcSearchTerm.trim()
    ? ipcOptionsWithImages.filter(
        (o) =>
          o.label.toLowerCase().includes(ipcSearchTerm.toLowerCase())
      )
    : ipcOptionsWithImages;

  // Click outside to close IPC dropdown (Standalone or Merged)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideStandalone = ipcDropdownRef.current?.contains(e.target);
      const insideMerged = mergedDropdownRef.current?.contains(e.target);
      const insideExtraMerged = e.target.closest?.('[data-extra-merged-dropdown]');
      const insideExtraStandalone = e.target.closest?.('[data-extra-standalone-dropdown]');
      if (!insideStandalone && !insideMerged && !insideExtraMerged && !insideExtraStandalone) {
        setIpcDropdownOpen(false);
        setIpcSearchTerm('');
        setMergedSearchTerm('');
        setExtraMergedOpenIndex(null);
        setExtraMergedSearchTerm('');
        setExtraStandaloneOpenIndex(null);
        setExtraStandaloneSearchTerm('');
      }
    };
    if (ipcDropdownOpen || extraMergedOpenIndex !== null || extraStandaloneOpenIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ipcDropdownOpen, extraMergedOpenIndex, extraStandaloneOpenIndex]);

  return (
<div className="w-full">
      {/* Header with proper spacing */}
      <div style={{ marginBottom: '28px' }} className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PACKAGING</h2>
          <p className="text-sm text-gray-600">Configure packaging specifications and materials</p>
        </div>
        {renderHeaderAction}
      </div>

      {/* Header Configuration */}
      <div className="bg-gray-50 rounded-xl border border-gray-200" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="text-sm font-bold text-gray-800" style={{ marginBottom: '16px' }}>PACKAGING HEADER</h3>
        
        <div className="flex flex-wrap items-start gap-4">
          {/* TO BE SHIPPED */}
          <div className="flex flex-col" style={{ width: '150px' }}>
            <label className={`text-sm font-semibold mb-2 ${errors?.packaging_toBeShipped ? 'text-red-600' : 'text-gray-700'}`}>TO BE SHIPPED <span className="text-red-500">*</span></label>
            <SearchableDropdown
              value={formData.packaging.toBeShipped || ''}
              onChange={(selectedValue) => handlePackagingChange('toBeShipped', selectedValue || '')}
              options={['Merged', 'Standalone']}
              placeholder="Select or type"
              strictMode={false}
              className={cn(
                'border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none',
                errors?.packaging_toBeShipped ? 'border-red-600' : 'border-[#e5e7eb]'
              )}
              style={{ padding: '10px 14px', height: '44px' }}
            />
            {errors?.packaging_toBeShipped && <span className="text-red-600 text-xs mt-1">{errors.packaging_toBeShipped}</span>}
          </div>

          {/* PRODUCT (IPC with images): Standalone = single, Merged = multi */}
          <div className="flex flex-col" style={{ width: '280px' }}>
            <label className={`text-sm font-semibold mb-2 ${errors?.packaging_productSelection ? 'text-red-600' : 'text-gray-700'}`}>PRODUCT <span className="text-red-500">*</span></label>
            {isStandalone ? (
              <div ref={ipcDropdownRef} className="relative w-full">
                <input
                  type="text"
                  value={ipcDropdownOpen ? ipcSearchTerm : (mainProductSelection[0] || '')}
                  onChange={(e) => {
                    setIpcSearchTerm(e.target.value);
                    if (!ipcDropdownOpen) setIpcDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIpcDropdownOpen(true);
                    setIpcSearchTerm(mainProductSelection[0] || '');
                  }}
                  placeholder="Select or type IPC"
                  className={cn(
                    'border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none w-full',
                    errors?.packaging_productSelection ? 'border-red-600' : 'border-[#e5e7eb]'
                  )}
                  style={{ padding: '10px 14px', paddingRight: '2.25rem', height: '44px' }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIpcDropdownOpen(!ipcDropdownOpen);
                    if (!ipcDropdownOpen) setIpcSearchTerm(mainProductSelection[0] || '');
                    else setIpcSearchTerm('');
                  }}
                  aria-label="Open IPC options"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded border-0 bg-transparent text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', ipcDropdownOpen && 'rotate-180')} />
                </button>
                {ipcDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg" style={{ top: '100%', left: 0 }}>
                    {filteredIpcOptions.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        {ipcOptionsWithImages.length === 0 ? 'No IPC codes. Complete Step 0 to generate IPCs.' : 'No matching IPC.'}
                      </div>
                    ) : filteredIpcOptions.map((opt, index) => (
                      <div
                        key={`${opt.value}-${index}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handlePackagingChange('productSelection', [opt.value]);
                          setIpcDropdownOpen(false);
                          setIpcSearchTerm('');
                        }}
                        className="flex items-center gap-3 cursor-pointer px-3 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-[60px] h-[60px] rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minWidth: '60px' }}>
                          {opt.imagePreview ? <img src={opt.imagePreview} alt="" className="w-full h-full object-cover" /> : (
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" strokeWidth="1.5" /></svg>
                          )}
                        </div>
                        <span className="font-medium text-gray-800 truncate">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div ref={mergedDropdownRef} className="relative w-full">
                <input
                  type="text"
                  readOnly
                  value={mainProductSelection.length === 0 ? '' : `${mainProductSelection.length} IPC(s) selected`}
                  onFocus={() => setIpcDropdownOpen(true)}
                  onClick={() => setIpcDropdownOpen(true)}
                  placeholder="Select IPCs (click to open)"
                  className={cn(
                    'border-2 rounded-lg text-sm w-full pl-3 pr-10 bg-white cursor-pointer',
                    errors?.packaging_productSelection ? 'border-red-600' : 'border-gray-200'
                  )}
                  style={{ height: '44px' }}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIpcDropdownOpen(!ipcDropdownOpen); setMergedSearchTerm(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:bg-gray-100"
                  aria-label="Toggle dropdown"
                >
                  <ChevronDown className={cn('h-4 w-4', ipcDropdownOpen && 'rotate-180')} />
                </button>
                {ipcDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border-2 border-gray-200 bg-white shadow-lg" style={{ top: '100%', left: 0 }}>
                    <input
                      type="text"
                      value={mergedSearchTerm}
                      onChange={(e) => setMergedSearchTerm(e.target.value)}
                      placeholder="Search IPC..."
                      className="w-full border-b border-gray-200 px-3 py-2 text-sm outline-none rounded-t-md"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div className="max-h-56 overflow-auto">
                      {(mergedSearchTerm.trim() ? ipcOptionsWithImages.filter((o) => o.label.toLowerCase().includes(mergedSearchTerm.toLowerCase())) : ipcOptionsWithImages).map((opt, index) => {
                        const checked = mainProductSelection.includes(opt.value);
                        return (
                          <label
                            key={`${opt.value}-${index}`}
                            className="flex items-center gap-3 cursor-pointer px-3 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-indigo-50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked ? mainProductSelection.filter((v) => v !== opt.value) : [...mainProductSelection, opt.value];
                                handlePackagingChange('productSelection', next);
                              }}
                              className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-shrink-0 w-[60px] h-[60px] rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minWidth: '60px' }}>
                              {opt.imagePreview ? <img src={opt.imagePreview} alt="" className="w-full h-full object-cover" /> : <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" strokeWidth="1.5" /></svg>}
                            </div>
                            <span className="font-medium text-gray-800 truncate">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors?.packaging_productSelection && <span className="text-red-600 text-xs mt-1">{errors.packaging_productSelection}</span>}
          </div>

          {/* MASTER PACK */}
          <div className="flex flex-col">
            <label className={`text-sm font-semibold mb-2 ${errors?.packaging_type ? 'text-red-600' : 'text-gray-700'}`}>MASTER PACK <span className="text-red-500">*</span></label>
            <select
              value={formData.packaging.type}
              onChange={(e) => handlePackagingChange('type', e.target.value)}
              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${errors?.packaging_type ? 'border-red-600' : 'border-[#e5e7eb]'}`}
              style={{ padding: '10px 14px', width: '200px', height: '44px' }}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="ASSORTED">ASSORTED</option>
            </select>
            {errors?.packaging_type && <span className="text-red-600 text-xs mt-1">{errors.packaging_type}</span>}
          </div>

          {/* CASEPACK QTY */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              CASEPACK QTY (PCS) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.packaging.casepackQty}
              onChange={(e) => handlePackagingChange('casepackQty', e.target.value)}
              className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${
                errors?.packaging_casepackQty ? 'border-red-600' : 'border-[#e5e7eb]'
              }`}
              style={{ padding: '10px 14px', width: '120px', height: '44px' }}
              placeholder="10"
            />
            {errors?.packaging_casepackQty && (
              <span className="text-red-600 text-xs mt-1">{errors.packaging_casepackQty}</span>
            )}
          </div>

      </div>
        </div>

      {/* Packaging Materials (one block: materials + Add Material inside) */}
      <div className="bg-white rounded-xl border-2 border-gray-200" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="text-sm font-bold text-gray-800 mb-4">Packaging Materials</h3>
        {formData.packaging.materials && formData.packaging.materials.length > 0 ? formData.packaging.materials.map((material, materialIndex) => (
          <div key={materialIndex} id={`packaging-material-${materialIndex}`} data-packaging-material-index={materialIndex} className="rounded-xl border-2 border-gray-100 bg-gray-50/50" style={{ padding: '20px', marginBottom: '16px' }}>
            {/* Material Header with Remove Button */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h4 className="text-sm font-bold text-gray-800 underline underline-offset-4">MATERIAL {materialIndex + 1}</h4>
              {formData.packaging.materials.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePackagingMaterial(materialIndex)}
                  className="border rounded-md cursor-pointer text-xs font-medium transition-all hover:-translate-x-0.5"
                  style={{
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    color: '#b91c1c',
                    padding: '4px 10px',
                    height: '28px'
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Only packaging material type fields remain */}
            <div className="w-full">
              <div className="flex flex-col" style={{ width: '280px', marginBottom: '24px' }}>
                <label className="text-sm font-bold text-gray-800 mb-2">
                  PACKAGING MATERIAL TYPE <span className="text-red-600">*</span>
                </label>
                <SearchableDropdown
                  value={material.packagingMaterialType || ''}
                  onChange={(selectedValue) => handlePackagingMaterialChange(materialIndex, 'packagingMaterialType', selectedValue)}
                  options={PACKAGING_MATERIAL_TYPE_OPTIONS}
                  placeholder="Select or type Material Type"
                  style={{ width: '280px' }}
                  className={errors?.[`packaging_material_${materialIndex}_packagingMaterialType`] ? 'border-red-600' : ''}
                />
                {errors?.[`packaging_material_${materialIndex}_packagingMaterialType`] && (
                  <span className="text-red-600 text-xs mt-1">{errors[`packaging_material_${materialIndex}_packagingMaterialType`]}</span>
                )}
              </div>

              {material.packagingMaterialType && (
                <>
                  {/* Auto-generated MATERIAL DESC (read-only). Click reveals the
                      source spec fields below so the user edits the origin. */}
                  <div className="flex flex-col" style={{ width: '100%', maxWidth: '640px', marginBottom: '16px' }}>
                    <label className="text-sm font-bold text-gray-800 mb-2">MATERIAL DESC</label>
                    <input
                      type="text"
                      readOnly
                      value={material.materialDescription || ''}
                      onClick={() => {
                        if (typeof document !== 'undefined') {
                          const card = document.querySelector(`[data-packaging-material-index="${materialIndex}"]`);
                          const anchor = card?.querySelector('[data-spec-anchor]') || card;
                          anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      title="Auto-generated from specifications — click to edit the source fields"
                      placeholder="Fill specifications below"
                      className="border-2 rounded-lg text-sm bg-gray-100 text-gray-900 border-gray-200 cursor-pointer focus:outline-none"
                      style={{ padding: '10px 14px', height: '44px' }}
                    />
                  </div>
                  <div data-spec-anchor>
                    <PackagingMaterialTypeFields
                      material={material}
                      materialIndex={materialIndex}
                      onChange={(field, value) => handlePackagingMaterialChange(materialIndex, field, value)}
                      errorKeyPrefix={`packaging_material_${materialIndex}`}
                      errors={errors}
                      casepackQty={formData.packaging?.casepackQty}
                      productSelection={formData.packaging?.productSelection}
                      skus={formData.skus}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-6">
            No packaging materials added yet.
          </div>
        )}
        {/* Add Material inside same block */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
            onClick={() => {
              const currentLength = formData.packaging?.materials?.length || 0;
              addPackagingMaterial();
              const newIndex = currentLength;
              const attemptScroll = (attempts = 0) => {
                if (attempts > 30) return;
                const element = document.getElementById(`packaging-material-${newIndex}`);
                if (element) {
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 150);
                } else {
                  setTimeout(() => attemptScroll(attempts + 1), 50);
                }
              };
              attemptScroll();
            }}
          >
            + Add Material
          </Button>
        </div>
      </div>

      {/* Message only when save reports leftover IPC */}
      {errors?.packaging_leftover_ipc && (
        <div className="mt-6 p-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
          {errors.packaging_leftover_ipc}
        </div>
      )}
      {/* Extra packs:
          - Never show EMPTY packs on initial load
          - Show the newly opened pack when leftover error exists (after Save)
          - Always keep showing packs that have real data filled
      */}
      {(() => {
        const packHasData = (pack) => {
          if (!pack) return false;
          const sel = Array.isArray(pack.productSelection) ? pack.productSelection : (pack.productSelection ? [pack.productSelection] : []);
          if (sel.length > 0) return true;
          const mats = Array.isArray(pack.materials) ? pack.materials : [];
          return mats.some((m) => (m?.packagingMaterialType || '').toString().trim() !== '');
        };
        const packsToRender = errors?.packaging_leftover_ipc ? extraPacks : extraPacks.filter(packHasData);
        if (packsToRender.length === 0) return null;
        return (
        <div className="mt-10 space-y-8 overflow-visible">
          {errors?.packaging_leftover_ipc && (
            <h3 className="text-lg font-bold text-gray-800">Leftover packs</h3>
          )}
          {packsToRender.map((pack, extraIndex) => {
            const leftoverOptions = getLeftover(extraIndex - 1);
            const packSelection = Array.isArray(pack.productSelection) ? pack.productSelection : (pack.productSelection ? [pack.productSelection] : []);
            const isExtraStandalone = (pack.toBeShipped || formData.packaging?.toBeShipped || '').toLowerCase() === 'standalone';
            return (
              <div key={extraIndex} className="space-y-0 overflow-visible">
                <div className="bg-gray-50 rounded-xl border border-gray-200" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="text-sm font-bold text-gray-800" style={{ marginBottom: '16px' }}>PACKAGING HEADER</h3>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex flex-col" style={{ width: '220px' }}>
                      <label className="text-sm font-semibold text-gray-700 mb-2">TO BE SHIPPED <span className="text-red-500">*</span></label>
                      <SearchableDropdown
                        value={pack.toBeShipped || formData.packaging?.toBeShipped || ''}
                        onChange={(v) => handleExtraPackChange(extraIndex, 'toBeShipped', v || '')}
                        options={['Merged', 'Standalone']}
                        placeholder="Select or type"
                        strictMode={false}
                        className={cn('border-2 rounded-lg text-sm bg-white border-gray-200')}
                        style={{ padding: '10px 14px', height: '44px' }}
                      />
                    </div>
                    <div className="flex flex-col" style={{ width: '280px' }}>
                      <label className="text-sm font-semibold text-gray-700 mb-2">PRODUCT <span className="text-red-500">*</span></label>
                      {isExtraStandalone ? (
                        <div className="relative w-full" data-extra-standalone-dropdown>
                          <input
                            type="text"
                            value={extraStandaloneOpenIndex === extraIndex ? extraStandaloneSearchTerm : (packSelection[0] || '')}
                            onChange={(e) => {
                              setExtraStandaloneSearchTerm(e.target.value);
                              if (extraStandaloneOpenIndex !== extraIndex) setExtraStandaloneOpenIndex(extraIndex);
                            }}
                            onFocus={() => {
                              setExtraStandaloneOpenIndex(extraIndex);
                              setExtraStandaloneSearchTerm(packSelection[0] || '');
                            }}
                            placeholder="Select or type IPC"
                            className={cn(
                              'border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none w-full',
                              errors?.[`packaging_extra_${extraIndex}_productSelection`] ? 'border-red-600' : 'border-gray-200'
                            )}
                            style={{ padding: '10px 14px', paddingRight: '2.25rem', height: '44px' }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const nextOpen = extraStandaloneOpenIndex === extraIndex ? null : extraIndex;
                              setExtraStandaloneOpenIndex(nextOpen);
                              setExtraStandaloneSearchTerm(nextOpen ? (packSelection[0] || '') : '');
                            }}
                            aria-label="Open IPC options"
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded border-0 bg-transparent text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <ChevronDown className={cn('h-4 w-4 transition-transform', extraStandaloneOpenIndex === extraIndex && 'rotate-180')} />
                          </button>
                          {extraStandaloneOpenIndex === extraIndex && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg" style={{ top: '100%', left: 0 }}>
                              {leftoverOptions.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-gray-500 text-center">No IPC available.</div>
                              ) : (
                                (extraStandaloneSearchTerm.trim()
                                  ? leftoverOptions.filter((v) => v.toLowerCase().includes(extraStandaloneSearchTerm.toLowerCase()))
                                  : leftoverOptions
                                ).map((ipcVal) => {
                                  const opt = ipcOptionsWithImages.find((o) => o.value === ipcVal) || { value: ipcVal, label: ipcVal, imagePreview: null };
                                  return (
                                    <div
                                      key={ipcVal}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleExtraPackChange(extraIndex, 'productSelection', [ipcVal]);
                                        setExtraStandaloneOpenIndex(null);
                                        setExtraStandaloneSearchTerm('');
                                      }}
                                      className="flex items-center gap-3 cursor-pointer px-3 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 transition-colors"
                                    >
                                      <div className="flex-shrink-0 w-[60px] h-[60px] rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minWidth: '60px' }}>
                                        {opt.imagePreview ? <img src={opt.imagePreview} alt="" className="w-full h-full object-cover" /> : (
                                          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" strokeWidth="1.5" /></svg>
                                        )}
                                      </div>
                                      <span className="font-medium text-gray-800 truncate">{opt.label}</span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full" data-extra-merged-dropdown>
                          <input
                            type="text"
                            readOnly
                            value={packSelection.length === 0 ? '' : `${packSelection.length} IPC(s) selected`}
                            onFocus={() => setExtraMergedOpenIndex(extraIndex)}
                            onClick={() => setExtraMergedOpenIndex(extraIndex)}
                            placeholder="Select IPCs (click to open)"
                            className={cn(
                              'border-2 rounded-lg text-sm w-full pl-3 pr-10 bg-white cursor-pointer',
                              errors?.[`packaging_extra_${extraIndex}_productSelection`] ? 'border-red-600' : 'border-gray-200'
                            )}
                            style={{ height: '44px' }}
                          />
                          <button type="button" onClick={() => { setExtraMergedOpenIndex(extraMergedOpenIndex === extraIndex ? null : extraIndex); setExtraMergedSearchTerm(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:bg-gray-100">
                            <ChevronDown className={cn('h-4 w-4', extraMergedOpenIndex === extraIndex && 'rotate-180')} />
                          </button>
                          {extraMergedOpenIndex === extraIndex && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border-2 border-gray-200 bg-white shadow-lg" style={{ top: '100%', left: 0 }}>
                              <input type="text" value={extraMergedSearchTerm} onChange={(e) => setExtraMergedSearchTerm(e.target.value)} placeholder="Search IPC..." className="w-full border-b border-gray-200 px-3 py-2 text-sm outline-none rounded-t-md" onMouseDown={(e) => e.stopPropagation()} />
                              <div className="max-h-56 overflow-auto">
                                {(extraMergedSearchTerm.trim() ? leftoverOptions.filter((v) => v.toLowerCase().includes(extraMergedSearchTerm.toLowerCase())) : leftoverOptions).map((ipcVal) => {
                                  const opt = ipcOptionsWithImages.find((o) => o.value === ipcVal) || { value: ipcVal, label: ipcVal, imagePreview: null };
                                  const checked = packSelection.includes(ipcVal);
                                  return (
                                    <label key={ipcVal} className="flex items-center gap-3 cursor-pointer px-3 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-indigo-50">
                                      <input type="checkbox" checked={checked} onChange={() => { const next = checked ? packSelection.filter((v) => v !== ipcVal) : [...packSelection, ipcVal]; handleExtraPackChange(extraIndex, 'productSelection', next); }} className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                      <div className="flex-shrink-0 w-[60px] h-[60px] rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minWidth: '60px' }}>{opt.imagePreview ? <img src={opt.imagePreview} alt="" className="w-full h-full object-cover" /> : <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" strokeWidth="1.5" /></svg>}</div>
                                      <span className="font-medium text-gray-800 truncate">{opt.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {errors?.[`packaging_extra_${extraIndex}_productSelection`] && <span className="text-red-600 text-xs mt-1">{errors[`packaging_extra_${extraIndex}_productSelection`]}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">MASTER PACK</label>
                      <select
                        value={pack.type || 'STANDARD'}
                        onChange={(e) => handleExtraPackChange(extraIndex, 'type', e.target.value)}
                        className="border-2 rounded-lg text-sm bg-white text-gray-900"
                        style={{ padding: '10px 14px', width: '200px', height: '44px' }}
                      >
                        <option value="STANDARD">STANDARD</option>
                        <option value="ASSORTED">ASSORTED</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">CASEPACK QTY</label>
                      <input
                        type="number"
                        value={pack.casepackQty || ''}
                        onChange={(e) => handleExtraPackChange(extraIndex, 'casepackQty', e.target.value)}
                        className="border-2 rounded-lg text-sm bg-white"
                        style={{ padding: '10px 14px', width: '120px', height: '44px' }}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-visible" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Packaging Materials</h3>
                  {(pack.materials || []).map((material, materialIndex) => (
                    <div key={materialIndex} className="rounded-xl border-2 border-gray-100 bg-gray-50/50 overflow-visible" style={{ padding: '20px', marginBottom: '16px' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                        <h4 className="text-sm font-bold text-gray-800 underline underline-offset-4">MATERIAL {materialIndex + 1}</h4>
                        {(pack.materials || []).length > 1 && (
                          <button type="button" onClick={() => removeExtraPackMaterial(extraIndex, materialIndex)} className="border rounded-md cursor-pointer text-xs font-medium transition-all hover:-translate-x-0.5" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#b91c1c', padding: '4px 10px', height: '28px' }}>Remove</button>
                        )}
                      </div>
                      <div className="flex flex-col overflow-visible relative z-10" style={{ width: '280px', marginBottom: '24px' }}>
                        <label className="text-sm font-bold text-gray-800 mb-2">
                          PACKAGING MATERIAL TYPE <span className="text-red-600">*</span>
                        </label>
                        <SearchableDropdown
                          value={material.packagingMaterialType || ''}
                          onChange={(selectedValue) => handleExtraPackMaterialChange(extraIndex, materialIndex, 'packagingMaterialType', selectedValue)}
                          options={PACKAGING_MATERIAL_TYPE_OPTIONS}
                          placeholder="Select or type Material Type"
                          style={{ width: '280px' }}
                          className={cn('border-2 rounded-lg', errors?.[`packaging_extra_${extraIndex}_material_${materialIndex}_packagingMaterialType`] ? 'border-red-600' : 'border-gray-200')}
                          usePortal
                        />
                        {errors?.[`packaging_extra_${extraIndex}_material_${materialIndex}_packagingMaterialType`] && (
                          <span className="text-red-600 text-xs mt-1">{errors[`packaging_extra_${extraIndex}_material_${materialIndex}_packagingMaterialType`]}</span>
                        )}
                      </div>
                      {material.packagingMaterialType && (
                        <PackagingMaterialTypeFields
                          material={material}
                          materialIndex={materialIndex}
                          onChange={(field, value) => handleExtraPackMaterialChange(extraIndex, materialIndex, field, value)}
                          errorKeyPrefix={`packaging_extra_${extraIndex}_material_${materialIndex}`}
                          errors={errors}
                          casepackQty={pack.casepackQty}
                          productSelection={pack.productSelection}
                          skus={formData.skus}
                        />
                      )}
                    </div>
                  ))}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
                      onClick={() => addExtraPackMaterial(extraIndex)}
                    >
                      + Add Material
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        );
      })()}
    </div>
  );
};

export default Step5;
