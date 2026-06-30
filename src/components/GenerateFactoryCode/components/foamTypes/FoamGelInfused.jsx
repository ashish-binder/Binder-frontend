// FoamGelInfused — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamGelInfused = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      {/* FOAM TYPE */}
      <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedType`]}>
        <SearchableDropdown
          value={material.foamGelInfusedType || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedType', selectedValue)}
          options={['Gel-Infused Foam']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamGelInfusedType`] ? 'border-red-600' : ''}
        />
      </Field>

    {/* BASE FOAM */}
    <Field label="BASE FOAM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedBaseFoam`]}>
      <SearchableDropdown
        value={material.foamGelInfusedBaseFoam || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedBaseFoam', selectedValue)}
        options={['Memory Foam', 'PU Foam', 'HR Foam', 'Latex']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamGelInfusedBaseFoam`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* GEL TYPE */}
    <Field label="GEL TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedGelType`]}>
      <SearchableDropdown
        value={material.foamGelInfusedGelType || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedGelType', selectedValue)}
        options={['Gel Beads', 'Gel Swirl', 'Gel Layer', 'Gel Particles', 'Phase Change Material (PCM)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamGelInfusedGelType`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* GEL CONTENT */}
    <Field label="GEL CONTENT" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedGelContent`]}>
      <SearchableDropdown
        value={material.foamGelInfusedGelContent || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedGelContent', selectedValue)}
        options={['Gel content % or concentration']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamGelInfusedGelContent`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* SUBTYPE */}
    <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedSubtype`]}>
      <SearchableDropdown
        value={material.foamGelInfusedSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedSubtype', selectedValue)}
        options={['Virgin', 'Blended']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamGelInfusedSubtype`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* COLOUR */}
    <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedColour`]}>
      <SearchableDropdown
        value={material.foamGelInfusedColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedColour', selectedValue)}
        options={['Blue (common for gel)', 'White', 'Grey', 'Multi-color (swirl)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamGelInfusedColour`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* THICKNESS */}
    <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedThickness`]}>
      <Input
        type="text"
        value={material.foamGelInfusedThickness || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedThickness', e.target.value)}
        placeholder="MM"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedThickness`])}
      />
    </Field>

    {/* SHAPE */}
    <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedShape`]}>
      <Input
        type="text"
        value={material.foamGelInfusedShape || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedShape', e.target.value)}
        placeholder="TEXT"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedShape`])}
      />
    </Field>

    {/* UPLOAD REF IMAGE */}
    <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedShapeRefImage`]}>
      <input
        type="file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamGelInfusedShapeRefImage', f); }}
        className="hidden"
        id={`upload-gel-infused-foam-shape-${actualIndex}`}
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamGelInfusedShapeRefImage`] ? 'border-red-600' : ''}`}
        onClick={() => document.getElementById(`upload-gel-infused-foam-shape-${actualIndex}`)?.click()}
      >
        {material.foamGelInfusedShapeRefImage ? 'UPLOADED' : 'UPLOAD'}
      </Button>
    </Field>

    {/* SIZE SPEC */}
    <div
      style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}
      className="col-span-1 md:col-span-2 lg:col-span-5"
    >
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="SHEET/PCS" width="sm">
          <Input
            type="text"
            value={material.foamGelInfusedSheetPcs || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedSheetPcs', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedSheetPcs`])}
          />
        </Field>
        <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedGsm`]}>
          <Input
            type="text"
            value={material.foamGelInfusedGsm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedGsm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedGsm`])}
          />
        </Field>
        <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedLengthCm`]}>
          <Input
            type="text"
            value={material.foamGelInfusedLengthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedLengthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedLengthCm`])}
          />
        </Field>
        <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedWidthCm`]}>
          <Input
            type="text"
            value={material.foamGelInfusedWidthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedWidthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedWidthCm`])}
          />
        </Field>
      </div>
    </div>

    {/* QTY - KGS and YARDAGE */}
    <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedKgsCns`]}>
          <Input
            type="text"
            value={material.foamGelInfusedKgsCns || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedKgsCns', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedKgsCns`])}
          />
        </Field>
        <Field label="YARDAGE (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedYardageCns`]}>
          <Input
            type="text"
            value={material.foamGelInfusedYardageCns || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedYardageCns', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedYardageCns`])}
          />
        </Field>
      </div>
    </div>

    {/* TESTING / SURPLUS / WASTAGE / APPROVAL / REMARKS */}
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5"
      style={{ gap: '16px 12px', marginTop: '1.25rem' }}
    >
      {/* TESTING REQ. */}
      <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedTestingRequirements`]}>
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <div className="flex-1">
            <TestingRequirementsInput
              value={material.foamGelInfusedTestingRequirements || []}
              onChange={(values) => handleRawMaterialChange(actualIndex, 'foamGelInfusedTestingRequirements', values)}
              options={['Density', 'ILD', 'Temperature Differential Test', 'Compression Set']}
              placeholder="Type to search or select testing requirements..."
              error={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedTestingRequirements`])}
            />
          </div>
          <input
            type="file"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamGelInfusedTestingRequirementsFile', f); }}
            className="hidden"
            id={`upload-gel-infused-testing-${actualIndex}`}
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamGelInfusedTestingRequirementsFile`] ? 'border-red-600' : ''}`}
            onClick={() => document.getElementById(`upload-gel-infused-testing-${actualIndex}`)?.click()}
          >
            {material.foamGelInfusedTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
          </Button>
        </div>
      </Field>

      {/* SURPLUS % */}
      <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedSurplus`]}>
        <PercentInput
          value={material.foamGelInfusedSurplus || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedSurplus', e.target.value)}
          placeholder="e.g., 3-5"
          error={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedSurplus`])}
        />
      </Field>

      {/* WASTAGE % */}
      <Field label="WASTAGE %" width="sm">
        <div className="relative">
          <SearchableDropdown
            value={material.foamGelInfusedWastage || ''}
            onChange={(selectedValue) => {
              const predefinedOptions = ['Cooling Mattress Topper', 'Premium Pillows', 'Hot Sleeper Products'];
              if (predefinedOptions.includes(selectedValue)) {
                handleRawMaterialChange(actualIndex, 'foamGelInfusedWastage', selectedValue);
              } else {
                const numericValue = selectedValue.replace(/[^0-9.]/g, '');
                handleRawMaterialChange(actualIndex, 'foamGelInfusedWastage', numericValue);
              }
            }}
            options={['Cooling Mattress Topper', 'Premium Pillows', 'Hot Sleeper Products']}
            placeholder="Select or type %"
            className={
              material.foamGelInfusedWastage &&
              !['Cooling Mattress Topper', 'Premium Pillows', 'Hot Sleeper Products'].includes(material.foamGelInfusedWastage)
                ? 'pr-10'
                : ''
            }
          />
          {material.foamGelInfusedWastage &&
            !['Cooling Mattress Topper', 'Premium Pillows', 'Hot Sleeper Products'].includes(material.foamGelInfusedWastage) && (
              <span
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-foreground)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  zIndex: 10,
                }}
              >
                %
              </span>
            )}
        </div>
      </Field>

      {/* APPROVAL */}
      <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedApproval`]}>
        <SearchableDropdown
          value={material.foamGelInfusedApproval || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedApproval', selectedValue)}
          options={MATERIAL_APPROVAL_OPTIONS}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamGelInfusedApproval`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* REMARKS */}
      <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamGelInfusedRemarks`]}>
        <Input
          type="text"
          value={material.foamGelInfusedRemarks || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGelInfusedRemarks', e.target.value)}
          placeholder="Gel memory foam for hot sleepers, PCM for active temperature regulation"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGelInfusedRemarks`])}
        />
      </Field>
    </div>

    {/* Advance Spec Button */}
    <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <Button
        type="button"
        variant={material.showFoamGelInfusedAdvancedSpec ? 'default' : 'outline'}
        size="sm"
        onClick={() =>
          handleRawMaterialChange(actualIndex, 'showFoamGelInfusedAdvancedSpec', !material.showFoamGelInfusedAdvancedSpec)
        }
      >
        Advance Spec
      </Button>
    </div>

    {/* Advanced Filter UI Table */}
    {material.showFoamGelInfusedAdvancedSpec && (
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: 'var(--muted)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
        }}
        className="col-span-1 md:col-span-2 lg:col-span-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
          <Field label="DENSITY" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedDensity || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedDensity', selectedValue)}
              options={['50 kg/m³', '60 kg/m³', '70 kg/m³', 'Base foam density + gel']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="ILD / IFD (FIRMNESS)" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedIld || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedIld', selectedValue)}
              options={['ILD rating based on base foam']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="TEMPERATURE REGULATION" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedTemperatureRegulation || ''}
              onChange={(selectedValue) =>
                handleRawMaterialChange(actualIndex, 'foamGelInfusedTemperatureRegulation', selectedValue)
              }
              options={['Absorbs and dissipates body heat']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="RESPONSE TIME" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedResponseTime || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedResponseTime', selectedValue)}
              options={['If memory foam base - response time specification']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="BREATHABILITY" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedBreathability || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedBreathability', selectedValue)}
              options={['Standard', 'Enhanced (ventilated)', 'Open Cell']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="FIRE RETARDANT" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedFireRetardant || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedFireRetardant', selectedValue)}
              options={['FR Treated (CFR 1633, TB 117)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="COOLING EFFECT" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedCoolingEffect || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedCoolingEffect', selectedValue)}
              options={['Standard Cooling', 'Advanced Cooling', 'Phase Change (PCM)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="CERTIFICATION" width="sm">
            <SearchableDropdown
              value={material.foamGelInfusedCertification || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamGelInfusedCertification', selectedValue)}
              options={['CertiPUR-US', 'OEKO-TEX', 'Greenguard']}
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

export default FoamGelInfused;
