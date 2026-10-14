import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { cartIsEmpty } from "./stock";
import { floorIssues } from "./floorLay";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { lightIssues } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { paintIssues } from "./paintScore";
import { planIssues } from "./planChoice";
import { planShortfall } from "./warehouse";

function stageCompletionIssues(state: GameState, run: MakeoverRun): string[] {
  switch (run.stage) {
    case "brief":
    case "style":
      return [];
    case "plan":
      return planIssues(run);
    case "shop":
      return cartIsEmpty(planShortfall(state, run)) ? [] : ["Buy everything on your plan first."];
    case "paint":
      return paintIssues(run);
    case "floor":
      return floorIssues(run);
    case "light":
      return lightIssues(run);
    case "reveal":
      return ["Reveal the room to finish."];
    case "done":
      return ["This room is finished."];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No room is in progress."]);
  const issues = stageCompletionIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const hours = hoursShortfallReason(state.calendar, leaveHours(run));
  return actionCheck(hours === null ? [] : [hours]);
}
