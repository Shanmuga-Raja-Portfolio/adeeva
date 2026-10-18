import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { ToastStack, type ToastMessage, type ToastTone } from "../ui/kit/ToastStack";

export type ShowToast = (text: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => undefined);

const TOAST_LIFETIME_MS = 3200;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>((text, tone = "success") => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current, { id, text, tone }].slice(-MAX_TOASTS));
  }, []);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} lifetimeMs={TOAST_LIFETIME_MS} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
