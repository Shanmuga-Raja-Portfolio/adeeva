import type { DayClock } from "../../../engine/dayHours";
import type { GigBoard as Board, Gig as BoardGig, Offer as BoardOffer } from "../../../engine/gigBoard";
import type { ColourId } from "../../../engine/palette";
import type { ProfileBase } from "../../../engine/profile";
import type { RngState } from "../../../engine/rng";
import type { StoryState } from "../../../engine/story";
import type { TrendState } from "../../../engine/trendMarket";
import type { CareerId } from "../content/career";
import type { DecorId } from "../content/decor";
import type { ProductId } from "../content/product";
import type { UpgradeId } from "../content/upgrade";
import type { WoodTag } from "../content/woodTag";
import type { WoodId } from "../content/wood";
import type { Brief } from "./brief";
import type { ApprenticeState } from "./apprentice";
import type { CommissionRun } from "./commissionRun";
import type { FairState } from "./fairState";
import type { OwnedBoard } from "./ownedBoard";
import type { Evaluation } from "./pieceEvaluate";
import type { Reward } from "./rewards";
import type { ShowroomState } from "./showroomState";

export const SCHEMA_VERSION = 2;

export interface Profile extends ProfileBase {
  readonly startedAs: CareerId;
}

export type Offer = BoardOffer<Brief>;
export type Gig = BoardGig<Brief>;
export type GigBoard = Board<Brief>;

export interface OwnedDecor {
  readonly id: DecorId;
  readonly paint: ColourId | null;
}

export interface LogEntry {
  readonly runId: string;
  readonly clientId: string;
  readonly day: number;
  readonly productId: ProductId;
  readonly woodId: WoodId;
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
  readonly trends: TrendState<WoodTag>;
  readonly gigs: GigBoard;
  readonly story: StoryState;
  readonly boards: readonly OwnedBoard[];
  readonly upgrades: readonly UpgradeId[];
  readonly decor: readonly OwnedDecor[];
  readonly activeRun: CommissionRun | null;
  readonly log: readonly LogEntry[];
  readonly delivered: number;
  readonly nextRunNumber: number;
  readonly nextBoardNumber: number;
  readonly showroom: ShowroomState | null;
  readonly fair: FairState | null;
  readonly apprentice: ApprenticeState | null;
  readonly rng: RngState;
}
