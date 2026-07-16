// "Assign New Task" modal — portalled to <body>. Collects the task fields, uploads any
// attachment to Vercel Blob, and hands the API payload back via onSubmit (the parent
// does the create/update call).
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
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
import { uploadToBlob } from '../../services/blobUpload';

const todayValue = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const AssignTaskModal = ({
  ipos = [],
  members = [],
  task = null,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!task;
  const [poType, setPoType] = useState(task?.poType || '');
  const [ipo, setIpo] = useState(task?.ipo || '');
  const [department, setDepartment] = useState(task?.department || '');
  // The real member id — assignment has to resolve to an actual user, not a name.
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  const [title, setTitle] = useState(task?.title || '');
  const [subTasks, setSubTasks] = useState(
    Array.isArray(task?.subTasks) ? task.subTasks : [],
  );
  const [remarks, setRemarks] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  // Either a freshly picked File, or the existing blob URL when editing.
  const [attachment, setAttachment] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState(task?.attachmentUrl || '');
  const [attachmentName, setAttachmentName] = useState(task?.attachmentName || '');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [tags, setTags] = useState(Array.isArray(task?.tags) ? task.tags : []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => todayValue(), []);

  const memberOptions = useMemo(
    () =>
      members.map((m) => ({
        value: m.id,
        label: m.designation ? `${m.name} · ${m.designation}` : m.name || m.email,
      })),
    [members],
  );

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Task name is required.');
      return;
    }

    setSaving(true);
    try {
      // Upload to Vercel Blob first and persist only the public URL — a local
      // object URL would die with the tab and be invisible to teammates.
      let url = attachmentUrl;
      let name = attachmentName;
      if (attachment instanceof File) {
        const uploaded = await uploadToBlob(attachment, 'tasks/attachments');
        if (!uploaded) {
          setError('Image upload failed. Remove the image or try again.');
          setSaving(false);
          return;
        }
        url = uploaded;
        name = attachment.name;
      }

      await onSubmit({
        title: title.trim(),
        subTasks,
        description: remarks.trim(),
        priority,
        poType,
        ipo,
        department,
        assigneeId: assigneeId || null,
        dueDate,
        attachmentUrl: url || '',
        attachmentName: url ? name : '',
        tags,
      });
    } catch (submitError) {
      setError(submitError.message || 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  };

  // Clearing the picker must also drop an already-uploaded URL, or the old image
  // silently survives the save.
  const handleAttachmentChange = (file) => {
    setAttachment(file);
    if (!file) {
      setAttachmentUrl('');
      setAttachmentName('');
    }
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
                <ThemedSelect
                  value={assigneeId}
                  onChange={setAssigneeId}
                  options={memberOptions}
                  isDisabled={memberOptions.length === 0}
                  placeholder={
                    memberOptions.length === 0
                      ? 'No team members found'
                      : 'Search team member...'
                  }
                />
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
                    existingUrl={attachmentUrl}
                    existingName={attachmentName}
                    onChange={handleAttachmentChange}
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
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={GHOST_BTN}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className={PRIMARY_BTN}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AssignTaskModal;
