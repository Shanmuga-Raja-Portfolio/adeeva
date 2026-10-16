import { BUZZ_PER_EXTRA_OFFER, clientIsOpen, freeClients, offerCountForBuzz } from "../../../engine/gigBoard";
import { arrivedClientIds } from "../../../engine/gigBoardChanges";
import {
  rollStateOffers,
  stateOfferViews,
  type OfferView as BoardOfferView,
} from "../../../engine/gigBoardState";
import type { TraitId } from "../../../engine/trait";
import { weekNumber } from "../../../engine/weekday";
import { DAYS_PER_WEEK } from "../../../engine/week";
import { CLIENTS, FIRST_CLIENT_ID, SHOW_HOME_CLIENT_ID, type ClientDef } from "../content/client";
import type { StoryTrigger } from "../content/storyBeat";
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

export const CATCH_UP_WEEKDAY = 3;

const LETTER_BEATS: Readonly<Record<string, StoryTrigger>> = {
  solenne: "letter-solenne",
  "the-hollins": "letter-hollins",
};

const LETTER_TRAITS: readonly TraitId[] = ["dreamer", "perfectionist"];

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  if (state.calendar.day === 1) return client.id === FIRST_CLIENT_ID;
  if (client.showHome && state.career !== "loft") return false;
  if (client.showHome && state.showHomeWeek === weekNumber(state.calendar.day)) return false;
  return clientIsOpen(client, state.reputation, state.profile.trait);
}

function eligibleClients(state: GameState): ClientDef[] {
  return freeClients(CLIENTS, state.gigs, (client) => clientIsEligible(client, state));
}

export function offersFor(state: GameState): OfferView[] {
  return stateOfferViews(state, clientById);
}

function weekday(day: number): number {
  return ((day - 1) % DAYS_PER_WEEK) + 1;
}

export function showHomeCatchUp(state: GameState): boolean {
  const bellwind = clientById(SHOW_HOME_CLIENT_ID);
  if (bellwind === undefined || state.career !== "loft") return false;
  if (weekday(state.calendar.day) < CATCH_UP_WEEKDAY) return false;
  return eligibleClients(state).some((client) => client.id === SHOW_HOME_CLIENT_ID);
}

function queueArrivals(before: GameState, after: GameState): GameState {
  const arrived = arrivedClientIds(before.gigs, after.gigs);
  let next = after;
  if (arrived.includes(SHOW_HOME_CLIENT_ID))
    next = queueStoryTrigger({ ...next, showHomeWeek: weekNumber(next.calendar.day) }, "first-show-home");
  for (const id of arrived) {
    const trigger = LETTER_BEATS[id];
    const client = clientById(id);
    if (trigger !== undefined && client?.traitGate === next.profile.trait)
      next = queueStoryTrigger(next, trigger);
  }
  return next;
}

function traitArrival(state: GameState, trait: TraitId): GameState {
  return LETTER_TRAITS.includes(trait) ? queueTraitBeat(state, trait) : state;
}

function rollFrom(state: GameState, pool: readonly ClientDef[], buzz: number): GameState {
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const hotTags = state.trends.current;
  const rolled = rollStateOffers(
    { ...state, buzz },
    pool,
    (client, day, rng) => rollClientBrief(client, { day, minQualityBonus, hotTags }, rng),
    traitArrival,
  );
  return rolled.buzz === state.buzz ? rolled : { ...rolled, buzz: state.buzz };
}

export function rollOffers(state: GameState): GameState {
  const pool = eligibleClients(state);
  if (!showHomeCatchUp(state)) return queueArrivals(state, rollFrom(state, pool, state.buzz));
  const count = offerCountForBuzz(state.buzz);
  const bellwind = pool.filter((client) => client.id === SHOW_HOME_CLIENT_ID);
  const first = rollFrom(state, bellwind, 0);
  const others = pool.filter((client) => client.id !== SHOW_HOME_CLIENT_ID);
  const rest = count > 1 ? rollFrom(first, others, (count - 2) * BUZZ_PER_EXTRA_OFFER) : first;
  return queueArrivals(state, rest);
}
