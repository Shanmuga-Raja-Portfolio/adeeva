import type { FlipRun } from "./flipRun";

export function isSeamSewn(run: FlipRun, seamId: string): boolean {
  return (run.seams[seamId]?.progress ?? 0) >= 1;
}
