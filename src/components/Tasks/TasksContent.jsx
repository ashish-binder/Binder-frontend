// Tasks — Kanban board with drag-and-drop (@hello-pangea/dnd), a click-to-expand task
// detail modal, and an "Assign New Task" modal.
//
// Tasks currently live in local component state (seeded with SAMPLE_TASKS). When the
// backend endpoints land, swap the seed + the create/move handlers for API calls; the
// board, card, and modals don't need to change.
import { useEffect, useMemo, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIPOs } from '../../services/integration';
import { normalizeOrderType } from '../../utils/orderType';
import KanbanColumn from './KanbanColumn';
import AssignTaskModal from './AssignTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { COLUMNS, SAMPLE_TASKS } from './tasksData';

let taskSeq = 0;
const nextTaskId = () => {
  taskSeq += 1;
  return `task-local-${taskSeq}-${SAMPLE_TASKS.length + taskSeq}`;
};

const TasksContent = () => {
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [ipos, setIpos] = useState([]);

  // Load IPOs (read-only) to populate the modal's IPO Reference dropdown.
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

  const isVisible = (task) => !showMineOnly || task.mine;

  const visibleTasks = useMemo(
    () => (showMineOnly ? tasks.filter((t) => t.mine) : tasks),
    [tasks, showMineOnly],
  );

  const tasksByColumn = useMemo(() => {
    const grouped = {};
    COLUMNS.forEach((col) => {
      grouped[col.key] = visibleTasks.filter((t) => t.status === col.key);
    });
    return grouped;
  }, [visibleTasks]);

  const handleCreateTask = (draft) => {
    const newTask = {
      id: nextTaskId(),
      status: 'backlog',
      tags: [],
      comments: 0,
      mine: true,
      ...draft,
    };
    setTasks((prev) => [newTask, ...prev]);
    setIsModalOpen(false);
    toast.success('Task assigned successfully!');
  };

  // Drag between (or within) columns. Rebuilds the flat task list from the reordered,
  // currently-visible column groups while leaving filtered-out tasks in place.
  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setTasks((prev) => {
      const columnsMap = {};
      COLUMNS.forEach((col) => {
        columnsMap[col.key] = [];
      });
      prev.forEach((task) => {
        if (isVisible(task)) columnsMap[task.status]?.push(task);
      });

      const srcCol = columnsMap[source.droppableId];
      if (!srcCol) return prev;
      const [moved] = srcCol.splice(source.index, 1);
      if (!moved) return prev;

      const updatedMoved = { ...moved, status: destination.droppableId };
      columnsMap[destination.droppableId].splice(destination.index, 0, updatedMoved);

      // New order for the visible tasks (grouped by column), then merge back into the
      // full list — hidden tasks keep their slots, visible slots take the new order.
      const newVisibleOrder = COLUMNS.flatMap((col) => columnsMap[col.key]);
      let vi = 0;
      return prev.map((task) => (isVisible(task) ? newVisibleOrder[vi++] : task));
    });
  };

  // Move a task to a stage from the detail modal.
  const handleMoveTask = (taskId, status) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, status } : prev));
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
              title={showMineOnly ? 'Show all tasks' : 'Show my tasks only'}
              aria-label={showMineOnly ? 'Show all tasks' : 'Show my tasks only'}
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Assign Task
            </button>
          </div>
        </div>

        {/* Board */}
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
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      {isModalOpen && (
        <AssignTaskModal
          ipos={ipos}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onMove={handleMoveTask}
        />
      )}
    </div>
  );
};

export default TasksContent;
