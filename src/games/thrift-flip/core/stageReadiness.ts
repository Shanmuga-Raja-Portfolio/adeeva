import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import type { UpgradeId } from "../content/upgrade";
import { designBriefIssue } from "./brief";
import { isCleanComplete } from "./clean";
import { designIssues } from "./design";
import { findBlockIssue } from "./findChoice";
import type { FlipRun } from "./flipRun";
import { stageIndex } from "./flipStage";
import type { GameState } from "./gameState";
import { hallClosedIssue } from "./hallDay";
import { runLayoutIssues } from "./layout";
import { runSeams } from "./runPieces";
import { plannedStageHours } from "./runStages";
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
  return runSeams(run)
    .filter((seam) => !isSeamSewn(run, seam.id))
    .map((seam) => `Sew the ${seam.name.toLowerCase()}.`);
}

export function stageIssues(state: Pick<GameState, "profile" | "upgrades">, run: FlipRun): string[] {
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

export function runStageHours(run: FlipRun, upgrades: readonly UpgradeId[]): number {
  if (stageIndex(run.stage) < stageIndex(run.reachedStage)) return 0;
  return plannedStageHours(run, upgrades);
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No flip on the bench."]);
  const issues = stageIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const closed = stallDayIssue(state.calendar.day) ?? hallClosedIssue(state);
  if (closed !== null) return actionCheck([closed]);
  const hours = hoursShortfallReason(state.calendar, runStageHours(run, state.upgrades));
  return actionCheck(hours === null ? [] : [hours]);
}
