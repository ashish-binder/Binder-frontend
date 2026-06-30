// FoamPeEpe — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamPeEpe = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
    {/* FOAM TYPE */}
    <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeType`]}>
      <SearchableDropdown
        value={material.foamPeEpeType || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeType', selectedValue)}
        options={['PE Foam', 'EPE Foam (Expanded Polyethylene)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPeEpeType`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* SUBTYPE */}
    <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeSubtype`]}>
      <SearchableDropdown
        value={material.foamPeEpeSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeSubtype', selectedValue)}
        options={['Virgin PE', 'Recycled PE', 'Cross-Linked PE (XLPE)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPeEpeSubtype`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* COLOUR */}
    <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeColour`]}>
      <SearchableDropdown
        value={material.foamPeEpeColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeColour', selectedValue)}
        options={['White (standard)', 'Black', 'Pink (anti-static)', 'Blue', 'Custom']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamPeEpeColour`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* THICKNESS */}
    <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeThickness`]}>
      <Input
        type="text"
        value={material.foamPeEpeThickness || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeThickness', e.target.value)}
        placeholder="MM (e.g., 0.5mm, 1mm, 2mm, 3mm, 5mm, 10mm, 20mm, 50mm)"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeThickness`])}
      />
    </Field>

    {/* SHAPE */}
    <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeShape`]}>
      <Input
        type="text"
        value={material.foamPeEpeShape || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeShape', e.target.value)}
        placeholder="TEXT"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeShape`])}
      />
    </Field>

    {/* UPLOAD REF IMAGE */}
    <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeShapeRefImage`]}>
      <input
        type="file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamPeEpeShapeRefImage', f); }}
        className="hidden"
        id={`upload-pe-epe-foam-shape-${actualIndex}`}
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamPeEpeShapeRefImage`] ? 'border-red-600' : ''}`}
        onClick={() => document.getElementById(`upload-pe-epe-foam-shape-${actualIndex}`)?.click()}
      >
        {material.foamPeEpeShapeRefImage ? 'UPLOADED' : 'UPLOAD REF IMAGE'}
      </Button>
    </Field>

    {/* SIZE SPEC */}
    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="SHEET/PCS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeSheetPcs`]}>
          <Input
            type="text"
            value={material.foamPeEpeSheetPcs || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeSheetPcs', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeSheetPcs`])}
          />
        </Field>
        <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeGsm`]}>
          <Input
            type="text"
            value={material.foamPeEpeGsm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeGsm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeGsm`])}
          />
        </Field>
        <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeLengthCm`]}>
          <Input
            type="text"
            value={material.foamPeEpeLengthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeLengthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeLengthCm`])}
          />
        </Field>
        <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeWidthCm`]}>
          <Input
            type="text"
            value={material.foamPeEpeWidthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeWidthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeWidthCm`])}
          />
        </Field>
      </div>
    </div>

    {/* QTY - KGS and YARDAGE */}
    <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeKgsCns`]}>
          <Input
            type="text"
            value={material.foamPeEpeKgsCns || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeKgsCns', e.target.value)}
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeKgsCns`])}
            placeholder="Enter value"
          />
        </Field>
        <Field label="YARDAGE (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeYardageCns`]}>
          <Input
            type="text"
            value={material.foamPeEpeYardageCns || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeYardageCns', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeYardageCns`])}
          />
        </Field>
      </div>
    </div>

    {/* TESTING / SURPLUS / WASTAGE / APPROVAL / REMARKS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
      {/* TESTING REQ. */}
      <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamPeEpeTestingRequirements`]}>
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <div className="flex-1">
            <TestingRequirementsInput
              value={material.foamPeEpeTestingRequirements || []}
              onChange={(values) => handleRawMaterialChange(actualIndex, 'foamPeEpeTestingRequirements', values)}
              options={['Density', 'Compression', 'Water Absorption', 'Thermal Conductivity']}
              placeholder="Type to search or select testing requirements..."
              error={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeTestingRequirements`])}
            />
          </div>
          <input
            type="file"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamPeEpeTestingRequirementsFile', f); }}
            className="hidden"
            id={`upload-pe-epe-testing-${actualIndex}`}
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamPeEpeTestingRequirementsFile`] ? 'border-red-600' : ''}`}
            onClick={() => document.getElementById(`upload-pe-epe-testing-${actualIndex}`)?.click()}
          >
            {material.foamPeEpeTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
          </Button>
        </div>
      </Field>

    {/* SURPLUS % */}
    <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeSurplus`]}>
      <PercentInput
        value={material.foamPeEpeSurplus || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeSurplus', e.target.value)}
        placeholder="e.g., 3-5"
        error={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeSurplus`])}
      />
    </Field>

    {/* WASTAGE % */}
    <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeWastage`]}>
      <div className="relative">
        <SearchableDropdown
          value={material.foamPeEpeWastage || ''}
          onChange={(selectedValue) => {
            const predefinedOptions = ['Packaging', 'Insulation', 'Protective Wrap', 'Underlayment'];
            if (predefinedOptions.includes(selectedValue)) {
              handleRawMaterialChange(actualIndex, 'foamPeEpeWastage', selectedValue);
            } else {
              const numericValue = selectedValue.replace(/[^0-9.]/g, '');
              handleRawMaterialChange(actualIndex, 'foamPeEpeWastage', numericValue);
            }
          }}
          options={['Packaging', 'Insulation', 'Protective Wrap', 'Underlayment']}
          placeholder="Select or type %"
          className={`${material.foamPeEpeWastage && !['Packaging', 'Insulation', 'Protective Wrap', 'Underlayment'].includes(material.foamPeEpeWastage) ? 'pr-10' : ''} ${errors[`rawMaterial_${actualIndex}_foamPeEpeWastage`] ? 'border-red-600' : ''}`}
        />
        {material.foamPeEpeWastage &&
          !['Packaging', 'Insulation', 'Protective Wrap', 'Underlayment'].includes(material.foamPeEpeWastage) && (
            <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>%</span>
          )}
      </div>
    </Field>

      {/* APPROVAL */}
      <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamPeEpeApproval`]}>
        <SearchableDropdown
          value={material.foamPeEpeApproval || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeApproval', selectedValue)}
          options={MATERIAL_APPROVAL_OPTIONS}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamPeEpeApproval`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* REMARKS */}
      <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamPeEpeRemarks`]}>
        <Input
          type="text"
          value={material.foamPeEpeRemarks || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamPeEpeRemarks', e.target.value)}
          placeholder="Typically closed-cell, lightweight, flexible. Applications: packaging, insulation."
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamPeEpeRemarks`])}/>
      </Field>
    </div>

    {/* Advance Spec Button */}
    <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <Button
        type="button"
        variant={material.showFoamPeEpeAdvancedSpec ? "default" : "outline"}
        size="sm"
        onClick={() => handleRawMaterialChange(actualIndex, 'showFoamPeEpeAdvancedSpec', !material.showFoamPeEpeAdvancedSpec)}
      >
        Advance Spec
      </Button>
    </div>

    {/* Advanced Filter UI Table */}
    {material.showFoamPeEpeAdvancedSpec && (
      <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
          <Field label="CELL STRUCTURE" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeCellStructure || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeCellStructure', selectedValue)}
              options={['Closed Cell (standard for PE foam)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="LAMINATION" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeLamination || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeLamination', selectedValue)}
              options={['None', 'PE Film Laminated', 'Foil Laminated', 'Fabric Laminated']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="CROSS-LINKED" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeCrossLinked || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeCrossLinked', selectedValue)}
              options={['Non Cross-Linked (standard EPE)', 'Cross-Linked (XLPE - denser, stronger)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="ANTI-STATIC" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeAntiStatic || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeAntiStatic', selectedValue)}
              options={['Standard', 'Anti-Static (Pink ESD foam)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="WATER RESISTANCE" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeWaterResistance || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeWaterResistance', selectedValue)}
              options={['Excellent (closed cell)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="CUSHIONING" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeCushioning || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeCushioning', selectedValue)}
              options={['Good shock absorption', 'Low compression set']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="FIRE RETARDANT" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeFireRetardant || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeFireRetardant', selectedValue)}
              options={['Standard', 'FR Treated (HF-1, UL94)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="THERMAL INSULATION" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeThermalInsulation || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeThermalInsulation', selectedValue)}
              options={['Good thermal insulation (R-value)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="CERTIFICATION" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeCertification || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeCertification', selectedValue)}
              options={['REACH Compliant', 'RoHS Compliant', 'OEKO-TEX']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="DENSITY" width="sm">
            <SearchableDropdown
              value={material.foamPeEpeDensity || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamPeEpeDensity', selectedValue)}
              options={['18 kg/m³', '20 kg/m³', '25 kg/m³', '30 kg/m³', '35 kg/m³', '45 kg/m³']}
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
  </div>
  </>
);

export default FoamPeEpe;
