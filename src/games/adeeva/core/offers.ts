import { clientIsOpen, freeClients, rollOffers as rollBoardOffers } from "../../../engine/gigBoard";
import { CLIENTS, type ClientDef } from "../content/client";
import type { StoryTrigger } from "../content/storyBeat";
import type { TraitId } from "../../../engine/trait";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState, Offer } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export const TRAIT_STORY_TRIGGERS: Readonly<Record<TraitId, StoryTrigger>> = {
  dreamer: "trait-dreamer",
  perfectionist: "trait-perfectionist",
  trendsetter: "trait-trendsetter",
  charmer: "trait-charmer",
};

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
  const rolled = rollBoardOffers(state.gigs, eligibleClients(state), {
    day: state.calendar.day,
    buzz: state.buzz,
    rng: state.rng,
    rollBrief: (client, day, rng) => rollClientBrief(client, day, rng, minQualityBonus),
  });
  if (rolled.board === state.gigs) return state;
  const next: GameState = { ...state, rng: rolled.rng, gigs: rolled.board };
  const gatedArrived = rolled.arrived.some((client) => client.traitGate === state.profile.trait);
  return gatedArrived ? queueStoryTrigger(next, TRAIT_STORY_TRIGGERS[state.profile.trait]) : next;
}
