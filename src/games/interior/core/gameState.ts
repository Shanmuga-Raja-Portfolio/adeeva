import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { LoftDecorId } from "../content/loftDecor";
import type { RoomTag } from "../content/roomTag";
import type { UpgradeId } from "../content/upgrade";
import type { Brief } from "./brief";
import type { MakeoverRun } from "./makeoverRun";
import type { OpenHouse } from "./openHouse";
import type { Evaluation } from "./roomEvaluate";
import type { Reward } from "./rewards";
import type { Stock } from "./stock";

export const SCHEMA_VERSION = 1;

export type Profile = ProfileBase;

export type Offer = BoardOffer<Brief>;
export type Gig = BoardGig<Brief>;
export type GigBoard = Board<Brief>;

export interface LogEntry {
  readonly runId: string;
  readonly clientId: string;
  readonly day: number;
  readonly evaluation: Evaluation;
  readonly reward: Reward;
  readonly openHouse: OpenHouse | null;
}

export interface GameState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly profile: Profile;
  readonly calendar: DayClock;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly stock: Stock;
  readonly upgrades: readonly UpgradeId[];
  readonly loftDecor: readonly LoftDecorId[];
  readonly guide: boolean;
  readonly trends: TrendState<RoomTag>;
  readonly showHomeWeek: number;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly activeRun: MakeoverRun | null;
  readonly log: readonly LogEntry[];
  readonly ordersDelivered: number;
  readonly nextRunNumber: number;
  readonly rng: RngState;
}
