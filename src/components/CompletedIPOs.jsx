import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/Pagination';
import { getIPOs, clearCompletedIpos } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
};
const getCount = (payload, fallback) =>
  Number.isFinite(payload?.count) ? payload.count : fallback;

const normalizeIpo = (ipo) => ({
  id: String(ipo.id || ipo.ipoId || ''),
  code: ipo.ipo_code || ipo.ipoCode || '',
  orderType: ipo.order_type || ipo.orderType || '',
  createdAt: ipo.created_at || ipo.createdAt || '',
});

const CompletedIPOs = ({ onBack }) => {
  const [clearing, setClearing] = useState(false);

  // Completed IPOs, paginated server-side.
  const fetchPage = useCallback(({ page, pageSize }) => {
    return getIPOs({ is_completed: true, page, page_size: pageSize }).then((res) => {
      const results = extractItems(res).map(normalizeIpo);
      return { results, count: getCount(res, results.length) };
    });
  }, []);

  const {
    items: ipos,
    count,
    page,
    setPage,
    pageSize,
    loading,
    error,
    refresh,
  } = useServerPagination(fetchPage, { pageSize: 10 });

  // Refresh when an IPO is deleted/created elsewhere in the app.
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('internalPurchaseOrdersUpdated', handler);
    return () => window.removeEventListener('internalPurchaseOrdersUpdated', handler);
  }, [refresh]);

  // Returns every completed IPO to active (server-side, tenant-wide).
  const handleClearTable = async () => {
    if (count === 0 || clearing) return;
    const ok = window.confirm(
      `Clear all ${count} completed IPO${count === 1 ? '' : 's'}? They will return to the Master IPO Sheet.`
    );
    if (!ok) return;
    setClearing(true);
    try {
      await clearCompletedIpos();
      setPage(1);
      refresh();
    } catch (err) {
      console.warn('Failed to clear completed IPOs:', err);
      alert('Failed to clear. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const headerCellStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--foreground)',
  };

  const bodyCellStyle = {
    padding: '14px 20px',
    verticalAlign: 'middle',
    fontSize: '14px',
    color: 'var(--foreground)',
  };

  return (
    <div className="fullscreen-content" style={{ overflowY: 'auto' }}>
      <div className="content-header">
        <Button
          variant="outline"
          onClick={onBack}
          type="button"
          className="mb-6 bg-white"
        >
          ← Back
        </Button>
        <h1 className="fullscreen-title">Completed IPOs</h1>
        <p className="fullscreen-description">
          All internal purchase orders that have been marked completed.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span className="text-sm text-muted-foreground">
          Total completed: <strong className="text-foreground">{count}</strong>
        </span>
        <Button
          variant="outline"
          onClick={handleClearTable}
          disabled={count === 0 || clearing}
          type="button"
          className="text-destructive hover:text-destructive"
        >
          {clearing ? 'Clearing…' : 'Clear table'}
        </Button>
      </div>

      {loading && ipos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
          Loading completed IPOs...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--destructive)' }}>
          Failed to load IPOs. Please try again.
        </div>
      ) : ipos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
          No completed IPOs yet. Mark IPOs as completed in the Master IPO Sheet to see them here.
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto',
            backgroundColor: 'var(--card)',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--muted)',
                  borderBottom: '2px solid var(--border)',
                }}
              >
                <th style={headerCellStyle}>IPO CODE</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo, index) => (
                <tr
                  key={ipo.id || index}
                  style={{
                    borderBottom: index < ipos.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <td style={bodyCellStyle}>{ipo.code || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={count}
          onPageChange={setPage}
          disabled={loading}
        />
      )}
    </div>
  );
};

export default CompletedIPOs;