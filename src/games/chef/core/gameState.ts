import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { AwardId } from "../content/award";
import type { RungId, StartId } from "../content/career";
import type { CuisineId } from "../content/cuisine";
import type { PathId } from "../content/path";
import type { DishId } from "../content/dish";
import type { TasteTag } from "../content/tasteTag";
import type { UpgradeId } from "../content/upgrade";
import type { DayBoard } from "./dayBoard";
import type { DiaryEntry, PlatingCard } from "./dishDiary";
import type { DishRun } from "./dishRun";
import type { LogEntry } from "./log";
import type { OrderBrief, OrderDish } from "./orderBrief";
import type { PathState } from "./path";
import type { ServiceRun } from "./service";
import type { TasteMemory } from "./tasteMemory";
import type { TestDay } from "./testDay";

export const SCHEMA_VERSION = 2;

export interface Profile extends ProfileBase {
  readonly start: StartId;
}

export type Mastery = Readonly<Record<CuisineId, number>>;

export interface Passes {
  readonly line: number;
  readonly sous: number;
  readonly head: number;
}

export type Offer = BoardOffer<OrderBrief>;
export type Gig = BoardGig<OrderBrief>;
export type GigBoard = Board<OrderBrief>;

export interface GameState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly profile: Profile;
  readonly calendar: DayClock;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly rung: RungId;
  readonly mastery: Mastery;
  readonly mentorsMet: readonly CuisineId[];
  readonly passes: Passes;
  readonly upgrades: readonly UpgradeId[];
  readonly trends: TrendState<TasteTag>;
  readonly board: DayBoard;
  readonly gigs: GigBoard;
  readonly orderDishes: readonly OrderDish[];
  readonly menu: readonly DishId[];
  readonly story: StoryState;
  readonly activeRun: DishRun | null;
  readonly testDay: TestDay | null;
  readonly service: ServiceRun | null;
  readonly platingCards: readonly PlatingCard[];
  readonly tasteMemory: readonly TasteMemory[];
  readonly diary: readonly DiaryEntry[];
  readonly log: readonly LogEntry[];
  readonly awards: readonly AwardId[];
  readonly cleanStreak: number;
  readonly lastShiftDay: number;
  readonly guide: boolean;
  readonly nextRunNumber: number;
  readonly path: PathState | null;
  readonly peeked: readonly PathId[];
  readonly rng: RngState;
}
