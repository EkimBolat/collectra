"use client";

export default function ConfirmDialog({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  pending,
}: {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60"
        aria-label={cancelLabel}
      />
      <div className="card relative w-full max-w-sm p-5">
        <p className="text-sm text-foreground/90">{message}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="btn flex-1 bg-danger text-white hover:brightness-110 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
