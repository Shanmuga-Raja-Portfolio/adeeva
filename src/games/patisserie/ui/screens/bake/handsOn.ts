import type { RunStage } from "../../../core";

const DESK_STAGES: readonly RunStage[] = ["brief", "design", "pantry", "review"];

export function handsOn(stage: RunStage): boolean {
  return !DESK_STAGES.includes(stage);
}
