// FoamPu — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamPu = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
    {/* FOAM TYPE */}
    <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuType`]}>
      <SearchableDropdown
        value={material.foamPuType || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuType', selectedValue)}
        options={['PU Foam (Polyurethane)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPuType`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* SUBTYPE */}
    <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuSubtype`]}>
      <SearchableDropdown
        value={material.foamPuSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuSubtype', selectedValue)}
        options={['Virgin', 'Recycled/Rebonded', 'Blended']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPuSubtype`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* GRADE */}
    <Field label="GRADE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuGrade`]}>
      <SearchableDropdown
        value={material.foamPuGrade || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuGrade', selectedValue)}
        options={['Conventional PU', 'High Density (HD)', 'Super High Density (SHD)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPuGrade`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* COLOUR */}
    <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuColour`]}>
      <SearchableDropdown
        value={material.foamPuColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuColour', selectedValue)}
        options={['White', 'Grey', 'Pink', 'Blue', 'Black', 'Charcoal', 'Custom']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPuColour`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* THICKNESS */}
    <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuThickness`]}>
      <Input
        type="text"
        value={material.foamPuThickness || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuThickness', e.target.value)}
        placeholder="in MM (e.g., 3, 4, 6, 8, 10, 12)"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuThickness`])}
      />
    </Field>

    {/* SHAPE */}
    <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuShape`]}>
      <Input
        type="text"
        value={material.foamPuShape || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuShape', e.target.value)}
        placeholder="TEXT"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuShape`])}
      />
    </Field>

    {/* UPLOAD REF IMAGE */}
    <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuShapeRefImage`]}>
      <input
        type="file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamPuShapeRefImage', f); }}
        className="hidden"
        id={`upload-pu-foam-shape-${actualIndex}`}
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamPuShapeRefImage`] ? 'border-red-600' : ''}`}
        onClick={() => document.getElementById(`upload-pu-foam-shape-${actualIndex}`)?.click()}
      >
        {material.foamPuShapeRefImage ? 'UPLOADED' : 'UPLOAD'}
      </Button>
    </Field>
  </div>

  {/* SIZE SPEC */}
  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
    <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      <Field label="SHEET/PCS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuSheetPcs`]}>
        <Input
          type="text"
          value={material.foamPuSheetPcs || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuSheetPcs', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuSheetPcs`])}
        />
      </Field>
      <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuGsm`]}>
        <Input
          type="text"
          value={material.foamPuGsm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuGsm', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuGsm`])}
        />
      </Field>
      <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuLengthCm`]}>
        <Input
          type="text"
          value={material.foamPuLengthCm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuLengthCm', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuLengthCm`])}
        />
      </Field>
      <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuWidthCm`]}>
        <Input
          type="text"
          value={material.foamPuWidthCm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuWidthCm', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuWidthCm`])}
        />
      </Field>
    </div>
  </div>

  {/* QTY - KGS and YARDAGE */}
  <div style={{ marginTop: '1.25rem' }}>
    <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuKgsCns`]}>
        <Input
          type="text"
          value={material.foamPuKgsCns || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuKgsCns', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuKgsCns`])}
        />
      </Field>
      <Field label="YARDAGE (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuYardageCns`]}>
        <Input
          type="text"
          value={material.foamPuYardageCns || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuYardageCns', e.target.value)}
          placeholder="Enter value"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuYardageCns`])}
        />
      </Field>
    </div>
  </div>

  {/* TESTING REQUIREMENTS */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
    <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamPuTestingRequirements`]}>
      <div className="flex items-center" style={{ gap: '0.75rem' }}>
        <div className="flex-1">
          <TestingRequirementsInput
            value={material.foamPuTestingRequirements || []}
            onChange={(values) => handleRawMaterialChange(actualIndex, 'foamPuTestingRequirements', values)}
            options={['Density Test', 'ILD Test', 'Compression Set', 'Resilience', 'Flammability']}
            placeholder="Type to search or select testing requirements..."
            error={Boolean(errors[`rawMaterial_${actualIndex}_foamPuTestingRequirements`])}
          />
        </div>
        <input
          type="file"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamPuTestingRequirementsFile', f); }}
          className="hidden"
          id={`upload-pu-foam-testing-${actualIndex}`}
          accept="image/*"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamPuTestingRequirementsFile`] ? 'border-red-600' : ''}`}
          onClick={() => document.getElementById(`upload-pu-foam-testing-${actualIndex}`)?.click()}
        >
          {material.foamPuTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
        </Button>
      </div>
    </Field>

    {/* SURPLUS % */}
    <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuSurplus`]}>
      <PercentInput
        value={material.foamPuSurplus || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuSurplus', e.target.value)}
        placeholder="e.g., 3-5"
        error={Boolean(errors[`rawMaterial_${actualIndex}_foamPuSurplus`])}
      />
    </Field>

    {/* WASTAGE % */}
    <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuWastage`]}>
      <div className="relative">
        <SearchableDropdown
          value={material.foamPuWastage || ''}
          onChange={(selectedValue) => {
            const predefinedOptions = ['Mattress Core', 'Cushion Insert', 'Topper', 'Packaging'];
            if (predefinedOptions.includes(selectedValue)) {
              handleRawMaterialChange(actualIndex, 'foamPuWastage', selectedValue);
            } else {
              const numericValue = selectedValue.replace(/[^0-9.]/g, '');
              handleRawMaterialChange(actualIndex, 'foamPuWastage', numericValue);
            }
          }}
          options={['Mattress Core', 'Cushion Insert', 'Topper', 'Packaging']}
          placeholder="Select or type %"
          className={`${material.foamPuWastage && !['Mattress Core', 'Cushion Insert', 'Topper', 'Packaging'].includes(material.foamPuWastage) ? 'pr-10' : ''} ${errors[`rawMaterial_${actualIndex}_foamPuWastage`] ? 'border-red-600' : ''}`}
        />
        {material.foamPuWastage && !['Mattress Core', 'Cushion Insert', 'Topper', 'Packaging'].includes(material.foamPuWastage) && (
          <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>%</span>
        )}
      </div>
    </Field>

    {/* APPROVAL */}
    <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuApproval`]}>
      <SearchableDropdown
        value={material.foamPuApproval || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuApproval', selectedValue)}
        options={MATERIAL_APPROVAL_OPTIONS}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPuApproval`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* REMARKS */}
    <Field label="REMARKS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPuRemarks`]}>
      <Input
        type="text"
        value={material.foamPuRemarks || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPuRemarks', e.target.value)}
        placeholder="32D for mattresses, CertiPUR-US for USA market, FR treatment for bedding"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPuRemarks`])}/>
    </Field>
  </div>

  {/* Show/Hide Advance Spec Button */}
  <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
    <Button
      type="button"
      variant={material.showFoamPuAdvancedSpec ? "default" : "outline"}
      size="sm"
      onClick={() => handleRawMaterialChange(actualIndex, 'showFoamPuAdvancedSpec', !material.showFoamPuAdvancedSpec)}
    >
      Advance Spec
    </Button>
  </div>
  
  {/* Advanced Filter UI Table */}
  {material.showFoamPuAdvancedSpec && (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
            <Field label="ILD / IFD (Firmness)" width="sm">
              <SearchableDropdown
                value={material.foamPuIld || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuIld', selectedValue)}
                options={['ILD rating (e.g., 20 Soft, 30 Medium, 40 Firm, 50+ Extra Firm)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="SUPPORT FACTOR" width="sm">
              <SearchableDropdown
                value={material.foamPuSupportFactor || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuSupportFactor', selectedValue)}
                options={['Support Factor ratio (e.g., 1.8, 2.0, 2.4, 2.6+)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="RESILIENCE" width="sm">
              <SearchableDropdown
                value={material.foamPuResilience || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuResilience', selectedValue)}
                options={['Resilience % (Ball Rebound Test) - 30-50% typical']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="CELL STRUCTURE" width="sm">
              <SearchableDropdown
                value={material.foamPuCellStructure || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuCellStructure', selectedValue)}
                options={['Open Cell (breathable)', 'Closed Cell (water resistant)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="COMPRESSION SET" width="sm">
              <SearchableDropdown
                value={material.foamPuCompressionSet || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuCompressionSet', selectedValue)}
                options={['Compression Set % (lower is better, <10% ideal)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="TENSILE STRENGTH" width="sm">
              <SearchableDropdown
                value={material.foamPuTensileStrength || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuTensileStrength', selectedValue)}
                options={['Tensile Strength (kPa)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="ELONGATION" width="sm">
              <SearchableDropdown
                value={material.foamPuElongation || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuElongation', selectedValue)}
                options={['Elongation at Break (%)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="FIRE RETARDANT" width="sm">
              <SearchableDropdown
                value={material.foamPuFireRetardant || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuFireRetardant', selectedValue)}
                options={['Standard', 'FR Treated (CFR 1633, TB 117-2013, BS 5852, FMVSS 302)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="ANTI-MICROBIAL" width="sm">
              <SearchableDropdown
                value={material.foamPuAntiMicrobial || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuAntiMicrobial', selectedValue)}
                options={['Standard', 'Anti-Microbial Treated', 'Anti-Bacterial']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="DENSITY" width="sm">
              <SearchableDropdown
                value={material.foamPuDensity || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuDensity', selectedValue)}
                options={['18 kg/m³', '20 kg/m³', '24 kg/m³', '28 kg/m³', '32 kg/m³', '40 kg/m³', '50 kg/m³']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="CERTIFICATION" width="sm">
              <SearchableDropdown
                value={material.foamPuCertification || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPuCertification', selectedValue)}
                options={['CertiPUR-US', 'OEKO-TEX', 'Greenguard', 'REACH Compliant']}
                placeholder="Select or type"
              />
            </Field>
          </div>
        </div>
      )}
      {/* Quality Verification - after Advance Spec, inside top-border block */}
      <div className="w-full max-w-xl" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <QualityVerificationToggle
          value={material.qualityVerification}
          onChange={(value) => handleRawMaterialChange(actualIndex, 'qualityVerification', value)}
          width="lg"
          className="mb-3"
        />
      </div>
  </>
);

export default FoamPu;
