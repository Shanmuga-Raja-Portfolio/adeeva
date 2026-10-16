import type { Point } from "../../../engine/geometry/point";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { RecipeId } from "../content/recipe";
import type { RunwayLightId } from "../../adeeva/content/runwayLight";
import type { MusicMoodId } from "../../../engine/musicMood";
import type { ShopSignId } from "../content/shopSign";
import type { UpgradeId } from "../content/upgrade";
import type { WindowPropId } from "../content/windowProp";
import type { WindowPiece, WindowProp } from "./boutique";
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
  | { readonly type: "markBeatSeen"; readonly beatId: string }
  | {
      readonly type: "chooseStoryOption";
      readonly beatId: string;
      readonly choiceId: string;
      readonly signId: ShopSignId | null;
    }
  | { readonly type: "openBoutique"; readonly signId: ShopSignId }
  | { readonly type: "shelvePiece"; readonly pieceId: string }
  | { readonly type: "unshelvePiece"; readonly pieceId: string }
  | { readonly type: "fillShelf" }
  | {
      readonly type: "dressWindow";
      readonly pieces: readonly WindowPiece[];
      readonly props: readonly WindowProp[];
    }
  | { readonly type: "buyProp"; readonly propId: WindowPropId }
  | {
      readonly type: "stageShowcase";
      readonly order: readonly string[];
      readonly mood: MusicMoodId;
      readonly light: RunwayLightId;
      readonly cards: Readonly<Record<string, string>>;
    }
  | {
      readonly type: "tablePull";
      readonly tableId: string;
      readonly stitch: number;
      readonly distanceCm: number;
      readonly assisted: boolean;
    }
  | {
      readonly type: "tableScrub";
      readonly tableId: string;
      readonly cellTicks: readonly number[];
      readonly harshTicks: number;
      readonly scrubTicks: number;
    }
  | { readonly type: "tableSoak"; readonly tableId: string }
  | {
      readonly type: "tableSew";
      readonly tableId: string;
      readonly progress: number;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly assisted: boolean;
    }
  | { readonly type: "resetTableSeam"; readonly tableId: string }
  | { readonly type: "swapFind"; readonly slotId: string; readonly findKey: string };
