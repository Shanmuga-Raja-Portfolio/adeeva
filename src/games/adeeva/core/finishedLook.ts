import type { DressSnapshot } from "./dressSnapshot";
import type { Evaluation } from "./evaluate";

export interface FinishedLook {
  readonly runId: string;
  readonly snapshot: DressSnapshot;
  readonly evaluation: Evaluation;
}
