import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { designBriefIssue } from "./brief";
import { recipeById } from "./catalog";
import { isCleanComplete } from "./clean";
import { designIssues } from "./design";
import { findBlockIssue } from "./findChoice";
import { flipSeams } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import { stageHours, stageIndex } from "./flipStage";
import type { GameState } from "./gameState";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { runLayoutIssues } from "./layout";
import { isSeamSewn } from "./seamSewn";
import { stallDayIssue } from "./stallCalendar";
import { isUnpickComplete } from "./unpick";

function marketIssues(run: FlipRun): string[] {
  if (run.finds.length === 0) return ["Choose a find from the rail or your stock."];
  return run.finds.flatMap((owned) => {
    const issue = findBlockIssue(run.design, owned);
    return issue === null ? [] : [issue];
  });
}

function sewIssues(run: FlipRun): string[] {
  return flipSeams(run.design)
    .filter((seam) => !isSeamSewn(run, seam.id))
    .map((seam) => `Sew the ${seam.name.toLowerCase()}.`);
}

export function stageIssues(state: GameState, run: FlipRun): string[] {
  switch (run.stage) {
    case "brief":
    case "finish":
      return [];
    case "design": {
      const brief = designBriefIssue(run.brief, run.design);
      return [...designIssues(run.design), ...(brief === null ? [] : [brief])];
    }
    case "market":
      return marketIssues(run);
    case "unpick":
      return isUnpickComplete(run) ? [] : ["Snip every old stitch first."];
    case "clean":
      return isCleanComplete(state, run) ? [] : ["Scrub every stain, or tap Soak it."];
    case "layout":
      return runLayoutIssues(run).map((issue) => issue.message);
    case "cut":
      return run.cutDone ? [] : ["Cut out every piece first."];
    case "sew":
      return sewIssues(run);
    case "review":
      return ["Hand it over to finish."];
    case "done":
      return ["This flip is finished."];
  }
}

export function runStageHours(run: FlipRun): number {
  if (stageIndex(run.stage) < stageIndex(run.reachedStage)) return 0;
  const sewHours = run.design.recipeId === null ? 0 : recipeById(run.design.recipeId).sewHours;
  return stageHours(run.stage, sewHours);
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No flip on the bench."]);
  const issues = stageIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const stall = stallDayIssue(state.calendar.day);
  if (stall !== null) return actionCheck([stall]);
  const hours = hoursShortfallReason(state.calendar, runStageHours(run));
  return actionCheck(hours === null ? [] : [hours]);
}
