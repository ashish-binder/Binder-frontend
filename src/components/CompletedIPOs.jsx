import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import { getIPOs, clearCompletedIpos } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-4 py-3 align-middle text-sm text-foreground';
const OUTLINE_DANGER_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-destructive/30 bg-white px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50';

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
    const clearedCount = count;
    const ok = window.confirm(
      `Clear all ${count} completed IPO${count === 1 ? '' : 's'}? They will return to the Master IPO Sheet.`
    );
    if (!ok) return;
    setClearing(true);
    try {
      await clearCompletedIpos();
      setPage(1);
      toast.success(
        `${clearedCount} IPO${clearedCount === 1 ? '' : 's'} returned to the Master IPO Sheet.`
      );
      refresh();
    } catch (err) {
      console.warn('Failed to clear completed IPOs:', err);
      toast.error('Failed to clear. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        zoom: 0.9,
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--accent': '#edeef1',
      }}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Completed IPOs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All internal purchase orders that have been marked completed.
          </p>
        </div>

        {/* Actions + count */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Total completed: <strong className="text-foreground">{count}</strong>
          </span>
          <button
            type="button"
            onClick={handleClearTable}
            disabled={count === 0 || clearing}
            className={OUTLINE_DANGER_BTN}
          >
            {clearing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
            )}
            {clearing ? 'Clearing…' : 'Clear table'}
          </button>
        </div>

        {loading && ipos.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Loading completed IPOs...</p>
        ) : error ? (
          <p className="p-12 text-center text-sm text-destructive">
            Failed to load IPOs. Please try again.
          </p>
        ) : ipos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              No completed IPOs yet. Mark IPOs as completed in the Master IPO Sheet to see them here.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card"
            style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    <th className={TH}>IPO Code</th>
                  </tr>
                </thead>
                <tbody>
                  {ipos.map((ipo, index) => (
                    <tr key={ipo.id || index} className="transition-colors hover:bg-muted/50">
                      <td className={TD}>
                        <span className="inline-block rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary-foreground">
                          {ipo.code || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};

export default CompletedIPOs;
