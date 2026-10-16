import type { DifficultyId } from "../../../engine/difficulty";
import { MAX_ACTIVE_GIGS } from "../../../engine/gigBoard";
import { nextRandom, type RngState } from "../../../engine/rng";
import { DECOR, type DecorId } from "../content/decor";
import { TOUR_TIME_IDS } from "../content/tourTime";
import { dayLength } from "./calendar";
import { furnitureById, isFurnitureId, lightById } from "./catalog";
import type { Brief } from "./brief";
import type { GameState } from "./gameState";
import type { TourChoice } from "./larkspur";
import { allRoomsReady, isRoomReady } from "./homeRoom";
import { OFFER_BEAT_ID } from "./larkspurOffer";
import { planHome, planShow, playHomeRoom, stageHome, startHome } from "./larkspurPlaythrough";
import { firstStagingDay } from "./projectCalendar";
import { EMPTY_PLAN, type RoomPlan } from "./makeoverRun";
import { achebePlan } from "./openHousePlan";
import { reduce } from "./reduce";
import { shortfallOf } from "./stock";
import { cartCost, decorPrice, planCart } from "./warehouse";
import { newTestGame, playOrder, recipeFor, settleStories, type RoomRecipe } from "./testPlaythrough";

export const SLIP_RATE = 0.11;

export interface BotSkill {
  readonly slip: number;
  readonly edge: number;
  readonly floor: number;
  readonly homeEdge: number;
  readonly homeFloor: number;
  readonly storyMiss: number;
  readonly ownPlan: boolean;
}

export const DECENT: BotSkill = {
  slip: SLIP_RATE,
  edge: 2.5,
  floor: 3,
  homeEdge: 2.5,
  homeFloor: 3,
  storyMiss: 1 / 3,
  ownPlan: true,
};
export const STRUGGLING: BotSkill = {
  slip: 0.5,
  edge: 1.1,
  floor: 2.8,
  homeEdge: 1.2,
  homeFloor: 2.5,
  storyMiss: 0.6,
  ownPlan: false,
};

export interface BotRun {
  readonly state: GameState;
  readonly rng: RngState;
  readonly offerDay: number | null;
  readonly passed: number;
  readonly revealed: number;
  readonly lowestCoins: number;
}

function trendDecor(state: GameState, recipe: RoomRecipe, gigId: string): DecorId[] {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined) return [];
  return gig.brief.requiredTags.flatMap((tag) => {
    const item = DECOR.find((entry) => entry.tags.includes(tag) && entry.colour !== "soft");
    return item === undefined || recipe.decor.includes(item.id) ? [] : [item.id];
  });
}

function recipeCost(state: GameState, brief: Brief, recipe: RoomRecipe): number {
  const plan: RoomPlan = {
    ...EMPTY_PLAN,
    pieces: recipe.furniture.map((furnitureId, index) => ({
      id: `piece-${index + 1}`,
      furnitureId,
      col: 0,
      row: 0,
      rotation: 0,
    })),
    wallPaint: recipe.wallPaint,
    featurePaint: recipe.featurePaint,
    floor: recipe.floor,
    lights: [...recipe.lights],
  };
  const decor = recipe.decor.reduce((sum, decorId) => sum + decorPrice(state, decorId), 0);
  return cartCost(state, shortfallOf(state.stock, planCart({ brief, plan }))) + decor;
}

function affordable(
  state: GameState,
  brief: Brief,
  recipe: RoomRecipe,
  extra: readonly DecorId[],
): RoomRecipe {
  return extra.reduce((current, decorId) => {
    const next = { ...current, decor: [...current.decor, decorId] };
    return recipeCost(state, brief, next) <= state.coins ? next : current;
  }, recipe);
}

function botRecipe(state: GameState, gigId: string, rng: RngState, skill: BotSkill): [RoomRecipe, RngState] {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined) throw new Error("No gig");
  const base = recipeFor(gig.clientId);
  const [edge, afterEdge] = nextRandom(rng);
  const [floor, afterFloor] = nextRandom(afterEdge);
  const [slip, next] = nextRandom(afterFloor);
  const mustHave = gig.brief.mustHaves.find((need) => isFurnitureId(need.itemId));
  const dropped =
    slip < skill.slip && mustHave !== undefined
      ? base.furniture.findIndex((id) => id === mustHave.itemId)
      : -1;
  const furniture = base.furniture.filter((_, index) => index !== dropped);
  const lampHolder = furniture.some((id) => furnitureById(id).holdsLamp);
  const recipe: RoomRecipe = {
    ...base,
    furniture,
    lights: base.lights.filter((id) => lampHolder || lightById(id).mount !== "desk"),
    edgeOffset: 0.3 + skill.edge * edge,
    floorOffset: 0.5 + skill.floor * floor,
  };
  return [affordable(state, gig.brief, recipe, trendDecor(state, base, gigId)), next];
}

function acceptAll(state: GameState): GameState {
  let next = state;
  for (const offer of state.gigs.offers) {
    if (next.gigs.active.length >= MAX_ACTIVE_GIGS) break;
    next = reduce(next, { type: "acceptOffer", offerId: offer.id });
  }
  return next;
}

function soonestGig(state: GameState): string | null {
  const sorted = [...state.gigs.active].sort((a, b) => a.brief.deadlineDay - b.brief.deadlineDay);
  return sorted[0]?.id ?? null;
}

function settled(state: GameState, takeKeys: boolean): GameState {
  if (state.story.queue[0] !== OFFER_BEAT_ID) return settleStories(state);
  const choiceId = takeKeys ? "take-keys" : "not-yet";
  return settleStories(reduce(state, { type: "chooseStoryOption", beatId: OFFER_BEAT_ID, choiceId }));
}

function ownPlan(state: GameState): TourChoice | null {
  const project = state.larkspur?.project ?? null;
  if (project === null) return null;
  const plan = achebePlan(state, project);
  const time = TOUR_TIME_IDS.find((id) => id !== plan.time) ?? plan.time;
  return { tour: plan.tour, music: plan.music, time };
}

function homeRoomStep(
  state: GameState,
  rng: RngState,
  skill: BotSkill,
  index: number,
): [GameState, RngState] {
  const [edge, afterEdge] = nextRandom(rng);
  const [floor, afterFloor] = nextRandom(afterEdge);
  const [story, next] = nextRandom(afterFloor);
  const overrides = {
    edgeOffset: 0.3 + skill.homeEdge * edge,
    floorOffset: 0.5 + skill.homeFloor * floor,
    ...(story < skill.storyMiss ? { decor: [] } : {}),
  };
  return [playHomeRoom(state, index, "reveal", overrides), next];
}

function homeStep(state: GameState, rng: RngState, skill: BotSkill): [GameState, RngState] | null {
  const step = homePlanStep(state, skill);
  if (step !== "room") return step === null ? null : [step, rng];
  const project = state.larkspur?.project ?? null;
  const index = project === null ? -1 : project.rooms.findIndex((room) => !isRoomReady(room));
  return index < 0 ? null : homeRoomStep(state, rng, skill, index);
}

function homePlanStep(state: GameState, skill: BotSkill): GameState | "room" | null {
  const larkspur = state.larkspur;
  if (larkspur === null) return null;
  if (larkspur.choicePending) return reduce(state, { type: "chooseNextPlot", move: true });
  const project = larkspur.project;
  if (project === null)
    return state.calendar.day >= larkspur.nextStartDay && larkspur.storyOffer.length > 0
      ? startHome(state)
      : null;
  if (project.stage === "map" || project.stage === "palette") return planHome(state);
  if (project.stage === "rooms") return "room";
  if (project.stage === "planner" && allRoomsReady(project))
    return planShow(state, skill.ownPlan ? ownPlan(state) : null);
  if (project.stage === "show" && state.calendar.day >= firstStagingDay(project)) return stageHome(state);
  return null;
}

function makeoverStep(run: BotRun, skill: BotSkill, fresh: boolean): BotRun {
  const state = acceptAll(run.state);
  const gigId = soonestGig(state);
  if (gigId === null || !fresh || (state.activeRun !== null && state.activeRun.stage !== "done"))
    return { ...run, state: reduce(state, { type: "endDay" }) };
  const [recipe, rng] = botRecipe(state, gigId, run.rng, skill);
  const brief = state.gigs.active.find((gig) => gig.id === gigId)?.brief;
  if (brief === undefined || recipeCost(state, brief, recipe) > state.coins) {
    const shift = reduce(state, { type: "workShift" });
    return { ...run, state: shift === state ? reduce(state, { type: "endDay" }) : shift, rng };
  }
  const played = playOrder(state, gigId, recipe);
  const passed = played.log.at(-1)?.evaluation.passed === true;
  return { ...run, state: played, rng, revealed: run.revealed + 1, passed: run.passed + (passed ? 1 : 0) };
}

export function runBotFrom(
  start: BotRun,
  untilDay: number,
  skill: BotSkill = DECENT,
  takeKeys = false,
): BotRun {
  let run = start;
  while (run.state.calendar.day < untilDay) {
    const fresh = run.state.calendar.hoursLeft >= dayLength(run.state);
    const home = fresh ? homeStep(run.state, run.rng, skill) : null;
    run =
      home !== null && home[0] !== run.state
        ? { ...run, state: home[0], rng: home[1] }
        : makeoverStep(run, skill, fresh);
    const offered = run.offerDay === null && run.state.story.queue.includes(OFFER_BEAT_ID);
    const state = settled(run.state, takeKeys);
    run = {
      ...run,
      state,
      offerDay: offered ? state.calendar.day : run.offerDay,
      lowestCoins: Math.min(run.lowestCoins, state.coins),
    };
  }
  return run;
}

export function botStart(state: GameState, seed: number): BotRun {
  return { state, rng: seed * 7919, offerDay: null, passed: 0, revealed: 0, lowestCoins: state.coins };
}

export function runBot(seed: number, untilDay: number, difficulty: DifficultyId = "standard"): BotRun {
  const state = settleStories(newTestGame({ seed, difficulty, trait: "perfectionist" }));
  return runBotFrom(botStart(state, seed), untilDay);
}
