export function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}
