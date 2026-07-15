import { useCallback, useState } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import { getOutwardStoreSheets } from '../services/integration';
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
const TD = 'border-b border-[#e2e3e8] px-3 py-2 align-top text-foreground';

const dispatchTypeLabel = (value) => {
  const map = {
    INTERNAL_CHALLAN: 'Internal Challan',
    EXTERNAL_CHALLAN: 'External Challan',
  };
  return map[value] || value || '—';
};

const ipoTypeLabel = (value) => {
  const map = {
    PRODUCTION: 'Production',
    SAMPLING: 'Sampling',
    COMPANY: 'Company',
    COMPANY_ESSENTIALS: 'Company Essentials',
  };
  return map[value] || value || '—';
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OutwardStoreSheetDatabase = ({ onBack, onOpenForm }) => {
  const [expandedId, setExpandedId] = useState(null);

  const fetchPage = useCallback(({ page, pageSize, search }) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    return getOutwardStoreSheets(params).then((res) => {
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

  const handleSearch = (event) => {
    event.preventDefault();
  };

  const HEAD_COLS = 'grid grid-cols-[1.2fr_1fr_1.2fr_1fr_auto] items-center gap-3';

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
                Outward Store Logs Database
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All saved outward store logs
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenForm}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Outward Store Logs
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
                placeholder="Search by challan no, vendor, vehicle, contact..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
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
              No outward store logs found.
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
              <span>Challan No</span>
              <span>Dispatch Type</span>
              <span>Issued To</span>
              <span>Created</span>
              <span />
            </div>

            {sheets.map((sheet) => {
              const isExpanded = expandedId === sheet.id;
              const referenceCode =
                sheet.ipo_type === 'COMPANY_ESSENTIALS'
                  ? sheet.company_essential_code_display
                  : sheet.ipo_code_display;

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
                      {sheet.company_challan_number || '—'}
                    </span>
                    <span className="text-foreground">
                      {dispatchTypeLabel(sheet.dispatch_type)}
                    </span>
                    <span className="text-foreground">
                      {sheet.dispatch_target_display || '—'}
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
                        <Meta
                          label="Dispatch / Issued To"
                          value={sheet.dispatch_target_display}
                        />
                        <Meta label="IPO Type" value={ipoTypeLabel(sheet.ipo_type)} />
                        <Meta label="IPO / Essential" value={referenceCode} />
                        <Meta
                          label="Address"
                          value={sheet.dispatch_issued_to_address}
                        />
                        <Meta label="Contact Person" value={sheet.contact_person} />
                        <Meta label="Contact Number" value={sheet.contact_number} />
                        <Meta label="Vehicle No." value={sheet.vehicle_no} />
                        <Meta
                          label="Vendor"
                          value={
                            sheet.vendor_code_display
                              ? `${sheet.vendor_code_display} - ${sheet.vendor_name_display || ''}`
                              : ''
                          }
                        />
                        <Meta
                          label="Department / Section"
                          value={[
                            sheet.department_name_display,
                            sheet.section_name_display,
                          ]
                            .filter(Boolean)
                            .join(' / ')}
                        />
                      </div>

                      {/* Items table */}
                      {sheet.items && sheet.items.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-[#e2e3e8] bg-card">
                          <table className="w-full table-fixed border-collapse text-sm">
                            <colgroup>
                              <col style={{ width: '4%' }} />
                              <col style={{ width: '14%' }} />
                              <col style={{ width: '9%' }} />
                              <col style={{ width: '8%' }} />
                              <col style={{ width: '20%' }} />
                              <col style={{ width: '9%' }} />
                              <col style={{ width: '8%' }} />
                              <col style={{ width: '10%' }} />
                              <col style={{ width: '10%' }} />
                              <col style={{ width: '8%' }} />
                              <col style={{ width: '12%' }} />
                            </colgroup>
                            <thead>
                              <tr>
                                <th className={`${TH} text-center`}>Sr</th>
                                <th className={TH}>Particulars</th>
                                <th className={TH}>Dispatch Qty</th>
                                <th className={TH}>Unit</th>
                                <th className={TH}>Link USN</th>
                                <th className={TH}>USN Sum</th>
                                <th className={TH}>Balance</th>
                                <th className={TH}>Remark</th>
                                <th className={TH}>Dispatch Form</th>
                                <th className={TH}>Pkg</th>
                                <th className={TH}>UQR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.items.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-muted/50">
                                  <td className={`${TD} text-center font-semibold`}>
                                    {item.sr_no}
                                  </td>
                                  <td className={TD}>{item.particulars || '—'}</td>
                                  <td className={TD}>{item.dispatch_quantity}</td>
                                  <td className={TD}>{item.unit || '—'}</td>
                                  <td className={TD}>
                                    <div className="flex flex-col gap-0.5 text-xs">
                                      {item.usn_links?.length
                                        ? item.usn_links.map((link) => (
                                            <span key={link.id}>
                                              {link.link_usn || '—'} ({link.usn_quantity})
                                            </span>
                                          ))
                                        : '—'}
                                    </div>
                                  </td>
                                  <td className={TD}>{item.usn_quantity_sum}</td>
                                  <td className={TD}>
                                    {item.balance}
                                    {Number.parseFloat(item.balance) > 0 && (
                                      <div className="mt-1 text-[10px] font-semibold text-primary">
                                        {item.carry_forward_code} {item.balance}
                                      </div>
                                    )}
                                  </td>
                                  <td className={TD}>{item.remark || '—'}</td>
                                  <td className={TD}>{item.dispatch_form || '—'}</td>
                                  <td className={TD}>{item.num_packages}</td>
                                  <td className={TD}>
                                    {item.uqr_sent ? 'Sent to verification' : '—'}
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

export default OutwardStoreSheetDatabase;
