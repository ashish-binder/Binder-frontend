import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getPurchaseGrid,
  previewVpo,
  issueVpo,
} from '../../services/integration';
import { CATEGORY_CHIPS, TOP_TABS } from './columnSchemas';
import PurchaseGrid from './PurchaseGrid';
import VpoPreviewModal from './VpoPreviewModal';
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

  const chips = CATEGORY_CHIPS[tab] || [];

  // Reset category when top tab changes.
  useEffect(() => {
    const first = (CATEGORY_CHIPS[tab] || [])[0]?.key;
    if (first) setCategory(first);
    setSelected({});
  }, [tab]);

  const loadGrid = useCallback(async () => {
    if (!ipoId || !tab || !category) return;
    setLoading(true);
    setError('');
    try {
      const res = await getPurchaseGrid(ipoId, { tab, category });
      if (res?.detail) {
        setError(res.detail);
        setGrid({ rows: [], groups: [] });
      } else {
        setGrid({ rows: res?.rows || [], groups: res?.groups || [] });
      }
    } catch (err) {
      setError(err?.message || 'Failed to load purchase grid.');
    } finally {
      setLoading(false);
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
    setGrid((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
    }));
  };

  const buildLinesForApi = (rows) =>
    rows.map((r) => ({
      source_type: r.source_type,
      source_id: r.source_id,
      qty: Number(r.balance_qty ?? r.purchase_qty ?? 0),
      unit: r.unit,
    }));

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
        loadGrid();
      }
    } catch (err) {
      setPreviewErrors([err?.message || 'Failed to issue VPO.']);
    } finally {
      setIssuing(false);
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
            ← Back to picker
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

      {/* Mode toggle + action buttons */}
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
        onClose={() => setStockPanelRow(null)}
        onIssued={() => {
          setStockPanelRow(null);
          loadGrid();
        }}
      />
    </div>
  );
};

export default PurchaseMasterCnsSheet;
