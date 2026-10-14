import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type AssistChoices<Step extends string> = Readonly<Record<Step, boolean>>;

interface AssistContextValue<Step extends string> {
  readonly choices: AssistChoices<Step>;
  readonly set: (step: Step, on: boolean) => void;
}

interface AssistKit<Step extends string> {
  readonly AssistProvider: (props: { readonly children: ReactNode }) => ReactNode;
  readonly useAssist: (step: Step) => [boolean, (on: boolean) => void];
  readonly useAssistChoices: () => AssistContextValue<Step>;
}

export function createAssist<Step extends string>(steps: readonly Step[]): AssistKit<Step> {
  const none = Object.fromEntries(steps.map((step) => [step, false])) as AssistChoices<Step>;
  const AssistContext = createContext<AssistContextValue<Step>>({ choices: none, set: () => undefined });

  function AssistProvider({ children }: { readonly children: ReactNode }) {
    const [choices, setChoices] = useState<AssistChoices<Step>>(none);
    const set = useCallback((step: Step, on: boolean) => {
      setChoices((current) => ({ ...current, [step]: on }));
    }, []);
    const value = useMemo(() => ({ choices, set }), [choices, set]);
    return <AssistContext.Provider value={value}>{children}</AssistContext.Provider>;
  }

  function useAssist(step: Step): [boolean, (on: boolean) => void] {
    const { choices, set } = useContext(AssistContext);
    const change = useCallback((on: boolean) => set(step, on), [set, step]);
    return [choices[step], change];
  }

  function useAssistChoices(): AssistContextValue<Step> {
    return useContext(AssistContext);
  }

  return { AssistProvider, useAssist, useAssistChoices };
}
