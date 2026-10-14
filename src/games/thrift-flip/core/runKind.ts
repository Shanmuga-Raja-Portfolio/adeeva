import type { BriefKind } from "./brief";
import type { FlipRun } from "./flipRun";

export function runKind(run: Pick<FlipRun, "brief">): BriefKind {
  return run.brief?.kind ?? "flip";
}
