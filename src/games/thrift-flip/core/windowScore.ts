import { average } from "../../../engine/average";
import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { WindowDisplay } from "./boutique";
import { propById, seasonById } from "./catalog";
import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { WINDOW_WIDTH } from "./windowDisplay";

export const WINDOW_WEIGHTS = { theme: 0.35, colour: 0.25, balance: 0.2, leaves: 0.2 } as const;
export const WINDOW_BUZZ_STEP = 25;
const BALANCE_BY_THIRDS = [0, 33, 66, 100] as const;

export interface WindowScore {
  readonly theme: number;
  readonly colour: number;
  readonly balance: number;
  readonly leaves: number;
  readonly total: number;
  readonly buzz: number;
}

export function windowPieces(state: Pick<GameState, "rack">, window: WindowDisplay): RackPiece[] {
  return window.pieces.flatMap((entry) => state.rack.filter((piece) => piece.id === entry.pieceId));
}

function shareOf<T>(wanted: readonly T[], present: ReadonlySet<T>): number {
  if (wanted.length === 0) return 0;
  return Math.round((100 * wanted.filter((item) => present.has(item)).length) / wanted.length);
}

export function scoreWindow(state: Pick<GameState, "rack" | "boutique">, window: WindowDisplay): WindowScore {
  const boutique = state.boutique;
  const pieces = windowPieces(state, window);
  if (boutique === null || pieces.length + window.props.length === 0)
    return { theme: 0, colour: 0, balance: 0, leaves: 0, total: 0, buzz: 0 };
  const season = seasonById(boutique.season.themeId);
  const props = window.props.map((entry) => propById(entry.propId));
  const tags = new Set<StyleTag>([
    ...pieces.flatMap((piece) => piece.tags),
    ...props.flatMap((prop) => prop.tags),
  ]);
  const colours = new Set<ColourId>([
    ...pieces.flatMap((piece) => piece.colours),
    ...props.map((prop) => prop.colour),
  ]);
  const thirds = new Set(
    [...window.pieces, ...window.props].map((spot) => Math.min(2, Math.floor((3 * spot.x) / WINDOW_WIDTH))),
  );
  const theme = shareOf(season.tags, tags);
  const colour = shareOf(season.palette, colours);
  const balance = BALANCE_BY_THIRDS[thirds.size] ?? 100;
  const leaves = Math.round(average(pieces.map((piece) => piece.leaves)));
  const total = Math.round(
    WINDOW_WEIGHTS.theme * theme +
      WINDOW_WEIGHTS.colour * colour +
      WINDOW_WEIGHTS.balance * balance +
      WINDOW_WEIGHTS.leaves * leaves,
  );
  const buzz = pieces.length === 0 ? 0 : Math.round(total / WINDOW_BUZZ_STEP);
  return { theme, colour, balance, leaves, total, buzz };
}
