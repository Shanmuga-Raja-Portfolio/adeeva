import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ColourId } from "../../../engine/palette";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { CareerId } from "../content/career";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { TeaId } from "../content/tea";
import type { ToppingId } from "../content/topping";
import type { UpgradeId } from "../content/upgrade";
import type { BakeBookEntry } from "./bakeBook";
import type { BakeRun } from "./bakeRun";
import type { Evaluation } from "./bakeEvaluate";
import type { Brief } from "./brief";
import type { CounterState } from "./counter";
import type { FairState } from "./fairState";
import type { Reward } from "./rewards";
import type { SalonState } from "./salonState";

export const SCHEMA_VERSION = 2;

export interface Profile extends ProfileBase {
  readonly startedAs: CareerId;
}

export interface Pantry {
  readonly ingredients: Readonly<Record<IngredientId, number>>;
  readonly gels: Readonly<Partial<Record<ColourId, number>>>;
  readonly fillings: Readonly<Record<FillingId, number>>;
  readonly toppings: Readonly<Record<ToppingId, number>>;
  readonly teas: Readonly<Record<TeaId, number>>;
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
  readonly career: CareerId;
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
  readonly salon: SalonState | null;
  readonly fair: FairState | null;
  readonly bakeBook: readonly BakeBookEntry[];
  readonly log: readonly LogEntry[];
  readonly ordersDelivered: number;
  readonly nextRunNumber: number;
  readonly rng: RngState;
}
