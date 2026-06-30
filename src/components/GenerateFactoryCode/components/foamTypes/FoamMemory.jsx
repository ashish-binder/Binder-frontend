// FoamMemory — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamMemory = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      {/* FOAM TYPE */}
      <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryType`]}>
        <SearchableDropdown
          value={material.foamMemoryType || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryType', selectedValue)}
          options={['Memory Foam', 'Visco-Elastic Foam']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamMemoryType`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* SUBTYPE */}
      <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemorySubtype`]}>
        <SearchableDropdown
          value={material.foamMemorySubtype || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemorySubtype', selectedValue)}
          options={['Virgin', 'Blended', 'Plant-Based (Bio-Foam)']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamMemorySubtype`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* GRADE */}
      <Field label="GRADE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryGrade`]}>
        <SearchableDropdown
          value={material.foamMemoryGrade || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryGrade', selectedValue)}
          options={['Standard Memory', 'High Density Memory', 'Premium Memory']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamMemoryGrade`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* COLOUR */}
      <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryColour`]}>
        <SearchableDropdown
          value={material.foamMemoryColour || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryColour', selectedValue)}
          options={['White', 'Grey', 'Blue', 'Green (plant-based)', 'Charcoal']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamMemoryColour`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* THICKNESS */}
      <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryThickness`]}>
        <Input
          type="text"
          value={material.foamMemoryThickness || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryThickness', e.target.value)}
          placeholder="in MM (e.g., 2, 3, 4, 5, 6)"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryThickness`])}
        />
      </Field>

      {/* SHAPE */}
      <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryShape`]}>
        <Input
          type="text"
          value={material.foamMemoryShape || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryShape', e.target.value)}
          placeholder="TEXT"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryShape`])}
        />
      </Field>

      {/* UPLOAD REF IMAGE */}
      <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryShapeRefImage`]}>
        <input
          type="file"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamMemoryShapeRefImage', f); }}
          className="hidden"
          id={`upload-memory-foam-shape-${actualIndex}`}
          accept="image/*"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamMemoryShapeRefImage`] ? 'border-red-600' : ''}`}
          onClick={() => document.getElementById(`upload-memory-foam-shape-${actualIndex}`)?.click()}
        >
          {material.foamMemoryShapeRefImage ? 'UPLOADED' : 'UPLOAD REF IMAGE'}
        </Button>
      </Field>

      {/* SIZE SPEC */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
        <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
          <Field label="SHEET/PCS" width="sm">
            <Input
              type="text"
              value={material.foamMemorySheetPcs || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemorySheetPcs', e.target.value)}
              placeholder="Enter value"
            />
          </Field>
          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryGsm`]}>
            <Input
              type="text"
              value={material.foamMemoryGsm || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryGsm', e.target.value)}
              placeholder="Enter value"
              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryGsm`])}
            />
          </Field>
          <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryLengthCm`]}>
            <Input
              type="text"
              value={material.foamMemoryLengthCm || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryLengthCm', e.target.value)}
              placeholder="Enter value"
              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryLengthCm`])}
            />
          </Field>
          <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryWidthCm`]}>
            <Input
              type="text"
              value={material.foamMemoryWidthCm || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryWidthCm', e.target.value)}
              placeholder="Enter value"
              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryWidthCm`])}
            />
          </Field>
        </div>
      </div>

      {/* QTY - KGS and YARDAGE */}
      <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
        <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
          <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryKgsCns`]}>
            <Input
              type="text"
              value={material.foamMemoryKgsCns || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryKgsCns', e.target.value)}
              placeholder="Enter value"
              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryKgsCns`])}
            />
          </Field>
          <Field label="YARDAGE (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryYardageCns`]}>
            <Input
              type="text"
              value={material.foamMemoryYardageCns || ''}
              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryYardageCns', e.target.value)}
              placeholder="Enter value"
              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryYardageCns`])}
            />
          </Field>
        </div>
      </div>

      {/* TESTING / SURPLUS / WASTAGE / APPROVAL / REMARKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
        {/* TESTING REQ. */}
        <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamMemoryTestingRequirements`]}>
          <div className="flex items-center" style={{ gap: '0.75rem' }}>
            <div className="flex-1">
              <TestingRequirementsInput
                value={material.foamMemoryTestingRequirements || []}
                onChange={(values) => handleRawMaterialChange(actualIndex, 'foamMemoryTestingRequirements', values)}
                options={['Density', 'ILD', 'Response Time', 'Compression Set', 'VOC Emissions', 'Flammability']}
                placeholder="Type to search or select testing requirements..."
                error={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryTestingRequirements`])}
              />
            </div>
            <input
              type="file"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamMemoryTestingRequirementsFile', f); }}
              className="hidden"
              id={`upload-memory-testing-${actualIndex}`}
              accept="image/*"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamMemoryTestingRequirementsFile`] ? 'border-red-600' : ''}`}
              onClick={() => document.getElementById(`upload-memory-testing-${actualIndex}`)?.click()}
            >
              {material.foamMemoryTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
            </Button>
          </div>
        </Field>

        {/* SURPLUS % */}
        <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemorySurplus`]}>
          <PercentInput
            value={material.foamMemorySurplus || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemorySurplus', e.target.value)}
            placeholder="e.g., 3-5"
            error={Boolean(errors[`rawMaterial_${actualIndex}_foamMemorySurplus`])}
          />
        </Field>

        {/* WASTAGE % */}
        <Field label="WASTAGE %" width="sm">
          <div className="relative">
            <SearchableDropdown
              value={material.foamMemoryWastage || ''}
              onChange={(selectedValue) => {
                const predefinedOptions = ['Mattress Topper', 'Pillow Core', 'Mattress Layer', 'Cushion'];
                if (predefinedOptions.includes(selectedValue)) {
                  handleRawMaterialChange(actualIndex, 'foamMemoryWastage', selectedValue);
                } else {
                  const numericValue = selectedValue.replace(/[^0-9.]/g, '');
                  handleRawMaterialChange(actualIndex, 'foamMemoryWastage', numericValue);
                }
              }}
              options={['Mattress Topper', 'Pillow Core', 'Mattress Layer', 'Cushion']}
              placeholder="Select or type %"
              className={
                material.foamMemoryWastage && !['Mattress Topper', 'Pillow Core', 'Mattress Layer', 'Cushion'].includes(material.foamMemoryWastage)
                  ? 'pr-10'
                  : ''
              }
            />
            {material.foamMemoryWastage &&
              !['Mattress Topper', 'Pillow Core', 'Mattress Layer', 'Cushion'].includes(material.foamMemoryWastage) && (
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
        <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamMemoryApproval`]}>
          <SearchableDropdown
            value={material.foamMemoryApproval || ''}
            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryApproval', selectedValue)}
            options={MATERIAL_APPROVAL_OPTIONS}
            placeholder="Select or type"
            className={errors[`rawMaterial_${actualIndex}_foamMemoryApproval`] ? 'border-red-600' : ''}
          />
        </Field>

        {/* REMARKS */}
        <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamMemoryRemarks`]}>
          <Input
            type="text"
            value={material.foamMemoryRemarks || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamMemoryRemarks', e.target.value)}
            placeholder="50D+ for quality, Gel-infused for cooling, Low VOC for sensitive users"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamMemoryRemarks`])}
          />
        </Field>
      </div>

      {/* Advance Spec Button */}
      <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
        <Button
          type="button"
          variant={material.showFoamMemoryAdvancedSpec ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRawMaterialChange(actualIndex, 'showFoamMemoryAdvancedSpec', !material.showFoamMemoryAdvancedSpec)}
        >
          Advance Spec
        </Button>
      </div>

      {/* Advanced Filter UI Table */}
      {material.showFoamMemoryAdvancedSpec && (
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
            <Field label="ILD / IFD (FIRMNESS)" width="sm">
              <SearchableDropdown
                value={material.foamMemoryIld || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryIld', selectedValue)}
                options={['ILD rating (e.g., 8 Ultra-Soft, 10-12 Soft, 14 Medium, 18+ Firm)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="RESPONSE TIME" width="sm">
              <SearchableDropdown
                value={material.foamMemoryResponseTime || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryResponseTime', selectedValue)}
                options={['Recovery Time (Slow: 5-10 sec, Medium: 3-5 sec, Fast: 1-3 sec)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="TEMPERATURE SENSITIVITY" width="sm">
              <SearchableDropdown
                value={material.foamMemoryTemperatureSensitivity || ''}
                onChange={(selectedValue) =>
                  handleRawMaterialChange(actualIndex, 'foamMemoryTemperatureSensitivity', selectedValue)
                }
                options={['Standard (temp sensitive)', 'Low Temp Sensitive', 'Adaptive']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="ACTIVATION TEMPERATURE" width="sm">
              <SearchableDropdown
                value={material.foamMemoryActivationTemperature || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryActivationTemperature', selectedValue)}
                options={['Temperature at which foam softens (e.g., 20-25°C, 25-30°C)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="COMPRESSION SET" width="sm">
              <SearchableDropdown
                value={material.foamMemoryCompressionSet || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryCompressionSet', selectedValue)}
                options={['Compression Set % (<5% for quality memory foam)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="RESILIENCE" width="sm">
              <SearchableDropdown
                value={material.foamMemoryResilience || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryResilience', selectedValue)}
                options={['Low Resilience (10-30%) - characteristic of memory foam']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="BREATHABILITY" width="sm">
              <SearchableDropdown
                value={material.foamMemoryBreathability || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryBreathability', selectedValue)}
                options={['Standard', 'Open Cell (breathable)', 'Ventilated (holes)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="INFUSION" width="sm">
              <SearchableDropdown
                value={material.foamMemoryInfusion || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryInfusion', selectedValue)}
                options={['None', 'Gel-Infused', 'Copper-Infused', 'Charcoal-Infused', 'Green Tea', 'Lavender']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="COOLING TECHNOLOGY" width="sm">
              <SearchableDropdown
                value={material.foamMemoryCoolingTechnology || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryCoolingTechnology', selectedValue)}
                options={['Standard', 'Phase Change Material (PCM)', 'Gel Beads', 'Graphite']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="FIRE RETARDANT" width="sm">
              <SearchableDropdown
                value={material.foamMemoryFireRetardant || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryFireRetardant', selectedValue)}
                options={['FR Treated (CFR 1633, TB 117-2013, BS 5852)']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="VOC EMISSIONS" width="sm">
              <SearchableDropdown
                value={material.foamMemoryVocEmissions || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryVocEmissions', selectedValue)}
                options={['Low VOC', 'Ultra-Low VOC', 'CertiPUR-US Certified']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="DENSITY" width="sm">
              <SearchableDropdown
                value={material.foamMemoryDensity || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryDensity', selectedValue)}
                options={['40 kg/m³', '50 kg/m³', '60 kg/m³', '70 kg/m³', '80 kg/m³', '90 kg/m³']}
                placeholder="Select or type"
              />
            </Field>
            <Field label="CERTIFICATION" width="sm">
              <SearchableDropdown
                value={material.foamMemoryCertification || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamMemoryCertification', selectedValue)}
                options={['CertiPUR-US', 'OEKO-TEX', 'Greenguard Gold', 'REACH']}
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

export default FoamMemory;
