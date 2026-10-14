import { useEffect, useState } from "react";

export function useArmedAfter(delayMs: number): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setArmed(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);
  return armed;
}
