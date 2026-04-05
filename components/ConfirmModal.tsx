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
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${danger ? "bg-red-500/10" : "bg-blue-500/10"}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-blue-500"}`} />
            </div>
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 
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
                  ? "bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white"
                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white"
              }`}
          >
            {loading ? "Removing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}