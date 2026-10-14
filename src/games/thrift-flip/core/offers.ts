import { clientIsOpen, freeClients } from "../../../engine/gigBoard";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import { TRAIT_STORY_TRIGGERS, type TraitId } from "../../../engine/trait";
import { BOUTIQUE_CLIENTS } from "../content/boutiqueClient";
import {
  CLIENTS,
  STARTER_CLIENT_IDS,
  TICKET_REGULAR_IDS,
  type ClientDef,
  type ClientPerson,
} from "../content/client";
import type { StoryTrigger } from "../content/storyBeat";
import { rollClientBrief, type Brief } from "./brief";
import { difficultyById, personById } from "./catalog";
import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";
import { addRegularTicket } from "./ticketBrief";

export {
  acceptStateOffer as acceptOffer,
  declineStateOffer as declineOffer,
  stateOfferAcceptIssue as offerAcceptIssue,
} from "../../../engine/gigBoardState";

export type OfferView = BoardOfferView<Brief, ClientPerson>;

const BOUTIQUE_POOL: readonly ClientDef[] = [
  ...BOUTIQUE_CLIENTS,
  ...CLIENTS.filter((client) => !TICKET_REGULAR_IDS.includes(client.id)),
];

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

function isFirstRoll(state: GameState): boolean {
  return state.calendar.day === 1 && state.gigs.nextGigNumber === 1;
}

export function eligibleClients(state: GameState): ClientDef[] {
  const pool = state.profile.career === "boutique" ? BOUTIQUE_POOL : CLIENTS;
  const open = freeClients(pool, state.gigs, (client) => clientIsEligible(client, state));
  return isFirstRoll(state) && state.profile.career === "stall"
    ? open.filter((client) => STARTER_CLIENT_IDS.includes(client.id))
    : open;
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, personById);
}

function traitArrival(state: GameState, trait: TraitId): StoryTrigger {
  if (state.profile.career === "boutique" && trait === "trendsetter") return "boutique-trendsetter";
  if (state.profile.career === "boutique" && trait === "charmer") return "boutique-charmer";
  return TRAIT_STORY_TRIGGERS[trait];
}

export function rollOffers(state: GameState): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const rolled = rollStateOffers(
    state,
    eligibleClients(state),
    (client, day, rng) => rollClientBrief(client, day, rng, minQualityBonus),
    (next, trait) => queueStoryTrigger(next, traitArrival(next, trait)),
  );
  return addRegularTicket(rolled);
}
