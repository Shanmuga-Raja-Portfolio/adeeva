import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { applyStanding } from "../../../engine/standing";
import { TOPPING_IDS, type ToppingId } from "../content/topping";
import { TRAY_PRODUCT_IDS } from "../content/product";
import { addToBakeBook, bakeBookEntry } from "./bakeBook";
import { evaluateBake } from "./bakeEvaluate";
import { bakeQuality } from "./bakeQuality";
import type { BakeRun } from "./bakeRun";
import { bakeTags } from "./bakeTags";
import { toppingById } from "./catalog";
import { counterCapacity, TRAY_ITEMS, type CounterTray } from "./counter";
import type { GameState, LogEntry, Pantry } from "./gameState";
import { bakeReward } from "./rewards";
import { queueStoryTrigger } from "./storyQueue";

function placedCount(run: BakeRun, toppingId: ToppingId): number {
  return run.toppings.filter((entry) => entry.toppingId === toppingId).length;
}

function consumeToppings(pantry: Pantry, run: BakeRun): Pantry {
  const toppings = { ...pantry.toppings };
  for (const id of TOPPING_IDS) toppings[id] -= placedCount(run, id);
  return { ...pantry, toppings };
}

export function canDeliver(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review") return actionCheck(["Finish the bake first."]);
  const { purpose } = run;
  if (purpose.kind === "tray")
    return actionCheck(
      state.counter.trays.length >= counterCapacity(state) ? ["The counter is already full of trays."] : [],
    );
  const reasons = TOPPING_IDS.filter((id) => placedCount(run, id) > state.pantry.toppings[id]).map(
    (id) => `Not enough ${toppingById(id).name} in the pantry.`,
  );
  if (!state.gigs.active.some((gig) => gig.id === purpose.gigId))
    reasons.push("This order is no longer open.");
  return actionCheck(reasons);
}

function stockTray(state: GameState, run: BakeRun): GameState {
  const productId = run.design.productId;
  const colour = run.design.colours[0];
  const trayProduct = TRAY_PRODUCT_IDS.find((id) => id === productId);
  if (trayProduct === undefined || colour === undefined) return state;
  const tray: CounterTray = {
    id: `tray-${state.counter.nextTrayNumber}`,
    productId: trayProduct,
    colour,
    quality: bakeQuality(run).quality,
    tags: bakeTags(run),
    left: TRAY_ITEMS,
  };
  return {
    ...state,
    activeRun: { ...run, stage: "done", reached: "done" },
    counter: {
      ...state.counter,
      trays: [...state.counter.trays, tray],
      nextTrayNumber: state.counter.nextTrayNumber + 1,
    },
  };
}

function deliverOrder(state: GameState, run: BakeRun, gigId: string): GameState {
  const brief = run.brief;
  if (brief === null) return state;
  const evaluation = evaluateBake(run, brief, state.calendar.day);
  const reward = bakeReward(state, run, brief, evaluation);
  const happy = reward.outcome === "pass";
  const entry: LogEntry = {
    runId: run.id,
    clientId: brief.clientId,
    day: state.calendar.day,
    evaluation,
    reward,
  };
  const page = bakeBookEntry(run, brief.clientId, state.calendar.day, evaluation.stars, happy);
  const delivered: GameState = {
    ...state,
    pantry: consumeToppings(state.pantry, run),
    activeRun: { ...run, stage: "done", reached: "done" },
    gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== gigId) },
    ordersDelivered: state.ordersDelivered + 1,
    log: [...state.log, entry],
    bakeBook: page === null ? state.bakeBook : addToBakeBook(state.bakeBook, page),
  };
  const rewarded = applyStanding(delivered, reward);
  return queueStoryTrigger(rewarded, "first-delivery");
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canDeliver(state).ok) return state;
  const { purpose } = run;
  return purpose.kind === "tray" ? stockTray(state, run) : deliverOrder(state, run, purpose.gigId);
}

export function lastResult(state: GameState, runId: string): LogEntry | null {
  return [...state.log].reverse().find((entry) => entry.runId === runId) ?? null;
}
