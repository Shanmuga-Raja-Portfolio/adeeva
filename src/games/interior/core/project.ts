import { drawDistinct } from "../../../engine/rngDraw";
import type { RngState } from "../../../engine/rng";
import type { DifficultyId } from "../../../engine/difficulty";
import { HOME_STORY_IDS, type HomeStoryId } from "../content/homeStory";
import { PHASE_FEE_MULTIPLIER, PLOTS, RELAXED_PURSE_MULTIPLIER, type PlotDef } from "../content/plot";
import { homeStoryById } from "./catalog";
import type { GameState } from "./gameState";
import { bestMap, emptyMap } from "./homeMap";
import { achebePalette, EMPTY_PALETTE } from "./homePalette";
import type { Larkspur, Project } from "./larkspur";
import { LATE_OFFSET } from "./projectCalendar";
import { emptyStock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

const STORY_CHOICES = 2;
const FOURTH_PLOT = 4;
const LAST_PLOT = 6;
const VALE_VISIT_PROJECTS = 2;

export function plotFor(larkspur: Pick<Larkspur, "plot">): PlotDef {
  const plot = PLOTS[larkspur.plot - 1];
  if (plot === undefined) throw new Error(`Missing plot ${larkspur.plot}`);
  return plot;
}

export function projectFee(plot: PlotDef, phase: number): number {
  return Math.round(plot.fee * (phase >= 2 ? PHASE_FEE_MULTIPLIER : 1));
}

export function projectPurse(plot: PlotDef, difficulty: DifficultyId): number {
  return difficulty === "relaxed" ? Math.round(plot.purse * RELAXED_PURSE_MULTIPLIER) : plot.purse;
}

export function drawStoryOffer(rng: RngState, last: HomeStoryId | null): [HomeStoryId[], RngState] {
  return drawDistinct(
    rng,
    HOME_STORY_IDS.filter((id) => id !== last),
    STORY_CHOICES,
  );
}

export function startProjectIssue(state: GameState, storyId: HomeStoryId): string | null {
  const larkspur = state.larkspur;
  if (larkspur === null) return "Larkspur Close isn't open yet.";
  if (larkspur.project !== null) return "Finish this home first.";
  if (larkspur.choicePending) return "Choose where to go next first.";
  if (state.calendar.day < larkspur.nextStartDay)
    return `The next home is ready on day ${larkspur.nextStartDay}.`;
  if (!larkspur.storyOffer.includes(storyId)) return "Pick one of the two family stories.";
  return null;
}

function freshProject(state: GameState, larkspur: Larkspur, storyId: HomeStoryId): Project {
  const plot = plotFor(larkspur);
  const relaxed = state.profile.difficulty === "relaxed";
  return {
    startDay: state.calendar.day,
    plotId: plot.id,
    storyId,
    stage: "map",
    fee: projectFee(plot, larkspur.phase),
    sister: larkspur.sisterNext,
    map: relaxed ? { spaces: bestMap(plot), fromAchebe: true } : emptyMap(plot),
    palette: relaxed ? achebePalette(homeStoryById(storyId), plot) : EMPTY_PALETTE,
    purse: projectPurse(plot, state.profile.difficulty),
    added: 0,
    spent: 0,
    shelf: emptyStock(),
    rooms: plot.spaces.map(() => null),
    crewJobs: [],
    coached: {},
    plan: null,
  };
}

function startBeats(state: GameState, larkspur: Larkspur, project: Project): GameState {
  let next = queueStoryTrigger(state, "first-project");
  const plot = plotFor(larkspur);
  if (plot.number === FOURTH_PLOT) next = queueStoryTrigger(next, "plot-four");
  if (plot.number === LAST_PLOT) next = queueStoryTrigger(next, "street-end");
  if (larkspur.history.length === VALE_VISIT_PROJECTS) next = queueStoryTrigger(next, "third-project");
  return project.sister ? queueStoryTrigger(next, "sister-home") : next;
}

export function startProject(state: GameState, storyId: HomeStoryId): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null || startProjectIssue(state, storyId) !== null) return state;
  const project = freshProject(state, larkspur, storyId);
  const started: GameState = {
    ...state,
    coins: state.coins + Math.round(project.fee / 2),
    larkspur: {
      ...larkspur,
      project,
      sisterNext: false,
      storyOffer: [],
      nextStartDay: state.calendar.day + LATE_OFFSET,
    },
  };
  return startBeats(started, larkspur, project);
}
