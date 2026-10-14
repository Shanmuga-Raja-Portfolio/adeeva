export function idNumber(id: string, prefix: string): number {
  const digits = id.startsWith(`${prefix}-`) ? id.slice(prefix.length + 1) : "";
  return /^\d+$/.test(digits) ? Number(digits) : 0;
}

export function runNumber(runId: string): number {
  return idNumber(runId, "run");
}

export function runIdsBelow(runIds: readonly string[], nextRunNumber: number): boolean {
  return runIds.every((id) => runNumber(id) < nextRunNumber);
}
