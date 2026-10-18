export const MAX_SHOW_FRAME_MS = 1000;

export function nextShowElapsed(elapsed: number, frameMs: number, durationMs: number): number {
  const step = Math.min(MAX_SHOW_FRAME_MS, Math.max(0, frameMs));
  return Math.min(durationMs, elapsed + step);
}
