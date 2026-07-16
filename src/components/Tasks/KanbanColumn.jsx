// One Kanban column: coloured header + count + options menu, then its draggable task cards.
import { useEffect, useRef, useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  MoreHorizontal,
  Plus,
  ArrowDownWideNarrow,
  CalendarClock,
  Check,
  X,
} from 'lucide-react';
import TaskCard from './TaskCard';

const MENU_ITEM =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

// The "⋯" dropdown shown on each column header.
//
// Sorting is a view lens: it re-orders this screen only and is never saved. The
// board is shared by the whole company, so a persisted sort would rearrange
// everyone else's board too.
const ColumnMenu = ({ column, sortLens, onAddTask, onSortColumn }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const run = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title="Column options"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors ${
          open
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 z-30 w-48 rounded-md border border-[#e2e3e8] bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <button
            type="button"
            className={`${MENU_ITEM} text-foreground hover:bg-accent`}
            onClick={() => run(() => onAddTask(column.key))}
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            Add task
          </button>
          <button
            type="button"
            className={`${MENU_ITEM} text-foreground hover:bg-accent`}
            onClick={() => run(() => onSortColumn(column.key, 'priority'))}
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1">Sort by priority</span>
            {sortLens === 'priority' && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
          <button
            type="button"
            className={`${MENU_ITEM} text-foreground hover:bg-accent`}
            onClick={() => run(() => onSortColumn(column.key, 'due'))}
          >
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1">Sort by due date</span>
            {sortLens === 'due' && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        </div>
      )}
    </div>
  );
};

const SORT_LABEL = { priority: 'Sorted by priority', due: 'Sorted by due date' };

const KanbanColumn = ({
  column,
  tasks,
  sortLens = null,
  onTaskClick,
  onAddTask,
  onSortColumn,
}) => (
  <div className="flex w-80 shrink-0 flex-col">
    {/* Column header */}
    <div className="mb-3 flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
        <span className="text-sm font-bold text-foreground">{column.label}</span>
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <ColumnMenu
        column={column}
        sortLens={sortLens}
        onAddTask={onAddTask}
        onSortColumn={onSortColumn}
      />
    </div>

    {/* Active sort lens — shown so it's obvious why the order looks different,
        and because manual reordering is off while it's on. */}
    {sortLens && (
      <button
        type="button"
        onClick={() => onSortColumn(column.key, sortLens)}
        title="Clear sort"
        className="mb-2 flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        {SORT_LABEL[sortLens]}
        <X className="h-3 w-3" />
      </button>
    )}

    {/* Droppable card list */}
    <Droppable droppableId={column.key}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex min-h-24 flex-1 flex-col gap-3 rounded-lg p-2.5 transition-colors ${
            snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-[#ececee]/60'
          }`}
        >
          {tasks.length === 0 && !snapshot.isDraggingOver && (
            <div className="rounded-lg border border-dashed border-[#d5d6dc] px-3 py-8 text-center text-xs text-muted-foreground">
              No tasks
            </div>
          )}

          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(dragProvided, dragSnapshot) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                  onClick={() => onTaskClick(task)}
                  className={`select-none outline-none ${
                    dragSnapshot.isDragging ? 'rotate-1 opacity-95 shadow-lg' : ''
                  }`}
                >
                  <TaskCard task={task} />
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export default KanbanColumn;
