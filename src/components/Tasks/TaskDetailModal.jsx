// Expanded task view — portalled to <body>. Read-only detail plus quick "move to stage" buttons.
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PriorityPill, Avatar } from './shared';
import { COLUMNS, formatDueDate } from './tasksData';

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="mt-0.5 break-words text-sm text-foreground">
      {value || '—'}
    </div>
  </div>
);

const TaskDetailModal = ({ task, onClose, onMove }) => {
  if (!task) return null;
  const columnLabel =
    COLUMNS.find((c) => c.key === task.status)?.label || task.status;
  const attachmentName =
    task.attachment?.name || (task.attachments ? `${task.attachments} attachment(s)` : '');

  return createPortal(
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#e2e3e8] px-6 py-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <PriorityPill level={task.priority} />
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {columnLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {task.description && (
            <div className="mb-5">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Assignee
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Avatar name={task.assignee} size="h-6 w-6" />
                <span className="text-sm text-foreground">
                  {task.assignee || '—'}
                </span>
              </div>
            </div>
            <Detail label="Department" value={task.department} />
            <Detail label="PO Type" value={task.poType} />
            <Detail label="IPO Reference" value={task.ipo} />
            <Detail label="Sub-Task" value={task.subTask} />
            <Detail label="Due Date" value={formatDueDate(task.dueDate)} />
            <Detail label="Priority" value={task.priority} />
            <Detail label="Attachment" value={attachmentName} />
            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="min-w-0 sm:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-[#e2e3e8] bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer — move to stage */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e3e8] bg-[#fafafb] px-6 py-4">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Move to
          </span>
          {COLUMNS.map((col) => {
            const active = col.key === task.status;
            return (
              <button
                key={col.key}
                type="button"
                disabled={active}
                onClick={() => onMove(task.id, col.key)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'cursor-default border-primary bg-primary/10 text-primary'
                    : 'cursor-pointer border-[#e2e3e8] bg-card text-foreground/70 hover:bg-muted'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                {col.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TaskDetailModal;
