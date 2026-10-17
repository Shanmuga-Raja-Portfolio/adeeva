import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { CareerId } from "../content/career";
import type { DecorId } from "../content/decor";
import type { JewelTag } from "../content/jewelTag";
import type { ThemeId } from "../content/marketTheme";
import type { UpgradeId } from "../content/upgrade";
import type { Brief } from "./brief";
import type { CollectionState } from "./collectionState";
import type { KeepsakeEntry } from "./keepsakeCase";
import type { LaunchState } from "./launchState";
import type { MarketState } from "./marketDay";
import type { Evaluation } from "./pieceEvaluate";
import type { PieceRun } from "./pieceRun";
import type { Reward } from "./rewards";
import type { StallPiece } from "./stallBox";
import type { Stock } from "./stock";

export const SCHEMA_VERSION = 2;

export interface Profile extends ProfileBase {
  readonly startedAs: CareerId;
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
  readonly stock: Stock;
  readonly upgrades: readonly UpgradeId[];
  readonly decor: readonly DecorId[];
  readonly guide: boolean;
  readonly trends: TrendState<JewelTag>;
  readonly marketTheme: ThemeId;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly activeRun: PieceRun | null;
  readonly stallBox: readonly StallPiece[];
  readonly market: MarketState;
  readonly keepsakes: readonly KeepsakeEntry[];
  readonly log: readonly LogEntry[];
  readonly ordersDelivered: number;
  readonly nextRunNumber: number;
  readonly collection: CollectionState | null;
  readonly launch: LaunchState | null;
  readonly rng: RngState;
}
