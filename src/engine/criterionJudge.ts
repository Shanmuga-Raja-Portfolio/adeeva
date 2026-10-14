import { coloursFeedback, deadlineFeedback } from "./kindFeedback";
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

export function judgeStyle<Id extends string, T extends string>(
  judged: CriterionJudge<Id | "style">,
  requiredTags: readonly T[],
  tags: readonly T[],
  feedback: (missing: readonly T[]) => string,
): Judged<Id | "style"> {
  const missing = requiredTags.filter((tag) => !tags.includes(tag));
  const detail =
    missing.length === 0
      ? `Feels ${requiredTags.join(" and ")}, just as asked.`
      : `Still missing: ${missing.join(", ")}.`;
  return judged("style", "Style", missing.length === 0, detail, feedback(missing));
}

export function judgeAvoidedColours<Id extends string>(
  judged: CriterionJudge<Id | "colours">,
  avoidedNames: readonly string[],
  favouredUsed: number,
): Judged<Id | "colours"> {
  const detail =
    avoidedNames.length === 0
      ? `No unwanted colours. ${favouredUsed} favourite ${favouredUsed === 1 ? "colour" : "colours"} used.`
      : `Shows ${avoidedNames.join(", ")}, which they hoped to avoid.`;
  return judged("colours", "Colours", avoidedNames.length === 0, detail, coloursFeedback(avoidedNames));
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
