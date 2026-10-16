import { average } from "../../../engine/average";
import { panel, subScore, type PanelScore } from "../../../engine/panelScore";
import { closerStrength } from "../../../engine/showOrder";
import { stagingScore } from "../../../engine/showDay";
import type { HomeStoryDef } from "../content/homeStory";
import type { HomePanelId } from "../content/panelMember";
import { homeStoryById, plotById } from "./catalog";
import type { GameState } from "./gameState";
import { glowPath } from "./glowPath";
import { mapFit } from "./homeMap";
import type { OpenHousePlan, Project } from "./larkspur";
import { moodMatch } from "./lighting";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { roomQuality } from "./roomQuality";
import { surfaceColours } from "./roomColours";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";
import { runRoom } from "./runRoom";
import { tellsStory } from "./storyPieces";
import { walkThrough } from "./walkThrough";

export const MAP_SUGGESTION_CAP = 80;
export const PLAN_SUGGESTION_CAP = 70;

export interface RoomFacts {
  readonly index: number;
  readonly flow: number;
  readonly throughReached: boolean | null;
  readonly light: number;
  readonly mood: number;
  readonly pathCells: number;
  readonly glowing: number;
  readonly finish: number;
  readonly comfy: boolean;
  readonly wallInPalette: boolean;
  readonly surfaces: readonly string[];
  readonly tellsStory: boolean;
  readonly quality: number;
  readonly tags: readonly string[];
}

function roomFacts(
  state: Pick<GameState, "profile">,
  project: Project,
  story: HomeStoryDef,
  run: MakeoverRun,
  index: number,
): RoomFacts {
  const quality = roomQuality(state, run);
  const room = runRoom(run);
  const lights = placedLights(run);
  const glow = glowPath(room, run.plan.pieces, lights);
  const walk = walkThrough(room, run.plan.pieces, 1);
  const source = roomSource(run);
  const tags = roomTags(source);
  const wall = run.plan.wallPaint;
  return {
    index,
    flow: quality.flow,
    throughReached: walk.throughReached,
    light: quality.light,
    mood: moodMatch(run.brief.mood, lights),
    pathCells: glow === null ? (walk.throughReached === false ? 1 : 0) : glow.cells.length,
    glowing: glow === null ? 0 : glow.glowing,
    finish: 0.5 * quality.paint + 0.5 * quality.floor,
    comfy: tags.includes("cosy") || tags.includes("calm"),
    wallInPalette: wall !== null && project.palette.paints.includes(wall),
    surfaces: surfaceColours(source),
    tellsStory: tellsStory(run, story),
    quality: quality.quality,
    tags,
  };
}

export function homeRoomFacts(state: Pick<GameState, "profile">, project: Project): RoomFacts[] {
  const story = homeStoryById(project.storyId);
  return project.rooms.flatMap((run, index) =>
    run === null ? [] : [roomFacts(state, project, story, run, index)],
  );
}

function share(count: number, total: number, empty = 1): number {
  return total === 0 ? empty : count / total;
}

function isCapped(state: Pick<GameState, "profile">, suggested: boolean): boolean {
  return suggested && state.profile.difficulty !== "relaxed";
}

function capped(state: Pick<GameState, "profile">, suggested: boolean, value: number, cap: number): number {
  return isCapped(state, suggested) ? Math.min(cap, value) : value;
}

function neighbourShare(facts: readonly RoomFacts[]): number {
  const pairs = facts.slice(1).map((fact, index) => {
    const before = facts[index];
    return before !== undefined && fact.surfaces.some((colour) => before.surfaces.includes(colour));
  });
  return share(pairs.filter(Boolean).length, pairs.length);
}

function flowPanel(state: Pick<GameState, "profile">, project: Project, facts: readonly RoomFacts[]) {
  const doors = facts.filter((fact) => fact.throughReached !== null);
  const reached = doors.filter((fact) => fact.throughReached === true).length;
  const map = capped(
    state,
    project.map.fromAchebe,
    100 * mapFit(plotById(project.plotId), project.map.spaces),
    MAP_SUGGESTION_CAP,
  );
  return panel<HomePanelId>("flow", "Flow", [
    subScore(
      "walk",
      "Walk-through",
      100 * average(facts.map((fact) => fact.flow)),
      0.5,
      "Room to walk to every spot.",
    ),
    subScore(
      "through",
      "Through-ways",
      100 * share(reached, doors.length),
      0.3,
      `${reached} of ${doors.length} doors to the next room are clear.`,
    ),
    subScore(
      "map",
      "Home map",
      map,
      0.2,
      isCapped(state, project.map.fromAchebe)
        ? `Ms. Achebe's map, which scores up to ${MAP_SUGGESTION_CAP}.`
        : project.map.fromAchebe
          ? "Ms. Achebe's map."
          : "Your own map.",
    ),
  ]);
}

function lightPanel(facts: readonly RoomFacts[]) {
  const path = facts.reduce((sum, fact) => sum + fact.pathCells, 0);
  const glowing = facts.reduce((sum, fact) => sum + fact.glowing, 0);
  return panel<HomePanelId>("light", "Light", [
    subScore(
      "spots",
      "Spots",
      100 * average(facts.map((fact) => fact.light)),
      0.6,
      "Lamps over the places people use.",
    ),
    subScore(
      "glow",
      "Glow path",
      100 * share(glowing, path),
      0.2,
      `${glowing} of ${path} steps between doors glow.`,
    ),
    subScore(
      "mood",
      "Mood",
      100 * average(facts.map((fact) => fact.mood)),
      0.2,
      "Warm or cool, just as each room wished.",
    ),
  ]);
}

function comfortPanel(project: Project, facts: readonly RoomFacts[]) {
  const comfy = facts.filter((fact) => fact.comfy).length;
  const palette = share(facts.filter((fact) => fact.wallInPalette).length, facts.length);
  const hall = plotById(project.plotId).hall;
  const flow = hall ? 0.5 * palette + 0.5 * neighbourShare(facts) : palette;
  return panel<HomePanelId>("comfort", "Comfort", [
    subScore(
      "finish",
      "Finish",
      100 * average(facts.map((fact) => fact.finish)),
      0.5,
      "Neat walls and snug floors.",
    ),
    subScore(
      "cosy",
      "Cosy",
      100 * share(comfy, facts.length),
      0.3,
      `${comfy} of ${facts.length} rooms feel cosy or calm.`,
    ),
    subScore("colour", "Colour flow", 100 * flow, 0.2, "One palette from room to room."),
  ]);
}

function storyPanel(
  state: Pick<GameState, "profile">,
  project: Project,
  plan: OpenHousePlan,
  facts: readonly RoomFacts[],
) {
  const story = homeStoryById(project.storyId);
  const telling = facts.filter((fact) => fact.tellsStory).length;
  const tags = new Set(facts.flatMap((fact) => fact.tags));
  const matched = story.tags.filter((tag) => tags.has(tag)).length;
  const welcome = capped(
    state,
    plan.fromAchebe,
    stagingScore(plan.music === story.bestMusic, plan.time === story.bestTime),
    PLAN_SUGGESTION_CAP,
  );
  const qualities = plan.tour.map((index) => facts.find((fact) => fact.index === index)?.quality ?? 0);
  const tour = capped(state, plan.fromAchebe, closerStrength(qualities), PLAN_SUGGESTION_CAP);
  return panel<HomePanelId>("story", "Story", [
    subScore(
      "pieces",
      "Story pieces",
      100 * share(telling, facts.length),
      0.4,
      `${telling} of ${facts.length} rooms tell the family's story.`,
    ),
    subScore(
      "tags",
      "Home feel",
      (100 * matched) / story.tags.length,
      0.2,
      `${matched} of ${story.tags.length} story feelings found.`,
    ),
    subScore(
      "welcome",
      "Welcome",
      welcome,
      0.2,
      isCapped(state, plan.fromAchebe)
        ? `Ms. Achebe's music and time, which score up to ${PLAN_SUGGESTION_CAP}.`
        : "Music and time of day.",
    ),
    subScore(
      "tour",
      "Tour",
      tour,
      0.2,
      isCapped(state, plan.fromAchebe)
        ? `Ms. Achebe's tour, which scores up to ${PLAN_SUGGESTION_CAP}.`
        : "The best room saved for last.",
    ),
  ]);
}

export function homePanels(
  state: Pick<GameState, "profile">,
  project: Project,
  plan: OpenHousePlan,
): PanelScore<HomePanelId>[] {
  const facts = homeRoomFacts(state, project);
  return [
    flowPanel(state, project, facts),
    lightPanel(facts),
    comfortPanel(project, facts),
    storyPanel(state, project, plan, facts),
  ];
}
