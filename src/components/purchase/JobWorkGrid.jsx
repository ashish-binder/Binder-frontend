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
});
const inputStyle = {
  width: 96,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 13,
  textAlign: 'right',
};

const lineKey = (woType, sourceId) => `${woType}::${sourceId}`;

const JobWorkGrid = ({ data, onGenerateVpo }) => {
  const materials = data?.materials || [];
  const workOrders = data?.work_orders || [];

  const [edits, setEdits] = useState({}); // lineKey -> { issued, rate }
  const [selected, setSelected] = useState({}); // lineKey -> bool
  const [processUnit, setProcessUnit] = useState({}); // woType -> process unit

  // Re-seed defaults whenever the work-order set changes (new IPO/category).
  const woSignature = useMemo(
    () => workOrders.map((g) => g.work_order_type).join('|'),
    [workOrders]
  );
  useEffect(() => {
    const next = {};
    workOrders.forEach((g) => {
      next[g.work_order_type] = g.process_unit || 'PCS';
    });
    setProcessUnit(next);
    setEdits({});
    setSelected({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [woSignature]);

  const getEdit = (k) => edits[k] || { issued: '', rate: '' };
  const setEdit = (k, patch) =>
    setEdits((prev) => ({ ...prev, [k]: { ...getEdit(k), ...patch } }));

  const handleGenerate = (group) => {
    const pu = processUnit[group.work_order_type] || group.process_unit || 'PCS';
    const lines = group.lines
      .map((l) => {
        const k = lineKey(group.work_order_type, l.source_id);
        const e = getEdit(k);
        return { line: l, key: k, issued: num(e.issued), rate: num(e.rate) };
      })
      .filter((x) => selected[x.key] && x.issued > 0)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ---- Raw material header section ---- */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ background: '#fff7ed', padding: '10px 14px', fontWeight: 600, fontSize: 13, color: '#9a3412' }}>
          Raw Material
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={cellTh('left')}>IPC#</th>
                <th style={cellTh('left')}>Raw Material</th>
                <th style={cellTh('right')}>Purchased Width / Unit</th>
                <th style={cellTh('right')}>Purchased Length Qty / Unit</th>
                <th style={cellTh('center')}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.source_id}>
                  <td style={cellTd('left')}>{m.ipc_code || '—'}</td>
                  <td style={cellTd('left')}>{m.material_description || '—'}</td>
                  <td style={cellTd('right')}>{fmt(m.purchase_width, m.unit)}</td>
                  <td style={cellTd('right')}>{fmt(m.purchase_length_qty, m.unit)}</td>
                  <td style={cellTd('center')}>{m.unit || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- One sub-table per work order ---- */}
      {workOrders.length === 0 && (
        <div style={{ color: '#6b7280', padding: 12, fontSize: 13 }}>
          No work orders have been defined for these materials.
        </div>
      )}

      {workOrders.map((group) => {
        const pu = processUnit[group.work_order_type] || group.process_unit || 'PCS';
        const rateUnit = rateUnitFor(pu);
        let totalIssued = 0;
        let totalAmount = 0;
        let totalBalance = 0;

        return (
          <div
            key={group.work_order_type}
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
              </div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                Process Unit
                <select
                  value={pu}
                  onChange={(e) =>
                    setProcessUnit((prev) => ({ ...prev, [group.work_order_type]: e.target.value }))
                  }
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
                    <th style={{ ...cellTh('center'), width: 48 }}></th>
                    <th style={cellTh('left')}>IPC / Component</th>
                    <th style={cellTh('right')}>CNS Qty / Unit</th>
                    <th style={cellTh('right')}>Issued Qty / Unit</th>
                    <th style={cellTh('right')}>Balance Qty / Unit</th>
                    <th style={cellTh('right')}>Rate (INR) / {rateUnit}</th>
                    <th style={cellTh('right')}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {group.lines.map((l) => {
                    const k = lineKey(group.work_order_type, l.source_id);
                    const e = getEdit(k);
                    const issued = num(e.issued);
                    const rate = num(e.rate);
                    const remaining = num(l.balance_qty) - issued;
                    const amount = issued * rate;
                    const isSel = !!selected[k];
                    if (isSel && issued > 0) {
                      totalIssued += issued;
                      totalAmount += amount;
                      totalBalance += remaining;
                    }
                    return (
                      <tr key={k}>
                        <td style={cellTd('center')}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(ev) =>
                              setSelected((prev) => ({ ...prev, [k]: ev.target.checked }))
                            }
                          />
                        </td>
                        <td style={cellTd('left')}>
                          {[l.ipc_code, l.component_name].filter(Boolean).join(' / ') || '—'}
                        </td>
                        <td style={cellTd('right')}>{fmt(l.cns_qty, l.unit)}</td>
                        <td style={cellTd('right')}>
                          <input
                            type="number"
                            min="0"
                            disabled={!isSel}
                            value={e.issued}
                            placeholder="0"
                            onChange={(ev) => setEdit(k, { issued: ev.target.value })}
                            style={{ ...inputStyle, opacity: isSel ? 1 : 0.5 }}
                          />
                        </td>
                        <td style={cellTd('right')}>{fmt(remaining, l.unit)}</td>
                        <td style={cellTd('right')}>
                          <input
                            type="number"
                            min="0"
                            disabled={!isSel}
                            value={e.rate}
                            placeholder="0.00"
                            onChange={(ev) => setEdit(k, { rate: ev.target.value })}
                            style={{ ...inputStyle, opacity: isSel ? 1 : 0.5 }}
                          />
                        </td>
                        <td style={cellTd('right')}>{amount ? `₹ ${amount.toFixed(2)}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f9fafb', fontWeight: 600 }}>
                    <td style={cellTd('center')} />
                    <td style={cellTd('right')}>Total</td>
                    <td style={cellTd('right')}>{group.totals?.cns_qty ?? ''}</td>
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
              <Button type="button" variant="default" onClick={() => handleGenerate(group)}>
                Generate VPO
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JobWorkGrid;
