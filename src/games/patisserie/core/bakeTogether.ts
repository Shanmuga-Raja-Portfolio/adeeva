import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { BakeRecord } from "./bakeRun";
import type { GameState } from "./gameState";
import { bakesTogether, bakeTimeScale, bakeWindow, isBakeRecordValid, TOGETHER_BATCHES } from "./oven";
import { batchMix } from "./weigh";

export interface TogetherAttempt {
  readonly heat: number;
  readonly turnedMinutes: number | null;
  readonly takenMinutes: readonly number[];
  readonly assisted: boolean;
}

export function bakeTogether(state: GameState, attempt: TogetherAttempt): GameState {
  return updateActiveRun(state, "bake", (run) => {
    if (!bakesTogether(run) || attempt.takenMinutes.length !== TOGETHER_BATCHES.length) return null;
    const records: BakeRecord[] = [];
    for (const batch of TOGETHER_BATCHES) {
      const mix = batchMix(run, batch);
      const entry = run.batches[batch];
      const takenMinutes = attempt.takenMinutes[batch];
      if (mix === null || entry === undefined || takenMinutes === undefined) return null;
      if (entry.stir === null || entry.bake !== null) return null;
      const record = {
        heat: attempt.heat,
        turnedMinutes: attempt.turnedMinutes,
        takenMinutes,
        assisted: attempt.assisted,
      };
      if (!isBakeRecordValid(record, mix, bakeTimeScale(run, batch))) return null;
      records.push({ ...record, window: bakeWindow(state) });
    }
    return {
      ...run,
      batches: run.batches.map((entry, index) =>
        records[index] === undefined ? entry : { ...entry, bake: records[index] ?? null },
      ),
    };
  });
}
