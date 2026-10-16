import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export const OFFER_REPUTATION = 34;
export const OFFER_MAKEOVERS = 14;
export const OFFER_SHOW_HOMES = 1;
export const OFFER_BEAT_ID = "is-larkspur-offer";

export function showHomesDone(state: Pick<GameState, "log">): number {
  return state.log.filter((entry) => entry.openHouse !== null).length;
}

export function canOpenLarkspur(state: GameState): ActionCheck {
  const reasons: string[] = [];
  if (state.career !== "loft" || state.larkspur !== null) reasons.push("Larkspur Close is already yours.");
  if (state.reputation < OFFER_REPUTATION) reasons.push(`Reach reputation ${OFFER_REPUTATION} first.`);
  if (state.ordersDelivered < OFFER_MAKEOVERS) reasons.push(`Finish ${OFFER_MAKEOVERS} makeovers first.`);
  if (showHomesDone(state) < OFFER_SHOW_HOMES) reasons.push("Open one Bellwind show home first.");
  return actionCheck(reasons);
}

export function larkspurOfferReady(state: GameState): boolean {
  return canOpenLarkspur(state).ok && !state.story.seen.includes(OFFER_BEAT_ID);
}

export function checkLarkspurOffer(state: GameState): GameState {
  return larkspurOfferReady(state) ? queueStoryTrigger(state, "larkspur-offer") : state;
}
