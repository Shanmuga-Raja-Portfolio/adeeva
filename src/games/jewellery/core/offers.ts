import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { CLIENTS, FIRST_CLIENT_ID, type ClientDef, type PersonDef } from "../content/client";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import type { StoryTrigger } from "../content/storyBeat";
import { isLanternNight } from "./seasonCalendar";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, PersonDef>;

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

const CLIENT_BEATS: Readonly<Record<string, StoryTrigger>> = {
  "mr-abebe": "abebe-offer",
  zara: "zara-offer",
};

function shiftedBrief(state: GameState, brief: Brief): Brief {
  return isLanternNight(state, brief.deadlineDay) ? { ...brief, deadlineDay: brief.deadlineDay + 1 } : brief;
}

export function rollOffers(state: GameState): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const rolled = rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => {
      const [brief, next] = rollClientBrief(client, { day, minQualityBonus }, rng);
      return [shiftedBrief(state, brief), next];
    },
    queueTraitBeat,
  );
  const arrived = rolled.gigs.offers.filter(
    (offer) => !state.gigs.offers.some((before) => before.id === offer.id),
  );
  return arrived.reduce((current, offer) => {
    const trigger = CLIENT_BEATS[offer.clientId];
    return trigger === undefined ? current : queueStoryTrigger(current, trigger);
  }, rolled);
}
