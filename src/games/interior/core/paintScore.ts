import { ownEntry } from "../../../engine/ownEntry";
import { average } from "../../../engine/average";
import { WALL_IDS, type WallId } from "../content/roomTemplate";
import type { GameState } from "./gameState";
import type { MakeoverRun } from "./makeoverRun";
import { edgeScore, isWallEdged, runEdgePaths } from "./paintEdge";
import { emptyRoll, isWallRolled, paintableCells, rollScore } from "./paintRoll";
import { withPaintRun } from "./paintWork";
import { assistCap } from "./skillTolerance";

const EDGE_WEIGHT = 0.5;
const ROLL_WEIGHT = 0.5;

function wallScore(state: Pick<GameState, "profile">, run: MakeoverRun, wall: WallId): number {
  return EDGE_WEIGHT * edgeScore(state, run, wall) + ROLL_WEIGHT * rollScore(state, run, wall);
}

export function paintScore(state: Pick<GameState, "profile">, run: MakeoverRun): number {
  return average(WALL_IDS.map((wall) => wallScore(state, run, wall)));
}

export function isWallDone(run: MakeoverRun, wall: WallId): boolean {
  return isWallEdged(run, wall) && isWallRolled(run, wall);
}

export function paintIssues(run: MakeoverRun): string[] {
  return WALL_IDS.flatMap((wall) => {
    const name = wall === "back" ? "back wall" : "side wall";
    const issues: string[] = [];
    if (!isWallEdged(run, wall)) issues.push(`Edge the tape on the ${name}.`);
    if (!isWallRolled(run, wall)) issues.push(`Roll paint over the ${name}.`);
    return issues;
  });
}

export function assistPaint(state: GameState, wall: WallId): GameState {
  if (!WALL_IDS.includes(wall)) return state;
  return withPaintRun(state, (run, locked) => {
    if (isWallDone(run, wall)) return null;
    const cap = assistCap(locked);
    const edges = Object.fromEntries(
      runEdgePaths(run)
        .filter((path) => path.wall === wall && !Object.hasOwn(run.edges, path.id))
        .map((path) => [path.id, { accuracy: cap, assisted: true }]),
    );
    const cells = paintableCells(run, wall);
    const roll = emptyRoll();
    const passes = roll.passes.map((_, cell) => (cells.includes(cell) ? 2 : 0));
    const previous = ownEntry(run.rolls, wall);
    return {
      ...run,
      edges: { ...run.edges, ...edges },
      rolls: {
        ...run.rolls,
        [wall]: { ...(previous ?? roll), passes, assisted: true },
      },
    };
  });
}
