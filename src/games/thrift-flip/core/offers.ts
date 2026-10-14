import {
  acceptOffer as acceptBoardOffer,
  clientIsOpen,
  declineOffer as declineBoardOffer,
  freeClients,
  offerAcceptIssue as boardAcceptIssue,
} from "../../../engine/gigBoard";
import { rollStateOffers } from "../../../engine/gigBoardState";
import { TRAIT_STORY_TRIGGERS } from "../../../engine/trait";
import { CLIENTS, STARTER_CLIENT_IDS, type ClientDef } from "../content/client";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState, Offer } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export interface OfferView {
  readonly offer: Offer;
  readonly client: ClientDef;
}

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
  return state.gigs.offers.flatMap((offer) => {
    const client = clientById(offer.clientId);
    return client === undefined ? [] : [{ offer, client }];
  });
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

export function offerAcceptIssue(state: GameState, offerId: string): string | null {
  return boardAcceptIssue(state.gigs, offerId);
}

export function acceptOffer(state: GameState, offerId: string): GameState {
  const gigs = acceptBoardOffer(state.gigs, offerId, state.calendar.day);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function declineOffer(state: GameState, offerId: string): GameState {
  const gigs = declineBoardOffer(state.gigs, offerId);
  return gigs === state.gigs ? state : { ...state, gigs };
}
