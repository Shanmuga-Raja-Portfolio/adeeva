export function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function zeroCounts<K extends string>(ids: readonly K[]): Record<K, number> {
  return Object.fromEntries(ids.map((id) => [id, 0])) as Record<K, number>;
}
