type ActiveRunOf<S extends { readonly activeRun: { readonly stage: string } | null }> = NonNullable<
  S["activeRun"]
>;

export function updateActiveRun<S extends { readonly activeRun: { readonly stage: string } | null }>(
  state: S,
  stage: ActiveRunOf<S>["stage"],
  update: (run: ActiveRunOf<S>) => ActiveRunOf<S> | null,
): S {
  const run: ActiveRunOf<S> | null = state.activeRun;
  if (run === null || run.stage !== stage) return state;
  const next = update(run);
  if (next === null || next === run) return state;
  return { ...state, activeRun: next };
}

export function setAsideActiveRun<S extends { readonly activeRun: { readonly stage: string } | null }>(
  state: S,
): S {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return state;
  return { ...state, activeRun: null };
}
