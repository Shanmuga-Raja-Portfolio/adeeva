import type { CrewId, CrewJob } from "../content/crew";
import type { FloorId } from "../content/floor";
import type { LightId } from "../content/light";
import { homeStoryById, isFurnitureId, purposeById } from "./catalog";
import type { GameState } from "./gameState";
import { achebePlan } from "./openHousePlan";
import type { Project, TourChoice } from "./larkspur";
import type { MakeoverRun } from "./makeoverRun";
import { firstStagingDay } from "./projectCalendar";
import { purseLeft } from "./purse";
import { reduce } from "./reduce";
import type { RunStage } from "./runStage";
import { newTestGame, playRunTo, settleStories, type RoomRecipe } from "./testPlaythrough";
import type { NewGameSettings } from "./newGame";

const PURSE_CUSHION = 80;

const LIGHTS_BY_MOOD: Readonly<Record<string, readonly LightId[]>> = {
  warm: ["paper-pendant", "lantern-pendant", "brass-sconce"],
  cool: ["dome-pendant", "track-spots", "clip-lamp"],
  any: ["paper-pendant", "lantern-pendant", "dome-pendant"],
};

export function newShowHomeGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleStories(newTestGame({ career: "development", trait: "charmer", ...overrides }));
}

export function project(state: GameState): Project {
  const open = state.larkspur?.project ?? null;
  if (open === null) throw new Error("No home project");
  return open;
}

function must(before: GameState, after: GameState, what: string): GameState {
  if (after === before) throw new Error(`Could not ${what}`);
  return after;
}

export function endDays(state: GameState, days: number): GameState {
  let next = state;
  for (let day = 0; day < days; day += 1) next = settleStories(reduce(next, { type: "endDay" }));
  return next;
}

export function startHome(state: GameState, pick = 0): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) throw new Error("Larkspur is closed");
  const waited =
    state.calendar.day < larkspur.nextStartDay
      ? endDays(state, larkspur.nextStartDay - state.calendar.day)
      : state;
  const storyId = waited.larkspur?.storyOffer[pick];
  if (storyId === undefined) throw new Error("No story offered");
  return settleStories(must(waited, reduce(waited, { type: "startProject", storyId }), "start a home"));
}

export function planHome(state: GameState): GameState {
  const relaxed = state.profile.difficulty === "relaxed";
  const mapped = relaxed ? state : reduce(state, { type: "useAchebeMap" });
  const confirmed = must(mapped, reduce(mapped, { type: "confirmMap" }), "confirm the map");
  const painted = relaxed ? confirmed : reduce(confirmed, { type: "useAchebePalette" });
  return must(painted, reduce(painted, { type: "confirmPalette" }), "confirm the palette");
}

function roomFloor(state: GameState, run: MakeoverRun): FloorId {
  return project(state).palette.hallFloor ?? run.plan.floor ?? "oak-boards";
}

export function homeRecipe(
  state: GameState,
  run: MakeoverRun,
  overrides: Partial<RoomRecipe> = {},
): RoomRecipe {
  if (run.purpose.kind !== "home-room") throw new Error("Not a home room");
  const purpose = purposeById(run.purpose.purposeId);
  const story = homeStoryById(project(state).storyId);
  return {
    furniture: purpose.mustHaves
      .flatMap((need) =>
        isFurnitureId(need.itemId) ? Array.from({ length: need.count }, () => need.itemId) : [],
      )
      .filter(isFurnitureId),
    wallPaint: project(state).palette.paints[0] ?? "chalk-white",
    featurePaint: null,
    floor: roomFloor(state, run),
    lights: LIGHTS_BY_MOOD[purpose.mood] ?? ["paper-pendant"],
    decor: [story.pieces[0].decorId],
    tidy: false,
    edgeOffset: 0.2,
    paintAssist: false,
    floorOffset: 0.4,
    floorAssist: false,
    lightAssist: false,
    ...overrides,
  };
}

export function openRoom(state: GameState, roomIndex: number): GameState {
  return must(state, reduce(state, { type: "openHomeRoom", roomIndex }), `open room ${roomIndex}`);
}

export function closeRoom(state: GameState): GameState {
  return must(state, reduce(state, { type: "closeHomeRoom" }), "close the room");
}

function activeRoom(state: GameState): MakeoverRun {
  const run = state.activeRun;
  if (run === null) throw new Error("No open room");
  return run;
}

export function topUpTo(state: GameState, amount: number): GameState {
  let next = state;
  while (purseLeft(project(next)) < amount) next = must(next, reduce(next, { type: "topUpPurse" }), "top up");
  return next;
}

export function playHomeRoom(
  state: GameState,
  roomIndex: number,
  until: RunStage = "reveal",
  overrides: Partial<RoomRecipe> = {},
): GameState {
  const opened = openRoom(topUpTo(state, PURSE_CUSHION), roomIndex);
  const played = playRunTo(opened, homeRecipe(opened, activeRoom(opened), overrides), until);
  return closeRoom(played);
}

export function hire(state: GameState, crewIds: readonly CrewId[]): GameState {
  return crewIds.reduce(
    (current, crewId) =>
      settleStories(must(current, reduce(current, { type: "hireCrew", crewId }), `hire ${crewId}`)),
    state,
  );
}

export function assign(state: GameState, crewId: CrewId, roomIndex: number, job: CrewJob): GameState {
  return must(state, reduce(state, { type: "assignCrew", crewId, roomIndex, job }), `assign ${crewId}`);
}

const CREW_FOR: Readonly<Record<CrewJob, CrewId>> = { paint: "rosa", floor: "tobi", light: "hana" };

export function crewRoom(
  state: GameState,
  roomIndex: number,
  overrides: Partial<RoomRecipe> = {},
): GameState {
  let next = playHomeRoom(state, roomIndex, "paint", overrides);
  for (const job of ["paint", "floor", "light"] as const) {
    const hired = next.larkspur?.crew.hired ?? [];
    const crewId = hired.includes(CREW_FOR[job]) ? CREW_FOR[job] : (hired[0] ?? "marcus");
    next = endDays(assign(topUpTo(next, PURSE_CUSHION), crewId, roomIndex, job), 1);
  }
  return playHomeRoom(next, roomIndex, "reveal", overrides);
}

export function readyHome(state: GameState, mode: "hand" | "crew" = "hand"): GameState {
  const rooms = project(state).rooms.length;
  let next = state;
  for (let index = 0; index < rooms; index += 1)
    next = mode === "hand" ? playHomeRoom(next, index) : crewRoom(next, index);
  return next;
}

export function planShow(state: GameState, plan: TourChoice | null = null): GameState {
  const chosen = plan ?? achebePlan(state, project(state));
  return must(state, reduce(state, { type: "planOpenHouse", plan: chosen }), "plan the Open House");
}

export function toStagingDay(state: GameState): GameState {
  const first = firstStagingDay(project(state));
  return state.calendar.day < first ? endDays(state, first - state.calendar.day) : state;
}

export function stageHome(state: GameState): GameState {
  const waited = toStagingDay(state);
  return settleStories(must(waited, reduce(waited, { type: "stageOpenHouse" }), "stage the Open House"));
}
