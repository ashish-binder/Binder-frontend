// FoamEva — extracted from FoamSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PercentInput } from '@/components/ui/percent-input';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FoamEva = ({
  material,
  actualIndex,
  errors,
  handleRawMaterialChange,
  mergeOptions,
  addCustomOption,
}) => (
  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                      {/* FOAM TYPE */}
                      <Field label="FOAM TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamType`]}>
                        <SearchableDropdown
                          value={material.foamType || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamType', selectedValue)}
                          options={mergeOptions(['EVA Foam (Ethylene Vinyl Acetate)'], 'Foam', 'foamType')}
                          onCustomValue={(val) => addCustomOption('Foam', 'foamType', '', val)}
                          placeholder="Select or type"
                          className={errors[`rawMaterial_${actualIndex}_foamType`] ? 'border-red-600' : ''}
                        />
                      </Field>

                      {/* SUBTYPE */}
                      <Field label="SUBTYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamSubtype`]}>
                        <SearchableDropdown
                          value={material.foamSubtype || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamSubtype', selectedValue)}
                          options={mergeOptions(['Virgin EVA', 'Recycled EVA', 'Blended'], 'Foam', 'foamSubtype', material.foamType || '')}
                          onCustomValue={(val) => addCustomOption('Foam', 'foamSubtype', material.foamType || '', val)}
                          placeholder="Select or type"
                          className={errors[`rawMaterial_${actualIndex}_foamSubtype`] ? 'border-red-600' : ''}
                        />
                      </Field>

                      {/* VA CONTENT */}
                      <Field label="VA CONTENT" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamVaContent`]}>
                        <SearchableDropdown
                          value={material.foamVaContent || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamVaContent', selectedValue)}
                          options={['18%', '25%', '28%', '33%']}
                          placeholder="Select or type"
                          className={errors[`rawMaterial_${actualIndex}_foamVaContent`] ? 'border-red-600' : ''}
                        />
                      </Field>

                      {/* COLOUR */}
                      <Field label="COLOUR" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamColour`]}>
                        <SearchableDropdown
                          value={material.foamColour || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamColour', selectedValue)}
                          options={['Black', 'White', 'Grey', 'Red', 'Blue', 'Green', 'Custom']}
                          placeholder="Select or type"
                          className={errors[`rawMaterial_${actualIndex}_foamColour`] ? 'border-red-600' : ''}
                        />
                      </Field>

                      {/* THICKNESS */}
                      <Field label="THICKNESS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamThickness`]}>
                        <SearchableDropdown
                          value={material.foamThickness || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamThickness', selectedValue)}
                          options={['2mm', '3mm', '5mm', '10mm', '15mm', '20mm', '25mm']}
                          placeholder="Select or type"
                          className={errors[`rawMaterial_${actualIndex}_foamThickness`] ? 'border-red-600' : ''}
                        />
                      </Field>

                      {/* SHAPE */}
                      <Field label="SHAPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamShape`]}>
                        <Input
                          type="text"
                          value={material.foamShape || ''}
                          onChange={(e) => handleRawMaterialChange(actualIndex, 'foamShape', e.target.value)}
                          placeholder="TEXT"
                          aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamShape`])}
                        />
                      </Field>

                      {/* UPLOAD REF IMAGE */}
                      <Field label="UPLOAD REF IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamShapeRefImage`]}>
                        <input
                          type="file"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamShapeRefImage', f); }}
                          className="hidden"
                          id={`upload-foam-shape-${actualIndex}`}
                          accept="image/*"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_foamShapeRefImage`] ? 'border-red-600' : ''}`}
                          onClick={() => document.getElementById(`upload-foam-shape-${actualIndex}`)?.click()}
                        >
                          {material.foamShapeRefImage ? 'UPLOADED' : 'UPLOAD REF IMAGE'}
                        </Button>
                      </Field>

                      {/* SIZE SPEC */}
                      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                        <h4 className="text-sm font-semibold text-foreground/90 mb-4">SIZE SPEC</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                          <Field label="SHEET/PCS" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamSheetPcs`]}>
                            <Input
                              type="text"
                              value={material.foamSheetPcs || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamSheetPcs', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamSheetPcs`])}
                            />
                          </Field>
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamGsm`]}>
                            <Input
                              type="text"
                              value={material.foamGsm || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamGsm', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamGsm`])}/>
                          </Field>
                          <Field label="LENGTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamLengthCm`]}>
                            <Input
                              type="text"
                              value={material.foamLengthCm || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamLengthCm', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamLengthCm`])}
                            />
                          </Field>
                          <Field label="WIDTH (CM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamWidthCm`]}>
                            <Input
                              type="text"
                              value={material.foamWidthCm || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamWidthCm', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamWidthCm`])}
                            />
                          </Field>
                        </div>
                      </div>

                      {/* QTY - KGS and YARDAGE */}
                      <div style={{ marginTop: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                        <h4 className="text-sm font-semibold text-foreground/90 mb-4">QTY</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: '16px 12px' }}>
                          <Field label="KGS (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamKgsCns`]}>
                            <Input
                              type="text"
                              value={material.foamKgsCns || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamKgsCns', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamKgsCns`])}
                            />
                          </Field>
                          <Field label="YARDAGE (CNS)" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamYardageCns`]}>
                            <Input
                              type="text"
                              value={material.foamYardageCns || ''}
                              onChange={(e) => handleRawMaterialChange(actualIndex, 'foamYardageCns', e.target.value)}
                              placeholder="Enter value"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamYardageCns`])}
                            />
                          </Field>
                        </div>
                      </div>

                      {/* TESTING REQUIREMENTS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 col-span-1 md:col-span-2 lg:col-span-5" style={{ gap: '16px 12px', marginTop: '1.25rem' }}>
                        <Field label="TESTING REQ." required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamTestingRequirements`]}>
                          <div className="flex items-center" style={{ gap: '0.75rem' }}>
                            <div className="flex-1">
                              <TestingRequirementsInput
                                value={material.foamTestingRequirements || []}
                                onChange={(values) => handleRawMaterialChange(actualIndex, 'foamTestingRequirements', values)}
                                options={['Density', 'Shore Hardness', 'Compression Set', 'Tensile Strength']}
                                placeholder="Type to search or select testing requirements..."
                                error={Boolean(errors[`rawMaterial_${actualIndex}_foamTestingRequirements`])}
                              />
                            </div>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRawMaterialChange(actualIndex, 'foamTestingRequirementsFile', f); }}
                              className="hidden"
                              id={`upload-foam-testing-${actualIndex}`}
                              accept="image/*"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 ${errors[`rawMaterial_${actualIndex}_foamTestingRequirementsFile`] ? 'border-red-600' : ''}`}
                              onClick={() => document.getElementById(`upload-foam-testing-${actualIndex}`)?.click()}
                            >
                              {material.foamTestingRequirementsFile ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </div>
                        </Field>

                        {/* SURPLUS % */}
                        <Field label="SURPLUS %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamSurplus`]}>
                          <PercentInput
                            value={material.foamSurplus || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamSurplus', e.target.value)}
                            placeholder="e.g., 3-5"
                            error={Boolean(errors[`rawMaterial_${actualIndex}_foamSurplus`])}
                          />
                        </Field>

                        {/* WASTAGE % */}
                        <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamWastage`]}>
                          <div className="relative">
                            <SearchableDropdown
                              value={material.foamWastage || ''}
                              onChange={(selectedValue) => {
                                const predefinedOptions = ['Yoga Mats', 'Packaging', 'Insoles', 'Craft', 'Protective Cases'];
                                if (predefinedOptions.includes(selectedValue)) {
                                  handleRawMaterialChange(actualIndex, 'foamWastage', selectedValue);
                                } else {
                                  const numericValue = selectedValue.replace(/[^0-9.]/g, '');
                                  handleRawMaterialChange(actualIndex, 'foamWastage', numericValue);
                                }
                              }}
                              options={['Yoga Mats', 'Packaging', 'Insoles', 'Craft', 'Protective Cases']}
                              placeholder="Select or type %"
                              className={`${material.foamWastage && !['Yoga Mats', 'Packaging', 'Insoles', 'Craft', 'Protective Cases'].includes(material.foamWastage) ? 'pr-10' : ''} ${errors[`rawMaterial_${actualIndex}_foamWastage`] ? 'border-red-600' : ''}`}
                            />
                            {material.foamWastage && !['Yoga Mats', 'Packaging', 'Insoles', 'Craft', 'Protective Cases'].includes(material.foamWastage) && (
                              <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>%</span>
                            )}
                          </div>
                        </Field>

                        {/* APPROVAL */}
                        <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_foamApproval`]}>
                          <SearchableDropdown
                            value={material.foamApproval || ''}
                            onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamApproval', selectedValue)}
                            options={MATERIAL_APPROVAL_OPTIONS}
                            placeholder="Select or type"
                            className={errors[`rawMaterial_${actualIndex}_foamApproval`] ? 'border-red-600' : ''}
                          />
                        </Field>

                        {/* REMARKS */}
                        <Field label="REMARKS" required width="sm" className="col-span-1 md:col-span-2 lg:col-span-5" error={errors[`rawMaterial_${actualIndex}_foamRemarks`]}>
                          <Input
                            type="text"
                            value={material.foamRemarks || ''}
                            onChange={(e) => handleRawMaterialChange(actualIndex, 'foamRemarks', e.target.value)}
                            placeholder="Higher VA%=softer, Interlocking for gym flooring, Closed cell=waterproof"
                            aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_foamRemarks`])}
                          />
                        </Field>
                      </div>

                      {/* Show/Hide Advance Spec Button */}
                      <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                        <Button
                          type="button"
                          variant={material.showFoamAdvancedSpec ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleRawMaterialChange(actualIndex, 'showFoamAdvancedSpec', !material.showFoamAdvancedSpec)}
                        >
                          Advance Spec
                        </Button>
                      </div>

                      {/* Advanced Filter UI Table */}
                      {material.showFoamAdvancedSpec && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: '0.75rem', border: '1px solid var(--border)' }} className="col-span-1 md:col-span-2 lg:col-span-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                            <Field label="SHORE HARDNESS" width="sm">
                              <SearchableDropdown
                                value={material.foamShoreHardness || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamShoreHardness', selectedValue)}
                                options={['25A Soft', '35A Medium', '45A Firm', '55A+ Hard']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="CELL STRUCTURE" width="sm">
                              <SearchableDropdown
                                value={material.foamCellStructure || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamCellStructure', selectedValue)}
                                options={['Closed Cell']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="COMPRESSION SET" width="sm">
                              <SearchableDropdown
                                value={material.foamCompressionSet || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamCompressionSet', selectedValue)}
                                options={['Compression Set %']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="TENSILE STRENGTH" width="sm">
                              <SearchableDropdown
                                value={material.foamTensileStrength || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamTensileStrength', selectedValue)}
                                options={['Tensile Strength (MPa)']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="ELONGATION" width="sm">
                              <SearchableDropdown
                                value={material.foamElongation || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamElongation', selectedValue)}
                                options={['Elongation at Break (%)']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="WATER RESISTANCE" width="sm">
                              <SearchableDropdown
                                value={material.foamWaterResistance || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamWaterResistance', selectedValue)}
                                options={['Excellent']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="UV RESISTANCE" width="sm">
                              <SearchableDropdown
                                value={material.foamUvResistance || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamUvResistance', selectedValue)}
                                options={['Standard', 'UV Stabilized']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="FIRE RETARDANT" width="sm">
                              <SearchableDropdown
                                value={material.foamFireRetardant || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamFireRetardant', selectedValue)}
                                options={['Standard', 'FR Treated']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="SURFACE TEXTURE" width="sm">
                              <SearchableDropdown
                                value={material.foamSurfaceTexture || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamSurfaceTexture', selectedValue)}
                                options={['Smooth', 'Textured (anti-slip)', 'Fabric Laminated', 'Leather-Look']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="ANTI-SLIP" width="sm">
                              <SearchableDropdown
                                value={material.foamAntiSlip || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamAntiSlip', selectedValue)}
                                options={['Standard', 'Anti-Slip Surface Treatment']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="INTERLOCKING" width="sm">
                              <SearchableDropdown
                                value={material.foamInterlocking || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamInterlocking', selectedValue)}
                                options={['None', 'Interlocking Edges (puzzle pattern)']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="CERTIFICATION" width="sm">
                              <SearchableDropdown
                                value={material.foamCertification || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamCertification', selectedValue)}
                                options={['REACH Compliant', 'Phthalate-Free', 'OEKO-TEX']}
                                placeholder="Select or type"
                              />
                            </Field>
                            <Field label="DENSITY" width="sm">
                              <SearchableDropdown
                                value={material.foamDensity || ''}
                                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'foamDensity', selectedValue)}
                                options={['30 kg/m³', '45 kg/m³', '60 kg/m³', '90 kg/m³', '120 kg/m³']}
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

export default FoamEva;
