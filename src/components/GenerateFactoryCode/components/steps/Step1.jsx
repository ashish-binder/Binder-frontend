import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SpecSection from '../cutting/SpecSection';
import ProcessSection from '../cutting/ProcessSection';
import FinishingSection from '../finishing/FinishingSection';

// PART-3 "Cut, Sew & Finishing". Tabs: Cutting | Sewing | Finishing.
// Cutting & Sewing each have Section-1 (spec) + Section-2 (process), rendered by
// the shared generic SpecSection / ProcessSection. Finishing is a placeholder.
// All data is draft-backed (stepData); size lives per work order, process
// assignments in stepData.processAssignments (see the orchestrator handlers).
const Step1 = ({
  formData,
  errors,
  handleWorkOrderChange,
  removeWorkOrder,
  clubComponents,
  unclubClub,
  propagateClubs,
  markSewMovedToAssembly,
  onProceedToSelector,
  onPrev,
  onNext,
  validateStep1,
  handleSave,
  showSaveMessage = false,
  onValidationFail,
  renderHeaderAction,
}) => {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'error' (transient)
  const [activeTab, setActiveTab] = useState('cutting'); // 'cutting' | 'sewing' | 'finishing'
  const [cuttingSection, setCuttingSection] = useState('spec'); // 'spec' | 'process'
  const [sewingSection, setSewingSection] = useState('spec');
  const assignments = formData?.processAssignments || { cutting: { clubs: [] }, sewing: { clubs: [] } };

  // "Saved" reflects the real state: green only when the step's data is COMPLETE and
  // UNCHANGED since the last save/load; "Save" when incomplete or edited. A signature
  // of the step's data + a snapshot taken on (re)mount/save drives the dirty check, so
  // reopening a saved IPC shows "Saved" without re-clicking.
  const stepSig = JSON.stringify(
    { rm: formData?.rawMaterials, pa: formData?.processAssignments },
    (k, v) => (typeof File !== 'undefined' && v instanceof File ? '' : v)
  );
  const savedSigRef = useRef(stepSig);
  useEffect(() => { savedSigRef.current = stepSig; }, []); // snapshot on mount = loaded data
  const dirty = savedSigRef.current !== stepSig;
  // "Saved" = no unsaved changes since load/save; "Save" appears the moment you edit.
  const showSaved = !dirty && saveStatus !== 'error';

  const onSave = () => {
    if (validateStep1) {
      const result = validateStep1();
      if (!result.isValid) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        onValidationFail?.(result.errors);
        return false;
      }
    }
    handleSave?.();
    savedSigRef.current = stepSig; // this data is now the saved baseline
    setSaveStatus('idle');
    return true;
  };

  // Save this step, then advance to the given tab.
  const saveAndGo = (tab) => { onSave(); setActiveTab(tab); };

  // Reusable Save button — placed at the bottom of each section, beside Next.
  const saveBtn = (
    <Button
      type="button"
      onClick={onSave}
      variant="outline"
      className={cn('min-w-[90px]', saveStatus === 'error' ? 'text-red-600 border-red-500 hover:text-red-700' : showSaved ? 'text-green-600 hover:text-green-700' : '')}
    >
      {saveStatus === 'error' ? 'Not Saved' : showSaved ? 'Saved' : 'Save'}
    </Button>
  );

  const tabBtn = (key, active) =>
    `rounded-lg border px-4 py-2 text-sm font-medium ${active ? 'border-primary bg-accent text-foreground' : 'border-border text-muted-foreground hover:bg-muted/50'}`;
  const sectionBtn = (active) =>
    `rounded-md border px-3 py-1.5 text-xs font-medium ${active ? 'border-primary bg-background' : 'border-border text-muted-foreground hover:bg-background/60'}`;

  // Cutting/Sewing tab body = section toggle + Spec / Process section.
  const renderProcessTab = ({ woType, prefix, sizeLabel, kind, section, setSection, modeAction, finalAction }) => (
    <div className="rounded-2xl border border-border bg-muted/60" style={{ padding: '16px', marginBottom: '24px' }}>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: '18px' }}>
        <button type="button" onClick={() => setSection('spec')} className={sectionBtn(section === 'spec')}>Section 1 · Spec</button>
        <button type="button" onClick={() => setSection('process')} className={sectionBtn(section === 'process')}>Section 2 · Process</button>
      </div>
      {section === 'spec' ? (
        <>
          <SpecSection
            formData={formData}
            errors={errors}
            woType={woType}
            prefix={prefix}
            sizeLabel={sizeLabel}
            handleWorkOrderChange={handleWorkOrderChange}
            removeWorkOrder={removeWorkOrder}
          />
          {/* Linear flow: Spec → Process (of the same tab). Save sits beside Next. */}
          <div className="flex flex-wrap justify-end items-center gap-3" style={{ marginTop: '16px' }}>
            {showSaveMessage && <span className="text-red-600 text-sm font-medium">Save first</span>}
            {saveBtn}
            <Button type="button" onClick={() => setSection('process')}>Next →</Button>
          </div>
        </>
      ) : (
        <ProcessSection
          formData={formData}
          woType={woType}
          prefix={prefix}
          kind={kind}
          clubs={assignments[kind]?.clubs || []}
          clubComponents={clubComponents}
          unclubClub={unclubClub}
          modeAction={modeAction}
          finalAction={finalAction}
          saveBtn={kind === 'cutting' ? saveBtn : null}
        />
      )}
    </div>
  );

  return (
    <div className="w-full" style={{ maxWidth: '1040px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }} className="flex flex-wrap justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1">PART-3 CUT, SEW &amp; FINISHING</h2>
          <p className="text-sm text-muted-foreground">Cutting, sewing and finishing specifications per component</p>
        </div>
        {renderHeaderAction}
      </div>

      {/* Cut, Sew & Finishing tabs */}
      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '20px' }}>
        {[['cutting', 'Cutting'], ['sewing', 'Sewing'], ['finishing', 'Finishing']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={tabBtn(key, activeTab === key)}>{label}</button>
        ))}
      </div>

      {activeTab === 'cutting' && renderProcessTab({
        woType: 'CUTTING', prefix: 'cut', sizeLabel: 'CUT SIZE', kind: 'cutting',
        section: cuttingSection, setSection: setCuttingSection,
        // Cutting: save + carry the club grouping into Sewing (clubs together,
        // singles alone), show the popup, and open Sewing on Continue.
        modeAction: {
          label: 'Save & Forward to Sewing Line',
          onClick: () => { onSave(); propagateClubs?.('cutting', 'sewing'); },
          notice: 'Saved and moved to the sewing line.',
          onContinue: () => { setSewingSection('spec'); setActiveTab('sewing'); },
        },
      })}

      {activeTab === 'sewing' && renderProcessTab({
        woType: 'SEWING', prefix: 'sew', sizeLabel: 'SEW SIZE', kind: 'sewing',
        section: sewingSection, setSection: setSewingSection,
        // Sewing: per-mode "move to assembly" (save + popup + remembered flag).
        // The "Sew as IPC & Forward to Pack" step lives in the bottom nav below.
        modeAction: {
          label: 'Save & Move to IPC Assembly',
          onClick: () => { onSave(); markSewMovedToAssembly?.(); },
          notice: 'This stitching is now moving to the assembly line.',
        },
      })}

      {activeTab === 'finishing' && (
        <div className="rounded-2xl border border-border bg-muted" style={{ padding: '20px', marginBottom: '24px' }}>
          <FinishingSection formData={formData} handleWorkOrderChange={handleWorkOrderChange} />
          {(() => {
            // Mandatory: every FINISHING work order must have a process + a type.
            const finWos = (formData?.rawMaterials || []).flatMap((m) =>
              (m.workOrders || []).filter((wo) => wo?.workOrder === 'FINISHING'));
            const groupsOf = (wo) => {
              if (Array.isArray(wo.finishingGroups) && wo.finishingGroups.length) return wo.finishingGroups;
              if (wo.finishingProcess || (wo.finishingTypes || []).length) return [{ process: wo.finishingProcess, types: wo.finishingTypes || [] }];
              return [];
            };
            const finishingComplete = finWos.every((wo) => {
              const groups = groupsOf(wo);
              return groups.length > 0 && groups.every((g) => g.process?.toString().trim() && (g.types || []).length > 0);
            });
            return (
              <div className="flex flex-wrap items-center justify-end gap-3" style={{ marginTop: '16px' }}>
                {!finishingComplete && <span className="text-xs text-amber-600">Fill Finishing Process + Type for every component's finishing work order.</span>}
                {saveBtn}
                <Button
                  type="button"
                  disabled={!finishingComplete}
                  onClick={() => { onSave(); onProceedToSelector?.(); }}
                >
                  Save &amp; Proceed to Packaging →
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Bottom navigation.
          • Next →  advances to the Finishing section (linear flow).
          • Sew as IPC & Forward to Pack →  finalises this IPC and returns to the IPC
            selector (packaging). It sits between Previous and Next and only shows on
            the Sewing · Process section, where the stitching is declared ready. */}
      <div className="flex flex-wrap justify-end items-center gap-3" style={{ marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onPrev}>← Previous</Button>
        {activeTab === 'sewing' && sewingSection === 'process' && (
          <Button type="button" variant="outline" onClick={onNext}>Sew as IPC &amp; Forward to Pack →</Button>
        )}
        <Button type="button" onClick={() => saveAndGo('finishing')}>Next →</Button>
      </div>
    </div>
  );
};

export default Step1;
