import { useCallback, useState } from "react";
import { FiPlusCircle, FiSearch } from "react-icons/fi";
import Pagination from "@/components/ui/Pagination";
import { getStockSheets } from "../services/integration";
import { useServerPagination } from "../hooks/useServerPagination";
import "./InwardStoreSheet.css";
import "./IMS/StockSheet/StockSheet.css";

const SOURCE_LABELS = {
  ADD_NEW: "ADD_NEW",
  FROM_IPO: "FROM_IPO",
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};
const getCount = (payload, fallback) =>
  Number.isFinite(payload?.count) ? payload.count : fallback;

const MasterStockSheet = ({ onBack, onOpenForm }) => {
  const [expandedId, setExpandedId] = useState(null);

  const fetchPage = useCallback(({ page, pageSize, search }) => {
    const params = { page, page_size: pageSize };
    if (search) params.search = search;
    return getStockSheets(params).then((res) => {
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

  const formatDateParts = (iso) => {
    if (!iso) return { date: "—", time: "" };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
    const date = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  };

  const formatFullDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatQty = (val) => {
    const n = parseFloat(val);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const formatMoney = (val) => {
    const n = parseFloat(val);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Human-friendly value for a detail field (parses stored JSON maps).
  const formatDetailValue = (raw) => {
    if (raw === null || raw === undefined) return "—";
    const str = String(raw).trim();
    if (str === "") return "—";
    if (str.startsWith("{") || str.startsWith("[")) {
      try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === "object") {
          const vals = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
          return vals.join(", ") || "—";
        }
      } catch {
        /* fall through to raw string */
      }
    }
    return str;
  };

  const categoryPill = (cat) => (cat || "").replace(/_/g, " ");

  // Primary "ITEM" text + optional secondary badge for the collapsed row.
  const itemSummary = (sheet) => {
    const items = sheet.items || [];
    if (items.length > 0) {
      const first = items[0].material_description || "—";
      const more = items.length > 1 ? items.length - 1 : 0;
      return { text: first, more, pending: false };
    }
    if (sheet.source === "FROM_IPO") {
      return {
        text: sheet.ipo_code_display || "—",
        more: 0,
        pending: true,
      };
    }
    return { text: "—", more: 0, pending: false };
  };

  const refCode = (sheet) =>
    sheet.ipc_code_text ||
    sheet.ipc_code_display ||
    sheet.ipo_code_display ||
    "";

  const HEAD = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--muted-foreground)",
    whiteSpace: "nowrap",
  };
  const CELL = {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 13,
    color: "var(--foreground)",
  };
  const NUM = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div
      className="ss-scope min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1 rounded-md border border-[#e2e3e8] hover:shadow-lg bg-white cursor-pointer px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5]"
        >
          ← Back
        </button>

        {/* Title + primary action */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Master Stock Logs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All saved stock sheet entries
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenForm}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <FiPlusCircle className="text-base" />
            Add Stock Items
          </button>
        </div>

        {/* Search */}
        <div className="rounded-lg border border-[#e2e3e8] bg-card p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by IPC / IPO code…"
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
          <p style={{ color: "var(--muted-foreground)", padding: 24 }}>
            Loading…
          </p>
        ) : sheets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--muted-foreground)",
            }}
          >
            <p style={{ fontSize: 16, marginBottom: 12 }}>
              No stock sheets yet.
            </p>
            <button className="iss-btn iss-btn-primary" onClick={onOpenForm}>
              Create your first one
            </button>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              background: "var(--card)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 960,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "var(--muted)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <th style={{ ...HEAD, width: 36 }} />
                    <th style={HEAD}>Category</th>
                    <th style={HEAD}>Source</th>
                    <th style={HEAD}>Item</th>
                    <th style={{ ...HEAD, ...NUM }}>Total Qty</th>
                    <th style={{ ...HEAD, ...NUM }}>Rate</th>
                    <th style={{ ...HEAD, ...NUM }}>Amount</th>
                    <th style={{ ...HEAD, textAlign: "center" }}>Pkgs</th>
                    <th style={HEAD}>Ref Code</th>
                    <th style={HEAD}>Created</th>
                  </tr>
                </thead>
                {sheets.map((sheet) => {
                  const isExpanded = expandedId === sheet.id;
                  const summary = itemSummary(sheet);
                  const created = formatDateParts(sheet.created_at);
                  const ref = refCode(sheet);
                  return (
                    <tbody
                      key={sheet.id}
                      style={{ display: "table-row-group" }}
                    >
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : sheet.id)
                        }
                        style={{
                          borderBottom: "1px solid var(--border)",
                          cursor: "pointer",
                          background: isExpanded
                            ? "var(--muted)"
                            : "transparent",
                          transition: "background-color 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded)
                            e.currentTarget.style.background = "var(--muted)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td
                          style={{
                            ...CELL,
                            paddingLeft: 12,
                            paddingRight: 4,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              transition: "transform 0.15s",
                              transform: isExpanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              fontSize: 12,
                            }}
                          >
                            ▶
                          </span>
                        </td>
                        <td style={CELL}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "var(--muted)",
                              color: "var(--muted-foreground)",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {categoryPill(sheet.category)}
                          </span>
                        </td>
                        <td style={CELL}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: 6,
                              border: "1px solid var(--border)",
                              background: "var(--background)",
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "var(--font-mono)",
                              color: "var(--muted-foreground)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {SOURCE_LABELS[sheet.source] || sheet.source || "—"}
                          </span>
                        </td>
                        <td style={{ ...CELL, maxWidth: 340, minWidth: 220 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.35,
                              }}
                            >
                              {summary.text}
                            </span>
                            {summary.more > 0 && (
                              <span
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: 999,
                                  background: "var(--muted)",
                                  color: "var(--muted-foreground)",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                +{summary.more} more
                              </span>
                            )}
                            {summary.pending && (
                              <span
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: 999,
                                  background: "var(--muted)",
                                  color: "var(--muted-foreground)",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                details pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...CELL, ...NUM }}>
                          {formatQty(sheet.total_qty)}
                        </td>
                        <td style={{ ...CELL, ...NUM }}>
                          {formatMoney(sheet.rate)}
                        </td>
                        <td style={{ ...CELL, ...NUM }}>
                          {formatMoney(sheet.amount)}
                        </td>
                        <td style={{ ...CELL, textAlign: "center" }}>
                          {sheet.num_packages ?? (sheet.packages || []).length}
                        </td>
                        <td
                          style={{
                            ...CELL,
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: ref
                              ? "var(--foreground)"
                              : "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ref || "—"}
                        </td>
                        <td
                          style={{
                            ...CELL,
                            fontSize: 12,
                            color: "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div>{created.date}</div>
                          {created.time && (
                            <div style={{ opacity: 0.75 }}>{created.time}</div>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={10}
                            style={{
                              padding: 0,
                              borderBottom: "1px solid var(--border)",
                              background: "var(--muted)",
                            }}
                          >
                            <div style={{ padding: "18px 22px" }}>
                              {(sheet.items || []).length === 0 ? (
                                <p
                                  style={{
                                    color: "var(--muted-foreground)",
                                    fontSize: 13,
                                    margin: 0,
                                  }}
                                >
                                  {sheet.source === "FROM_IPO"
                                    ? "Item specifications are pulled from the linked IPC and are not stored on this record."
                                    : "No item details."}
                                </p>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 14,
                                  }}
                                >
                                  {sheet.items.map((it) => {
                                    const cols = (
                                      sheet.item_columns || []
                                    ).filter(
                                      (c) =>
                                        it.details &&
                                        String(
                                          it.details[c.key] ?? "",
                                        ).trim() !== "",
                                    );
                                    return (
                                      <div
                                        key={it.id}
                                        style={{
                                          border: "1px solid var(--border)",
                                          borderRadius: 10,
                                          background: "var(--card)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            padding: "12px 16px",
                                            borderBottom:
                                              cols.length > 0
                                                ? "1px dashed var(--border)"
                                                : "none",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 10,
                                              minWidth: 0,
                                            }}
                                          >
                                            <span
                                              style={{
                                                flexShrink: 0,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: 26,
                                                height: 22,
                                                padding: "0 7px",
                                                borderRadius: 6,
                                                background: "#334155",
                                                color: "#fff",
                                                fontSize: 12,
                                                fontWeight: 700,
                                              }}
                                            >
                                              #{it.sr_no}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: "var(--foreground)",
                                              }}
                                            >
                                              {it.material_description || "—"}
                                            </span>
                                          </div>
                                          {it.unit && (
                                            <span
                                              style={{
                                                flexShrink: 0,
                                                padding: "3px 9px",
                                                borderRadius: 6,
                                                border:
                                                  "1px solid var(--border)",
                                                background: "var(--background)",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color:
                                                  "var(--muted-foreground)",
                                              }}
                                            >
                                              {it.unit}
                                            </span>
                                          )}
                                        </div>

                                        {cols.length > 0 && (
                                          <div
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns:
                                                "repeat(auto-fill, minmax(210px, 1fr))",
                                              gap: "16px 24px",
                                              padding: "16px",
                                            }}
                                          >
                                            {cols.map((col) => (
                                              <div key={col.key}>
                                                <div
                                                  style={{
                                                    fontSize: 10.5,
                                                    fontWeight: 600,
                                                    letterSpacing: "0.05em",
                                                    textTransform: "uppercase",
                                                    color:
                                                      "var(--muted-foreground)",
                                                    marginBottom: 3,
                                                  }}
                                                >
                                                  {col.label}
                                                </div>
                                                <div
                                                  style={{
                                                    fontSize: 13,
                                                    color: "var(--foreground)",
                                                    wordBreak: "break-word",
                                                  }}
                                                >
                                                  {formatDetailValue(
                                                    it.details?.[col.key],
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {it.image_url && (
                                          <div
                                            style={{ padding: "0 16px 16px" }}
                                          >
                                            <a
                                              href={it.image_url}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <img
                                                src={it.image_url}
                                                alt="item"
                                                style={{
                                                  height: 60,
                                                  width: 60,
                                                  objectFit: "cover",
                                                  borderRadius: 8,
                                                  border:
                                                    "1px solid var(--border)",
                                                }}
                                              />
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Packages */}
                              {(sheet.packages || []).length > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    marginTop: 16,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 600,
                                      letterSpacing: "0.05em",
                                      textTransform: "uppercase",
                                      color: "var(--muted-foreground)",
                                    }}
                                  >
                                    Packages
                                  </span>
                                  {sheet.packages.map((pkg) => (
                                    <span
                                      key={pkg.id}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "4px 10px",
                                        borderRadius: 8,
                                        border: "1px solid var(--border)",
                                        background: "var(--card)",
                                        fontSize: 12,
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: "var(--muted-foreground)",
                                          fontWeight: 600,
                                        }}
                                      >
                                        #{pkg.package_no}
                                      </span>
                                      <span style={{ fontWeight: 600 }}>
                                        {formatQty(pkg.qty)}
                                        {pkg.unit ? ` ${pkg.unit}` : ""}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Meta footer */}
                              <div
                                style={{
                                  marginTop: 16,
                                  fontSize: 11,
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--muted-foreground)",
                                  display: "flex",
                                  gap: 18,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span>record: {sheet.id}</span>
                                <span>
                                  updated: {formatFullDate(sheet.updated_at)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
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
    </div>
  );
};

export default MasterStockSheet;
