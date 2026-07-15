import { useCallback, useState } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { getInwardStoreSheets } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};
const getCount = (payload, fallback) =>
  Number.isFinite(payload?.count) ? payload.count : fallback;

// Compact table controls — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-3 py-2 align-middle text-foreground';

const InwardStoreSheetDatabase = ({ onBack, onOpenForm }) => {
  const [expandedId, setExpandedId] = useState(null);

  const fetchPage = useCallback(({ page, pageSize, search }) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    return getInwardStoreSheets(params).then((res) => {
      const results = extractItems(res);
      return { results, count: getCount(res, results.length) };
    });
  }, []);

  const {
    items: sheets,
    count,
    page,
    setPage,
    pageSize,
    loading,
    searchInput,
    setSearchInput,
  } = useServerPagination(fetchPage, { pageSize: 10 });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const typeLabel = (val) => {
    const map = { CHALLAN_ONLY: 'Challan Only', CHALLAN_CUM_INVOICE: 'Challan Cum Invoice' };
    return map[val] || val;
  };

  const ipoTypeLabel = (val) => {
    const map = { COMPANY: 'Company', PRODUCTION: 'Production', SAMPLING: 'Sampling' };
    return map[val] || val;
  };

  const isChallanOnly = (sheet) => sheet.receivable_type === 'CHALLAN_ONLY';

  const HEAD_COLS = 'grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-center gap-3';

  const Meta = ({ label, value, full }) => (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-foreground">{value || '—'}</span>
    </div>
  );

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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Inward Store Logs Database
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All saved inward store logs
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenForm}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Inward Store Logs
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-lg border border-[#e2e3e8] bg-card p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by UIN, challan no, invoice no..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-md border border-[#e2e3e8] bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-[#e2e3e8] bg-muted px-6 py-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-[#e9eaee]"
            >
              Search
            </button>
          </form>
        </div>

        {loading && sheets.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="mb-3 text-base text-muted-foreground">
              No inward store logs found.
            </p>
            <button
              type="button"
              onClick={onOpenForm}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create your first one
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card">
            {/* Column header */}
            <div
              className={`${HEAD_COLS} border-b border-[#e2e3e8] bg-muted px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`}
            >
              <span>UIN</span>
              <span>Receivable Type</span>
              <span>IPO Type</span>
              <span>Created</span>
              <span />
            </div>

            {sheets.map((sheet) => {
              const isExpanded = expandedId === sheet.id;
              return (
                <div
                  key={sheet.id}
                  className="border-b border-[#e2e3e8] last:border-b-0"
                >
                  {/* Card header — always visible */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : sheet.id)}
                    className={`${HEAD_COLS} w-full cursor-pointer px-4 py-3.5 text-left text-sm transition-colors ${
                      isExpanded ? 'bg-muted' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-mono font-semibold text-foreground">
                      {sheet.uin_code || '—'}
                    </span>
                    <span className="text-foreground">
                      {typeLabel(sheet.receivable_type)}
                    </span>
                    <span className="text-foreground">
                      {ipoTypeLabel(sheet.ipo_type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(sheet.created_at)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-[#e2e3e8] bg-muted/30 px-4 pb-4">
                      {/* Meta */}
                      <div className="grid grid-cols-1 gap-x-6 gap-y-3 py-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <Meta label="IPO" value={sheet.ipo_code_display} />
                        <Meta label="VPO" value={sheet.vpo_code_display} />
                        <Meta label="IPC" value={sheet.ipc_code_display} />
                        <Meta
                          label="Vendor Challan No."
                          value={sheet.vendor_challan_no}
                        />
                        {!isChallanOnly(sheet) && (
                          <Meta
                            label="Vendor Invoice No."
                            value={sheet.vendor_invoice_no}
                          />
                        )}
                        <Meta
                          label="Goods Receiving Condition"
                          value={sheet.goods_receiving_condition}
                          full
                        />
                      </div>

                      {/* Items table */}
                      {sheet.items && sheet.items.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-[#e2e3e8] bg-card">
                          <table className="w-full table-fixed border-collapse text-sm">
                            <colgroup>
                              <col style={{ width: '4%' }} />
                              <col style={{ width: isChallanOnly(sheet) ? '18%' : '13%' }} />
                              <col style={{ width: '8%' }} />
                              <col style={{ width: '8%' }} />
                              <col style={{ width: '7%' }} />
                              {!isChallanOnly(sheet) && <col style={{ width: '8%' }} />}
                              {!isChallanOnly(sheet) && <col style={{ width: '9%' }} />}
                              <col style={{ width: isChallanOnly(sheet) ? '15%' : '11%' }} />
                              <col style={{ width: '10%' }} />
                              <col style={{ width: '6%' }} />
                              <col style={{ width: '14%' }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className={`${TH} text-center`}>Sr</th>
                                <th className={TH}>Particulars</th>
                                <th className={TH}>PO Qty</th>
                                <th className={TH}>Recd Qty</th>
                                <th className={TH}>Bal</th>
                                {!isChallanOnly(sheet) && <th className={TH}>Rate (₹)</th>}
                                {!isChallanOnly(sheet) && <th className={TH}>Amount (₹)</th>}
                                <th className={TH}>Remarks</th>
                                <th className={TH}>Recd Form</th>
                                <th className={TH}>Pkg</th>
                                <th className={TH}>USN</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.items.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-muted/50">
                                  <td className={`${TD} text-center font-semibold`}>
                                    {item.sr_no}
                                  </td>
                                  <td className={TD}>{item.particulars || '—'}</td>
                                  <td className={TD}>{item.po_quantity}</td>
                                  <td className={TD}>{item.received_quantity}</td>
                                  <td className={TD}>{item.balance}</td>
                                  {!isChallanOnly(sheet) && <td className={TD}>₹{item.rate}</td>}
                                  {!isChallanOnly(sheet) && <td className={TD}>₹{item.amount}</td>}
                                  <td className={TD}>{item.remarks || '—'}</td>
                                  <td className={TD}>{item.received_form || '—'}</td>
                                  <td className={TD}>{item.num_packages}</td>
                                  <td className={`${TD} font-mono text-[11px]`}>
                                    {item.usn_code || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={count}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default InwardStoreSheetDatabase;
