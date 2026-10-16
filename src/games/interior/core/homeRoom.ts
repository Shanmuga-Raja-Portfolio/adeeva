import { drawDistinct, drawSeed } from "../../../engine/rngDraw";
import { HOME_HINTS } from "../content/hints";
import type { RoomColour } from "../content/roomColour";
import { SHOW_HOME_CLIENT_ID } from "../content/client";
import type { PlotDef } from "../content/plot";
import type { PurposeId } from "../content/roomPurpose";
import type { Brief } from "./brief";
import { crewById, homeStoryById, plotById, purposeById } from "./catalog";
import type { GameState } from "./gameState";
import type { Project } from "./larkspur";
import { createMakeoverRun, EMPTY_PLAN, isHomeRoom, type MakeoverRun, type RunPurpose } from "./makeoverRun";
import { LATE_OFFSET } from "./projectCalendar";
import { purseLeft } from "./purse";
import { openProject, withProject } from "./projectUpdate";
import { stageIndex } from "./runStage";

const FAVOURED_PER_ROOM = 2;

export interface HomeRoomSpec {
  readonly plot: PlotDef;
  readonly roomIndex: number;
  readonly purposeId: PurposeId;
  readonly purse: number;
  readonly startDay: number;
  readonly favoured: readonly RoomColour[];
}

export function homeRoomBrief(spec: HomeRoomSpec): Brief {
  const purpose = purposeById(spec.purposeId);
  const space = spec.plot.spaces[spec.roomIndex];
  return {
    clientId: SHOW_HOME_CLIENT_ID,
    roomId: space?.roomId ?? "entry-hall",
    showHome: false,
    deadlineDay: spec.startDay + LATE_OFFSET,
    budget: spec.purse,
    fee: 0,
    requiredTags: [purpose.tag],
    favouredColours: [...spec.favoured],
    avoidColours: [],
    mustHaves: purpose.mustHaves,
    mood: purpose.mood,
    minQuality: 0,
  };
}

export function homeGigId(plotId: string, roomIndex: number): string {
  return `home-${plotId}-${roomIndex}`;
}

export function isRoomReady(run: MakeoverRun | null): boolean {
  return run !== null && stageIndex(run.stage) >= stageIndex("reveal");
}

export function allRoomsReady(project: Project): boolean {
  return project.rooms.every((room) => isRoomReady(room));
}

export function openHomeRoomIssue(state: GameState, roomIndex: number): string | null {
  const project = openProject(state);
  if (project === null || project.stage !== "rooms") return "The rooms aren't ready to work on yet.";
  if (!Number.isInteger(roomIndex) || roomIndex < 0 || roomIndex >= project.rooms.length)
    return "That room isn't in this home.";
  const run = state.activeRun;
  if (run !== null && isHomeRoom(run)) return HOME_HINTS.busyHomeRoom;
  if (run !== null && run.stage !== "done") return HOME_HINTS.busyRun;
  if (isRoomReady(project.rooms[roomIndex] ?? null)) return "That room is ready for visitors.";
  const busy = project.crewJobs.find((job) => job.roomIndex === roomIndex);
  if (busy !== undefined) return `${crewById(busy.crewId).name} is working in there today.`;
  return null;
}

function freshRoom(state: GameState, project: Project, roomIndex: number): [MakeoverRun, GameState] | null {
  const plot = plotById(project.plotId);
  const purposeId = project.map.spaces[roomIndex];
  if (purposeId === undefined || purposeId === null) return null;
  const story = homeStoryById(project.storyId);
  const [favoured, afterColours] = drawDistinct(state.rng, story.palette, FAVOURED_PER_ROOM);
  const [seed, rng] = drawSeed(afterColours);
  const purpose: RunPurpose = {
    kind: "home-room",
    plotId: project.plotId,
    roomIndex,
    purposeId,
    hallFloor: purposeId === "hall" ? null : project.palette.hallFloor,
  };
  const brief = homeRoomBrief({
    plot,
    roomIndex,
    purposeId,
    purse: purseLeft(project),
    startDay: project.startDay,
    favoured,
  });
  const run = createMakeoverRun({
    id: `run-${state.nextRunNumber}`,
    gigId: homeGigId(project.plotId, roomIndex),
    brief,
    purpose,
    day: state.calendar.day,
    seed,
    plan: purposeId === "hall" ? { ...EMPTY_PLAN, floor: project.palette.hallFloor } : EMPTY_PLAN,
  });
  return [run, { ...state, rng, nextRunNumber: state.nextRunNumber + 1 }];
}

export function openHomeRoom(state: GameState, roomIndex: number): GameState {
  const project = openProject(state);
  if (project === null || openHomeRoomIssue(state, roomIndex) !== null) return state;
  const stored = project.rooms[roomIndex] ?? null;
  const opened: [MakeoverRun, GameState] | null =
    stored === null ? freshRoom(state, project, roomIndex) : [stored, state];
  if (opened === null) return state;
  const [run, base] = opened;
  const rooms = project.rooms.map((room, index) => (index === roomIndex ? null : room));
  return withProject({ ...base, activeRun: run }, (current) => ({ ...current, rooms }));
}

export function closeHomeRoom(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.purpose.kind !== "home-room") return state;
  const { roomIndex } = run.purpose;
  const project = openProject(state);
  if (project === null || project.plotId !== run.purpose.plotId) return state;
  const rooms = project.rooms.map((room, index) => (index === roomIndex ? run : room));
  const ready = rooms.every((room) => isRoomReady(room));
  const stage = ready && project.stage === "rooms" ? "planner" : project.stage;
  return withProject({ ...state, activeRun: null }, (current) => ({ ...current, rooms, stage }));
}
