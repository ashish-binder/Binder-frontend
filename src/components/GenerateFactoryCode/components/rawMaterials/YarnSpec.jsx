// YarnSpec — extracted from Step2.jsx (BOM & WIP). Pure presentational; all
// state lives in the GenerateFactoryCode orchestrator and arrives via props.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { getFiberTypes, getYarnTypes, getYarnDetails, getYarnCompositionOptions, getYarnCountRangeOptions, getYarnDoublingOptions, getYarnPlyOptions, getYarnSpinningMethodOptions, getYarnWindingOptions } from '../../utils/yarnHelpers';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';
import { FIBER_CATEGORIES, ORIGINS } from '../../data/advancedFilterData';
import { YARN_TESTING_REQUIREMENT_OPTIONS } from './specConstants';

const YarnSpec = ({
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
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold text-foreground/90 mb-4">FIBER SPECIFICATIONS</h3>
                <div className="flex flex-wrap items-start" style={{ gap: '16px 12px' }}>
                  {/* Fiber Type Dropdown */}
                  <Field label="FIBER TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_fiberType`]}>
                    <SearchableDropdown
                      value={material.fiberType || ''}
                      onChange={(selectedFiberType) => {
                        handleRawMaterialChange(actualIndex, 'fiberType', selectedFiberType);
                        // Reset yarn type when fiber type changes
                        if (selectedFiberType !== material.fiberType) {
                          handleRawMaterialChange(actualIndex, 'yarnType', '');
                          handleRawMaterialChange(actualIndex, 'spinningMethod', '');
                          handleRawMaterialChange(actualIndex, 'spinningType', '');
                        }
                      }}
                      options={mergeOptions(getFiberTypes(), 'Yarn', 'fiberType')}
                      onCustomValue={(val) => addCustomOption('Yarn', 'fiberType', '', val)}
                      placeholder="Select or type Fiber Type"
                      className={errors[`rawMaterial_${actualIndex}_fiberType`] ? 'border-red-600' : ''}
                    />
                  </Field>
                  
                  {/* Yarn Type Dropdown */}
                  <Field label="YARN TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_yarnType`]}>
                    <SearchableDropdown
                      value={material.yarnType || ''}
                      onChange={(selectedYarnType) => {
                        handleRawMaterialChange(actualIndex, 'yarnType', selectedYarnType);
                        // Clear dependent fields when yarn type changes
                        if (selectedYarnType !== material.yarnType) {
                          handleRawMaterialChange(actualIndex, 'yarnComposition', '');
                          handleRawMaterialChange(actualIndex, 'yarnCountRange', '');
                          handleRawMaterialChange(actualIndex, 'yarnDoublingOptions', '');
                          handleRawMaterialChange(actualIndex, 'yarnPlyOptions', '');
                          handleRawMaterialChange(actualIndex, 'spinningMethod', '');
                          handleRawMaterialChange(actualIndex, 'spinningType', '');
                          handleRawMaterialChange(actualIndex, 'windingOptions', '');
                        }
                      }}
                      options={material.fiberType ? mergeOptions(getYarnTypes(material.fiberType), 'Yarn', 'yarnType', material.fiberType) : []}
                      onCustomValue={(val) => addCustomOption('Yarn', 'yarnType', material.fiberType, val)}
                      placeholder={material.fiberType ? 'Select or type Yarn Type' : 'Select Fiber Type First'}
                      disabled={!material.fiberType}
                      error={Boolean(errors[`rawMaterial_${actualIndex}_yarnType`])}
                      className={errors[`rawMaterial_${actualIndex}_yarnType`] ? 'border-red-600' : ''}
                    />
                  </Field>
                </div>
                
                {/* Display Yarn Details when both Fiber Type and Yarn Type are selected */}
                {material.fiberType && material.yarnType && (() => {
                  const details = getYarnDetails(material.fiberType, material.yarnType);
                  if (!details) return null;
                  
                  return (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                      <h4 data-spec-anchor className="text-sm font-semibold text-foreground/90 mb-6">YARN SPECIFICATIONS</h4>
                      
                      {/* Input Fields Row */}
                      <div className="flex flex-wrap items-start" style={{ gap: '16px 12px' }}>
                        <Field label="COMPOSITION" required width="sm" error={errors[`rawMaterial_${actualIndex}_yarnComposition`]}>
                          <SearchableDropdown
                            value={material.yarnComposition || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'yarnComposition', value)}
                            options={material.fiberType && material.yarnType 
                              ? getYarnCompositionOptions(material.fiberType, material.yarnType)
                              : []}
                            placeholder={material.fiberType && material.yarnType ? "Select or type Composition" : "Select Yarn Type First"}
                            disabled={!material.fiberType || !material.yarnType}
                            className={errors[`rawMaterial_${actualIndex}_yarnComposition`] ? 'border-red-600' : ''}
                          />
                        </Field>
                        
                        <Field label="COUNT RANGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_yarnCountRange`]}>
                          <SearchableDropdown
                            value={material.yarnCountRange || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'yarnCountRange', value)}
                            options={material.fiberType && material.yarnType 
                              ? getYarnCountRangeOptions(material.fiberType, material.yarnType)
                              : []}
                            placeholder={material.fiberType && material.yarnType ? "Select or type Count Range" : "Select Yarn Type First"}
                            disabled={!material.fiberType || !material.yarnType}
                            className={errors[`rawMaterial_${actualIndex}_yarnCountRange`] ? 'border-red-600' : ''}
                          />
                        </Field>
                        
                        <Field label="DOUBLING OPTIONS" required width="sm" error={errors[`rawMaterial_${actualIndex}_yarnDoublingOptions`]}>
                          <SearchableDropdown
                            value={material.yarnDoublingOptions || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'yarnDoublingOptions', value)}
                            options={material.fiberType && material.yarnType 
                              ? getYarnDoublingOptions(material.fiberType, material.yarnType)
                              : []}
                            placeholder={material.fiberType && material.yarnType ? "Select or type Doubling Options" : "Select Yarn Type First"}
                            disabled={!material.fiberType || !material.yarnType}
                            className={errors[`rawMaterial_${actualIndex}_yarnDoublingOptions`] ? 'border-red-600' : ''}
                          />
                        </Field>
                        
                        <Field label="PLY OPTIONS" required width="sm" error={errors[`rawMaterial_${actualIndex}_yarnPlyOptions`]}>
                          <SearchableDropdown
                            value={material.yarnPlyOptions || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'yarnPlyOptions', value)}
                            options={material.fiberType && material.yarnType 
                              ? getYarnPlyOptions(material.fiberType, material.yarnType)
                              : []}
                            placeholder={material.fiberType && material.yarnType ? "Select or type Ply Options" : "Select Yarn Type First"}
                            disabled={!material.fiberType || !material.yarnType}
                            className={errors[`rawMaterial_${actualIndex}_yarnPlyOptions`] ? 'border-red-600' : ''}
                          />
                        </Field>
                        
                        <Field label="COUNT SYSTEM" width="sm">
                          <Input
                            type="text"
                            value={details.countSystem || ''}
                            readOnly
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </Field>
                        
                        <Field label="WINDING OPTIONS" required width="sm" error={errors[`rawMaterial_${actualIndex}_windingOptions`]}>
                          <SearchableDropdown
                            value={material.windingOptions || ''}
                            onChange={(value) => handleRawMaterialChange(actualIndex, 'windingOptions', value)}
                            options={material.fiberType && material.yarnType 
                              ? getYarnWindingOptions(material.fiberType, material.yarnType)
                              : []}
                            placeholder={material.fiberType && material.yarnType ? "Select or type Winding Options" : "Select Yarn Type First"}
                            disabled={!material.fiberType || !material.yarnType}
                            className={errors[`rawMaterial_${actualIndex}_windingOptions`] ? 'border-red-600' : ''}
                          />
                        </Field>
                        
                        <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_surplus`]}>
                          <PercentInput
                              value={material.surplus || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'surplus', e.target.value)}
                            placeholder="e.g., 5"
                            error={!!errors[`rawMaterial_${actualIndex}_surplus`]}
                          />
                        </Field>
                        
                        <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_wastage`]}>
                          <PercentInput
                            value={material.wastage || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'wastage', e.target.value)}
                            placeholder="e.g., 3"
                            error={!!errors[`rawMaterial_${actualIndex}_wastage`]}
                          />
                        </Field>
                        
                        <Field label="TESTING REQUIREMENTS" required width="lg" error={errors[`rawMaterial_${actualIndex}_testingRequirements`]}>
                          <TestingRequirementsInput
                            value={Array.isArray(material.testingRequirements) ? material.testingRequirements : (material.testingRequirements ? [String(material.testingRequirements).trim()] : [])}
                            onChange={(arr) => handleRawMaterialChange(actualIndex, 'testingRequirements', arr)}
                            options={YARN_TESTING_REQUIREMENT_OPTIONS}
                            placeholder="Select or type Testing Requirements"
                            className={errors[`rawMaterial_${actualIndex}_testingRequirements`] ? 'border-red-600' : ''}
                            error={!!errors[`rawMaterial_${actualIndex}_testingRequirements`]}
                          />
                        </Field>
                        
                        <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_approval`]}>
                          <TestingRequirementsInput
                            value={Array.isArray(material.approval) ? material.approval : (material.approval ? [String(material.approval).trim()] : [])}
                            onChange={(arr) => handleRawMaterialChange(actualIndex, 'approval', arr)}
                            options={MATERIAL_APPROVAL_OPTIONS}
                            placeholder="Select or type Approval"
                            className={errors[`rawMaterial_${actualIndex}_approval`] ? 'border-red-600' : ''}
                            error={!!errors[`rawMaterial_${actualIndex}_approval`]}
                          />
                        </Field>
                        
                        <Field label="REMARKS" required width="sm" error={errors[`rawMaterial_${actualIndex}_remarks`]}>
                          <Input
                            type="text"
                            value={material.remarks || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'remarks', e.target.value)}
                            placeholder="Enter remarks"
                            aria-invalid={!!errors[`rawMaterial_${actualIndex}_remarks`]}
                          />
                        </Field>
                      </div>

                      {/* Show/Hide Advance Spec Button */}
                      <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                        <Button
                          type="button"
                          variant={material.showAdvancedFilter ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRawMaterialChange(actualIndex, 'showAdvancedFilter', !material.showAdvancedFilter)}
                        >
                          Advance Spec
                        </Button>
                      </div>
                      
                      {/* Advanced Filter UI Table */}
                      {material.showAdvancedFilter && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                            {/* Spinning Type - Searchable dropdown */}
                            <Field label="SPINNING TYPE" width="sm">
                              <SearchableDropdown
                                value={material.spinningType || material.spinningMethod || ''}
                                onChange={(value) => {
                                  handleRawMaterialChange(actualIndex, 'spinningType', value);
                                  handleRawMaterialChange(actualIndex, 'spinningMethod', value);
                                }}
                                options={material.fiberType && material.yarnType 
                                  ? getYarnSpinningMethodOptions(material.fiberType, material.yarnType)
                                  : []}
                                placeholder={material.fiberType && material.yarnType ? "Select or type Spinning Type" : "Select Yarn Type First"}
                                disabled={!material.fiberType || !material.yarnType}
                              />
                            </Field>
                            
                            {/* Fiber Category - Searchable dropdown */}
                            <Field label="FIBER CATEGORY" width="sm">
                              <SearchableDropdown
                                value={material.fiberCategory || ''}
                                onChange={(value) => handleRawMaterialChange(actualIndex, 'fiberCategory', value)}
                                options={FIBER_CATEGORIES}
                                placeholder="Select or type Fiber Category"
                              />
                            </Field>
                            
                            {/* Origin - Searchable dropdown */}
                            <Field label="ORIGIN" width="sm">
                              <SearchableDropdown
                                value={material.origin || ''}
                                onChange={(value) => handleRawMaterialChange(actualIndex, 'origin', value)}
                                options={ORIGINS}
                                placeholder="Select or type Origin"
                              />
                            </Field>
                            
                            {/* Certification Requirement */}
                            <Field label="CERTIFICATION REQUIREMENT" width="lg" className="col-span-1 md:col-span-2 lg:col-span-2">
                              <Input
                                type="text"
                                value={material.certifications || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'certifications', e.target.value)}
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
                  );
                })()}
              </div>
  </>
);

export default YarnSpec;
