// Pure data, option lists, class strings, and small helpers for the Tasks Kanban board.
// No JSX here so this stays a plain data module (imported by every Tasks subcomponent).
//
// Task data itself lives in the backend (/api/ims/tasks/) — nothing here is stored
// client-side. See services/integration.js for the API layer.
import { getUser as getStoredUser } from '../../api/authService';

/* ------------------------------------------------------------------ *
 * Flat/clean theme class strings (match the StockSheet revamp).
 * ------------------------------------------------------------------ */
export const CARD = 'rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6';
export const LABEL =
  'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground';
export const CTRL =
  'w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
export const PRIMARY_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
export const OUTLINE_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#e2e3e8] bg-card px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted';
export const GHOST_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground';

/* ------------------------------------------------------------------ *
 * Options.
 * ------------------------------------------------------------------ */
export const PO_TYPE_OPTIONS = ['Company', 'Production', 'Sampling'];
export const DEPARTMENT_OPTIONS = [
  'Merchandising',
  'Production',
  'Quality',
  'Logistics',
  'Design',
  'Accounts',
];
export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent'];
export const formatPriorityLabel = (level) => {
  const base = String(level || 'Low').trim();
  if (!base) return 'Low Priority';
  return /priority$/i.test(base) ? base : `${base} Priority`;
};

export const toOptions = (values) => (values || []).map((v) => ({ value: v, label: v }));

/* ------------------------------------------------------------------ *
 * Priority + column config.
 * ------------------------------------------------------------------ */
export const PRIORITY_PILL = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

export const COLUMNS = [
  { key: 'backlog', label: 'Todos', dot: 'bg-slate-400' },
  { key: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
  { key: 'in_review', label: 'In Review', dot: 'bg-amber-500' },
  { key: 'done', label: 'Done', dot: 'bg-green-500' },
];

/* ------------------------------------------------------------------ *
 * Avatar helpers.
 * ------------------------------------------------------------------ */
const AVATAR_COLORS = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-600',
];

export const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const avatarColorFor = (name) => {
  const str = String(name || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/* ------------------------------------------------------------------ *
 * Date helper (e.g. "Oct 24").
 * ------------------------------------------------------------------ */
export const formatDueDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ------------------------------------------------------------------ *
 * Current user — delegated to authService, which is the single source of
 * truth for the session and honours "Remember me" (localStorage vs
 * sessionStorage). Reading localStorage directly here would return null for
 * anyone who logged in without ticking it.
 * ------------------------------------------------------------------ */
export const getCurrentUser = () => {
  try {
    return getStoredUser();
  } catch {
    return null;
  }
};

export const getCurrentUserId = () => getCurrentUser()?.id || null;

export const getCurrentUserName = () => {
  const user = getCurrentUser();
  if (!user) return '';
  return (
    user.full_name ||
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.email ||
    ''
  );
};

/* ------------------------------------------------------------------ *
 * Sub-tasks — a checklist per task. Progress is derived from completion.
 * ------------------------------------------------------------------ */
let subtaskSeq = 0;
export const makeSubtaskId = () => {
  subtaskSeq += 1;
  return `sub-${Date.now()}-${subtaskSeq}`;
};

export const getSubtaskProgress = (task) => {
  const subs = Array.isArray(task?.subTasks) ? task.subTasks : [];
  if (subs.length === 0) return null;
  const done = subs.filter((s) => s.done).length;
  return { done, total: subs.length, percent: Math.round((done / subs.length) * 100) };
};

/* ------------------------------------------------------------------ *
 * Relative time — the Done card shows "Completed 2h ago", derived from the
 * server's completed_at timestamp rather than a stored string.
 * ------------------------------------------------------------------ */
export const formatRelativeTime = (value) => {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
