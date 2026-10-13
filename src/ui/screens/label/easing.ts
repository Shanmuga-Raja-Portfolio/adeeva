export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function easeInOut(value: number): number {
  const t = clampUnit(value);
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function easeOut(value: number): number {
  return 1 - (1 - clampUnit(value)) ** 3;
}

export function window01(value: number, start: number, end: number): number {
  return end <= start ? (value >= end ? 1 : 0) : clampUnit((value - start) / (end - start));
}
