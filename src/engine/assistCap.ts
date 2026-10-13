export const ASSIST_ACCURACY_CAP = 0.8;

export function cappedAccuracy(raw: number, assisted: boolean): number {
  return assisted ? Math.min(ASSIST_ACCURACY_CAP, raw) : raw;
}
