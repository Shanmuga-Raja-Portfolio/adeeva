import type { LabelSeason } from "../../../core";

export function strongestLooks(season: LabelSeason): number[] {
  const scores = season.looks.map((look) => look?.evaluation.score ?? -1);
  const best = Math.max(...scores);
  return scores.flatMap((score, index) => (score === best ? [index] : []));
}
