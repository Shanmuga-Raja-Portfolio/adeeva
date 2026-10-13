export const RUNWAY_VIEW = { width: 1600, height: 900, horizon: 400, farFeet: 430, nearFeet: 860 } as const;

export function runwayDepth(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return clamped <= 0.5 ? clamped * 2 : (1 - clamped) * 2;
}
