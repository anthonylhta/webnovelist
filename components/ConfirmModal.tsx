// components/ConfirmModal.tsx
"use client";

import { AlertTriangle, X } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-hairline rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${danger ? "bg-seal/10" : "bg-gold/10"}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? "text-seal-bright" : "text-gold"}`} />
            </div>
            <h2 className="text-lg font-bold font-serif">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-muted hover:text-paper transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-body">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-elevated hover:bg-hairline text-body
                       font-semibold py-3 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-semibold py-3 rounded-lg transition
              ${
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