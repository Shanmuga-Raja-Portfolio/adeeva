import { Icon, type IconName } from "./IconSet";
import "./ToastStack.css";

export type ToastTone = "success" | "info" | "warning";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

export interface ToastStackProps {
  toasts: readonly ToastMessage[];
  onDismiss: (id: number) => void;
}

const toneIcons: Record<ToastTone, IconName> = { success: "check", info: "sparkle", warning: "clock" };

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="ad-toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`ad-toast ad-toast--${toast.tone}`}
          onClick={() => onDismiss(toast.id)}
        >
          <span className="ad-toast__icon">
            <Icon name={toneIcons[toast.tone]} size={16} />
          </span>
          <span>{toast.text}</span>
        </button>
      ))}
    </div>
  );
}
