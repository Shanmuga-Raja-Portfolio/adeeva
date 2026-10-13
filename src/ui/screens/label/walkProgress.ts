export function walkProgress(t: number): number {
  if (t < 0.4) {
    const s = t / 0.4;
    return 0.5 * (1 - (1 - s) * (1 - s));
  }
  if (t < 0.64) return 0.5;
  const s = Math.min(1, (t - 0.64) / 0.36);
  return 0.5 + 0.5 * s * s;
}
