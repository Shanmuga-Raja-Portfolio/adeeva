import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import { budgetFeedback, coloursFeedback } from "../../../engine/kindFeedback";
import type { ExtraRequirement } from "../content/client";
import { isCharmId } from "../content/extra";
import { jewelColourById } from "../content/jewelColour";
import type { Brief } from "./brief";
import { extraById } from "./catalog";
import { constructionCount, isConstructionComplete } from "./construction";
import { CRITERION_WEIGHTS, PASS_GATE, SCORE_RULE, type CriterionId } from "./criterion";
import { placedCharms } from "./displayChoice";
import type { GameState } from "./gameState";
import {
  constructionFeedback,
  extrasFeedback,
  qualityFeedback,
  styleFeedback,
  type ExtraShortfall,
} from "./kindFeedback";
import { pieceColours } from "./pieceColours";
import { pieceQuality, type QualityBreakdown } from "./pieceQuality";
import type { PieceRun } from "./pieceRun";
import { runSource } from "./pieceSource";
import { pieceSpend } from "./pieceSpend";
import { pieceTags } from "./pieceTags";

export interface Evaluation extends JudgedEvaluation<CriterionId, QualityBreakdown> {
  readonly spend: number;
}

type Judged = JudgedCriterion<CriterionId>;

const judged = criterionJudge(CRITERION_WEIGHTS);

export function extraCount(run: PieceRun, requirement: ExtraRequirement): number {
  const id = requirement.extraId;
  if (isCharmId(id)) return placedCharms(run, id);
  return run.display.chain === id ? 1 : 0;
}

function judgeConstruction(run: PieceRun): Judged {
  const count = constructionCount(run);
  const detail = `${count.cut}/${count.paths} cut, ${count.joined}/${count.joints} joined, ${count.set}/${count.stones} set, ${count.polished}/${count.parts} polished.`;
  return judged(
    "construction",
    "Finished piece",
    isConstructionComplete(count),
    detail,
    constructionFeedback(count),
  );
}

function judgeStyle(run: PieceRun, brief: Brief): Judged {
  const tags = pieceTags(runSource(run));
  const missing = brief.requiredTags.filter((tag) => !tags.includes(tag));
  const detail =
    missing.length === 0
      ? `Feels ${brief.requiredTags.join(" and ")}, just as asked.`
      : `Still missing: ${missing.join(", ")}.`;
  return judged("style", "Style", missing.length === 0, detail, styleFeedback(missing));
}

function judgeColours(run: PieceRun, brief: Brief, favouredUsed: number): Judged {
  const avoided = pieceColours(runSource(run))
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((colour) => jewelColourById(colour).name);
  const detail =
    avoided.length === 0
      ? `No unwanted colours. ${favouredUsed} favourite ${favouredUsed === 1 ? "colour" : "colours"} used.`
      : `Shows ${avoided.join(", ")}, which they hoped to avoid.`;
  return judged("colours", "Colours", avoided.length === 0, detail, coloursFeedback(avoided));
}

function judgeExtras(run: PieceRun, brief: Brief): Judged {
  const counted = brief.requiredExtras.map((requirement) => ({
    requirement,
    placed: extraCount(run, requirement),
  }));
  const shortfalls: ExtraShortfall[] = counted.flatMap(({ requirement, placed }) =>
    placed >= requirement.count
      ? []
      : [{ name: extraById(requirement.extraId).name, needed: requirement.count, placed }],
  );
  const detail =
    counted.length === 0
      ? "No extras were asked for."
      : counted
          .map(
            ({ requirement, placed }) =>
              `${extraById(requirement.extraId).name} ${Math.min(placed, requirement.count)}/${requirement.count}`,
          )
          .join(", ");
  return judged("extras", "Extras", shortfalls.length === 0, detail, extrasFeedback(shortfalls));
}

function judgeBudget(spend: number, brief: Brief): Judged {
  const detail = `Used ${spend} of ${brief.budget} coins of materials.`;
  return judged("budget", "Budget", spend <= brief.budget, detail, budgetFeedback(spend, brief.budget));
}

export function evaluatePiece(
  state: Pick<GameState, "marketTheme">,
  run: PieceRun,
  brief: Brief,
  deliveredDay: number,
): Evaluation {
  const quality = pieceQuality(state, run);
  const spend = pieceSpend(run);
  const favouredColoursUsed = pieceColours(runSource(run)).filter((colour) =>
    brief.favouredColours.includes(colour),
  ).length;
  const results = [
    judgeConstruction(run),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(run, brief),
    judgeColours(run, brief, favouredColoursUsed),
    judgeExtras(run, brief),
    judgeBudget(spend, brief),
    judgeDeadline(judged, "On time", deliveredDay, brief.deadlineDay),
  ];
  return { ...judgedEvaluation(results, quality, favouredColoursUsed, SCORE_RULE, PASS_GATE), spend };
}
