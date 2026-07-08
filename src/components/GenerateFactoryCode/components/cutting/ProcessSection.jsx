import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Cut/Sew · Section-2 (process) — clubbing UX mirrored from IPO Master CNS.
// Components default to SINGLE (isolation, processed separately). Tick >=2 and the
// orange CLUB button slides up from behind the card → groups them into "Club N"
// (processed together). Tick a club and the UNCLUB button slides up. "Active" =
// the component's cut/sew sizes are filled; others show Inactive. onForward via
// modeAction / gated finalAction (Sewing's "forward to pack").
const SLIDE = 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease 180ms';
const CLUB_TINTS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#ef4444', '#eab308'];

const ProcessSection = ({ formData, woType, prefix, kind, clubs = [], clubComponents, unclubClub, modeAction, finalAction }) => {
  const [selected, setSelected] = useState({});        // single component name -> bool
  const [selectedClubs, setSelectedClubs] = useState({}); // club id -> bool
  const [notice, setNotice] = useState('');

  const components = formData?.products?.[0]?.components || [];
  const rawMaterials = formData?.rawMaterials || [];

  const isActive = (name) => {
    const list = rawMaterials
      .filter((m) => m?.componentName === name)
      .flatMap((m) => (m.workOrders || []).filter((wo) => wo?.workOrder === woType));
    return list.length > 0 && list.every((wo) => wo[`${prefix}Length`] && wo[`${prefix}Width`]);
  };

  const rows = components
    .filter((c) => c.productComforter)
    .map((c) => ({ name: c.productComforter, placement: c.placement || '—', active: isActive(c.productComforter) }));

  const clubOf = (name) => clubs.findIndex((c) => c.components.includes(name));
  const singles = rows.filter((r) => clubOf(r.name) === -1);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const selectedClubCount = Object.values(selectedClubs).filter(Boolean).length;
  const showClub = selectedCount >= 2;
  const showUnclub = selectedClubCount >= 1;

  // A component's "plan" for this stage = the sorted set of its woType work orders
  // with their size. Components can only be clubbed when their plans are identical.
  const planSig = (name) => JSON.stringify(
    rawMaterials
      .filter((m) => m?.componentName === name)
      .flatMap((m) => (m.workOrders || [])
        .filter((wo) => wo?.workOrder === woType)
        .map((wo) => ({ w: wo.workOrder, l: wo[`${prefix}Length`] || '', wd: wo[`${prefix}Width`] || '', u: wo[`${prefix}Unit`] || '' })))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  );

  const doClub = () => {
    const names = singles.filter((r) => selected[r.name]).map((r) => r.name);
    if (names.length < 2) return;
    const sigs = names.map(planSig);
    if (!sigs.every((s) => s === sigs[0])) {
      setNotice(`These components have different ${woType.toLowerCase()} plans (work orders / size), so they can’t be clubbed — they stay single.`);
      return;
    }
    clubComponents(kind, names);
    setSelected({});
  };
  const doUnclub = () => {
    Object.entries(selectedClubs).filter(([, v]) => v).forEach(([id]) => unclubClub(kind, id));
    setSelectedClubs({});
  };
  // Run the mode action; show its popup if any. `onContinue` (if provided) fires
  // from the popup's Continue button (e.g. cutting → open the sewing section).
  const runModeAction = () => {
    modeAction?.onClick?.();
    if (modeAction?.notice) setNotice(modeAction.notice);
    else modeAction?.onContinue?.();
  };
  const allAssigned = rows.length > 0; // every component is either single or clubbed → always assigned

  const rowCls = 'grid grid-cols-[36px_1.4fr_1fr_auto] items-center border-t border-border';

  return (
    <div>
      <p className="text-xs text-muted-foreground" style={{ marginBottom: '12px' }}>
        Each component is processed <b>separately (isolation)</b> by default. Tick two or more and
        press <b>CLUB</b> to <b>merge them into one component</b> — cut &amp; sewn together, and carried
        into Sewing as one merged unit. Tick a merged component and press <b>ISOLATE</b> to split it back.
      </p>

      <div style={{ position: 'relative' }}>
        {/* Slide-up CLUB / UNCLUB buttons (same animation as IPO Master CNS) */}
        <button
          type="button"
          onClick={doClub}
          tabIndex={showClub ? 0 : -1}
          style={{
            position: 'absolute', top: 0, right: 16, background: '#f97316', color: '#fff', border: 'none',
            borderRadius: '10px 10px 0 0', padding: '7px 18px', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            boxShadow: showClub ? '0 -4px 10px rgba(249,115,22,0.25)' : 'none', cursor: 'pointer', zIndex: 0,
            transform: showClub ? 'translateY(-100%)' : 'translateY(0)', transition: SLIDE,
            pointerEvents: showClub ? 'auto' : 'none',
          }}
        >
          CLUB ({selectedCount})
        </button>
        <button
          type="button"
          onClick={doUnclub}
          tabIndex={showUnclub ? 0 : -1}
          style={{
            position: 'absolute', top: 0, right: 16, background: '#475569', color: '#fff', border: 'none',
            borderRadius: '10px 10px 0 0', padding: '7px 18px', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            boxShadow: showUnclub ? '0 -4px 10px rgba(71,85,105,0.3)' : 'none', cursor: 'pointer', zIndex: 0,
            transform: showUnclub ? 'translateY(-100%)' : 'translateY(0)', transition: SLIDE,
            pointerEvents: showUnclub ? 'auto' : 'none',
          }}
        >
          ISOLATE ({selectedClubCount})
        </button>

        <div className="rounded-xl border border-border bg-card overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ minWidth: '460px' }}>
            <div className={`${rowCls.replace('border-t','')} bg-muted text-xs font-semibold text-foreground/70`}>
              <div className="px-2 py-2" />
              <div className="px-2 py-2">COMPONENT / PLACEMENT</div>
              <div className="px-2 py-2">MODE</div>
              <div className="px-2 py-2 text-right">STATUS</div>
            </div>

            {/* Clubbed = ONE merged component (both parts processed together). Tick
                it and UNCLUB to isolate back into singles. */}
            {clubs.map((club, ci) => {
              const tint = CLUB_TINTS[ci % CLUB_TINTS.length];
              const active = club.components.every((n) => isActive(n));
              return (
                <label key={club.id} className={`${rowCls} cursor-pointer`} style={{ borderLeft: `3px solid ${tint}`, background: `${tint}12` }}>
                  <span className="px-2 py-2">
                    <input type="checkbox" checked={!!selectedClubs[club.id]} onChange={() => setSelectedClubs((p) => ({ ...p, [club.id]: !p[club.id] }))} />
                  </span>
                  <span className="px-2 py-2 text-sm truncate">
                    <span className="font-semibold">{club.components.join('  +  ')}</span>
                    <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: tint, color: '#fff' }}>Merged</span>
                  </span>
                  <span className="px-2 py-2 text-xs font-medium" style={{ color: tint }}>{club.label} · together</span>
                  <span className={`px-2 py-2 text-xs text-right ${active ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>{active ? 'Active' : 'Inactive'}</span>
                </label>
              );
            })}

            {/* Single (isolation) components */}
            {singles.map((r) => (
              <label key={r.name} className={`${rowCls} cursor-pointer`}>
                <span className="px-2 py-2">
                  <input type="checkbox" checked={!!selected[r.name]} onChange={() => setSelected((p) => ({ ...p, [r.name]: !p[r.name] }))} />
                </span>
                <span className="px-2 py-2 text-sm truncate">{r.name} <span className="text-muted-foreground">· {r.placement}</span></span>
                <span className="px-2 py-2 text-xs text-muted-foreground">Single (isolation)</span>
                <span className={`px-2 py-2 text-xs text-right ${r.active ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>{r.active ? 'Active' : 'Inactive'}</span>
              </label>
            ))}

            {rows.length === 0 && <div className="px-3 py-3 text-sm text-muted-foreground">Add components in Product Spec first.</div>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3" style={{ marginTop: '16px' }}>
        {kind === 'sewing' && formData?.sewAssemblyMoved && (
          <span className="mr-auto rounded-full bg-green-100 text-green-700 text-xs font-medium" style={{ padding: '4px 12px' }}>
            ✓ In IPC assembly line
          </span>
        )}
        {modeAction && (
          <Button type="button" variant={finalAction ? 'outline' : 'default'} onClick={runModeAction}>{modeAction.label}</Button>
        )}
        {finalAction && (
          <Button type="button" disabled={finalAction.requireAllAssigned && !allAssigned} onClick={finalAction.onClick}>{finalAction.label} →</Button>
        )}
      </div>

      {notice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setNotice('')}>
          <div className="rounded-xl border border-border bg-card shadow-lg" style={{ padding: '20px 24px', maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground" style={{ marginBottom: '16px' }}>{notice}</p>
            <div className="flex justify-end">
              {/* Only the mode-action popup carries onContinue (e.g. → sewing). The
                  club-mismatch popup just needs OK. */}
              {modeAction?.onContinue && notice === modeAction?.notice ? (
                <Button type="button" size="sm" onClick={() => { setNotice(''); modeAction.onContinue(); }}>Continue →</Button>
              ) : (
                <Button type="button" size="sm" onClick={() => setNotice('')}>OK</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessSection;
