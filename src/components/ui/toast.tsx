"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToastType = "default" | "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const toastStyles: Record<ToastType, string> = {
  default: "bg-[var(--dark-2)] border-[var(--border)]",
  success: "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success-light)]",
  error: "bg-[var(--error)]/10 border-[var(--error)]/30 text-[var(--error-light)]",
  warning: "bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning-light)]",
  info: "bg-[var(--info)]/10 border-[var(--info)]/30 text-[var(--info-light)]",
};

const ToastViewport: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-tooltip)] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "glass-panel p-4 min-w-[300px] max-w-[400px] animate-slide-in-right",
            toastStyles[toast.type]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export type { Toast, ToastType };
