import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { BakeRun } from "./bakeRun";
import { isCounterDay } from "./counter";
import { designIssues } from "./design";
import { hoursShortfallReason } from "./dayHours";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { icingIssues } from "./icing";
import { hasShortfall, shortfall, shortfallLines } from "./pantry";
import { runPipePaths } from "./pipe";
import { COUNTER_DAY_REST } from "./runLifecycle";
import { stackIssues } from "./stack";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";

function batchIssues(run: BakeRun, done: (batch: number) => boolean, label: string): string[] {
  return run.batches.flatMap((_, batch) => {
    if (done(batch)) return [];
    return [
      run.batches.length === 1 ? `${label}.` : `${label} for the ${batch === 0 ? "big" : "small"} tier.`,
    ];
  });
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
      return [run.purpose.kind === "order" ? "Deliver the bake to finish." : "Put the tray on the counter."];
    case "done":
      return ["This bake is finished."];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No bake on the bench."]);
  if (isCounterDay(state.calendar.day)) return actionCheck([COUNTER_DAY_REST]);
  const issues = stageCompletionIssues(state, run);
  if (issues.length > 0) return actionCheck(issues);
  const hours = hoursShortfallReason(state, leaveHours(run));
  return actionCheck(hours === null ? [] : [hours]);
}
