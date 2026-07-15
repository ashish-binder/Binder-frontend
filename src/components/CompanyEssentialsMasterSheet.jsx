import { useEffect, useRef, useState, useCallback } from 'react';
import { FiEye, FiPrinter, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/Pagination';
import { getCompanyEssentials, deleteCompanyEssential } from '../services/integration';
import { useServerPagination } from '../hooks/useServerPagination';

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
  if (!dateString) return '';
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
      alert('Cannot delete: this record is missing an identifier.');
      return;
    }
    try {
      await deleteCompanyEssential(item.id);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    } catch (err) {
      console.error('Failed to delete company essential:', err);
      alert(
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
      background: #111;
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
      alert('Please allow pop-ups to print this record.');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getSortIcon = (columnKey) => {
    if (sortField !== SORT_FIELDS[columnKey]) {
      return <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>↕</span>;
    }
    return sortDir === 'asc' ? (
      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--primary)' }}>↑</span>
    ) : (
      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--primary)' }}>↓</span>
    );
  };

  const headerCellStyle = {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--foreground)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const bodyCellStyle = {
    padding: '14px 20px',
    verticalAlign: 'middle',
    fontSize: '14px',
    color: 'var(--foreground)',
  };

  const DetailsModal = ({ item, onClose }) => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)' }}>
            Essential Details — {item.code || 'N/A'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            ×
          </Button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 20px',
          }}
        >
          {(() => {
            const itemField = resolveItemField(item);
            return [
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
            ];
          })()
            .filter(([, value]) => hasValue(value) && value !== '')
            .map(([label, value]) => (
              <div key={label}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    display: 'block',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {label}
                </label>
                <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                  {value}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

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
        <h1 className="fullscreen-title">Master Company Essentials Sheet</h1>
        <p className="fullscreen-description">
          View all company essentials records with category, item, payment and personnel details.
        </p>
      </div>

      <div style={{ maxWidth: '100%', width: '100%', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '500px' }}>
            <Input
              type="text"
              placeholder="Search by code or item description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '14px',
              minWidth: '180px',
            }}
          >
            <option value="ALL">All categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="text-sm text-muted-foreground">
            Total: <strong className="text-foreground">{count}</strong>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
            Loading company essentials...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--destructive)' }}>
            Failed to load company essentials. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
            No company essentials records found
            {searchInput || categoryFilter !== 'ALL' ? ' matching your filters' : ''}.
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1280px' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--muted)',
                    borderBottom: '2px solid var(--border)',
                  }}
                >
                  <th onClick={() => handleSort('code')} style={headerCellStyle}>
                    CODE {getSortIcon('code')}
                  </th>
                  <th onClick={() => handleSort('category')} style={headerCellStyle}>
                    CATEGORY {getSortIcon('category')}
                  </th>
                  <th onClick={() => handleSort('itemDescription')} style={headerCellStyle}>
                    ITEM {getSortIcon('itemDescription')}
                  </th>
                  <th onClick={() => handleSort('quantity')} style={headerCellStyle}>
                    QTY {getSortIcon('quantity')}
                  </th>
                  <th onClick={() => handleSort('takenByName')} style={headerCellStyle}>
                    TAKEN BY {getSortIcon('takenByName')}
                  </th>
                  <th onClick={() => handleSort('paymentMethod')} style={headerCellStyle}>
                    PAYMENT {getSortIcon('paymentMethod')}
                  </th>
                  <th onClick={() => handleSort('date')} style={headerCellStyle}>
                    DATE {getSortIcon('date')}
                  </th>
                  <th style={{ ...headerCellStyle, cursor: 'default' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id || `${item.code}-${index}`}
                    style={{
                      borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ ...bodyCellStyle, borderRight: '1px solid var(--border)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          backgroundColor: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {item.code || 'N/A'}
                      </span>
                    </td>
                    <td style={bodyCellStyle}>{item.category || '—'}</td>
                    <td style={bodyCellStyle}>
                      <strong style={{ fontWeight: 600 }}>{item.itemDescription || '—'}</strong>
                    </td>
                    <td style={bodyCellStyle}>{getQuantityDisplay(item) || '—'}</td>
                    <td style={bodyCellStyle}>{item.takenByName || '—'}</td>
                    <td style={bodyCellStyle}>{formatPaymentMethod(item.paymentMethod) || '—'}</td>
                    <td style={bodyCellStyle}>{formatDate(item.date)}</td>
                    <td style={bodyCellStyle}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                          title="View details"
                          className="h-8 w-8"
                        >
                          <FiEye style={{ fontSize: '16px' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(item)}
                          title="Print this record"
                          className="h-8 w-8"
                        >
                          <FiPrinter style={{ fontSize: '16px' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title="Delete this record"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <FiTrash2 style={{ fontSize: '16px' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
