import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DifficultyId } from "../../../engine/difficulty";

interface TintLabelsValue {
  readonly choice: boolean | null;
  readonly set: (on: boolean) => void;
}

const TintLabelsContext = createContext<TintLabelsValue>({ choice: null, set: () => undefined });

export function TintLabelsProvider({ children }: { readonly children: ReactNode }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const value = useMemo(() => ({ choice, set: setChoice }), [choice]);
  return <TintLabelsContext.Provider value={value}>{children}</TintLabelsContext.Provider>;
}

function tintLabelsOn(choice: boolean | null, difficulty: DifficultyId | null): boolean {
  return choice ?? difficulty === "relaxed";
}

export function useTintLabels(difficulty: DifficultyId | null): [boolean, (on: boolean) => void] {
  const { choice, set } = useContext(TintLabelsContext);
  return [tintLabelsOn(choice, difficulty), set];
}
