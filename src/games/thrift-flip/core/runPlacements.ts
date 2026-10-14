import type { FlipRun } from "./flipRun";
import type { Placement } from "./placement";

function samePlacement(a: Placement | undefined, b: Placement | undefined): boolean {
  return a !== undefined && b !== undefined && a.x === b.x && a.y === b.y && a.rotation === b.rotation;
}

export function withPlacements(run: FlipRun, placements: Readonly<Record<string, Placement>>): FlipRun {
  const cutTraces = Object.fromEntries(
    Object.entries(run.cutTraces).filter(([pieceId]) =>
      samePlacement(run.placements[pieceId], placements[pieceId]),
    ),
  );
  return { ...run, placements, cutTraces };
}
