import { CLIENTS, type ClientDef } from "../content/client";
import type { StoryTrigger } from "../content/storyBeat";
import type { TraitId } from "../content/trait";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { GameState, Offer } from "./gameState";
import { drawDistinct } from "./rngDraw";
import { queueStoryTrigger } from "./storyQueue";

export const MAX_PENDING_OFFERS = 4;
export const OFFER_LIFETIME_DAYS = 2;
export const BUZZ_PER_EXTRA_OFFER = 34;
export const MAX_OFFERS_PER_DAY = 3;

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

export function offerCountForBuzz(buzz: number): number {
  return Math.min(MAX_OFFERS_PER_DAY, 1 + Math.floor(Math.max(0, buzz) / BUZZ_PER_EXTRA_OFFER));
}

export function clientIsEligible(client: ClientDef, state: GameState): boolean {
  const { profile } = state;
  return (
    client.careers.includes(profile.career) &&
    state.reputation >= client.minReputation &&
    (client.traitGate === undefined || client.traitGate === profile.trait)
  );
}

export function eligibleClients(state: GameState): ClientDef[] {
  const busy = new Set([
    ...state.gigs.offers.map((offer) => offer.clientId),
    ...state.gigs.active.map((gig) => gig.clientId),
  ]);
  return CLIENTS.filter((client) => clientIsEligible(client, state) && !busy.has(client.id));
}

export function offersFor(state: GameState): OfferView[] {
  return state.gigs.offers.flatMap((offer) => {
    const client = clientById(offer.clientId);
    return client === undefined ? [] : [{ offer, client }];
  });
}

export function rollOffers(state: GameState): GameState {
  const room = MAX_PENDING_OFFERS - state.gigs.offers.length;
  const count = Math.min(room, offerCountForBuzz(state.buzz));
  if (count <= 0) return state;
  const [clients, afterPick] = drawDistinct(state.rng, eligibleClients(state), count);
  let rng = afterPick;
  let nextGigNumber = state.gigs.nextGigNumber;
  const day = state.calendar.day;
  const minQualityBonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const offers: Offer[] = clients.map((client) => {
    const [brief, afterBrief] = rollClientBrief(client, day, rng, minQualityBonus);
    rng = afterBrief;
    const offer = {
      id: `gig-${nextGigNumber}`,
      clientId: client.id,
      brief,
      expiresDay: day + OFFER_LIFETIME_DAYS,
    };
    nextGigNumber += 1;
    return offer;
  });
  const rolled: GameState = {
    ...state,
    rng,
    gigs: { ...state.gigs, offers: [...state.gigs.offers, ...offers], nextGigNumber },
  };
  const gatedArrived = clients.some((client) => client.traitGate === state.profile.trait);
  return gatedArrived ? queueStoryTrigger(rolled, TRAIT_STORY_TRIGGERS[state.profile.trait]) : rolled;
}
