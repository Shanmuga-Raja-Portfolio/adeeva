import type { Point } from "../../../engine/geometry/point";
import type { PlacedPose } from "../../../engine/placedPose";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { LaunchThemeId } from "../content/launchTheme";
import type { LineNameId } from "../content/lineName";
import type { BackdropId } from "../content/lookbookBackdrop";
import type { PropId } from "../content/lookbookProp";
import type { MetalId } from "../content/metal";
import type { ShapeId } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import type { Shimmer, StoneTint } from "../content/stoneTint";
import type { StallPiece } from "./stallBox";

export interface CollectionBrief {
  readonly products: readonly ProductId[];
  readonly motif: ShapeId;
  readonly metalId: MetalId;
  readonly hero: StoneId | null;
  readonly accent: StoneId | null;
  readonly finish: FinishId;
  readonly glaze: GlazeColour | null;
}

export interface GemPick {
  readonly stoneId: StoneId;
  readonly tint: StoneTint;
  readonly shimmer: Shimmer;
}

export interface GemStone extends GemPick {
  readonly price: number;
  readonly sold: boolean;
}

export interface PotStone extends GemPick {
  readonly used: boolean;
}

export interface CollectionPiece extends StallPiece {
  readonly slot: number;
  readonly runId: string;
  readonly cutAccuracy: number;
  readonly motifCutAccuracy: number | null;
  readonly joinAccuracy: number;
  readonly setAccuracy: number | null;
  readonly polish: number;
  readonly carriesMotif: boolean;
  readonly potStones: readonly GemPick[];
  readonly sparkle: number;
  readonly spend: number;
  readonly partArea: number;
  readonly sheetArea: number;
  readonly sweetSpot: number;
}

export interface LineHole {
  readonly runId: string;
  readonly points: readonly Point[];
}

export interface LineSheet {
  readonly holes: readonly LineHole[];
}

export interface PlacedProp extends PlacedPose {
  readonly id: string;
  readonly propId: PropId;
}

export interface LookbookPage {
  readonly pieceId: string;
  readonly backdrop: BackdropId;
  readonly props: readonly PlacedProp[];
  readonly lampAngle: number | null;
  readonly light: number | null;
  readonly assisted: boolean;
}

export interface LookbookState {
  readonly pages: readonly LookbookPage[];
  readonly closed: boolean;
}

export interface CollectionState {
  readonly seasonStartDay: number;
  readonly seasonNumber: number;
  readonly themeId: LaunchThemeId | null;
  readonly rested: boolean;
  readonly carried: boolean;
  readonly lineNameId: LineNameId;
  readonly brief: CollectionBrief | null;
  readonly pieces: readonly CollectionPiece[];
  readonly gemTray: readonly GemStone[];
  readonly stonePot: readonly PotStone[];
  readonly gemSpent: number | null;
  readonly lineSheets: readonly LineSheet[];
  readonly motifMaster: number | null;
  readonly lookbook: LookbookState;
  readonly drawer: readonly StallPiece[];
  readonly storyCorner: readonly string[];
  readonly graceSeason: number;
  readonly nextPieceNumber: number;
}

export const EMPTY_LOOKBOOK: LookbookState = { pages: [], closed: false };

export function initialCollection(
  seasonStartDay: number,
  lineNameId: LineNameId,
  storyCorner: readonly string[],
): CollectionState {
  return {
    seasonStartDay,
    seasonNumber: 1,
    themeId: null,
    rested: false,
    carried: false,
    lineNameId,
    brief: null,
    pieces: [],
    gemTray: [],
    stonePot: [],
    gemSpent: null,
    lineSheets: [],
    motifMaster: null,
    lookbook: EMPTY_LOOKBOOK,
    drawer: [],
    storyCorner,
    graceSeason: 0,
    nextPieceNumber: 1,
  };
}
