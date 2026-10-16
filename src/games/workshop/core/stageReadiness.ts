import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { layoutIssues } from "./boardLayout";
import { woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { isCushionSewn } from "./cushion";
import { designIssues } from "./design";
import { isFinishComplete } from "./finishChoice";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { constructionCount } from "./pieceQuality";
import { ownedBoardsOf } from "./timberYard";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function stageCompletionIssues(state: GameState, run: CommissionRun): string[] {
  switch (run.stage) {
    case "brief":
      return [];
    case "design":
      return designIssues(run);
    case "timber": {
      const woodId = run.design.woodId;
      if (woodId === null) return ["Pick a wood first."];
      return ownedBoardsOf(state, woodId).length > 0
        ? []
        : [`You need at least one board of ${woodById(woodId).name}.`];
    }
    case "layout":
      return layoutIssues(state, run).map((issue) => issue.message);
    case "saw": {
      const count = constructionCount(state, run);
      const left = count.parts - count.sawn;
      return left === 0 ? [] : [`Saw ${plural(left, "more part", "more parts")}.`];
    }
    case "join": {
      const count = constructionCount(state, run);
      const left = count.joints - count.seated;
      return left === 0 ? [] : [`Fit ${plural(left, "more joint", "more joints")}.`];
    }
    case "sand": {
      const count = constructionCount(state, run);
      const left = count.surfaces - count.sanded;
      return left === 0 ? [] : [`Sand ${plural(left, "more surface", "more surfaces")}.`];
    }
    case "finish": {
      const issues: string[] = [];
      if (!isFinishComplete(run.finish)) issues.push("Pick a finish for the piece.");
      if (run.cushion !== null && !isCushionSewn(run.cushion))
        issues.push("Sew the cushion seam, or take the cushion off.");
      return issues;
    }
    case "review":
      return [
        run.purpose.kind === "set" ? "Put the set on the floor to finish." : "Deliver the piece to finish.",
      ];
    case "done":
      return ["This piece is finished."];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing on the workbench."]);
  const issues = stageCompletionIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const hours = hoursShortfallReason(state.calendar, leaveHours(run));
  return actionCheck(hours === null ? [] : [hours]);
}
