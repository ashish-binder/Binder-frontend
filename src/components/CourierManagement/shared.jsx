// Shared building blocks for the Courier feature (Courier Slip + Master Courier Sheet):
// Tailwind class strings, local UI primitives, pure data helpers, and the data-loading
// hooks. Split out of the old single CourierManagement.jsx so each view stays small.
//
// This module deliberately exports both small UI primitives and non-component helpers,
// so the react-refresh "only export components" rule (a dev-HMR nicety) doesn't apply.
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { getIPOs, listCourierRecords } from '../../services/integration';
import { normalizeOrderType } from '../../utils/orderType';
import { useLoading } from '../../context/LoadingContext';

/* ------------------------------------------------------------------ *
 * Tailwind class strings — flat/clean theme matching the StockSheet revamp.
 * ------------------------------------------------------------------ */
export const CARD = 'rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6';
export const LABEL =
  'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground';
const CTRL =
  'w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
export const SELECT = `${CTRL} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`;
export const TCTRL =
  'w-full rounded-md border border-[#e2e3e8] bg-card px-2.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
export const PRIMARY_BTN =
  'cursor-pointer rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
export const SECONDARY_BTN =
  'cursor-pointer rounded-md border border-[#e2e3e8] bg-muted px-6 py-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-[#e9eaee]';
export const TH =
  'border-b border-[#e2e3e8] bg-muted px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-foreground whitespace-nowrap';
export const TD = 'border-b border-[#e2e3e8] px-2 py-1.5 align-middle text-sm text-foreground';
export const CHIP =
  'rounded-md border border-[#e2e3e8] bg-muted px-2.5 py-1 text-xs text-muted-foreground';

/* ------------------------------------------------------------------ *
 * Local UI primitives (replace @/components/ui/*).
 * ------------------------------------------------------------------ */
export const Input = ({ className = '', ...props }) => (
  <input className={`${CTRL} ${className}`} {...props} />
);

export const Field = ({ label, required, helper, className = '', children }) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label className={LABEL}>
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    {children}
    {helper && (
      <span className="mt-1.5 text-xs text-muted-foreground">{helper}</span>
    )}
  </div>
);

export const FormRow = ({ className = '', children }) => (
  <div className={`grid grid-cols-1 gap-4 ${className}`}>{children}</div>
);

// Truncate a filename to `max` chars, keeping the extension and adding an ellipsis.
const truncateName = (name, max = 20) => {
  if (!name || name.length <= max) return name || '';
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(1, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

// Themed image picker matching the other IMS screens: a dashed upload button with an icon,
// or once a file is chosen a thumbnail preview + truncated name + an X to clear (which
// re-enables the button). `value` is a File | null; `onChange` receives a File | null.
export const ImageUpload = ({ id, value, onChange, label = 'Upload Image' }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  if (value) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card p-1.5">
        {preview ? (
          <img
            src={preview}
            alt={value.name}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
        <span
          className="flex-1 truncate text-sm font-medium text-foreground"
          title={value.name}
        >
          {truncateName(value.name)}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#cdced6] bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      <ImagePlus className="h-4 w-4" />
      {label}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
};

/* ------------------------------------------------------------------ *
 * Constants.
 * ------------------------------------------------------------------ */
const COURIER_STORAGE_KEY = 'imsCourierRecords';
const COURIER_UPDATE_EVENT = 'courierRecordsUpdated';

export const IPO_TYPE_OPTIONS = ['Production', 'Sampling', 'Company'];

export const SAMPLE_AS_OPTIONS = {
  Production: [
    { value: 'PP', label: 'PP' },
    { value: 'TOP', label: 'TOP' },
    { value: 'REVISED_PP', label: 'REVISED PP' },
    { value: 'REVISED_TOP', label: 'REVISED TOP' },
    { value: 'OTHER_TEXT', label: 'OTHERS TEXT' },
  ],
  Sampling: [
    { value: 'NEW_DEVELOPMENT', label: 'NEW DEVELOPMENT' },
    { value: 'BUYERS_RETURN', label: "BUYER'S RETURN" },
    { value: 'STOCK', label: 'STOCK' },
    { value: 'OTHER_TEXT', label: 'OTHER TEXT' },
  ],
  Company: [
    { value: 'OTHER_TEXT', label: 'OTHER TEXT' },
    { value: 'FAIR', label: 'FAIR' },
    { value: 'MARKET_WEEK', label: 'MARKET WEEK' },
    { value: 'EXHIBITION', label: 'EXHIBITION' },
  ],
};

export const DIMENSION_UNIT_OPTIONS = ['CM', 'Inch'];
const DIMENSIONAL_WEIGHT_DIVISOR = 5000;

export const INITIAL_SLIP_STATE = {
  ipoType: '',
  ipoCode: '',
  sampleAs: '',
  sampleAsOtherText: '',
  dimensionUnit: 'CM',
  boxesPackets: '',
  boxRows: [],
  droppedBy: '',
  handedBy: '',
};

const isBrowser = typeof window !== 'undefined';

/* ------------------------------------------------------------------ *
 * Pure helpers.
 * ------------------------------------------------------------------ */
export const computeDimensionalWeight = (length, width, height) => {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const h = parseFloat(height);
  if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return '';
  if (l <= 0 || w <= 0 || h <= 0) return '';
  return ((l * w * h) / DIMENSIONAL_WEIGHT_DIVISOR).toFixed(2);
};

export const buildBoxRows = (count, previousRows = []) => {
  const total = Math.max(0, parseInt(count, 10) || 0);
  if (total === 0) return [];
  const rows = [];
  for (let i = 0; i < total; i += 1) {
    const prior = previousRows[i] || {};
    rows.push({
      srNo: i + 1,
      length: prior.length ?? '',
      width: prior.width ?? '',
      height: prior.height ?? '',
      weight: prior.weight ?? '',
    });
  }
  return rows;
};

export const toLocalDateValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toStringValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const buildRecordId = () =>
  `courier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeStoredCourierRecord = (item = {}) => {
  const id = String(item.id || item.clientRecordId || buildRecordId());
  const backendIdRaw = item.backendId ?? item.backend_id ?? null;
  const backendId =
    backendIdRaw === null || backendIdRaw === undefined || backendIdRaw === ''
      ? null
      : String(backendIdRaw);

  return {
    id,
    backendId,
    ipoType: normalizeOrderType(item.ipoType || item.ipo_type || item.orderType || item.order_type || ''),
    ipoCode: item.ipoCode || item.ipo_code || item.code || '',
    programName: item.programName || item.program_name || '',
    buyerCode: item.buyerCode || item.buyer_code || item.buyer_code_text || '',
    companyType: item.companyType || item.company_type || item.type || '',
    sampleAs: item.sampleAs || item.sample_as || '',
    sampleAsOtherText: item.sampleAsOtherText || item.sample_as_other_text || '',
    dimensionUnit: item.dimensionUnit || item.dimension_unit || 'CM',
    boxesPackets: toStringValue(item.boxesPackets ?? item.boxes_packets),
    boxRows: (() => {
      const raw = item.boxRows ?? item.box_rows ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      // Backwards-compat: legacy slips stored a single L/W/H at the top level
      // and only `weight` per row. Seed each row's L/W/H from those legacy
      // fields if present, so old records still display dimensions.
      const legacyL = toStringValue(item.dimensionLength ?? item.dimension_length);
      const legacyW = toStringValue(item.dimensionWidth ?? item.dimension_width);
      const legacyH = toStringValue(item.dimensionHeight ?? item.dimension_height);
      return arr.map((row, idx) => ({
        srNo: row?.srNo ?? row?.sr_no ?? idx + 1,
        length: toStringValue(row?.length ?? row?.length_value ?? legacyL),
        width: toStringValue(row?.width ?? row?.width_value ?? legacyW),
        height: toStringValue(row?.height ?? row?.height_value ?? legacyH),
        weight: toStringValue(row?.weight),
      }));
    })(),
    attachImageRefUrl: item.attachImageRefUrl || item.attach_image_ref_url || '',
    attachImageRefName: item.attachImageRefName || item.attach_image_ref_name || '',
    droppedBy: item.droppedBy || item.dropped_by || '',
    handedBy: item.handedBy || item.handed_by || '',
    dispatchDate: item.dispatchDate || item.dispatch_date || '',
    courierReceipt: item.courierReceipt || item.courier_receipt || '',
    awbNumber: item.awbNumber || item.awb_number || '',
    edd: item.edd || item.expectedDeliveryDate || item.expected_delivery_date || '',
    status: item.status || '',
    handoverTo: item.handoverTo || item.handover_to || '',
    contact: toStringValue(item.contact),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    updatedAt: item.updatedAt || item.updated_at || item.createdAt || item.created_at || new Date().toISOString(),
    persistenceSource: backendId ? 'api' : item.persistenceSource || 'local',
  };
};

const normalizeStoredCourierRecords = (records) => {
  if (!Array.isArray(records)) return [];
  return records.map((item) => normalizeStoredCourierRecord(item));
};

const readStoredCourierRecords = () => {
  if (!isBrowser) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(COURIER_STORAGE_KEY) || '[]');
    return normalizeStoredCourierRecords(parsed);
  } catch (error) {
    console.warn('Unable to read courier records from storage:', error);
    return [];
  }
};

export const persistCourierRecords = (records) => {
  if (!isBrowser) return;
  const normalizedRecords = normalizeStoredCourierRecords(records);
  localStorage.setItem(COURIER_STORAGE_KEY, JSON.stringify(normalizedRecords));
  window.dispatchEvent(new Event(COURIER_UPDATE_EVENT));
};

const mapFetchedIPO = (item) => ({
  ipoCode: item.ipo_code || item.ipoCode || item.code || '',
  orderType: normalizeOrderType(item.order_type || item.orderType || ''),
  buyerCode: item.buyer_code_text || item.buyerCode || '',
  type: item.company_type || item.type || '',
  programName: item.program_name || item.programName || '',
  poSrNo: item.po_sr_no || item.poSrNo || '',
  createdAt: item.created_at || item.createdAt || '',
});

const dedupeIpos = (items) =>
  Array.from(
    new Map(
      (items || [])
        .filter((item) => item?.ipoCode)
        .map((item) => [item.ipoCode, item])
    ).values()
  ).sort((a, b) => a.ipoCode.localeCompare(b.ipoCode));

export const getSampleAsOptions = (ipoType) => SAMPLE_AS_OPTIONS[ipoType] || [];

export const getSampleAsLabel = (record) => {
  const options = getSampleAsOptions(record.ipoType);
  const matchedOption = options.find((option) => option.value === record.sampleAs);
  if (record.sampleAs === 'OTHER_TEXT') {
    return record.sampleAsOtherText || matchedOption?.label || 'OTHER TEXT';
  }
  return matchedOption?.label || record.sampleAs || '-';
};

const extractCourierCollection = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.results)) return payload.data.results;
  if (Array.isArray(payload.data?.records)) return payload.data.records;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  return payload.id || payload.ipo_code || payload.ipoCode ? [payload] : [];
};

const mapFetchedCourierRecord = (item = {}, fallbackRecord = {}) => {
  const fallback = normalizeStoredCourierRecord(fallbackRecord);
  const backendIdRaw =
    item.id ??
    item.record_id ??
    item.courier_id ??
    item.courierId ??
    item.backendId ??
    fallback.backendId;
  const backendId =
    backendIdRaw === null || backendIdRaw === undefined || backendIdRaw === ''
      ? null
      : String(backendIdRaw);
  const nextId =
    fallback.id ||
    item.client_record_id ||
    item.clientRecordId ||
    (backendId ? `courier-api-${backendId}` : buildRecordId());

  return normalizeStoredCourierRecord({
    ...fallback,
    id: nextId,
    backendId,
    ipoType: item.ipo_type || item.ipoType || item.order_type || item.orderType || fallback.ipoType,
    ipoCode: item.ipo_code || item.ipoCode || item.code || fallback.ipoCode,
    programName: item.program_name || item.programName || fallback.programName,
    buyerCode: item.buyer_code || item.buyerCode || item.buyer_code_text || fallback.buyerCode,
    companyType: item.company_type || item.companyType || item.type || fallback.companyType,
    sampleAs: item.sample_as || item.sampleAs || fallback.sampleAs,
    sampleAsOtherText: item.sample_as_other_text || item.sampleAsOtherText || fallback.sampleAsOtherText,
    dimensionUnit: item.dimension_unit || item.dimensionUnit || fallback.dimensionUnit || 'CM',
    boxesPackets: item.boxes_packets ?? item.boxesPackets ?? fallback.boxesPackets,
    boxRows: item.box_rows ?? item.boxRows ?? fallback.boxRows,
    attachImageRefUrl: item.attach_image_ref_url || item.attachImageRefUrl || fallback.attachImageRefUrl,
    attachImageRefName: item.attach_image_ref_name || item.attachImageRefName || fallback.attachImageRefName,
    droppedBy: item.dropped_by || item.droppedBy || fallback.droppedBy,
    handedBy: item.handed_by || item.handedBy || fallback.handedBy,
    dispatchDate: item.dispatch_date || item.dispatchDate || fallback.dispatchDate,
    courierReceipt: item.courier_receipt || item.courierReceipt || fallback.courierReceipt,
    awbNumber: item.awb_number || item.awbNumber || fallback.awbNumber,
    edd: item.edd || item.expected_delivery_date || item.expectedDeliveryDate || fallback.edd,
    status: item.status || fallback.status,
    handoverTo: item.handover_to || item.handoverTo || fallback.handoverTo,
    contact: item.contact ?? fallback.contact,
    createdAt: item.created_at || item.createdAt || fallback.createdAt,
    updatedAt: item.updated_at || item.updatedAt || fallback.updatedAt,
    persistenceSource: backendId ? 'api' : fallback.persistenceSource,
  });
};

const getCourierRecordKey = (record) =>
  record.backendId ? `backend:${record.backendId}` : `local:${record.id}`;

const mergeCourierRecords = (apiRecords, cachedRecords) => {
  const mergedRecords = new Map();

  apiRecords.forEach((record) => {
    const normalizedRecord = normalizeStoredCourierRecord(record);
    mergedRecords.set(getCourierRecordKey(normalizedRecord), normalizedRecord);
  });

  cachedRecords.forEach((record) => {
    const normalizedRecord = normalizeStoredCourierRecord(record);
    const recordKey = getCourierRecordKey(normalizedRecord);

    if (!mergedRecords.has(recordKey)) {
      mergedRecords.set(recordKey, normalizedRecord);
      return;
    }

    if (normalizedRecord.backendId) {
      const apiRecord = mergedRecords.get(recordKey);
      mergedRecords.set(
        recordKey,
        normalizeStoredCourierRecord({
          ...normalizedRecord,
          ...apiRecord,
          id: normalizedRecord.id || apiRecord.id,
          backendId: apiRecord.backendId || normalizedRecord.backendId,
          persistenceSource: 'api',
        })
      );
    }
  });

  return Array.from(mergedRecords.values());
};

/* ------------------------------------------------------------------ *
 * Data hooks — load IPOs and courier records (API with local-storage
 * fallback), keeping both in sync with cross-tab / cross-view events.
 * ------------------------------------------------------------------ */
export const useCourierIpos = () => {
  const [ipos, setIpos] = useState([]);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let cancelled = false;

    const syncIpos = async () => {
      showLoading();
      try {
        const response = await getIPOs();
        const rawItems = response?.results || response?.data || response || [];
        const mapped = dedupeIpos(Array.isArray(rawItems) ? rawItems.map(mapFetchedIPO) : []);
        if (!cancelled) setIpos(mapped);
      } catch (error) {
        console.warn('Courier screen failed to refresh IPOs from API:', error);
        if (!cancelled) setIpos([]);
      } finally {
        hideLoading();
      }
    };

    syncIpos();
    window.addEventListener('internalPurchaseOrdersUpdated', syncIpos);

    return () => {
      cancelled = true;
      window.removeEventListener('internalPurchaseOrdersUpdated', syncIpos);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ipos;
};

export const useCourierRecords = () => {
  const [records, setRecords] = useState(() => readStoredCourierRecords());
  const recordsRef = useRef(records);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    let cancelled = false;

    const syncRecordsFromStorage = () => {
      if (cancelled) return;
      const storedRecords = readStoredCourierRecords();
      recordsRef.current = storedRecords;
      setRecords(storedRecords);
    };

    const loadCourierRecords = async () => {
      const cachedRecords = readStoredCourierRecords();

      if (!cancelled) {
        recordsRef.current = cachedRecords;
        setRecords(cachedRecords);
      }

      showLoading();
      try {
        const response = await listCourierRecords();
        if (cancelled) return;

        if (response.available) {
          const apiRecords = extractCourierCollection(response.data)
            .map((item) => mapFetchedCourierRecord(item))
            .filter((record) => record.ipoCode || record.backendId);
          const mergedRecords = mergeCourierRecords(apiRecords, cachedRecords);
          recordsRef.current = mergedRecords;
          setRecords(mergedRecords);
          persistCourierRecords(mergedRecords);
          return;
        }

        recordsRef.current = cachedRecords;
        setRecords(cachedRecords);
      } finally {
        hideLoading();
      }
    };

    loadCourierRecords();
    window.addEventListener(COURIER_UPDATE_EVENT, syncRecordsFromStorage);

    return () => {
      cancelled = true;
      window.removeEventListener(COURIER_UPDATE_EVENT, syncRecordsFromStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { records, setRecords };
};
