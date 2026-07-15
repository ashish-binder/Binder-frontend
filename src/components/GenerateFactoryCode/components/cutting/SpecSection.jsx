import { useEffect, useState } from 'react';
import WorkOrdersSection from '../workOrders/WorkOrdersSection';

// Cut/Sew · Section-1 (spec). Flow: SELECT COMPONENT → its work orders of `woType`
// (CUTTING | SEWING, declared in BOM & WO) rendered with the FULL work-order form —
// reusing WorkOrdersSection restricted to that type, with read-only fetched units +
// editable CUT/SEW size. WOs are added in BOM & WO; here they are filled.
//
// WorkOrdersSection works per raw material and per work-order index, so for each of
// the component's raw materials we pass a copy filtered to `woType` and wrap the
// change/remove handlers to translate the filtered index back to the original one.
const SpecSection = ({ formData, errors, woType, prefix, sizeLabel, handleWorkOrderChange, removeWorkOrder }) => {
  const components = formData?.products?.[0]?.components || [];
  const rawMaterials = formData?.rawMaterials || [];
  const names = [...new Set(components.map((c) => c.productComforter).filter(Boolean))];
  const [selected, setSelected] = useState(names[0] || '');
  // When the component list loads/changes (e.g. reopening a saved IPC), make sure a
  // valid component stays selected so its saved data is shown.
  useEffect(() => {
    if (names.length && !names.includes(selected)) setSelected(names[0]);
  }, [names.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const compMats = rawMaterials
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m?.componentName === selected)
    .map(({ m, i }) => ({
      m,
      i,
      woIdx: (m.workOrders || []).map((_, wi) => wi).filter((wi) => m.workOrders[wi]?.workOrder === woType),
    }))
    .filter(({ woIdx }) => woIdx.length > 0);

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block" style={{ marginBottom: '8px' }}>
        Select component
      </label>
      {names.length > 0 ? (
        <div className="flex flex-wrap gap-2" style={{ marginBottom: '18px' }}>
          {names.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelected(name)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${selected === name ? 'border-primary bg-accent font-semibold text-foreground' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" style={{ marginBottom: '12px' }}>Add components in Product Spec first.</p>
      )}

      {selected && compMats.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-background/50 text-sm text-muted-foreground text-center" style={{ padding: '20px' }}>
          No {woType} work orders defined for &quot;{selected}&quot; in BOM &amp; WO. Add one there first, then fill its spec here.
        </div>
      )}

      {compMats.map(({ m, i, woIdx }) => {
        const filteredMaterial = { ...m, workOrders: woIdx.map((wi) => m.workOrders[wi]) };
        const change = (ai, fi, field, value) => handleWorkOrderChange(ai, woIdx[fi], field, value);
        const remove = (ai, fi) => removeWorkOrder(ai, woIdx[fi]);
        return (
          <div key={i} className="rounded-xl border border-border bg-card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
            <div className="text-xs text-muted-foreground" style={{ marginBottom: '4px' }}>
              Material: <span className="font-semibold text-foreground/80">{m.materialDescription || '—'}</span>
            </div>
            <WorkOrdersSection
              material={filteredMaterial}
              materialIndex={i}
              actualIndex={i}
              errors={errors}
              handleWorkOrderChange={change}
              addWorkOrder={() => {}}
              removeWorkOrder={remove}
              restrictType={woType}
              showSizeFields
              sizePrefix={prefix}
              sizeLabel={sizeLabel}
              unitsReadOnly
              hideAdd
            />
          </div>
        );
      })}
    </div>
  );
};

export default SpecSection;
