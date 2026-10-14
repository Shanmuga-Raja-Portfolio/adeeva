import { deadlineFeedback } from "./kindFeedback";
import { gatePassed, judgedScore, starsForScore, type Criterion, type ScoreRule } from "./score";

export interface Judged<Id extends string> {
  readonly criterion: Criterion<Id>;
  readonly feedback: string;
}

type CriterionJudge<Id extends string> = (
  id: Id,
  label: string,
  passed: boolean,
  detail: string,
  feedback: string,
) => Judged<Id>;

export interface Evaluation<Id extends string, Q> {
  readonly criteria: readonly Criterion<Id>[];
  readonly quality: Q;
  readonly favouredColoursUsed: number;
  readonly score: number;
  readonly stars: number;
  readonly passed: boolean;
  readonly feedback: readonly string[];
}

export function criterionJudge<Id extends string>(weights: Readonly<Record<Id, number>>): CriterionJudge<Id> {
  return (id, label, passed, detail, feedback) => ({
    criterion: { id, label, passed, detail, weight: weights[id] },
    feedback,
  });
}

export function judgeQuality<Id extends string>(
  judged: CriterionJudge<Id | "quality">,
  quality: number,
  minQuality: number,
  feedback: string,
): Judged<Id | "quality"> {
  const detail = `Quality ${quality} against a minimum of ${minQuality}.`;
  return judged("quality", "Quality", quality >= minQuality, detail, feedback);
}

export function judgeDeadline<Id extends string>(
  judged: CriterionJudge<Id | "deadline">,
  label: string,
  deliveredDay: number,
  deadlineDay: number,
): Judged<Id | "deadline"> {
  const detail = `Delivered on day ${deliveredDay}, due by day ${deadlineDay}.`;
  return judged(
    "deadline",
    label,
    deliveredDay <= deadlineDay,
    detail,
    deadlineFeedback(deliveredDay, deadlineDay),
  );
}

export function judgedEvaluation<Id extends string, Q extends { readonly quality: number }>(
  results: readonly Judged<Id>[],
  quality: Q,
  favouredColoursUsed: number,
  rule: ScoreRule,
  gate: readonly Id[],
): Evaluation<Id, Q> {
  const criteria = results.map((result) => result.criterion);
  const score = judgedScore(criteria, quality.quality, favouredColoursUsed, rule);
  return {
    criteria,
    quality,
    favouredColoursUsed,
    score,
    stars: starsForScore(score),
    passed: gatePassed(criteria, gate),
    feedback: results.filter((result) => !result.criterion.passed).map((result) => result.feedback),
  };
}
