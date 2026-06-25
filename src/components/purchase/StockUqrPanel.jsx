import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getStockLookup, requestUqr, issueStockToIpo } from '../../services/integration';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  zIndex: 60,
  display: 'flex',
  justifyContent: 'flex-end',
};

const panelStyle = {
  background: '#ffffff',
  width: 'min(720px, 100%)',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-12px 0 30px rgba(15, 23, 42, 0.18)',
};

const StockUqrPanel = ({ open, ipoId, row, category, onClose, onIssued }) => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyUqrId, setBusyUqrId] = useState(null);
  const [issueQtyByItem, setIssueQtyByItem] = useState({});
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    if (!open || !row) return undefined;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getStockLookup({
          ipo: ipoId,
          category,
          material: row.material_description?.slice(0, 32),
        });
        if (!cancelled) setStock(res?.results || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load stock.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, row, ipoId, category]);

  if (!open) return null;

  const handleRequestUqr = async (item) => {
    setBusyUqrId(item.id);
    try {
      await requestUqr({ stockItemId: item.id, stockItemUin: item.uin });
      setStock((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, uqr_status: 'requested' } : s))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setBusyUqrId(null);
    }
  };

  const handleIssue = async () => {
    if (!row) return;
    const lines = Object.entries(issueQtyByItem)
      .map(([stockItemId, qty]) => {
        const item = stock.find((s) => s.id === stockItemId);
        const num = Number(qty);
        if (!item || !num || num <= 0) return null;
        return {
          source_type: row.source_type,
          source_id: row.source_id,
          stock_item_id: stockItemId,
          stock_item_uin: item.uin,
          qty_issued: num,
          unit: item.unit || row.unit,
        };
      })
      .filter(Boolean);
    if (lines.length === 0) {
      setError('Enter a quantity to issue against at least one stock row.');
      return;
    }
    setIssuing(true);
    setError('');
    try {
      const res = await issueStockToIpo(ipoId, lines);
      if (res?.errors) {
        setError(res.errors.join(' '));
      } else {
        onIssued?.(res);
        onClose?.();
      }
    } catch (err) {
      setError(err?.message || 'Failed to issue stock.');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Stock & UQR</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {row?.material_description || 'Stock lots'}
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: 10,
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
          {loading ? (
            <div style={{ color: '#6b7280', padding: 16 }}>Loading stock…</div>
          ) : stock.length === 0 ? (
            <div style={{ color: '#6b7280', padding: 16 }}>No matching stock lots found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>UIN</th>
                  <th style={{ padding: '8px 10px' }}>Stock ID</th>
                  <th style={{ padding: '8px 10px' }}>Raw Material</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px 10px' }}>Unit</th>
                  <th style={{ padding: '8px 10px' }}>UQR</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Issue Qty</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>{s.uin}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>{s.stock_id}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>{s.material_description}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>{s.qty}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>{s.unit}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ textTransform: 'uppercase', fontSize: 11, color: '#6b7280' }}>
                          {s.uqr_status || 'na'}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyUqrId === s.id || s.uqr_status === 'requested'}
                          onClick={() => handleRequestUqr(s)}
                        >
                          {busyUqrId === s.id ? '…' : 'Request UQR'}
                        </Button>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={issueQtyByItem[s.id] ?? ''}
                        onChange={(e) =>
                          setIssueQtyByItem((p) => ({ ...p, [s.id]: e.target.value }))
                        }
                        style={{
                          width: 90,
                          padding: '4px 6px',
                          border: '1px solid #d1d5db',
                          borderRadius: 4,
                          fontSize: 12,
                          textAlign: 'right',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleIssue} disabled={issuing}>
            {issuing ? 'Issuing…' : 'Issue Stock Qty to IPO'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockUqrPanel;
