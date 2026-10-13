import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ColourId } from "../../../engine/palette";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { ToppingId } from "../content/topping";
import type { UpgradeId } from "../content/upgrade";
import type { BakeBookEntry } from "./bakeBook";
import type { BakeRun } from "./bakeRun";
import type { Evaluation } from "./bakeEvaluate";
import type { Brief } from "./brief";
import type { CounterState } from "./counter";
import type { Reward } from "./rewards";

export const SCHEMA_VERSION = 1;

export type Profile = ProfileBase;

export interface Pantry {
  readonly ingredients: Readonly<Record<IngredientId, number>>;
  readonly gels: Readonly<Partial<Record<ColourId, number>>>;
  readonly fillings: Readonly<Record<FillingId, number>>;
  readonly toppings: Readonly<Record<ToppingId, number>>;
}

export type Offer = BoardOffer<Brief>;
export type Gig = BoardGig<Brief>;
export type GigBoard = Board<Brief>;

export interface LogEntry {
  readonly runId: string;
  readonly clientId: string;
  readonly day: number;
  readonly evaluation: Evaluation;
  readonly reward: Reward;
}

export interface GameState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly profile: Profile;
  readonly calendar: DayClock;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly pantry: Pantry;
  readonly upgrades: readonly UpgradeId[];
  readonly guide: boolean;
  readonly trends: TrendState;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly activeRun: BakeRun | null;
  readonly counter: CounterState;
  readonly bakeBook: readonly BakeBookEntry[];
  readonly log: readonly LogEntry[];
  readonly ordersDelivered: number;
  readonly nextRunNumber: number;
  readonly rng: RngState;
}
