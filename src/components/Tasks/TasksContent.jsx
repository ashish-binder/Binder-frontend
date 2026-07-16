// Tasks — Kanban board with drag-and-drop (@hello-pangea/dnd), a click-to-expand task
// detail modal, and an "Assign New Task" modal.
//
// All task data lives in the backend (/api/ims/tasks/) — nothing is stored client-side.
// The board is tenant-wide: every member sees every task in their company. Drags are
// optimistic (the card lands instantly) and roll back if the server rejects the move.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getIPOs,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  acceptTask,
  getPendingAcceptanceTasks,
  addTaskComment,
  toggleTaskSubtask,
  getAssignableUsers,
} from '../../services/integration';
import { normalizeOrderType } from '../../utils/orderType';
import KanbanColumn from './KanbanColumn';
import AssignTaskModal from './AssignTaskModal';
import TaskDetailModal from './TaskDetailModal';
import ConfirmDialog from './ConfirmDialog';
import { COLUMNS, getCurrentUserId, getCurrentUserName } from './tasksData';

// For the "Sort by priority" view lens: Urgent first, Low last.
const PRIORITY_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

// Gap between adjacent cards' positions; mirrors POSITION_GAP on the backend.
const POSITION_GAP = 1000;

// How often to re-check for assignments awaiting my acceptance.
const PENDING_POLL_MS = 60_000;

// Work out the `position` for a card dropped at `destIndex` in `columnTasks`, by
// splitting the gap between the two cards it lands between. Floats mean a drop
// never has to renumber the rest of the column.
const computePosition = (columnTasks, destIndex, movedId) => {
  const others = columnTasks.filter((t) => t.id !== movedId);
  const before = others[destIndex - 1];
  const after = others[destIndex];
  if (!before && !after) return POSITION_GAP;
  if (!before) return (after.position ?? POSITION_GAP) - POSITION_GAP;
  if (!after) return (before.position ?? 0) + POSITION_GAP;
  return ((before.position ?? 0) + (after.position ?? 0)) / 2;
};

const TasksContent = ({ initialView }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  // The sidebar's "Tasks Assigned To You" sets initialView='assigned'; it can also
  // change while the board is already mounted, so follow it rather than only
  // seeding from it.
  const [showMineOnly, setShowMineOnly] = useState(initialView === 'assigned');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [composeStatus, setComposeStatus] = useState('backlog');
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [ipos, setIpos] = useState([]);
  const [members, setMembers] = useState([]);
  // Per-column sort lens — a view preference only. It re-orders your screen and
  // is never written back, so one person sorting cannot rearrange the shared
  // board for everyone else in the company.
  const [sortBy, setSortBy] = useState({});

  const currentUserId = useMemo(() => getCurrentUserId(), []);
  const currentUserName = useMemo(() => getCurrentUserName(), []);

  // Toast ids we've already raised, so a poll doesn't stack duplicates.
  const pendingToastIds = useRef(new Set());

  /* ---------------------------------------------------------------- *
   * Loading
   * ---------------------------------------------------------------- */
  // A Kanban board has to show the whole column, so walk every page rather than
  // taking the first one — the API paginates at 50 and would silently truncate
  // the board for any company with more tasks than that.
  const loadTasks = useCallback(async () => {
    try {
      const all = [];
      let page = 1;
      // Guard against a pathological loop if `next` never clears.
      for (let guard = 0; guard < 50; guard += 1) {
        const response = await getTasks({ page, page_size: 200 });
        const list = response?.results || response?.data || response || [];
        all.push(...(Array.isArray(list) ? list : []));
        if (!response?.next) break;
        page += 1;
      }
      setTasks(all);
      setLoadError('');
    } catch (error) {
      console.error('Tasks: failed to load tasks:', error);
      setLoadError('Could not load tasks. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (initialView) setShowMineOnly(initialView === 'assigned');
  }, [initialView]);

  // Team members for the "Assign to User" picker.
  useEffect(() => {
    getAssignableUsers()
      .then((list) => setMembers(Array.isArray(list) ? list : []))
      .catch((error) => {
        console.warn('Tasks: failed to load members:', error);
        setMembers([]);
      });
  }, []);

  // IPOs (read-only) for the modal's IPO Reference dropdown.
  useEffect(() => {
    const loadIPOs = async () => {
      try {
        const response = await getIPOs();
        const list = response?.results || response?.data || response || [];
        const normalized = Array.isArray(list)
          ? list.map((ipo) => ({
              ipoCode: ipo.ipo_code || ipo.ipoCode || '',
              orderType: normalizeOrderType(ipo.order_type || ipo.orderType || ''),
            }))
          : [];
        setIpos(normalized);
      } catch (error) {
        console.warn('Tasks: failed to load IPOs:', error);
        setIpos([]);
      }
    };

    loadIPOs();
    const handleIpoUpdate = () => loadIPOs();
    window.addEventListener('internalPurchaseOrdersUpdated', handleIpoUpdate);
    return () =>
      window.removeEventListener('internalPurchaseOrdersUpdated', handleIpoUpdate);
  }, []);

  /* ---------------------------------------------------------------- *
   * Assignment acceptance — a sticky toast per unaccepted assignment.
   * ---------------------------------------------------------------- */
  const handleAccept = useCallback(
    async (taskId) => {
      try {
        const updated = await acceptTask(taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        toast.dismiss(`accept-${taskId}`);
        pendingToastIds.current.delete(taskId);
        toast.success('Task accepted.');
      } catch (error) {
        toast.error(error.message || 'Could not accept the task.');
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const checkPending = async () => {
      try {
        const pending = await getPendingAcceptanceTasks();
        if (cancelled || !Array.isArray(pending)) return;

        pending.forEach((task) => {
          if (pendingToastIds.current.has(task.id)) return;
          pendingToastIds.current.add(task.id);

          // duration: Infinity — the toast stays until the user accepts it.
          toast.custom(
            (t) => (
              <div
                className={`pointer-events-auto w-96 max-w-[92vw] rounded-lg border border-[#e2e3e8] bg-card p-4 shadow-lg ${
                  t.visible ? 'animate-enter' : 'animate-leave'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  New task assigned to you
                </div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {task.title}
                </div>
                {task.ownerName && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Assigned by {task.ownerName}
                  </div>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(task);
                      toast.dismiss(t.id);
                      pendingToastIds.current.delete(task.id);
                    }}
                    className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccept(task.id)}
                    className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ),
            { id: `accept-${task.id}`, duration: Infinity },
          );
        });
      } catch (error) {
        console.warn('Tasks: pending-acceptance check failed:', error);
      }
    };

    checkPending();
    const timer = setInterval(checkPending, PENDING_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [handleAccept]);

  /* ---------------------------------------------------------------- *
   * Derived board state
   * ---------------------------------------------------------------- */
  // "My Tasks" = assigned to me.
  const visibleTasks = useMemo(
    () =>
      showMineOnly
        ? tasks.filter((t) => !!currentUserId && t.assigneeId === currentUserId)
        : tasks,
    [tasks, showMineOnly, currentUserId],
  );

  const tasksByColumn = useMemo(() => {
    const grouped = {};
    COLUMNS.forEach((col) => {
      const inColumn = visibleTasks
        .filter((t) => t.status === col.key)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      const lens = sortBy[col.key];
      if (lens === 'priority') {
        inColumn.sort(
          (a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9),
        );
      } else if (lens === 'due') {
        inColumn.sort((a, b) => {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return da - db;
        });
      }
      grouped[col.key] = inColumn;
    });
    return grouped;
  }, [visibleTasks, sortBy]);

  /* ---------------------------------------------------------------- *
   * Modal plumbing
   * ---------------------------------------------------------------- */
  const openCompose = (status = 'backlog') => {
    setEditingTask(null);
    setComposeStatus(status);
    setIsModalOpen(true);
  };

  const openEdit = (taskToEdit) => {
    setEditingTask(taskToEdit);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  /* ---------------------------------------------------------------- *
   * Mutations
   * ---------------------------------------------------------------- */
  const handleSubmitTask = async (draft) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, draft);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        toast.success('Task updated.');
      } else {
        const created = await createTask({ ...draft, status: composeStatus || 'backlog' });
        setTasks((prev) => [created, ...prev]);
        toast.success('Task assigned successfully!');
      }
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Could not save the task.');
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmState({
      title: 'Delete task',
      message: 'This task will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteTask(taskId);
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
          setSelectedTask((prev) => (prev && prev.id === taskId ? null : prev));
          toast.success('Task deleted.');
        } catch (error) {
          toast.error(error.message || 'Could not delete the task.');
        }
      },
    });
  };

  const handleUpdateTags = async (taskId, nextTags) => {
    // Optimistic: tag chips should feel instant.
    const rollback = tasks;
    const apply = (t) => ({ ...t, tags: nextTags });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? apply(t) : t)));
    setSelectedTask((prev) => (prev && prev.id === taskId ? apply(prev) : prev));
    try {
      const updated = await updateTask(taskId, { tags: nextTags });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updated : prev));
    } catch (error) {
      setTasks(rollback);
      toast.error(error.message || 'Could not update tags.');
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      const updated = await toggleTaskSubtask(taskId, subtaskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updated : prev));
    } catch (error) {
      toast.error(error.message || 'Could not update the sub-task.');
    }
  };

  const handleAddComment = async (taskId, message) => {
    const text = message.trim();
    if (!text) return;
    try {
      const comment = await addTaskComment(taskId, text);
      const append = (task) => ({
        ...task,
        comments: [...(Array.isArray(task.comments) ? task.comments : []), comment],
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? append(t) : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? append(prev) : prev));
    } catch (error) {
      toast.error(error.message || 'Could not post the comment.');
    }
  };

  // Sort lens — screen-only, nothing is written. Clicking the active lens clears it.
  const handleSortColumn = (statusKey, by) => {
    setSortBy((prev) => ({ ...prev, [statusKey]: prev[statusKey] === by ? null : by }));
  };

  /* ---------------------------------------------------------------- *
   * Drag & drop — optimistic, with rollback on failure.
   * ---------------------------------------------------------------- */
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // A sorted column shows a computed order, so a drop index there has no stable
    // meaning to persist. Allow the move out, refuse the in-place reorder.
    if (
      source.droppableId === destination.droppableId &&
      sortBy[destination.droppableId]
    ) {
      toast('Clear the column sort to reorder cards by hand.', { icon: '↕️' });
      return;
    }

    const moved = tasks.find((t) => t.id === draggableId);
    if (!moved) return;

    const destColumn = tasksByColumn[destination.droppableId] || [];
    // Dropping into a lens-sorted column: the drop index describes the sorted
    // view, so the cards either side of it aren't neighbours by position and
    // averaging them would put the card somewhere arbitrary. Append instead.
    const destLens = sortBy[destination.droppableId];
    const position = destLens
      ? Math.max(0, ...destColumn.map((t) => t.position ?? 0)) + POSITION_GAP
      : computePosition(destColumn, destination.index, draggableId);
    const rollback = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? { ...t, status: destination.droppableId, position }
          : t,
      ),
    );

    try {
      const updated = await moveTask(draggableId, destination.droppableId, position);
      setTasks((prev) => prev.map((t) => (t.id === draggableId ? updated : t)));
    } catch (error) {
      setTasks(rollback);
      toast.error(error.message || 'Could not move the task.');
    }
  };

  const handleMoveTask = async (taskId, status) => {
    const rollback = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, status } : prev));
    try {
      const updated = await moveTask(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updated : prev));
    } catch (error) {
      setTasks(rollback);
      toast.error(error.message || 'Could not move the task.');
    }
  };

  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--accent': '#edeef1',
      }}
    >
      {/* Hide the board's horizontal scrollbar (WebKit) — it still scrolls. */}
      <style>{`.tasks-board-scroll::-webkit-scrollbar { display: none; }`}</style>

      <div className="mx-auto max-w-[95%] space-y-6">
        {/* Header + toolbar */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track operational workflows and team assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMineOnly((prev) => !prev)}
              title={showMineOnly ? 'Show all tasks' : 'Show tasks assigned to me'}
              aria-label={showMineOnly ? 'Show all tasks' : 'Show tasks assigned to me'}
              aria-pressed={showMineOnly}
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                showMineOnly
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-[#e2e3e8] bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openCompose('backlog')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Assign Task
            </button>
          </div>
        </div>

        {/* Board */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tasks...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
            <p className="text-sm font-medium text-destructive">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadTasks();
              }}
              className="mt-3 cursor-pointer rounded-md border border-[#e2e3e8] bg-card px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div
              className="tasks-board-scroll overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-5">
                {COLUMNS.map((column) => (
                  <KanbanColumn
                    key={column.key}
                    column={column}
                    tasks={tasksByColumn[column.key] || []}
                    sortLens={sortBy[column.key] || null}
                    onTaskClick={setSelectedTask}
                    onAddTask={openCompose}
                    onSortColumn={handleSortColumn}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      {isModalOpen && (
        <AssignTaskModal
          ipos={ipos}
          members={members}
          task={editingTask}
          onClose={closeModal}
          onSubmit={handleSubmitTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onMove={handleMoveTask}
          onAddComment={handleAddComment}
          currentUserName={currentUserName}
          canManage={!!selectedTask.canManage}
          canAccept={
            selectedTask.assigneeId === currentUserId &&
            selectedTask.acceptance === 'pending'
          }
          onAccept={handleAccept}
          onEdit={openEdit}
          onDelete={handleDeleteTask}
          onUpdateTags={handleUpdateTags}
          onToggleSubtask={handleToggleSubtask}
        />
      )}

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        onConfirm={() => {
          confirmState?.onConfirm?.();
          setConfirmState(null);
        }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
};

export default TasksContent;