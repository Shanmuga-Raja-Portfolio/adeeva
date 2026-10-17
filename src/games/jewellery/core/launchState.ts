import type { MusicMoodId } from "../../../engine/musicMood";
import type { PanelScore } from "../../../engine/panelScore";
import type { RewardLine } from "../../../engine/reward";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import type { AwardId } from "../content/launchAward";
import type { LaunchSpotNumber } from "../content/launchSpot";
import { LAUNCH_THEME_IDS, type LaunchThemeId } from "../content/launchTheme";
import type { LanternColourId } from "../content/lanternColour";
import type { MetalId } from "../content/metal";
import type { LaunchPanelId } from "../content/panelMember";
import type { PriceTagId } from "../content/priceTag";
import type { ProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import type { DesignOptions } from "./pieceLook";

export interface LaunchPlan {
  readonly order: readonly string[];
  readonly lantern: LanternColourId;
  readonly music: MusicMoodId;
  readonly card: number;
}

export interface LaunchPanelScore extends PanelScore<LaunchPanelId> {
  readonly praise: string;
}

export interface LaunchResult {
  readonly day: number;
  readonly seasonNumber: number;
  readonly themeId: LaunchThemeId;
  readonly spot: LaunchSpotNumber;
  readonly plan: LaunchPlan;
  readonly panels: readonly LaunchPanelScore[];
  readonly latePenalty: number;
  readonly overall: number;
  readonly award: AwardId;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly tip: string;
  readonly spotAfter: LaunchSpotNumber;
}

export interface PopupEntry {
  readonly pieceId: string;
  readonly tag: PriceTagId;
  readonly hearts: number;
  readonly price: number;
  readonly sold: boolean;
  readonly cameBack: boolean;
}

export interface ShelfSale {
  readonly pieceId: string;
  readonly coins: number;
  readonly sold: boolean;
}

export interface PopupResult {
  readonly day: number;
  readonly seasonNumber: number;
  readonly plinth: string;
  readonly entries: readonly PopupEntry[];
  readonly shelf: readonly ShelfSale[];
  readonly lines: readonly RewardLine[];
  readonly coins: number;
  readonly buzz: number;
  readonly copyRequests: number;
}

export interface PendingCopy {
  readonly visitorId: string;
  readonly pieceId: string;
  readonly productId: ProductId;
  readonly options: DesignOptions;
  readonly metalId: MetalId;
  readonly stoneId: StoneId | null;
  readonly colours: readonly JewelColour[];
  readonly tag: JewelTag;
  readonly fee: number;
  readonly budget: number;
  readonly days: number;
}

export type Garland = Readonly<Record<LaunchThemeId, AwardId | null>>;

export interface LaunchState {
  readonly spot: LaunchSpotNumber;
  readonly spotOffer: boolean;
  readonly result: LaunchResult | null;
  readonly popup: PopupResult | null;
  readonly garland: Garland;
  readonly awardsBySeason: Readonly<Record<string, AwardId>>;
  readonly pendingCopies: readonly PendingCopy[];
}

export const EMPTY_GARLAND: Garland = Object.fromEntries(LAUNCH_THEME_IDS.map((id) => [id, null])) as Record<
  LaunchThemeId,
  AwardId | null
>;

export const INITIAL_LAUNCH: LaunchState = {
  spot: 1,
  spotOffer: false,
  result: null,
  popup: null,
  garland: EMPTY_GARLAND,
  awardsBySeason: {},
  pendingCopies: [],
};
