import { useEffect, useMemo, useState } from 'react';
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

const thStyle = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6' };
const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 13,
  width: '100%',
};

const num = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

// `preview` shape: { ipo, lines:[{source_type, source_id, ipc_code, category,
// material_description, qty, unit, rate, amount, remark}], total_qty }.
// On issue, emits { vendor_id, payment_terms, delivery_due_date, remarks, lines }.
const VpoPreviewModal = ({ open, preview, errors, onClose, onIssue, busy, vendors = [] }) => {
  const previewLines = useMemo(() => preview?.lines || [], [preview]);

  const [vendorId, setVendorId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryDueDate, setDeliveryDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  // Editable per-line rate/remark, keyed by index. Seeded from the preview.
  const [rates, setRates] = useState({});
  const [lineRemarks, setLineRemarks] = useState({});

  useEffect(() => {
    if (!open) return;
    const seededRates = {};
    const seededRemarks = {};
    previewLines.forEach((l, i) => {
      seededRates[i] = l.rate ?? '';
      seededRemarks[i] = l.remark ?? '';
    });
    setRates(seededRates);
    setLineRemarks(seededRemarks);
  }, [open, previewLines]);

  const selectedVendor = useMemo(
    () => vendors.find((v) => String(v.id) === String(vendorId)),
    [vendors, vendorId]
  );

  useEffect(() => {
    if (selectedVendor && !paymentTerms) {
      setPaymentTerms(selectedVendor.payment_terms || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVendor]);

  if (!open) return null;

  const total = preview?.total_qty;
  const totalAmount = previewLines.reduce(
    (s, l, i) => s + num(rates[i]) * num(l.qty),
    0
  );

  const handleIssue = () => {
    const lines = previewLines.map((l, i) => ({
      source_type: l.source_type,
      source_id: l.source_id,
      qty: l.qty,
      unit: l.unit,
      rate: rates[i] === '' || rates[i] === undefined ? undefined : rates[i],
      remark: lineRemarks[i] || '',
    }));
    onIssue?.({
      vendor_id: vendorId || undefined,
      payment_terms: paymentTerms || undefined,
      delivery_due_date: deliveryDueDate || undefined,
      remarks: remarks || undefined,
      lines,
    });
  };

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
            <div style={{ fontWeight: 600, fontSize: 18 }}>Generate VPO</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              IPO {preview?.ipo?.ipo_code || ''} — {previewLines.length} line(s)
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
              <strong>Cannot issue VPO:</strong>
              <ul style={{ margin: '6px 0 0 18px' }}>
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Vendor + header details for the printable Purchase Order */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <label style={{ fontSize: 12, color: '#374151' }}>
              Vendor
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              >
                <option value="">— Select vendor —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code ? `${v.code} — ` : ''}{v.vendor_name || v.name || 'Vendor'}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>
              Payment Terms
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>
              Delivery Due Date
              <input
                type="date"
                value={deliveryDueDate}
                onChange={(e) => setDeliveryDueDate(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
            <label style={{ fontSize: 12, color: '#374151' }}>
              Remarks
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={thStyle}>IPC#</th>
                <th style={thStyle}>Material</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Unit</th>
                <th style={{ ...thStyle, textAlign: 'right', width: 110 }}>Rate (INR)</th>
                <th style={{ ...thStyle, textAlign: 'right', width: 120 }}>Amount</th>
                <th style={{ ...thStyle, width: 150 }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {previewLines.map((l, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{l.ipc_code || ''}</td>
                  <td style={tdStyle}>{l.material_description}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{l.qty}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{l.unit}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={rates[i] ?? ''}
                      placeholder="—"
                      onChange={(e) => setRates((p) => ({ ...p, [i]: e.target.value }))}
                      style={{ ...inputStyle, textAlign: 'right', width: 90 }}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {(num(rates[i]) * num(l.qty)).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={lineRemarks[i] ?? ''}
                      onChange={(e) => setLineRemarks((p) => ({ ...p, [i]: e.target.value }))}
                      style={{ ...inputStyle, width: 140 }}
                    />
                  </td>
                </tr>
              ))}
              {previewLines.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                    No lines.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                  Total
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                  {total ?? ''}
                </td>
                <td colSpan={2} />
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                  {totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td />
              </tr>
            </tfoot>
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
            onClick={handleIssue}
            disabled={busy || (errors && errors.length > 0) || previewLines.length === 0}
          >
            {busy ? 'Issuing…' : 'Issue VPO'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VpoPreviewModal;
