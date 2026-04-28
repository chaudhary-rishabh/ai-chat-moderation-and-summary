"use client";

import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-panel bg-surface p-6 max-w-sm w-full mx-4 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-glass">
          <X className="w-4 h-4 text-ink-faint" />
        </button>
        <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
        <p className="text-sm text-ink-soft mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm text-ink-soft hover:bg-glass transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium text-white transition",
              variant === "danger" ? "bg-danger hover:bg-danger/80" : "bg-accent hover:bg-accent-hover",
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
