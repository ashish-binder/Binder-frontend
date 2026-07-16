// Expanded task view — portalled to <body>. Read-only detail plus quick "move to stage" buttons.
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send, Pencil, Trash2, ListChecks } from 'lucide-react';
import { PriorityPill, Avatar, TagsInput } from './shared';
import {
  CTRL,
  COLUMNS,
  formatDueDate,
  formatPriorityLabel,
  getSubtaskProgress,
} from './tasksData';

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

const TaskDetailModal = ({
  task,
  onClose,
  onMove,
  onAddComment,
  currentUserName,
  // Server-computed: the task's creator, or a master admin. The board is
  // tenant-wide, so this is what gates the edit/delete controls.
  canManage = false,
  canAccept = false,
  onAccept,
  onEdit,
  onDelete,
  onUpdateTags,
  onToggleSubtask,
}) => {
  const [draft, setDraft] = useState('');
  if (!task) return null;
  const subTasks = Array.isArray(task.subTasks) ? task.subTasks : [];
  const subProgress = getSubtaskProgress(task);
  const columnLabel =
    COLUMNS.find((c) => c.key === task.status)?.label || task.status;
  const attachmentName =
    task.attachmentName ||
    task.attachment?.name ||
    (task.attachments ? `${task.attachments} attachment(s)` : '');
  const attachmentUrl = task.attachmentUrl || '';
  const comments = Array.isArray(task.comments) ? task.comments : [];

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment(task.id, text);
    setDraft('');
  };

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
          <div className="flex shrink-0 items-center gap-1">
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  title="Edit task"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  title="Delete task"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-[#e2e3e8]" />
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {/* Awaiting my acceptance — the same action as the sticky toast, so a
              user who dismissed the toast can still accept from the card. */}
          {canAccept && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <div>
                <div className="text-xs font-bold text-foreground">
                  This task is assigned to you
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {task.ownerName
                    ? `Assigned by ${task.ownerName}. Accept to confirm you've picked it up.`
                    : "Accept to confirm you've picked it up."}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAccept(task.id)}
                className="shrink-0 cursor-pointer rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                Accept task
              </button>
            </div>
          )}

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
            <Detail label="Due Date" value={formatDueDate(task.dueDate)} />
            <Detail label="Priority" value={formatPriorityLabel(task.priority)} />
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Attachment
              </div>
              {attachmentUrl ? (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-2"
                  title="Open image"
                >
                  <img
                    src={attachmentUrl}
                    alt={attachmentName || 'attachment'}
                    className="h-11 w-11 shrink-0 rounded border border-[#e2e3e8] object-cover"
                  />
                  <span className="truncate text-sm font-medium text-primary hover:underline">
                    {attachmentName || 'View image'}
                  </span>
                </a>
              ) : (
                <div className="mt-0.5 break-words text-sm text-foreground">
                  {attachmentName || '—'}
                </div>
              )}
            </div>
            {canManage ? (
              <div className="min-w-0 sm:col-span-2">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </div>
                <TagsInput
                  value={task.tags || []}
                  onChange={(next) => onUpdateTags(task.id, next)}
                />
              </div>
            ) : (
              Array.isArray(task.tags) &&
              task.tags.length > 0 && (
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
              )
            )}
          </div>

          {/* Sub-tasks */}
          {subTasks.length > 0 && (
            <div className="mt-6 border-t border-[#e2e3e8] pt-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" />
                  Sub-tasks
                </div>
                {subProgress && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {subProgress.done}/{subProgress.total} · {subProgress.percent}%
                  </span>
                )}
              </div>

              {subProgress && (
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${subProgress.percent}%` }}
                  />
                </div>
              )}

              <ul className="space-y-1.5">
                {subTasks.map((sub) => (
                  <li key={sub.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card px-3 py-2 transition-colors hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={!!sub.done}
                        onChange={() => onToggleSubtask(task.id, sub.id)}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[#f94d00]"
                      />
                      <span
                        className={`text-sm ${
                          sub.done
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div className="mt-6 border-t border-[#e2e3e8] pt-5">
            <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({comments.length})
            </div>

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Start the conversation.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <Avatar name={comment.name} size="h-7 w-7" />
                    <div className="min-w-0 flex-1 rounded-lg border border-[#e2e3e8] bg-muted/40 px-3 py-2">
                      <div className="text-xs font-semibold text-foreground">
                        {comment.name}
                      </div>
                      <p className="mt-0.5 break-words text-sm text-foreground">
                        {comment.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New comment */}
            <div className="mt-4 flex items-center gap-2.5">
              <Avatar name={currentUserName || 'You'} size="h-7 w-7" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder="Write a comment..."
                className={CTRL}
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={!draft.trim()}
                title="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
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
