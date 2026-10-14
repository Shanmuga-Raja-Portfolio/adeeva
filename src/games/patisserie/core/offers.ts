import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, FIRST_DAY_CLIENT_IDS, GUIDED_CLIENT_ID, type ClientDef } from "../content/client";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";
import type { StoryTrigger } from "../content/storyBeat";
import type { TraitId } from "../../../engine/trait";

const CLIENT_TRIGGERS: Readonly<Record<string, StoryTrigger>> = {
  wren: "client-wren",
  "mr-quill": "client-quill",
};

const ARRIVAL_TRAITS: readonly TraitId[] = ["trendsetter", "charmer"];

function traitArrival(state: GameState, trait: TraitId): GameState {
  return ARRIVAL_TRAITS.includes(trait) ? queueTraitBeat(state, trait) : state;
}

function clientArrivals(before: GameState, after: GameState): GameState {
  const known = new Set(before.gigs.offers.map((offer) => offer.id));
  return after.gigs.offers
    .filter((offer) => !known.has(offer.id))
    .reduce((state, offer) => {
      const trigger = CLIENT_TRIGGERS[offer.clientId];
      return trigger === undefined ? state : queueStoryTrigger(state, trigger);
    }, after);
}

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.calendar.day === 1 && state.career === "bakery") {
    if (state.guide) return client.id === GUIDED_CLIENT_ID;
    return FIRST_DAY_CLIENT_IDS.includes(client.id);
  }
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

export function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

export function rollOffers(state: GameState): GameState {
  const roll = {
    minQualityBonus: difficultyById(state.profile.difficulty).minQualityBonus,
    hotTags: state.trends.current,
  };
  const rolled = rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, { ...roll, day }, rng),
    traitArrival,
  );
  return rolled === state ? state : clientArrivals(state, rolled);
}
