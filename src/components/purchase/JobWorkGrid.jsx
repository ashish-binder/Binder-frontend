import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

// Process-unit options shown per work order. The selected unit drives the rate
// label (₹/meter vs ₹/kg vs ₹/pcs); CNS qty itself comes from the backend.
const PROCESS_UNITS = [
  { key: 'YARDAGE', label: 'Yardage', rateUnit: 'meter' },
  { key: 'WEIGHTAGE', label: 'Weightage', rateUnit: 'kg' },
  { key: 'PCS', label: 'Pcs', rateUnit: 'pcs' },
];
const rateUnitFor = (pu) => PROCESS_UNITS.find((p) => p.key === pu)?.rateUnit || 'unit';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const fmt = (v, unit) => {
  if (v === null || v === undefined || v === '') return '—';
  return unit ? `${v} ${unit}` : String(v);
};

const cellTh = (align = 'left') => ({
  textAlign: align,
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
});
const cellTd = (align = 'left') => ({
  padding: '6px 12px',
  textAlign: align,
  fontSize: 13,
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
});
const inputStyle = {
  width: 96,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 13,
  textAlign: 'right',
};

// A selection is per (raw material, work order). One material can carry several
// work orders, each toggled independently.
const selKey = (sourceId, woType) => `${sourceId}::${woType}`;
// Edits (issued/rate) are per detail line, scoped to the selection it sits under.
const editKey = (sourceId, woType, lineSourceId) => `${sourceId}::${woType}::${lineSourceId}`;

const JobWorkGrid = ({ data, onGenerateVpo }) => {
  const materials = data?.materials || [];
  const workOrders = data?.work_orders || [];

  const [edits, setEdits] = useState({}); // editKey -> { issued, rate }
  const [selected, setSelected] = useState({}); // selKey -> bool (work order expanded)
  const [processUnit, setProcessUnit] = useState({}); // selKey -> process unit

  // For each material, the work-order groups that include one of its lines, with
  // the lines narrowed to that material. This is what turns the flat backend
  // groups into the per-IPC "work orders fetched from this IPC" view.
  const workOrdersByMaterial = useMemo(() => {
    const map = {};
    materials.forEach((m) => {
      map[m.source_id] = workOrders
        .map((g) => ({
          ...g,
          lines: g.lines.filter((l) => l.source_id === m.source_id),
        }))
        .filter((g) => g.lines.length > 0);
    });
    return map;
  }, [materials, workOrders]);

  // Seed default process units whenever the data set changes (new IPO/category).
  const signature = useMemo(
    () =>
      materials
        .map((m) => `${m.source_id}:${(workOrdersByMaterial[m.source_id] || []).map((g) => g.work_order_type).join(',')}`)
        .join('|'),
    [materials, workOrdersByMaterial]
  );
  useEffect(() => {
    const nextPu = {};
    materials.forEach((m) => {
      (workOrdersByMaterial[m.source_id] || []).forEach((g) => {
        nextPu[selKey(m.source_id, g.work_order_type)] = g.process_unit || 'PCS';
      });
    });
    setProcessUnit(nextPu);
    setEdits({});
    setSelected({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const getEdit = (k) => edits[k] || { issued: '', rate: '' };
  const setEdit = (k, patch) =>
    setEdits((prev) => ({ ...prev, [k]: { ...getEdit(k), ...patch } }));

  const toggleWorkOrder = (sourceId, woType, checked) =>
    setSelected((prev) => ({ ...prev, [selKey(sourceId, woType)]: checked }));

  // A raw-material-level checkbox toggles all of that material's work orders.
  const toggleMaterial = (m, checked) => {
    setSelected((prev) => {
      const next = { ...prev };
      (workOrdersByMaterial[m.source_id] || []).forEach((g) => {
        next[selKey(m.source_id, g.work_order_type)] = checked;
      });
      return next;
    });
  };

  const handleGenerate = (m, group) => {
    const k = selKey(m.source_id, group.work_order_type);
    const pu = processUnit[k] || group.process_unit || 'PCS';
    const lines = group.lines
      .map((l) => {
        const ek = editKey(m.source_id, group.work_order_type, l.source_id);
        const e = getEdit(ek);
        return { line: l, issued: num(e.issued), rate: num(e.rate) };
      })
      .filter((x) => x.issued > 0)
      .map((x) => ({
        source_id: x.line.source_id,
        component_name: x.line.component_name,
        issued_qty: x.issued,
        rate: x.rate,
      }));
    if (lines.length === 0) return;
    onGenerateVpo({ work_order_type: group.work_order_type, process_unit: pu }, lines);
  };

  if (materials.length === 0) {
    return (
      <div style={{ color: '#6b7280', padding: 24, fontSize: 14 }}>
        No raw materials in this category for this IPO.
      </div>
    );
  }

  // ---- The detail ("Selected Work Order") drop-down table for one selection ----
  const renderDetail = (m, group) => {
    const k = selKey(m.source_id, group.work_order_type);
    const pu = processUnit[k] || group.process_unit || 'PCS';
    const rateUnit = rateUnitFor(pu);
    let totalIssued = 0;
    let totalAmount = 0;
    let totalBalance = 0;
    let totalCns = 0;

    const rows = group.lines.map((l) => {
      const ek = editKey(m.source_id, group.work_order_type, l.source_id);
      const e = getEdit(ek);
      const issued = num(e.issued);
      const rate = num(e.rate);
      const remaining = num(l.balance_qty) - issued;
      const amount = issued * rate;
      totalCns += num(l.cns_qty);
      totalIssued += issued;
      totalAmount += amount;
      totalBalance += remaining;
      return (
        <tr key={ek}>
          <td style={cellTd('left')}>
            {[l.ipc_code, l.component_name].filter(Boolean).join(' / ') || '—'}
          </td>
          <td style={cellTd('right')}>{fmt(l.cns_qty, l.unit)}</td>
          <td style={cellTd('right')}>
            <input
              type="number"
              min="0"
              value={e.issued}
              placeholder="0"
              onChange={(ev) => setEdit(ek, { issued: ev.target.value })}
              style={inputStyle}
            />
          </td>
          <td style={cellTd('right')}>{fmt(remaining, l.unit)}</td>
          <td style={cellTd('right')}>
            <input
              type="number"
              min="0"
              value={e.rate}
              placeholder="0.00"
              onChange={(ev) => setEdit(ek, { rate: ev.target.value })}
              style={inputStyle}
            />
          </td>
          <td style={cellTd('right')}>{amount ? `₹ ${amount.toFixed(2)}` : '—'}</td>
        </tr>
      );
    });

    return (
      <div
        key={k}
        style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}
      >
        <div
          style={{
            background: '#fefce8',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, color: '#854d0e' }}>
            {group.work_order_type}
            <span style={{ fontWeight: 500, color: '#92400e', marginLeft: 8, fontSize: 12 }}>
              {[m.ipc_code, m.material_description].filter(Boolean).join(' · ')}
            </span>
          </div>
          <label style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            Process Unit
            <select
              value={pu}
              onChange={(ev) => setProcessUnit((prev) => ({ ...prev, [k]: ev.target.value }))}
              style={{ padding: '3px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}
            >
              {PROCESS_UNITS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={cellTh('left')}>IPC / Component</th>
                <th style={cellTh('right')}>CNS Qty / Unit</th>
                <th style={cellTh('right')}>Issued Qty / Unit</th>
                <th style={cellTh('right')}>Balance Qty / Unit</th>
                <th style={cellTh('right')}>Rate (INR) / {rateUnit}</th>
                <th style={cellTh('right')}>Amount</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
            <tfoot>
              <tr style={{ background: '#f9fafb', fontWeight: 600 }}>
                <td style={cellTd('right')}>Total</td>
                <td style={cellTd('right')}>{totalCns || ''}</td>
                <td style={cellTd('right')}>{totalIssued || ''}</td>
                <td style={cellTd('right')}>{totalBalance || ''}</td>
                <td style={cellTd('right')} />
                <td style={cellTd('right')}>{totalAmount ? `₹ ${totalAmount.toFixed(2)}` : ''}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button type="button" variant="default" onClick={() => handleGenerate(m, group)}>
            Generate VPO
          </Button>
        </div>
      </div>
    );
  };

  // The selected (material, work order) pairs, in material/work-order order, so
  // their detail tables drop down beneath the raw-material table.
  const selectedDetails = [];
  materials.forEach((m) => {
    (workOrdersByMaterial[m.source_id] || []).forEach((g) => {
      if (selected[selKey(m.source_id, g.work_order_type)]) selectedDetails.push([m, g]);
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ---- Raw material table with inline work orders ---- */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ background: '#fff7ed', padding: '10px 14px', fontWeight: 600, fontSize: 13, color: '#9a3412' }}>
          Raw Material
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ ...cellTh('center'), width: 48 }}>Select</th>
                <th style={cellTh('left')}>IPC#</th>
                <th style={cellTh('left')}>Raw Material</th>
                <th style={cellTh('right')}>Purchased Width / Unit</th>
                <th style={cellTh('right')}>Purchased Length Qty / Unit</th>
                <th style={{ ...cellTh('center'), width: 56 }}>Select</th>
                <th style={cellTh('left')}>Work Orders</th>
                <th style={cellTh('left')}>Process Unit</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const wos = workOrdersByMaterial[m.source_id] || [];
                const span = Math.max(wos.length, 1);
                const allSel = wos.length > 0 && wos.every((g) => selected[selKey(m.source_id, g.work_order_type)]);
                const matCells = (
                  <>
                    <td style={cellTd('center')} rowSpan={span}>
                      <input
                        type="checkbox"
                        checked={allSel}
                        disabled={wos.length === 0}
                        onChange={(ev) => toggleMaterial(m, ev.target.checked)}
                      />
                    </td>
                    <td style={cellTd('left')} rowSpan={span}>{m.ipc_code || '—'}</td>
                    <td style={cellTd('left')} rowSpan={span}>{m.material_description || '—'}</td>
                    <td style={cellTd('right')} rowSpan={span}>{fmt(m.purchase_width, m.unit)}</td>
                    <td style={cellTd('right')} rowSpan={span}>{fmt(m.purchase_length_qty, m.unit)}</td>
                  </>
                );

                if (wos.length === 0) {
                  return (
                    <tr key={m.source_id}>
                      {matCells}
                      <td style={cellTd('center')}>—</td>
                      <td style={{ ...cellTd('left'), color: '#9ca3af' }} colSpan={2}>
                        No work orders defined for this material
                      </td>
                    </tr>
                  );
                }

                return wos.map((g, idx) => {
                  const k = selKey(m.source_id, g.work_order_type);
                  const pu = processUnit[k] || g.process_unit || 'PCS';
                  return (
                    <tr key={k}>
                      {idx === 0 && matCells}
                      <td style={cellTd('center')}>
                        <input
                          type="checkbox"
                          checked={!!selected[k]}
                          onChange={(ev) => toggleWorkOrder(m.source_id, g.work_order_type, ev.target.checked)}
                        />
                      </td>
                      <td style={cellTd('left')}>{g.work_order_type}</td>
                      <td style={cellTd('left')}>
                        <select
                          value={pu}
                          onChange={(ev) => setProcessUnit((prev) => ({ ...prev, [k]: ev.target.value }))}
                          style={{ padding: '3px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}
                        >
                          {PROCESS_UNITS.map((p) => (
                            <option key={p.key} value={p.key}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Selected work order detail tables (drop down on select) ---- */}
      {selectedDetails.length === 0 ? (
        <div style={{ color: '#6b7280', padding: 12, fontSize: 13 }}>
          Select a work order above to issue it to a job-work vendor.
        </div>
      ) : (
        selectedDetails.map(([m, g]) => renderDetail(m, g))
      )}
    </div>
  );
};

export default JobWorkGrid;
