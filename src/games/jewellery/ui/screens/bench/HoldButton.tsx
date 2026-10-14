import { useEffect, useRef, type ReactNode } from "react";

interface HoldButtonProps {
  readonly label: string;
  readonly onStep: () => void;
  readonly children: ReactNode;
}

const FIRST_DELAY_MS = 350;
const REPEAT_MS = 90;

export function HoldButton({ label, onStep, children }: HoldButtonProps) {
  const timer = useRef<number | null>(null);
  const step = useRef(onStep);

  useEffect(() => {
    step.current = onStep;
  }, [onStep]);

  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => stop, []);

  const repeat = () => {
    step.current();
    timer.current = window.setTimeout(repeat, REPEAT_MS);
  };

  return (
    <button
      type="button"
      className="ad-button ad-button--secondary jb-hold-button"
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        step.current();
        timer.current = window.setTimeout(repeat, FIRST_DELAY_MS);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          step.current();
        }
      }}
    >
      {children}
    </button>
  );
}
