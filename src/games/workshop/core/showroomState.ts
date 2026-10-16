import type { CushionFabricId } from "../content/cushionFabric";
import type { FairThemeId } from "../content/fairTheme";
import type { JointKindId } from "../content/jointKind";
import type { PartOptionId, PartSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { SetTemplateId } from "../content/setTemplate";
import type { ShadeId } from "../content/shade";
import type { WoodId } from "../content/wood";
import type { WoodTag } from "../content/woodTag";
import type { FinishChoice, PlacedExtra, QuarterTurn } from "./commissionRun";

export interface FloorSpot {
  readonly x: number;
  readonly y: number;
  readonly rotation: QuarterTurn;
}

export interface FloorPiece {
  readonly productId: ProductId;
  readonly quality: number;
  readonly tags: readonly WoodTag[];
  readonly extras: readonly PlacedExtra[];
  readonly spot: FloorSpot;
}

export interface SetStats {
  readonly quality: number;
  readonly jointAccuracy: number;
  readonly sandScore: number;
  readonly matchedFaces: number | null;
  readonly evenness: number;
  readonly hardware: number;
  readonly harmony: number;
  readonly colours: readonly ShadeId[];
  readonly tags: readonly WoodTag[];
}

export type FloorMode = "sale" | "show";

export interface FloorSet {
  readonly setId: string;
  readonly templateId: SetTemplateId;
  readonly madeDay: number;
  readonly seasonNumber: number;
  readonly themeId: FairThemeId | null;
  readonly woodId: WoodId;
  readonly options: Readonly<Partial<Record<PartSlot, PartOptionId>>>;
  readonly finish: FinishChoice;
  readonly cushion: CushionFabricId | null;
  readonly setJoint: JointKindId;
  readonly pieces: readonly FloorPiece[];
  readonly stats: SetStats;
  readonly price: number;
  readonly mode: FloorMode;
  readonly bay: number;
}

export interface ShowroomState {
  readonly seasonStartDay: number;
  readonly seasonNumber: number;
  readonly themeId: FairThemeId | null;
  readonly rested: boolean;
  readonly floor: readonly FloorSet[];
  readonly salePick: string | null;
  readonly graceSeason: number;
  readonly nextSetNumber: number;
}

export function initialShowroom(seasonStartDay: number): ShowroomState {
  return {
    seasonStartDay,
    seasonNumber: 1,
    themeId: null,
    rested: false,
    floor: [],
    salePick: null,
    graceSeason: 0,
    nextSetNumber: 1,
  };
}
