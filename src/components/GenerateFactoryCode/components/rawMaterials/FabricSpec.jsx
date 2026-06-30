// FabricSpec — renders the "FABRIC SPECIFICATIONS" block for a raw material of
// type "Fabric" in Step 2 (BOM & WIP).
//
// Pure presentational: all state lives in the GenerateFactoryCode orchestrator
// and arrives via props. Extracted verbatim from Step2.jsx.
//
// Props:
//   material                    the raw-material row being edited
//   actualIndex                 its index in formData.rawMaterials
//   errors                      validation errors map (keyed rawMaterial_<i>_<field>)
//   handleRawMaterialChange     (index, field, value) => void
//   handleProcurementDateChange (index, value) => void
//   todayDate                   min date for the procurement date picker
//   mergeOptions                (builtIn, type, fieldKey, parentKey?) => string[]
//   addCustomOption             (type, fieldKey, parentKey, value) => void
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import SearchableDropdown from '../SearchableDropdown';
import QualityVerificationToggle from '../QualityVerificationToggle';
import {
  getTextileFabricFiberTypes,
  getTextileFabricNames,
  getFabricCompositionOptions,
  getFabricConstructionTypeOptions,
  getFabricWeaveKnitTypeOptions,
  getFabricApprovalOptions,
} from '../../data/textileFabricHelpers';
import { FIBER_CATEGORIES, ORIGINS } from '../../data/advancedFilterData';
import { FABRIC_TESTING_REQUIREMENT_OPTIONS } from './specConstants';

const FabricSpec = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
  handleProcurementDateChange,
  todayDate,
  mergeOptions,
  addCustomOption,
}) => (
  <>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 data-spec-anchor className="text-sm font-semibold text-foreground/90">FABRIC SPECIFICATIONS</h3>
              </div>

              <div className="bg-card rounded-lg border border-border" style={{ padding: '1.25rem' }}>
                {/* Fiber Type and Fabric Name */}
                <div className="flex flex-wrap items-start" style={{ gap: '16px 12px', marginBottom: '1rem' }}>
                  {/* Fiber Type */}
                  <Field label="FIBER TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricFiberType`]}>
                    <SearchableDropdown
                      value={material.fabricFiberType || ''}
                      onChange={(selectedFiberType) => {
                        handleRawMaterialChange(actualIndex, 'fabricFiberType', selectedFiberType);
                        // Clear fabric name when fiber type changes
                        if (selectedFiberType !== material.fabricFiberType) {
                          handleRawMaterialChange(actualIndex, 'fabricName', '');
                        }
                      }}
                      options={mergeOptions(getTextileFabricFiberTypes(), 'Fabric', 'fabricFiberType')}
                      onCustomValue={(val) => addCustomOption('Fabric', 'fabricFiberType', '', val)}
                      placeholder="Select or type Fiber Type"
                      className={errors[`rawMaterial_${actualIndex}_fabricFiberType`] ? 'border-red-600' : ''}
                    />
                  </Field>

                  {/* Fabric Name */}
                  <Field label="FABRIC NAME" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricName`]}>
                    <SearchableDropdown
                      value={material.fabricName || ''}
                      onChange={(selectedFabricName) => {
                        handleRawMaterialChange(actualIndex, 'fabricName', selectedFabricName);
                        // Clear dependent fields when fabric name changes
                        if (selectedFabricName !== material.fabricName) {
                          handleRawMaterialChange(actualIndex, 'fabricComposition', '');
                          handleRawMaterialChange(actualIndex, 'constructionType', '');
                          handleRawMaterialChange(actualIndex, 'weaveKnitType', '');
                          handleRawMaterialChange(actualIndex, 'fabricApproval', []);
                        }
                      }}
                      options={material.fabricFiberType ? mergeOptions(getTextileFabricNames(material.fabricFiberType), 'Fabric', 'fabricName', material.fabricFiberType) : []}
                      onCustomValue={(val) => addCustomOption('Fabric', 'fabricName', material.fabricFiberType, val)}
                      placeholder={material.fabricFiberType ? 'Select or type Fabric Name' : 'Select Fiber Type First'}
                      disabled={!material.fabricFiberType}
                      className={errors[`rawMaterial_${actualIndex}_fabricName`] ? 'border-red-600' : ''}
                    />
                  </Field>

                  {/* Composition */}
                  <Field label="COMPOSITION" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricComposition`]}>
                    <SearchableDropdown
                      value={material.fabricComposition || ''}
                      onChange={(value) => handleRawMaterialChange(actualIndex, 'fabricComposition', value)}
                      options={material.fabricFiberType && material.fabricName
                        ? mergeOptions(getFabricCompositionOptions(material.fabricFiberType, material.fabricName), 'Fabric', 'fabricComposition', `${material.fabricFiberType}|${material.fabricName}`)
                        : []}
                      onCustomValue={(val) => addCustomOption('Fabric', 'fabricComposition', `${material.fabricFiberType}|${material.fabricName}`, val)}
                      placeholder={material.fabricFiberType && material.fabricName ? "Select or type Composition" : "Select Fabric First"}
                      disabled={!material.fabricFiberType || !material.fabricName}
                      className={errors[`rawMaterial_${actualIndex}_fabricComposition`] ? 'border-red-600' : ''}
                    />
                  </Field>

                  {/* GSM */}
                  <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_gsm`]}>
                    <Input
                      type="text"
                      value={material.gsm || ''}
                      onChange={(e) => handleRawMaterialChange(actualIndex, 'gsm', e.target.value)}
                      placeholder="e.g., 90"
                      aria-invalid={!!errors[`rawMaterial_${actualIndex}_gsm`]}
                    />
                  </Field>

                  {/* Surplus */}
                  <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricSurplus`]}>
                    <PercentInput
                        value={material.fabricSurplus || ''}
                      onChange={(e) => handleRawMaterialChange(actualIndex, 'fabricSurplus', e.target.value)}
                      placeholder="e.g., 5"
                      error={!!errors[`rawMaterial_${actualIndex}_fabricSurplus`]}
                    />
                  </Field>

                  {/* Wastage */}
                  <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricWastage`]}>
                    <PercentInput
                      value={material.fabricWastage || ''}
                      onChange={(e) => handleRawMaterialChange(actualIndex, 'fabricWastage', e.target.value)}
                      placeholder="e.g., 3"
                      error={!!errors[`rawMaterial_${actualIndex}_fabricWastage`]}
                    />
                  </Field>

                  {/* Testing Requirements */}
                  <Field label="TESTING REQUIREMENTS" required width="lg" error={errors[`rawMaterial_${actualIndex}_fabricTestingRequirements`]}>
                    <TestingRequirementsInput
                      value={Array.isArray(material.fabricTestingRequirements) ? material.fabricTestingRequirements : (material.fabricTestingRequirements ? [String(material.fabricTestingRequirements).trim()] : [])}
                      onChange={(arr) => handleRawMaterialChange(actualIndex, 'fabricTestingRequirements', arr)}
                      options={FABRIC_TESTING_REQUIREMENT_OPTIONS}
                      placeholder="Select or type Testing Requirements"
                      className={errors[`rawMaterial_${actualIndex}_fabricTestingRequirements`] ? 'border-red-600' : ''}
                      error={!!errors[`rawMaterial_${actualIndex}_fabricTestingRequirements`]}
                    />
                  </Field>

                  {/* Approval */}
                  <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricApproval`]}>
                    <TestingRequirementsInput
                      value={Array.isArray(material.fabricApproval) ? material.fabricApproval : (material.fabricApproval ? [String(material.fabricApproval).trim()] : [])}
                      onChange={(arr) => handleRawMaterialChange(actualIndex, 'fabricApproval', arr)}
                      options={material.fabricFiberType && material.fabricName ? getFabricApprovalOptions(material.fabricFiberType, material.fabricName) : []}
                      placeholder={material.fabricFiberType && material.fabricName ? "Select or type Approval" : "Select Fabric First"}
                      disabled={!material.fabricFiberType || !material.fabricName}
                      className={errors[`rawMaterial_${actualIndex}_fabricApproval`] ? 'border-red-600' : ''}
                      error={!!errors[`rawMaterial_${actualIndex}_fabricApproval`]}
                    />
                  </Field>

                  {/* Remarks */}
                  <Field label="REMARKS" required width="sm" error={errors[`rawMaterial_${actualIndex}_fabricRemarks`]}>
                    <Input
                      type="text"
                      value={material.fabricRemarks || ''}
                      onChange={(e) => handleRawMaterialChange(actualIndex, 'fabricRemarks', e.target.value)}
                      placeholder="Text"
                      aria-invalid={!!errors[`rawMaterial_${actualIndex}_fabricRemarks`]}
                    />
                  </Field>
                </div>

                {/* Show/Hide Advance Spec Button */}
                <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <Button
                    type="button"
                    variant={material.showFabricAdvancedFilter ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRawMaterialChange(actualIndex, 'showFabricAdvancedFilter', !material.showFabricAdvancedFilter)}
                  >
                    Advance Spec
                  </Button>
                </div>

                {/* Advanced Filter UI Table */}
                {material.showFabricAdvancedFilter && (
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                      {/* Construction Type - Searchable dropdown */}
                      <Field label="CONSTRUCTION TYPE" width="sm">
                        <SearchableDropdown
                          value={material.constructionType || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'constructionType', value)}
                          options={material.fabricFiberType && material.fabricName
                            ? mergeOptions(getFabricConstructionTypeOptions(material.fabricFiberType, material.fabricName), 'Fabric', 'constructionType', `${material.fabricFiberType}|${material.fabricName}`)
                            : []}
                          onCustomValue={(val) => addCustomOption('Fabric', 'constructionType', `${material.fabricFiberType}|${material.fabricName}`, val)}
                          placeholder={material.fabricFiberType && material.fabricName ? "Select or type Construction Type" : "Select Fabric First"}
                          disabled={!material.fabricFiberType || !material.fabricName}
                        />
                      </Field>

                      {/* Weave/Knit Type - Searchable dropdown */}
                      <Field label="WEAVE/KNIT TYPE" width="sm">
                        <SearchableDropdown
                          value={material.weaveKnitType || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'weaveKnitType', value)}
                          options={material.fabricFiberType && material.fabricName
                            ? mergeOptions(getFabricWeaveKnitTypeOptions(material.fabricFiberType, material.fabricName), 'Fabric', 'weaveKnitType', `${material.fabricFiberType}|${material.fabricName}`)
                            : []}
                          onCustomValue={(val) => addCustomOption('Fabric', 'weaveKnitType', `${material.fabricFiberType}|${material.fabricName}`, val)}
                          placeholder={material.fabricFiberType && material.fabricName ? "Select or type Weave/Knit Type" : "Select Fabric First"}
                          disabled={!material.fabricFiberType || !material.fabricName}
                        />
                      </Field>

                      {/* Machine Type */}
                      <Field label="MACHINE TYPE" width="sm">
                        <SearchableDropdown
                          value={material.fabricMachineType || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'fabricMachineType', value)}
                          options={['Powerloom', 'Handloom', 'Circular Knitting', 'Flatbed Knitting', 'Warp Knitting', 'Others']}
                          placeholder="Select or type Machine Type"
                        />
                      </Field>

                      {/* Fiber Category - Searchable dropdown */}
                      <Field label="FIBER CATEGORY" width="sm">
                        <SearchableDropdown
                          value={material.fabricFiberCategory || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'fabricFiberCategory', value)}
                          options={FIBER_CATEGORIES}
                          placeholder="Select or type Fiber Category"
                        />
                      </Field>

                      {/* Origin - Searchable dropdown */}
                      <Field label="ORIGIN" width="sm">
                        <SearchableDropdown
                          value={material.fabricOrigin || ''}
                          onChange={(value) => handleRawMaterialChange(actualIndex, 'fabricOrigin', value)}
                          options={ORIGINS}
                          placeholder="Select or type Origin"
                        />
                      </Field>

                      {/* Certification Requirement */}
                      <Field label="CERTIFICATION REQUIREMENT" width="lg" className="col-span-1 md:col-span-2 lg:col-span-2">
                        <Input
                          type="text"
                          value={material.fabricCertifications || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'fabricCertifications', e.target.value)}
                          placeholder="Enter certificate label"
                        />
                      </Field>
                    </div>
                  </div>
                )}
                {/* Quality Verification - after Advance Spec, inside top-border block */}
                <div className="w-full" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <QualityVerificationToggle
                    value={material.qualityVerification}
                    onChange={(value) => handleRawMaterialChange(actualIndex, 'qualityVerification', value)}
                    width="lg"
                    className="mb-3"
                  />
                </div>
                <div className="w-full max-w-sm" style={{ marginTop: '12px' }}>
                  <Field
                    label="PROCUREMENT DATE"
                    required
                    width="sm"
                    error={errors[`rawMaterial_${actualIndex}_procurementDate`]}
                  >
                    <Input
                      type="date"
                      min={todayDate}
                      value={material.procurementDate || ''}
                      aria-invalid={errors[`rawMaterial_${actualIndex}_procurementDate`] ? true : undefined}
                      onChange={(e) => handleProcurementDateChange(actualIndex, e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </div>
  </>
);

export default FabricSpec;
