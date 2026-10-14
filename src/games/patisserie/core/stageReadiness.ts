import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { BakeRun } from "./bakeRun";
import { productById } from "./catalog";
import { batchName, designIssues } from "./design";
import { hoursShortfallReason } from "../../../engine/dayHours";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { icingIssues } from "./icing";
import { hasShortfall, shortfall, shortfallLines } from "./pantry";
import { runPipePaths } from "./pipe";
import { restDayIssue } from "./seasonCalendar";
import { stackIssues } from "./stack";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";

function batchIssues(run: BakeRun, done: (batch: number) => boolean, label: string): string[] {
  const product = run.design.productId === null ? null : productById(run.design.productId);
  return run.batches.flatMap((_, batch) => {
    if (done(batch)) return [];
    if (run.batches.length === 1 || product === null) return [`${label}.`];
    return [`${label} for the ${batchName(product, batch).toLowerCase()}.`];
  });
}

function reviewIssue(run: BakeRun): string {
  switch (run.purpose.kind) {
    case "order":
      return "Deliver the bake to finish.";
    case "showpiece":
      return "Take the showpiece to the Fair to finish.";
    case "salon-tray":
      return "Put the tray on the Salon shelf.";
    case "tray":
      return "Put the tray on the counter.";
  }
}

export function stageCompletionIssues(state: GameState, run: BakeRun): string[] {
  switch (run.stage) {
    case "brief":
      return [];
    case "design":
      return designIssues(run);
    case "pantry": {
      const missing = shortfall(state, run);
      return hasShortfall(missing) ? shortfallLines(missing).map((line) => `Still need: ${line}.`) : [];
    }
    case "weigh":
      return batchIssues(
        run,
        (batch) => run.batches[batch]?.committed === true,
        "Weigh everything into the bowl",
      );
    case "mix":
      return batchIssues(
        run,
        (batch) => {
          const mix = batchMix(run, batch);
          return mix !== null && stirDone(run.batches[batch]?.stir ?? null, mix);
        },
        "Finish stirring the bowl",
      );
    case "bake":
      return batchIssues(run, (batch) => run.batches[batch]?.bake !== null, "Bake the mix");
    case "stack":
      return [...stackIssues(run), ...icingIssues(state, run)];
    case "pipe": {
      const left = runPipePaths(run).filter((path) => !Object.hasOwn(run.pipes, path.id)).length;
      return left === 0 ? [] : [`Pipe ${left} more icing ${left === 1 ? "line" : "lines"}.`];
    }
    case "decorate":
      return [];
    case "review":
      return [reviewIssue(run)];
    case "done":
      return ["This bake is finished."];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No bake on the bench."]);
  const rest = restDayIssue(state);
  if (rest !== null) return actionCheck([rest]);
  const issues = stageCompletionIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const hours = hoursShortfallReason(state.calendar, leaveHours(run, state.upgrades));
  return actionCheck(hours === null ? [] : [hours]);
}
