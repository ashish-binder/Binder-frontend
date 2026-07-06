import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getFilteredActivityLogs, getMembers } from "../api/authService";

const ACTION_TYPES = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "edit", label: "Edit" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "role_switch", label: "Role Switch" },
  { value: "onboarding_completed", label: "Onboarding Completed" },
];

const ENTITY_TYPES = [
  { value: "", label: "All Modules" },
  { value: "inventory_management.VendorCode", label: "Vendor Codes" },
  { value: "inventory_management.BuyerCode", label: "Buyer Codes" },
  {
    value: "inventory_management.InternalPurchaseOrder",
    label: "Internal Purchase Orders",
  },
  { value: "inventory_management.PurchaseOrder", label: "Purchase Orders" },
  { value: "inventory_management.FactoryCode", label: "Factory Codes" },
  { value: "inventory_management.Product", label: "Products" },
  { value: "inventory_management.Component", label: "Components" },
  { value: "inventory_management.RawMaterial", label: "Raw Materials" },
  {
    value: "inventory_management.ConsumptionMaterial",
    label: "Consumption Materials",
  },
  { value: "inventory_management.ArtworkMaterial", label: "Artwork Materials" },
  { value: "inventory_management.Packaging", label: "Packaging" },
  {
    value: "inventory_management.CompanyEssential",
    label: "Company Essentials",
  },
  { value: "inventory_management.Department", label: "Departments" },
  { value: "inventory_management.Segment", label: "Segments" },
  {
    value: "inventory_management.InwardStoreSheet",
    label: "Inward Store Logs",
  },
  {
    value: "inventory_management.OutwardStoreSheet",
    label: "Outward Store Logs",
  },
  { value: "auth_service.User", label: "Users" },
  { value: "auth_service.Tenant", label: "Company" },
];

const S = {
  container: {
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--foreground)",
    margin: "0 0 4px",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--muted-foreground)",
    margin: 0,
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-end",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 160,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filterSelect: {
    padding: "8px 12px",
    border: "1.5px solid var(--border)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--foreground)",
    background: "var(--input)",
    outline: "none",
    cursor: "pointer",
    minWidth: 150,
  },
  filterInput: {
    padding: "8px 12px",
    border: "1.5px solid var(--border)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--foreground)",
    background: "var(--input)",
    outline: "none",
    minWidth: 140,
  },
  clearBtn: {
    padding: "8px 16px",
    border: "1.5px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    background: "var(--card)",
    cursor: "pointer",
    transition: "all 0.15s",
    alignSelf: "flex-end",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid var(--border)",
    borderRadius: 12,
    background: "var(--card)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--muted-foreground)",
    borderBottom: "2px solid var(--border)",
    background: "var(--muted)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 16px",
    borderBottom: "1px solid var(--border)",
    color: "var(--foreground)",
    verticalAlign: "top",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  emptyRow: {
    textAlign: "center",
    padding: "40px 16px",
    color: "var(--muted-foreground)",
    fontSize: 14,
  },
  loading: {
    textAlign: "center",
    padding: "48px 16px",
    color: "var(--muted-foreground)",
    fontSize: 14,
  },
  error: {
    background: "var(--muted)",
    border: "1px solid var(--destructive)",
    color: "var(--destructive)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  summaryCell: {
    maxWidth: 400,
    lineHeight: 1.5,
  },
};

const actionColors = {
  create: { bg: "#dcfce7", color: "#166534" },
  edit: { bg: "#dbeafe", color: "#1e40af" },
  update: { bg: "#dbeafe", color: "#1e40af" },
  delete: { bg: "#fee2e2", color: "#991b1b" },
  approve: { bg: "#f0fdf4", color: "#15803d" },
  login: { bg: "#fef3c7", color: "#92400e" },
  logout: { bg: "#f3f4f6", color: "#374151" },
  role_switch: { bg: "#ede9fe", color: "#5b21b6" },
  view: { bg: "#f0f9ff", color: "#0369a1" },
  onboarding_completed: { bg: "#dcfce7", color: "#166534" },
};

function formatTimestamp(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

function ActionBadge({ action }) {
  const c = actionColors[action] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ ...S.badge, background: c.bg, color: c.color }}>
      {(action || "").replace(/_/g, " ")}
    </span>
  );
}

export default function ActivityLogs() {
  const { user } = useAuth();
  const isMasterAdmin =
    user?.highest_role === "master_admin" || user?.role === "master_admin";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);

  // Filters
  const [filterUser, setFilterUser] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Load members for user filter dropdown (master admin only)
  useEffect(() => {
    if (isMasterAdmin) {
      getMembers()
        .then((data) => {
          const list = Array.isArray(data)
            ? data
            : data?.results || data?.data || [];
          setMembers(list);
        })
        .catch(() => {});
    }
  }, [isMasterAdmin]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFilteredActivityLogs({
        user: filterUser,
        action: filterAction,
        entity_type: filterModule,
        from_date: filterFrom,
        to_date: filterTo,
      });
      setLogs(data);
    } catch (err) {
      setError(err.message || "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterUser, filterModule, filterAction, filterFrom, filterTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearFilters = () => {
    setFilterUser("");
    setFilterModule("");
    setFilterAction("");
    setFilterFrom("");
    setFilterTo("");
  };

  const hasActiveFilters =
    filterUser || filterModule || filterAction || filterFrom || filterTo;

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h2 style={S.title}>Activity Logs</h2>
        <p style={S.subtitle}>
          {isMasterAdmin
            ? "Track all actions across your organization — who did what, when, and where"
            : "View your recent activity"}
        </p>
      </div>

      {/* Filter Bar */}
      <div style={S.filterBar}>
        {isMasterAdmin && (
          <div style={S.filterGroup}>
            <span style={S.filterLabel}>User</span>
            <select
              style={S.filterSelect}
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">All Users</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Module</span>
          <select
            style={S.filterSelect}
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            {ENTITY_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Action</span>
          <select
            style={S.filterSelect}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div style={S.filterGroup}>
          <span style={S.filterLabel}>From</span>
          <input
            type="date"
            style={S.filterInput}
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>

        <div style={S.filterGroup}>
          <span style={S.filterLabel}>To</span>
          <input
            type="date"
            style={S.filterInput}
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button style={S.clearBtn} onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {error && <div style={S.error}>{error}</div>}

      {/* Table */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.loading}>Loading logs...</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Timestamp</th>
                <th style={S.th}>User</th>
                <th style={S.th}>Action</th>
                <th style={S.th}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={S.emptyRow}>
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 500 }}>
                        {log.user_name || log.user_email || "-"}
                      </div>
                      {log.user_name && log.user_email && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {log.user_email}
                        </div>
                      )}
                    </td>
                    <td style={S.td}>
                      <ActionBadge action={log.action} />
                    </td>
                    <td style={{ ...S.td, ...S.summaryCell }}>
                      {log.summary || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
