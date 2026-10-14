import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, type ClientDef } from "../content/client";
import { clientById, difficultyById, dishById } from "./catalog";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import { rollOrderBrief, type OrderBrief } from "./orderBrief";
import { queueTraitBeat } from "./storyQueue";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

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
