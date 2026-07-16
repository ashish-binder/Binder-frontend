// Shared UI primitives for the Tasks feature: bordered inputs, the priority controls,
// avatar chip, and the themed image picker. Kept separate so the board/card/modal stay small.
import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import {
  CTRL,
  LABEL,
  PRIORITY_LEVELS,
  PRIORITY_PILL,
  formatPriorityLabel,
  getInitials,
  avatarColorFor,
  makeSubtaskId,
} from './tasksData';

export const Input = ({ className = '', ...props }) => (
  <input className={`${CTRL} ${className}`} {...props} />
);

export const Field = ({ label, required, children, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    {label && (
      <label className={LABEL}>
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    {children}
  </div>
);

// Tag input — type a tag and press Enter (or comma) to add a chip; X or Backspace removes.
export const TagsInput = ({ value = [], onChange, placeholder = 'Add tag and press Enter' }) => {
  const [draft, setDraft] = useState('');
  const tags = Array.isArray(value) ? value : [];

  const addTag = (raw) => {
    const v = raw.trim();
    if (!v || tags.includes(v)) return;
    onChange([...tags, v]);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
      e.preventDefault();
      addTag(draft);
      setDraft('');
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border border-[#e2e3e8] bg-card px-3 py-2 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e3e8] bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            title="Remove"
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        className="min-w-28 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

// Editor for a task's checklist of sub-tasks (used in the create/edit modal). Type a
// title and press Enter (or click Add) to append; each row has a remove button. Existing
// `done` state is preserved.
export const SubTasksEditor = ({ value = [], onChange }) => {
  const [draft, setDraft] = useState('');
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const title = draft.trim();
    if (!title) return;
    onChange([...items, { id: makeSubtaskId(), title, done: false }]);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-md border border-[#e2e3e8] bg-card px-3 py-2 text-sm"
            >
              <span
                className={`flex-1 truncate ${
                  item.done ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x.id !== item.id))}
                title="Remove sub-task"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a sub-task and press Enter"
          className={CTRL}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim()}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#e2e3e8] bg-card px-4 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Orange-accented section header used inside the Assign modal.
export const SectionHeader = ({ children }) => (
  <div className="mb-4 flex items-center gap-2">
    <span className="h-4 w-1 rounded-full bg-primary" />
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary">
      {children}
    </h3>
  </div>
);

// Round avatar with initials; colour is derived from the name.
export const Avatar = ({ name, size = 'h-7 w-7' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${size} ${avatarColorFor(
      name,
    )}`}
    title={name || ''}
  >
    {getInitials(name)}
  </span>
);

// Small uppercase priority pill shown on cards (e.g. "HIGH PRIORITY").
export const PriorityPill = ({ level }) => {
  const key = level || 'Low';
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        PRIORITY_PILL[key] || PRIORITY_PILL.Low
      }`}
    >
      {formatPriorityLabel(key)}
    </span>
  );
};

// Full-width 4-way segmented priority selector used in the modal.
export const PrioritySegmented = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-2">
    {PRIORITY_LEVELS.map((level) => {
      const active = value === level;
      const activeCls =
        level === 'Urgent'
          ? 'border-red-500 bg-red-500 text-white'
          : 'border-primary bg-primary text-primary-foreground';
      return (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`cursor-pointer rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
            active
              ? activeCls
              : 'border-[#e2e3e8] bg-card text-foreground/70 hover:bg-muted'
          }`}
        >
          {formatPriorityLabel(level)}
        </button>
      );
    })}
  </div>
);

// Truncate a filename to `max` chars, keeping the extension and adding an ellipsis.
const truncateName = (name, max = 24) => {
  if (!name || name.length <= max) return name || '';
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(1, max - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
};

// Themed image picker: dashed upload button, or once chosen a thumbnail + name + X to clear.
//
// `value` is a freshly picked File. `existingUrl`/`existingName` describe an image
// already uploaded to Blob (i.e. we're editing a saved task) — without them the
// picker would look empty on edit and the saved image would appear to be gone.
export const ImageUpload = ({
  id,
  value,
  existingUrl = '',
  existingName = '',
  onChange,
  label = 'Upload Reference Image',
}) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const shownUrl = preview || existingUrl;
  const shownName = value?.name || existingName;

  if (value || existingUrl) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card p-1.5">
        {shownUrl ? (
          <img
            src={shownUrl}
            alt={shownName || 'attachment'}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
        <span
          className="flex-1 truncate text-sm font-medium text-foreground"
          title={shownName}
        >
          {truncateName(shownName)}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#cdced6] bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
    >
      <ImagePlus className="h-4 w-4" />
      {label}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
};
