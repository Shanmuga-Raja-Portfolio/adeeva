import { Toast, type ToastMessage } from "./Toast";
import "./ToastStack.css";

export type { ToastMessage, ToastTone } from "./Toast";

export interface ToastStackProps {
  toasts: readonly ToastMessage[];
  lifetimeMs: number;
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, lifetimeMs, onDismiss }: ToastStackProps) {
  return (
    <div className="ad-toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} lifetimeMs={lifetimeMs} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
