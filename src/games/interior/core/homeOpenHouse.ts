import { spendHours } from "../../../engine/dayHours";
import { overallScore, type PanelScore } from "../../../engine/panelScore";
import { weakestTip, type QualityTip } from "../../../engine/qualityTip";
import { lateShowPenalty, showReputation } from "../../../engine/showDay";
import { applyStanding } from "../../../engine/standing";
import { HOME_PANELS, type HomePanelId } from "../content/panelMember";
import { PART_PRAISE, PART_TIPS } from "../content/openHouseNote";
import { homeStoryById, isFurnitureId, plotById } from "./catalog";
import { crewWork } from "./crewJob";
import type { GameState } from "./gameState";
import { bestMap, isMapComplete } from "./homeMap";
import { achebePalette, paletteIssues } from "./homePalette";
import { homePanels } from "./homePanels";
import { closeHomeRoom, homeGigId, homeRoomBrief, isRoomReady, allRoomsReady } from "./homeRoom";
import { atLeast, betterKey, isEveryGold, isStreetOfHomes, keyFor } from "./keyWall";
import type { KeyWall, OpenHousePlan, OpenHouseRecord, Project } from "./larkspur";
import { createMakeoverRun, EMPTY_PLAN, type MakeoverRun, type RoomPlan } from "./makeoverRun";
import { achebePlan } from "./openHousePlan";
import { openHousePrize } from "./openHousePrize";
import { planIssues } from "./planChoice";
import { applyAdvance, plotAdvance } from "./plotProgress";
import { lateDay, stagingDayIssue } from "./projectCalendar";
import { openProject } from "./projectUpdate";
import { runRoom } from "./runRoom";
import { stageIndex } from "./runStage";
import { queueStoryTrigger } from "./storyQueue";
import { emptyStock } from "./stock";
import { tidyLayout } from "./tidyLayout";
import { lockRun } from "./warehouse";

export const STAGING_HOURS = 2;
export const BELLWIND_SKILL = 0.6;
const BUZZ_DIVISOR = 10;

export function stageIssue(state: GameState): string | null {
  const project = openProject(state);
  if (project === null || project.plan === null || project.stage !== "show")
    return "Plan the Open House first.";
  if (!allRoomsReady(project)) return "Every room must be ready for visitors.";
  const day = stagingDayIssue(project, state.calendar.day);
  if (day !== null) return day;
  const run = state.activeRun;
  if (run !== null && run.purpose.kind === "home-room") return "Close the room you're working on first.";
  if (state.calendar.hoursLeft < STAGING_HOURS) return "The Open House needs 2 hours. End the day first.";
  return null;
}

function panelNote(entry: PanelScore<HomePanelId>): string {
  const best = [...entry.parts].sort((a, b) => b.value - a.value)[0];
  const club = HOME_PANELS.find((def) => def.id === entry.id)?.club ?? entry.label;
  return `${club}: ${best === undefined ? "What a lovely home." : (PART_PRAISE[best.id] ?? "What a lovely home.")}`;
}

function nextTimeTip(panels: readonly PanelScore<HomePanelId>[]): string {
  const tips: QualityTip[] = panels.flatMap((entry) =>
    entry.parts.map((part): QualityTip => [part.value, PART_TIPS[part.id] ?? "adding one more cosy touch"]),
  );
  return `Next time, try ${weakestTip(tips)}.`;
}

function settle(state: GameState, project: Project, plan: OpenHousePlan, auto: boolean): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) return state;
  const { difficulty } = state.profile;
  const panels = homePanels(state, project, plan);
  const late = state.calendar.day >= lateDay(project);
  const overall = overallScore(panels, lateShowPenalty(late, difficulty));
  const keyId = keyFor(overall);
  const plot = plotById(project.plotId);
  const prize = openHousePrize(project, overall, difficulty, plot.number);
  const reputation = showReputation(overall, difficulty);
  const buzz = Math.round(overall / BUZZ_DIVISOR);
  const hook = betterKey(larkspur.keyWall[project.plotId], keyId);
  const advance = plotAdvance(difficulty, overall, hook);
  const record: OpenHouseRecord = {
    plotId: project.plotId,
    storyId: project.storyId,
    day: state.calendar.day,
    panels,
    overall,
    keyId,
    late,
    auto,
    notes: panels.map(panelNote),
    tip: nextTimeTip(panels),
    prize,
    reputation,
    buzz,
    advance,
    plan,
  };
  const keyWall: KeyWall = { ...larkspur.keyWall, [project.plotId]: hook };
  const done: GameState = {
    ...state,
    larkspur: {
      ...larkspur,
      keyWall,
      history: [...larkspur.history, record],
      project: { ...project, plan, stage: "done", crewJobs: [], shelf: emptyStock() },
    },
  };
  const paid = applyStanding(done, {
    coins: prize.reduce((sum, line) => sum + line.amount, 0),
    reputation,
    buzz,
  });
  let next = auto ? paid : queueStoryTrigger(paid, "first-open-house");
  if (atLeast(keyId, "gold")) next = queueStoryTrigger(next, "gold-key");
  if (isStreetOfHomes(keyWall)) next = queueStoryTrigger(next, "street-of-homes");
  if (isEveryGold(keyWall)) next = queueStoryTrigger(next, "every-gold");
  return applyAdvance(next, advance, project.storyId);
}

export function stageOpenHouse(state: GameState): GameState {
  const project = openProject(state);
  if (project === null || project.plan === null || stageIssue(state) !== null) return state;
  const spent = spendHours(state, STAGING_HOURS);
  return spent === null ? state : settle(spent, project, project.plan, false);
}

function autoPlan(run: MakeoverRun, project: Project): RoomPlan {
  const room = runRoom(run);
  const furniture = run.brief.mustHaves.flatMap((need) =>
    isFurnitureId(need.itemId) ? Array.from({ length: need.count }, () => need.itemId) : [],
  );
  const pieces =
    tidyLayout(
      room,
      furniture.flatMap((furnitureId, index) =>
        isFurnitureId(furnitureId) ? [{ id: `piece-${index + 1}`, furnitureId }] : [],
      ),
    ) ?? [];
  return {
    ...EMPTY_PLAN,
    pieces,
    nextPieceNumber: pieces.length + 1,
    wallPaint: project.palette.paints[0] ?? "chalk-white",
    floor: run.plan.floor ?? project.palette.hallFloor ?? "oak-boards",
    lights: ["paper-pendant"],
  };
}

function plannedRun(state: GameState, project: Project, index: number): [MakeoverRun, GameState] {
  const plot = plotById(project.plotId);
  const purposeId = project.map.spaces[index] ?? "hall";
  const story = homeStoryById(project.storyId);
  const run = createMakeoverRun({
    id: `run-${state.nextRunNumber}`,
    gigId: homeGigId(project.plotId, index),
    brief: homeRoomBrief({
      plot,
      roomIndex: index,
      purposeId,
      purse: 0,
      startDay: project.startDay,
      favoured: story.palette.slice(0, 2),
    }),
    purpose: {
      kind: "home-room",
      plotId: project.plotId,
      roomIndex: index,
      purposeId,
      hallFloor: purposeId === "hall" ? null : project.palette.hallFloor,
    },
    day: state.calendar.day,
    seed: state.nextRunNumber,
    plan: EMPTY_PLAN,
  });
  return [run, { ...state, nextRunNumber: state.nextRunNumber + 1 }];
}

function bellwindFinish(state: GameState, project: Project, start: MakeoverRun): [MakeoverRun, GameState] {
  let room = start;
  let next = state;
  const ownPlan = planIssues(room).length === 0;
  if (stageIndex(room.stage) < stageIndex("paint") || !ownPlan) {
    room = {
      ...room,
      plan: ownPlan ? room.plan : autoPlan(room, project),
      stage: "paint",
      reached: stageIndex(room.reached) > stageIndex("paint") ? room.reached : "paint",
      edges: {},
      rolls: {},
      floorLaid: {},
      lightPlaces: {},
      decor: [],
    };
  }
  const locked = ownPlan ? lockRun(next, room) : null;
  if (locked !== null) {
    room = locked.run;
    next = locked.state;
  }
  for (const job of ["paint", "floor", "light"] as const)
    if (room.stage === job) room = crewWork(next, room, job, BELLWIND_SKILL);
  return [isRoomReady(room) ? room : { ...room, stage: "reveal", reached: "reveal", locked: true }, next];
}

function completedPlan(project: Project): Project {
  const plot = plotById(project.plotId);
  const map = isMapComplete(plot, project.map) ? project.map : { spaces: bestMap(plot), fromAchebe: true };
  const palette =
    paletteIssues(project).length === 0
      ? project.palette
      : achebePalette(homeStoryById(project.storyId), plot);
  return { ...project, map, palette };
}

export function autoStage(state: GameState): GameState {
  const closed = closeHomeRoom(state);
  const open = openProject(closed);
  if (open === null || open.stage === "done") return state;
  const project = completedPlan(open);
  let next = closed;
  const rooms = project.rooms.map((room, index) => {
    if (isRoomReady(room)) return room;
    let start = room;
    if (start === null) {
      const [fresh, after] = plannedRun(next, project, index);
      start = fresh;
      next = after;
    }
    const [finished, after] = bellwindFinish(next, project, start);
    next = after;
    return finished;
  });
  const finished: Project = { ...project, rooms, crewJobs: [] };
  const plan = achebePlan(next, finished);
  return queueStoryTrigger(settle(next, finished, plan, true), "doors-opened");
}
