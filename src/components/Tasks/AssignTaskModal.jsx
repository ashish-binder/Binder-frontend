// "Assign New Task" modal — portalled to <body>. Collects the task fields and hands a
// plain task object back via onSubmit; it does not touch any API (parent stores in state).
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import ThemedSelect from '../IMS/StockSheet/ThemedSelect';
import {
  Field,
  Input,
  SectionHeader,
  PrioritySegmented,
  ImageUpload,
  TagsInput,
  SubTasksEditor,
} from './shared';
import {
  CTRL,
  LABEL,
  PRIMARY_BTN,
  GHOST_BTN,
  PO_TYPE_OPTIONS,
  DEPARTMENT_OPTIONS,
  toOptions,
} from './tasksData';
import { normalizeOrderType } from '../../utils/orderType';

const todayValue = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const AssignTaskModal = ({ ipos = [], task = null, onClose, onSubmit }) => {
  const isEditing = !!task;
  const [poType, setPoType] = useState(task?.poType || '');
  const [ipo, setIpo] = useState(task?.ipo || '');
  const [department, setDepartment] = useState(task?.department || '');
  const [assignee, setAssignee] = useState(
    task?.assignee && task.assignee !== 'Unassigned' ? task.assignee : '',
  );
  const [title, setTitle] = useState(task?.title || '');
  const [subTasks, setSubTasks] = useState(
    Array.isArray(task?.subTasks) ? task.subTasks : [],
  );
  const [remarks, setRemarks] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [attachment, setAttachment] = useState(task?.attachment || null);
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [tags, setTags] = useState(Array.isArray(task?.tags) ? task.tags : []);
  const [error, setError] = useState('');

  const today = useMemo(() => todayValue(), []);

  // IPO options for the selected PO type.
  const ipoOptions = useMemo(() => {
    const normalizedType = normalizeOrderType(poType);
    return ipos
      .filter(
        (item) =>
          normalizeOrderType(item.orderType || item.order_type) === normalizedType &&
          (item.ipoCode || item.code),
      )
      .map((item) => item.ipoCode || item.code)
      .filter(Boolean);
  }, [ipos, poType]);

  const handlePoTypeChange = (value) => {
    setPoType(value);
    setIpo('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Task name is required.');
      return;
    }
    const hasFile = attachment instanceof File;
    // Keep the image locally: hold the File plus a viewable object URL + name.
    // (No upload yet — swap for a real URL when the endpoint lands.)
    const attachmentUrl = hasFile ? URL.createObjectURL(attachment) : '';
    onSubmit({
      title: title.trim(),
      subTasks,
      description: remarks.trim(),
      priority,
      poType,
      ipo,
      department,
      assignee: assignee.trim() || 'Unassigned',
      dueDate,
      attachment: hasFile ? attachment : null,
      attachmentUrl,
      attachmentName: hasFile ? attachment.name : '',
      attachments: hasFile ? 1 : 0,
      tags,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/40 p-4"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--accent': '#edeef1',
      }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e2e3e8] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEditing ? 'Edit Task' : 'Assign New Task'}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isEditing
                ? 'Update the task details.'
                : 'Fill in the details to allocate task to team members.'}
            </p>
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
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Assignment details */}
          <section>
            <SectionHeader>Assignment Details</SectionHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="PO Type">
                <ThemedSelect
                  value={poType}
                  onChange={handlePoTypeChange}
                  options={toOptions(PO_TYPE_OPTIONS)}
                  placeholder="Select PO Type"
                />
              </Field>
              <Field label="IPO Reference">
                <ThemedSelect
                  value={ipo}
                  onChange={setIpo}
                  options={toOptions(ipoOptions)}
                  isDisabled={ipoOptions.length === 0}
                  placeholder={
                    !poType
                      ? 'Select PO type first'
                      : ipoOptions.length === 0
                        ? 'No IPOs available'
                        : 'Select IPO'
                  }
                />
              </Field>
              <Field label="Department">
                <ThemedSelect
                  value={department}
                  onChange={setDepartment}
                  options={toOptions(DEPARTMENT_OPTIONS)}
                  placeholder="Select Department"
                />
              </Field>
              <Field label="Assign to User">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Search team member..."
                    className={`${CTRL} pl-10`}
                  />
                </div>
              </Field>
            </div>
          </section>

          {/* Task specification */}
          <section className="mt-7">
            <SectionHeader>Task Specification</SectionHeader>
            <div className="space-y-4">
              <Field label="Task Name" required>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter task name"
                />
              </Field>

              <Field label="Sub-Tasks (Optional)">
                <SubTasksEditor value={subTasks} onChange={setSubTasks} />
              </Field>

              <Field label="Remarks / Description">
                <textarea
                  className={`${CTRL} min-h-24 resize-y`}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide detailed instructions..."
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Due Date">
                  <Input
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Field>
                <Field label="Attachment">
                  <ImageUpload
                    id="assign-task-attachment"
                    value={attachment}
                    onChange={setAttachment}
                  />
                </Field>
              </div>

              <div>
                <label className={LABEL}>Task Priority</label>
                <PrioritySegmented value={priority} onChange={setPriority} />
              </div>

              <Field label="Tags">
                <TagsInput value={tags} onChange={setTags} />
              </Field>

              {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e2e3e8] px-6 py-4">
          <button type="button" onClick={onClose} className={GHOST_BTN}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className={PRIMARY_BTN}>
            {isEditing ? 'Save Changes' : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AssignTaskModal;
