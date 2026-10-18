import { useEffect } from "react";
import { Icon, type IconName } from "./IconSet";

export type ToastTone = "success" | "info" | "warning";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

export interface ToastProps {
  readonly toast: ToastMessage;
  readonly lifetimeMs: number;
  readonly onDismiss: (id: number) => void;
}

const toneIcons: Record<ToastTone, IconName> = { success: "check", info: "sparkle", warning: "clock" };

export function Toast({ toast, lifetimeMs, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), lifetimeMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, lifetimeMs, onDismiss]);
  return (
    <button type="button" className={`ad-toast ad-toast--${toast.tone}`} onClick={() => onDismiss(toast.id)}>
      <span className="ad-toast__icon">
        <Icon name={toneIcons[toast.tone]} size={16} />
      </span>
      <span>{toast.text}</span>
    </button>
  );
}
