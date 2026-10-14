import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import { rollStateOffers } from "../../../engine/gigBoardState";
import { CLIENTS, type ClientDef } from "../content/client";
import { TRAIT_STORY_TRIGGERS } from "../../../engine/trait";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState, Offer } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export interface OfferView {
  readonly offer: Offer;
  readonly client: ClientDef;
}

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  const { profile } = state;
  return client.careers.includes(profile.career) && clientIsOpen(client, state.reputation, profile.trait);
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
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  return rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, day, rng, minQualityBonus),
    (next, trait) => queueStoryTrigger(next, TRAIT_STORY_TRIGGERS[trait]),
  );
}
