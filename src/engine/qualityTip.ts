export type QualityTip = readonly [score: number, tip: string];

function weakestTip(tips: readonly QualityTip[]): string {
  const weakest = tips.reduce<QualityTip | null>(
    (lowest, tip) => (lowest === null || tip[0] < lowest[0] ? tip : lowest),
    null,
  );
  return weakest?.[1] ?? "";
}

export function qualityTipLine(
  subject: string,
  quality: number,
  minimum: number,
  tips: readonly QualityTip[],
): string {
  return `${subject} reached ${quality}, a little under the ${minimum} hoped for. Try ${weakestTip(tips)}.`;
}
