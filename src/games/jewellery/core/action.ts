import type { AvatarLook } from "../../../engine/avatar";
import type { DifficultyId } from "../../../engine/difficulty";
import type { Point } from "../../../engine/geometry/point";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { MusicMoodId } from "../../../engine/musicMood";
import type { TraitId } from "../../../engine/trait";
import type { CareerId } from "../content/career";
import type { DecorId } from "../content/decor";
import type { ChainId, CharmId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { LanternColourId } from "../content/lanternColour";
import type { LaunchThemeId } from "../content/launchTheme";
import type { LineNameId } from "../content/lineName";
import type { BackdropId } from "../content/lookbookBackdrop";
import type { MetalId } from "../content/metal";
import type { OptionId, OptionSlot } from "../content/partOption";
import type { StallProductId } from "../content/product";
import type { StockSizeId } from "../content/stockSize";
import type { StoneId } from "../content/stone";
import type { PriceTagId } from "../content/priceTag";
import type { TrayClothId } from "../content/stallTray";
import type { UpgradeId } from "../content/upgrade";
import type { CollectionBrief } from "./collectionState";
import type { PropChoice } from "./lookbook";
import type { RunStage } from "./runStage";
import type { SupplyCart } from "./supplies";
import type { TwinSeam } from "./twinLamp";

export type Action =
  | {
      readonly type: "newGame";
      readonly seed: number;
      readonly name: string;
      readonly look: AvatarLook;
      readonly trait: TraitId;
      readonly difficulty: DifficultyId;
      readonly career: CareerId;
      readonly lineNameId: LineNameId;
    }
  | { readonly type: "acceptOffer"; readonly offerId: string }
  | { readonly type: "declineOffer"; readonly offerId: string }
  | { readonly type: "startOrder"; readonly gigId: string }
  | { readonly type: "startStall"; readonly productId: StallProductId }
  | { readonly type: "abandonRun" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | { readonly type: "chooseOption"; readonly slot: OptionSlot; readonly optionId: OptionId }
  | { readonly type: "chooseMetal"; readonly metalId: MetalId }
  | { readonly type: "chooseStone"; readonly stoneId: StoneId }
  | { readonly type: "buySupplies"; readonly cart: SupplyCart }
  | {
      readonly type: "placePart";
      readonly partKey: string;
      readonly size: StockSizeId;
      readonly x: number;
      readonly y: number;
      readonly rotation: Rotation;
    }
  | { readonly type: "removePart"; readonly partKey: string }
  | { readonly type: "showMePlan" }
  | {
      readonly type: "cutPath";
      readonly pathId: string;
      readonly strokes: readonly (readonly Point[])[];
      readonly pxPerMm: number;
      readonly assisted: boolean;
    }
  | {
      readonly type: "recordJoin";
      readonly jointId: string;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly overTicks: number;
      readonly assisted: boolean;
    }
  | { readonly type: "restartJoin"; readonly jointId: string }
  | {
      readonly type: "setStone";
      readonly seatKey: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
      readonly claws: readonly number[];
      readonly assisted: boolean;
    }
  | {
      readonly type: "polishStroke";
      readonly partKey: string;
      readonly samples: readonly Point[];
      readonly pxPerMm: number;
    }
  | { readonly type: "buffPart"; readonly partKey: string }
  | { readonly type: "restartPolish"; readonly partKey: string }
  | { readonly type: "chooseFinish"; readonly finish: FinishId; readonly glaze: GlazeColour | null }
  | { readonly type: "chooseChain"; readonly chain: ChainId | null; readonly cordColour: GlazeColour | null }
  | { readonly type: "addCharm"; readonly charmId: CharmId; readonly x: number; readonly y: number }
  | {
      readonly type: "moveCharm";
      readonly charmPieceId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
      readonly scale: number;
      readonly layer: number;
    }
  | { readonly type: "removeCharm"; readonly charmPieceId: string }
  | { readonly type: "deliver" }
  | { readonly type: "finishStall" }
  | {
      readonly type: "showTray";
      readonly slots: readonly (string | null)[];
      readonly cloth: TrayClothId;
      readonly sign: number;
    }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "buyDecor"; readonly decorId: DecorId }
  | { readonly type: "setGuide"; readonly on: boolean }
  | { readonly type: "markBeatSeen"; readonly beatId: string }
  | {
      readonly type: "chooseStoryOption";
      readonly beatId: string;
      readonly choiceId: string;
      readonly lineNameId: LineNameId | null;
    }
  | { readonly type: "openLoft"; readonly lineNameId: LineNameId }
  | { readonly type: "setBenchTour"; readonly on: boolean }
  | { readonly type: "pickLaunchTheme"; readonly themeId: LaunchThemeId }
  | { readonly type: "restLine" }
  | { readonly type: "renameLine"; readonly lineNameId: LineNameId }
  | { readonly type: "confirmCollection"; readonly brief: CollectionBrief }
  | { readonly type: "buyGems"; readonly picks: readonly number[] }
  | { readonly type: "startCollectionPiece"; readonly slot: number }
  | { readonly type: "choosePotStones"; readonly indices: readonly number[] }
  | {
      readonly type: "recordTwinJoin";
      readonly ticks: number;
      readonly seams: readonly [TwinSeam, TwinSeam];
      readonly assisted: boolean;
    }
  | { readonly type: "addToCollection" }
  | {
      readonly type: "styleLookbookPage";
      readonly pieceId: string;
      readonly backdrop: BackdropId;
      readonly props: readonly PropChoice[];
    }
  | { readonly type: "styleEveryPage"; readonly fromPieceId: string }
  | {
      readonly type: "snapLookbookPage";
      readonly pieceId: string;
      readonly lampAngle: number;
      readonly assisted: boolean;
    }
  | { readonly type: "closeLookbook" }
  | {
      readonly type: "stageLaunch";
      readonly order: readonly string[];
      readonly lantern: LanternColourId;
      readonly music: MusicMoodId;
      readonly card: number;
    }
  | { readonly type: "moveSpot" }
  | {
      readonly type: "openPopup";
      readonly plinth: string;
      readonly tags: Readonly<Record<string, PriceTagId>>;
      readonly shelf: readonly string[];
    };
