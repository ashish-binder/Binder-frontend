import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getPurchaseGrid,
  previewVpo,
  issueVpo,
  getJobWorkGrid,
  previewJobWorkVpo,
  issueJobWorkVpo,
} from '../../services/integration';
import { CATEGORY_CHIPS, TOP_TABS } from './columnSchemas';
import PurchaseGrid from './PurchaseGrid';
import JobWorkGrid from './JobWorkGrid';
import VpoPreviewModal from './VpoPreviewModal';
import JobWorkVpoPreviewModal from './JobWorkVpoPreviewModal';
import StockUqrPanel from './StockUqrPanel';

const orangeChip = (active) => ({
  background: active ? '#f97316' : '#ffffff',
  color: active ? '#ffffff' : '#374151',
  border: active ? '1px solid #f97316' : '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
});

const MODE_OPTIONS = [
  { key: 'generate_vpo', label: 'Generate VPO' },
  { key: 'issue_stock', label: 'Issue Stock Qty to IPO' },
];

// Maps the Purchase grid's (tab, category-chip) to the StockSheet category key
// so the Stock & UQR check matches stock saved in the Master Stock Sheet.
const RAW_TO_STOCK_CATEGORY = {
  yarn: 'YARN',
  fabric: 'FABRIC',
  fiber: 'FIBER',
  foam: 'FOAM',
  trims: 'TRIMS_ACCESSORY',
};
const stockCategoryFor = (tab, category) => {
  if (tab === 'artwork') return 'ARTWORK_LABELLING';
  if (tab === 'packaging') return 'PACKAGING';
  return RAW_TO_STOCK_CATEGORY[category] || '';
};

const PurchaseMasterCnsSheet = ({ ipo, onBack, onOpenVpoHistory }) => {
  const ipoId = ipo?.id;
  const [tab, setTab] = useState('raw_material');
  const [category, setCategory] = useState('yarn');
  const [mode, setMode] = useState('generate_vpo');
  const [grid, setGrid] = useState({ rows: [], groups: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewErrors, setPreviewErrors] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [stockPanelRow, setStockPanelRow] = useState(null);

  // Job Work tab state (separate payload shape: { materials, work_orders }).
  const [jobWork, setJobWork] = useState({ materials: [], work_orders: [] });
  const [jwPreviewOpen, setJwPreviewOpen] = useState(false);
  const [jwPreview, setJwPreview] = useState(null);
  const [jwPreviewErrors, setJwPreviewErrors] = useState(null);
  const [jwIssuing, setJwIssuing] = useState(false);
  const [jwPending, setJwPending] = useState(null); // { work_order_type, process_unit, lines }

  const isJobWork = tab === 'job_work';

  // Stale-while-revalidate cache so flipping between tabs/categories (or back
  // to one already viewed) renders instantly instead of waiting on the
  // (expensive) Master CNS recompute every time. Keyed by `${tab}:${category}`.
  const gridCache = useRef({});
  const reqToken = useRef(0);

  const chips = CATEGORY_CHIPS[tab] || [];

  // Reset category when top tab changes.
  useEffect(() => {
    const first = (CATEGORY_CHIPS[tab] || [])[0]?.key;
    if (first) setCategory(first);
    setSelected({});
  }, [tab]);

  const loadGrid = useCallback(async ({ force = false } = {}) => {
    if (!ipoId || !tab || !category) return;
    const key = `${ipoId}:${tab}:${category}`;
    const cached = gridCache.current[key];
    const token = ++reqToken.current;

    // Show cached rows immediately (no spinner) and revalidate in the
    // background. Only show the loading state when we have nothing to show.
    if (cached && !force) {
      if (tab === 'job_work') setJobWork(cached);
      else setGrid(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      if (tab === 'job_work') {
        const res = await getJobWorkGrid(ipoId, { category });
        if (token !== reqToken.current) return;
        if (res?.detail) {
          setError(res.detail);
          if (!cached) setJobWork({ materials: [], work_orders: [] });
        } else {
          const next = {
            materials: res?.materials || [],
            work_orders: res?.work_orders || [],
          };
          gridCache.current[key] = next;
          setJobWork(next);
        }
        return;
      }
      const res = await getPurchaseGrid(ipoId, { tab, category });
      if (token !== reqToken.current) return; // a newer request superseded this one
      if (res?.detail) {
        setError(res.detail);
        if (!cached) setGrid({ rows: [], groups: [] });
      } else {
        const next = { rows: res?.rows || [], groups: res?.groups || [] };
        gridCache.current[key] = next;
        setGrid(next);
      }
    } catch (err) {
      if (token !== reqToken.current) return;
      if (!cached) setError(err?.message || 'Failed to load purchase grid.');
    } finally {
      if (token === reqToken.current) setLoading(false);
    }
  }, [ipoId, tab, category]);

  useEffect(() => {
    loadGrid();
  }, [loadGrid]);

  const selectedRows = useMemo(
    () => grid.rows.filter((r) => selected[r.id]),
    [grid.rows, selected]
  );
  const selectedCount = selectedRows.length;

  const handleLineItemUpdated = (row, patch) => {
    const apply = (g) => ({
      ...g,
      rows: g.rows.map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
    });
    setGrid((prev) => apply(prev));
    // Keep the cached copy in sync so the edit survives a tab/category flip.
    const key = `${ipoId}:${tab}:${category}`;
    if (gridCache.current[key]) gridCache.current[key] = apply(gridCache.current[key]);
  };

  const buildLinesForApi = (rows) =>
    rows.map((r) => ({
      source_type: r.source_type,
      source_id: r.source_id,
      qty: Number(r.balance_qty ?? r.purchase_qty ?? 0),
      unit: r.unit,
    }));

  // Check Stock from the action bar: open the Stock & UQR panel for the first
  // selected row (the panel works one material at a time).
  const handleCheckStock = () => {
    const row = selectedRows[0];
    if (row) setStockPanelRow(row);
  };

  const openPreview = async () => {
    if (selectedCount === 0) return;
    setPreviewErrors(null);
    setPreview(null);
    setPreviewOpen(true);
    try {
      const lines = buildLinesForApi(selectedRows);
      const res = await previewVpo(ipoId, lines);
      if (res?.errors) {
        setPreviewErrors(res.errors);
        setPreview({ ipo, lines: [] });
      } else {
        setPreview(res);
      }
    } catch (err) {
      setPreviewErrors([err?.message || 'Failed to preview VPO.']);
    }
  };

  const handleIssueVpo = async () => {
    if (!preview || !preview.lines?.length) return;
    setIssuing(true);
    try {
      const lines = preview.lines.map((l) => ({
        source_type: l.source_type,
        source_id: l.source_id,
        qty: Number(l.qty),
        unit: l.unit,
      }));
      const res = await issueVpo(ipoId, lines);
      if (res?.errors) {
        setPreviewErrors(res.errors);
      } else {
        setPreviewOpen(false);
        setPreview(null);
        setSelected({});
        gridCache.current = {}; // balances changed — drop cache and refetch fresh
        loadGrid({ force: true });
      }
    } catch (err) {
      setPreviewErrors([err?.message || 'Failed to issue VPO.']);
    } finally {
      setIssuing(false);
    }
  };

  // --- Job Work preview / issue ---
  const openJobWorkPreview = async (meta, lines) => {
    setJwPreviewErrors(null);
    setJwPreview(null);
    setJwPending({ ...meta, lines });
    setJwPreviewOpen(true);
    try {
      const res = await previewJobWorkVpo(ipoId, { ...meta, lines });
      if (res?.errors) {
        setJwPreviewErrors(res.errors);
        setJwPreview({ ipo, lines: [], ...meta });
      } else {
        setJwPreview(res);
      }
    } catch (err) {
      setJwPreviewErrors([err?.message || 'Failed to preview Job Work VPO.']);
    }
  };

  const handleIssueJobWorkVpo = async () => {
    if (!jwPending || !jwPending.lines?.length) return;
    setJwIssuing(true);
    try {
      const res = await issueJobWorkVpo(ipoId, jwPending);
      if (res?.errors) {
        setJwPreviewErrors(res.errors);
      } else {
        setJwPreviewOpen(false);
        setJwPreview(null);
        setJwPending(null);
        gridCache.current = {}; // balances changed — drop cache and refetch fresh
        loadGrid({ force: true });
      }
    } catch (err) {
      setJwPreviewErrors([err?.message || 'Failed to generate Job Work VPO.']);
    } finally {
      setJwIssuing(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="dashboard-title">Purchase — Master CNS Sheet</h1>
          <p className="dashboard-subtitle">IPO {ipo?.ipo_code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onOpenVpoHistory}>
            VPO History
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            ← Back to IPOs
          </Button>
        </div>
      </div>

      {/* Top tabs */}
      <div className="flex items-center gap-2" style={{ margin: '16px 0 8px', flexWrap: 'wrap' }}>
        {TOP_TABS.map((t) => (
          <Button
            key={t.key}
            type="button"
            variant={tab === t.key ? 'default' : 'outline'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Category chips */}
      {chips.length > 0 && (
        <div
          style={{
            position: 'relative',
            marginLeft: 16,
            marginBottom: 12,
            paddingLeft: 16,
            borderLeft: '2px solid #f97316',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginRight: 4,
              }}
            >
              Category
            </span>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCategory(c.key);
                  setSelected({});
                }}
                style={orangeChip(category === c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode toggle + action buttons (raw-material / artwork / packaging only —
          Job Work issues a VPO per work-order table instead). */}
      {!isJobWork && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div className="flex items-center gap-2">
          {MODE_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              type="button"
              variant={mode === opt.key ? 'default' : 'outline'}
              onClick={() => {
                setMode(opt.key);
                setSelected({});
              }}
              size="sm"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {mode === 'generate_vpo' && (
            <>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {selectedCount} row(s) selected
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckStock}
                disabled={selectedCount === 0}
              >
                Check Stock
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={openPreview}
                disabled={selectedCount === 0}
              >
                Generate VPO
              </Button>
            </>
          )}
        </div>
      </div>
      )}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6b7280', padding: 24 }}>Loading grid…</div>
      ) : isJobWork ? (
        <JobWorkGrid data={jobWork} onGenerateVpo={openJobWorkPreview} />
      ) : (
        <PurchaseGrid
          rows={grid.rows}
          groups={grid.groups}
          tab={tab}
          category={category}
          mode={mode}
          selected={selected}
          onSelectedChange={setSelected}
          onCheckStock={(row) => setStockPanelRow(row)}
          onLineItemUpdated={handleLineItemUpdated}
        />
      )}

      <JobWorkVpoPreviewModal
        open={jwPreviewOpen}
        preview={jwPreview}
        errors={jwPreviewErrors}
        busy={jwIssuing}
        onClose={() => {
          setJwPreviewOpen(false);
          setJwPreview(null);
          setJwPreviewErrors(null);
          setJwPending(null);
        }}
        onIssue={handleIssueJobWorkVpo}
      />

      <VpoPreviewModal
        open={previewOpen}
        preview={preview}
        errors={previewErrors}
        busy={issuing}
        onClose={() => {
          setPreviewOpen(false);
          setPreview(null);
          setPreviewErrors(null);
        }}
        onIssue={handleIssueVpo}
      />

      <StockUqrPanel
        open={Boolean(stockPanelRow)}
        ipoId={ipoId}
        row={stockPanelRow}
        category={stockCategoryFor(tab, category)}
        onClose={() => setStockPanelRow(null)}
        onIssued={() => {
          setStockPanelRow(null);
          gridCache.current = {}; // balances changed — drop cache and refetch fresh
          loadGrid({ force: true });
        }}
      />
    </div>
  );
};

export default PurchaseMasterCnsSheet;
