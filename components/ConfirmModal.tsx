// components/ConfirmModal.tsx
"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border border-hairline bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
          <div className="min-w-0">
            <p
              className={`font-mono text-[9.5px] uppercase tracking-[0.22em] ${
                danger ? "text-seal-bright" : "text-gold-dim"
              }`}
            >
              {danger ? "Confirm removal" : "Confirm"}
            </p>
            <h2 className="mt-1 truncate font-serif text-[17px] text-paper">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 font-mono text-[11px] text-muted transition hover:text-gold"
          >
            [close]
          </button>
        </div>

        {/* Body */}
        <p className="px-4 py-4 font-serif text-[14.5px] leading-relaxed text-body">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 px-4 pb-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-[2px] border border-hairline py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-muted transition hover:border-gold-dim hover:text-paper disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-[2px] py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] transition ${
              danger
                ? "bg-seal text-paper hover:bg-seal-bright disabled:bg-seal/50"
                : "bg-gold text-ink hover:bg-gold-bright disabled:bg-gold/50"
            }`}
          >
            {loading ? "Removing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
