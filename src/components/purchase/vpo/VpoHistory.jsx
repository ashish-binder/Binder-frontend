import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getVpoHistory, getVpoDetail } from '../../../services/integration';
import { printVpo } from './vpoPrint';

const VpoHistory = ({ ipoId, ipoCode, onBack }) => {
  const [vpos, setVpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVpo, setSelectedVpo] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getVpoHistory({ ipoId, status: 'issued' });
        if (!cancelled) setVpos(res?.results || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load VPO history.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [ipoId]);

  const openVpo = async (vpo) => {
    setDetailLoading(true);
    try {
      const res = await getVpoDetail(vpo.id);
      setSelectedVpo(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="dashboard-title">VPO History</h1>
          <p className="dashboard-subtitle">Issued VPOs for IPO {ipoCode}</p>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back to Purchase Sheet
        </Button>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 10,
            borderRadius: 8,
            margin: '12px 0',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6b7280', padding: 24 }}>Loading…</div>
      ) : vpos.length === 0 ? (
        <div style={{ color: '#6b7280', padding: 24 }}>
          No VPOs issued yet for this IPO.
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>VPO #</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Issued At</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Lines</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Qty</th>
                <th style={{ padding: '10px 14px' }} />
              </tr>
            </thead>
            <tbody>
              {vpos.map((v) => (
                <tr key={v.id}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>
                    {v.vpo_number}
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>{v.status}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    {v.issued_at || v.created_at}
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>
                    {v.line_count}
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>
                    {v.total_qty}
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>
                    <Button type="button" variant="outline" size="sm" onClick={() => openVpo(v)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedVpo && (
        <div
          style={{
            marginTop: 16,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedVpo.vpo_number}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Issued {selectedVpo.issued_at}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" variant="default" size="sm" onClick={() => printVpo(selectedVpo)}>
                Print
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedVpo(null)}>
                Close
              </Button>
            </div>
          </div>
          {(selectedVpo.vendor_name || selectedVpo.total_amount) && (
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 12 }}>
              {selectedVpo.vendor_name ? <span><strong>Vendor:</strong> {selectedVpo.vendor_name} · </span> : null}
              {selectedVpo.total_amount ? <span><strong>Total:</strong> ₹{selectedVpo.total_amount}</span> : null}
            </div>
          )}
          {detailLoading ? (
            <div style={{ color: '#6b7280' }}>Loading…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>IPC</th>
                  <th style={{ padding: '8px 12px' }}>Category</th>
                  <th style={{ padding: '8px 12px' }}>Material</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px 12px' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {(selectedVpo.lines || []).map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{l.ipc_code_text}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{l.category}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{l.material_description}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      {l.qty}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{l.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VpoHistory;
