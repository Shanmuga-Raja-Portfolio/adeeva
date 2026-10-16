import type { RunwayLightId } from "../../adeeva/content/runwayLight";
import type { MusicMoodId } from "../../../engine/musicMood";
import type { SeamProgress } from "../../adeeva/core/dressRun";
import type { ConditionGrade } from "../content/condition";
import type { FindId } from "../content/find";
import type { RosetteId } from "../content/rosette";
import type { SeasonId } from "../content/season";
import type { ShopSignId } from "../content/shopSign";
import type { SwapTableKind } from "../content/swapNeighbour";
import type { WindowPropId } from "../content/windowProp";
import type { StainWork, UnpickLine } from "./flipRun";
import type { Stain } from "./ownedFind";
import type { RackPiece } from "./rackPiece";
import type { ShowcaseResult } from "./showcaseScore";

export interface WindowSpot {
  readonly x: number;
  readonly y: number;
}

export interface WindowPiece extends WindowSpot {
  readonly pieceId: string;
}

export interface WindowProp extends WindowSpot {
  readonly propId: WindowPropId;
}

export interface WindowDisplay {
  readonly pieces: readonly WindowPiece[];
  readonly props: readonly WindowProp[];
}

export interface ShowcasePlan {
  readonly order: readonly string[];
  readonly mood: MusicMoodId;
  readonly light: RunwayLightId;
  readonly cards: Readonly<Record<string, string>>;
}

export interface Showcase {
  readonly day: number;
  readonly plan: ShowcasePlan;
  readonly pieces: readonly RackPiece[];
  readonly result: ShowcaseResult;
}

export interface SwapTable {
  readonly id: string;
  readonly neighbour: string;
  readonly request: string;
  readonly findId: FindId;
  readonly kind: SwapTableKind;
  readonly line: number;
  readonly stain: Stain;
  readonly unpick: UnpickLine;
  readonly scrub: StainWork;
  readonly soaked: boolean;
  readonly seam: SeamProgress | null;
  readonly charged: boolean;
  readonly rewarded: boolean;
}

export interface SwapSlot {
  readonly id: string;
  readonly findId: FindId;
  readonly grade: ConditionGrade;
  readonly taken: boolean;
}

export interface SwapDay {
  readonly day: number;
  readonly committed: boolean;
  readonly tables: readonly SwapTable[];
  readonly rail: readonly SwapSlot[];
  readonly swaps: number;
}

export interface BoutiqueSeason {
  readonly number: number;
  readonly themeId: SeasonId;
  readonly startDay: number;
  readonly capsule: readonly string[];
  readonly showcase: Showcase | null;
  readonly swapDay: SwapDay | null;
}

export interface RosetteEntry {
  readonly season: number;
  readonly themeId: SeasonId;
  readonly rosette: RosetteId;
  readonly overall: number;
}

export interface Boutique {
  readonly signId: ShopSignId;
  readonly openedDay: number;
  readonly season: BoutiqueSeason;
  readonly window: WindowDisplay;
  readonly props: readonly WindowPropId[];
  readonly rosettes: readonly RosetteEntry[];
}

export const EMPTY_WINDOW: WindowDisplay = { pieces: [], props: [] };
