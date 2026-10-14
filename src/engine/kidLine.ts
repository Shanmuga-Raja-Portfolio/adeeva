export interface KidLine {
  readonly id: string;
  readonly label: string;
  readonly verdict: string;
  readonly good: boolean;
}

export interface KidBands {
  readonly great: number;
  readonly good: number;
}

export function kidSkillLine(
  id: string,
  label: string,
  value: number,
  words: readonly [string, string, string],
  bands: KidBands,
): KidLine {
  const verdict = value >= bands.great ? words[0] : value >= bands.good ? words[1] : words[2];
  return { id, label, verdict, good: value >= bands.good };
}

export function criterionPassed(
  criteria: readonly { readonly id: string; readonly passed: boolean }[],
  id: string,
): boolean {
  return criteria.find((criterion) => criterion.id === id)?.passed === true;
}
