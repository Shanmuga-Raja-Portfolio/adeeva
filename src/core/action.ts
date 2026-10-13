import type { AvatarLook } from "../content/avatarOption";
import type { CareerId } from "../content/career";
import type { DifficultyId } from "../content/difficulty";
import type { PartCategory } from "../content/garmentPart";
import type { GarmentSlot } from "../content/garmentSlot";
import type { RunwayLightId } from "../content/runwayLight";
import type { RunwayMoodId } from "../content/runwayMood";
import type { TraitId } from "../content/trait";
import type { TrimId } from "../content/trim";
import type { UpgradeId } from "../content/upgrade";
import type { Rotation } from "./rotation";
import type { RunStage } from "./runStage";

export type Action =
  | {
      readonly type: "newGame";
      readonly seed: number;
      readonly name: string;
      readonly look: AvatarLook;
      readonly trait: TraitId;
      readonly difficulty: DifficultyId;
      readonly career: CareerId;
    }
  | { readonly type: "acceptOffer"; readonly offerId: string }
  | { readonly type: "declineOffer"; readonly offerId: string }
  | { readonly type: "startRun"; readonly gigId: string }
  | { readonly type: "startLook"; readonly lookIndex: number }
  | { readonly type: "abandonRun" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | { readonly type: "chooseSketchPart"; readonly category: PartCategory; readonly partId: string }
  | { readonly type: "chooseSketchFabric"; readonly category: PartCategory; readonly fabricId: string }
  | { readonly type: "openShop" }
  | { readonly type: "closeShop" }
  | { readonly type: "buyFabric"; readonly fabricId: string; readonly metres: number }
  | { readonly type: "buyTrim"; readonly trimId: TrimId; readonly count: number }
  | {
      readonly type: "placePiece";
      readonly pieceId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: Rotation;
    }
  | { readonly type: "rotatePiece"; readonly pieceId: string; readonly rotation: Rotation }
  | { readonly type: "removePiece"; readonly pieceId: string }
  | {
      readonly type: "commitCut";
      readonly fabricId: string;
      readonly accuracies: Readonly<Record<string, number>>;
    }
  | { readonly type: "assignSlot"; readonly slot: GarmentSlot; readonly pieceId: string }
  | {
      readonly type: "recordSeam";
      readonly seamId: string;
      readonly progress: number;
      readonly ticks: number;
      readonly insideTicks: number;
      readonly assisted: boolean;
    }
  | { readonly type: "resetSeam"; readonly seamId: string }
  | { readonly type: "addDecoration"; readonly trimId: TrimId; readonly x: number; readonly y: number }
  | {
      readonly type: "moveDecoration";
      readonly decorationId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
      readonly scale: number;
      readonly layer: number;
    }
  | { readonly type: "removeDecoration"; readonly decorationId: string }
  | { readonly type: "deliver" }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "hireAssistant" }
  | { readonly type: "fireAssistant" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | {
      readonly type: "chooseRunway";
      readonly order: readonly number[];
      readonly mood: RunwayMoodId;
      readonly light: RunwayLightId;
    }
  | { readonly type: "stageRunway" }
  | { readonly type: "startNextSeason"; readonly themeId: string | null }
  | { readonly type: "launchLabel" }
  | { readonly type: "markBeatSeen"; readonly beatId: string }
  | { readonly type: "chooseStoryOption"; readonly beatId: string; readonly choiceId: string };
