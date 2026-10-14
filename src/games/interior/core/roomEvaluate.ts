import {
  criterionJudge,
  judgeAvoidedColours,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  judgeStyle,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import { budgetFeedback } from "../../../engine/kindFeedback";
import { roomColourById } from "../content/roomColour";
import type { Brief } from "./brief";
import { constructionCount, isConstructionComplete } from "./construction";
import { CRITERION_WEIGHTS, PASS_GATE, SCORE_RULE, type CriterionId } from "./criterion";
import type { GameState } from "./gameState";
import { constructionFeedback, mustHaveFeedback, qualityFeedback, styleFeedback } from "./kindFeedback";
import type { MakeoverRun } from "./makeoverRun";
import { mustHaveCounts } from "./mustHaves";
import { roomColours } from "./roomColours";
import { roomQuality, type QualityBreakdown } from "./roomQuality";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";

export interface Evaluation extends JudgedEvaluation<CriterionId, QualityBreakdown> {
  readonly spend: number;
}

type Judged = JudgedCriterion<CriterionId>;

const judged = criterionJudge(CRITERION_WEIGHTS);

function judgeConstruction(run: MakeoverRun): Judged {
  const count = constructionCount(run);
  const detail = `${count.wallsDone}/${count.walls} walls, ${count.floorLaid}/${count.floorPieces} floor pieces, ${count.lights} ${count.lights === 1 ? "light" : "lights"}.`;
  return judged(
    "construction",
    "Finished",
    isConstructionComplete(count),
    detail,
    constructionFeedback(count),
  );
}

function favouredUsed(run: MakeoverRun, brief: Brief): number {
  const colours = roomColours(roomSource(run));
  return brief.favouredColours.filter((colour) => colours.includes(colour)).length;
}

function avoidedColourNames(run: MakeoverRun, brief: Brief): string[] {
  return roomColours(roomSource(run))
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((colour) => roomColourById(colour).name);
}

function judgeMustHaves(run: MakeoverRun, brief: Brief): Judged {
  const counts = mustHaveCounts(roomSource(run), brief.mustHaves);
  const short = counts.filter((entry) => entry.placed < entry.need.count);
  const detail = counts
    .map((entry) => `${entry.name} ${Math.min(entry.placed, entry.need.count)}/${entry.need.count}`)
    .join(", ");
  return judged("trims", "Must-haves", short.length === 0, detail, mustHaveFeedback(short));
}

function judgeBudget(spend: number, brief: Brief): Judged {
  const detail = `Spent ${spend} of ${brief.budget} coins.`;
  return judged("budget", "Budget", spend <= brief.budget, detail, budgetFeedback(spend, brief.budget));
}

export function evaluateRoom(
  state: Pick<GameState, "profile">,
  run: MakeoverRun,
  revealDay: number,
): Evaluation {
  const brief = run.brief;
  const quality = roomQuality(state, run);
  const used = favouredUsed(run, brief);
  const results = [
    judgeConstruction(run),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(judged, brief.requiredTags, roomTags(roomSource(run)), styleFeedback),
    judgeAvoidedColours(judged, avoidedColourNames(run, brief), used),
    judgeMustHaves(run, brief),
    judgeBudget(run.spend, brief),
    judgeDeadline(judged, "On time", revealDay, brief.deadlineDay),
  ];
  return { ...judgedEvaluation(results, quality, used, SCORE_RULE, PASS_GATE), spend: run.spend };
}
