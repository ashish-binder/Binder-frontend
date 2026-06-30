// WorkOrdersSection — the WORK ORDERS list + Add button for a raw material.
// Extracted from Step2.jsx (BOM & WIP). Pure presentational; state lives in the
// GenerateFactoryCode orchestrator and arrives via props.
import QualityVerificationToggle from '../QualityVerificationToggle';
import SearchableDropdown from '../SearchableDropdown';
import WorkOrderDateFields from '../WorkOrderDateFields';
import { BRAIDING_APPROVAL_OPTIONS, getBraidingVariants, getBraidingDesigns, getBraidingPatternType, getBraidingStrandCount, getBraidingWidthDiameter } from '../../data/braidingData';
import { Button } from '@/components/ui/button';
import { CARPET_APPROVAL_OPTIONS, KNOT_TYPE_OPTIONS, getCarpetVariants, getCarpetDesigns } from '../../data/carpetData';
import { CUTTING_APPROVAL_OPTIONS, NESTING_OPTIONS, getCuttingVariants, getCuttingCutTypes } from '../../data/cuttingData';
import { DYEING_APPROVAL_OPTIONS, getDyeingColorRefOptions, getDyeingReferenceTypeOptions, isShrinkageWidthApplicable, isShrinkageLengthApplicable, getDyeingVariants, getAllDyeingTypes } from '../../data/dyeingData';
import { EMBROIDERY_APPROVAL_OPTIONS, getEmbroideryVariants, getEmbroideryDesigns, getEmbroideryThreadColors, getEmbroideryStitchCount, getEmbroideryHoopFrameSize, getAllEmbroideryMachineTypes } from '../../data/embroideryData';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { KNITTING_APPROVAL_OPTIONS, getKnittingVariants, getKnittingDesigns, getKnittingGaugeRange, getAllKnittingMachineTypes } from '../../data/knittingData';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import { PRINTING_APPROVAL_OPTIONS, getPrintingVariants, getPrintingDesigns, getPrintingRepeatSize, getPrintingNumberOfScreens, getPrintingColors, getPrintingCoveragePercent, getPrintingResolution, getAllPrintingTypes } from '../../data/printingData';
import { PercentInput } from '@/components/ui/percent-input';
import { QUILTING_APPROVAL_OPTIONS, getQuiltingVariants, getQuiltingDesigns, getQuiltingStitchLength, getQuiltingPatternRepeat, getQuiltingNeedleSpacing, getAllQuiltingTypes } from '../../data/quiltingData';
import { RAW_MATERIAL_WORK_ORDER_OPTIONS } from '@/utils/workOrderOptions';
import { SEWING_THREAD_TYPE_OPTIONS, SEWING_APPROVAL_OPTIONS, getSewingStitchType, getSewingVariants, getSewingThreadType, getAllSewingMachineTypes } from '../../data/sewingData';
import { TUFTING_APPROVAL_OPTIONS, getTuftingDesigns, getTuftingVariants, getTuftingMachineGauge, getTuftingStitchRate, getAllTuftingMachineTypes } from '../../data/tuftingData';
import { TestingRequirementsInput } from '@/components/ui/testing-requirements-input';
import { WEAVING_APPROVAL_OPTIONS, getWeavingVariants, getWeavingDesigns, getWeavingReedRange, getWeavingPickRange, getAllWeavingMachineTypes } from '../../data/weavingData';
import { isSimpleRequirementWorkOrder } from './workOrderHelpers';

const WorkOrdersSection = ({
  material,
  materialIndex,
  actualIndex,
  errors,
  handleWorkOrderChange,
  addWorkOrder,
  removeWorkOrder,
}) => (
  <>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 className="text-sm font-bold text-gray-800">WORK ORDERS</h3>
              </div>
              
              {material.workOrders && material.workOrders.map((workOrder, woIndex) => (
                <div key={woIndex} id={`workorder-${materialIndex + 1}-${woIndex}`} data-work-order-index={woIndex} data-material-index={materialIndex} className="bg-white rounded-lg border border-gray-200" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                    <h4 className="text-sm font-semibold text-gray-700">
                      WORK ORDER {woIndex + 1}
                    </h4>
                    {material.workOrders.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Find previous work order to scroll to
                          const currentWorkOrders = material.workOrders || [];
                          const prevWorkOrderIndex = woIndex > 0 ? woIndex - 1 : null;
                          removeWorkOrder(actualIndex, woIndex);
                          
                          // Scroll to previous work order after removal
                          if (prevWorkOrderIndex !== null && prevWorkOrderIndex < currentWorkOrders.length) {
                            setTimeout(() => {
                              const prevElement = document.querySelector(`[data-material-index="${actualIndex}"][data-work-order-index="${prevWorkOrderIndex}"]`);
                              if (prevElement) {
                                prevElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          } else if (currentWorkOrders.length === 1) {
                            // If removing the last work order, scroll to material header
                            setTimeout(() => {
                              const materialElement = document.querySelector(`[data-raw-material-index="${actualIndex}"]`);
                              if (materialElement) {
                                materialElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }
                        }}
                        className="text-xs text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {/* Work Order Fields */}
                  <div className="flex flex-wrap items-start gap-6">
                    <Field
                      label="WORK ORDER"
                      required
                      width="sm"
                      error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_workOrder`]}
                      style={{ width: '160px' }}
                    >
                      <SearchableDropdown
                        value={workOrder.workOrder || ''}
                        onChange={(selectedValue) => {
                          handleWorkOrderChange(actualIndex, woIndex, 'workOrder', selectedValue);
                        }}
                        options={RAW_MATERIAL_WORK_ORDER_OPTIONS}
                        placeholder="Select Work Order"
                        strictMode={true}
                        className={
                          errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_workOrder`] ? 'border-destructive' : ''
                        }
                      />
                    </Field>
                    
                    {/* WASTAGE field - Hidden for KNITTING, PRINTING, QUILTING, SEWING, TUFTING, WEAVING, and FRINGE/TASSELS as they have their own sections */}
                    {workOrder.workOrder && workOrder.workOrder !== 'KNITTING' && workOrder.workOrder !== 'PRINTING' && workOrder.workOrder !== 'QUILTING' && workOrder.workOrder !== 'SEWING' && workOrder.workOrder !== 'TUFTING' && workOrder.workOrder !== 'WEAVING' && workOrder.workOrder !== 'FRINGE/TASSELS' && !isSimpleRequirementWorkOrder(workOrder.workOrder) && (
                      <>
                        <Field
                          label={
                            <>
                              WASTAGE % <span className="text-red-600">*</span>
                            </>
                          }
                          width="sm"
                          error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                        >
                          <PercentInput
                            value={workOrder.wastage || ''}
                            onChange={(e) => {
                              handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value);
                            }}
                            placeholder="e.g., 2"
                            error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            required
                          />
                        </Field>
                      </>
                    )}
                  </div>
                  
                  {/* Conditional Fields based on Work Order Type */}
                  {workOrder.workOrder && (
                    <div className="w-full flex flex-wrap items-start mt-14 pt-6 border-t border-gray-50" style={{ gap: '24px 32px', marginTop: '20px' }}>
                      {isSimpleRequirementWorkOrder(workOrder.workOrder) && (
                        <QualityVerificationToggle
                          value={workOrder.isRequired}
                          onChange={(value) => handleWorkOrderChange(actualIndex, woIndex, 'isRequired', value)}
                          label="Is this required?"
                          required
                          error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_isRequired`]}
                          width="sm"
                        />
                      )}

                      {!isSimpleRequirementWorkOrder(workOrder.workOrder) && (
                        <>
                      {/* Machine Type / Specific Type Dropdown */}
                      {(['WEAVING', 'TUFTING', 'KNITTING', 'EMBROIDERY', 'BRAIDING', 'CARPET', 'CUTTING'].includes(workOrder.workOrder)) && (
                        <Field
                          label={workOrder.workOrder === 'CUTTING' ? 'TOOL TYPE' : 'MACHINE TYPE'}
                          required
                          width="sm"
                          error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_machineType`]}
                        >
                          <SearchableDropdown
                            value={workOrder.machineType || ''}
                            onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'machineType', selectedValue)}
                            options={
                              workOrder.workOrder === 'WEAVING' ? getAllWeavingMachineTypes() :
                              workOrder.workOrder === 'TUFTING' ? getAllTuftingMachineTypes() :
                              workOrder.workOrder === 'KNITTING' ? getAllKnittingMachineTypes() :
                              workOrder.workOrder === 'EMBROIDERY' ? getAllEmbroideryMachineTypes() :
                              workOrder.workOrder === 'BRAIDING' ? ['HAND BRAID', 'MACHINE BRAID', 'ROPE MACHINE', 'OTHERS'] :
                              workOrder.workOrder === 'CARPET' ? ['HAND KNOTTED', 'HAND TUFTED', 'FLATWEAVE', 'WILTON', 'AXMINSTER', 'MACHINE MADE- WAN DE VEILE', 'BROADLOOM', 'WALL 2 WALL', 'NEEDLE PUNCH', 'OTHERS'] :
                              workOrder.workOrder === 'CUTTING' ? ['SCISSOR', 'STRAIGHT KNIFE', 'ROUND KNIFE', 'BAND KNIFE', 'DIE CUTTER', 'CNC CUTTER', 'LASER', 'WATERJET', 'ULTRASONIC', 'ROTARY HAND', 'OTHERS'] :
                              []
                            }
                            placeholder={workOrder.workOrder === 'CUTTING' ? "Select or type Tool Type" : "Select or type Machine Type"}
                            error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_machineType`])}
                          />
                        </Field>
                      )}

                      {/* Braiding Specific Fields */}
                      {workOrder.workOrder === 'BRAIDING' && (
                        <>
                          {/* STRAND COUNT */}
                          <Field
                            label="STRAND COUNT"
                            required
                            width="sm"
                            helper={workOrder.machineType ? getBraidingStrandCount(workOrder.machineType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_strandCount`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.strandCount || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'strandCount', e.target.value)}
                              placeholder="Enter strand count"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_strandCount`])}
                            />
                          </Field>

                          {/* WIDTH / DIAMETER */}
                          <Field
                            label={workOrder.machineType ? getBraidingWidthDiameter(workOrder.machineType) : 'WIDTH / DIAMETER'}
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_widthDiameter`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.widthDiameter || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'widthDiameter', e.target.value)}
                              placeholder="Enter width/diameter"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_widthDiameter`])}
                            />
                          </Field>

                          {/* GSM */}
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`]}>
                            <Input
                              type="text"
                              value={workOrder.gsm || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'gsm', e.target.value)}
                              placeholder="Enter GSM"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={BRAIDING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`braiding-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`braiding-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Enter remarks"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* KNITTING Specific Fields */}
                      {workOrder.workOrder === 'KNITTING' && (
                        <>
                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingDesignRef`]}>
                            <input
                              type="file"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleWorkOrderChange(actualIndex, woIndex, 'knittingDesignRef', f);
                              }}
                              className="hidden"
                              id={`knitting-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingDesignRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`knitting-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.knittingDesignRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* GAUGE */}
                          <Field
                            label="GAUGE"
                            required
                            width="sm"
                            helper={workOrder.machineType ? getKnittingGaugeRange(workOrder.machineType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingGauge`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.knittingGauge || ''}
                              onChange={(e) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'knittingGauge', e.target.value)
                              }
                              placeholder={
                                workOrder.machineType && getKnittingGaugeRange(workOrder.machineType)
                                  ? getKnittingGaugeRange(workOrder.machineType)
                                  : 'Numeric'
                              }
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingGauge`])}
                            />
                          </Field>

                          {/* GSM */}
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingGsm`]}>
                            <Input
                              type="text"
                              value={workOrder.knittingGsm || ''}
                              onChange={(e) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'knittingGsm', e.target.value)
                              }
                              placeholder="Numeric"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingGsm`])}
                            />
                          </Field>

                          {/* WALES Ratio */}
                          <Field label="WALES RATIO" required width="sm" helper="0–1" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingWalesRatio`]}>
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              max="1"
                              value={workOrder.knittingWalesRatio || ''}
                              onChange={(e) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'knittingWalesRatio', e.target.value)
                              }
                              placeholder="0-1"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingWalesRatio`])}
                            />
                          </Field>

                          {/* COURSES Ratio */}
                          <Field label="COURSES RATIO" required width="sm" helper="0–1" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingCoursesRatio`]}>
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              max="1"
                              value={workOrder.knittingCoursesRatio || ''}
                              onChange={(e) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'knittingCoursesRatio', e.target.value)
                              }
                              placeholder="0-1"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingCoursesRatio`])}
                            />
                          </Field>

                          {/* RATIO WEIGHT/%AGE (Wales) */}
                          <Field label="RATIO WEIGHT(WALES)" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingRatioWeightWales`]}>
                            <PercentInput
                              value={workOrder.knittingRatioWeightWales || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'knittingRatioWeightWales', e.target.value)}
                              placeholder="e.g., 25"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingRatioWeightWales`])}
                            />
                          </Field>

                          {/* RATIO WEIGHT/%AGE (Courses) */}
                          <Field label="RATIO WEIGHT(COURSE)" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingRatioWeightCourses`]}>
                            <PercentInput
                              value={workOrder.knittingRatioWeightCourses || ''}
                              onChange={(e) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'knittingRatioWeightCourses', e.target.value)
                              }
                              placeholder="e.g., 75"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knittingRatioWeightCourses`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field
                            label="WASTAGE %"
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                          >
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value)}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={KNITTING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Advanced Filter for KNITTING - Button right after REMARKS */}
                      {workOrder.workOrder === 'KNITTING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showKnittingAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showKnittingAdvancedFilter',
                                  !workOrder.showKnittingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showKnittingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field
                                  label="DESIGN"
                                  width="sm"
                                  helper={
                                    workOrder.machineType
                                      ? `${getKnittingDesigns(workOrder.machineType).length} options`
                                      : undefined
                                  }
                                >
                                  <SearchableDropdown
                                    value={workOrder.knittingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'knittingDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getKnittingDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Design" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field
                                  label="VARIANTS"
                                  width="sm"
                                  helper={
                                    workOrder.machineType
                                      ? `${getKnittingVariants(workOrder.machineType).length} options`
                                      : undefined
                                  }
                                >
                                  <SearchableDropdown
                                    value={workOrder.knittingVariant || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'knittingVariant', selectedValue)
                                    }
                                    options={workOrder.machineType ? getKnittingVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Variant" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Filter for BRAIDING - Button right after REMARKS */}
                      {workOrder.workOrder === 'BRAIDING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showBraidingAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showBraidingAdvancedFilter',
                                  !workOrder.showBraidingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showBraidingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.machineType ? getBraidingVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Variant" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.braidingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'braidingDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getBraidingDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Design" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field
                                  label="PATTERN"
                                  width="sm"
                                  helper={workOrder.machineType ? getBraidingPatternType(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.pattern || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'pattern', e.target.value)}
                                    placeholder={
                                      workOrder.machineType
                                        ? `Enter ${getBraidingPatternType(workOrder.machineType).toLowerCase()}`
                                        : 'Enter pattern'
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Other specific type dropdowns */}
                      {/* Quilting Specific Fields */}
                      {workOrder.workOrder === 'QUILTING' && (
                        <>
                          {/* QUILTING TYPE */}
                          <Field label="QUILTING TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_quiltingType`]}>
                            <SearchableDropdown
                              value={workOrder.quiltingType || ''}
                              onChange={(selectedValue) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'quiltingType', selectedValue)
                              }
                              options={getAllQuiltingTypes()}
                              placeholder="Select or type Quilting Type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_quiltingType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`quilting-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`quilting-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* STITCH LENGTH (mm) */}
                          <Field
                            label="STITCH LENGTH (MM)"
                            required
                            width="sm"
                            helper={workOrder.quiltingType ? getQuiltingStitchLength(workOrder.quiltingType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_stitchLength`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.stitchLength || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'stitchLength', e.target.value)}
                              placeholder={
                                workOrder.quiltingType ? getQuiltingStitchLength(workOrder.quiltingType) : 'Enter stitch length (mm)'
                              }
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_stitchLength`])}
                            />
                          </Field>

                          {/* PATTERN REPEAT */}
                          <Field
                            label="PATTERN REPEAT"
                            required
                            width="sm"
                            helper={workOrder.quiltingType ? getQuiltingPatternRepeat(workOrder.quiltingType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_patternRepeat`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.patternRepeat || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'patternRepeat', e.target.value)}
                              placeholder={
                                workOrder.quiltingType ? getQuiltingPatternRepeat(workOrder.quiltingType) : 'Enter pattern repeat'
                              }
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_patternRepeat`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field
                            label="WASTAGE %"
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                          >
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value)}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                              options={QUILTING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Printing Specific Fields */}
                      {workOrder.workOrder === 'PRINTING' && (
                        <>
                          {/* PRINTING TYPE */}
                          <Field label="PRINTING TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_printingType`]}>
                            <SearchableDropdown
                              value={workOrder.printingType || ''}
                              onChange={(selectedValue) =>
                                handleWorkOrderChange(actualIndex, woIndex, 'printingType', selectedValue)
                              }
                              options={getAllPrintingTypes()}
                              placeholder="Select or type Printing Type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_printingType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`printing-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`printing-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* REPEAT SIZE */}
                          <Field
                            label="REPEAT SIZE"
                            required
                            width="sm"
                            helper={workOrder.printingType ? getPrintingRepeatSize(workOrder.printingType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_repeatSize`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.repeatSize || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'repeatSize', e.target.value)}
                              placeholder={workOrder.printingType ? getPrintingRepeatSize(workOrder.printingType) : 'Enter repeat size'}
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_repeatSize`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field
                            label="WASTAGE %"
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                          >
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value)}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={PRINTING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Sewing Specific Fields */}
                      {workOrder.workOrder === 'SEWING' && (
                        <>
                          {/* SPI */}
                          <Field label="SPI" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_spi`]}>
                            <Input
                              type="text"
                              value={workOrder.spi || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'spi', e.target.value)}
                              placeholder="Numeric"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_spi`])}
                            />
                          </Field>

                          {/* THREAD TYPE */}
                          <Field
                            label="THREAD TYPE"
                            required
                            width="sm"
                            helper={workOrder.sewingMachineType ? getSewingThreadType(workOrder.sewingMachineType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_threadType`]}
                          >
                            <SearchableDropdown
                              value={workOrder.threadType || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'threadType', selectedValue)}
                              options={SEWING_THREAD_TYPE_OPTIONS}
                              placeholder="Select or type Thread Type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_threadType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* WASTAGE % - OPTIONAL for SEWING */}
                          <Field
                            label="WASTAGE %"
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                          >
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => {
                                handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value);
                              }}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={SEWING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* FRINGE/TASSELS Specific Fields */}
                      {workOrder.workOrder === 'FRINGE/TASSELS' && (
                        <>
                          {/* TYPE */}
                          <Field label="TYPE" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeType`]}>
                            <SearchableDropdown
                              value={workOrder.fringeType || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeType', selectedValue)}
                              options={['Cut Fringe', 'Chainette', 'Tassel (individual)', 'Ball Fringe', 'Brush Fringe', 'Bullion', 'Loop Fringe']}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* ATTACHMENT METHOD */}
                          <Field label="ATTACHMENT METHOD" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeAttachmentMethod`]}>
                            <SearchableDropdown
                              value={workOrder.fringeAttachmentMethod || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeAttachmentMethod', selectedValue)}
                              options={['Self-Knotted (through-fabric)', 'Sewn header/tape', 'Lace/cord tied', 'Slip-stitch attached', 'Glued/bonded']}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeAttachmentMethod`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* MATERIAL - hidden for Self-Knotted */}
                          {workOrder.fringeAttachmentMethod !== 'Self-Knotted (through-fabric)' && (
                          <Field label="MATERIAL" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeMaterial`]}>
                            <SearchableDropdown
                              value={workOrder.fringeMaterial || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeMaterial', selectedValue)}
                              options={['Rayon (shiny)', 'Polyester', 'Cotton', 'Silk', 'Metallic', 'Wool', 'Jute']}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeMaterial`] ? 'border-red-600' : ''}
                            />
                          </Field>
                          )}

                          {/* DROP LENGTH */}
                          <Field label="DROP LENGTH" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dropLength`]}>
                            <SearchableDropdown
                              value={workOrder.dropLength || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'dropLength', selectedValue)}
                              options={['2cm', '5cm', '10cm', '15cm', '20cm']}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dropLength`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* TAPE/HEADER WIDTH - hidden for Self-Knotted */}
                          {workOrder.fringeAttachmentMethod !== 'Self-Knotted (through-fabric)' && (
                          <Field label="TAPE/HEADER WIDTH" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tapeHeaderWidth`]}>
                            <SearchableDropdown
                              value={workOrder.tapeHeaderWidth || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'tapeHeaderWidth', selectedValue)}
                              options={['10mm', '15mm', '20mm']}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tapeHeaderWidth`] ? 'border-red-600' : ''}
                            />
                          </Field>
                          )}

                          {/* COLOUR */}
                          <Field label="COLOUR" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeColour`]}>
                            <div className="flex items-center gap-2">
                              <SearchableDropdown
                                value={workOrder.fringeColour || ''}
                                onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeColour', selectedValue)}
                                options={['DTM', 'Multi-Coloured', 'Iridescent', 'Ombre']}
                                placeholder="Select or type"
                                className={`flex-1 ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeColour`] ? 'border-red-600' : ''}`}
                              />
                              <input
                                type="file"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'fringeColourRefImage', f); }}
                                className="hidden"
                                id={`fringe-colour-ref-${materialIndex + 1}-${woIndex}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-11 flex-shrink-0"
                                onClick={() =>
                                  document.getElementById(`fringe-colour-ref-${materialIndex + 1}-${woIndex}`)?.click()
                                }
                              >
                                {workOrder.fringeColourRefImage ? 'UPLOADED' : 'UPLOAD REF'}
                              </Button>
                            </div>
                          </Field>

                          {/* APPLICATION ON # OF EDGES/PLACEMENT */}
                          <Field label="APPLICATION ON # OF EDGES / PLACEMENT" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringePlacement`]}>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={workOrder.fringePlacement || ''}
                                onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringePlacement', e.target.value)}
                                placeholder="Enter number of edges"
                                className="flex-1"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringePlacement`])}
                              />
                              <input
                                type="file"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'fringePlacementRefImage', f); }}
                                className="hidden"
                                id={`fringe-placement-ref-${materialIndex + 1}-${woIndex}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-11 flex-shrink-0"
                                onClick={() =>
                                  document.getElementById(`fringe-placement-ref-${materialIndex + 1}-${woIndex}`)?.click()
                                }
                              >
                                {workOrder.fringePlacementRefImage ? 'UPLOADED' : 'UPLOAD REF'}
                              </Button>
                            </div>
                          </Field>

                          {/* QTY ON LONGER EDGES / QTY ON SHORTER EDGES - only when 4 edges */}
                          {String(workOrder.fringePlacement) === '4' && (
                          <>
                          <Field label="QTY ON LONGER EDGES" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyLongerEdges`]}>
                            <Input
                              type="number"
                              value={workOrder.fringeQtyLongerEdges || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeQtyLongerEdges', e.target.value)}
                              placeholder="Enter qty"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyLongerEdges`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          <Field label="QTY ON SHORTER EDGES" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyShorterEdges`]}>
                            <Input
                              type="number"
                              value={workOrder.fringeQtyShorterEdges || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeQtyShorterEdges', e.target.value)}
                              placeholder="Enter qty"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyShorterEdges`] ? 'border-red-600' : ''}
                            />
                          </Field>
                          </>
                          )}

                          {/* QTY - Type Selection (PCS/LENGTH) */}
                          <Field label="QTY" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyType`]}>
                            <SearchableDropdown
                              value={workOrder.fringeQtyType || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeQtyType', selectedValue)}
                              options={['PCS', 'LENGTH']}
                              placeholder="Select type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* Conditional QTY Fields */}
                          {workOrder.fringeQtyType === 'PCS' && (
                            <Field label="PIECES" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyPcs`]}>
                              <Input
                                type="text"
                                value={workOrder.fringeQtyPcs || ''}
                                onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeQtyPcs', e.target.value)}
                                placeholder="Enter pieces"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyPcs`])}
                              />
                            </Field>
                          )}

                          {workOrder.fringeQtyType === 'LENGTH' && (
                            <Field label="CNS/PC" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyCnsPerPc`]}>
                              <Input
                                type="text"
                                value={workOrder.fringeQtyCnsPerPc || ''}
                                onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeQtyCnsPerPc', e.target.value)}
                                placeholder="Enter CNS/PC"
                                aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeQtyCnsPerPc`])}
                              />
                            </Field>
                          )}

                          {/* TESTING REQUIREMENTS */}
                          <Field label="TESTING REQ." required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeTestingRequirements`]}>
                            <div className="flex items-center" style={{ gap: '0.75rem' }}>
                              <div className="flex-1">
                                <TestingRequirementsInput
                                  value={Array.isArray(workOrder.fringeTestingRequirements)
                                    ? workOrder.fringeTestingRequirements
                                    : (workOrder.fringeTestingRequirements ? (typeof workOrder.fringeTestingRequirements === 'string' ? workOrder.fringeTestingRequirements.split(',').filter(v => v.trim()) : []) : [])}
                                  onChange={(values) => handleWorkOrderChange(actualIndex, woIndex, 'fringeTestingRequirements', values)}
                                  options={['Colour Fastness (light/UV)', 'Wash Resistance', 'Flammability']}
                                  placeholder="Type to search or select testing requirements..."
                                  error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeTestingRequirements`])}
                                />
                              </div>
                              <input
                                type="file"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'fringeTestingRequirementsUpload', f); }}
                                className="hidden"
                                id={`fringe-testing-requirements-upload-${materialIndex + 1}-${woIndex}`}
                                accept="image/*"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-11 flex-shrink-0"
                                onClick={() => document.getElementById(`fringe-testing-requirements-upload-${materialIndex + 1}-${woIndex}`)?.click()}
                              >
                                {workOrder.fringeTestingRequirementsUpload ? 'UPLOADED' : 'UPLOAD'}
                              </Button>
                            </div>
                          </Field>

                          {/* SURPLUS % */}
                          <Field label="SURPLUS %" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeSurplus`]}>
                            <PercentInput
                              value={workOrder.fringeSurplus || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeSurplus', e.target.value)}
                              placeholder="e.g., 5"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeSurplus`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field label="WASTAGE %" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeWastage`]}>
                            <PercentInput
                              value={workOrder.fringeWastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeWastage', e.target.value)}
                              placeholder="e.g., 3"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeWastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="md" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeApproval`]}>
                            <SearchableDropdown
                              value={workOrder.fringeApproval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'fringeApproval', selectedValue)}
                              options={MATERIAL_APPROVAL_OPTIONS}
                              placeholder="Select or type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeApproval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeRemarks`]}>
                            <Input
                              type="text"
                              value={workOrder.fringeRemarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'fringeRemarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_fringeRemarks`])}
                            />
                          </Field>

                          {/* Advance Spec Section for FRINGE/TASSELS */}
                          <div className="w-full" style={{ marginTop: '20px' }}>
                            <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                              <Button
                                type="button"
                                variant={workOrder.showFringeAdvancedSpec ? "default" : "outline"}
                                size="sm"
                                onClick={() =>
                                  handleWorkOrderChange(
                                    actualIndex,
                                    woIndex,
                                    'showFringeAdvancedSpec',
                                    !workOrder.showFringeAdvancedSpec
                                  )
                                }
                              >
                                Advance Spec
                              </Button>
                            </div>

                            {/* Advanced Spec UI Table */}
                            {workOrder.showFringeAdvancedSpec && (
                              <div
                                style={{
                                  marginTop: '1.5rem',
                                  padding: '1.5rem',
                                  backgroundColor: 'var(--muted)',
                                  borderRadius: '0.75rem',
                                  border: '1px solid var(--border)',
                                  width: '100%',
                                }}
                              >
                                <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px 12px' }}>
                                  <Field label="FINISH" width="md">
                                    <SearchableDropdown
                                      value={workOrder.fringeFinish || ''}
                                      onChange={(selectedValue) =>
                                        handleWorkOrderChange(actualIndex, woIndex, 'fringeFinish', selectedValue)
                                      }
                                      options={['High Sheen', 'Matte', 'Twisted', 'Braided Header']}
                                      placeholder="Select or type"
                                    />
                                  </Field>

                                  <Field label="CONSTRUCTION" width="md">
                                    <SearchableDropdown
                                      value={workOrder.fringeConstruction || ''}
                                      onChange={(selectedValue) =>
                                        handleWorkOrderChange(actualIndex, woIndex, 'fringeConstruction', selectedValue)
                                      }
                                      options={['Knot Density', 'Fiber Count', 'Threads per inch']}
                                      placeholder="Select or type"
                                    />
                                  </Field>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      
                      {/* Dyeing Specific Fields */}
                      {workOrder.workOrder === 'DYEING' && (
                        <>
                          {/* DYEING TYPE */}
                          <Field label="DYEING TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dyeingType`]}>
                            <SearchableDropdown
                              value={workOrder.dyeingType || ''}
                              onChange={(selectedValue) => {
                                const selectedType = selectedValue;
                                handleWorkOrderChange(actualIndex, woIndex, 'dyeingType', selectedType);
                                // Clear COLOR REF and REFERENCE TYPE when dyeing type changes
                                if (!selectedType) {
                                  handleWorkOrderChange(actualIndex, woIndex, 'colorRef', '');
                                  handleWorkOrderChange(actualIndex, woIndex, 'referenceType', '');
                                } else {
                                  handleWorkOrderChange(actualIndex, woIndex, 'colorRef', '');
                                  handleWorkOrderChange(actualIndex, woIndex, 'referenceType', '');
                                }
                              }}
                              options={getAllDyeingTypes()}
                              placeholder="Select or type Dyeing Type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dyeingType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* COLOR REF */}
                          <Field label="COLOR REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_colorRef`]}>
                            <SearchableDropdown
                              value={workOrder.colorRef || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'colorRef', selectedValue)}
                              options={workOrder.dyeingType ? getDyeingColorRefOptions(workOrder.dyeingType) : []}
                              placeholder={workOrder.dyeingType ? "Select or type Color Ref" : "Select Dyeing Type First"}
                              disabled={!workOrder.dyeingType}
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_colorRef`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REFERENCE TYPE */}
                          <Field label="REFERENCE TYPE" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_referenceType`]}>
                            <SearchableDropdown
                              value={workOrder.referenceType || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'referenceType', selectedValue)}
                              options={workOrder.dyeingType ? getDyeingReferenceTypeOptions(workOrder.dyeingType) : []}
                              placeholder={workOrder.dyeingType ? "Select or type Reference Type" : "Select Dyeing Type First"}
                              disabled={!workOrder.dyeingType}
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_referenceType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REFERENCE - Text Field (appears after REFERENCE TYPE is selected) */}
                          <Field label="REFERENCE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dyeingReference`]}>
                            <Input
                              type="text"
                              value={workOrder.dyeingReference || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'dyeingReference', e.target.value)}
                              placeholder="Enter reference"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dyeingReference`])}
                            />
                          </Field>

                          {/* REFERENCE IMAGE (Upload) */}
                          <Field label="REFERENCE IMAGE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`dyeing-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`dyeing-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* SHRINKAGE WIDTH % */}
                          {isShrinkageWidthApplicable(workOrder.dyeingType) && (
                            <Field label="SHRINKAGE WIDTH %" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_shrinkageWidthPercent`]}>
                              <PercentInput
                                value={workOrder.shrinkageWidthPercent || ''}
                                onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'shrinkageWidthPercent', e.target.value)}
                                placeholder="e.g., 2"
                                error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_shrinkageWidthPercent`])}
                              />
                            </Field>
                          )}

                          {/* SHRINKAGE LENGTH % */}
                          {isShrinkageLengthApplicable(workOrder.dyeingType) && (
                            <Field label="SHRINKAGE LENGTH %" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_shrinkageLengthPercent`]}>
                              <PercentInput
                                value={workOrder.shrinkageLengthPercent || ''}
                                onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'shrinkageLengthPercent', e.target.value)}
                                placeholder="e.g., 2"
                                error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_shrinkageLengthPercent`])}
                              />
                            </Field>
                          )}

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={DYEING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Enter remarks"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}
                      
                      {/* Image Upload - Hidden for CUTTING, BRAIDING, CARPET, DYEING, EMBROIDERY, KNITTING, PRINTING, QUILTING, SEWING, TUFTING, WEAVING, and FRINGE/TASSELS (they have REFERENCE IMAGE/DESIGN REF in their own sections or don't need it) */}
                      {workOrder.workOrder !== 'CUTTING' && workOrder.workOrder !== 'BRAIDING' && workOrder.workOrder !== 'CARPET' && workOrder.workOrder !== 'DYEING' && workOrder.workOrder !== 'EMBROIDERY' && workOrder.workOrder !== 'KNITTING' && workOrder.workOrder !== 'PRINTING' && workOrder.workOrder !== 'QUILTING' && workOrder.workOrder !== 'SEWING' && workOrder.workOrder !== 'TUFTING' && workOrder.workOrder !== 'WEAVING' && workOrder.workOrder !== 'FRINGE/TASSELS' && (
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-700 mb-2">
                            {workOrder.workOrder === 'DYEING' ? 'REFERENCE IMAGE' : workOrder.workOrder === 'BRAIDING' ? 'DESIGN REF' : 'IMAGE REF'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`file-${materialIndex + 1}-${woIndex}`}
                            />
                            <label
                              htmlFor={`file-${materialIndex + 1}-${woIndex}`}
                              className="border-2 rounded-lg text-sm transition-all bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-600 border-[#e5e7eb]"
                              style={{ padding: '10px 14px', height: '44px', width: '140px' }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="truncate">{workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}</span>
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {/* Weaving Specific Fields */}
                      {workOrder.workOrder === 'WEAVING' && (
                        <>
                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`weaving-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`weaving-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* REED */}
                          <Field
                            label="REED"
                            required
                            width="sm"
                            helper={workOrder.machineType ? getWeavingReedRange(workOrder.machineType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_reed`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.reed || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'reed', e.target.value)}
                              placeholder={
                                workOrder.machineType && getWeavingReedRange(workOrder.machineType)
                                  ? getWeavingReedRange(workOrder.machineType)
                                  : 'Numeric'
                              }
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_reed`])}
                            />
                          </Field>

                          {/* PICK */}
                          <Field
                            label="PICK"
                            required
                            width="sm"
                            helper={workOrder.machineType ? getWeavingPickRange(workOrder.machineType) : undefined}
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pick`]}
                          >
                            <Input
                              type="text"
                              value={workOrder.pick || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'pick', e.target.value)}
                              placeholder={
                                workOrder.machineType && getWeavingPickRange(workOrder.machineType)
                                  ? getWeavingPickRange(workOrder.machineType)
                                  : 'Numeric'
                              }
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pick`])}
                            />
                          </Field>

                          {/* GSM */}
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`]}>
                            <Input
                              type="text"
                              value={workOrder.gsm || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'gsm', e.target.value)}
                              placeholder="Enter GSM"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field
                            label="WASTAGE %"
                            required
                            width="sm"
                            error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}
                          >
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value)}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={WEAVING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}
                      
                      {/* Specific Fields for DYEING Shrinkage */}
                      {/* Tufting Specific Fields */}
                      {workOrder.workOrder === 'TUFTING' && (
                        <>
                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`tufting-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`tufting-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* GSM */}
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`]}>
                            <Input
                              type="text"
                              value={workOrder.gsm || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'gsm', e.target.value)}
                              placeholder="Enter GSM"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`])}
                            />
                          </Field>

                          {/* PILE HEIGHT (mm) */}
                          <Field label="PILE HEIGHT (MM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pileHeight`]}>
                            <Input
                              type="text"
                              value={workOrder.pileHeight || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'pileHeight', e.target.value)}
                              placeholder="Enter pile height (mm)"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pileHeight`])}
                            />
                          </Field>

                          {/* TPI (TUFT PER INCH) */}
                          <Field label="TPI (TUFT PER INCH)" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tpi`]}>
                            <Input
                              type="text"
                              value={workOrder.tpi || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'tpi', e.target.value)}
                              placeholder="Enter TPI"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tpi`])}
                            />
                          </Field>

                          {/* WASTAGE % */}
                          <Field label="WASTAGE %" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`]}>
                            <PercentInput
                              value={workOrder.wastage || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'wastage', e.target.value)}
                              placeholder="e.g., 2"
                              error={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_wastage`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={TUFTING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Text"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Carpet Specific Fields */}
                      {workOrder.workOrder === 'CARPET' && (
                        <>
                          {/* GSM */}
                          <Field label="GSM" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`]}>
                            <Input
                              type="text"
                              value={workOrder.gsm || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'gsm', e.target.value)}
                              placeholder="Enter GSM"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_gsm`])}
                            />
                          </Field>

                          {/* PILE HEIGHT (mm) */}
                          <Field label="PILE HEIGHT (MM)" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pileHeight`]}>
                            <Input
                              type="text"
                              value={workOrder.pileHeight || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'pileHeight', e.target.value)}
                              placeholder="Enter pile height"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pileHeight`])}
                            />
                          </Field>

                          {/* TPI / KPSI */}
                          <Field label="TPI / KPSI" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tpiKpsi`]}>
                            <Input
                              type="text"
                              value={workOrder.tpiKpsi || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'tpiKpsi', e.target.value)}
                              placeholder="Enter TPI/KPSI"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_tpiKpsi`])}
                            />
                          </Field>

                          {/* KNOT TYPE */}
                          <Field label="KNOT TYPE" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knotType`]}>
                            <SearchableDropdown
                              value={workOrder.knotType || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'knotType', selectedValue)}
                              options={KNOT_TYPE_OPTIONS}
                              placeholder="Select or type Knot Type"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_knotType`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* PITCH/ROWS */}
                          <Field label="PITCH/ROWS" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pitchRows`]}>
                            <Input
                              type="text"
                              value={workOrder.pitchRows || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'pitchRows', e.target.value)}
                              placeholder="Enter pitch/rows"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_pitchRows`])}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={CARPET_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`carpet-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`carpet-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Enter remarks"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Advanced Filter for CARPET - Button right after REMARKS */}
                      {workOrder.workOrder === 'CARPET' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showCarpetAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showCarpetAdvancedFilter',
                                  !workOrder.showCarpetAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showCarpetAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.machineType ? getCarpetVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Variant" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.carpetDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'carpetDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getCarpetDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Design" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Cutting Specific Fields */}
                      {workOrder.workOrder === 'CUTTING' && (
                        <>
                          {/* VARIANTS - Dropdown */}
                          <Field label="VARIANTS" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_variants`]}>
                            <SearchableDropdown
                              value={workOrder.variants || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)}
                              options={workOrder.machineType ? getCuttingVariants(workOrder.machineType) : []}
                              placeholder={workOrder.machineType ? "Select or type Variant" : "Select Machine Type First"}
                              disabled={!workOrder.machineType}
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_variants`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={CUTTING_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Enter remarks"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Advanced Filter for CUTTING - Button right after REMARKS */}
                      {workOrder.workOrder === 'CUTTING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showCuttingAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showCuttingAdvancedFilter',
                                  !workOrder.showCuttingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showCuttingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="CUT TYPE" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.cutType || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'cutType', selectedValue)
                                    }
                                    options={workOrder.machineType ? getCuttingCutTypes(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Cut Type" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field label="LAYERS" width="sm">
                                  <Input
                                    type="text"
                                    value={workOrder.layers || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'layers', e.target.value)}
                                    placeholder="Enter layers"
                                  />
                                </Field>

                                <Field label="NESTING" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.nesting || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'nesting', selectedValue)
                                    }
                                    options={NESTING_OPTIONS}
                                    placeholder="Select or type Nesting"
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Embroidery Specific Fields */}
                      {workOrder.workOrder === 'EMBROIDERY' && (
                        <>
                          {/* DESIGN REF (Upload) */}
                          <Field label="DESIGN REF" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`]}>
                            <input
                              type="file"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWorkOrderChange(actualIndex, woIndex, 'imageRef', f); }}
                              className="hidden"
                              id={`embroidery-file-${materialIndex + 1}-${woIndex}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={`h-11 w-full ${errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_imageRef`] ? 'border-red-600' : ''}`}
                              onClick={() =>
                                document.getElementById(`embroidery-file-${materialIndex + 1}-${woIndex}`)?.click()
                              }
                            >
                              {workOrder.imageRef ? 'UPLOADED' : 'UPLOAD'}
                            </Button>
                          </Field>

                          {/* APPROVAL */}
                          <Field label="APPROVAL" required width="sm" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`]}>
                            <SearchableDropdown
                              value={workOrder.approval || ''}
                              onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'approval', selectedValue)}
                              options={EMBROIDERY_APPROVAL_OPTIONS}
                              placeholder="Select or type Approval"
                              className={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_approval`] ? 'border-red-600' : ''}
                            />
                          </Field>

                          {/* REMARKS */}
                          <Field label="REMARKS" required width="lg" error={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`]}>
                            <Input
                              type="text"
                              value={workOrder.remarks || ''}
                              onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'remarks', e.target.value)}
                              placeholder="Enter remarks"
                              aria-invalid={Boolean(errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_remarks`])}
                            />
                          </Field>
                        </>
                      )}

                      {/* Advanced Filter for EMBROIDERY - At the very bottom after all fields */}
                      {workOrder.workOrder === 'EMBROIDERY' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showEmbroideryAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showEmbroideryAdvancedFilter',
                                  !workOrder.showEmbroideryAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showEmbroideryAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.machineType ? getEmbroideryVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Variant" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.embroideryDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'embroideryDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getEmbroideryDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? "Select or type Design" : "Select Machine Type First"}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                <Field
                                  label="THREAD COLORS"
                                  width="sm"
                                  helper={workOrder.machineType ? getEmbroideryThreadColors(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.threadColors || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'threadColors', e.target.value)}
                                    placeholder={
                                      workOrder.machineType
                                        ? `Enter ${getEmbroideryThreadColors(workOrder.machineType)}`
                                        : 'Enter thread colors'
                                    }
                                  />
                                </Field>

                                <Field
                                  label="STITCH COUNT"
                                  width="sm"
                                  helper={workOrder.machineType ? getEmbroideryStitchCount(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.stitchCount || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'stitchCount', e.target.value)}
                                    placeholder={
                                      workOrder.machineType
                                        ? `Enter ${getEmbroideryStitchCount(workOrder.machineType)}`
                                        : 'Enter stitch count'
                                    }
                                  />
                                </Field>

                                <Field
                                  label="HOOP/FRAME SIZE"
                                  width="sm"
                                  helper={workOrder.machineType ? getEmbroideryHoopFrameSize(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.hoopFrameSize || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'hoopFrameSize', e.target.value)}
                                    placeholder={
                                      workOrder.machineType
                                        ? `Enter ${getEmbroideryHoopFrameSize(workOrder.machineType)}`
                                        : 'Enter hoop/frame size'
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Filter for PRINTING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'PRINTING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showPrintingAdvancedFilter ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showPrintingAdvancedFilter',
                                  !workOrder.showPrintingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>
                          
                          {/* Advanced Filter UI Table */}
                          {workOrder.showPrintingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-4">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                                {/* VARIANTS */}
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.printingType ? getPrintingVariants(workOrder.printingType) : []}
                                    placeholder={workOrder.printingType ? 'Select or type' : 'Select Printing Type First'}
                                    disabled={!workOrder.printingType}
                                  />
                                </Field>

                                {/* DESIGN */}
                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.printingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'printingDesign', selectedValue)
                                    }
                                    options={workOrder.printingType ? getPrintingDesigns(workOrder.printingType) : []}
                                    placeholder={workOrder.printingType ? 'Select or type' : 'Select Printing Type First'}
                                    disabled={!workOrder.printingType}
                                  />
                                </Field>

                                {/* # OF SCREENS */}
                                <Field
                                  label="# OF SCREENS"
                                  width="sm"
                                  helper={workOrder.printingType ? getPrintingNumberOfScreens(workOrder.printingType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.numberOfScreens || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'numberOfScreens', e.target.value)}
                                    placeholder={
                                      workOrder.printingType ? getPrintingNumberOfScreens(workOrder.printingType) : 'Enter # of screens'
                                    }
                                  />
                                </Field>

                                {/* COLORS */}
                                <Field label="COLORS" width="sm" helper={workOrder.printingType ? getPrintingColors(workOrder.printingType) : undefined}>
                                  <Input
                                    type="text"
                                    value={workOrder.colors || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'colors', e.target.value)}
                                    placeholder={workOrder.printingType ? getPrintingColors(workOrder.printingType) : 'Enter colors'}
                                  />
                                </Field>

                                {/* COVERAGE % */}
                                <Field
                                  label="COVERAGE %"
                                  width="sm"
                                  helper={workOrder.printingType ? getPrintingCoveragePercent(workOrder.printingType) : undefined}
                                >
                                  <PercentInput
                                    value={workOrder.coveragePercent || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'coveragePercent', e.target.value)}
                                    placeholder={workOrder.printingType ? getPrintingCoveragePercent(workOrder.printingType) : 'Enter coverage %'}
                                  />
                                </Field>

                                {/* RESOLUTION */}
                                <Field
                                  label="RESOLUTION"
                                  width="sm"
                                  helper={workOrder.printingType ? getPrintingResolution(workOrder.printingType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.resolution || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'resolution', e.target.value)}
                                    placeholder={workOrder.printingType ? getPrintingResolution(workOrder.printingType) : 'Enter resolution'}
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Advanced Filter for QUILTING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'QUILTING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showQuiltingAdvancedFilter ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showQuiltingAdvancedFilter',
                                  !workOrder.showQuiltingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>
                          
                          {/* Advanced Filter UI Table */}
                          {workOrder.showQuiltingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-4">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                                {/* VARIANTS */}
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.quiltingType ? getQuiltingVariants(workOrder.quiltingType) : []}
                                    placeholder={workOrder.quiltingType ? 'Select or type' : 'Select Quilting Type First'}
                                    disabled={!workOrder.quiltingType}
                                  />
                                </Field>

                                {/* DESIGN */}
                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.quiltingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'quiltingDesign', selectedValue)
                                    }
                                    options={workOrder.quiltingType ? getQuiltingDesigns(workOrder.quiltingType) : []}
                                    placeholder={workOrder.quiltingType ? 'Select or type' : 'Select Quilting Type First'}
                                    disabled={!workOrder.quiltingType}
                                  />
                                </Field>

                                {/* NEEDLE SPACING */}
                                <Field
                                  label="NEEDLE SPACING"
                                  width="sm"
                                  helper={workOrder.quiltingType ? getQuiltingNeedleSpacing(workOrder.quiltingType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.needleSpacing || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'needleSpacing', e.target.value)}
                                    placeholder={
                                      workOrder.quiltingType ? getQuiltingNeedleSpacing(workOrder.quiltingType) : 'Enter needle spacing'
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Filter for SEWING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'SEWING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showSewingAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showSewingAdvancedFilter',
                                  !workOrder.showSewingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showSewingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="MACHINE TYPE" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.sewingMachineType || ''}
                                    onChange={(selectedValue) => {
                                      const selectedType = selectedValue;
                                      handleWorkOrderChange(actualIndex, woIndex, 'sewingMachineType', selectedType);
                                      // Auto-populate STITCH TYPE when machine type changes
                                      if (selectedType) {
                                        handleWorkOrderChange(actualIndex, woIndex, 'stitchType', getSewingStitchType(selectedType));
                                        handleWorkOrderChange(actualIndex, woIndex, 'threadType', getSewingThreadType(selectedType));
                                      }
                                    }}
                                    options={getAllSewingMachineTypes()}
                                    placeholder="Select or type Machine Type"
                                  />
                                </Field>

                                <Field
                                  label="STITCH TYPE"
                                  width="sm"
                                  helper={workOrder.sewingMachineType ? getSewingStitchType(workOrder.sewingMachineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.stitchType || getSewingStitchType(workOrder.sewingMachineType) || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'stitchType', e.target.value)}
                                    placeholder={
                                      workOrder.sewingMachineType
                                        ? getSewingStitchType(workOrder.sewingMachineType)
                                        : 'Enter stitch type'
                                    }
                                    disabled={!workOrder.sewingMachineType}
                                  />
                                </Field>

                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.sewingMachineType ? getSewingVariants(workOrder.sewingMachineType) : []}
                                    placeholder={workOrder.sewingMachineType ? "Select or type Variant" : "Select Machine Type First"}
                                    disabled={!workOrder.sewingMachineType}
                                  />
                                </Field>

                                <Field label="NEEDLE SIZE" width="sm">
                                  <Input
                                    type="text"
                                    value={workOrder.needleSize || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'needleSize', e.target.value)}
                                    placeholder="TEXT"
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Filter for WEAVING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'WEAVING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showWeavingAdvancedFilter ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showWeavingAdvancedFilter',
                                  !workOrder.showWeavingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>
                          
                          {/* Advanced Filter UI Table */}
                          {workOrder.showWeavingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-4">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                                {/* VARIANTS */}
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)}
                                    options={workOrder.machineType ? getWeavingVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? 'Select or type' : 'Select Machine Type First'}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                {/* DESIGN */}
                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.weavingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'weavingDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getWeavingDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? 'Select or type' : 'Select Machine Type First'}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                {/* WARP RATIO */}
                                <Field label="WARP RATIO" width="sm">
                                  <Input
                                    type="text"
                                    value={workOrder.advancedWarpRatio ?? ''}
                                    onChange={(e) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'advancedWarpRatio', e.target.value)
                                    }
                                    placeholder="e.g. 0.6 or 60"
                                  />
                                </Field>

                                {/* WEFT RATIO */}
                                <Field label="WEFT RATIO" width="sm">
                                  <Input
                                    type="text"
                                    value={workOrder.advancedWeftRatio ?? ''}
                                    onChange={(e) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'advancedWeftRatio', e.target.value)
                                    }
                                    placeholder="e.g. 0.4 or 40"
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Filter for TUFTING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'TUFTING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showTuftingAdvancedFilter ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showTuftingAdvancedFilter',
                                  !workOrder.showTuftingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>
                          
                          {/* Advanced Filter UI Table */}
                          {workOrder.showTuftingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-4">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px 12px' }}>
                                {/* DESIGN */}
                                <Field label="DESIGN" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.tuftingDesign || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'tuftingDesign', selectedValue)
                                    }
                                    options={workOrder.machineType ? getTuftingDesigns(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? 'Select or type' : 'Select Machine Type First'}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                {/* VARIANTS */}
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) => handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)}
                                    options={workOrder.machineType ? getTuftingVariants(workOrder.machineType) : []}
                                    placeholder={workOrder.machineType ? 'Select or type' : 'Select Machine Type First'}
                                    disabled={!workOrder.machineType}
                                  />
                                </Field>

                                {/* MACHINE GAUGE */}
                                <Field
                                  label="MACHINE GAUGE"
                                  width="sm"
                                  helper={workOrder.machineType ? getTuftingMachineGauge(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.machineGauge || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'machineGauge', e.target.value)}
                                    placeholder={
                                      workOrder.machineType ? getTuftingMachineGauge(workOrder.machineType) : 'Enter machine gauge'
                                    }
                                  />
                                </Field>

                                {/* STITCH RATE */}
                                <Field
                                  label="STITCH RATE"
                                  width="sm"
                                  helper={workOrder.machineType ? getTuftingStitchRate(workOrder.machineType) : undefined}
                                >
                                  <Input
                                    type="text"
                                    value={workOrder.stitchRate || ''}
                                    onChange={(e) => handleWorkOrderChange(actualIndex, woIndex, 'stitchRate', e.target.value)}
                                    placeholder={
                                      workOrder.machineType ? getTuftingStitchRate(workOrder.machineType) : 'Enter stitch rate'
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}


                      {/* Advanced Filter for DYEING - At the very bottom after all fields */}
                      {workOrder.workOrder === 'DYEING' && (
                        <div className="w-full" style={{ marginTop: '20px' }}>
                          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }} className="w-full">
                            <Button
                              type="button"
                              variant={workOrder.showDyeingAdvancedFilter ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                handleWorkOrderChange(
                                  actualIndex,
                                  woIndex,
                                  'showDyeingAdvancedFilter',
                                  !workOrder.showDyeingAdvancedFilter
                                )
                              }
                            >
                              Advance Spec
                            </Button>
                          </div>

                          {/* Advanced Filter UI Table */}
                          {workOrder.showDyeingAdvancedFilter && (
                            <div
                              style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                backgroundColor: 'var(--muted)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                width: '100%',
                              }}
                            >
                              <h4 className="text-sm font-semibold text-foreground/90 mb-6">ADVANCE SPEC</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px 12px' }}>
                                <Field label="VARIANTS" width="sm">
                                  <SearchableDropdown
                                    value={workOrder.variants || ''}
                                    onChange={(selectedValue) =>
                                      handleWorkOrderChange(actualIndex, woIndex, 'variants', selectedValue)
                                    }
                                    options={workOrder.dyeingType ? getDyeingVariants(workOrder.dyeingType) : []}
                                    placeholder={workOrder.dyeingType ? "Select or type Variant" : "Select Dyeing Type First"}
                                    disabled={!workOrder.dyeingType}
                                  />
                                </Field>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Start Date & Date of Completion - Common for all work order types; Quality Verification inside top-border date part */}
                      <div className="w-full" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <QualityVerificationToggle
                          value={workOrder.qualityVerification}
                          onChange={(value) => handleWorkOrderChange(actualIndex, woIndex, 'qualityVerification', value)}
                          width="lg"
                          className="mb-3"
                        />
                        <WorkOrderDateFields
                          startDate={workOrder.startDate}
                          dateOfCompletion={workOrder.dateOfCompletion}
                          onChange={(field, value) => handleWorkOrderChange(actualIndex, woIndex, field, value)}
                          errorStartDate={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_startDate`]}
                          errorDateOfCompletion={errors[`rawMaterial_${actualIndex}_workOrder_${woIndex}_dateOfCompletion`]}
                          startDateLabel="starting date"
                          completionDateLabel="completion date"
                          className="w-full"
                        />
                      </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add Work Order Button at Bottom - Only show if at least one work order exists */}
              {material.workOrders && material.workOrders.length > 0 && (
              <div className="mt-6 pt-6" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                      const currentLength = material.workOrders?.length || 0;
                      addWorkOrder(actualIndex);
                    const newIndex = currentLength;
                    const attemptScroll = (attempts = 0) => {
                      if (attempts > 30) return;
                        const element = document.getElementById(`workorder-${materialIndex + 1}-${newIndex}`);
                      if (element) {
                        setTimeout(() => {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 150);
                      } else {
                        setTimeout(() => attemptScroll(attempts + 1), 50);
                      }
                    };
                    attemptScroll();
                  }}
                >
                  + Add Work Order
                </Button>
              </div>
              )}
            </div>
  </>
);

export default WorkOrdersSection;
