import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  acceptStateOffer,
  rollStateOffers,
  stateOfferAcceptIssue,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, type ClientDef } from "../content/client";
import { clientById, difficultyById, dishById } from "./catalog";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import { rollOrderBrief, type OrderBrief } from "./orderBrief";
import { queueTraitBeat } from "./storyQueue";

export { declineStateOffer as declineOffer } from "../../../engine/gigBoardState";

export const SMALL_KITCHEN_ORDERS = 1;

export function offerAcceptIssue(state: GameState, offerId: string): string | null {
  const kind = state.path?.kind;
  if ((kind === "truck" || kind === "tv") && state.gigs.active.length >= SMALL_KITCHEN_ORDERS)
    return "A small kitchen takes one order at a time. Finish the open one first.";
  return stateOfferAcceptIssue(state, offerId);
}

export function acceptOffer(state: GameState, offerId: string): GameState {
  return offerAcceptIssue(state, offerId) === null ? acceptStateOffer(state, offerId) : state;
}

export type OfferView = BoardOfferView<OrderBrief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.rung !== "head") return false;
  const dishId = client.order.dishId;
  if (dishId !== null && !isDishUnlocked(state.mastery, dishById(dishId))) return false;
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

export function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

export function rollOffers(state: GameState): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  return rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) =>
      rollOrderBrief(client, { day, minQualityBonus, hotTags: state.trends.current }, rng),
    queueTraitBeat,
  );
}
