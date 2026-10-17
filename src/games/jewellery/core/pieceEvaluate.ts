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

function avoidedColourNames(run: PieceRun, brief: Brief): string[] {
  return pieceColours(runSource(run))
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((colour) => jewelColourById(colour).name);
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
  state: Pick<GameState, "marketTheme" | "collection">,
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
    judgeStyle(judged, brief.requiredTags, pieceTags(runSource(run)), styleFeedback),
    judgeAvoidedColours(judged, avoidedColourNames(run, brief), favouredColoursUsed),
    judgeExtras(run, brief),
    judgeBudget(spend, brief),
    judgeDeadline(judged, "On time", deliveredDay, brief.deadlineDay),
  ];
  return { ...judgedEvaluation(results, quality, favouredColoursUsed, SCORE_RULE, PASS_GATE), spend };
}
