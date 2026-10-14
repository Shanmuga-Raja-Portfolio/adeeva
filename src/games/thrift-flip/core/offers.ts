import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { TRAIT_STORY_TRIGGERS } from "../../../engine/trait";
import { CLIENTS, STARTER_CLIENT_IDS, type ClientDef } from "../content/client";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

function isFirstRoll(state: GameState): boolean {
  return state.calendar.day === 1 && state.gigs.nextGigNumber === 1;
}

export function eligibleClients(state: GameState): ClientDef[] {
  const open = freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
  return isFirstRoll(state) ? open.filter((client) => STARTER_CLIENT_IDS.includes(client.id)) : open;
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

export function rollOffers(state: GameState): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  return rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, day, rng, minQualityBonus),
    (next, trait) => queueStoryTrigger(next, TRAIT_STORY_TRIGGERS[trait]),
  );
}
