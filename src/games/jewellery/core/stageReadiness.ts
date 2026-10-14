import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { cutIssues } from "./cutRecord";
import { designIssues } from "./design";
import { displayIssues } from "./displayChoice";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { joinIssues } from "./joinRecord";
import type { PieceRun } from "./pieceRun";
import { polishIssues } from "./polish";
import { planIssues } from "./sheetPlan";
import { setIssues } from "./stoneSetting";
import { suppliesIssues } from "./supplies";

export function stageCompletionIssues(state: GameState, run: PieceRun): string[] {
  switch (run.stage) {
    case "brief":
      return [];
    case "design":
      return designIssues(state, run);
    case "supplies":
      return suppliesIssues(state, run);
    case "plan":
      return planIssues(state, run);
    case "cut":
      return cutIssues(run);
    case "join":
      return joinIssues(run);
    case "set":
      return setIssues(run);
    case "polish":
      return polishIssues(run);
    case "display":
      return displayIssues(state, run);
    case "review":
      return ["Deliver the piece to finish."];
    case "done":
      return ["This piece is finished."];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing is on the bench."]);
  const issues = stageCompletionIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const hours = hoursShortfallReason(state.calendar, leaveHours(run));
  return actionCheck(hours === null ? [] : [hours]);
}
