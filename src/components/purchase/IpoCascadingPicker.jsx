import { useEffect, useState } from 'react';
import { getPurchaseIpos } from '../../services/integration';

const IPO_TYPES = [
  { key: 'company', label: 'Company' },
  { key: 'production', label: 'Production' },
  { key: 'sampling', label: 'Sampling' },
];

const columnStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  minWidth: 260,
  maxWidth: 320,
  flex: '0 0 280px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '12px 14px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#6b7280',
  background: '#f9fafb',
};

const itemStyle = (active) => ({
  padding: '10px 14px',
  cursor: 'pointer',
  background: active ? '#f94d00' : 'transparent',
  color: active ? '#ffffff' : '#111827',
  fontSize: 13,
  borderBottom: '1px solid #f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});

const IpoCascadingPicker = ({ onSelectIpo }) => {
  const [activeType, setActiveType] = useState(null);
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeType) {
      setIpos([]);
      return undefined;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getPurchaseIpos(activeType);
        if (!cancelled) setIpos(res?.results || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load IPOs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [activeType]);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Column 1: IPO Type */}
      <div style={columnStyle}>
        <div style={headerStyle}>IPO Type</div>
        {IPO_TYPES.map((t) => (
          <div
            key={t.key}
            style={itemStyle(activeType === t.key)}
            onClick={() => setActiveType(t.key)}
          >
            <span>{t.label}</span>
            <span style={{ opacity: 0.6 }}>›</span>
          </div>
        ))}
      </div>

      {/* Column 2: IPO list */}
      {activeType && (
        <div style={columnStyle}>
          <div style={headerStyle}>{IPO_TYPES.find((t) => t.key === activeType)?.label} IPOs</div>
          {loading ? (
            <div style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: 16, color: '#991b1b', fontSize: 13 }}>{error}</div>
          ) : ipos.length === 0 ? (
            <div style={{ padding: 16, color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              No IPOs shared to Purchase yet. Open an IPO Master CNS screen and click{' '}
              <strong>Share to Purchase</strong> first.
            </div>
          ) : (
            ipos.map((ipo) => (
              <div
                key={ipo.id}
                style={itemStyle(false)}
                onClick={() => onSelectIpo?.(ipo)}
                title={ipo.program_name}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ipo.ipo_code}
                </div>
                <span style={{ opacity: 0.5 }}>›</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default IpoCascadingPicker;
