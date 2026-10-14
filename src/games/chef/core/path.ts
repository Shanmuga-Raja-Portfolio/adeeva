import type { PathAwardId } from "../content/award";
import type { ChapterId } from "../content/chapter";
import type { CriticId } from "../content/critic";
import type { CueKind } from "../content/cueCard";
import type { DishId } from "../content/dish";
import type { FestivalId } from "../content/festival";
import type { GameState } from "./gameState";
import { MONEY_IN, withMoney, withUnserved, type Ledger, type MoneyKind } from "./ledger";

export interface PathCommon {
  readonly startDay: number;
  readonly awards: readonly PathAwardId[];
  readonly community: number;
  readonly cleanStreak: number;
  readonly finished: boolean;
  readonly week: Ledger;
  readonly lastWeek: Ledger | null;
}

export interface MenuDish {
  readonly dishId: DishId;
  readonly price: number;
  readonly par: number;
}

export interface DishSale {
  readonly dishId: DishId;
  readonly price: number;
  readonly stock: number;
  readonly bought: number;
  readonly wanted: number;
  readonly sold: number;
  readonly leftover: number;
}

export interface SalePlan {
  readonly day: number;
  readonly guests: number;
  readonly seats: number;
  readonly dishes: readonly DishSale[];
  readonly ingredients: number;
  readonly keptSimple: number;
}

export interface CriticNight {
  readonly criticId: CriticId;
  readonly day: number;
}

export interface Review {
  readonly criticId: CriticId;
  readonly day: number;
  readonly dishId: DishId;
  readonly spoons: number;
  readonly lines: readonly string[];
}

export interface CriticSpoons {
  readonly criticId: CriticId;
  readonly spoons: number;
}

export interface Season {
  readonly startDay: number;
  readonly scores: readonly number[];
  readonly critics: readonly CriticSpoons[];
  readonly moneyIn: number;
  readonly moneyOut: number;
  readonly ingredients: number;
  readonly unserved: number;
}

export interface ShiftRow {
  readonly staffId: string;
  readonly nights: readonly number[];
}

export interface StockCount {
  readonly dishId: DishId;
  readonly count: number;
}

export interface NightReport {
  readonly plan: SalePlan;
  readonly score: number;
  readonly stars: number;
  readonly plateCoins: number;
  readonly tips: number;
  readonly teamPay: number;
  readonly carried: readonly StockCount[];
  readonly review: Review | null;
  readonly notes: readonly string[];
}

export interface RestaurantState extends PathCommon {
  readonly kind: "restaurant";
  readonly nameCard: string;
  readonly menu: readonly MenuDish[];
  readonly team: readonly ShiftRow[];
  readonly carried: readonly StockCount[];
  readonly criticNights: readonly CriticNight[];
  readonly season: Season;
  readonly reviews: readonly Review[];
  readonly notes: readonly string[];
  readonly tonight: SalePlan | null;
  readonly lastNight: NightReport | null;
}

export interface FestivalSlot {
  readonly day: number;
  readonly festivalId: FestivalId;
  readonly worked: boolean;
}

export interface FestivalReport {
  readonly festivalId: FestivalId;
  readonly plan: SalePlan;
  readonly score: number;
  readonly stars: number;
  readonly ribbon: boolean;
  readonly plateCoins: number;
  readonly pitch: number;
  readonly helperFee: number;
}

export interface TruckDay {
  readonly festivalId: FestivalId;
  readonly helperId: string;
  readonly plan: SalePlan;
}

export interface TruckState extends PathCommon {
  readonly kind: "truck";
  readonly menu: readonly MenuDish[];
  readonly cycle: readonly FestivalId[];
  readonly cycleIndex: number;
  readonly board: readonly FestivalSlot[];
  readonly visited: readonly FestivalId[];
  readonly ribbons: readonly FestivalId[];
  readonly today: TruckDay | null;
  readonly lastFestival: FestivalReport | null;
}

export interface SegmentPrep {
  readonly dishId: DishId;
  readonly cues: readonly CueKind[];
  readonly deck: readonly CueKind[];
  readonly order: readonly CueKind[];
  readonly tips: readonly (number | null)[];
}

export interface SegmentReport {
  readonly dishId: DishId;
  readonly day: number;
  readonly quality: number;
  readonly clarity: number;
  readonly onClock: number;
  readonly clockSeconds: number;
  readonly score: number;
  readonly stars: number;
  readonly letterId: string | null;
}

export interface RecipeCard {
  readonly dishId: DishId;
  readonly tip: number;
}

export interface ChapterState {
  readonly chapterId: ChapterId;
  readonly cards: readonly RecipeCard[];
  readonly spoons: number | null;
  readonly review: string | null;
}

export interface Cookbook {
  readonly chapters: readonly ChapterState[];
  readonly launched: boolean;
}

export interface TvState extends PathCommon {
  readonly kind: "tv";
  readonly prep: SegmentPrep | null;
  readonly segmentWeek: number;
  readonly segmentsThisWeek: number;
  readonly strongSegments: number;
  readonly letters: readonly string[];
  readonly tested: readonly DishId[];
  readonly book: Cookbook | null;
  readonly lastSegment: SegmentReport | null;
}

export type PathState = RestaurantState | TruckState | TvState;

export function restaurantOf(state: Pick<GameState, "path">): RestaurantState | null {
  return state.path !== null && state.path.kind === "restaurant" ? state.path : null;
}

export function truckOf(state: Pick<GameState, "path">): TruckState | null {
  return state.path !== null && state.path.kind === "truck" ? state.path : null;
}

export function tvOf(state: Pick<GameState, "path">): TvState | null {
  return state.path !== null && state.path.kind === "tv" ? state.path : null;
}

export function withPath(state: GameState, path: PathState): GameState {
  return state.path === path ? state : { ...state, path };
}

function seasonMoney(season: Season, kind: MoneyKind, amount: number): Season {
  const incoming = MONEY_IN.some((entry) => entry === kind);
  return {
    ...season,
    moneyIn: season.moneyIn + (incoming ? amount : 0),
    moneyOut: season.moneyOut + (incoming ? 0 : amount),
    ingredients: season.ingredients + (kind === "ingredients" ? amount : 0),
  };
}

export function recordMoney(state: GameState, kind: MoneyKind, amount: number): GameState {
  const path = state.path;
  if (path === null || amount === 0) return state;
  const week = withMoney(path.week, kind, amount);
  if (path.kind !== "restaurant") return withPath(state, { ...path, week });
  return withPath(state, { ...path, week, season: seasonMoney(path.season, kind, amount) });
}

export function recordUnserved(state: GameState, amount: number): GameState {
  const path = state.path;
  if (path === null || amount === 0) return state;
  const week = withUnserved(path.week, amount);
  if (path.kind !== "restaurant") return withPath(state, { ...path, week });
  return withPath(state, {
    ...path,
    week,
    season: { ...path.season, unserved: path.season.unserved + amount },
  });
}
