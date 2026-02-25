/**
 * ConfirmDialog - Accessible modal for destructive/critical actions (F35)
 * Traps focus, supports keyboard navigation, WCAG 2.1 AA.
 */
import { useEffect, useRef, useCallback } from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  busy = false,
}) {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  const variantStyles = {
    danger: "bg-[var(--color-danger)] hover:bg-red-700 text-white",
    warning: "bg-[var(--color-warning)] hover:bg-amber-700 text-white",
    accent: "bg-[var(--color-accent)] hover:bg-blue-700 text-white",
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !busy) {
        onCancel();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [busy, onCancel]
  );

  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={busy ? undefined : onCancel}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="relative z-10 bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-[var(--color-primary)]"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          className="mt-2 text-sm text-gray-600"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${variantStyles[variant] || variantStyles.danger}`}
          >
            {busy ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
