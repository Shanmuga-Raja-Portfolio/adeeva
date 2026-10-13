export interface Criterion<Id extends string> {
  readonly id: Id;
  readonly label: string;
  readonly passed: boolean;
  readonly detail: string;
  readonly weight: number;
}

export const STAR_THRESHOLDS = [90, 75, 55, 35] as const;

export function starsForScore(score: number): number {
  const reached = STAR_THRESHOLDS.findIndex((threshold) => score >= threshold);
  return reached === -1 ? 1 : 5 - reached;
}

export function passMix(criteria: readonly Criterion<string>[]): number {
  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (totalWeight === 0) return 0;
  const passedWeight = criteria.reduce(
    (sum, criterion) => sum + (criterion.passed ? criterion.weight : 0),
    0,
  );
  return (100 * passedWeight) / totalWeight;
}

export function gatePassed<Id extends string>(
  criteria: readonly Criterion<Id>[],
  gate: readonly Id[],
): boolean {
  return gate.every((id) => criteria.find((criterion) => criterion.id === id)?.passed === true);
}

export interface ScoreRule {
  readonly passMixWeight: number;
  readonly qualityWeight: number;
  readonly colourBonusPer: number;
  readonly maxColourBonus: number;
}

export function judgedScore(
  criteria: readonly Criterion<string>[],
  quality: number,
  favouredColoursUsed: number,
  rule: ScoreRule,
): number {
  const colourBonus = Math.min(rule.maxColourBonus, rule.colourBonusPer * favouredColoursUsed);
  const raw = rule.passMixWeight * passMix(criteria) + rule.qualityWeight * quality + colourBonus;
  return Math.min(100, Math.max(0, Math.round(raw)));
}
