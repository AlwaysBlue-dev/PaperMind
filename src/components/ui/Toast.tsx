"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type ToastContextValue = {
  toast: (opts: Omit<ToastItem, "id">) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    const enter = requestAnimationFrame(() => setPhase("visible"));
    const duration = item.duration ?? 4000;
    const exitTimer = setTimeout(() => setPhase("exit"), duration - 250);
    const removeTimer = setTimeout(() => onDismiss(item.id), duration);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [item, onDismiss]);

  const Icon = item.type === "error" ? XCircle : CheckCircle2;
  const iconColor =
    item.type === "error"
      ? "text-red-500"
      : item.type === "success"
        ? "text-success"
        : "text-primary";

  return (
    <div
      className={`toast-item flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-(--card-shadow) ${
        phase === "enter"
          ? "toast-enter"
          : phase === "exit"
            ? "toast-exit"
            : "toast-visible"
      }`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {item.message}
      </p>
      {item.actionLabel && item.onAction && (
        <button
          type="button"
          onClick={() => {
            item.onAction?.();
            onDismiss(item.id);
          }}
          className="pm-focus-ring shrink-0 text-sm font-semibold text-primary"
        >
          {item.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="pm-focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const value: ToastContextValue = {
    toast: addToast,
    success: (message) => addToast({ message, type: "success" }),
    error: (message) => addToast({ message, type: "error" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-container pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-80 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-auto md:right-4 md:top-20 md:items-end md:px-0"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto w-full max-w-sm">
            <ToastItemView item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
