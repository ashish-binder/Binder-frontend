// A single Kanban task card.
import { Calendar, Paperclip, MessageSquare, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { Avatar, PriorityPill } from './shared';
import { formatDueDate, formatRelativeTime, getSubtaskProgress } from './tasksData';

const TaskCard = ({ task }) => {
  const isDone = task.status === 'done';
  const subProgress = getSubtaskProgress(task);
  const percent = subProgress ? subProgress.percent : null;
  const showProgress = percent !== null;
  const due = formatDueDate(task.dueDate);
  const completed = formatRelativeTime(task.completedAt);
  // Assigned to someone who hasn't picked it up yet.
  const awaitingAcceptance = task.acceptance === 'pending';

  return (
    <div className="cursor-pointer rounded-lg border border-[#e2e3e8] bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row: priority + assignee */}
      <div className="mb-2 flex items-start justify-between gap-2">
        {isDone ? (
          <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
            Completed
          </span>
        ) : (
          <PriorityPill level={task.priority} />
        )}
        {isDone ? (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
        ) : (
          <Avatar name={task.assignee} />
        )}
      </div>

      {/* Title */}
      <h4
        className={`text-sm font-bold leading-snug text-foreground ${
          isDone ? 'line-through opacity-70' : ''
        }`}
      >
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* Progress (from sub-tasks, or legacy in-progress value) */}
      {showProgress && (
        <div className="mt-3">
          {subProgress && (
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {subProgress.done}/{subProgress.total} subtasks
              </span>
              <span>{percent}%</span>
            </div>
          )}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                task.priority === 'Urgent' ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {Array.isArray(task.tags) && task.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[#e2e3e8] bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {isDone && completed ? (
          <span className="inline-flex items-center gap-1 font-medium text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed {completed}
          </span>
        ) : (
          <>
            {awaitingAcceptance && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Awaiting acceptance
              </span>
            )}
            {due && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {due}
              </span>
            )}
            {task.statusNote && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {task.statusNote}
              </span>
            )}
            {typeof task.attachments === 'number' && task.attachments > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                {task.attachments} attachment{task.attachments === 1 ? '' : 's'}
              </span>
            )}
            {Array.isArray(task.comments) && task.comments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {task.comments.length}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
