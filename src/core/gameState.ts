import type { AvatarLook } from "../content/avatarOption";
import type { CareerId } from "../content/career";
import type { DifficultyId } from "../content/difficulty";
import type { TraitId } from "../content/trait";
import type { TrimId } from "../content/trim";
import type { UpgradeId } from "../content/upgrade";
import type { Brief } from "./brief";
import type { DressRun, RunPurpose } from "./dressRun";
import type { Evaluation } from "./evaluate";
import type { LabelSeason } from "./labelSeason";
import type { Reward } from "./rewards";
import type { RngState } from "./rng";
import type { TrendState } from "./trendMarket";

export const SCHEMA_VERSION = 3;

export interface Profile {
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId;
  readonly difficulty: DifficultyId;
  readonly career: CareerId;
}

export interface CalendarState {
  readonly day: number;
  readonly hoursLeft: number;
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

export interface Offer {
  readonly id: string;
  readonly clientId: string;
  readonly brief: Brief;
  readonly expiresDay: number;
}

export interface Gig {
  readonly id: string;
  readonly clientId: string;
  readonly brief: Brief;
  readonly acceptedDay: number;
}

export interface LapsedGig {
  readonly gigId: string;
  readonly clientId: string;
  readonly day: number;
  readonly reputation: number;
}

export interface GigBoard {
  readonly offers: readonly Offer[];
  readonly active: readonly Gig[];
  readonly lapsed: readonly LapsedGig[];
  readonly nextGigNumber: number;
}

export interface StoryState {
  readonly seen: readonly string[];
  readonly flags: readonly string[];
  readonly queue: readonly string[];
}

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
