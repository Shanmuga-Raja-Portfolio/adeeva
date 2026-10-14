export function latestEntryFor<E extends { readonly runId: string }>(
  log: readonly E[],
  runId: string,
): E | null {
  return [...log].reverse().find((entry) => entry.runId === runId) ?? null;
}
