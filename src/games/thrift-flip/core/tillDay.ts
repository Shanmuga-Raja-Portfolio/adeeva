import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { hangingPieces } from "./rackRoom";
import { seasonTheme } from "./seasonCalendar";
import { scoreWindow } from "./windowScore";

export const TILL_BONUS_IDS = ["season-pick", "in-window", "showcase-piece"] as const;
export type TillBonusId = (typeof TILL_BONUS_IDS)[number];

export const TILL_BONUS_NAMES: Readonly<Record<TillBonusId, string>> = {
  "season-pick": "Season pick",
  "in-window": "In the window",
  "showcase-piece": "Showcase piece",
};

export const TILL_BONUS_SHARE = 1.1;
export const SEASON_RACK_PICKS = 3;
export const SEASON_RACK_BUZZ = 2;

type TillState = Pick<GameState, "boutique" | "rack">;

export function isSeasonPick(state: Pick<GameState, "boutique">, piece: RackPiece): boolean {
  const season = seasonTheme(state);
  return season !== null && piece.tags.some((tag) => season.tags.includes(tag));
}

export function tillBonuses(state: TillState, piece: RackPiece): TillBonusId[] {
  const boutique = state.boutique;
  if (boutique === null) return [];
  const bonuses: TillBonusId[] = [];
  if (isSeasonPick(state, piece)) bonuses.push("season-pick");
  if (boutique.window.pieces.some((entry) => entry.pieceId === piece.id)) bonuses.push("in-window");
  if (piece.showcaseSeason !== null && piece.showcaseSeason === boutique.season.number)
    bonuses.push("showcase-piece");
  return bonuses;
}

export function tillMultiplier(bonuses: readonly TillBonusId[]): number {
  return bonuses.reduce((product) => product * TILL_BONUS_SHARE, 1);
}

export function seasonRackBonus(state: TillState): number {
  if (state.boutique === null) return 0;
  const picks = hangingPieces(state).filter((piece) => isSeasonPick(state, piece)).length;
  return picks >= SEASON_RACK_PICKS ? SEASON_RACK_BUZZ : 0;
}

export function tillWindowBuzz(state: TillState): number {
  const boutique = state.boutique;
  return boutique === null ? 0 : scoreWindow(state, boutique.window).buzz;
}
