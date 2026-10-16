import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, FIRST_CLIENT_ID, type ClientDef } from "../content/client";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { isFairDay } from "./seasonCalendar";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.calendar.day === 1) return client.id === FIRST_CLIENT_ID;
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

export function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

export const FIRST_OFFER_BEATS: Readonly<Record<string, "esi-offer" | "kit-zara-offer">> = {
  "grandma-esi": "esi-offer",
  "kit-and-zara": "kit-zara-offer",
};

function shiftedOffFairDay(state: GameState): GameState {
  if (!state.gigs.offers.some((offer) => isFairDay(state, offer.brief.deadlineDay))) return state;
  const offers = state.gigs.offers.map((offer) =>
    isFairDay(state, offer.brief.deadlineDay)
      ? { ...offer, brief: { ...offer.brief, deadlineDay: offer.brief.deadlineDay + 1 } }
      : offer,
  );
  return { ...state, gigs: { ...state.gigs, offers } };
}

function firstOfferBeats(state: GameState): GameState {
  return state.gigs.offers.reduce((next, offer) => {
    const trigger = Object.hasOwn(FIRST_OFFER_BEATS, offer.clientId)
      ? FIRST_OFFER_BEATS[offer.clientId]
      : undefined;
    return trigger === undefined ? next : queueStoryTrigger(next, trigger);
  }, state);
}

export function rollOffers(state: GameState): GameState {
  const bonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const rolled = rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, day, bonus, rng),
    queueTraitBeat,
  );
  return rolled === state ? state : firstOfferBeats(shiftedOffFairDay(rolled));
}
