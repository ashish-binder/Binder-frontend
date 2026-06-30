// FiberSpec — extracted from Step2.jsx (BOM & WIP). Pure presentational; all
// state lives in the GenerateFactoryCode orchestrator and arrives via props.
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import SearchableDropdown from '../SearchableDropdown';
// Fiber table-type spec blocks (one file each)
import FiberPolyester from '../fiberTypes/FiberPolyester';
import FiberDownFeather from '../fiberTypes/FiberDownFeather';
import FiberWool from '../fiberTypes/FiberWool';
import FiberSpecialty from '../fiberTypes/FiberSpecialty';
import FiberMicrofiber from '../fiberTypes/FiberMicrofiber';
import FiberDownAlt from '../fiberTypes/FiberDownAlt';
import FiberCotton from '../fiberTypes/FiberCotton';

const FiberSpec = ({
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
                  <div style={{ marginBottom: '16px' }}>
                    <h3 data-spec-anchor className="text-sm font-bold text-gray-800">FIBER SPECIFICATIONS</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200" style={{ padding: '20px' }}>
                    {/* Table Selection Dropdown */}
                    <div className="flex flex-col" style={{ marginBottom: '24px', maxWidth: '300px' }}>
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        SELECT FIBER TABLE <span className="text-red-600">*</span>
                      </label>
                      <SearchableDropdown
                        value={material.fiberTableType || ''}
                        onChange={(selectedValue) => {
                          handleRawMaterialChange(actualIndex, 'fiberTableType', selectedValue);
                          // Clear all fiber fields when table changes
                          if (selectedValue !== material.fiberTableType) {
                            handleRawMaterialChange(actualIndex, 'fiberFiberType', '');
                            handleRawMaterialChange(actualIndex, 'fiberSubtype', '');
                            handleRawMaterialChange(actualIndex, 'fiberForm', '');
                            handleRawMaterialChange(actualIndex, 'fiberDenier', '');
                            handleRawMaterialChange(actualIndex, 'fiberSiliconized', '');
                            handleRawMaterialChange(actualIndex, 'fiberConjugateCrimp', '');
                            handleRawMaterialChange(actualIndex, 'fiberColour', '');
                            handleRawMaterialChange(actualIndex, 'fiberBirdType', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownPercentage', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownProofRequired', '');
                            handleRawMaterialChange(actualIndex, 'fiberWoolType', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicron', '');
                            handleRawMaterialChange(actualIndex, 'fiberKapokSource', '');
                            handleRawMaterialChange(actualIndex, 'fiberKapokProperties', '');
                            handleRawMaterialChange(actualIndex, 'fiberBambooType', '');
                            handleRawMaterialChange(actualIndex, 'fiberBambooProperties', '');
                            handleRawMaterialChange(actualIndex, 'fiberSilkFlossType', '');
                            handleRawMaterialChange(actualIndex, 'fiberSilkFlossGrade', '');
                            handleRawMaterialChange(actualIndex, 'fiberRecycledSource', '');
                            handleRawMaterialChange(actualIndex, 'fiberRecycledCertification', '');
                            handleRawMaterialChange(actualIndex, 'fiberTencelType', '');
                            handleRawMaterialChange(actualIndex, 'fiberBlending', '');
                            handleRawMaterialChange(actualIndex, 'fiberEcoCertification', '');
                            handleRawMaterialChange(actualIndex, 'fiberBiodegradable', '');
                            handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', []);
                            handleRawMaterialChange(actualIndex, 'fiberQty', '');
                            handleRawMaterialChange(actualIndex, 'fiberGsm', '');
                            handleRawMaterialChange(actualIndex, 'fiberLength', '');
                            handleRawMaterialChange(actualIndex, 'fiberWidth', '');
                            handleRawMaterialChange(actualIndex, 'fiberQtyType', '');
                            handleRawMaterialChange(actualIndex, 'fiberQtyValue', '');
                            handleRawMaterialChange(actualIndex, 'fiberSurplus', '');
                            handleRawMaterialChange(actualIndex, 'fiberWastage', '');
                            handleRawMaterialChange(actualIndex, 'fiberApproval', '');
                            handleRawMaterialChange(actualIndex, 'fiberRemarks', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberFiberLength', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberStructure', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberClusterType', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberClusterSize', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberAntiMicrobial', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberHypoallergenic', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberLoftFillPower', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberHandFeel', '');
                            handleRawMaterialChange(actualIndex, 'fiberMicrofiberCertification', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeConstruction', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeLoftRating', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeFillPowerEquivalent', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeWarmthToWeight', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeWaterResistance', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeQuickDry', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeHypoallergenic', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeAntiMicrobial', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeVeganCrueltyFree', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeCertification', '');
                            handleRawMaterialChange(actualIndex, 'fiberDownAlternativeMachineWashable', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonGrade', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonStapleLength', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonProcessing', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonBonding', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonNeedlePunched', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonFireRetardant', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonDustTrashContent', '');
                            handleRawMaterialChange(actualIndex, 'fiberCottonOrganicCertified', '');
                            handleRawMaterialChange(actualIndex, 'showFiberAdvancedSpec', false);
                          }
                        }}
                        options={['Polyester-Fills', 'Down-Feather', 'Wool-Natural','Specialty-Fills','Microfiber-Fill','Down-Alternative','Cotton-Fill']}
                        placeholder="Select fiber table"
                        className={`border-2 rounded-lg text-sm transition-all bg-white text-gray-900 focus:border-indigo-500 focus:outline-none ${
                          errors[`rawMaterial_${actualIndex}_fiberTableType`] ? 'border-red-600' : 'border-[#e5e7eb]'
                        }`}
                        style={{ padding: '10px 14px', height: '44px' }}
                      />
                      {errors[`rawMaterial_${actualIndex}_fiberTableType`] && (
                        <span className="text-red-600 text-xs mt-1">{errors[`rawMaterial_${actualIndex}_fiberTableType`]}</span>
                      )}
                    </div>

                    {/* Polyester-Fills Table */}
                    {material.fiberTableType === 'Polyester-Fills' && (
                      <FiberPolyester
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

                    {/* Down-Feather Table */}
                    {material.fiberTableType === 'Down-Feather' && (
                      <FiberDownFeather
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

                    {/* Wool-Natural Table */}
                    {material.fiberTableType === 'Wool-Natural' && (
                      <FiberWool
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




                    {/* Specialty-Fills Table */}
{material.fiberTableType === 'Specialty-Fills' && (
  <FiberSpecialty
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




                    {/* Microfiber-Fill Table */}
{material.fiberTableType === 'Microfiber-Fill' && (
  <FiberMicrofiber
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


                  {/* Down-Alternative Table */}
{material.fiberTableType === 'Down-Alternative' && (
  <FiberDownAlt
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


                   {/* Cotton-Fill Table */}
{material.fiberTableType === 'Cotton-Fill' && (
  <FiberCotton
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

export default FiberSpec;
