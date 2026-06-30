// FoamRebonded — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamRebonded = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
    {/* FOAM TYPE */}
    <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedType`]}>
      <SearchableDropdown
        value={material.foamRebondedType || ''}
        onChange={(selectedValue) => {
          handleRawMaterialChange(actualIndex, 'foamRebondedType', selectedValue);
          // Clear chip-related fields when foam type changes
          if (selectedValue !== material.foamRebondedType) {
            handleRawMaterialChange(actualIndex, 'foamRebondedChipSource', '');
            handleRawMaterialChange(actualIndex, 'foamRebondedChipSize', '');
          }
        }}
        options={['Rebonded Foam', 'Bonded Foam', 'Chip Foam']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamRebondedType`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* SUBTYPE */}
    <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedSubtype`]}>
      <SearchableDropdown
        value={material.foamRebondedSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedSubtype', selectedValue)}
        options={['Standard Rebond', 'High Density Rebond', 'Colored Chip']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamRebondedSubtype`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* CHIP SOURCE - Conditional (only shows when Chip Foam is selected) */}
    {material.foamRebondedType && material.foamRebondedType.toLowerCase().includes('chip') && (
      <Field label="CHIP SOURCE" width="sm">
        <SearchableDropdown
          value={material.foamRebondedChipSource || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedChipSource', selectedValue)}
          options={['Mixed Foam Scrap', 'Memory Foam Chips', 'PU Chips', 'Colored Chips']}
          placeholder="Select or type"
        />
      </Field>
    )}

    {/* CHIP SIZE - Conditional (only shows when Chip Foam is selected) */}
    {material.foamRebondedType && material.foamRebondedType.toLowerCase().includes('chip') && (
      <Field label="CHIP SIZE" width="sm">
        <SearchableDropdown
          value={material.foamRebondedChipSize || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedChipSize', selectedValue)}
          options={['Fine Chip', 'Medium Chip', 'Coarse Chip', 'Mixed']}
          placeholder="Select or type"
        />
      </Field>
    )}

    {/* BONDING */}
    <Field label="BONDING" width="sm">
      <SearchableDropdown
        value={material.foamRebondedBonding || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedBonding', selectedValue)}
        options={['Adhesive Bonded', 'Steam Bonded']}
        placeholder="Select or type"
      />
    </Field>

    {/* COLOUR */}
    <Field label="COLOUR" width="sm">
      <SearchableDropdown
        value={material.foamRebondedColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedColour', selectedValue)}
        options={['Multi-Color (typical)', 'Grey', 'Single Color (if sorted chips)']}
        placeholder="Select or type"
      />
    </Field>

    {/* THICKNESS */}
    <Field label="THICKNESS" width="sm">
      <Input
        type="text"
        value={material.foamRebondedThickness || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedThickness', e.target.value)}
        placeholder="MM (e.g., 5mm, 10mm, 15mm, 20mm, 25mm, 50mm)"
      />
    </Field>

    {/* SHAPE */}
    <Field label="SHAPE" width="sm">
      <Input
        type="text"
        value={material.foamRebondedShape || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedShape', e.target.value)}
        placeholder="TEXT"
      />
    </Field>

    {/* UPLOAD REF IMAGE */}
    <Field label="UPLOAD REF IMAGE" width="sm">
      <input
        type="file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamRebondedShapeRefImage', f); }}
        className="hidden"
        id={`upload-rebonded-foam-shape-${actualIndex}`}
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-11 w-full"
        onClick={() => document.getElementById(`upload-rebonded-foam-shape-${actualIndex}`)?.click()}
      >
        {material.foamRebondedShapeRefImage ? 'UPLOADED' : 'UPLOAD'}
      </Button>
    </Field>
  </div>

  {/* SIZE SPEC */}
  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
    <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      <Field label="SHEET/PCS" width="sm">
        <Input
          type="text"
          value={material.foamRebondedSheetPcs || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedSheetPcs', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
      <Field label="GSM" width="sm">
        <Input
          type="text"
          value={material.foamRebondedGsm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedGsm', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
      <Field label="LENGTH (CM)" width="sm">
        <Input
          type="text"
          value={material.foamRebondedLengthCm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedLengthCm', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
      <Field label="WIDTH (CM)" width="sm">
        <Input
          type="text"
          value={material.foamRebondedWidthCm || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedWidthCm', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
    </div>
  </div>

  {/* QTY - KGS and YARDAGE */}
  <div style={{ marginTop: '1.25rem' }}>
    <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      <Field label="KGS (CNS)" width="sm">
        <Input
          type="text"
          value={material.foamRebondedKgsCns || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedKgsCns', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
      <Field label="YARDAGE (CNS)" width="sm">
        <Input
          type="text"
          value={material.foamRebondedYardageCns || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedYardageCns', e.target.value)}
          placeholder="Enter value"
        />
      </Field>
    </div>
  </div>

  {/* TESTING REQUIREMENTS */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
    <Field label="TESTING REQ." width="sm" className="col-span-1 md:col-span-2 lg:col-span-5">
      <div className="flex items-center" style={{ gap: '0.75rem' }}>
        <div className="flex-1">
          <TestingRequirementsInput
            value={material.foamRebondedTestingRequirements || []}
            onChange={(values) => handleRawMaterialChange(actualIndex, 'foamRebondedTestingRequirements', values)}
            options={['Density', 'Compression Set', 'Tensile Strength']}
            placeholder="Type to search or select testing requirements..."
          />
        </div>
        <input
          type="file"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamRebondedTestingRequirementsFile', f); }}
          className="hidden"
          id={`upload-rebonded-foam-testing-${actualIndex}`}
          accept="image/*"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11"
          onClick={() => document.getElementById(`upload-rebonded-foam-testing-${actualIndex}`)?.click()}
        >
          {material.foamRebondedTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
        </Button>
      </div>
    </Field>

    {/* SURPLUS % */}
    <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedSurplus`]}>
      <PercentInput
        value={material.foamRebondedSurplus || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedSurplus', e.target.value)}
        placeholder="e.g., 3-5"
        error={Boolean(errors[`rawMaterial_${actualIndex}_foamRebondedSurplus`])}
      />
    </Field>

    {/* WASTAGE % */}
    <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedWastage`]}>
      <div className="relative">
        <SearchableDropdown
          value={material.foamRebondedWastage || ''}
          onChange={(selectedValue) => {
            const predefinedOptions = ['Carpet Underlay', 'Gym Mats', 'Economy Mattress', 'Packaging'];
            if (predefinedOptions.includes(selectedValue)) {
              handleRawMaterialChange(actualIndex, 'foamRebondedWastage', selectedValue);
            } else {
              const numericValue = selectedValue.replace(/[^0-9.]/g, '');
              handleRawMaterialChange(actualIndex, 'foamRebondedWastage', numericValue);
            }
          }}
          options={['Carpet Underlay', 'Gym Mats', 'Economy Mattress', 'Packaging']}
          placeholder="Select or type %"
          className={`${material.foamRebondedWastage && !['Carpet Underlay', 'Gym Mats', 'Economy Mattress', 'Packaging'].includes(material.foamRebondedWastage) ? 'pr-10' : ''} ${errors[`rawMaterial_${actualIndex}_foamRebondedWastage`] ? 'border-red-600' : ''}`}
        />
        {material.foamRebondedWastage && !['Carpet Underlay', 'Gym Mats', 'Economy Mattress', 'Packaging'].includes(material.foamRebondedWastage) && (
          <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>%</span>
        )}
      </div>
    </Field>

    {/* APPROVAL */}
    <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedApproval`]}>
      <SearchableDropdown
        value={material.foamRebondedApproval || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedApproval', selectedValue)}
        options={MATERIAL_APPROVAL_OPTIONS}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamRebondedApproval`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* REMARKS */}
    <Field label="REMARKS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamRebondedRemarks`]}>
      <Input
        type="text"
        value={material.foamRebondedRemarks || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRebondedRemarks', e.target.value)}
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamRebondedRemarks`])}
        placeholder="Cost-effective recycled option, High density for underlay, Multi-color is standard"
      />
    </Field>
  </div>

  {/* Show/Hide Advance Spec Button */}
  <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
    <Button
      type="button"
      variant={material.showFoamRebondedAdvancedSpec ? "default" : "outline"}
      size="sm"
      onClick={() => handleRawMaterialChange(actualIndex, 'showFoamRebondedAdvancedSpec', !material.showFoamRebondedAdvancedSpec)}
    >
      Advance Spec
    </Button>
  </div>
  
  {/* Advanced Filter UI Table */}
  {material.showFoamRebondedAdvancedSpec && (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
        <Field label="ILD / IFD (Firmness)" width="sm">
          <SearchableDropdown
            value={material.foamRebondedIld || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedIld', selectedValue)}
            options={['ILD rating (typically firm - 40, 50, 60+)']}
            placeholder="Select or type"
          />
        </Field>
        <Field label="COMPRESSION SET" width="sm">
          <SearchableDropdown
            value={material.foamRebondedCompressionSet || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedCompressionSet', selectedValue)}
            options={['Compression Set %']}
            placeholder="Select or type"
          />
        </Field>
        <Field label="FIRE RETARDANT" width="sm">
          <SearchableDropdown
            value={material.foamRebondedFireRetardant || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedFireRetardant', selectedValue)}
            options={['Standard', 'FR Treated']}
            placeholder="Select or type"
          />
        </Field>
        <Field label="CERTIFICATION" width="sm">
          <SearchableDropdown
            value={material.foamRebondedCertification || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedCertification', selectedValue)}
            options={['Recycled Content Certified', 'REACH Compliant']}
            placeholder="Select or type"
          />
        </Field>
        <Field label="DENSITY" width="sm">
          <SearchableDropdown
            value={material.foamRebondedDensity || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamRebondedDensity', selectedValue)}
            options={['80 kg/m³', '100 kg/m³', '120 kg/m³', '150 kg/m³', '180 kg/m³', '200 kg/m³']}
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

export default FoamRebonded;
