import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { TrimId } from "../../adeeva/content/trim";
import type { CareerId } from "../content/career";
import type { ConditionGrade } from "../content/condition";
import type { FindId } from "../content/find";
import type { UpgradeId } from "../content/upgrade";
import type { Boutique } from "./boutique";
import type { Brief } from "./brief";
import type { FlipEvaluation } from "./flipEvaluate";
import type { FlipRun } from "./flipRun";
import type { OwnedFind } from "./ownedFind";
import type { RackPiece } from "./rackPiece";
import type { Reward } from "./rewards";
import type { Scrap } from "./scrap";
import type { StallResult } from "./stallDay";

export const SCHEMA_VERSION = 2;

export interface Profile extends ProfileBase {
  readonly career: CareerId;
}

export interface CalendarState extends DayClock {
  readonly marketOpen: boolean;
}

export interface RailSlot {
  readonly id: string;
  readonly findId: FindId;
  readonly grade: ConditionGrade;
  readonly price: number;
  readonly sold: boolean;
}

export interface Stock {
  readonly finds: readonly OwnedFind[];
  readonly savedTrims: Readonly<Record<TrimId, number>>;
  readonly scraps: readonly Scrap[];
}

export type Offer = BoardOffer<Brief>;
export type Gig = BoardGig<Brief>;
export type GigBoard = Board<Brief>;

export type LogKind = "gig" | "own" | "ticket";

export interface LogEntry {
  readonly runId: string;
  readonly kind: LogKind;
  readonly clientId: string | null;
  readonly day: number;
  readonly evaluation: FlipEvaluation;
  readonly reward: Reward | null;
}

export interface Counters {
  readonly run: number;
  readonly find: number;
  readonly scrap: number;
  readonly piece: number;
}

export interface GameState {
  readonly schemaVersion: typeof SCHEMA_VERSION;
  readonly profile: Profile;
  readonly calendar: CalendarState;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly trends: TrendState;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly rail: readonly RailSlot[];
  readonly stock: Stock;
  readonly upgrades: readonly UpgradeId[];
  readonly activeRun: FlipRun | null;
  readonly rack: readonly RackPiece[];
  readonly stall: StallResult | null;
  readonly log: readonly LogEntry[];
  readonly flipsFinished: number;
  readonly gigsDelivered: number;
  readonly fairSales: number;
  readonly keptInUse: number;
  readonly boutique: Boutique | null;
  readonly next: Counters;
  readonly rng: RngState;
}
