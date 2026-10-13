export function seamLineAt(profile: readonly number[], progress: number): number {
  if (profile.length === 0) return 0;
  const position = Math.min(1, Math.max(0, progress)) * (profile.length - 1);
  const index = Math.floor(position);
  const from = profile[index] ?? 0;
  const to = profile[Math.min(profile.length - 1, index + 1)] ?? from;
  const eased = (1 - Math.cos((position - index) * Math.PI)) / 2;
  return from + (to - from) * eased;
}

export function isNeedleOnLine(
  profile: readonly number[],
  progress: number,
  offset: number,
  band: number,
): boolean {
  return Math.abs(seamLineAt(profile, progress) + offset) <= band;
}
