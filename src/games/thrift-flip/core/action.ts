import type { Point } from "../../../engine/geometry/point";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { RecipeId } from "../content/recipe";
import type { UpgradeId } from "../content/upgrade";
import type { FinishRequest } from "./finishing";
import type { FinishPose } from "./flipRun";
import type { FlipStage } from "./flipStage";

export type Action =
  | { readonly type: "acceptOffer"; readonly offerId: string }
  | { readonly type: "declineOffer"; readonly offerId: string }
  | { readonly type: "startFlip"; readonly gigId: string }
  | { readonly type: "startOwnFlip" }
  | { readonly type: "abandonFlip" }
  | { readonly type: "goToStage"; readonly stage: FlipStage }
  | { readonly type: "chooseRecipe"; readonly recipeId: RecipeId }
  | { readonly type: "choosePart"; readonly groupId: string; readonly partId: string }
  | { readonly type: "openMarket" }
  | { readonly type: "closeMarket" }
  | { readonly type: "buyFinds"; readonly slotIds: readonly string[] }
  | { readonly type: "chooseFinds"; readonly findIds: readonly string[] }
  | {
      readonly type: "pullStitch";
      readonly findKey: string;
      readonly line: number;
      readonly stitch: number;
      readonly distanceCm: number;
      readonly assisted: boolean;
    }
  | {
      readonly type: "scrubStain";
      readonly findKey: string;
      readonly stainId: string;
      readonly cellTicks: readonly number[];
      readonly harshTicks: number;
      readonly scrubTicks: number;
    }
  | { readonly type: "soakStains" }
  | {
      readonly type: "placePiece";
      readonly pieceId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: Rotation;
    }
  | { readonly type: "removePiece"; readonly pieceId: string }
  | { readonly type: "autoLayout" }
  | { readonly type: "traceCut"; readonly pieceId: string; readonly samples: readonly Point[] }
  | { readonly type: "commitCut"; readonly assisted: boolean }
  | {
      readonly type: "recordSeam";
      readonly seamId: string;
      readonly progress: number;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly assisted: boolean;
    }
  | { readonly type: "resetSeam"; readonly seamId: string }
  | { readonly type: "addFinish"; readonly finish: FinishRequest; readonly x: number; readonly y: number }
  | ({ readonly type: "moveFinish"; readonly finishId: string } & FinishPose)
  | { readonly type: "removeFinish"; readonly finishId: string }
  | { readonly type: "deliver" }
  | { readonly type: "holdStall"; readonly prices: Readonly<Record<string, number>> }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "markBeatSeen"; readonly beatId: string };
