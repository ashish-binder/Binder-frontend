// Pure data, option lists, class strings, and small helpers for the Tasks Kanban board.
// No JSX here so this stays a plain data module (imported by every Tasks subcomponent).

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
  { key: 'backlog', label: 'Backlog', dot: 'bg-slate-400' },
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
 * Seed data — mirrors the reference screenshots. Replaced with API data later.
 * ------------------------------------------------------------------ */
export const SAMPLE_TASKS = [
  {
    id: 'task-seed-1',
    title: 'Implement Fabric Durability Test Protocols',
    description:
      'Define the new standard for elastic resistance in premium denim series before the next production run.',
    priority: 'High',
    status: 'backlog',
    assignee: 'Priya Shah',
    department: 'Quality',
    ipo: '',
    dueDate: '2026-10-24',
    tags: [],
    comments: 4,
    attachments: 0,
    mine: false,
  },
  {
    id: 'task-seed-2',
    title: 'Update IPO Management Dashboard UI',
    description:
      'Migrate old chart components to the new D3 high-performance library and match the flat theme.',
    priority: 'Medium',
    status: 'backlog',
    assignee: 'Rahul Verma',
    department: 'Design',
    ipo: '',
    dueDate: '2026-10-28',
    tags: [],
    mine: true,
  },
  {
    id: 'task-seed-3',
    title: 'Vendor Onboarding: Textile Suppliers Q3',
    description:
      'Collect compliance documents and bank details for four new vendors and generate their codes.',
    priority: 'Medium',
    status: 'backlog',
    assignee: 'Neha Gupta',
    department: 'Merchandising',
    ipo: '',
    dueDate: '2026-11-02',
    tags: [],
    mine: false,
  },
  {
    id: 'task-seed-4',
    title: 'Critical Bug: Purchase Order Total Mismatch',
    description:
      'Floating point calculation error in inventory aggregation for regional units.',
    priority: 'Urgent',
    status: 'in_progress',
    assignee: 'John Doe',
    department: 'Production',
    ipo: '',
    dueDate: '2026-10-20',
    tags: [],
    attachments: 2,
    progress: 60,
    mine: true,
  },
  {
    id: 'task-seed-5',
    title: 'QA Check: New Warehouse Layout',
    description: 'Verify rack labelling and pick-path against the approved plan.',
    priority: 'Low',
    status: 'in_review',
    assignee: 'Sara Lee',
    department: 'Logistics',
    ipo: '',
    dueDate: '',
    tags: ['Logistics', 'V2.4'],
    statusNote: 'Pending Approval',
    mine: false,
  },
  {
    id: 'task-seed-6',
    title: 'Monthly Inventory Reconciliation',
    description: 'Reconcile physical stock counts with the system ledger for September.',
    priority: 'Low',
    status: 'done',
    assignee: 'Amit Roy',
    department: 'Accounts',
    ipo: '',
    dueDate: '',
    tags: [],
    completedAt: 'Completed 2h ago',
    mine: true,
  },
];
