import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiPrinter, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ThemedSelect from './IMS/StockSheet/ThemedSelect';
import Pagination from '@/components/ui/Pagination';
import { getCompanyEssentials, deleteCompanyEssential } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-4 py-3 align-middle text-sm text-foreground';

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

// Fixed category set (mirrors CompanyEssential.CATEGORY_CHOICES on the backend)
// so the filter dropdown is complete regardless of which page is loaded.
const CATEGORY_OPTIONS = [
  'STATIONARY', 'PANTRY', 'MACHINERY', 'HOUSEKEEPING', 'ELECTRICALS',
  'HARDWARE_CHEMICALS', 'AUDIT_COMPLIANCE', 'IT', 'QC_TOOLS',
  'TRAVEL_EXPENSE', 'REPAIR', 'MAINTENANCE',
];

// react-select options for the category filter (raw value, prettified label).
const CATEGORY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All categories' },
  ...CATEGORY_OPTIONS.map((cat) => ({ value: cat, label: cat.replace(/_/g, ' ') })),
];

// Table column -> backend ordering field.
const SORT_FIELDS = {
  code: 'code',
  category: 'category',
  itemDescription: 'item_description',
  quantity: 'quantity',
  takenByName: 'taken_by_name',
  paymentMethod: 'payment_method',
  date: 'entry_date',
};

const normalizeEssential = (item) => ({
  id: item.id || item.code || '',
  code: item.code || '',
  category: item.category || '',
  department: item.department || '',
  date: item.entry_date || item.date || item.created_at || '',
  srNo: item.sr_no || '',
  itemDescription: item.item_description || item.item || '',
  machineType: item.machine_type || '',
  componentSpec: item.component_spec || '',
  quantity: item.quantity || '',
  unit: item.unit || '',
  amount: item.amount || '',
  forField: item.for_field || '',
  remarks: item.remarks || '',
  takenByName: item.taken_by_name || item.person_name || '',
  paymentMethod: item.payment_method || item.payment_mode || '',
  createdAt: item.created_at || '',
});

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatPaymentMethod = (value) => {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// QTY and AMOUNT are the same field semantically — only one is populated
// per record depending on category (TRAVEL EXPENSE uses amount, others use
// qty). Always render whichever is set.
const getQuantityDisplay = (item) => {
  if (item.quantity !== '' && item.quantity !== null && item.quantity !== undefined) {
    return `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`;
  }
  if (item.amount !== '' && item.amount !== null && item.amount !== undefined) {
    return String(item.amount);
  }
  return '';
};

const hasValue = (v) => v !== '' && v !== null && v !== undefined;

// The "what" field on a Company Essentials record is stored under different
// names per category (see CompanyEssentials form): MACHINERY / QC_TOOLS use
// machine_type, PANTRY uses item, REPAIR / MAINTENANCE label it Job Work,
// everything else is a free-text item description. Returns the label that
// should be shown for that record, plus the resolved value.
const resolveItemField = (item) => {
  const cat = String(item.category || '').toUpperCase();
  if (cat === 'MACHINERY' || cat === 'QC_TOOLS' || cat === 'QC TOOLS') {
    return { label: 'Machine Type', value: item.machineType || item.itemDescription };
  }
  if (cat === 'PANTRY') {
    return { label: 'Item', value: item.itemDescription };
  }
  if (cat === 'REPAIR' || cat === 'MAINTENANCE') {
    return { label: 'Job Work', value: item.itemDescription };
  }
  return { label: 'Item Description', value: item.itemDescription };
};

// Field label for the qty/amount column — same field, different name by
// category (TRAVEL_EXPENSE uses amount; everything else uses qty).
const resolveQuantityLabel = (item) => {
  const cat = String(item.category || '').toUpperCase();
  if (cat === 'TRAVEL_EXPENSE' || cat === 'TRAVEL EXPENSE') return 'Amount';
  return 'Quantity';
};

// Small label/value pair used inside the details popup.
const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="mt-0.5 break-words text-sm text-foreground">
      {hasValue(value) && value !== '' ? value : '—'}
    </div>
  </div>
);

// Essential Details popup — portalled to <body> so the shell's zoom doesn't distort it.
const DetailsModal = ({ item, onClose }) => {
  const itemField = resolveItemField(item);
  const rows = [
    ['Code', item.code],
    ['Category', item.category ? item.category.replace(/_/g, ' ') : ''],
    ['Department', item.department],
    ['PO / Sr. No.', item.srNo],
    [itemField.label, itemField.value],
    ['Component Spec', item.componentSpec],
    [resolveQuantityLabel(item), getQuantityDisplay(item)],
    ['For', item.forField],
    ['Taken By', item.takenByName],
    ['Payment Method', formatPaymentMethod(item.paymentMethod)],
    ['Entry Date', formatDate(item.date)],
    ['Created', formatDate(item.createdAt)],
    ['Remarks', item.remarks],
  ].filter(([, value]) => hasValue(value) && value !== '');

  return createPortal(
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
              {item.code || '—'}
            </span>
            <h2 className="text-lg font-bold text-foreground">
              {(item.category || 'Essential').replace(/_/g, ' ')}
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
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <Detail key={label} label={label} value={value} />
            ))}
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
};

const CompanyEssentialsMasterSheet = ({ onBack }) => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPage = useCallback(({ page, pageSize, search, ordering }) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    const category = categoryFilter !== 'ALL' ? categoryFilter : undefined;
    return getCompanyEssentials(category, params).then((res) => {
      const list = extractItems(res).map(normalizeEssential);
      return { results: list, count: getCount(res, list.length) };
    });
  }, [categoryFilter]);

  const {
    items,
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
  } = useServerPagination(fetchPage, { pageSize: 10, initialOrdering: '-entry_date' });

  // Re-fetch from page 1 whenever the category filter changes (skip first run —
  // the hook already does the initial fetch).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setPage(1);
    refresh();
  }, [categoryFilter, setPage, refresh]);

  const sortField = ordering ? ordering.replace(/^-/, '') : null;
  const sortDir = ordering && ordering.startsWith('-') ? 'desc' : 'asc';

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Delete ${item.code || 'this record'}? This cannot be undone.`
    );
    if (!ok) return;
    if (!item.id) {
      toast.error('Cannot delete: this record is missing an identifier.');
      return;
    }
    try {
      await deleteCompanyEssential(item.id);
      toast.success(`${item.code || 'Record'} deleted.`);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    } catch (err) {
      console.error('Failed to delete company essential:', err);
      toast.error(
        err?.message ||
          err?.detail ||
          'Failed to delete this record. Please try again.'
      );
    }
  };

  const handleSort = (key) => {
    const field = SORT_FIELDS[key];
    if (field) toggleSort(field);
  };

  const escapeHtml = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const handlePrint = (item) => {
    // Open a clean window with a print-formatted view of this record and
    // trigger the browser's print dialog. Using a separate window keeps
    // the app's styles out of the way.
    const itemField = resolveItemField(item);
    const rows = [
      ['Code', item.code],
      ['Category', item.category],
      ['Department', item.department],
      ['PO / Sr. No.', item.srNo],
      [itemField.label, itemField.value],
      ['Component Spec', item.componentSpec],
      [resolveQuantityLabel(item), getQuantityDisplay(item)],
      ['For', item.forField],
      ['Taken By', item.takenByName],
      ['Payment Method', formatPaymentMethod(item.paymentMethod)],
      ['Entry Date', formatDate(item.date)],
      ['Created', formatDate(item.createdAt)],
      ['Remarks', item.remarks],
    ].filter(([, value]) => hasValue(value) && value !== '');

    const tableRows = rows
      .map(
        ([label, value]) => `
          <tr>
            <th>${escapeHtml(label)}</th>
            <td>${escapeHtml(value)}</td>
          </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Company Essential — ${escapeHtml(item.code || 'Record')}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      padding: 32px;
      margin: 0;
    }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #555; margin-bottom: 24px; }
    .code-pill {
      display: inline-block;
      padding: 4px 10px;
      background: #f94d00;
      color: #fff;
      border-radius: 4px;
      font-family: ui-monospace, "Courier New", monospace;
      font-size: 13px;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #ccc;
      vertical-align: top;
    }
    th {
      width: 35%;
      background: #f4f4f4;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      color: #555;
    }
    .footer {
      margin-top: 24px;
      font-size: 11px;
      color: #777;
      text-align: right;
    }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <h1>Company Essential Record</h1>
  <div class="subtitle">${escapeHtml(item.category || '')}${
      item.department ? ' &middot; ' + escapeHtml(item.department) : ''
    }</div>
  <div class="code-pill">${escapeHtml(item.code || 'N/A')}</div>
  <table>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Printed ${escapeHtml(new Date().toLocaleString('en-IN'))}</div>
  <script>
    window.addEventListener('load', () => {
      window.focus();
      window.print();
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print this record.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
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
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Master Company Essentials Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all company essentials records with category, item, payment and personnel details.
          </p>
        </div>

        {/* Search + filter + count */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-65 max-w-md flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by code or item description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-[#e2e3e8] bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="w-52">
            <ThemedSelect
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value || 'ALL')}
              options={CATEGORY_FILTER_OPTIONS}
              placeholder="All categories"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <strong className="text-foreground">{count}</strong>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Loading company essentials...</p>
        ) : error ? (
          <p className="p-12 text-center text-sm text-destructive">
            Failed to load company essentials. Please try again.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              No company essentials records found
              {searchInput || categoryFilter !== 'ALL' ? ' matching your filters' : ''}.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card"
            style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: 1240 }}>
                <thead>
                  <tr>
                    <SortableTh label="Code" sortKey="code" width={190} />
                    <SortableTh label="Category" sortKey="category" width={150} />
                    <SortableTh label="Item" sortKey="itemDescription" width={260} />
                    <SortableTh label="Qty" sortKey="quantity" width={110} />
                    <SortableTh label="Taken By" sortKey="takenByName" width={160} />
                    <SortableTh label="Payment" sortKey="paymentMethod" width={140} />
                    <SortableTh label="Date" sortKey="date" width={110} />
                    <th className={TH} style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id || `${item.code}-${index}`}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className={TD}>
                        <span className="inline-block max-w-full whitespace-normal break-all rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold leading-tight tracking-wide text-primary-foreground">
                          {item.code || 'N/A'}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="truncate text-foreground" title={item.category || ''}>
                          {item.category ? item.category.replace(/_/g, ' ') : '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate font-semibold text-foreground" title={item.itemDescription || ''}>
                          {item.itemDescription || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <span className="whitespace-nowrap text-foreground">
                          {getQuantityDisplay(item) || '—'}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="truncate text-foreground" title={item.takenByName || ''}>
                          {item.takenByName || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <span className="whitespace-nowrap text-foreground">
                          {formatPaymentMethod(item.paymentMethod) || '—'}
                        </span>
                      </td>
                      <td className={TD}>
                        <span className="whitespace-nowrap text-muted-foreground">
                          {formatDate(item.date)}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            title="View details"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrint(item)}
                            title="Print this record"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiPrinter className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete this record"
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

      {selectedItem && (
        <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default CompanyEssentialsMasterSheet;
