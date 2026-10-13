import type { BakeRun } from "./bakeRun";
import { runPipePaths } from "./pipe";
import { needsFilling, stackComplete } from "./stack";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";

export interface ConstructionCount {
  readonly batches: number;
  readonly weighed: number;
  readonly stirred: number;
  readonly baked: number;
  readonly stacked: boolean;
  readonly filled: boolean;
  readonly paths: number;
  readonly piped: number;
}

export function constructionCount(run: BakeRun): ConstructionCount {
  const batches = run.batches.map((entry, index) => ({ entry, mix: batchMix(run, index) }));
  const paths = runPipePaths(run);
  return {
    batches: batches.length,
    weighed: batches.filter(({ entry }) => entry.committed).length,
    stirred: batches.filter(({ entry, mix }) => mix !== null && stirDone(entry.stir, mix)).length,
    baked: batches.filter(({ entry }) => entry.bake !== null).length,
    stacked: run.purpose.kind === "tray" || stackComplete(run),
    filled: !needsFilling(run) || run.filled,
    paths: paths.length,
    piped: paths.filter((path) => Object.hasOwn(run.pipes, path.id)).length,
  };
}

export function isConstructionComplete(count: ConstructionCount): boolean {
  return (
    count.batches > 0 &&
    count.weighed === count.batches &&
    count.stirred === count.batches &&
    count.baked === count.batches &&
    count.stacked &&
    count.filled &&
    count.piped === count.paths
  );
}
