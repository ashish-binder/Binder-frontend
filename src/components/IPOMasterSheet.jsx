import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import { getIPOs, setIposCompleted } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-4 py-3 align-middle text-sm text-foreground';
const PRIMARY_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

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

const IPOMasterSheet = ({ onBack }) => {
  // Selected IPO ids pending "Save" (marks them completed in the DB).
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [saving, setSaving] = useState(false);

  // Only active (not-yet-completed) IPOs, paginated server-side.
  const fetchPage = useCallback(({ page, pageSize }) => {
    return getIPOs({ is_completed: false, page, page_size: pageSize }).then((res) => {
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

  const togglePending = (id) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (pendingIds.size === 0 || saving) return;
    const selectedCount = pendingIds.size;
    setSaving(true);
    try {
      await setIposCompleted([...pendingIds], true);
      setPendingIds(new Set());
      toast.success(
        selectedCount > 1
          ? `${selectedCount} IPOs marked as completed.`
          : 'IPO marked as completed.'
      );
      // Completed IPOs leave the active list — reload the current page.
      refresh();
    } catch (err) {
      console.warn('Failed to mark IPOs completed:', err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-bold text-foreground">Master IPO Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark IPOs as completed and save to move them to the Completed IPOs list.
          </p>
        </div>

        {/* Actions + count */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={pendingIds.size === 0 || saving}
            className={PRIMARY_BTN}
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {saving
              ? 'Saving…'
              : `Save${pendingIds.size > 0 ? ` (${pendingIds.size} selected)` : ''}`}
          </button>
          <span className="text-sm text-muted-foreground">
            Active IPOs: <strong className="text-foreground">{count}</strong>
          </span>
        </div>

        {loading && ipos.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Loading IPOs...</p>
        ) : error ? (
          <p className="p-12 text-center text-sm text-destructive">
            Failed to load IPOs. Please try again.
          </p>
        ) : ipos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              No active IPOs. Generate an IPO code to add one to this list.
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
                    <th className={`${TH} text-center`} style={{ width: 200 }}>
                      Mark as Completed
                    </th>
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
                      <td className={`${TD} text-center`}>
                        <input
                          type="checkbox"
                          checked={pendingIds.has(ipo.id)}
                          onChange={() => togglePending(ipo.id)}
                          className="h-4.5 w-4.5 cursor-pointer accent-[#f94d00]"
                          aria-label={`Mark ${ipo.code} as completed`}
                        />
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

export default IPOMasterSheet;
