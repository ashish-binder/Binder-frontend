import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { patchPurchaseLineItem } from '../../services/integration';
import { formatMaterialDescription, getColumnSchema } from './columnSchemas';

// Sticky-pane styles cribbed from IPOMasterCNS so the Purchase grid matches
// the rest of the app.
const stickyHeader = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  fontWeight: 600,
  fontSize: 12,
  padding: '10px 12px',
  color: '#374151',
  whiteSpace: 'nowrap',
};
const stickyLeftHeader = (left, width) => ({
  ...stickyHeader,
  position: 'sticky',
  left,
  zIndex: 3,
  width,
  minWidth: width,
  maxWidth: width,
});
const stickyLeftCell = (left, width, bg) => ({
  position: 'sticky',
  left,
  zIndex: 1,
  width,
  minWidth: width,
  maxWidth: width,
  background: bg || '#ffffff',
});

const CELL_BASE = {
  padding: '10px 12px',
  fontSize: 13,
  color: '#111827',
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'top',
};

const fmtNum = (v) => {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  // strip trailing zeros after decimal point
  return n.toString();
};

const cellValue = (row, key, category) => {
  if (key === 'material_description') {
    return formatMaterialDescription(category, row.material_description);
  }
  if (key === '_balance') {
    if (row.balance_qty === null || row.balance_qty === undefined) return '—';
    return `${fmtNum(row.balance_qty)} ${row.unit || ''}`.trim();
  }
  const raw = row[key];
  if (typeof raw === 'number' || (typeof raw === 'string' && raw.match(/^\-?\d+(\.\d+)?$/))) {
    return fmtNum(raw);
  }
  return raw ?? '';
};

const PurchaseGrid = ({
  rows = [],
  groups = [],
  tab,
  category,
  mode, // 'generate_vpo' | 'issue_stock'
  selected,
  onSelectedChange,
  onCheckStock, // (row) => void
  onLineItemUpdated, // (row, patch) => void
}) => {
  const schema = useMemo(() => getColumnSchema(tab, category), [tab, category]);
  const [editing, setEditing] = useState({}); // { rowId-fieldKey: value }
  const [saving, setSaving] = useState({}); // { rowId-fieldKey: bool }

  if (!schema) {
    return (
      <div style={{ padding: 24, color: '#6b7280' }}>
        No column schema for <strong>{tab}</strong> / <strong>{category}</strong>.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 24, color: '#6b7280' }}>
        No materials in this category for this IPO.
      </div>
    );
  }

  // Group span: rows are already sorted by ipc_code; mark first row of each
  // IPC group with rowspan equal to its size.
  const groupSpan = {};
  groups.forEach((g) => {
    if (!g.row_ids?.length) return;
    groupSpan[g.row_ids[0]] = g.row_ids.length;
  });

  // Build sticky-left offsets dynamically based on the schema fixed-front
  // columns (IPC + Select).
  const leftOffsets = [];
  let accum = 0;
  for (const col of schema) {
    if (col.key === '_ipc' || col.key === '_select') {
      leftOffsets.push({ key: col.key, left: accum, width: col.width });
      accum += col.width;
    } else {
      break;
    }
  }

  const handleSelectAllGroup = (groupRowIds, checked) => {
    const next = { ...selected };
    groupRowIds.forEach((id) => {
      if (checked) next[id] = true;
      else delete next[id];
    });
    onSelectedChange?.(next);
  };

  const handleSelectRow = (rowId, checked) => {
    const next = { ...selected };
    if (checked) next[rowId] = true;
    else delete next[rowId];
    onSelectedChange?.(next);
  };

  const handleEditStart = (row, field) => {
    const key = `${row.id}-${field}`;
    setEditing((p) => ({ ...p, [key]: row[field] ?? '' }));
  };

  const handleEditChange = (row, field, value) => {
    const key = `${row.id}-${field}`;
    setEditing((p) => ({ ...p, [key]: value }));
  };

  const handleEditCommit = async (row, field) => {
    const key = `${row.id}-${field}`;
    const newValue = editing[key];
    if (newValue === undefined) return;
    if (String(newValue) === String(row[field] ?? '')) {
      setEditing((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      return;
    }
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      await patchPurchaseLineItem(row.source_type, row.source_id, { [field]: newValue });
      onLineItemUpdated?.(row, { [field]: newValue });
    } catch (err) {
      console.error('Failed to update line item', err);
    } finally {
      setSaving((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      setEditing((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'auto',
        background: '#ffffff',
        maxHeight: '70vh',
      }}
    >
      <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
        <thead>
          <tr>
            {schema.map((col) => {
              const leftEntry = leftOffsets.find((o) => o.key === col.key);
              if (leftEntry) {
                return (
                  <th key={col.key} style={stickyLeftHeader(leftEntry.left, leftEntry.width)}>
                    {col.label}
                  </th>
                );
              }
              return (
                <th
                  key={col.key}
                  style={{
                    ...stickyHeader,
                    width: col.width,
                    minWidth: col.width,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isGroupHead = groupSpan[row.id] !== undefined;
            const groupRowsForRow = isGroupHead
              ? groups.find((g) => g.row_ids?.[0] === row.id)?.row_ids || []
              : [];
            const allInGroupSelected =
              isGroupHead && groupRowsForRow.every((rid) => Boolean(selected?.[rid]));

            return (
              <tr key={row.id}>
                {schema.map((col) => {
                  // IPC group cell — render once per group, with rowspan
                  if (col.key === '_ipc') {
                    if (!isGroupHead) return null;
                    return (
                      <td
                        key={col.key}
                        rowSpan={groupSpan[row.id]}
                        style={{
                          ...stickyLeftCell(
                            leftOffsets.find((o) => o.key === '_ipc')?.left ?? 0,
                            col.width,
                            '#fafafa'
                          ),
                          ...CELL_BASE,
                          fontWeight: 600,
                        }}
                      >
                        {row.ipc_code || ''}
                        {isGroupHead && groupRowsForRow.length > 1 && (
                          <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280' }}>
                            <label style={{ display: 'inline-flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={allInGroupSelected}
                                onChange={(e) => handleSelectAllGroup(groupRowsForRow, e.target.checked)}
                              />
                              <span>Select all</span>
                            </label>
                          </div>
                        )}
                      </td>
                    );
                  }

                  if (col.key === '_select') {
                    return (
                      <td
                        key={col.key}
                        style={{
                          ...stickyLeftCell(
                            leftOffsets.find((o) => o.key === '_select')?.left ?? 0,
                            col.width
                          ),
                          ...CELL_BASE,
                          textAlign: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(selected?.[row.id])}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        />
                      </td>
                    );
                  }

                  if (col.key === '_balance') {
                    return (
                      <td
                        key={col.key}
                        style={{ ...CELL_BASE, width: col.width, textAlign: col.align || 'right' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                          <span style={{ fontWeight: 600 }}>{cellValue(row, '_balance', category)}</span>
                          {mode === 'issue_stock' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onCheckStock?.(row)}
                            >
                              Check Stock
                            </Button>
                          )}
                        </div>
                      </td>
                    );
                  }

                  // Editable cell handling
                  const editKey = `${row.id}-${col.key}`;
                  const isEditing = editing[editKey] !== undefined;
                  const isSaving = Boolean(saving[editKey]);
                  if (col.editable) {
                    return (
                      <td
                        key={col.key}
                        style={{ ...CELL_BASE, width: col.width, textAlign: col.align || 'left' }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editing[editKey] ?? ''}
                            onChange={(e) => handleEditChange(row, col.key, e.target.value)}
                            onBlur={() => handleEditCommit(row, col.key)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.target.blur();
                              if (e.key === 'Escape') {
                                setEditing((p) => {
                                  const next = { ...p };
                                  delete next[editKey];
                                  return next;
                                });
                              }
                            }}
                            style={{
                              border: '1px solid #d1d5db',
                              borderRadius: 4,
                              padding: '2px 6px',
                              width: '100%',
                              fontSize: 12,
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEditStart(row, col.key)}
                            style={{
                              background: 'transparent',
                              border: '1px dashed #d1d5db',
                              borderRadius: 4,
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: 12,
                              opacity: isSaving ? 0.5 : 1,
                              minWidth: 48,
                              textAlign: 'inherit',
                            }}
                          >
                            {row[col.key] || <span style={{ color: '#9ca3af' }}>—</span>}
                          </button>
                        )}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      style={{ ...CELL_BASE, width: col.width, textAlign: col.align || 'left' }}
                    >
                      {cellValue(row, col.key, category)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseGrid;
