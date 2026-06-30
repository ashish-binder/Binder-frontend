// FiberMicrofiber — extracted from FiberSpec.jsx (Step 2). Pure presentational.
import { Button } from '@/components/ui/button';
import QualityVerificationToggle from '../QualityVerificationToggle';
import { MATERIAL_APPROVAL_OPTIONS } from '../../data/approvalOptions';
import SearchableDropdown from '../SearchableDropdown';

const FiberMicrofiber = ({
  material,
  actualIndex,
  handleRawMaterialChange,
}) => (
  <>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* FIBER TYPE */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">FIBER TYPE</label>
      <SearchableDropdown
        value={material.fiberFiberType || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberFiberType', selectedValue)}
        options={['Microfiber Polyester']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* SUBTYPE */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">SUBTYPE</label>
      <SearchableDropdown
        value={material.fiberSubtype || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberSubtype', selectedValue)}
        options={['Standard Microfiber', 'Micro-Gel', 'Micro-Cluster', 'Micro-Denier Ball']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* FORM */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">FORM</label>
      <SearchableDropdown
        value={material.fiberForm || ''}
        onChange={(selectedValue) => {
          handleRawMaterialChange(actualIndex, 'fiberForm', selectedValue);
          // Clear dependent fields when form changes
          if (selectedValue !== material.fiberForm) {
            handleRawMaterialChange(actualIndex, 'fiberQty', '');
            handleRawMaterialChange(actualIndex, 'fiberGsm', '');
            handleRawMaterialChange(actualIndex, 'fiberLength', '');
            handleRawMaterialChange(actualIndex, 'fiberWidth', '');
            handleRawMaterialChange(actualIndex, 'fiberQtyValue', '');
            handleRawMaterialChange(actualIndex, 'fiberQtyType', '');
          }
        }}
        options={['Loose Fiber', 'Cluster/Ball Fiber', 'Wadding']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* DENIER */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">DENIER</label>
      <SearchableDropdown
        value={material.fiberDenier || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberDenier', selectedValue)}
        options={['0.7D (Ultra-Micro)', '0.9D', '1.0D', '1.2D']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* SILICONIZED */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">SILICONIZED</label>
      <SearchableDropdown
        value={material.fiberSiliconized || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberSiliconized', selectedValue)}
        options={['Siliconized (standard for microfiber)', 'Super Siliconized']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* COLOUR */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">COLOUR</label>
      <SearchableDropdown
        value={material.fiberColour || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberColour', selectedValue)}
        options={['Optical White', 'Super White']}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* TESTING REQUIREMENTS - Multi-select with chips */}
    <div className="flex flex-col col-span-1 md:col-span-2 lg:col-span-4">
      <label className="text-sm font-semibold text-gray-700 mb-2">TESTING REQUIREMENTS</label>
      <div style={{ position: 'relative' }}>
        <div
          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus-within:border-indigo-500 focus-within:outline-none"
          style={{ 
            padding: '8px 12px',
            minHeight: '44px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            cursor: 'text'
          }}
        >
          {/* Selected chips */}
          {(Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : []).map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe'
              }}
            >
              {req}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                  const updated = current.filter((_, i) => i !== index);
                  handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                }}
                style={{
                  marginLeft: '4px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: '#4338ca',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  lineHeight: '1',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px'
                }}
              >
                ×
              </button>
            </span>
          ))}
          {/* Dropdown for selecting new options */}
          <div 
            id={`fiber-testing-wrapper-microfiber-${actualIndex}`}
            style={{ flex: 1, minWidth: '200px' }}
          >
                        <SearchableDropdown
              value=""
              strictMode={false}
              onChange={(selectedValue) => {
                const options = ['Denier Verification', 'Loft Test', 'Resilience', 'Dust Mite Resistance'];
                if (selectedValue && options.includes(selectedValue)) {
                  const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                  if (!current.includes(selectedValue)) {
                    const updated = [...current, selectedValue];
                    handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                  }
                }
              }}
              options={['Denier Verification', 'Loft Test', 'Resilience', 'Dust Mite Resistance']}
              placeholder={(Array.isArray(material.fiberTestingRequirements) && material.fiberTestingRequirements.length === 0) ? "Select testing requirements" : "Add more..."}
              className="border-0 outline-none"
              style={{ 
                padding: '4px 0', 
                height: 'auto', 
                minHeight: '32px',
                backgroundColor: 'transparent', 
                boxShadow: 'none',
                border: 'none',
                borderWidth: '0',
                outline: 'none'
              }}
              onFocus={(e) => {
                const input = e.target;
                input.style.border = 'none';
                input.style.borderWidth = '0';
                input.style.outline = 'none';
                input.style.boxShadow = 'none';
                const container = input.closest('[class*="border-2"]');
                if (container) {
                  container.style.borderColor = '#667eea';
                  container.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }
                const handleKeyDown = (keyEvent) => {
                  if (keyEvent.key === 'Enter' && input.value && input.value.trim()) {
                    keyEvent.preventDefault();
                    keyEvent.stopPropagation();
                    const newValue = input.value.trim();
                    const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                    const options = ['Denier Verification', 'Loft Test', 'Resilience', 'Dust Mite Resistance'];
                    if (!current.includes(newValue)) {
                      if (!options.includes(newValue)) {
                        const updated = [...current, newValue];
                        handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                      }
                      input.value = '';
                      input.blur();
                    }
                  }
                };
                input.addEventListener('keydown', handleKeyDown);
                input._enterHandler = handleKeyDown;
              }}
              onBlur={(e) => {
                const input = e.target;
                if (input._enterHandler) {
                  input.removeEventListener('keydown', input._enterHandler);
                  input._enterHandler = null;
                }
                input.style.border = 'none';
                input.style.borderWidth = '0';
                input.style.outline = 'none';
                input.style.boxShadow = 'none';
                const container = input.closest('[class*="border-2"]');
                if (container) {
                  container.style.borderColor = '#e5e7eb';
                  container.style.boxShadow = 'none';
                }
                if (input.value && input.value.trim()) {
                  const typedValue = input.value.trim();
                  const options = ['Denier Verification', 'Loft Test', 'Resilience', 'Dust Mite Resistance'];
                  if (!options.includes(typedValue)) {
                    const current = Array.isArray(material.fiberTestingRequirements) ? material.fiberTestingRequirements : [];
                    if (!current.includes(typedValue)) {
                      const updated = [...current, typedValue];
                      handleRawMaterialChange(actualIndex, 'fiberTestingRequirements', updated);
                    }
                  }
                  input.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Conditional: QTY for Loose Fiber */}
    {material.fiberForm === 'Loose Fiber' && (
      <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">QTY</label>
        <input
          type="text"
          value={material.fiberQty || ''}
          onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberQty', e.target.value)}
          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
          style={{ padding: '10px 14px', height: '44px', width: '300px' }}
          placeholder="Enter QTY in KGS PER PC"
        />
      </div>
    )}

    {/* Conditional: SIZE SPEC for Wadding */}
    {material.fiberForm === 'Wadding' && (
      <>
        <div className="col-span-1 md:col-span-2 lg:col-span-4" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <label className="text-sm font-bold text-gray-800 mb-4 block">SIZE SPEC</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* GSM */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">GSM</label>
              <input
                type="text"
                value={material.fiberGsm || ''}
                onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberGsm', e.target.value)}
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
                placeholder="Enter GSM"
              />
            </div>
            
            {/* LENGTH (CM) */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">LENGTH (CM)</label>
              <input
                type="text"
                value={material.fiberLength || ''}
                onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberLength', e.target.value)}
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
                placeholder="Enter length"
              />
            </div>
            
            {/* YARDAGE (CNS) */}
            <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">WIDTH (CM)</label>
                <input
                  type="text"
                  value={material.fiberWidth || ''}
                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberWidth', e.target.value)}
                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                  style={{ padding: '10px 14px', height: '44px', width: '200px' }}
                  placeholder="Enter width"
                />
              </div>

          </div>
          
          {/* QTY with WIDTH (CM) and KGS (CNS) */}
          <div className="flex flex-col" style={{ marginTop: '16px' }}>
            <label className="text-sm font-semibold text-gray-700 mb-2">QTY</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ width: 'fit-content' }}>
              <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">YARDAGE (CNS)</label>
              <input
                type="text"
                value={material.fiberQtyValue || ''}
                onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberQtyValue', e.target.value)}
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
                placeholder="Enter yardage"
              />
            </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">KGS (CNS)</label>
                <input
                  type="text"
                  value={material.fiberQty || ''}
                  onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberQty', e.target.value)}
                  className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                  style={{ padding: '10px 14px', height: '44px', width: '200px' }}
                  placeholder="Enter KGS"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )}

    {/* SURPLUS % */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">SURPLUS %</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={material.fiberSurplus || ''}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9.]/g, '');
            handleRawMaterialChange(actualIndex, 'fiberSurplus', numericValue);
          }}
          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
          style={{ padding: '10px 32px 10px 14px', width: '100%', height: '44px' }}
          placeholder="2-3%"
        />
        <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
      </div>
    </div>

    {/* WASTAGE % */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">WASTAGE %</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={material.fiberWastage || ''}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9.]/g, '');
            handleRawMaterialChange(actualIndex, 'fiberWastage', numericValue);
          }}
          className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
          style={{ padding: '10px 32px 10px 14px', width: '100%', height: '44px' }}
          placeholder="2-3%"
        />
        <span style={{ position: 'absolute', right: '14px', color: '#6b7280', pointerEvents: 'none', userSelect: 'none' }}>%</span>
      </div>
    </div>

    {/* APPROVAL */}
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">APPROVAL</label>
      <SearchableDropdown
        value={material.fiberApproval || ''}
        onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberApproval', selectedValue)}
        options={MATERIAL_APPROVAL_OPTIONS}
        placeholder="Select or type"
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', height: '44px' }}
      />
    </div>

    {/* REMARKS */}
    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">REMARKS</label>
      <textarea
        value={material.fiberRemarks || ''}
        onChange={(e) => handleRawMaterialChange(actualIndex, 'fiberRemarks', e.target.value)}
        className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
        style={{ padding: '10px 14px', minHeight: '44px' }}
        rows="1"
        placeholder="Micro-Gel cluster mimics down feel, Ideal for hypoallergenic products"
      />
    </div>

    {/* ADVANCE SPEC Button and Fields */}
    <div className="col-span-1 md:col-span-2 lg:col-span-4 w-full" style={{ marginTop: '20px' }}>
      <button
        type="button"
        onClick={() => handleRawMaterialChange(actualIndex, 'showFiberAdvancedSpec', !material.showFiberAdvancedSpec)}
        style={{
          backgroundColor: material.showFiberAdvancedSpec ? '#667eea' : '#ffffff',
          borderColor: material.showFiberAdvancedSpec ? '#667eea' : '#e5e7eb',
          color: material.showFiberAdvancedSpec ? '#ffffff' : '#374151',
          border: '2px solid',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.2s',
          boxShadow: material.showFiberAdvancedSpec ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!material.showFiberAdvancedSpec) {
            e.target.style.backgroundColor = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!material.showFiberAdvancedSpec) {
            e.target.style.backgroundColor = '#ffffff';
          }
        }}
      >
        {material.showFiberAdvancedSpec ? '▼ ADVANCE SPEC' : '▶ ADVANCE SPEC'}
      </button>
      {material.showFiberAdvancedSpec && (
        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FIBER LENGTH */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">FIBER LENGTH</label>
              <SearchableDropdown
                value={material.fiberMicrofiberFiberLength || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberFiberLength', selectedValue)}
                options={['32mm', '51mm', '64mm']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* STRUCTURE */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">STRUCTURE</label>
              <SearchableDropdown
                value={material.fiberMicrofiberStructure || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberStructure', selectedValue)}
                options={['Solid', 'Hollow (for extra loft)']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* CLUSTER TYPE */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">CLUSTER TYPE</label>
              <SearchableDropdown
                value={material.fiberMicrofiberClusterType || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberClusterType', selectedValue)}
                options={['Standard Cluster', 'Premium Gel-Cluster', 'Down-Like Cluster']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* CLUSTER SIZE */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">CLUSTER SIZE</label>
              <SearchableDropdown
                value={material.fiberMicrofiberClusterSize || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberClusterSize', selectedValue)}
                options={['Small (marble size)', 'Medium (golf ball)', 'Large (tennis ball)']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* ANTI-MICROBIAL */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">ANTI-MICROBIAL</label>
              <SearchableDropdown
                value={material.fiberMicrofiberAntiMicrobial || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberAntiMicrobial', selectedValue)}
                options={['Standard', 'Anti-Microbial', 'Anti-Bacterial', 'Anti-Allergen']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* HYPOALLERGENIC */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">HYPOALLERGENIC</label>
              <SearchableDropdown
                value={material.fiberMicrofiberHypoallergenic || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberHypoallergenic', selectedValue)}
                options={['Standard', 'Certified Hypoallergenic']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* LOFT / FILL POWER */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">LOFT / FILL POWER</label>
              <SearchableDropdown
                value={material.fiberMicrofiberLoftFillPower || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberLoftFillPower', selectedValue)}
                options={['Medium Loft', 'High Loft', 'Ultra-High Loft']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* HAND FEEL */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">HAND FEEL</label>
              <SearchableDropdown
                value={material.fiberMicrofiberHandFeel || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberHandFeel', selectedValue)}
                options={['Soft', 'Ultra-Soft', 'Down-Like']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>

            {/* CERTIFICATION */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">CERTIFICATION</label>
              <SearchableDropdown
                value={material.fiberMicrofiberCertification || ''}
                onChange={(selectedValue) => handleRawMaterialChange(actualIndex, 'fiberMicrofiberCertification', selectedValue)}
                options={['OEKO-TEX', 'Downpass Alternative', 'CertiPUR (if foam combo)']}
                placeholder="Select or type"
                className="border-2 rounded-lg text-sm transition-all bg-white text-gray-900 border-[#e5e7eb] focus:border-indigo-500 focus:outline-none"
                style={{ padding: '10px 14px', height: '44px' }}
              />
            </div>
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
    </div>
  </div>
  </>
);

export default FiberMicrofiber;
