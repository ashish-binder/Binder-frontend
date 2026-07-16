// Small self-contained confirmation modal (React + Tailwind) — replaces window.confirm.
// Portalled to <body>; Esc / backdrop / Cancel dismiss, the primary button confirms.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleEsc = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmCls =
    tone === 'danger'
      ? 'bg-destructive text-white hover:opacity-90'
      : 'bg-primary text-primary-foreground hover:opacity-90';

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      style={{ zIndex: 10001, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl border border-[#e2e3e8] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              tone === 'danger'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {message && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            title="Close"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e3e8] bg-[#fafafb] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[#e2e3e8] bg-card px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-all ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
