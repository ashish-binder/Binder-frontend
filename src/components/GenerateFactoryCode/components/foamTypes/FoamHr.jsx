// FoamHr — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamHr = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
}) => (
  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                        {/* FOAM TYPE */}
                        <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrType`]}>
                          <SearchableDropdown
                            value={material.foamHrType || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrType', selectedValue)}
                            options={['HR Foam (High Resilience)', 'High Resiliency Foam']}
                            placeholder="Select or type"
                            className={errors[`rawMaterial_${actualIndex}_foamHrType`] ? 'border-red-600' : ''}
                          />
                        </Field>

                        {/* SUBTYPE */}
                        <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrSubtype`]}>
                          <SearchableDropdown
                            value={material.foamHrSubtype || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrSubtype', selectedValue)}
                            options={['Virgin HR', 'Super HR', 'CME (Combustion Modified)']}
                            placeholder="Select or type"
                            className={errors[`rawMaterial_${actualIndex}_foamHrSubtype`] ? 'border-red-600' : ''}
                          />
                        </Field>

                        {/* GRADE */}
                        <Field label="GRADE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrGrade`]}>
                          <SearchableDropdown
                            value={material.foamHrGrade || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrGrade', selectedValue)}
                            options={['HR 35', 'HR 40', 'HR 45', 'HR 50']}
                            placeholder="Select or type"
                            className={errors[`rawMaterial_${actualIndex}_foamHrGrade`] ? 'border-red-600' : ''}
                          />
                        </Field>

                        {/* COLOUR */}
                        <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrColour`]}>
                          <SearchableDropdown
                            value={material.foamHrColour || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrColour', selectedValue)}
                            options={['White', 'Off-White', 'Pink', 'Blue', 'Grey']}
                            placeholder="Select or type"
                            className={errors[`rawMaterial_${actualIndex}_foamHrColour`] ? 'border-red-600' : ''}
                          />
                        </Field>

                        {/* THICKNESS */}
                        <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrThickness`]}>
                          <Input
                            type="text"
                            value={material.foamHrThickness || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrThickness', e.target.value)}
                            placeholder="MM"
                            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrThickness`])}
                          />
                        </Field>

                        {/* SHAPE */}
                        <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrShape`]}>
                          <Input
                            type="text"
                            value={material.foamHrShape || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrShape', e.target.value)}
                            placeholder="TEXT"
                            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrShape`])}
                          />
                        </Field>

                        {/* UPLOAD REF IMAGE */}
                        <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrShapeRefImage`]}>
                          <input
                            type="file"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamHrShapeRefImage', f); }}
                            className="hidden"
                            id={`upload-hr-foam-shape-${actualIndex}`}
                            accept="image/*"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamHrShapeRefImage`] ? 'border-red-600' : ''}`}
                            onClick={() => document.getElementById(`upload-hr-foam-shape-${actualIndex}`)?.click()}
                          >
                            {material.foamHrShapeRefImage ? 'UPLOADED' : 'UPLOAD REF IMAGE'}
                          </Button>
                        </Field>
                        {/* SIZE SPEC */}
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                          <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                            <Field label="SHEET/PCS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrSheetPcs`]}>
                              <Input
                                type="text"
                                value={material.foamHrSheetPcs || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrSheetPcs', e.target.value)}
                                placeholder="Enter value"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrSheetPcs`])}
                              />
                            </Field>
                            <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrGsm`]}>
                              <Input
                                type="text"
                                value={material.foamHrGsm || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrGsm', e.target.value)}
                                placeholder="Enter value"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrGsm`])}
                              />
                            </Field>
                            <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrLengthCm`]}>
                              <Input
                                type="text"
                                value={material.foamHrLengthCm || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrLengthCm', e.target.value)}
                                placeholder="Enter value"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrLengthCm`])}
                              />
                            </Field>
                            <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrWidthCm`]}>
                              <Input
                                type="text"
                                value={material.foamHrWidthCm || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrWidthCm', e.target.value)}
                                placeholder="Enter value"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrWidthCm`])}
                              />
                            </Field>
                          </div>
                        </div>

                        {/* QTY - KGS and YARDAGE */}
                        <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                          <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                            <Field label="KGS (CNS)" width="sm">
                              <Input
                                type="text"
                                value={material.foamHrKgsCns || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrKgsCns', e.target.value)}
                                placeholder="Enter value"
                              />
                            </Field>
                            <Field label="YARDAGE (CNS)" width="sm">
                              <Input
                                type="text"
                                value={material.foamHrYardageCns || ''}
                                onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrYardageCns', e.target.value)}
                                placeholder="Enter value"
                              />
                            </Field>
                          </div>
                        </div>
                        {/* TESTING / SURPLUS / WASTAGE / APPROVAL / REMARKS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
                          {/* TESTING REQ. */}
                          <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamHrTestingRequirements`]}>
                            <TestingRequirementsInput
                              value={material.foamHrTestingRequirements || []}
                              onChange={(values) => handleRawMaterialChange(actualIndex, 'foamHrTestingRequirements', values)}
                              options={['Density', 'ILD', 'Support Factor', 'Resilience (>60%)', 'Fatigue Test']}
                              placeholder="Type to search or select testing requirements..."
                              error={Boolean(errors[`rawMaterial_${actualIndex}_foamHrTestingRequirements`])}
                            />
                          </Field>

                          {/* SURPLUS % */}
                          <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrSurplus`]}>
                            <PercentInput
                              value={material.foamHrSurplus || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrSurplus', e.target.value)}
                              placeholder="e.g., 3-5"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_foamHrSurplus`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrWastage`]}>
                            <div className="relative">
                              <SearchableDropdown
                                value={material.foamHrWastage || ''}
                                onChange={(selectedValue) => {
                                  const predefinedOptions = ['Premium Mattress', 'Automotive Seating', 'High-End Cushions'];
                                  if (predefinedOptions.includes(selectedValue)) {
                                    handleRawMaterialChange(actualIndex, 'foamHrWastage', selectedValue);
                                  } else {
                                    const numericValue = selectedValue.replace(/[^0-9.]/g, '');
                                    handleRawMaterialChange(actualIndex, 'foamHrWastage', numericValue);
                                  }
                                }}
                                options={['Premium Mattress', 'Automotive Seating', 'High-End Cushions']}
                                placeholder="Select or type %"
                                className={`${material.foamHrWastage && !['Premium Mattress', 'Automotive Seating', 'High-End Cushions'].includes(material.foamHrWastage) ? 'pr-10' : ''} ${errors[`rawMaterial_${actualIndex}_foamHrWastage`] ? 'border-red-600' : ''}`}
                              />
                              {material.foamHrWastage && !['Premium Mattress', 'Automotive Seating', 'High-End Cushions'].includes(material.foamHrWastage) && (
                                <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>%</span>
                              )}
                            </div>
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamHrApproval`]}>
                            <SearchableDropdown
                              value={material.foamHrApproval || ''}
                              onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrApproval', selectedValue)}
                              options={MATERIAL_APPROVAL_OPTIONS}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_foamHrApproval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamHrRemarks`]}>
                            <Input
                              type="text"
                              value={material.foamHrRemarks || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamHrRemarks', e.target.value)}
                              placeholder="Resilience >60% is true HR, Better durability than conventional PU, CME for inherent FR"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamHrRemarks`])}
                            />
                          </Field>
                        </div>
                        {/* Show/Hide Advance Spec Button */}
                        <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                          <Button
                            type="button"
                            variant={material.showFoamHrAdvancedSpec ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRawMaterialChange(actualIndex, 'showFoamHrAdvancedSpec', !material.showFoamHrAdvancedSpec)}
                          >
                            Advance Spec
                          </Button>
                        </div>

                        {/* Advanced Filter UI Table */}
                        {material.showFoamHrAdvancedSpec && (
                          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                              <Field label="ILD / IFD (Firmness)" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrIld || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrIld', selectedValue)}
                                  options={['ILD rating (e.g., 25, 30, 35, 40, 45)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="SUPPORT FACTOR" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrSupportFactor || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrSupportFactor', selectedValue)}
                                  options={['Support Factor (2.4-2.8+ for HR foam)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="RESILIENCE" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrResilience || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrResilience', selectedValue)}
                                  options={['Resilience % (>60% for true HR foam, often 65-75%)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="COMPRESSION SET" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrCompressionSet || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrCompressionSet', selectedValue)}
                                  options={['Compression Set % (<5% for quality HR)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="TENSILE STRENGTH" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrTensileStrength || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrTensileStrength', selectedValue)}
                                  options={['Tensile Strength (kPa) - higher for HR']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="ELONGATION" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrElongation || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrElongation', selectedValue)}
                                  options={['Elongation at Break (%)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="FATIGUE RESISTANCE" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrFatigueResistance || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrFatigueResistance', selectedValue)}
                                  options={['Fatigue Test (>80% height retention after 80,000 cycles)']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="FIRE RETARDANT" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrFireRetardant || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrFireRetardant', selectedValue)}
                                  options={['Standard', 'CME (Combustion Modified)', 'FR Treated']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="CERTIFICATION" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrCertification || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrCertification', selectedValue)}
                                  options={['CertiPUR-US', 'OEKO-TEX', 'Greenguard']}
                                  placeholder="Select or type"
                                />
                              </Field>
                              <Field label="DENSITY" width="sm">
                                <SearchableDropdown
                                  value={material.foamHrDensity || ''}
                                  onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamHrDensity', selectedValue)}
                                  options={['35 kg/m³', '40 kg/m³', '45 kg/m³', '50 kg/m³', '55 kg/m³']}
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

export default FoamHr;
