"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-(--card-shadow)"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-foreground-muted">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="pm-btn pm-btn-ghost min-h-11 flex-1 sm:flex-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`pm-btn min-h-11 flex-1 sm:flex-none ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "pm-btn-primary"
            }`}
          >
            {isLoading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
