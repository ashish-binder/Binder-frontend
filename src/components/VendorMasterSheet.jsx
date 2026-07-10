import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiEye, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { getVendorCodes, getVendorCode, getVendorMasterSheet, deleteVendorCode } from '../services/integration';
import { useLoading } from '../context/LoadingContext';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const TH =
  'border-b border-[#e2e3e8] bg-muted px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
const TD = 'border-b border-[#e2e3e8] px-4 py-3 align-middle text-sm text-foreground';

const hasValue = (value) => {
  if (Array.isArray(value)) return value.some((item) => hasValue(item));
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

const getFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (hasValue(value)) {
      return value;
    }
  }
  return '';
};

const joinArray = (val) => Array.isArray(val) ? val.filter((item) => hasValue(item)).join(', ') : (val || '');

const normalizeVendor = (vendor) => {
  const source = vendor?.vendor && typeof vendor.vendor === 'object' ? { ...vendor.vendor, ...vendor } : vendor;

  return {
    id: getFirstValue(source, ['id', 'vendor_id', 'pk', 'code']),
    code: getFirstValue(source, ['code', 'vendor_code', 'id']),
    vendorName: getFirstValue(source, ['vendor_name', 'vendorName', 'name', 'vendor']),
    address: getFirstValue(source, ['address', 'vendor_address', 'address_line_1', 'full_address']),
    gst: getFirstValue(source, ['gst', 'gst_number', 'gstin', 'gst_no', 'gstin_number']),
    bankName: getFirstValue(source, ['bank_name', 'bankName', 'bank', 'bank_name_branch']),
    accNo: getFirstValue(source, ['account_number', 'accNo', 'acc_no', 'account_no', 'accountNumber']),
    ifscCode: getFirstValue(source, ['ifsc_code', 'ifscCode', 'ifsc', 'bank_ifsc']),
    jobWorkCategory: joinArray(getFirstValue(source, ['job_work_category', 'jobWorkCategory', 'job_work_categories', 'category', 'categories'])),
    jobWorkSubCategory: joinArray(getFirstValue(source, ['job_work_sub_category', 'jobWorkSubCategory', 'job_work_sub_categories', 'sub_category', 'subCategory', 'sub_categories'])),
    contactPerson: getFirstValue(source, ['contact_person', 'contactPerson', 'contact', 'contact_name']),
    whatsappNo: getFirstValue(source, ['whatsapp_number', 'whatsappNo', 'whatsapp_no', 'phone', 'phone_number', 'mobile', 'mobile_number']),
    altWhatsappNo: getFirstValue(source, ['alt_whatsapp_number', 'altWhatsappNo', 'alt_whatsapp_no', 'alt_phone', 'alternate_whatsapp_number', 'alternate_mobile']),
    email: getFirstValue(source, ['email', 'email_address', 'mail']),
    paymentTerms: getFirstValue(source, ['payment_terms', 'paymentTerms', 'payment_term', 'payment_terms_conditions']),
    createdAt: getFirstValue(source, ['created_at', 'createdAt', 'date_created']) || new Date().toISOString()
  };
};

const hasMissingVendorFields = (vendor) =>
  !hasValue(vendor.address) ||
  !hasValue(vendor.gst) ||
  !hasValue(vendor.bankName) ||
  !hasValue(vendor.accNo) ||
  !hasValue(vendor.ifscCode) ||
  !hasValue(vendor.contactPerson) ||
  !hasValue(vendor.whatsappNo) ||
  !hasValue(vendor.email) ||
  !hasValue(vendor.paymentTerms);

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

// Vendor Details popup — portalled to <body> so the shell's zoom doesn't distort it.
const VendorDetailsModal = ({ vendor, onClose }) =>
  createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e3e8] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold text-primary-foreground">
              {vendor.code || '—'}
            </span>
            <h2 className="text-lg font-bold text-foreground">
              {vendor.vendorName || 'Vendor Details'}
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
              <Detail label="Vendor Name" value={vendor.vendorName} />
              <Detail label="GST Number" value={vendor.gst} />
              <Detail label="Address" value={vendor.address} />
            </DetailSection>

            <DetailSection title="Banking Details">
              <Detail label="Bank Name" value={vendor.bankName} />
              <Detail label="Account Number" value={vendor.accNo} />
              <Detail label="IFSC Code" value={vendor.ifscCode} />
            </DetailSection>

            <DetailSection title="Job Work Information">
              <Detail label="Category" value={vendor.jobWorkCategory} />
              <Detail label="Sub-Category" value={vendor.jobWorkSubCategory} />
            </DetailSection>

            <DetailSection title="Contact Information">
              <Detail label="Contact Person" value={vendor.contactPerson} />
              <Detail label="Email" value={vendor.email} />
              <Detail label="WhatsApp Number" value={vendor.whatsappNo} />
              {hasValue(vendor.altWhatsappNo) && (
                <Detail label="Alternative WhatsApp" value={vendor.altWhatsappNo} />
              )}
            </DetailSection>

            <DetailSection title="Payment Terms">
              <Detail label="Terms" value={vendor.paymentTerms} />
            </DetailSection>

            <DetailSection title="Created Date">
              <Detail label="Created" value={formatDate(vendor.createdAt)} />
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

const VendorMasterSheet = ({ onBack, onEditVendor }) => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchVendors = async () => {
      showLoading();
      try {
        setLoading(true);
        setError(null);

        let vendorList = [];

        // 1. Try the master-sheet endpoint first, then fall back to the list endpoint
        try {
          const masterSheetData = await getVendorMasterSheet();
          vendorList = extractItems(masterSheetData);
        } catch (masterSheetError) {
          console.warn('Vendor master sheet fetch failed:', masterSheetError);
        }

        if (vendorList.length === 0) {
          try {
            const data = await getVendorCodes();
            vendorList = extractItems(data);
          } catch (apiError) {
            console.warn('API list fetch failed:', apiError);
          }
        }

        // 2. When list data is sparse, fetch the detail record to fill missing fields
        if (vendorList.length > 0) {
          vendorList = await Promise.all(
            vendorList.map(async (vendor) => {
              const normalized = normalizeVendor(vendor);
              if (!hasMissingVendorFields(normalized)) {
                return vendor;
              }

              const identifier = normalized.id || normalized.code;
              if (!identifier) {
                return vendor;
              }

              try {
                const detail = await getVendorCode(identifier);
                const detailData = detail?.data && typeof detail.data === 'object' ? detail.data : detail;
                return {
                  ...vendor,
                  ...Object.fromEntries(
                    Object.entries(detailData || {}).filter(([, value]) => hasValue(value))
                  )
                };
              } catch (detailError) {
                console.warn(`Vendor detail fetch failed for ${identifier}:`, detailError);
                return vendor;
              }
            })
          );
        }

        // 3. Normalize all vendor data
        const normalizedVendors = vendorList.map(v => normalizeVendor(v));
        setVendors(normalizedVendors);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendors');
        setVendors([]);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    fetchVendors();
  }, []);

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor =>
    (vendor.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.code || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.gst || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.paymentTerms || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort vendors
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteVendor = async (vendor) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      // Try deleting from API using id first, then code
      const idsToTry = [vendor.id, vendor.code].filter(Boolean);
      for (const identifier of [...new Set(idsToTry)]) {
        try {
          await deleteVendorCode(identifier);
          break;
        } catch (err) {
          console.warn(`API delete with "${identifier}" failed:`, err);
        }
      }
      setVendors((prev) => prev.filter(v => v.code !== vendor.code));
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handleEditVendor = (vendor) => {
    if (typeof onEditVendor === 'function') {
      onEditVendor(vendor);
      return;
    }
    alert('Edit vendor handler is not configured.');
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-[10px] opacity-40">↕</span>;
    }
    return (
      <span className="ml-1 text-[10px] text-primary">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
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
            ← Back to Vendor Management
          </button>
          <h1 className="text-3xl font-bold text-foreground">Vendor Master Sheet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all registered vendors in the system
          </p>
        </div>

        {/* Search + count */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-65 max-w-xl flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, code, contact, email, GST, address, or payment terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-[#e2e3e8] bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Vendors: <strong className="text-foreground">{filteredVendors.length}</strong>
          </div>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-muted-foreground">Loading vendors...</p>
        ) : error ? (
          <p className="p-12 text-center text-sm text-destructive">{error}</p>
        ) : sortedVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d6dc] bg-card px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              No vendors found{searchTerm ? ' matching your search' : ''}.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#e2e3e8] bg-card">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: 1620 }}>
                <thead>
                  <tr>
                    <SortableTh label="Code" sortKey="code" width={80} />
                    <SortableTh label="Vendor Name" sortKey="vendorName" width={160} />
                    <th className={TH} style={{ width: 150 }}>Address</th>
                    <th className={TH} style={{ width: 150 }}>GST Number</th>
                    <SortableTh label="Contact Person" sortKey="contactPerson" width={130} />
                    <th className={TH} style={{ width: 120 }}>Phone</th>
                    <th className={TH} style={{ width: 190 }}>Email</th>
                    <SortableTh label="Category" sortKey="jobWorkCategory" width={110} />
                    <th className={TH} style={{ width: 130 }}>Sub-Category</th>
                    <th className={TH} style={{ width: 230 }}>Bank</th>
                    <SortableTh label="Payment Terms" sortKey="paymentTerms" width={170} />
                    <SortableTh label="Created" sortKey="createdAt" width={100} />
                    <th className={TH} style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVendors.map((vendor, index) => (
                    <tr
                      key={vendor.code || index}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className={TD}>
                        <span className="inline-block rounded-md bg-primary px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary-foreground">
                          {vendor.code || '—'}
                        </span>
                      </td>
                      <td className={TD}>
                        <div
                          className="truncate font-semibold text-foreground"
                          title={vendor.vendorName || ''}
                        >
                          {vendor.vendorName || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate text-xs text-foreground" title={vendor.address || ''}>
                          {vendor.address || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <code
                          className="block truncate rounded border border-[#e2e3e8] bg-muted px-2 py-1 font-mono text-[11px] text-foreground"
                          title={vendor.gst || ''}
                        >
                          {vendor.gst || '—'}
                        </code>
                      </td>
                      <td className={TD}>
                        <div
                          className="truncate font-semibold text-foreground"
                          title={vendor.contactPerson || ''}
                        >
                          {vendor.contactPerson || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate font-medium text-foreground" title={vendor.whatsappNo || ''}>
                          {vendor.whatsappNo || '—'}
                        </div>
                        {vendor.altWhatsappNo && (
                          <div className="mt-0.5 truncate text-xs text-muted-foreground" title={vendor.altWhatsappNo}>
                            {vendor.altWhatsappNo}
                          </div>
                        )}
                      </td>
                      <td className={TD}>
                        <div className="truncate" title={vendor.email || ''}>
                          {vendor.email || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <span
                          className="inline-block max-w-full truncate rounded bg-muted px-2 py-1 align-middle text-xs font-medium text-foreground"
                          title={vendor.jobWorkCategory || ''}
                        >
                          {vendor.jobWorkCategory || '—'}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="truncate" title={vendor.jobWorkSubCategory || ''}>
                          {vendor.jobWorkSubCategory || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <div className="truncate font-medium text-foreground" title={vendor.bankName || ''}>
                          {vendor.bankName || '—'}
                        </div>
                        {vendor.accNo && (
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground" title={`A/C: ${vendor.accNo}`}>
                            A/C: {vendor.accNo}
                          </div>
                        )}
                        {vendor.ifscCode && (
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground" title={`IFSC: ${vendor.ifscCode}`}>
                            IFSC: {vendor.ifscCode}
                          </div>
                        )}
                      </td>
                      <td className={TD}>
                        <div className="truncate text-foreground" title={vendor.paymentTerms || ''}>
                          {vendor.paymentTerms || '—'}
                        </div>
                      </td>
                      <td className={TD}>
                        <span className="whitespace-nowrap text-muted-foreground">
                          {formatDate(vendor.createdAt)}
                        </span>
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(vendor)}
                            title="View Details"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditVendor(vendor)}
                            title="Edit Vendor"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiEdit2 className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(vendor)}
                            title="Delete Vendor"
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

        {!loading && !error && sortedVendors.length > 0 && (
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        )}
      </div>

      {selectedVendor && (
        <VendorDetailsModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </div>
  );
};

export default VendorMasterSheet;
