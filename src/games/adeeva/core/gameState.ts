import type { DayClock } from "../../../engine/dayHours";
import type {
  GigBoard as Board,
  Gig as BoardGig,
  Offer as BoardOffer,
  LapsedGig,
} from "../../../engine/gigBoard";
import type { StoryState } from "../../../engine/story";
import type { ProfileBase } from "../../../engine/profile";
import type { CareerId } from "../content/career";
import type { TrimId } from "../content/trim";
import type { UpgradeId } from "../content/upgrade";
import type { Brief } from "./brief";
import type { DressRun, RunPurpose } from "./dressRun";
import type { Evaluation } from "./evaluate";
import type { LabelSeason } from "./labelSeason";
import type { Reward } from "./rewards";
import type { RngState } from "../../../engine/rng";
import type { TrendState } from "./trendMarket";

export const SCHEMA_VERSION = 3;

export interface Profile extends ProfileBase {
  readonly career: CareerId;
}

export interface CalendarState extends DayClock {
  readonly shopOpen: boolean;
}

export interface Inventory {
  readonly fabricMetres: Readonly<Record<string, number>>;
  readonly trims: Readonly<Record<TrimId, number>>;
}

export interface StudioState {
  readonly upgrades: readonly UpgradeId[];
  readonly assistantHired: boolean;
  readonly assistantPaidThroughDay: number;
}

export type Offer = BoardOffer<Brief>;
export type Gig = BoardGig<Brief>;
export type GigBoard = Board<Brief>;
export type { LapsedGig, StoryState };

export interface LogEntry {
  readonly runId: string;
  readonly purpose: RunPurpose;
  readonly clientId: string | null;
  readonly day: number;
  readonly evaluation: Evaluation;
  readonly reward: Reward | null;
}

export interface GameState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly profile: Profile;
  readonly calendar: CalendarState;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly inventory: Inventory;
  readonly studio: StudioState;
  readonly trends: TrendState;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly activeRun: DressRun | null;
  readonly season: LabelSeason | null;
  readonly log: readonly LogEntry[];
  readonly deliveredRunIds: readonly string[];
  readonly gigsDelivered: number;
  readonly nextRunNumber: number;
  readonly rng: RngState;
}
