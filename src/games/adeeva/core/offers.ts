import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, type ClientDef } from "../content/client";
import { TRAIT_STORY_TRIGGERS } from "../../../engine/trait";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export type OfferView = BoardOfferView<Brief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  const { profile } = state;
  return client.careers.includes(profile.career) && clientIsOpen(client, state.reputation, profile.trait);
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
    (client, day, rng) => rollClientBrief(client, day, rng, minQualityBonus),
    (next, trait) => queueStoryTrigger(next, TRAIT_STORY_TRIGGERS[trait]),
  );
}
