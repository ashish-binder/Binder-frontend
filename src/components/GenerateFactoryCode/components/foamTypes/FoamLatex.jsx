// FoamLatex — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamLatex = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
      {/* FOAM TYPE */}
      <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexType`]}>
        <SearchableDropdown
          value={material.foamLatexType || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexType', selectedValue)}
          options={['Latex Foam']}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamLatexType`] ? 'border-red-600' : ''}
        />
      </Field>

    {/* LATEX TYPE */}
    <Field label="LATEX TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexLatexType`]}>
      <SearchableDropdown
        value={material.foamLatexLatexType || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexLatexType', selectedValue)}
        options={['Natural Latex (NR)', 'Synthetic Latex (SBR)', 'Blended (NR+SBR)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamLatexLatexType`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* NATURAL CONTENT */}
    <Field label="NATURAL CONTENT" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexNaturalContent`]}>
      <SearchableDropdown
        value={material.foamLatexNaturalContent || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexNaturalContent', selectedValue)}
        options={['100% Natural', '95% Natural', '85% Natural', 'Blended (varies)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamLatexNaturalContent`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* PROCESS */}
    <Field label="PROCESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexProcess`]}>
      <SearchableDropdown
        value={material.foamLatexProcess || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexProcess', selectedValue)}
        options={['Dunlop Process', 'Talalay Process']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamLatexProcess`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* SUBTYPE */}
    <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexSubtype`]}>
      <SearchableDropdown
        value={material.foamLatexSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexSubtype', selectedValue)}
        options={['Virgin', 'Organic Certified']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamLatexSubtype`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* COLOUR */}
    <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexColour`]}>
      <SearchableDropdown
        value={material.foamLatexColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexColour', selectedValue)}
        options={['Natural (cream/off-white)', 'White (bleached/synthetic)']}
        placeholder="Select or type"
        className={errors[`rawMaterial_${actualIndex}_foamLatexColour`] ? 'border-red-600' : ''}
      />
    </Field>

    {/* THICKNESS */}
    <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexThickness`]}>
      <Input
        type="text"
        value={material.foamLatexThickness || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexThickness', e.target.value)}
        placeholder="MM (e.g., 2, 3, 4, 6, 8)"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexThickness`])}
      />
    </Field>

    {/* SHAPE */}
    <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexShape`]}>
      <Input
        type="text"
        value={material.foamLatexShape || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexShape', e.target.value)}
        placeholder="TEXT"
        aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexShape`])}
      />
    </Field>

    {/* UPLOAD REF IMAGE */}
    <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexShapeRefImage`]}>
      <input
        type="file"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamLatexShapeRefImage', f); }}
        className="hidden"
        id={`upload-latex-foam-shape-${actualIndex}`}
        accept="image/*"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamLatexShapeRefImage`] ? 'border-red-600' : ''}`}
        onClick={() => document.getElementById(`upload-latex-foam-shape-${actualIndex}`)?.click()}
      >
        {material.foamLatexShapeRefImage ? 'UPLOADED' : 'UPLOAD'}
      </Button>
    </Field>

    {/* SIZE SPEC */}
    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="SHEET/PCS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexSheetPcs`]}>
          <Input
            type="text"
            value={material.foamLatexSheetPcs || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexSheetPcs', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexSheetPcs`])}
          />
        </Field>
        <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexGsm`]}>
          <Input
            type="text"
            value={material.foamLatexGsm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexGsm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexGsm`])}
          />
        </Field>
        <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexLengthCm`]}>
          <Input
            type="text"
            value={material.foamLatexLengthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexLengthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexLengthCm`])}
          />
        </Field>
        <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexWidthCm`]}>
          <Input
            type="text"
            value={material.foamLatexWidthCm || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexWidthCm', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexWidthCm`])}
          />
        </Field>
      </div>
    </div>

    {/* QTY - KGS and YARDAGE */}
    <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
        <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexKgsCns`]}>
          <Input
            type="text"
            value={material.foamLatexKgsCns || ''}
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexKgsCns`])}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexKgsCns', e.target.value)}
            placeholder="Enter value"
          />
        </Field>
        <Field label="YARDAGE (CNS)" width="sm">
          <Input
            type="text"
            value={material.foamLatexYardageCns || ''}
            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexYardageCns', e.target.value)}
            placeholder="Enter value"
            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexYardageCns`])}
          />
        </Field>
      </div>
    </div>

    {/* TESTING / SURPLUS / WASTAGE / APPROVAL / REMARKS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
      {/* TESTING REQ. */}
      <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamLatexTestingRequirements`]}>
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <div className="flex-1">
            <TestingRequirementsInput
              value={material.foamLatexTestingRequirements || []}
              onChange={(values) => handleRawMaterialChange(actualIndex, 'foamLatexTestingRequirements', values)}
              options={['Density', 'ILD', 'Resilience', 'Natural Content %', 'GOLS Certification']}
              placeholder="Type to search or select testing requirements..."
              error={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexTestingRequirements`])}
            />
          </div>
          <input
            type="file"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamLatexTestingRequirementsFile', f); }}
            className="hidden"
            id={`upload-latex-testing-${actualIndex}`}
            accept="image/*"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamLatexTestingRequirementsFile`] ? 'border-red-600' : ''}`}
            onClick={() => document.getElementById(`upload-latex-testing-${actualIndex}`)?.click()}
          >
            {material.foamLatexTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
          </Button>
        </div>
      </Field>

      {/* SURPLUS % */}
      <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexSurplus`]}>
        <PercentInput
          value={material.foamLatexSurplus || ''}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9.]/g, '');
            handleRawMaterialChange(actualIndex, 'foamLatexSurplus', numericValue);
          }}
          placeholder="e.g., 2-5"
          error={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexSurplus`])}
        />
      </Field>

      {/* WASTAGE % */}
      <Field label="WASTAGE %" width="sm">
        <div className="relative">
          <SearchableDropdown
            value={material.foamLatexWastage || ''}
            onChange={(selectedValue) => {
              const predefinedOptions = ['Luxury Mattress', 'Organic Bedding', 'Premium Pillows'];
              if (predefinedOptions.includes(selectedValue)) {
                handleRawMaterialChange(actualIndex, 'foamLatexWastage', selectedValue);
              } else {
                const numericValue = selectedValue.replace(/[^0-9.]/g, '');
                handleRawMaterialChange(actualIndex, 'foamLatexWastage', numericValue);
              }
            }}
            options={['Luxury Mattress', 'Organic Bedding', 'Premium Pillows']}
            placeholder="Select or type %"
            className={
              material.foamLatexWastage && !['Luxury Mattress', 'Organic Bedding', 'Premium Pillows'].includes(material.foamLatexWastage)
                ? 'pr-10'
                : ''
            }
          />
          {material.foamLatexWastage &&
            !['Luxury Mattress', 'Organic Bedding', 'Premium Pillows'].includes(material.foamLatexWastage) && (
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
      <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLatexApproval`]}>
        <SearchableDropdown
          value={material.foamLatexApproval || ''}
          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexApproval', selectedValue)}
          options={MATERIAL_APPROVAL_OPTIONS}
          placeholder="Select or type"
          className={errors[`rawMaterial_${actualIndex}_foamLatexApproval`] ? 'border-red-600' : ''}
        />
      </Field>

      {/* REMARKS */}
      <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamLatexRemarks`]}>
        <Input
          type="text"
          value={material.foamLatexRemarks || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLatexRemarks', e.target.value)}
          placeholder="Dunlop=denser, Talalay=softer/consistent, GOLS for organic claims, 7-zone for ergonomic"
          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLatexRemarks`])}
        />
      </Field>
    </div>

    {/* Advance Spec Button */}
    <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
      <Button
        type="button"
        variant={material.showFoamLatexAdvancedSpec ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRawMaterialChange(actualIndex, 'showFoamLatexAdvancedSpec', !material.showFoamLatexAdvancedSpec)}
      >
        Advance Spec
      </Button>
    </div>

    {/* Advanced Filter UI Table */}
    {material.showFoamLatexAdvancedSpec && (
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
              value={material.foamLatexIld || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexIld', selectedValue)}
              options={['ILD rating (e.g., 14-19 Soft, 20-28 Medium, 29-36 Firm, 37+ Extra Firm)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="RESILIENCE" width="sm">
            <SearchableDropdown
              value={material.foamLatexResilience || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexResilience', selectedValue)}
              options={['Resilience % (typically 60-75% for latex)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="COMPRESSION SET" width="sm">
            <SearchableDropdown
              value={material.foamLatexCompressionSet || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexCompressionSet', selectedValue)}
              options={['Compression Set % (<3% for quality latex)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="PINCORE PATTERN" width="sm">
            <SearchableDropdown
              value={material.foamLatexPincorePattern || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexPincorePattern', selectedValue)}
              options={['Standard Pincore', 'Zoned (different firmness zones)', 'Solid']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="ZONE CONFIGURATION" width="sm">
            <SearchableDropdown
              value={material.foamLatexZoneConfiguration || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexZoneConfiguration', selectedValue)}
              options={['Single Zone', '3-Zone', '5-Zone', '7-Zone (varying firmness)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="BREATHABILITY" width="sm">
            <SearchableDropdown
              value={material.foamLatexBreathability || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexBreathability', selectedValue)}
              options={['Excellent (natural pincore holes)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="HYPOALLERGENIC" width="sm">
            <SearchableDropdown
              value={material.foamLatexHypoallergenic || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexHypoallergenic', selectedValue)}
              options={['Naturally Hypoallergenic', 'Anti-Dust Mite']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="ANTI-MICROBIAL" width="sm">
            <SearchableDropdown
              value={material.foamLatexAntiMicrobial || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexAntiMicrobial', selectedValue)}
              options={['Naturally Anti-Microbial (latex property)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="FIRE RETARDANT" width="sm">
            <SearchableDropdown
              value={material.foamLatexFireRetardant || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexFireRetardant', selectedValue)}
              options={['Natural (self-extinguishing)', 'FR Treated', 'Wrapped with FR Barrier']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="CERTIFICATION" width="sm">
            <SearchableDropdown
              value={material.foamLatexCertification || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexCertification', selectedValue)}
              options={['GOLS (Global Organic Latex Standard)', 'OEKO-TEX', 'Eco-Institut', 'GOTS (if organic cotton cover)']}
              placeholder="Select or type"
            />
          </Field>
          <Field label="DENSITY" width="sm">
            <SearchableDropdown
              value={material.foamLatexDensity || ''}
              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamLatexDensity', selectedValue)}
              options={['60 kg/m³', '65 kg/m³', '70 kg/m³', '75 kg/m³', '85 kg/m³']}
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

export default FoamLatex;
