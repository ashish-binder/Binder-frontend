import { Button } from '@/components/ui/button';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

const dialogStyle = {
  background: '#ffffff',
  borderRadius: 12,
  width: 'min(1040px, 100%)',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
};

const th = (align = 'left') => ({
  textAlign: align,
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
});
const td = (align = 'left') => ({
  padding: '8px 12px',
  textAlign: align,
  borderBottom: '1px solid #f3f4f6',
});

const JobWorkVpoPreviewModal = ({ open, preview, errors, onClose, onIssue, busy }) => {
  if (!open) return null;
  const lines = preview?.lines || [];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>
              Job Work VPO Preview — {preview?.work_order_type || ''}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              IPO {preview?.ipo?.ipo_code || ''} — {lines.length} line(s)
              {preview?.process_unit ? ` · ${preview.process_unit}` : ''}
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ overflow: 'auto', padding: 16 }}>
          {errors && errors.length > 0 && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              <strong>Cannot issue Job Work VPO:</strong>
              <ul style={{ margin: '6px 0 0 18px' }}>
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={th('left')}>IPC / Component</th>
                <th style={th('left')}>Material</th>
                <th style={th('right')}>CNS Qty</th>
                <th style={th('right')}>Issued Qty</th>
                <th style={th('right')}>Balance</th>
                <th style={th('right')}>Rate</th>
                <th style={th('right')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td style={td('left')}>
                    {[l.ipc_code, l.component_name].filter(Boolean).join(' / ')}
                  </td>
                  <td style={td('left')}>{l.material_description || ''}</td>
                  <td style={td('right')}>{l.cns_qty}</td>
                  <td style={td('right')}>{l.issued_qty}</td>
                  <td style={td('right')}>{l.balance_qty}</td>
                  <td style={td('right')}>{l.rate}</td>
                  <td style={td('right')}>{l.amount}</td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                    No lines.
                  </td>
                </tr>
              )}
            </tbody>
            {lines.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                    Total
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                    {preview?.total_issued}
                  </td>
                  <td colSpan={2} />
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                    ₹ {preview?.total_amount}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button type="button" variant="outline" onClick={onClose}>
            Back to Sheet
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onIssue}
            disabled={busy || (errors && errors.length > 0) || lines.length === 0}
          >
            {busy ? 'Generating…' : 'Generate VPO'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobWorkVpoPreviewModal;
