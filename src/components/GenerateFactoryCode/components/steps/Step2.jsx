import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import SearchableDropdown from '../SearchableDropdown';
import { isAutoDescriptionType } from '../../utils/materialDescription';
import { useMaterialOptions } from '../../utils/useMaterialOptions';
import { UNIT_OPTIONS, UNIT_OPTIONS_WITH_PCS } from '../../constants/unitOptions';
import TrimAccessoryFields from '../TrimAccessoryFields';
import FabricSpec from '../rawMaterials/FabricSpec';
import YarnSpec from '../rawMaterials/YarnSpec';
import StitchingThreadSpec from '../rawMaterials/StitchingThreadSpec';
import FoamSpec from '../rawMaterials/FoamSpec';
import FiberSpec from '../rawMaterials/FiberSpec';
import WorkOrdersSection from '../workOrders/WorkOrdersSection';

// Advance-Spec visibility flag per auto-description material type. Clicking the
// read-only MATERIAL DESC field opens these so every source dropdown (including
// the advance fields that feed the description) is editable.
const SPEC_ADVANCE_FLAG = {
  Fabric: 'showFabricAdvancedFilter',
  Yarn: 'showAdvancedFilter',
  Foam: 'showFoamAdvancedSpec',
  Fiber: 'showFiberAdvancedSpec',
};

// Reveal & scroll to the spec source fields for a raw-material row when the user
// clicks its read-only MATERIAL DESC field.
const focusMaterialSpecSource = (actualIndex, materialType, handleRawMaterialChange) => {
  const flag = SPEC_ADVANCE_FLAG[materialType];
  if (flag) handleRawMaterialChange(actualIndex, flag, true);
  if (typeof document !== 'undefined') {
    // Defer so the advance panel has expanded before we scroll.
    setTimeout(() => {
      const card = document.querySelector(`[data-raw-material-index="${actualIndex}"]`);
      const anchor = card?.querySelector('[data-spec-anchor]') || card;
      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
};

const Step2 = ({
  formData,
  errors,
  renderHeaderAction,
  handleRawMaterialChange,
  handleWorkOrderChange,
  addWorkOrder,
  removeWorkOrder,
  addRawMaterialWithType,
  handleSave,
  removeRawMaterial,
  validateField,
  validateStep2,
  validateComponentMaterials,
  savedComponents: savedComponentsProp = new Set(), // From parent – add/edit/remove material clears this
  onValidationFail,
}) => {
  const prevWorkOrdersLengthRef = useRef({});
  const isInitialMountRef = useRef(true);
  // Tenant-scoped custom dropdown options (merge built-in + tenant; persist new typed values).
  const { mergeOptions, addCustomOption } = useMaterialOptions();
  const [selectedComponent, setSelectedComponent] = useState(''); // Component selected at top
  const [showMaterialTypeModal, setShowMaterialTypeModal] = useState(false);
  const savedComponents = savedComponentsProp; // Use parent's state so "Add material" clears Saved
  const [lastAddedMaterialIndex, setLastAddedMaterialIndex] = useState(null);
  const [scrollToMaterialIndex, setScrollToMaterialIndex] = useState(null); // Index to scroll to after removal
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const todayDate = (() => {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().split('T')[0];
  })();

  const handleProcurementDateChange = (materialIndex, value) => {
    const fieldKey = `rawMaterial_${materialIndex}_procurementDate`;
    if (!value || value >= todayDate) {
      handleRawMaterialChange(materialIndex, 'procurementDate', value);
      if (typeof validateField === 'function') {
        validateField(fieldKey, value, materialIndex);
      }
      return;
    }

    if (typeof validateField === 'function') {
      validateField(fieldKey, value, materialIndex);
    }
  };

  // Get all components for dropdown with done status
  const getAllComponents = () => {
    const components = [];
    (formData.products || []).forEach((product) => {
      (product.components || []).forEach((component) => {
        if (component.productComforter) {
          components.push(component.productComforter);
        }
      });
    });
    return [...new Set(components)]; // Remove duplicates
  };

  // Check if a component is "done" (saved)
  const isComponentDone = (componentName) => {
    return savedComponents.has(componentName);
  };

  // Get materials for selected component
  const getMaterialsForSelectedComponent = () => {
    if (!selectedComponent) return [];
    return formData.rawMaterials?.filter(m => m.componentName === selectedComponent) || [];
  };

  // Reset save status when switching components
  useEffect(() => {
    setSaveStatus('idle');
  }, [selectedComponent]);


  // Handle bottom SAVE button - marks component as done
  const handleBottomSave = () => {
    if (!selectedComponent) {
      return;
    }
    
    // Validate component materials - this will set errors in state
    if (!validateComponentMaterials) {
      return;
    }
    
    const result = validateComponentMaterials(selectedComponent);

    if (!result || !result.isValid) {
      setSaveStatus('error');
      // Show validation errors popup
      if (onValidationFail && result?.errors) {
        onValidationFail(result.errors);
      }
      // Scroll to first error
      setTimeout(() => {
        const firstErrorKey = Object.keys(result?.errors || {})[0];
        if (firstErrorKey) {
          const selectors = [
            `[data-error-key="${firstErrorKey}"]`,
            `[name="${firstErrorKey}"]`,
            `#${firstErrorKey}`,
          ];
          
          let errorElement = null;
          for (const selector of selectors) {
            errorElement = document.querySelector(selector);
            if (errorElement) break;
          }
          
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'SELECT' || errorElement.tagName === 'TEXTAREA') {
              errorElement.focus();
            }
          }
        }
      }, 100);
      return;
    }

    // Validation passed - save the component (parent updates savedComponents prop)
    setSaveStatus('success');
    if (handleSave) {
      handleSave(selectedComponent);
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      formData.rawMaterials?.forEach((material, materialIndex) => {
        prevWorkOrdersLengthRef.current[materialIndex] = material.workOrders?.length || 0;
      });
      return;
    }

    formData.rawMaterials?.forEach((material, materialIndex) => {
      const currentWorkOrdersLength = material.workOrders?.length || 0;
      const prevLength = prevWorkOrdersLengthRef.current[materialIndex] || 0;
      
      if (currentWorkOrdersLength > prevLength) {
        setTimeout(() => {
          const lastWorkOrder = document.querySelector(`[data-material-index="${materialIndex + 1}"][data-work-order-index]:last-child`);
          if (lastWorkOrder) {
            lastWorkOrder.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
      prevWorkOrdersLengthRef.current[materialIndex] = currentWorkOrdersLength;
    });
  }, [formData.rawMaterials]);

  // Scroll to newly added material
  useEffect(() => {
    if (lastAddedMaterialIndex !== null && formData.rawMaterials && formData.rawMaterials.length > lastAddedMaterialIndex) {
      // Wait for React to render the new material
      setTimeout(() => {
        const element = document.querySelector(`[data-raw-material-index="${lastAddedMaterialIndex}"]`);
        if (element) {
          // Scroll to start (top) of the material card
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setLastAddedMaterialIndex(null); // Reset after scrolling
        } else {
          // Retry after a bit more time if element not found
          setTimeout(() => {
            const retryElement = document.querySelector(`[data-raw-material-index="${lastAddedMaterialIndex}"]`);
            if (retryElement) {
              retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setLastAddedMaterialIndex(null);
            }
          }, 200);
        }
      }, 100);
    }
  }, [lastAddedMaterialIndex, formData.rawMaterials]);

  // Scroll to material after removal
  useEffect(() => {
    if (scrollToMaterialIndex !== null && selectedComponent) {
      const materialsForComponent = getMaterialsForSelectedComponent();
      
      setTimeout(() => {
        if (scrollToMaterialIndex === -1) {
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (scrollToMaterialIndex >= 0 && scrollToMaterialIndex < materialsForComponent.length) {
          // Find the material at the target index
          const targetMaterial = materialsForComponent[scrollToMaterialIndex];
          if (targetMaterial) {
            const targetActualIndex = formData.rawMaterials.findIndex(m => 
              m === targetMaterial || 
              (m.componentName === targetMaterial.componentName && 
               m.materialDescription === targetMaterial.materialDescription)
            );
            
            if (targetActualIndex !== -1) {
              const element = document.querySelector(`[data-raw-material-index="${targetActualIndex}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }
        }
        
        setScrollToMaterialIndex(null); // Reset after scrolling
      }, 200);
    }
  }, [scrollToMaterialIndex, formData.rawMaterials, selectedComponent]);

  // Remove border from fiber testing requirements input
  useEffect(() => {
    const removeBorders = () => {
      const inputs = document.querySelectorAll('[id^="fiber-testing-wrapper"] input');
      inputs.forEach(input => {
        input.style.border = 'none';
        input.style.borderWidth = '0';
        input.style.outline = 'none';
        input.style.boxShadow = 'none';
        input.style.padding = '4px 0';
        input.style.backgroundColor = 'transparent';
      });
    };
    
    removeBorders();
    // Also remove after a short delay to catch any delayed renders
    const timeout = setTimeout(removeBorders, 100);
    return () => clearTimeout(timeout);
  }, [formData.rawMaterials, selectedComponent]);

  const materialsForComponent = getMaterialsForSelectedComponent();

  return (
    <div className="w-full">
      {/* Header with proper spacing */}
      <div style={{ marginBottom: '28px' }} className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PART-2 BILL OF MATERIAL & WORK IN PROGRESS</h2>
          {/* <p className="text-sm text-gray-600">Bill of material & work in progress</p> */}
        </div>
        {renderHeaderAction}
      </div>

      {/* Component Selection - OUTSIDE form border */}
      <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '300px' }}>
          <label className="text-sm font-semibold text-gray-700 mb-2" style={{ display: 'block', marginBottom: '8px' }}>
                    COMPONENT
                  </label>
          <SearchableDropdown
            value={selectedComponent || ''}
            onChange={(selectedValue) => {
              setSelectedComponent(selectedValue || '');
            }}
            options={getAllComponents()}
            placeholder="Select component"
            className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
            style={{ padding: '10px 14px', height: '44px', width: '100%' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
            }}
                  />
                </div>
      </div>

      {/* Form for selected component */}
      {selectedComponent && (
        <div className="bg-gray-50 rounded-xl border border-gray-200" style={{ padding: '24px', marginBottom: '24px' }}>
          {materialsForComponent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ marginBottom: '20px', color: '#6b7280' }}>Add raw materials for this component</p>
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <SearchableDropdown
                  options={['Fabric', 'Yarn', 'Trim & Accessory', 'Foam', 'Fiber']}
                  onChange={(selectedType) => {
                    if (selectedType) {
                      const currentLength = formData.rawMaterials?.length || 0;
                      addRawMaterialWithType(selectedType, selectedComponent);
                      setShowMaterialTypeModal(false);
                      // Set the index of the newly added material
                      setLastAddedMaterialIndex(currentLength);
                    }
                  }}
                  placeholder="Select material type"
                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                  style={{ padding: '10px 14px', height: '44px', width: '100%' }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
            </div>
          ) : (
            materialsForComponent.map((material, materialIndex) => {
              // Find the actual index in rawMaterials array
              // Try multiple matching strategies to handle newly added materials
              let actualIndex = formData.rawMaterials.findIndex(m => m === material);
              
              // If direct reference fails, try matching by component and material type
              // This works even when materialDescription is empty
              if (actualIndex === -1) {
                const materialsForThisComponent = formData.rawMaterials
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.componentName === selectedComponent);
                
                // Find the material at the same position in the filtered list
                if (materialIndex < materialsForThisComponent.length) {
                  actualIndex = materialsForThisComponent[materialIndex].idx;
                } else {
                  // Fallback: match by componentName and materialType
                  actualIndex = formData.rawMaterials.findIndex(m => 
                    m.componentName === material.componentName && 
                    m.materialType === material.materialType &&
                    (m.materialDescription === material.materialDescription || 
                     (!m.materialDescription && !material.materialDescription))
                  );
                }
              }
              
              // Safety check: if still not found, use proper calculation
              if (actualIndex === -1) {
                console.warn('Could not find material index, recalculating:', material);
                // Don't use materialIndex as fallback - it's the filtered array index
                // Instead, recalculate using the filtered list approach
                const allMaterialsForComponent = formData.rawMaterials
                  .map((m, idx) => ({ m, idx }))
                  .filter(({ m }) => m.componentName === selectedComponent);
                
                if (materialIndex < allMaterialsForComponent.length) {
                  actualIndex = allMaterialsForComponent[materialIndex].idx;
                } else {
                  console.error('Cannot find material index even after recalculation. Skipping render.');
                  return null; // Skip rendering this material to prevent errors
                }
              }
              
              // Use a more stable key that includes component and position
              const stableKey = `${selectedComponent}-${materialIndex}-${actualIndex}`;
              const materialNumber = materialIndex + 1;
              return (
                <div key={stableKey} data-raw-material-index={actualIndex} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: materialIndex < materialsForComponent.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  {/* Material Header */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                      <h4 className="text-sm font-bold text-gray-700">MATERIAL {materialNumber}</h4>
                      {materialsForComponent.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this material?')) {
                              // Store which material index to scroll to after removal
                              if (materialIndex > 0) {
                                // Scroll to previous material (will be at materialIndex - 1 after removal)
                                setScrollToMaterialIndex(materialIndex - 1);
                              } else {
                                // If removing first material, scroll to top
                                setScrollToMaterialIndex(-1);
                              }
                              
                              removeRawMaterial(actualIndex);
                            }
                          }}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      )}
              </div>
              
              {/* Material Details */}
              <div className="flex flex-wrap items-start gap-6">
                <Field
                  label="MATERIAL TYPE"
                  width="sm"
                  error={errors[`rawMaterial_${actualIndex}_materialType`]}
                >
                  <SearchableDropdown
                    value={material.materialType || ''}
                    onChange={(selectedMaterialType) => {
                      handleRawMaterialChange(actualIndex, 'materialType', selectedMaterialType);
                      // Clear sub-material when material type changes
                      if (selectedMaterialType !== material.materialType) {
                        handleRawMaterialChange(actualIndex, 'subMaterial', '');
                      }
                    }}
                    options={['Fabric', 'Yarn', 'Trim & Accessory', 'Foam', 'Fiber']}
                    placeholder="select material"
                    className={errors[`rawMaterial_${actualIndex}_materialType`] ? 'border-destructive' : ''}
                  />
                </Field>

                {/* SUB-MATERIAL field - only show when materialType is Yarn */}
                {material.materialType === "Yarn" && (
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      SUB-MATERIAL
                    </label>
                    <SearchableDropdown
                      value={material.subMaterial || ''}
                      onChange={(selectedSubMaterial) => {
                        handleRawMaterialChange(actualIndex, 'subMaterial', selectedSubMaterial);
                        // Clear yarn fields when sub-material changes to stitching thread
                        if (selectedSubMaterial === 'Stitching Thread') {
                          handleRawMaterialChange(actualIndex, 'fiberType', '');
                          handleRawMaterialChange(actualIndex, 'yarnType', '');
                        }
                      }}
                      options={['Stitching Thread']}
                      placeholder="Select sub-material (optional)"
                      className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                      style={{ padding: '10px 14px', width: '200px', height: '44px' }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = '';
                      }}
                    />
                  </div>
                )}

                <Field
                  label={
                    <>
                      MATERIAL DESC <span className="text-red-600">*</span>
                    </>
                  }
                  width="sm"
                  error={errors[`rawMaterial_${actualIndex}_materialDescription`]}
                >
                  {isAutoDescriptionType(material.materialType) ? (
                    // Auto-generated from the spec fields below. Read-only: clicking
                    // reveals the source spec dropdowns (incl. Advance Spec) so the
                    // user edits the origin instead of the derived text.
                    <Input
                      type="text"
                      value={material.materialDescription || ''}
                      onChange={() => {}}
                      readOnly
                      onClick={() => focusMaterialSpecSource(actualIndex, material.materialType, handleRawMaterialChange)}
                      title="Auto-generated from specifications — click to edit the source fields"
                      placeholder="Fill specifications below"
                      className="cursor-pointer bg-muted/40"
                      aria-invalid={errors[`rawMaterial_${actualIndex}_materialDescription`] ? true : undefined}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={material.materialDescription}
                      onChange={(e) => {
                        handleRawMaterialChange(actualIndex, 'materialDescription', e.target.value);
                      }}
                      placeholder="e.g., Cotton 200TC"
                      aria-invalid={errors[`rawMaterial_${actualIndex}_materialDescription`] ? true : undefined}
                      required
                    />
                  )}
                </Field>
                
                {/* Net CNS and Unit: hidden for Stitching Thread (uses stitchingThreadQty + stitchingThreadUnit) */}
                {!(material.materialType === "Yarn" && material.subMaterial === "Stitching Thread") && (
                  <>
                <Field
                  label={
                    <>
                      NET CNS/PC <span className="text-red-600">*</span>
                    </>
                  }
                  width="sm"
                  error={errors[`rawMaterial_${actualIndex}_netConsumption`]}
                >
                  <Input
                    type="number"
                    step="0.001"
                    value={material.netConsumption}
                    onChange={(e) => {
                      handleRawMaterialChange(actualIndex, 'netConsumption', e.target.value);
                    }}
                    placeholder="0.000"
                    aria-invalid={errors[`rawMaterial_${actualIndex}_netConsumption`] ? true : undefined}
                    required
                  />
                </Field>
                
                <Field
                  label={
                    <>
                      UNIT <span className="text-red-600">*</span>
                    </>
                  }
                  width="sm"
                  error={errors[`rawMaterial_${actualIndex}_unit`]}
                >
                  <SearchableDropdown
                    value={material.unit || ''}
                    onChange={(selectedValue) => {
                      handleRawMaterialChange(actualIndex, 'unit', selectedValue);
                    }}
                    // Trim & Accessory rows can be counted in pieces (e.g. BUTTONS),
                    // so include PCS in their unit list. Other material types
                    // (Fabric / Fiber / Foam / Yarn) keep CM and KGS only.
                    options={
                      material.materialType === 'Trim & Accessory'
                        ? UNIT_OPTIONS_WITH_PCS
                        : UNIT_OPTIONS
                    }
                    placeholder="Select unit"
                    placeholderDim
                    className={errors[`rawMaterial_${actualIndex}_unit`] ? 'border-destructive' : ''}
                    required
                  />
                </Field>
                  </>
                )}
              </div>
              
              {/* Stitching Thread Section - only show when subMaterial is "Stitching Thread" */}
              {material.materialType === "Yarn" && material.subMaterial === "Stitching Thread" && (
                <StitchingThreadSpec
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

              {/* Fiber Type Hierarchy Dropdowns - only show when subMaterial is NOT "Stitching Thread" */}
              {material.materialType === "Yarn" && material.subMaterial !== "Stitching Thread" && (
                <YarnSpec
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
            </div>
            
            {/* Fabric Specifications Section */}
            {material.materialType == "Fabric" && (
              <FabricSpec
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

            {/* Trim & Accessory Section */}
            {material.materialType === "Trim & Accessory" && (
              <>
                <div style={{ marginTop: '32px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 data-spec-anchor className="text-sm font-bold text-gray-800">TRIM & ACCESSORY SPECIFICATIONS</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200" style={{ padding: '20px' }}>
                    {/* Import Trim/Accessory fields from Step3 */}
                    {/* For now, we'll conditionally render a basic structure */}
                    {/* The full trim/accessory fields will be imported from Step3 rendering logic */}
                    <div className="w-full mt-8 pt-6 border-t border-gray-100">
                      <div className="flex flex-col" style={{ width: '280px', marginBottom: '20px' }}>
                        <label className="text-sm font-bold text-gray-800 mb-2">
                          TRIM/ACCESSORY <span className="text-red-600">*</span>
                        </label>
                        <SearchableDropdown
                          value={material.trimAccessory || ''}
                          onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'trimAccessory', selectedValue)}
                          options={['BUCKLES', 'BUTTONS', 'CABLE-TIES', 'CORD STOPS', 'FELT', 'HOOKS-EYES', 'INTERLINING(FUSING)', 'MAGNETIC CLOSURE', 'PIN-BARBS', 'REFLECTIVE TAPES', 'RINGS-LOOPS', 'RIVETS', 'SEAM TAPE', 'SHOULDER PADS', 'VELCRO', 'NIWAR-WEBBING', 'RIBBING', 'LACE', 'FIRE RETARDANT (FR) TRIMS', 'ZIPPERS']}
                          placeholder="Select or type Trim/Accessory"
                          style={{ width: '280px' }}
                          className={errors[`rawMaterial_${actualIndex}_trimAccessory`] ? 'border-red-600' : ''}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                          onBlur={(e) => e.target.style.boxShadow = ''}
                        />
                        {errors[`rawMaterial_${actualIndex}_trimAccessory`] && (
                          <span className="text-red-600 text-xs mt-1">{errors[`rawMaterial_${actualIndex}_trimAccessory`]}</span>
                        )}
                      </div>
                      
                      {/* Conditional fields based on trim/accessory type */}
                      <TrimAccessoryFields
                        material={material}
                        materialIndex={actualIndex}
                        handleChange={handleRawMaterialChange}
                        errors={errors}
                        errorPrefix={`rawMaterial_${actualIndex}`}
                      />
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
                </div>
              </>
            )}

            {/* Foam Section */}
            {material.materialType === "Foam" && (
              <FoamSpec
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

            {/* Fiber Section */}
            {material.materialType === "Fiber" && (
              <FiberSpec
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
            





            <WorkOrdersSection
              material={material}
              materialIndex={materialIndex}
              actualIndex={actualIndex}
              errors={errors}
              handleWorkOrderChange={handleWorkOrderChange}
              addWorkOrder={addWorkOrder}
              removeWorkOrder={removeWorkOrder}
              mergeOptions={mergeOptions}
              addCustomOption={addCustomOption}
            />
          </div>
              );
            })
          )}

          {/* Bottom Save and Add Raw Material Buttons - Only show when materials exist */}
          {materialsForComponent.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleBottomSave}
                className={cn(
                  'min-w-[90px]',
                  saveStatus === 'error'
                    ? 'text-red-600 border-red-500 hover:text-red-700'
                    : isComponentDone(selectedComponent)
                      ? 'text-green-600 hover:text-green-700'
                      : ''
                )}
              >
                {saveStatus === 'error'
                  ? 'Not Saved'
                  : isComponentDone(selectedComponent)
                    ? 'Saved'
                    : 'Save'}
              </Button>
            <div style={{ position: 'relative' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMaterialTypeModal(!showMaterialTypeModal)}
              >
                Add Raw Material
              </Button>
              {showMaterialTypeModal && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    minWidth: '200px'
                  }}
                >
                  <SearchableDropdown
                    options={['Fabric', 'Yarn', 'Trim & Accessory', 'Foam', 'Fiber']}
                    onChange={(selectedType) => {
                      if (selectedType) {
                        const currentLength = formData.rawMaterials?.length || 0;
                        addRawMaterialWithType(selectedType, selectedComponent);
                        setShowMaterialTypeModal(false);
                        // Set the index of the newly added material
                        setLastAddedMaterialIndex(currentLength);
                      }
                    }}
                    placeholder="Select material type"
                    onBlur={() => {
                      setTimeout(() => setShowMaterialTypeModal(false), 200);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step2;
