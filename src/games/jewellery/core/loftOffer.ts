import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { RngState } from "../../../engine/rng";
import { drawDistinct } from "../../../engine/rngDraw";
import { weekEndDay } from "../../../engine/week";
import { CLIENTS } from "../content/client";
import { LINE_NAME_IDS, type LineNameId } from "../content/lineName";
import { LOFT_LATER_FLAG, LOFT_OFFER_BEAT } from "../content/loftStoryBeat";
import type { MetalId } from "../content/metal";
import type { StockSizeId } from "../content/stockSize";
import type { ExtraId } from "../content/extra";
import { initialCollection } from "./collectionState";
import type { GameState } from "./gameState";
import { INITIAL_LAUNCH } from "./launchState";
import { withExtra, withMetal, type Stock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

export const LOFT_REPUTATION = 45;
export const LOFT_DELIVERIES = 14;
export const STORY_CORNER_SIZE = 3;

export const STARTER_DRAWER: {
  readonly metal: readonly (readonly [MetalId, StockSizeId])[];
  readonly extras: readonly (readonly [ExtraId, number])[];
} = {
  metal: [["silver", "wide"]],
  extras: [["fine-chain", 2]],
};

export function isLineNameId(value: string): value is LineNameId {
  return LINE_NAME_IDS.some((id) => id === value);
}

export function loftOfferReady(state: GameState): boolean {
  return (
    state.career === "bench" &&
    state.reputation >= LOFT_REPUTATION &&
    state.ordersDelivered >= LOFT_DELIVERIES &&
    !state.story.seen.includes(LOFT_OFFER_BEAT) &&
    !state.story.queue.includes(LOFT_OFFER_BEAT)
  );
}

export function queueLoftOffer(state: GameState): GameState {
  return loftOfferReady(state) ? queueStoryTrigger(state, "loft-offer") : state;
}

export function canOpenLoft(state: GameState): ActionCheck {
  if (state.career !== "bench") return actionCheck(["The loft is already yours."]);
  const reasons: string[] = [];
  if (state.reputation < LOFT_REPUTATION) reasons.push(`The loft opens at reputation ${LOFT_REPUTATION}.`);
  if (state.ordersDelivered < LOFT_DELIVERIES)
    reasons.push(`Deliver ${LOFT_DELIVERIES} pieces first (${state.ordersDelivered} so far).`);
  return actionCheck(reasons);
}

export function loftLater(state: GameState): boolean {
  return state.career === "bench" && state.story.flags.includes(LOFT_LATER_FLAG);
}

export function drawStoryCorner(state: Pick<GameState, "log">, rng: RngState): [string[], RngState] {
  const grownUps = CLIENTS.filter((client) => client.child !== true).map((client) => client.id);
  const past = [...new Set(state.log.map((entry) => entry.clientId))].filter((id) => grownUps.includes(id));
  const pool = past.length >= STORY_CORNER_SIZE ? past : grownUps;
  return drawDistinct(rng, pool, STORY_CORNER_SIZE);
}

export function withStarterDrawer(stock: Stock): Stock {
  const metal = STARTER_DRAWER.metal.reduce(
    (current, [metalId, size]) => withMetal(current, metalId, size, 1),
    stock,
  );
  return STARTER_DRAWER.extras.reduce(
    (current, [extraId, count]) => withExtra(current, extraId, count),
    metal,
  );
}

export function collectionFields(
  state: GameState,
  seasonStartDay: number,
  lineNameId: LineNameId,
): GameState {
  const [storyCorner, rng] = drawStoryCorner(state, state.rng);
  return {
    ...state,
    rng,
    career: "collection",
    stock: withStarterDrawer(state.stock),
    collection: initialCollection(seasonStartDay, lineNameId, storyCorner),
    launch: INITIAL_LAUNCH,
  };
}

export function openLoft(state: GameState, lineNameId: LineNameId): GameState {
  if (!canOpenLoft(state).ok || !isLineNameId(lineNameId)) return state;
  const opened = collectionFields(state, weekEndDay(state.calendar.day) + 1, lineNameId);
  return queueStoryTrigger(opened, "loft-opened");
}
