import type { AvatarLook } from "../../../engine/avatar";
import type { DifficultyId } from "../../../engine/difficulty";
import type { FollowProgress } from "../../../engine/followRecord";
import type { TraitId } from "../../../engine/trait";
import type { StartId } from "../content/career";
import type { JarId } from "../content/seasoning";
import type { StationId } from "../content/station";
import type { UpgradeId } from "../content/upgrade";
import type { ChopRecord } from "./chop";
import type { RunStage, TestRunKind } from "./dishRun";
import type { PlateRecord } from "./plate";
import type { DishSlot } from "./serviceActions";
import type { QuickRecord } from "./serviceQuick";
import type { ShiftSetup } from "./serviceSetup";
import type { SizzleRecord } from "./sizzle";

export type Action =
  | {
      readonly type: "newGame";
      readonly seed: number;
      readonly name: string;
      readonly look: AvatarLook;
      readonly trait: TraitId;
      readonly difficulty: DifficultyId;
      readonly start: StartId;
    }
  | { readonly type: "startLesson" }
  | { readonly type: "declineLesson" }
  | { readonly type: "startPractice"; readonly dishId: string }
  | { readonly type: "acceptOffer"; readonly offerId: string }
  | { readonly type: "declineOffer"; readonly offerId: string }
  | { readonly type: "startOrderDish"; readonly gigId: string; readonly dishId: string }
  | { readonly type: "startTest"; readonly test: TestRunKind; readonly dishIds: readonly string[] }
  | { readonly type: "startNextTestDish" }
  | { readonly type: "abandonRun" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | { readonly type: "placeIngredient"; readonly ingredientId: string }
  | { readonly type: "chopItem"; readonly itemIndex: number; readonly record: ChopRecord }
  | { readonly type: "cookSizzle"; readonly record: SizzleRecord }
  | { readonly type: "stirSimmer"; readonly sample: FollowProgress }
  | { readonly type: "stopSimmer" }
  | {
      readonly type: "tasteDish";
      readonly pinches: readonly JarId[];
      readonly tastes: number;
      readonly assisted: boolean;
    }
  | { readonly type: "plateDish"; readonly record: PlateRecord }
  | { readonly type: "ringBell" }
  | { readonly type: "startShift"; readonly offerId: string; readonly setup: ShiftSetup }
  | { readonly type: "startStationTest"; readonly cuisine: string }
  | {
      readonly type: "serviceStep";
      readonly slot: DishSlot;
      readonly at: number;
      readonly record: QuickRecord;
    }
  | { readonly type: "staffStep"; readonly slot: DishSlot; readonly at: number }
  | { readonly type: "assignStaff"; readonly staffId: string; readonly station: StationId | null }
  | { readonly type: "endService"; readonly at: number }
  | { readonly type: "setMenu"; readonly dishIds: readonly string[] }
  | { readonly type: "endDay" }
  | { readonly type: "potWash" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "setGuide"; readonly on: boolean }
  | { readonly type: "markBeatSeen"; readonly beatId: string }
  | { readonly type: "peekPath"; readonly path: string }
  | { readonly type: "choosePath"; readonly path: string; readonly nameCard: string | null }
  | { readonly type: "setPathMenu"; readonly dishIds: readonly string[] }
  | { readonly type: "setPrice"; readonly dishId: string; readonly price: number }
  | { readonly type: "setPar"; readonly dishId: string; readonly count: number }
  | { readonly type: "askHollis"; readonly desk: string }
  | { readonly type: "hireStaff"; readonly staffId: string }
  | { readonly type: "partWays"; readonly staffId: string }
  | { readonly type: "toggleShift"; readonly staffId: string; readonly night: number }
  | { readonly type: "openNight" }
  | { readonly type: "openFestival"; readonly helperId: string }
  | { readonly type: "prepSegment"; readonly dishId: string }
  | { readonly type: "placeCue"; readonly cue: string }
  | { readonly type: "clearCues" }
  | { readonly type: "pickTip"; readonly index: number; readonly tip: number }
  | { readonly type: "dropSegment" }
  | { readonly type: "startSegment" }
  | { readonly type: "startBook" }
  | {
      readonly type: "addRecipeCard";
      readonly chapterId: string;
      readonly dishId: string;
      readonly tip: number;
    }
  | { readonly type: "launchBook" };
