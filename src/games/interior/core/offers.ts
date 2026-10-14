import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import { arrivedClientIds } from "../../../engine/gigBoardChanges";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { weekNumber } from "../../../engine/weekday";
import { CLIENTS, FIRST_CLIENT_ID, SHOW_HOME_CLIENT_ID, type ClientDef } from "../content/client";
import { rollClientBrief, type Brief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, ClientDef>;

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.calendar.day === 1) return client.id === FIRST_CLIENT_ID;
  if (client.showHome && state.showHomeWeek === weekNumber(state.calendar.day)) return false;
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

function showHomeArrived(before: GameState, after: GameState): boolean {
  return arrivedClientIds(before.gigs, after.gigs).includes(SHOW_HOME_CLIENT_ID);
}

export function rollOffers(state: GameState): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const hotTags = state.trends.current;
  const rolled = rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, { day, minQualityBonus, hotTags }, rng),
    queueTraitBeat,
  );
  if (!showHomeArrived(state, rolled)) return rolled;
  return queueStoryTrigger({ ...rolled, showHomeWeek: weekNumber(rolled.calendar.day) }, "first-show-home");
}
