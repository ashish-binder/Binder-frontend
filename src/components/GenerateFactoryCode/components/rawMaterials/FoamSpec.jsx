// FoamSpec — extracted from Step2.jsx (BOM & WIP). Pure presentational; all
// state lives in the GenerateFactoryCode orchestrator and arrives via props.
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import SearchableDropdown from '../SearchableDropdown';
// Foam table-type spec blocks (one file each)
import FoamEva from '../foamTypes/FoamEva';
import FoamPeEpe from '../foamTypes/FoamPeEpe';
import FoamPu from '../foamTypes/FoamPu';
import FoamRebonded from '../foamTypes/FoamRebonded';
import FoamGelInfused from '../foamTypes/FoamGelInfused';
import FoamLatex from '../foamTypes/FoamLatex';
import FoamMemory from '../foamTypes/FoamMemory';
import FoamHr from '../foamTypes/FoamHr';

const FoamSpec = ({
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
                <div style={{ marginTop: '32px' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 data-spec-anchor className="text-sm font-semibold text-foreground/90">FOAM SPECIFICATIONS</h3>
                  </div>
                  
                  <div className="bg-card rounded-lg border border-border" style={{ padding: '1.25rem' }}>
                    {/* Table Selection Dropdown */}
                    <Field label="SELECT FOAM TYPE" required width="sm" style={{ marginBottom: '1.5rem' }} error={errors[`rawMaterial_${actualIndex}_foamTableType`]}>
                      <SearchableDropdown
                        value={material.foamTableType || ''}
                        onChange={(selectedValue) => {
                          handleRawMaterialChange(actualIndex, 'foamTableType', selectedValue);
                          // Clear all foam fields when table changes
                          if (selectedValue !== material.foamTableType) {
                            handleRawMaterialChange(actualIndex, 'foamType', '');
                            handleRawMaterialChange(actualIndex, 'foamSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamVaContent', '');
                            handleRawMaterialChange(actualIndex, 'foamColour', '');
                            handleRawMaterialChange(actualIndex, 'foamThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamShape', '');
                            handleRawMaterialChange(actualIndex, 'foamShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamShoreHardness', '');
                            handleRawMaterialChange(actualIndex, 'foamCellStructure', '');
                            handleRawMaterialChange(actualIndex, 'foamCompressionSet', '');
                            handleRawMaterialChange(actualIndex, 'foamTensileStrength', '');
                            handleRawMaterialChange(actualIndex, 'foamElongation', '');
                            handleRawMaterialChange(actualIndex, 'foamWaterResistance', '');
                            handleRawMaterialChange(actualIndex, 'foamUvResistance', '');
                            handleRawMaterialChange(actualIndex, 'foamFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamSurfaceTexture', '');
                            handleRawMaterialChange(actualIndex, 'foamAntiSlip', '');
                            handleRawMaterialChange(actualIndex, 'foamInterlocking', '');
                            handleRawMaterialChange(actualIndex, 'foamCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamHrGrade', '');
                            handleRawMaterialChange(actualIndex, 'foamHrIld', '');
                            handleRawMaterialChange(actualIndex, 'foamHrSupportFactor', '');
                            handleRawMaterialChange(actualIndex, 'foamHrResilience', '');
                            handleRawMaterialChange(actualIndex, 'foamHrFatigueResistance', '');
                            handleRawMaterialChange(actualIndex, 'foamHrTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamPeEpeType', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeColour', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeShape', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamPeEpeSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamPeEpeTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamPeEpeSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamPeEpeAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamPeEpeCellStructure', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeLamination', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeCrossLinked', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeAntiStatic', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeWaterResistance', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeCushioning', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeThermalInsulation', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamPeEpeDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamPuType', '');
                            handleRawMaterialChange(actualIndex, 'foamPuSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamPuGrade', '');
                            handleRawMaterialChange(actualIndex, 'foamPuColour', '');
                            handleRawMaterialChange(actualIndex, 'foamPuThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamPuShape', '');
                            handleRawMaterialChange(actualIndex, 'foamPuShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamPuSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamPuGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamPuLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamPuWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamPuKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamPuYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamPuTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamPuTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamPuSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamPuWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamPuApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamPuRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamPuAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamPuIld', '');
                            handleRawMaterialChange(actualIndex, 'foamPuSupportFactor', '');
                            handleRawMaterialChange(actualIndex, 'foamPuResilience', '');
                            handleRawMaterialChange(actualIndex, 'foamPuCellStructure', '');
                            handleRawMaterialChange(actualIndex, 'foamPuCompressionSet', '');
                            handleRawMaterialChange(actualIndex, 'foamPuTensileStrength', '');
                            handleRawMaterialChange(actualIndex, 'foamPuElongation', '');
                            handleRawMaterialChange(actualIndex, 'foamPuFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamPuAntiMicrobial', '');
                            handleRawMaterialChange(actualIndex, 'foamPuDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamPuCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedType', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedChipSource', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedChipSize', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedBonding', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedColour', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedShape', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamRebondedSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamRebondedTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamRebondedSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamRebondedAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamRebondedIld', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedCompressionSet', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamRebondedDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedType', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedBaseFoam', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedGelType', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedGelContent', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedColour', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedShape', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamGelInfusedAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedIld', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedTemperatureRegulation', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedResponseTime', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedBreathability', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedCoolingEffect', '');
                            handleRawMaterialChange(actualIndex, 'foamGelInfusedCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexType', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexLatexType', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexNaturalContent', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexProcess', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexSubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexColour', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexShape', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamLatexSheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamLatexTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamLatexSurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamLatexAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamLatexIld', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexResilience', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexCompressionSet', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexPincorePattern', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexZoneConfiguration', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexBreathability', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexHypoallergenic', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexAntiMicrobial', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamLatexCertification', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryType', '');
                            handleRawMaterialChange(actualIndex, 'foamMemorySubtype', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryGrade', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryColour', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryThickness', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryShape', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryShapeRefImage', null);
                            handleRawMaterialChange(actualIndex, 'foamMemorySheetPcs', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryGsm', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryLengthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryWidthCm', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryKgsCns', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryYardageCns', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'foamMemoryTestingRequirementsFile', null);
                            handleRawMaterialChange(actualIndex, 'foamMemorySurplus', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryWastage', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryApproval', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryRemarks', '');
                            handleRawMaterialChange(actualIndex, 'showFoamMemoryAdvancedSpec', false);
                            handleRawMaterialChange(actualIndex, 'foamMemoryIld', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryResponseTime', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryTemperatureSensitivity', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryActivationTemperature', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryCompressionSet', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryResilience', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryBreathability', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryInfusion', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryCoolingTechnology', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryVocEmissions', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryDensity', '');
                            handleRawMaterialChange(actualIndex, 'foamMemoryCertification', '');

                          }
                        }}
                        options={['EVA-foam','HR-foam','pe-epe','pu-foam','rebonded-foam','gel-infused-foam','latex-foam','memory-foam']}
                        placeholder="Select foam table"
                        className={errors[`rawMaterial_${actualIndex}_foamTableType`] ? 'border-red-600' : ''}
                      />
                      {errors[`rawMaterial_${actualIndex}_foamTableType`] && (
                        <span className="text-red-600 text-xs mt-1">{errors[`rawMaterial_${actualIndex}_foamTableType`]}</span>
                      )}
                    </Field>

                    {/* EVA-form Table */}
                    {material.foamTableType === 'EVA-foam' && (
                      <FoamEva
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleRawMaterialChange={handleRawMaterialChange}
                        handleProcurementDateChange={handleProcurementDateChange}
                        todayDate={todayDate}
                        mergeOptions={mergeOptions}
                        addCustomOption={addCustomOption}
                      />
                    )}



{/* pe-epe Table */}
{material.foamTableType === 'pe-epe' && (
  <FoamPeEpe
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}

{/* pu-foam Table */}
{material.foamTableType === 'pu-foam' && (
  <FoamPu
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}


{/* rebonded-foam Table */}
{material.foamTableType === 'rebonded-foam' && (
  <FoamRebonded
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}
                   
                  

{/* gel-infused-foam Table */}
{material.foamTableType === 'gel-infused-foam' && (
  <FoamGelInfused
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}





{/* latex-foam Table */}
{material.foamTableType === 'latex-foam' && (
  <FoamLatex
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}




{/* memory-foam Table */}
{material.foamTableType === 'memory-foam' && (
  <FoamMemory
    material={material}
    actualIndex={actualIndex}
    errors={errors}
    handleRawMaterialChange={handleRawMaterialChange}
    handleProcurementDateChange={handleProcurementDateChange}
    todayDate={todayDate}
    mergeOptions={mergeOptions}
    addCustomOption={addCustomOption}
  />
)}
                  


                    
                    {/* HR-foam Table */}
                    {material.foamTableType === 'HR-foam' && (
                      <FoamHr
                        material={material}
                        actualIndex={actualIndex}
                        errors={errors}
                        handleRawMaterialChange={handleRawMaterialChange}
                        handleProcurementDateChange={handleProcurementDateChange}
                        todayDate={todayDate}
                        mergeOptions={mergeOptions}
                        addCustomOption={addCustomOption}
                      />
                    )}
                    <div className="w-full max-w-sm" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
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

export default FoamSpec;
