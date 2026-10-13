import type { GameState } from "./gameState";

export const MAX_ACTIVE_GIGS = 3;

export function offerAcceptIssue(state: GameState, offerId: string): string | null {
  const offer = state.gigs.offers.find((entry) => entry.id === offerId);
  if (offer === undefined) return "That offer is no longer available.";
  if (state.gigs.active.length >= MAX_ACTIVE_GIGS)
    return `You already have ${MAX_ACTIVE_GIGS} gigs on the go. Finish one first.`;
  return null;
}

export function acceptOffer(state: GameState, offerId: string): GameState {
  const offer = state.gigs.offers.find((entry) => entry.id === offerId);
  if (offer === undefined || offerAcceptIssue(state, offerId) !== null) return state;
  return {
    ...state,
    gigs: {
      ...state.gigs,
      offers: state.gigs.offers.filter((entry) => entry.id !== offerId),
      active: [
        ...state.gigs.active,
        { id: offer.id, clientId: offer.clientId, brief: offer.brief, acceptedDay: state.calendar.day },
      ],
    },
  };
}

export function declineOffer(state: GameState, offerId: string): GameState {
  if (!state.gigs.offers.some((entry) => entry.id === offerId)) return state;
  return {
    ...state,
    gigs: { ...state.gigs, offers: state.gigs.offers.filter((entry) => entry.id !== offerId) },
  };
}
