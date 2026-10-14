import { useCallback, useEffect, useRef, useState } from "react";

export function useFocusAfterRender(): (selectors: readonly string[]) => void {
  const pending = useRef<readonly string[]>([]);
  const [request, setRequest] = useState(0);
  useEffect(() => {
    const selectors = pending.current;
    pending.current = [];
    for (const selector of selectors) {
      const target = document.querySelector<HTMLElement | SVGElement>(selector);
      if (target !== null) {
        target.focus();
        return;
      }
    }
  }, [request]);
  return useCallback((selectors: readonly string[]) => {
    pending.current = selectors;
    setRequest((value) => value + 1);
  }, []);
}
