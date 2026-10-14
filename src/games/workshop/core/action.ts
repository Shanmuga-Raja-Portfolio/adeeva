import type { Point } from "../../../engine/geometry/point";
import type { ColourId } from "../../../engine/palette";
import type { PlacedPose } from "../../../engine/placedPose";
import type { BoardSizeId } from "../content/boardSize";
import type { CushionFabricId } from "../content/cushionFabric";
import type { DecorId } from "../content/decor";
import type { ExtraId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { PartOptionId, PartSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { RunStage } from "../content/runStage";
import type { UpgradeId } from "../content/upgrade";
import type { WoodId } from "../content/wood";
import type { JointPose } from "./joint";

export type Action =
  | { readonly type: "acceptOffer"; readonly offerId: string }
  | { readonly type: "declineOffer"; readonly offerId: string }
  | { readonly type: "startCommission"; readonly gigId: string }
  | { readonly type: "setAside" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | { readonly type: "chooseProduct"; readonly productId: ProductId }
  | { readonly type: "chooseOption"; readonly slot: PartSlot; readonly optionId: PartOptionId }
  | { readonly type: "chooseWood"; readonly woodId: WoodId }
  | { readonly type: "buyBoards"; readonly sizes: readonly BoardSizeId[] }
  | { readonly type: "buyPlan" }
  | {
      readonly type: "placePart";
      readonly partId: string;
      readonly boardId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
    }
  | { readonly type: "removePart"; readonly partId: string }
  | { readonly type: "showMe"; readonly partId: string | null }
  | {
      readonly type: "sawCut";
      readonly partId: string;
      readonly cut: number;
      readonly samples: readonly Point[];
    }
  | { readonly type: "sawAssist"; readonly partId: string }
  | {
      readonly type: "seatJoint";
      readonly jointId: string;
      readonly pose: JointPose;
      readonly goodTaps: number;
      readonly assisted: boolean;
    }
  | { readonly type: "resetJoint"; readonly jointId: string }
  | {
      readonly type: "sandDrag";
      readonly surfaceId: string;
      readonly points: readonly Point[];
      readonly assisted: boolean;
    }
  | { readonly type: "resetSurface"; readonly surfaceId: string }
  | { readonly type: "chooseFinish"; readonly finishId: FinishId; readonly paint: ColourId | null }
  | { readonly type: "addExtra"; readonly extraId: ExtraId; readonly x: number; readonly y: number }
  | ({ readonly type: "moveExtra"; readonly placedId: string } & PlacedPose)
  | { readonly type: "removeExtra"; readonly placedId: string }
  | { readonly type: "chooseCushion"; readonly fabricId: CushionFabricId | null }
  | {
      readonly type: "recordSeam";
      readonly progress: number;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly assisted: boolean;
    }
  | { readonly type: "resetSeam" }
  | { readonly type: "deliver" }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "buyDecor"; readonly decorId: DecorId; readonly paint: ColourId | null }
  | { readonly type: "markBeatSeen"; readonly beatId: string };
