import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getBuyerCodes, deleteBuyerCode } from '../services/integration';
import Pagination from '@/components/ui/Pagination';
import { useServerPagination } from '../hooks/useServerPagination';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-4 py-3 align-middle text-sm text-foreground';

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
};

const getCount = (payload, fallback) => {
  if (Number.isFinite(payload?.count)) return payload.count;
  if (Number.isFinite(payload?.data?.count)) return payload.data.count;
  return fallback;
};

const normalizeBuyer = (b) => ({
  id: b.id || b.code || '',
  code: b.code || b.id || '',
  buyerName: b.buyer_name || b.buyerName || '',
  buyerAddress: b.buyer_address || b.buyerAddress || '',
  contactPerson: b.contact_person || b.contactPerson || '',
  retailer: b.retailer || b.end_customer || '',
  createdAt: b.created_at || b.createdAt || new Date().toISOString(),
});

// Maps a table column to the backend field name used for ?ordering=.
const SORT_FIELDS = {
  code: 'code',
  buyerName: 'buyer_name',
  contactPerson: 'contact_person',
  retailer: 'retailer',
  createdAt: 'created_at',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Small label/value pair used inside the details popup.
const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="mt-0.5 break-words text-sm text-foreground">
      {hasValue(value) ? value : '—'}
    </div>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div className="break-inside-avoid">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground">{title}</h3>
    <div className="grid grid-cols-1 gap-y-3">{children}</div>
  </div>
);

// Buyer Details popup — portalled to <body> so the shell's zoom doesn't distort it.
const BuyerDetailsModal = ({ buyer, onClose }) =>
  createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e3e8] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold text-primary-foreground">
              {buyer.code || '—'}
            </span>
            <h2 className="text-lg font-bold text-foreground">
              {buyer.buyerName || 'Buyer Details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            <DetailSection title="Basic Information">
              <Detail label="Buyer Name" value={buyer.buyerName} />
              <Detail label="End Customer" value={buyer.retailer} />
              {hasValue(buyer.buyerAddress) && (
                <Detail label="Address" value={buyer.buyerAddress} />
              )}
            </DetailSection>

            <DetailSection title="Contact Information">
              <Detail label="Contact Person" value={buyer.contactPerson} />
            </DetailSection>

            <DetailSection title="Created Date">
              <Detail label="Created" value={formatDate(buyer.createdAt)} />
            </DetailSection>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#e2e3e8] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

const BuyerMasterSheet = ({ onBack, onEditBuyer }) => {
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  const fetchPage = useCallback(({ page, pageSize, search, ordering }) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    return getBuyerCodes(params).then((res) => {
      const items = extractItems(res).map(normalizeBuyer);
      return { results: items, count: getCount(res, items.length) };
    });
  }, []);

  const {
    items: buyers,
    count,
    page,
    setPage,
    pageSize,
    loading,
    error,
    searchInput,
    setSearchInput,
    ordering,
    toggleSort,
    refresh,
  } = useServerPagination(fetchPage, { pageSize: 10, initialOrdering: '-created_at' });

  const sortField = ordering ? ordering.replace(/^-/, '') : null;
  const sortDir = ordering && ordering.startsWith('-') ? 'desc' : 'asc';

  const handleSort = (columnKey) => {
    const field = SORT_FIELDS[columnKey];
    if (field) toggleSort(field);
  };

  const handleDeleteBuyer = async (buyer) => {
    if (!window.confirm('Are you sure you want to delete this buyer?')) return;

    const idsToTry = [...new Set([buyer.id, buyer.code].filter(Boolean))];
    let deleted = false;
    for (const identifier of idsToTry) {
      try {
        await deleteBuyerCode(identifier);
        deleted = true;
        break;
      } catch (err) {
        console.warn(`API delete with "${identifier}" failed:`, err);
      }
    }

    if (deleted) {
      toast.success(`Buyer ${buyer.code || ''} deleted.`.replace(/\s+/g, ' ').trim());
      // If we just deleted the last row on a later page, step back a page.
      if (buyers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    } else {
      toast.error('Failed to delete buyer. Please try again.');
    }
  };

  const handleViewDetails = (buyer) => setSelectedBuyer(buyer);

  const handleEditBuyer = (buyer) => {
    if (typeof onEditBuyer === 'function') {
      onEditBuyer(buyer);
      return;
    }
    toast.error('Edit buyer handler is not configured.');
  };

  const getSortIcon = (columnKey) => {
    if (sortField !== SORT_FIELDS[columnKey]) {
      return <span className="ml-1 text-[10px] opacity-40">↕</span>;
    }
    return (
      <span className="ml-1 text-[10px] text-primary">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const SortableTh = ({ label, sortKey, width }) => (
    <th
      className={`${TH} cursor-pointer select-none`}
      style={{ width }}
      onClick={() => handleSort(sortKey)}
    >
      {label}
      {getSortIcon(sortKey)}
    </th>
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
            ← Back to Buyer Management
          </button>
          <h1 className="text-3xl font-bold text-foreground">Buyer Master Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all registered buyers in the system
          </p>
        </div>

        {/* Search + count */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-65 max-w-xl flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by buyer name, code, contact person, or end customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-[#e2e3e8] bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Buyers: <strong className="text-foreground">{count}</strong>
          </div>
        </div>

        {loading && buyers.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Loading buyers...</p>
        ) : error ? (
          <p className="p-12 text-center text-sm text-destructive">Failed to load buyers</p>
        ) : buyers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              No buyers found{searchInput ? ' matching your search' : ''}.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card"
            style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: 950 }}>
                <thead>
                  <tr>
                    <SortableTh label="Buyer Code" sortKey="code" width={110} />
                    <SortableTh label="Buyer Name" sortKey="buyerName" width={230} />
                    <SortableTh label="Contact Person" sortKey="contactPerson" width={190} />
                    <SortableTh label="End Customer" sortKey="retailer" width={230} />
                    <SortableTh label="Created" sortKey="createdAt" width={110} />
                    <th className={TH} style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer, index) => (
                    <tr key={buyer.code || index} className="transition-colors hover:bg-muted/50">
                      <td className={TD}>
                        <span className="inline-block rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary-foreground">
                          {buyer.code || '—'}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="truncate font-semibold text-foreground" title={buyer.buyerName || ''}>
                          {buyer.buyerName || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate font-medium text-foreground" title={buyer.contactPerson || ''}>
                          {buyer.contactPerson || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate text-foreground" title={buyer.retailer || ''}>
                          {buyer.retailer || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <span className="whitespace-nowrap text-muted-foreground">
                          {formatDate(buyer.createdAt)}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(buyer)}
                            title="View Details"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditBuyer(buyer)}
                            title="Edit Buyer"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiEdit2 className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBuyer(buyer)}
                            title="Delete Buyer"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {selectedBuyer && (
        <BuyerDetailsModal buyer={selectedBuyer} onClose={() => setSelectedBuyer(null)} />
      )}
    </div>
  );
};

export default BuyerMasterSheet;
