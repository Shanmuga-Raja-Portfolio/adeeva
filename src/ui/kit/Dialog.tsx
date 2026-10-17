import { type MouseEvent, type ReactNode, type SyntheticEvent, useEffect, useId, useRef } from "react";
import { Icon } from "./IconSet";

export interface DialogProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  dismissable?: boolean | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
  dismissable = true,
  closeLabel = "Close",
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      element.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)")?.focus();
    }
    if (!open && element.open) element.close();
  }, [open]);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (dismissable) onClose();
  };

  const handleBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (dismissable && event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={className ? `ad-dialog ${className}` : "ad-dialog"}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={handleCancel}
      onClick={handleBackdrop}
    >
      {open ? (
        <div className="ad-dialog__surface">
          <header className="ad-dialog__header">
            <h2 id={titleId} className="ad-dialog__title">
              {title}
            </h2>
            {dismissable ? (
              <button
                type="button"
                className="ad-button ad-button--ghost ad-dialog__close"
                onClick={onClose}
                aria-label={closeLabel}
              >
                <Icon name="close" size={20} />
              </button>
            ) : null}
          </header>
          <div className="ad-dialog__body">{children}</div>
          {footer !== undefined ? <footer className="ad-dialog__footer">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}
