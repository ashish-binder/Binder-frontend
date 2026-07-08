import { useEffect, useState } from 'react';
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
  validateStep1,
  handleSave,
  showSaveMessage = false,
  isSaved: parentIsSaved = false,
  onValidationFail,
  renderHeaderAction,
}) => {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  // Start "unsaved" — the button turns green only after an actual Save in this
  // view, so an unfilled step never falsely reads as "Saved" on entry.
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('cutting'); // 'cutting' | 'sewing' | 'finishing'
  const [cuttingSection, setCuttingSection] = useState('spec'); // 'spec' | 'process'
  const [sewingSection, setSewingSection] = useState('spec');
  const assignments = formData?.processAssignments || { cutting: { clubs: [] }, sewing: { clubs: [] } };

  useEffect(() => {
    // Only reflect the *unsaved* signal from the parent (e.g. after an edit).
    // Never auto-show "Saved" — that only happens via an actual Save (onSave).
    if (!parentIsSaved) {
      setIsSaved(false);
      setSaveStatus('idle');
    }
  }, [parentIsSaved]);

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
    setSaveStatus('success');
    setIsSaved(true);
    return true;
  };

  // Save this step, then advance to the given tab.
  const saveAndGo = (tab) => { onSave(); setActiveTab(tab); };

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
          {/* Linear flow: Spec → Process (of the same tab). */}
          <div className="flex justify-end" style={{ marginTop: '16px' }}>
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

      {/* Cut, Sew & Finishing tabs + step Save */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: '20px' }}>
        <div className="flex flex-wrap gap-2">
          {[['cutting', 'Cutting'], ['sewing', 'Sewing'], ['finishing', 'Finishing']].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={tabBtn(key, activeTab === key)}>{label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {showSaveMessage && <span className="text-red-600 text-sm font-medium">Save first</span>}
          <Button
            type="button"
            onClick={onSave}
            variant="outline"
            className={cn('min-w-[90px]', saveStatus === 'error' ? 'text-red-600 border-red-500 hover:text-red-700' : isSaved || saveStatus === 'success' ? 'text-green-600 hover:text-green-700' : '')}
          >
            {saveStatus === 'error' ? 'Not Saved' : isSaved || saveStatus === 'success' ? 'Saved' : 'Save'}
          </Button>
        </div>
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
        // Sewing: per-mode "move to assembly" (save + popup + remembered flag);
        // final "forward to pack" enabled only when every component is assigned.
        modeAction: {
          label: 'Save & Move to IPC Assembly',
          onClick: () => { onSave(); markSewMovedToAssembly?.(); },
          notice: 'This stitching is now moving to the assembly line.',
        },
        finalAction: {
          label: 'Sew as IPC & Forward to Pack',
          onClick: () => saveAndGo('finishing'),
          requireAllAssigned: true,
        },
      })}

      {activeTab === 'finishing' && (
        <div className="rounded-2xl border border-border bg-muted" style={{ padding: '20px', marginBottom: '24px' }}>
          <FinishingSection formData={formData} handleWorkOrderChange={handleWorkOrderChange} />
          {(() => {
            // Mandatory: every FINISHING work order must have a process + a type.
            const finWos = (formData?.rawMaterials || []).flatMap((m) =>
              (m.workOrders || []).filter((wo) => wo?.workOrder === 'FINISHING'));
            const finishingComplete = finWos.every((wo) => wo.finishingProcess?.toString().trim() && (wo.finishingTypes || []).length > 0);
            return (
              <div className="flex items-center justify-end gap-3" style={{ marginTop: '16px' }}>
                {!finishingComplete && <span className="text-xs text-amber-600">Fill Finishing Process + Type for every component's finishing work order.</span>}
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
    </div>
  );
};

export default Step1;
