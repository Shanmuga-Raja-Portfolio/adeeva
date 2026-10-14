import type { Boutique } from "./boutique";
import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { rackIsFull, shelfIds } from "./rackRoom";
import { isStallDay } from "./stallCalendar";

export const SHELF_SIZE = 3;

function shelfOpenIssue(state: GameState): string | null {
  const boutique = state.boutique;
  if (boutique === null) return "The show shelf is at the boutique.";
  if (isStallDay(state.calendar.day)) return "Till Day is for selling. Move pieces tomorrow.";
  if (boutique.season.showcase !== null) return "This season's show is over. A new shelf comes next season.";
  return null;
}

export function madeThisSeason(state: Pick<GameState, "boutique">, piece: RackPiece): boolean {
  const season = state.boutique?.season ?? null;
  return season !== null && piece.madeDay >= season.startDay;
}

export function shelfIssue(state: GameState, pieceId: string): string | null {
  const open = shelfOpenIssue(state);
  if (open !== null) return open;
  const piece = state.rack.find((entry) => entry.id === pieceId);
  if (piece === undefined) return "That piece isn't on the rack.";
  if (shelfIds(state).has(pieceId)) return "That piece is already on the show shelf.";
  if (!madeThisSeason(state, piece)) return "Only pieces made this season can go in the show.";
  if (shelfIds(state).size >= SHELF_SIZE) return `The show shelf holds ${SHELF_SIZE} pieces.`;
  return null;
}

function withCapsule(state: GameState, boutique: Boutique, capsule: readonly string[]): GameState {
  const window = {
    ...boutique.window,
    pieces: boutique.window.pieces.filter((entry) => !capsule.includes(entry.pieceId)),
  };
  return { ...state, boutique: { ...boutique, window, season: { ...boutique.season, capsule } } };
}

export function shelvePiece(state: GameState, pieceId: string): GameState {
  const boutique = state.boutique;
  if (boutique === null || shelfIssue(state, pieceId) !== null) return state;
  return withCapsule(state, boutique, [...boutique.season.capsule, pieceId]);
}

export function unshelveIssue(state: GameState, pieceId: string): string | null {
  const open = shelfOpenIssue(state);
  if (open !== null) return open;
  if (!shelfIds(state).has(pieceId)) return "That piece isn't on the show shelf.";
  return rackIsFull(state) ? "The rack is full. Sell a piece on Till Day first." : null;
}

export function unshelvePiece(state: GameState, pieceId: string): GameState {
  const boutique = state.boutique;
  if (boutique === null || unshelveIssue(state, pieceId) !== null) return state;
  return withCapsule(
    state,
    boutique,
    boutique.season.capsule.filter((id) => id !== pieceId),
  );
}

export function suggestedShelf(state: GameState): RackPiece[] {
  const shelf = shelfIds(state);
  const room = SHELF_SIZE - shelf.size;
  if (room <= 0) return [];
  return state.rack
    .filter((piece) => !shelf.has(piece.id) && madeThisSeason(state, piece))
    .sort((a, b) => b.quality - a.quality || a.id.localeCompare(b.id))
    .slice(0, room);
}

export function fillShelf(state: GameState): GameState {
  const boutique = state.boutique;
  const suggested = suggestedShelf(state);
  if (boutique === null || shelfOpenIssue(state) !== null || suggested.length === 0) return state;
  return withCapsule(state, boutique, [...boutique.season.capsule, ...suggested.map((piece) => piece.id)]);
}
