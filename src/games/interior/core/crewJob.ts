import { WALL_IDS } from "../content/roomTemplate";
import type { CrewJob } from "../content/crew";
import { roundShare } from "../../../engine/roundShare";
import { crewById } from "./catalog";
import { workSkill } from "./crewSkill";
import { FLOOR_PIECES, floorAccuracy } from "./floorLay";
import type { GameState } from "./gameState";
import type { CrewAssignment, Larkspur } from "./larkspur";
import { bestLightCell, type PlacedLight } from "./lighting";
import type { EdgeRecord, FloorRecord, MakeoverRun, RollRecord } from "./makeoverRun";
import { runEdgePaths } from "./paintEdge";
import { emptyRoll, paintableCells } from "./paintRoll";
import { runRoom } from "./runRoom";
import { stageAfter, stageIndex, type RunStage } from "./runStage";
import { floorTolerance } from "./skillTolerance";
import { withLarkspur } from "./projectUpdate";

const FLOOR_CURVE = 0.4;

function advanced(run: MakeoverRun): MakeoverRun {
  const stage: RunStage = stageAfter(run.stage) ?? run.stage;
  return { ...run, stage, reached: stageIndex(stage) > stageIndex(run.reached) ? stage : run.reached };
}

function crewPaint(run: MakeoverRun, skill: number): MakeoverRun {
  const edge: EdgeRecord = { accuracy: skill, assisted: false, byCrew: true };
  const edges = Object.fromEntries(runEdgePaths(run).map((path) => [path.id, edge]));
  const rolls = Object.fromEntries(
    WALL_IDS.map((wall) => {
      const cells = paintableCells(run, wall);
      const roll: RollRecord = {
        ...emptyRoll(),
        passes: emptyRoll().passes.map((_, cell) => (cells.includes(cell) ? 2 : 0)),
        byCrew: true,
      };
      return [wall, roll];
    }),
  );
  return { ...run, edges, rolls };
}

function crewFloor(
  state: Pick<GameState, "profile" | "upgrades">,
  run: MakeoverRun,
  skill: number,
): MakeoverRun {
  const tolerance = floorTolerance(state);
  const offset = Math.max(0.01, Math.round(tolerance * Math.sqrt((1 - skill) / FLOOR_CURVE) * 100) / 100);
  const record: FloorRecord = {
    offset,
    accuracy: floorAccuracy(offset, tolerance),
    assisted: false,
    byCrew: true,
  };
  return {
    ...run,
    floorLaid: Object.fromEntries(
      Array.from({ length: FLOOR_PIECES }, (_, index) => [String(index), record]),
    ),
  };
}

function crewLight(run: MakeoverRun, skill: number): MakeoverRun {
  const room = runRoom(run);
  const placed: PlacedLight[] = [];
  const lightPlaces: Record<string, { readonly col: number; readonly row: number }> = {};
  run.plan.lights.forEach((lightId, index) => {
    const cell = bestLightCell(room, run.plan.pieces, placed, lightId);
    if (cell === null) return;
    placed.push({ lightId, col: cell[0], row: cell[1] });
    lightPlaces[String(index)] = { col: cell[0], row: cell[1] };
  });
  return { ...run, lightPlaces, lightCrew: roundShare(skill) };
}

export function crewWork(
  state: Pick<GameState, "profile" | "upgrades">,
  run: MakeoverRun,
  job: CrewJob,
  skill: number,
): MakeoverRun {
  if (run.stage !== job) return run;
  const locked = { ...run, locked: true };
  if (job === "paint") return advanced(crewPaint(locked, skill));
  if (job === "floor") return advanced(crewFloor(state, locked, skill));
  return advanced(crewLight(locked, skill));
}

export function crewLine(assignment: CrewAssignment, roomName: string): string {
  const name = crewById(assignment.crewId).name.split(" ")[0] ?? "Your crew";
  const verb = { paint: "painted", floor: "laid the floor in", light: "lit" }[assignment.job];
  return `${name} ${verb} the ${roomName}.`;
}

function withJobsDone(larkspur: Larkspur, jobs: readonly CrewAssignment[]): Larkspur["crew"] {
  const jobsDone = { ...larkspur.crew.jobsDone };
  for (const job of jobs)
    jobsDone[job.crewId] = { ...jobsDone[job.crewId], [job.job]: jobsDone[job.crewId][job.job] + 1 };
  return { ...larkspur.crew, jobsDone };
}

export function finishCrewJobs(state: GameState): GameState {
  return withLarkspur(state, (larkspur) => {
    const project = larkspur.project;
    if (project === null || project.crewJobs.length === 0) return null;
    const rooms = project.rooms.map((room, index) => {
      const assignment = project.crewJobs.find((job) => job.roomIndex === index);
      if (room === null || assignment === undefined) return room;
      const skill = workSkill(state, larkspur.crew, project, assignment.crewId, assignment.job);
      return crewWork(state, room, assignment.job, skill);
    });
    return {
      ...larkspur,
      crew: withJobsDone(larkspur, project.crewJobs),
      project: { ...project, rooms, crewJobs: [] },
    };
  });
}
