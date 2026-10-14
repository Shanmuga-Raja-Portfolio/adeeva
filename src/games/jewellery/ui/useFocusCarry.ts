import { useEffect, useRef, type RefObject } from "react";

function focusWasLost(container: HTMLElement): boolean {
  const active = document.activeElement;
  if (active === null || active === document.body || !active.isConnected) return true;
  return container.contains(active) && active instanceof HTMLButtonElement && active.disabled;
}

export function useFocusCarry(
  containerRef: RefObject<HTMLElement | null>,
  focusKey: string,
  selector: string,
): void {
  const inside = useRef(false);
  const lastKey = useRef(focusKey);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const enter = () => {
      inside.current = true;
    };
    const leave = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && !container.contains(next)) inside.current = false;
    };
    container.addEventListener("focusin", enter);
    container.addEventListener("focusout", leave);
    return () => {
      container.removeEventListener("focusin", enter);
      container.removeEventListener("focusout", leave);
    };
  }, [containerRef]);

  useEffect(() => {
    if (lastKey.current === focusKey) return;
    lastKey.current = focusKey;
    const container = containerRef.current;
    if (container === null || !inside.current || !focusWasLost(container)) return;
    container.querySelector<HTMLElement | SVGElement>(selector)?.focus();
  }, [containerRef, focusKey, selector]);
}
