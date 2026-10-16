import { average } from "../../../engine/average";
import { spendHours } from "../../../engine/dayHours";
import { isPlainObject } from "../../../engine/parse";
import type { Point } from "../../../engine/geometry/point";
import { CREW_JOBS, type CrewJob } from "../content/crew";
import type { FloorPattern } from "../content/floor";
import type { LightId } from "../content/light";
import type { RoomTemplate } from "../content/roomTemplate";
import { floorById } from "./catalog";
import { floorAccuracy, floorPieces, isPastGate } from "./floorLay";
import type { PlacedPiece } from "./floorPlan";
import type { GameState } from "./gameState";
import type { Project } from "./larkspur";
import { canMountAt, lightScore } from "./lighting";
import { COACH_TAPE, traceScore } from "./paintEdge";
import { openProject, withProject } from "./projectUpdate";
import { assistCap, floorTolerance } from "./skillTolerance";
import { queueStoryTrigger } from "./storyQueue";

export type CoachRecord =
  | { readonly job: "paint"; readonly samples: readonly Point[]; readonly assisted?: true }
  | { readonly job: "floor"; readonly drops: readonly Point[] }
  | { readonly job: "light"; readonly col: number; readonly row: number };

export const COACH_HOURS = 1;
export const COACH_FLOOR_PIECES = 3;
export const COACH_LAMP: LightId = "lantern-pendant";

export const COACH_CORNER: RoomTemplate = {
  id: "reading-nook",
  name: "Sample corner",
  cols: 4,
  rows: 3,
  doorCol: 2,
  windows: [],
  roofWindow: false,
  framedWalls: [],
  throughRow: null,
};

export const COACH_PIECES: readonly PlacedPiece[] = [
  { id: "coach-1", furnitureId: "bean-bag", col: 0, row: 0, rotation: 0 },
  { id: "coach-2", furnitureId: "bean-bag", col: 2, row: 0, rotation: 0 },
];

export function coachPattern(project: Pick<Project, "palette">): FloorPattern {
  const floor = project.palette.hallFloor;
  return floor === null ? "boards" : floorById(floor).pattern;
}

export function coachHours(state: Pick<GameState, "upgrades">): number {
  return state.upgrades.includes("sample-board") ? 0 : COACH_HOURS;
}

function floorDemo(state: GameState, project: Project, drops: readonly Point[]): number | null {
  const pieces = floorPieces(coachPattern(project)).slice(0, COACH_FLOOR_PIECES);
  if (drops.length !== pieces.length) return null;
  const tolerance = floorTolerance(state);
  const offsets = pieces.map((piece, index) => {
    const drop = drops[index];
    return drop === undefined ? Infinity : Math.hypot(drop[0] - piece.x, drop[1] - piece.y);
  });
  if (offsets.some((offset) => isPastGate(offset, tolerance))) return null;
  return average(offsets.map((offset) => floorAccuracy(offset, tolerance)));
}

function lightDemo(col: number, row: number): number | null {
  if (!Number.isInteger(col) || !Number.isInteger(row)) return null;
  if (!canMountAt(COACH_CORNER, COACH_PIECES, [], COACH_LAMP, [col, row])) return null;
  return lightScore(COACH_CORNER, COACH_PIECES, [{ lightId: COACH_LAMP, col, row }], "any");
}

function isPointList(points: unknown): points is readonly Point[] {
  return (
    Array.isArray(points) &&
    points.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        point.every((value) => typeof value === "number" && Number.isFinite(value)),
    )
  );
}

function isWellFormed(record: CoachRecord): boolean {
  if (!isPlainObject(record)) return false;
  if (record.job === "paint")
    return isPointList(record.samples) && (record.assisted === undefined || record.assisted === true);
  if (record.job === "floor") return isPointList(record.drops);
  return true;
}

function demoScore(state: GameState, project: Project, record: CoachRecord): number | null {
  if (record.job === "paint")
    return record.assisted === true ? assistCap(state) : traceScore(state, COACH_TAPE, record.samples);
  if (record.job === "floor") return floorDemo(state, project, record.drops);
  return lightDemo(record.col, record.row);
}

export function coachIssue(state: GameState, job: CrewJob): string | null {
  const project = openProject(state);
  if (project === null || project.stage !== "rooms")
    return "Coaching happens while the rooms are being made.";
  if (!CREW_JOBS.includes(job)) return "That isn't a crew job.";
  if (project.coached[job] !== undefined) return "You've already shown the crew this job in this home.";
  const hours = coachHours(state);
  if (state.calendar.hoursLeft < hours) return "Showing the crew how needs an hour. End the day first.";
  return null;
}

export function coachCrew(state: GameState, record: CoachRecord): GameState {
  const project = openProject(state);
  if (project === null || !isWellFormed(record) || coachIssue(state, record.job) !== null) return state;
  const demo = demoScore(state, project, record);
  if (demo === null) return state;
  const spent = spendHours(state, coachHours(state));
  if (spent === null) return state;
  const coached = withProject(spent, (current) => ({
    ...current,
    coached: { ...current.coached, [record.job]: Math.round(demo * 1000) / 1000 },
  }));
  return queueStoryTrigger(coached, "first-coaching");
}
