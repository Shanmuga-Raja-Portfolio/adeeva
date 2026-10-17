import type { AvatarLook } from "../../../engine/avatar";
import type { FollowProgress } from "../../../engine/followRecord";
import type { DishDef, SizzleDef } from "../content/dish";
import type { Action } from "./action";
import { dishById } from "./catalog";
import { chopMarkCount, quickChopItems, type ChopRecord } from "./chop";
import { currentCookStep, type DishRun } from "./dishRun";
import type { GameState } from "./gameState";
import { createGame, type NewGameSettings } from "./newGame";
import { ghostLayout, type PlateRecord } from "./plate";
import { reduce } from "./reduce";
import { dishFinished, nextStepKind } from "./serviceRail";
import { quickTasteStart, QUICK_SIMMER_LAPS, type QuickRecord } from "./serviceQuick";
import { progressAtTarget, TICKS_PER_LAP } from "./simmer";
import { pieceRate, quickSizzle, TICKS_PER_SIDE, type SizzleRecord } from "./sizzle";
import { currentBeat } from "./storyQueue";
import { withCrossroadsBeat } from "./crossroads";
import { bestPinches, cuisineJars, dishTasteStart } from "./taste";

export const TEST_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    start: "student",
    ...overrides,
  });
}

export function settleStories(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 30; guard += 1) {
    const beat = currentBeat(next);
    if (beat === null) return next;
    next = reduce(next, { type: "markBeatSeen", beatId: beat.id });
  }
  return next;
}

export function dispatchAll(state: GameState, actions: readonly Action[]): GameState {
  return actions.reduce(reduce, state);
}

export function must(state: GameState, action: Action): GameState {
  const next = reduce(state, action);
  if (next === state) throw new Error(`Action had no effect: ${action.type}`);
  return next;
}

export function perfectChop(marks: number, offset = 0): ChopRecord {
  return { offsets: Array.from({ length: marks }, () => offset), assisted: false };
}

export function perfectSizzle(def: SizzleDef, heat = def.idealDots): SizzleRecord {
  return {
    heat,
    assisted: false,
    pieces: Array.from({ length: def.count }, (_, index) => {
      const side = Math.round(TICKS_PER_SIDE / pieceRate(index));
      const flips = Array.from({ length: def.flips }, (__, flip) => ({
        tick: side * (flip + 1),
        kind: "flip" as const,
      }));
      return { events: [...flips, { tick: side * (def.flips + 1), kind: "off" as const }] };
    }),
  };
}

export function perfectFollow(laps: number): FollowProgress {
  const progress = progressAtTarget(laps);
  const ticks = Math.round(progress * TICKS_PER_LAP);
  return { progress, ticks, insideTicks: ticks, assisted: false };
}

export function perfectPlate(dish: DishDef): PlateRecord {
  return { components: ghostLayout(dish), plateColour: "white", wiped: true, assisted: false };
}

export interface CookPlan {
  readonly chopOffset: number;
  readonly sizzleHeat: number | null;
  readonly followShare: number;
  readonly wipe: boolean;
  readonly assisted: boolean;
}

export const GOOD_COOK: CookPlan = {
  chopOffset: 0,
  sizzleHeat: null,
  followShare: 1,
  wipe: true,
  assisted: false,
};

function cookStepActions(state: GameState, plan: CookPlan): Action[] {
  const run = state.activeRun;
  if (run === null) return [];
  const dish = dishById(run.dishId);
  const step = currentCookStep(run, dish);
  switch (step) {
    case "chop":
      return dish.chop.slice(run.chop.length).map((item, offset) => ({
        type: "chopItem",
        itemIndex: run.chop.length + offset,
        record: { ...perfectChop(chopMarkCount(item), plan.chopOffset), assisted: plan.assisted },
      }));
    case "sizzle":
      return dish.sizzle === null
        ? []
        : [
            {
              type: "cookSizzle",
              record: {
                ...perfectSizzle(dish.sizzle, plan.sizzleHeat ?? dish.sizzle.idealDots),
                assisted: plan.assisted,
              },
            },
          ];
    case "simmer": {
      if (dish.simmer === null) return [];
      const follow = perfectFollow(dish.simmer.laps);
      const inside = Math.round(follow.ticks * plan.followShare);
      return [
        { type: "stirSimmer", sample: { ...follow, insideTicks: inside, assisted: plan.assisted } },
        { type: "stopSimmer" },
      ];
    }
    case "taste": {
      if (dish.taste === null) return [];
      const pinches = bestPinches(dish.taste, cuisineJars(dish.cuisine), dishTasteStart(dish.taste)) ?? [];
      return [{ type: "tasteDish", pinches, tastes: 2, assisted: plan.assisted }];
    }
    case null:
      return [];
  }
}

export function cookUntil(
  state: GameState,
  stop: (run: DishRun, dish: DishDef) => boolean,
  plan: CookPlan = GOOD_COOK,
): GameState {
  let next = state;
  for (let guard = 0; guard < 16; guard += 1) {
    const run = next.activeRun;
    if (run === null) throw new Error("Nothing on the board");
    const dish = dishById(run.dishId);
    if (stop(run, dish)) return next;
    switch (run.stage) {
      case "done":
      case "pass":
        return next;
      case "ticket":
        next = must(next, { type: "goToStage", stage: "mise" });
        break;
      case "mise":
        next = dispatchAll(
          next,
          dish.ingredients.map((ingredientId) => ({ type: "placeIngredient", ingredientId })),
        );
        next = must(next, { type: "goToStage", stage: "cook" });
        break;
      case "cook": {
        next = dispatchAll(next, cookStepActions(next, plan));
        const cooked = next.activeRun;
        if (cooked !== null && currentCookStep(cooked, dish) === null)
          next = must(next, { type: "goToStage", stage: "plate" });
        break;
      }
      case "plate":
        next = must(next, {
          type: "plateDish",
          record: { ...perfectPlate(dish), wiped: plan.wipe, assisted: plan.assisted },
        });
        next = must(next, { type: "goToStage", stage: "pass" });
        break;
    }
  }
  throw new Error("The dish never finished");
}

export function cookDish(state: GameState, plan: CookPlan = GOOD_COOK, ring = true): GameState {
  const next = cookUntil(state, () => false, plan);
  return ring && next.activeRun?.stage === "pass" ? must(next, { type: "ringBell" }) : next;
}

export function quickRecordFor(state: GameState, ticketIndex: number, dishIndex: number): QuickRecord | null {
  const service = state.service;
  const dish = service?.tickets[ticketIndex]?.dishes[dishIndex];
  if (service === null || dish === undefined) return null;
  const def = dishById(dish.dishId);
  switch (nextStepKind(dish)) {
    case "chop":
      return {
        kind: "chop",
        items: quickChopItems(def.chop).map((item) => perfectChop(chopMarkCount(item))),
      };
    case "sizzle":
      return def.sizzle === null ? null : { kind: "sizzle", record: perfectSizzle(quickSizzle(def.sizzle)) };
    case "simmer":
      return { kind: "simmer", follow: perfectFollow(QUICK_SIMMER_LAPS) };
    case "taste": {
      const start = quickTasteStart(state, service.seed, ticketIndex, dishIndex, def);
      if (def.taste === null || start === null) return null;
      return {
        kind: "taste",
        pinches: bestPinches(def.taste, cuisineJars(def.cuisine), start.start) ?? [],
        tastes: 1,
        assisted: false,
      };
    }
    case "plate":
      return { kind: "plate", wiped: true };
    case null:
      return null;
  }
}

export function playTicket(state: GameState, ticketIndex: number, at: number): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    const ticket = next.service?.tickets[ticketIndex];
    if (ticket === undefined || ticket.sentAt !== null) return next;
    const dishIndex = ticket.dishes.findIndex((dish) => !dishFinished(dish));
    const record = quickRecordFor(next, ticketIndex, dishIndex);
    if (record === null) throw new Error("No step to play");
    next = must(next, {
      type: "serviceStep",
      slot: { ticketId: ticket.id, dishIndex },
      at,
      record,
    });
  }
  throw new Error("The ticket never went out");
}

export function crossroadsReady(overrides: Partial<NewGameSettings> = {}, coins = 2000): GameState {
  const head = settleStories(newTestGame({ start: "head", ...overrides }));
  return settleStories(
    withCrossroadsBeat({ ...head, reputation: 90, coins, passes: { ...head.passes, head: 12 } }),
  );
}

export function playWholeService(state: GameState): GameState {
  let next = state;
  const tickets = state.service?.tickets.length ?? 0;
  for (let index = 0; index < tickets; index += 1) {
    const service = next.service;
    const ticket = service?.tickets[index];
    if (service === null || ticket === undefined) break;
    if (ticket.sentAt !== null) continue;
    next = playTicket(next, index, Math.max(service.lastAt, ticket.arrival) + 1);
  }
  const done = next.service;
  if (done === null) throw new Error("No service to end");
  const at = done.plan.lengthSeconds > 0 ? Math.max(done.lastAt, done.plan.lengthSeconds) : done.lastAt;
  return settleStories(must(next, { type: "endService", at }));
}
