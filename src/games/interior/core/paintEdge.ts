import { ownEntry } from "../../../engine/ownEntry";
import { sameFields } from "../../../engine/sameFields";
import { average } from "../../../engine/average";
import type { Point } from "../../../engine/geometry/point";
import { distanceToOutline } from "../../../engine/geometry/traceAccuracy";
import { isPathTraced } from "../../../engine/geometry/pathTrace";
import { fitSamples, samplesFit } from "../../../engine/geometry/traceSamples";
import { WALL_IDS, type RoomTemplate, type WallId } from "../content/roomTemplate";
import { roomById } from "./catalog";
import type { GameState } from "./gameState";
import type { EdgeRecord, MakeoverRun } from "./makeoverRun";
import { withPaintRun } from "./paintWork";
import { isTwoTone, TWO_TONE_WALL } from "./twoTone";
import { capped, edgeTolerance } from "./skillTolerance";

type EdgeKind = "ceiling" | "skirting" | "frame" | "mid";

export interface EdgePath {
  readonly id: string;
  readonly wall: WallId;
  readonly kind: EdgeKind;
  readonly points: readonly Point[];
  readonly closed: boolean;
  readonly width: number;
  readonly height: number;
}

export const EDGE_PX_PER_CM = 6;
const EDGE_CURVE = 0.5;
const MAX_EDGE_SAMPLES = 6000;

const TAPE: readonly Point[] = [
  [3, 10],
  [57, 10],
];

const FRAME: readonly Point[] = [
  [6, 6],
  [46, 6],
  [46, 36],
  [6, 36],
];

function tapePath(wall: WallId, kind: "ceiling" | "skirting" | "mid"): EdgePath {
  return { id: `${wall}-${kind}`, wall, kind, points: TAPE, closed: false, width: 60, height: 20 };
}

function framePath(wall: WallId): EdgePath {
  return { id: `${wall}-frame`, wall, kind: "frame", points: FRAME, closed: true, width: 52, height: 42 };
}

function wallPaths(room: RoomTemplate, wall: WallId, twoTone: boolean): EdgePath[] {
  return [
    tapePath(wall, "ceiling"),
    room.framedWalls.includes(wall) ? framePath(wall) : tapePath(wall, "skirting"),
    ...(twoTone && wall === TWO_TONE_WALL ? [tapePath(wall, "mid")] : []),
  ];
}

export function runEdgePaths(run: Pick<MakeoverRun, "brief" | "plan">): EdgePath[] {
  const room = roomById(run.brief.roomId);
  return WALL_IDS.flatMap((wall) => wallPaths(room, wall, isTwoTone(run)));
}

export function fitEdgeSamples(samples: readonly Point[]): readonly Point[] {
  return fitSamples(samples, MAX_EDGE_SAMPLES);
}

export function edgeAccuracy(path: EdgePath, samples: readonly Point[], tolerance: number): number {
  if (samples.length === 0) return 0;
  return average(
    samples.map((sample) => {
      const share = distanceToOutline(sample, path.points, path.closed) / tolerance;
      return share > 1 ? 0 : 1 - EDGE_CURVE * share ** 2;
    }),
  );
}

export const COACH_TAPE: EdgePath = { ...tapePath("back", "ceiling"), id: "coach-tape" };

export function traceScore(
  state: Pick<GameState, "profile" | "upgrades">,
  path: EdgePath,
  samples: readonly Point[],
): number | null {
  const tolerance = edgeTolerance(state);
  if (!samplesFit(samples, MAX_EDGE_SAMPLES) || !isPathTraced(path, samples, tolerance)) return null;
  return edgeAccuracy(path, samples, tolerance);
}

function edgeRecordFor(
  state: GameState,
  run: MakeoverRun,
  pathId: string,
  samples: readonly Point[],
): EdgeRecord | null {
  const path = runEdgePaths(run).find((entry) => entry.id === pathId);
  const accuracy = path === undefined ? null : traceScore(state, path, samples);
  return accuracy === null ? null : { accuracy, assisted: false, byCrew: false };
}

export function recordEdge(state: GameState, pathId: string, samples: readonly Point[]): GameState {
  return withPaintRun(state, (run, locked) => {
    const record = edgeRecordFor(locked, run, pathId, samples);
    if (record === null || sameFields(ownEntry(run.edges, pathId), record)) return null;
    return { ...run, edges: { ...run.edges, [pathId]: record } };
  });
}

export function edgeScore(state: Pick<GameState, "profile">, run: MakeoverRun, wall: WallId): number {
  const paths = runEdgePaths(run).filter((path) => path.wall === wall);
  return average(
    paths.map((path) => {
      const record = ownEntry(run.edges, path.id);
      return record === undefined ? 0 : capped(state, record.accuracy, record.assisted);
    }),
  );
}

export function isWallEdged(run: MakeoverRun, wall: WallId): boolean {
  return runEdgePaths(run)
    .filter((path) => path.wall === wall)
    .every((path) => Object.hasOwn(run.edges, path.id));
}
