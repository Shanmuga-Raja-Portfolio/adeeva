import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import type { DifficultyId } from "../../../engine/difficulty";
import { paletteCohesion } from "../../../engine/paletteCohesion";
import type { RewardLine } from "../../../engine/reward";
import type { RngState } from "../../../engine/rng";
import { drawItem } from "../../../engine/rngDraw";
import { roundShare } from "../../../engine/roundShare";
import { starsForScore } from "../../../engine/score";
import { applyStanding } from "../../../engine/standing";
import { trendMatches } from "../../../engine/trendMarket";
import type { TraitId } from "../../../engine/trait";
import { isWeekEnd } from "../../../engine/week";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import { THEME_IDS, type MarketThemeDef, type ThemeId } from "../content/marketTheme";
import { isTrayClothId, TRAY_SIGNS, TRAY_SLOTS, type TrayClothId } from "../content/stallTray";
import { productById, themeById } from "./catalog";
import type { GameState } from "./gameState";
import { addKeepsakes, type KeepsakeEntry } from "./keepsakeCase";
import type { StallPiece } from "./stallBox";

export const MARKET_HOURS = 3;
const CENTRE_SLOT = 1;
const SALES_STEPS: readonly (readonly [number, number])[] = [
  [75, 3],
  [55, 2],
  [35, 1],
];
const REPUTATION_SCORE = 75;
const DREAMER_SHARE = 0.15;
const TRENDSETTER_SHARE = 0.1;
const CHARMER_SHARE = 0.1;
const DREAMER_COLOURS = 3;

interface TrayChoice {
  readonly slots: readonly (string | null)[];
  readonly cloth: TrayClothId;
  readonly sign: number;
}

export interface SoldPiece {
  readonly pieceId: string;
  readonly coins: number;
}

export interface MarketSummary {
  readonly day: number;
  readonly themeId: ThemeId;
  readonly score: number;
  readonly cloth: TrayClothId;
  readonly sign: number;
  readonly slots: readonly (StallPiece | null)[];
  readonly sold: readonly SoldPiece[];
  readonly lines: readonly RewardLine[];
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export interface MarketState {
  readonly shownDay: number;
  readonly last: MarketSummary | null;
}

export const FRESH_MARKET: MarketState = { shownDay: 0, last: null };

interface ShopperScore {
  readonly avgQuality: number;
  readonly themeShare: number;
  readonly cohesion: number;
  readonly centreBonus: number;
  readonly score: number;
}

export function isMarketDay(day: number): boolean {
  return isWeekEnd(day);
}

export function rollNextTheme(current: ThemeId, rng: RngState): [ThemeId, RngState] {
  return drawItem(
    rng,
    THEME_IDS.filter((id) => id !== current),
  );
}

export function fitsTheme(piece: StallPiece, theme: MarketThemeDef): boolean {
  return (
    piece.tags.some((tag) => theme.tags.includes(tag)) &&
    piece.colours.some((colour) => theme.palette.includes(colour))
  );
}

export function shopperScore(slots: readonly (StallPiece | null)[], theme: MarketThemeDef): ShopperScore {
  const avgQuality = average(slots.map((piece) => piece?.quality ?? 0));
  const shown = slots.filter((piece): piece is StallPiece => piece !== null);
  const themeShare = roundShare(shown.filter((piece) => fitsTheme(piece, theme)).length / slots.length);
  const cohesion = roundShare(paletteCohesion(shown.map((piece) => piece.colours)));
  const centre = slots[CENTRE_SLOT] ?? null;
  const centreBonus = centre !== null && shown.every((piece) => piece.quality <= centre.quality) ? 1 : 0;
  const score = Math.round(0.45 * avgQuality + 30 * themeShare + 20 * cohesion + 5 * centreBonus);
  return { avgQuality, themeShare, cohesion, centreBonus, score: clamp(score, 0, 100) };
}

export function salesCount(score: number, difficulty: DifficultyId, shown: number): number {
  const step = SALES_STEPS.find(([threshold]) => score >= threshold);
  const count = step === undefined ? 0 : step[1];
  const floor = difficulty === "relaxed" ? 1 : 0;
  return clamp(count, floor, shown);
}

export function salePrice(piece: StallPiece, score: number): number {
  return Math.round(productById(piece.look.productId).stallBase * (0.6 + (0.6 * score) / 100));
}

function traitLines(
  trait: TraitId,
  total: number,
  colours: readonly JewelColour[],
  tags: readonly JewelTag[],
  hotTags: readonly JewelTag[],
): RewardLine[] {
  if (total === 0) return [];
  const lines: RewardLine[] = [];
  if (trait === "dreamer" && colours.length >= DREAMER_COLOURS)
    lines.push({ label: "Starry ideas", amount: Math.round(total * DREAMER_SHARE) });
  const matches = trendMatches(tags, hotTags).length;
  if (trait === "trendsetter" && matches > 0)
    lines.push({ label: "Trendsetter eye", amount: Math.round(total * TRENDSETTER_SHARE * matches) });
  if (trait === "charmer") lines.push({ label: "Charmer tip", amount: Math.round(total * CHARMER_SHARE) });
  return lines;
}

function trayPieces(state: GameState, choice: TrayChoice): (StallPiece | null)[] | null {
  if (choice.slots.length !== TRAY_SLOTS.length) return null;
  const ids = choice.slots.filter((id): id is string => id !== null);
  if (ids.length === 0 || new Set(ids).size !== ids.length) return null;
  const pieces = choice.slots.map((id) =>
    id === null ? null : (state.stallBox.find((piece) => piece.id === id) ?? undefined),
  );
  return pieces.every((piece) => piece !== undefined) ? (pieces as (StallPiece | null)[]) : null;
}

export function canOpenMarket(state: GameState): ActionCheck {
  const day = state.calendar.day;
  if (!isMarketDay(day)) return actionCheck(["Market Day is the seventh day of each week."]);
  if (state.market.shownDay === day) return actionCheck(["Your tray has already been out today."]);
  if (state.stallBox.length === 0) return actionCheck(["Make a stall piece first."]);
  const hours = hoursShortfallReason(state.calendar, MARKET_HOURS);
  return actionCheck(hours === null ? [] : [hours]);
}

export function canShowTray(state: GameState, choice: TrayChoice): ActionCheck {
  const open = canOpenMarket(state);
  if (!open.ok) return open;
  if (!isTrayClothId(choice.cloth) || !Number.isInteger(choice.sign) || TRAY_SIGNS[choice.sign] === undefined)
    return actionCheck(["Pick a cloth and a sign."]);
  return actionCheck(trayPieces(state, choice) === null ? ["Put at least one piece on the tray."] : []);
}

function keepsakeFor(
  piece: StallPiece,
  themeId: ThemeId,
  score: number,
  sold: boolean,
  day: number,
): KeepsakeEntry {
  const theme = themeById(themeId);
  return {
    id: `${piece.id}-day-${day}`,
    day,
    source: { kind: "market", themeId, score },
    look: piece.look,
    stars: starsForScore(piece.quality),
    line: sold ? `A shopper took it home from ${theme.name}.` : `It sparkled on the tray at ${theme.name}.`,
  };
}

export function showTray(state: GameState, choice: TrayChoice): GameState {
  if (!canShowTray(state, choice).ok) return state;
  const slots = trayPieces(state, choice);
  const spent = spendHours(state, MARKET_HOURS);
  if (slots === null || spent === null) return state;
  const day = state.calendar.day;
  const theme = themeById(state.marketTheme);
  const shown = slots.filter((piece): piece is StallPiece => piece !== null);
  const { score } = shopperScore(slots, theme);
  const count = salesCount(score, state.profile.difficulty, shown.length);
  const selling = [...shown].sort((a, b) => b.quality - a.quality).slice(0, count);
  const sold: SoldPiece[] = selling.map((piece) => ({ pieceId: piece.id, coins: salePrice(piece, score) }));
  const total = sold.reduce((sum, sale) => sum + sale.coins, 0);
  const colours = [...new Set(shown.flatMap((piece) => piece.colours))];
  const tags = [...new Set(shown.flatMap((piece) => piece.tags))];
  const lines = traitLines(state.profile.trait, total, colours, tags, state.trends.current);
  const coins = total + lines.reduce((sum, line) => sum + line.amount, 0);
  const reputation = score >= REPUTATION_SCORE ? 1 : 0;
  const buzz = Math.round(score / 10);
  const soldIds = new Set(sold.map((sale) => sale.pieceId));
  const summary: MarketSummary = {
    day,
    themeId: theme.id,
    score,
    cloth: choice.cloth,
    sign: choice.sign,
    slots,
    sold,
    lines,
    coins,
    reputation,
    buzz,
  };
  const next: GameState = {
    ...spent,
    stallBox: spent.stallBox.filter((piece) => !soldIds.has(piece.id)),
    market: { shownDay: day, last: summary },
    keepsakes: addKeepsakes(
      spent.keepsakes,
      shown.map((piece) => keepsakeFor(piece, theme.id, score, soldIds.has(piece.id), day)),
    ),
  };
  return applyStanding(next, { coins, reputation, buzz });
}
