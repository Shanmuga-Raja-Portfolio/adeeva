import { useCallback, useEffect, useState } from "react";
import type { RevealStep } from "./revealSteps";

export interface RevealPlayback {
  readonly index: number;
  readonly step: RevealStep | undefined;
  readonly next: () => void;
  readonly canSkip: boolean;
}

export function useRevealSteps(
  steps: readonly RevealStep[],
  skippable: boolean,
  onDone: () => void,
): RevealPlayback {
  const [index, setIndex] = useState(0);
  const advanceFrom = useCallback(
    (from: number) => {
      if (from + 1 >= steps.length) onDone();
      else setIndex((current) => (current === from ? from + 1 : current));
    },
    [steps.length, onDone],
  );
  const next = useCallback(() => advanceFrom(index), [advanceFrom, index]);
  const canSkip = skippable || steps.slice(0, index).some((entry) => entry.kind === "reveal");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && canSkip) onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSkip, onDone]);
  return { index, step: steps[index], next, canSkip };
}
