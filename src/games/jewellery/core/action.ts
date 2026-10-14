import type { AvatarLook } from "../../../engine/avatar";
import type { DifficultyId } from "../../../engine/difficulty";
import type { Point } from "../../../engine/geometry/point";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { TraitId } from "../../../engine/trait";
import type { DecorId } from "../content/decor";
import type { ChainId, CharmId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { MetalId } from "../content/metal";
import type { OptionId, OptionSlot } from "../content/partOption";
import type { StallProductId } from "../content/product";
import type { StockSizeId } from "../content/stockSize";
import type { StoneId } from "../content/stone";
import type { TrayClothId } from "../content/stallTray";
import type { UpgradeId } from "../content/upgrade";
import type { RunStage } from "./runStage";
import type { SupplyCart } from "./supplies";

export type Action =
  | {
      readonly type: "newGame";
      readonly seed: number;
      readonly name: string;
      readonly look: AvatarLook;
      readonly trait: TraitId;
      readonly difficulty: DifficultyId;
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
  | { readonly type: "markBeatSeen"; readonly beatId: string };
