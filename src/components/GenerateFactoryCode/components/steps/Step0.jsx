import { useState, useEffect } from 'react';
import SearchableDropdown from '../SearchableDropdown';
import { PRODUCT_SUBPRODUCT_DROPDOWN_OPTIONS } from '../../data/productSubproductData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { Field } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { getBuyerCodes } from '../../../../services/integration';

const Step0 = ({
  formData, 
  errors, 
  handleInputChange,
  handleSkuChange,
  handleSkuImageChange,
  addSku,
  removeSku,
  addSubproduct,
  removeSubproduct,
  handleSubproductChange,
  handleSubproductImageChange,
  handleStep0ComponentChange,
  addStep0Component,
  removeStep0Component,
  validateStep0,
  handleSave,
  handleNext,
  showSaveMessage,
  isSaved: parentIsSaved = false,
  onValidationFail,
}) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const clampPastDate = (value) => {
    if (!value) return value;
    return value < todayDate ? todayDate : value;
  };
  const [buyerCodeOptions, setBuyerCodeOptions] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [isSaved, setIsSaved] = useState(parentIsSaved); // Track if Step-0 is saved
  
  // Sync with parent's saved state
  useEffect(() => {
    setIsSaved(parentIsSaved);
    if (parentIsSaved) {
      setSaveStatus('success');
    }
  }, [parentIsSaved]);

  // Load buyer codes from the database (API only — no localStorage).
  useEffect(() => {
    const loadBuyerCodes = async () => {
      try {
        const response = await getBuyerCodes();
        const buyers = response.results || response.data || response || [];
        const codes = Array.isArray(buyers) ? buyers.map(b => b.code) : [];
        setBuyerCodeOptions(codes);
      } catch (error) {
        console.error('Failed to load buyer codes:', error);
        setBuyerCodeOptions([]);
      }
    };
    loadBuyerCodes();
  }, []);

  const handleBuyerCodeChange = (value) => {
    handleInputChange({ target: { name: 'buyerCode', value } });
  };

  const handleProductChange = (skuIndex, value) => {
    handleSkuChange(skuIndex, 'product', value);
  };

  // Error-key convention must match validateStep0 / step0ComponentErrorKey in
  // the orchestrator. subproductIndex == null → the SKU itself.
  const componentErrKey = (skuIndex, subproductIndex, componentIndex, field) =>
    subproductIndex == null
      ? `sku_${skuIndex}_component_${componentIndex}_${field}`
      : `subproduct_${skuIndex}_${subproductIndex}_component_${componentIndex}_${field}`;

  // COMPONENT + ASSIGN PLACEMENT list, rendered on both the SKU card and each
  // subproduct card. Bound to <entity>.stepData.products[0].components[] — the
  // same array Cut & Sew reads, so entries here pre-fill that step.
  const renderComponentsSection = (skuIndex, subproductIndex) => {
    const entity = subproductIndex == null
      ? formData.skus?.[skuIndex]
      : formData.skus?.[skuIndex]?.subproducts?.[subproductIndex];
    const components = entity?.stepData?.products?.[0]?.components || [];
    return (
      <div className="border-t border-border" style={{ marginTop: '16px', paddingTop: '12px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <label className="text-sm font-semibold text-foreground">
            COMPONENTS <span className="text-red-600">*</span>
            <span className="text-xs font-normal text-muted-foreground" style={{ marginLeft: '8px' }}>
              Name each component and assign its placement
            </span>
          </label>
          <Button
            type="button"
            onClick={() => addStep0Component(skuIndex, subproductIndex)}
            variant="outline"
            size="sm"
          >
            + Add Component
          </Button>
        </div>

        <div className="flex flex-col" style={{ gap: '6px' }}>
          {components.map((component, componentIndex) => (
            <div
              key={componentIndex}
              className="flex flex-wrap items-center rounded-lg border border-border bg-muted/40"
              style={{ gap: '10px', padding: '8px 10px' }}
            >
              <Field
                label="COMPONENT"
                required
                error={errors[componentErrKey(skuIndex, subproductIndex, componentIndex, 'productComforter')]}
                width="md"
                style={{ marginBottom: 0 }}
              >
                {/* Free-text component name (not a dropdown). */}
                <Input
                  type="text"
                  value={component.productComforter || ''}
                  onChange={(e) => handleStep0ComponentChange(skuIndex, subproductIndex, componentIndex, 'productComforter', e.target.value)}
                  placeholder="Type component name"
                  className={errors[componentErrKey(skuIndex, subproductIndex, componentIndex, 'productComforter')] ? 'border-destructive' : ''}
                />
              </Field>
              <Field
                label="ASSIGN PLACEMENT"
                required
                error={errors[componentErrKey(skuIndex, subproductIndex, componentIndex, 'placement')]}
                width="md"
                style={{ marginBottom: 0 }}
              >
                {/* Placement adapts to how many components this entity has:
                    1 → TOP PLACEMENT · 2 → TOP/BOTTOM · 3+ → free text. */}
                {(() => {
                  const n = components.length;
                  const opts = n === 1 ? ['TOP PLACEMENT'] : n === 2 ? ['TOP PLACEMENT', 'BOTTOM PLACEMENT'] : null;
                  const errCls = errors[componentErrKey(skuIndex, subproductIndex, componentIndex, 'placement')] ? 'border-destructive' : '';
                  return opts ? (
                    <SearchableDropdown
                      value={component.placement || ''}
                      onChange={(value) => handleStep0ComponentChange(skuIndex, subproductIndex, componentIndex, 'placement', value)}
                      options={opts}
                      placeholder="Select placement"
                      strictMode
                      className={errCls}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={component.placement || ''}
                      onChange={(e) => handleStep0ComponentChange(skuIndex, subproductIndex, componentIndex, 'placement', e.target.value)}
                      placeholder="Type placement"
                      className={errCls}
                    />
                  );
                })()}
              </Field>
              {components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep0Component(skuIndex, subproductIndex, componentIndex)}
                  className="ml-auto self-center text-xs font-medium text-destructive hover:underline"
                  style={{ marginTop: '18px' }}
                  title="Remove component"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const onSave = () => {
    // Use same validation as Next (step0) - no IPC/save if data is not filled
    if (validateStep0) {
      const result = validateStep0();
      if (!result.isValid) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        if (onValidationFail) {
          onValidationFail(result.errors);
        }
        return;
      }
    }
    if (handleSave) {
      try {
        handleSave();
        setSaveStatus('success');
        setIsSaved(true);
      } catch (error) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } else {
      setSaveStatus('success');
      setIsSaved(true);
    }
  };
  
  // Reset save status when form data changes (user modifies something)
  useEffect(() => {
    if (isSaved) {
      // Reset to idle when data changes after save
      setSaveStatus('idle');
      setIsSaved(false);
    }
  }, [formData.skus, formData.buyerCode, formData.ipoCode]);

  return (
    <div className="w-full max-w-6xl mx-auto" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '12px' }}>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          PRODUCT SPEC
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter product specification details
        </p>
      </div>
      
      {/* IPO Code (if from Internal Purchase Order) or Buyer Code */}
      <div style={{ marginBottom: '12px' }}>
        <div className={cn('flex flex-col', formData.ipoCode ? 'w-fit max-w-full' : 'w-field-md')}>
          {formData.ipoCode ? (
            <>
              <label className="text-sm font-semibold text-foreground mb-2">
                IPO CODE
              </label>
              <div
                className="border-input rounded-md border bg-card text-sm font-medium text-foreground shadow-xs"
                style={{
                  padding: '0.5rem 1rem 0.5rem ',
                  width: 'fit-content',
                  maxWidth: '100%',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {formData.ipoCode}
              </div>
            </>
          ) : (
            <Field
              label="BUYER CODE"
              error={errors.buyerCode}
              required
            >
              <SearchableDropdown
                value={formData.buyerCode || ''}
                onChange={handleBuyerCodeChange}
                options={buyerCodeOptions}
                placeholder="Select or type buyer code"
                strictMode={false}
                className={errors.buyerCode ? 'border-destructive' : ''}
              />
            </Field>
          )}
        </div>
      </div>

      {/* SKU Boxes */}
      {formData.skus.map((sku, skuIndex) => (
        <div key={skuIndex} style={{ marginBottom: '16px' }}>
          <div
            className="rounded-2xl border border-border"
            style={{
              padding: '20px 18px',
              backgroundColor: 'var(--muted)',
            }}
          >
            {/* SKU Header */}
            {formData.skus.length > 1 && (
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground/90">
                  SKU {skuIndex + 1}
                </h3>
                {formData.skus.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeSku(skuIndex)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}

            {/* Row 1: SKU, Product */}
            <div className="flex flex-wrap" style={{ gap: '16px 12px', marginBottom: '16px' }}>
              {/* SKU / ITEM NO */}
              <Field
                label="BUYER SKU"
                error={errors[`sku_${skuIndex}`]}
                required
                width="md"
              >
                <Input
                  type="text"
                  value={sku.sku || ''}
                  onChange={(e) => handleSkuChange(skuIndex, 'sku', e.target.value)}
                  placeholder="e.g., SKU-001"
                  aria-invalid={errors[`sku_${skuIndex}`] ? true : undefined}
                  required
                />
              </Field>

              {/* PRODUCT */}
              <Field
                label="PRODUCT"
                error={errors[`product_${skuIndex}`]}
                required
                width="md"
              >
                <SearchableDropdown
                  value={sku.product || ''}
                  onChange={(value) => handleProductChange(skuIndex, value)}
                  options={PRODUCT_SUBPRODUCT_DROPDOWN_OPTIONS}
                  placeholder="Select or type product"
                  strictMode={false}
                  className={errors[`product_${skuIndex}`] ? 'border-destructive' : ''}
                />
              </Field>

              {/* SET OF */}
              <Field
                label="SET OF"
                error={errors[`setOf_${skuIndex}`]}
                required
                width="sm"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  value={sku.setOf ?? ''}
                  onChange={(e) => handleSkuChange(skuIndex, 'setOf', e.target.value.replace(/\D/g, ''))}
                  placeholder="1"
                  aria-invalid={errors[`setOf_${skuIndex}`] ? true : undefined}
                  required
                />
              </Field>
            </div>

            {/* Row 2: PO QTY, Overage %, Delivery Date */}
            <div className="flex flex-wrap" style={{ gap: '16px 12px', marginBottom: '16px' }}>
              {/* PO QTY */}
              <Field
                label="PO QTY"
                error={errors[`poQty_${skuIndex}`]}
                required
                width="md"
              >
                <Input
                  type="number"
                  value={sku.poQty || ''}
                  onChange={(e) => handleSkuChange(skuIndex, 'poQty', e.target.value)}
                  placeholder="e.g., 1000"
                  aria-invalid={errors[`poQty_${skuIndex}`] ? true : undefined}
                  required
                />
              </Field>

              {/* OVERAGE (%) */}
              <Field
                label="OVERAGE (%)"
                error={errors[`overagePercentage_${skuIndex}`]}
                required
                width="md"
              >
                <PercentInput
                  value={sku.overagePercentage || ''}
                  onChange={(e) => handleSkuChange(skuIndex, 'overagePercentage', e.target.value)}
                  placeholder="e.g., 5"
                  error={errors[`overagePercentage_${skuIndex}`]}
                  required
                />
              </Field>

              {/* DELIVERY DUE DATE */}
              <Field
                label="DELIVERY DUE DATE"
                error={errors[`deliveryDueDate_${skuIndex}`]}
                required
                width="md"
              >
                <Input
                  type="date"
                  value={sku.deliveryDueDate || ''}
                  onChange={(e) => handleSkuChange(skuIndex, 'deliveryDueDate', clampPastDate(e.target.value))}
                  aria-invalid={errors[`deliveryDueDate_${skuIndex}`] ? true : undefined}
                  required
                  min={todayDate}
                />
              </Field>
            </div>

            {/* Image Upload */}
            <div className="pt-6 mt-2">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                PRODUCT IMAGE <span className="text-red-600">*</span>
              </label>
              <div className="flex items-start" style={{ gap: '24px' }}>
                <div className="flex flex-col" style={{ flex: '0 0 auto' }}>
                  <div 
                    className={`image-upload-box border-2 border-dashed rounded-lg bg-white flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all ${
                      errors[`image_${skuIndex}`] ? 'border-red-600' : 'border-gray-300'
                    }`}
                    style={{ position: 'relative' }}
                    onClick={() => document.getElementById(`image-${skuIndex}`).click()}
                  >
                    {sku.imagePreview ? (
                      <img 
                        src={sku.imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id={`image-${skuIndex}`}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSkuImageChange(skuIndex, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    required
                  />
                  {errors[`image_${skuIndex}`] && (
                    <span className="text-red-600 text-xs font-medium mt-1">{errors[`image_${skuIndex}`]}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground pt-2">
                  {/* <p className="font-medium text-foreground mb-1">Upload product image</p> */}
                  <p>Supported formats: JPG, PNG, GIF</p>
                  <p>Maximum file size: 5MB</p>
                </div>
              </div>
            </div>

            {/* Components + Assign Placement (pre-fills Cut & Sew) */}
            {renderComponentsSection(skuIndex, null)}

            {/* Subproducts List */}
            {sku.subproducts && sku.subproducts.length > 0 ? (
              <div className="mt-10 pt-4" style={{ marginTop: '24px' }}>
                <h4 className="text-base font-semibold text-foreground/90 mb-6" style={{ marginTop: '16px' }}>SUBPRODUCTS</h4>
                {sku.subproducts.map((subproduct, subproductIndex) => (
                  <div key={subproductIndex} style={{ marginBottom: '12px' }}>
                    <div 
                      className="rounded-xl border border-border"
                      style={{ padding: '20px 16px', backgroundColor: 'var(--muted)' }}
                    >
                    {/* Subproduct Header */}
                    <div className="mb-5 flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-foreground">Subproduct {subproductIndex + 1}</h5>
                      <Button
                        type="button"
                        onClick={() => removeSubproduct(skuIndex, subproductIndex)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>

                    {/* SUBPRODUCT + BUYER SKU + SET OF - side by side */}
                    <div className="flex flex-wrap" style={{ gap: '16px 12px', marginBottom: '16px' }}>
                    <Field
                        label="BUYER SKU"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}_buyerSku`]}
                        required
                        width="md"
                      >
                        <SearchableDropdown
                          value={subproduct.buyerSku || ''}
                          onChange={(value) => handleSubproductChange(skuIndex, subproductIndex, 'buyerSku', value)}
                          options={[]}
                          placeholder="Select or type buyer SKU"
                          strictMode={false}
                          className={errors[`subproduct_${skuIndex}_${subproductIndex}_buyerSku`] ? 'border-destructive' : ''}
                        />
                      </Field>
                      <Field
                        label="SUBPRODUCT"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}`]}
                        required
                        width="md"
                      >
                        <SearchableDropdown
                          value={subproduct.subproduct || ''}
                          onChange={(value) => handleSubproductChange(skuIndex, subproductIndex, 'subproduct', value)}
                          options={PRODUCT_SUBPRODUCT_DROPDOWN_OPTIONS}
                          placeholder="Select or type subproduct"
                          strictMode={false}
                          className={errors[`subproduct_${skuIndex}_${subproductIndex}`] ? 'border-destructive' : ''}
                        />
                      </Field>
                      <Field
                        label="SET OF"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}_setOf`]}
                        required
                        width="sm"
                      >
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={subproduct.setOf ?? ''}
                          onChange={(e) => handleSubproductChange(skuIndex, subproductIndex, 'setOf', e.target.value.replace(/\D/g, ''))}
                          placeholder="1"
                          aria-invalid={errors[`subproduct_${skuIndex}_${subproductIndex}_setOf`] ? true : undefined}
                          required
                        />
                      </Field>
                    </div>

                    {/* Row: PO QTY, Overage %, Delivery Date */}
                    <div className="flex flex-wrap" style={{ gap: '16px 12px', marginBottom: '16px' }}>
                      {/* PO QTY */}
                      <Field
                        label="PO QTY"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}_poQty`]}
                        required
                        width="md"
                      >
                        <Input
                          type="number"
                          value={subproduct.poQty || ''}
                          onChange={(e) => handleSubproductChange(skuIndex, subproductIndex, 'poQty', e.target.value)}
                          placeholder="e.g., 1000"
                          aria-invalid={errors[`subproduct_${skuIndex}_${subproductIndex}_poQty`] ? true : undefined}
                          required
                        />
                      </Field>

                      {/* OVERAGE % */}
                      <Field
                        label="OVERAGE %"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}_overagePercentage`]}
                        required
                        width="md"
                      >
                        <PercentInput
                          value={subproduct.overagePercentage || ''}
                          onChange={(e) => handleSubproductChange(skuIndex, subproductIndex, 'overagePercentage', e.target.value)}
                          placeholder="e.g. 5%"
                          error={errors[`subproduct_${skuIndex}_${subproductIndex}_overagePercentage`]}
                          required
                        />
                      </Field>

                      {/* DELIVERY DUE DATE */}
                      <Field
                        label="DELIVERY DUE DATE"
                        error={errors[`subproduct_${skuIndex}_${subproductIndex}_deliveryDueDate`]}
                        required
                        width="md"
                      >
                        <Input
                          type="date"
                          value={subproduct.deliveryDueDate || ''}
                          onChange={(e) => handleSubproductChange(skuIndex, subproductIndex, 'deliveryDueDate', clampPastDate(e.target.value))}
                          aria-invalid={errors[`subproduct_${skuIndex}_${subproductIndex}_deliveryDueDate`] ? true : undefined}
                          required
                          min={todayDate}
                        />
                      </Field>
                    </div>

                    {/* Subproduct Image Upload */}
                    <div className="pt-6 mt-2">
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        SUBPRODUCT IMAGE <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-start" style={{ gap: '24px' }}>
                        <div className="flex flex-col" style={{ flex: '0 0 auto' }}>
                          <div 
                            className={`image-upload-box border-2 border-dashed rounded-lg bg-white flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all ${
                              errors[`subproduct_${skuIndex}_${subproductIndex}_image`] ? 'border-red-600' : 'border-gray-300'
                            }`}
                            style={{ position: 'relative' }}
                            onClick={() => document.getElementById(`subproduct-image-${skuIndex}-${subproductIndex}`).click()}
                          >
                            {subproduct.imagePreview ? (
                              <img 
                                src={subproduct.imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <svg className="mx-auto h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            id={`subproduct-image-${skuIndex}-${subproductIndex}`}
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSubproductImageChange(skuIndex, subproductIndex, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            required
                          />
                          {errors[`subproduct_${skuIndex}_${subproductIndex}_image`] && (
                            <span className="text-red-600 text-xs font-medium mt-1">{errors[`subproduct_${skuIndex}_${subproductIndex}_image`]}</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground pt-2">
                          <p className="font-medium text-foreground mb-1">Upload subproduct image</p>
                          <p>Supported formats: JPG, PNG, GIF</p>
                          <p>Maximum file size: 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Subproduct components + assign placement (pre-fills Cut & Sew) */}
                    {renderComponentsSection(skuIndex, subproductIndex)}
                    </div>
                  </div>
                ))}

                {/* Add Subproduct Button - Only one button at the bottom, after all subproducts */}
                <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addSubproduct(skuIndex);
                    }}
                    variant="outline"
                    size="default"
                  >
                    + Add Subproduct
                  </Button>
                </div>
              </div>
            ) : (
              <div key="add-subproduct-initial" style={{ paddingTop: '10px', marginTop: '10px' }}>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addSubproduct(skuIndex);
                  }}
                  variant="outline"
                  size="default"
                >
                  + Add Subproduct
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Save / Add SKU / Next Buttons */}
      <div className="flex items-center justify-between" style={{ marginTop: '' }}>
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            onClick={onSave}
            variant="outline"
            className={cn(
              'min-w-[90px]',
              saveStatus === 'error'
                ? 'text-red-600 border-red-500 hover:text-red-700'
                : isSaved || saveStatus === 'success'
                  ? 'text-green-600 hover:text-green-700'
                  : ''
            )}
          >
            {saveStatus === 'error'
              ? 'Not Saved'
              : isSaved || saveStatus === 'success'
                ? 'Saved'
                : 'Save'}
          </Button>
          <Button
            type="button"
            onClick={addSku}
            variant="outline"
          >
            Add SKU
          </Button>
        </div>
        {handleNext && (
          <div className="flex items-center gap-3">
            {showSaveMessage && (
              <span className="text-red-600 text-sm font-medium">Save first</span>
            )}
            <Button
              type="button"
              onClick={handleNext}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step0;
