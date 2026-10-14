export const LAST_TIP = 2;

export function isTipChoice(tip: number): boolean {
  return Number.isInteger(tip) && tip >= 0 && tip <= LAST_TIP;
}
