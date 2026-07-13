import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchableDropdown from '../SearchableDropdown';
import MultiSelectDropdown from '../artwork/MultiSelectDropdown';
import { FINISHING_PROCESSES, FINISHING_TYPE_MAP } from '../../data/finishingData';

const PROCESS_OPTIONS = FINISHING_PROCESSES.map((p) => p.process);

// One FINISHING work order holds one or more "finishing process" GROUPS, each with its
// own { process, types, remarks }. New WOs store the list on `finishingGroups`; older
// rows may still carry the flat finishingProcess / finishingTypes / remarks — this
// normalizer wraps those into a single group so they keep showing / validating.
export const getFinishingGroups = (wo) => {
  if (Array.isArray(wo?.finishingGroups) && wo.finishingGroups.length) return wo.finishingGroups;
  if (wo?.finishingProcess || (wo?.finishingTypes || []).length) {
    return [{ process: wo.finishingProcess || '', types: wo.finishingTypes || [], remarks: wo.remarks || '' }];
  }
  return [];
};

const emptyGroup = () => ({ process: '', types: [], remarks: '' });

// Finishing (Cut, Sew & Finishing · part 3). Like Cutting/Sewing: SELECT a component
// that has a FINISHING work order (declared in BOM & WO). Each work order carries a
// LIST of finishing processes — every process is a group of { process, process type,
// remark }, and you can "Add finishing process" for as many as the component needs.
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

      {wos.map(({ wo, ai, wi }, i) => {
        // Always show at least one group row to fill.
        const stored = getFinishingGroups(wo);
        const groups = stored.length ? stored : [emptyGroup()];
        const commit = (next) => handleWorkOrderChange(ai, wi, 'finishingGroups', next);
        const updateGroup = (gi, field, value) => commit(groups.map((g, idx) => (idx === gi ? { ...g, [field]: value } : g)));
        const addGroup = () => commit([...groups, emptyGroup()]);
        const removeGroup = (gi) => commit(groups.filter((_, idx) => idx !== gi));

        return (
          <div key={`${ai}-${wi}`} className="rounded-xl border border-border bg-card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
            <h4 className="text-sm font-semibold text-foreground/80" style={{ marginBottom: '12px' }}>FINISHING {i + 1}</h4>

            {groups.map((g, gi) => (
              <div
                key={gi}
                className="rounded-lg border border-border/70 bg-background/40"
                style={{ padding: '14px', marginBottom: gi === groups.length - 1 ? '4px' : '12px' }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finishing process {gi + 1}</span>
                  {groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGroup(gi)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-start gap-4">
                  <Field label="FINISHING PROCESS" required width="md">
                    <SearchableDropdown
                      value={g.process || ''}
                      onChange={(v) => updateGroup(gi, 'process', v)}
                      options={PROCESS_OPTIONS}
                      placeholder="Select or type process"
                      strictMode={false}
                    />
                  </Field>
                  <Field label="PROCESS TYPE" required width="md">
                    <MultiSelectDropdown
                      value={g.types || []}
                      onChange={(vals) => updateGroup(gi, 'types', vals)}
                      options={FINISHING_TYPE_MAP[g.process] || []}
                    />
                  </Field>
                  <Field label="REMARKS" width="md">
                    <Input
                      value={g.remarks && g.remarks !== 'null' ? g.remarks : ''}
                      onChange={(e) => updateGroup(gi, 'remarks', e.target.value)}
                      placeholder="Remarks (optional)"
                    />
                  </Field>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addGroup} style={{ marginTop: '8px' }}>
              + Add finishing process
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default FinishingSection;
