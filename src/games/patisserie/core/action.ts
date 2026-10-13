import type { AvatarLook } from "../../../engine/avatar";
import type { DifficultyId } from "../../../engine/difficulty";
import type { Point } from "../../../engine/geometry/point";
import type { ColourId } from "../../../engine/palette";
import type { TraitId } from "../../../engine/trait";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { MixId } from "../content/mix";
import type { PatternChoice } from "../content/pipePattern";
import type { ProductId, TrayProductId } from "../content/product";
import type { ToppingId } from "../content/topping";
import type { UpgradeId } from "../content/upgrade";
import type { PantryCart } from "./pantry";
import type { RunStage } from "./runStage";

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
  | { readonly type: "startTray"; readonly productId: TrayProductId }
  | { readonly type: "abandonRun" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | { readonly type: "chooseProduct"; readonly productId: ProductId }
  | { readonly type: "chooseMix"; readonly batch: number; readonly mixId: MixId }
  | { readonly type: "chooseFilling"; readonly fillingId: FillingId | null }
  | { readonly type: "toggleColour"; readonly colour: ColourId }
  | { readonly type: "choosePattern"; readonly pattern: PatternChoice }
  | { readonly type: "buyPantry"; readonly cart: PantryCart }
  | {
      readonly type: "recordWeigh";
      readonly batch: number;
      readonly ingredientId: IngredientId;
      readonly grams: number;
      readonly actions: number;
      readonly assisted: boolean;
    }
  | { readonly type: "crackEgg"; readonly batch: number }
  | { readonly type: "commitBatch"; readonly batch: number }
  | {
      readonly type: "recordStir";
      readonly batch: number;
      readonly progress: number;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly assisted: boolean;
    }
  | {
      readonly type: "bakeBatch";
      readonly batch: number;
      readonly heat: number;
      readonly turnedMinutes: number | null;
      readonly takenMinutes: number;
      readonly assisted: boolean;
    }
  | { readonly type: "assignStack"; readonly slot: string; readonly pieceId: string }
  | { readonly type: "fill" }
  | {
      readonly type: "pipePath";
      readonly pathId: string;
      readonly samples: readonly Point[];
      readonly assisted: boolean;
    }
  | { readonly type: "addTopping"; readonly toppingId: ToppingId; readonly x: number; readonly y: number }
  | {
      readonly type: "moveTopping";
      readonly toppingId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
      readonly scale: number;
      readonly layer: number;
    }
  | { readonly type: "removeTopping"; readonly toppingId: string }
  | { readonly type: "deliver" }
  | { readonly type: "openCounter" }
  | { readonly type: "sellBox"; readonly cardIndex: number; readonly trayIds: readonly string[] }
  | { readonly type: "closeCounter" }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "setGuide"; readonly on: boolean }
  | { readonly type: "markBeatSeen"; readonly beatId: string };
