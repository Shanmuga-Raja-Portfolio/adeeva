import type { DifficultyId } from "./difficulty";
import type { RngState } from "./rng";
import { drawDistinct } from "./rngDraw";
import type { TraitId } from "./trait";

export const MAX_PENDING_OFFERS = 4;
export const OFFER_LIFETIME_DAYS = 2;
export const BUZZ_PER_EXTRA_OFFER = 34;
export const MAX_OFFERS_PER_DAY = 3;
export const MAX_ACTIVE_GIGS = 3;
export const LATE_GRACE_DAYS = 3;

export interface DatedBrief {
  readonly deadlineDay: number;
}

export interface Offer<B> {
  readonly id: string;
  readonly clientId: string;
  readonly brief: B;
  readonly expiresDay: number;
}

export interface Gig<B> {
  readonly id: string;
  readonly clientId: string;
  readonly brief: B;
  readonly acceptedDay: number;
}

export interface LapsedGig {
  readonly gigId: string;
  readonly clientId: string;
  readonly day: number;
  readonly reputation: number;
}

export interface GigBoard<B> {
  readonly offers: readonly Offer<B>[];
  readonly active: readonly Gig<B>[];
  readonly lapsed: readonly LapsedGig[];
  readonly nextGigNumber: number;
}

export interface GatedClient {
  readonly id: string;
  readonly minReputation: number;
  readonly traitGate?: TraitId;
}

export interface OfferRoll<C, B> {
  readonly day: number;
  readonly buzz: number;
  readonly rng: RngState;
  readonly rollBrief: (client: C, day: number, rng: RngState) => [B, RngState];
}

export interface RolledOffers<C, B> {
  readonly board: GigBoard<B>;
  readonly rng: RngState;
  readonly arrived: readonly C[];
}

export interface Lapse<B> {
  readonly board: GigBoard<B>;
  readonly lapsedIds: ReadonlySet<string>;
  readonly reputation: number;
}

export function offerCountForBuzz(buzz: number): number {
  return Math.min(MAX_OFFERS_PER_DAY, 1 + Math.floor(Math.max(0, buzz) / BUZZ_PER_EXTRA_OFFER));
}

export function clientIsOpen(client: GatedClient, reputation: number, trait: TraitId): boolean {
  return reputation >= client.minReputation && (client.traitGate === undefined || client.traitGate === trait);
}

export function freeClients<C extends { readonly id: string }, B>(
  clients: readonly C[],
  board: GigBoard<B>,
  isOpen: (client: C) => boolean,
): C[] {
  const busy = new Set([
    ...board.offers.map((offer) => offer.clientId),
    ...board.active.map((gig) => gig.clientId),
  ]);
  return clients.filter((client) => isOpen(client) && !busy.has(client.id));
}

export function rollOffers<C extends { readonly id: string }, B>(
  board: GigBoard<B>,
  pool: readonly C[],
  roll: OfferRoll<C, B>,
): RolledOffers<C, B> {
  const room = MAX_PENDING_OFFERS - board.offers.length;
  const count = Math.min(room, offerCountForBuzz(roll.buzz));
  if (count <= 0 || pool.length === 0) return { board, rng: roll.rng, arrived: [] };
  const [clients, afterPick] = drawDistinct(roll.rng, pool, count);
  let rng = afterPick;
  let nextGigNumber = board.nextGigNumber;
  const offers: Offer<B>[] = clients.map((client) => {
    const [brief, afterBrief] = roll.rollBrief(client, roll.day, rng);
    rng = afterBrief;
    const offer = {
      id: `gig-${nextGigNumber}`,
      clientId: client.id,
      brief,
      expiresDay: roll.day + OFFER_LIFETIME_DAYS,
    };
    nextGigNumber += 1;
    return offer;
  });
  return { board: { ...board, offers: [...board.offers, ...offers], nextGigNumber }, rng, arrived: clients };
}

export function offerAcceptIssue<B>(board: GigBoard<B>, offerId: string): string | null {
  if (!board.offers.some((entry) => entry.id === offerId)) return "That offer is no longer available.";
  if (board.active.length >= MAX_ACTIVE_GIGS)
    return `You already have ${MAX_ACTIVE_GIGS} gigs on the go. Finish one first.`;
  return null;
}

export function acceptOffer<B>(board: GigBoard<B>, offerId: string, day: number): GigBoard<B> {
  const offer = board.offers.find((entry) => entry.id === offerId);
  if (offer === undefined || offerAcceptIssue(board, offerId) !== null) return board;
  return {
    ...board,
    offers: board.offers.filter((entry) => entry.id !== offerId),
    active: [
      ...board.active,
      { id: offer.id, clientId: offer.clientId, brief: offer.brief, acceptedDay: day },
    ],
  };
}

export function declineOffer<B>(board: GigBoard<B>, offerId: string): GigBoard<B> {
  if (!board.offers.some((entry) => entry.id === offerId)) return board;
  return { ...board, offers: board.offers.filter((entry) => entry.id !== offerId) };
}

export function expireOffers<B>(board: GigBoard<B>, day: number): GigBoard<B> {
  const offers = board.offers.filter((offer) => offer.expiresDay >= day);
  return offers.length === board.offers.length ? board : { ...board, offers };
}

export function isGigLate<B extends DatedBrief>(gig: Gig<B>, day: number): boolean {
  return day > gig.brief.deadlineDay;
}

export function gigLapseDay<B extends DatedBrief>(gig: Gig<B>): number {
  return gig.brief.deadlineDay + LATE_GRACE_DAYS + 1;
}

export function lapseReputation(difficulty: DifficultyId, trait: TraitId): number {
  if (difficulty === "challenging") return -3;
  if (difficulty === "standard") return trait === "charmer" ? 0 : -1;
  return 0;
}

export function lapseOverdue<B extends DatedBrief>(
  board: GigBoard<B>,
  day: number,
  difficulty: DifficultyId,
  trait: TraitId,
  forgiven: (gig: Gig<B>) => boolean = () => false,
): Lapse<B> | null {
  if (difficulty === "relaxed") return null;
  const overdue = board.active.filter((gig) => day >= gigLapseDay(gig));
  if (overdue.length === 0) return null;
  const penalty = lapseReputation(difficulty, trait);
  const lapsedIds = new Set(overdue.map((gig) => gig.id));
  const lapsed: LapsedGig[] = overdue.map((gig) => ({
    gigId: gig.id,
    clientId: gig.clientId,
    day,
    reputation: forgiven(gig) ? 0 : penalty,
  }));
  return {
    board: {
      ...board,
      active: board.active.filter((gig) => !lapsedIds.has(gig.id)),
      lapsed: [...board.lapsed, ...lapsed],
    },
    lapsedIds,
    reputation: lapsed.reduce((sum, entry) => sum + entry.reputation, 0),
  };
}
