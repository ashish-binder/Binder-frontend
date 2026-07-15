// Shared UI primitives for the Tasks feature: bordered inputs, the priority controls,
// avatar chip, and the themed image picker. Kept separate so the board/card/modal stay small.
import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import {
  CTRL,
  LABEL,
  PRIORITY_LEVELS,
  PRIORITY_PILL,
  getInitials,
  avatarColorFor,
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

// Small uppercase priority pill shown on cards (e.g. "HIGH").
export const PriorityPill = ({ level }) => {
  const key = level || 'Low';
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        PRIORITY_PILL[key] || PRIORITY_PILL.Low
      }`}
    >
      {key}
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
          {level}
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
export const ImageUpload = ({ id, value, onChange, label = 'Upload Reference Image' }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  if (value) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-[#e2e3e8] bg-card p-1.5">
        {preview ? (
          <img
            src={preview}
            alt={value.name}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
          </div>
        )}
        <span
          className="flex-1 truncate text-sm font-medium text-foreground"
          title={value.name}
        >
          {truncateName(value.name)}
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
