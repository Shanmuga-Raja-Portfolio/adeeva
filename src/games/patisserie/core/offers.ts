import {
  acceptOffer as acceptBoardOffer,
  clientIsOpen,
  declineOffer as declineBoardOffer,
  freeClients,
  offerAcceptIssue as boardAcceptIssue,
} from "../../../engine/gigBoard";
import { rollStateOffers } from "../../../engine/gigBoardState";
import { CLIENTS, FIRST_DAY_CLIENT_IDS, GUIDED_CLIENT_ID, type ClientDef } from "../content/client";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState, Offer } from "./gameState";
import { queueTraitBeat } from "./storyQueue";

export interface OfferView {
  readonly offer: Offer;
  readonly client: ClientDef;
}

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.calendar.day === 1) {
    if (state.guide) return client.id === GUIDED_CLIENT_ID;
    return FIRST_DAY_CLIENT_IDS.includes(client.id);
  }
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

export function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return state.gigs.offers.flatMap((offer) => {
    const client = clientById(offer.clientId);
    return client === undefined ? [] : [{ offer, client }];
  });
}

export function rollOffers(state: GameState): GameState {
  const roll = {
    minQualityBonus: difficultyById(state.profile.difficulty).minQualityBonus,
    hotTags: state.trends.current,
  };
  return rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, { ...roll, day }, rng),
    queueTraitBeat,
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
