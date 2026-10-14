import type { GigBoard } from "./gigBoard";

export function arrivedClientIds<B>(before: GigBoard<B>, after: GigBoard<B>): string[] {
  const known = new Set(before.offers.map((offer) => offer.id));
  return after.offers.filter((offer) => !known.has(offer.id)).map((offer) => offer.clientId);
}

export function vanishedOfferCount<B>(before: GigBoard<B>, after: GigBoard<B>): number {
  const kept = new Set(after.offers.map((offer) => offer.id));
  return before.offers.filter(
    (offer) => !kept.has(offer.id) && !after.active.some((gig) => gig.id === offer.id),
  ).length;
}

export function lapsedClientIds<B>(before: GigBoard<B>, after: GigBoard<B>): string[] {
  return after.lapsed.slice(before.lapsed.length).map((entry) => entry.clientId);
}
