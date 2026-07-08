import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import SearchableDropdown from '../SearchableDropdown';
import MultiSelectDropdown from '../artwork/MultiSelectDropdown';
import { FINISHING_PROCESSES, FINISHING_TYPE_MAP } from '../../data/finishingData';

const PROCESS_OPTIONS = FINISHING_PROCESSES.map((p) => p.process);

// Finishing (Cut, Sew & Finishing · part 3). Like Cutting/Sewing: SELECT a component
// that has a FINISHING work order (declared in BOM & WO), then fill 3 fields per work
// order — Finishing Process (select/type), Process Type (multi-select/type),
// Remarks (optional). Values are stored on the work order via handleWorkOrderChange.
const FinishingSection = ({ formData, handleWorkOrderChange }) => {
  const rawMaterials = formData?.rawMaterials || [];

  // Components that have at least one FINISHING work order.
  const names = [...new Set(
    rawMaterials
      .filter((m) => (m.workOrders || []).some((wo) => wo?.workOrder === 'FINISHING'))
      .map((m) => m.componentName)
      .filter(Boolean)
  )];
  const [selected, setSelected] = useState(names[0] || '');

  // The selected component's FINISHING work orders with their absolute indices.
  const wos = [];
  rawMaterials.forEach((m, ai) => {
    if (m?.componentName !== selected) return;
    (m.workOrders || []).forEach((wo, wi) => {
      if (wo?.workOrder === 'FINISHING') wos.push({ wo, ai, wi });
    });
  });

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
        <div className="rounded-xl border border-dashed border-border bg-background/50 text-sm text-muted-foreground text-center" style={{ padding: '20px' }}>
          No component has a FINISHING work order in BOM &amp; WO. Add one there first, then fill it here.
        </div>
      )}

      {wos.map(({ wo, ai, wi }, i) => (
        <div key={`${ai}-${wi}`} className="rounded-xl border border-border bg-card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
          <h4 className="text-sm font-semibold text-foreground/80" style={{ marginBottom: '12px' }}>FINISHING {i + 1}</h4>
          <div className="flex flex-wrap items-start gap-4">
            <Field label="FINISHING PROCESS" required width="md">
              <SearchableDropdown
                value={wo.finishingProcess || ''}
                onChange={(v) => handleWorkOrderChange(ai, wi, 'finishingProcess', v)}
                options={PROCESS_OPTIONS}
                placeholder="Select or type process"
                strictMode={false}
              />
            </Field>
            <Field label="PROCESS TYPE" required width="md">
              <MultiSelectDropdown
                value={wo.finishingTypes || []}
                onChange={(vals) => handleWorkOrderChange(ai, wi, 'finishingTypes', vals)}
                options={FINISHING_TYPE_MAP[wo.finishingProcess] || []}
              />
            </Field>
            <Field label="REMARKS" width="md">
              <Input
                value={wo.remarks && wo.remarks !== 'null' ? wo.remarks : ''}
                onChange={(e) => handleWorkOrderChange(ai, wi, 'remarks', e.target.value)}
                placeholder="Remarks (optional)"
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinishingSection;
