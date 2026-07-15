// One Kanban column: coloured header + count, then its draggable task cards.
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ column, tasks, onTaskClick }) => (
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
      <button
        type="button"
        title="Column options"
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>

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
