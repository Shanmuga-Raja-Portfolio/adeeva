import { applyStanding } from "../../../engine/standing";
import { trendMatches } from "../../../engine/trendMarket";
import type { StyleTag } from "../../../engine/styleTag";
import type { RecipeId } from "../content/recipe";
import { recipeById } from "./catalog";
import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { isStallDay } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const FAIR_LOW_SHARE = 0.9;
export const FAIR_HIGH_SHARE = 1.1;
export const BARGAIN_SHARE = 0.7;
export const FAIR_REPUTATION_CAP = 2;
export const CHARMER_FAIR_REPUTATION_CAP = 3;
export const AWNING_STALL_BUZZ = 2;
export const CHARMER_FAIR_BUZZ = 1;
export const MAX_TAG_PRICE = 500;

export type SaleOutcome = "bargain" | "sold" | "fair" | "stayed";

export interface FairBand {
  readonly value: number;
  readonly low: number;
  readonly high: number;
}

export interface StallSale {
  readonly pieceId: string;
  readonly recipeId: RecipeId;
  readonly price: number;
  readonly value: number;
  readonly low: number;
  readonly high: number;
  readonly outcome: SaleOutcome;
}

export interface StallResult {
  readonly day: number;
  readonly sales: readonly StallSale[];
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export function fairValue(piece: RackPiece, hotTags: readonly StyleTag[]): number {
  const base = recipeById(piece.recipeId).baseValue;
  const matches = trendMatches(piece.tags, hotTags).length;
  return Math.round(base * (0.6 + (0.4 * piece.quality) / 100) * (1 + 0.1 * matches) + 0.1 * piece.leaves);
}

export function fairBand(piece: RackPiece, hotTags: readonly StyleTag[]): FairBand {
  const value = fairValue(piece, hotTags);
  return { value, low: Math.round(FAIR_LOW_SHARE * value), high: Math.round(FAIR_HIGH_SHARE * value) };
}

export function saleOutcome(price: number, band: FairBand): SaleOutcome {
  if (price <= BARGAIN_SHARE * band.value) return "bargain";
  if (price < band.low) return "sold";
  if (price <= band.high) return "fair";
  return "stayed";
}

export function stallIssues(state: GameState, prices: Readonly<Record<string, number>>): string[] {
  if (!isStallDay(state.calendar.day)) return ["Stall Day comes at the end of each week."];
  if (state.stall !== null && state.stall.day === state.calendar.day)
    return ["The stall is packed up for today."];
  const missing = state.rack.filter((piece) => {
    const price = Object.hasOwn(prices, piece.id) ? prices[piece.id] : undefined;
    return price === undefined || !Number.isInteger(price) || price < 1 || price > MAX_TAG_PRICE;
  });
  return missing.length > 0 ? ["Write a price tag for every piece on the rack."] : [];
}

export function holdStall(state: GameState, prices: Readonly<Record<string, number>>): GameState {
  if (stallIssues(state, prices).length > 0) return state;
  const charmer = state.profile.trait === "charmer";
  const sales: StallSale[] = state.rack.map((piece) => {
    const band = fairBand(piece, state.trends.current);
    const price = prices[piece.id] ?? 0;
    return { pieceId: piece.id, recipeId: piece.recipeId, price, ...band, outcome: saleOutcome(price, band) };
  });
  const sold = sales.filter((sale) => sale.outcome !== "stayed");
  const fair = sales.filter((sale) => sale.outcome === "fair").length;
  const cap = charmer ? CHARMER_FAIR_REPUTATION_CAP : FAIR_REPUTATION_CAP;
  const coins = sold.reduce((sum, sale) => sum + sale.price, 0);
  const reputation = Math.min(cap, fair);
  const buzz =
    (state.upgrades.includes("stall-awning") ? AWNING_STALL_BUZZ : 0) +
    (charmer ? CHARMER_FAIR_BUZZ * fair : 0);
  const soldIds = new Set(sold.map((sale) => sale.pieceId));
  const settled = applyStanding(
    {
      ...state,
      rack: state.rack.filter((piece) => !soldIds.has(piece.id)),
      stall: { day: state.calendar.day, sales, coins, reputation, buzz },
      fairSales: state.fairSales + fair,
    },
    { coins, reputation, buzz },
  );
  const voiced =
    state.profile.trait === "trendsetter" ? queueStoryTrigger(settled, "trait-trendsetter") : settled;
  return charmer && fair > 0 ? queueStoryTrigger(voiced, "trait-charmer") : voiced;
}

export function stallHeldToday(state: GameState): boolean {
  return state.stall !== null && state.stall.day === state.calendar.day;
}
