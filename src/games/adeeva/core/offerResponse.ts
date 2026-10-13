import {
  acceptOffer as acceptBoardOffer,
  declineOffer as declineBoardOffer,
  offerAcceptIssue as boardAcceptIssue,
} from "../../../engine/gigBoard";
import type { GameState } from "./gameState";

export function offerAcceptIssue(state: GameState, offerId: string): string | null {
  return boardAcceptIssue(state.gigs, offerId);
}

export function acceptOffer(state: GameState, offerId: string): GameState {
  const gigs = acceptBoardOffer(state.gigs, offerId, state.calendar.day);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function declineOffer(state: GameState, offerId: string): GameState {
  const gigs = declineBoardOffer(state.gigs, offerId);
  return gigs === state.gigs ? state : { ...state, gigs };
}
