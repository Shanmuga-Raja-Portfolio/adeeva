import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type AssistStep = "saw" | "join" | "sand" | "seam";

type AssistChoices = Readonly<Record<AssistStep, boolean>>;

interface AssistContextValue {
  readonly choices: AssistChoices;
  readonly set: (step: AssistStep, on: boolean) => void;
}

const NO_ASSIST: AssistChoices = { saw: false, join: false, sand: false, seam: false };

const AssistContext = createContext<AssistContextValue>({ choices: NO_ASSIST, set: () => undefined });

export function AssistProvider({ children }: { readonly children: ReactNode }) {
  const [choices, setChoices] = useState<AssistChoices>(NO_ASSIST);
  const set = useCallback((step: AssistStep, on: boolean) => {
    setChoices((current) => ({ ...current, [step]: on }));
  }, []);
  const value = useMemo(() => ({ choices, set }), [choices, set]);
  return <AssistContext.Provider value={value}>{children}</AssistContext.Provider>;
}

export function useAssist(step: AssistStep): [boolean, (on: boolean) => void] {
  const { choices, set } = useContext(AssistContext);
  const change = useCallback((on: boolean) => set(step, on), [set, step]);
  return [choices[step], change];
}
