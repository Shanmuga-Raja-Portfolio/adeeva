import type { AvatarLook } from "../../../engine/avatar";
import type { DifficultyId } from "../../../engine/difficulty";
import type { Point } from "../../../engine/geometry/point";
import type { TraitId } from "../../../engine/trait";
import type { CareerId } from "../content/career";
import type { CrewId, CrewJob } from "../content/crew";
import type { HomeStoryId } from "../content/homeStory";
import type { PurposeId } from "../content/roomPurpose";
import type { DecorId } from "../content/decor";
import type { FloorId } from "../content/floor";
import type { FurnitureId } from "../content/furniture";
import type { LightId } from "../content/light";
import type { LoftDecorId } from "../content/loftDecor";
import type { PaintId } from "../content/paint";
import type { WallId } from "../content/roomTemplate";
import type { SoftColour } from "../content/softColour";
import type { UpgradeId } from "../content/upgrade";
import type { CoachRecord } from "./coachCrew";
import type { Turn } from "./floorPlan";
import type { TourChoice } from "./larkspur";
import type { RollerZone } from "./makeoverRun";
import type { PaintSlot } from "./planChoice";
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
  | { readonly type: "startOrder"; readonly gigId: string }
  | { readonly type: "abandonRun" }
  | { readonly type: "goToStage"; readonly stage: RunStage }
  | {
      readonly type: "placePiece";
      readonly pieceId: string | null;
      readonly furnitureId: FurnitureId;
      readonly col: number;
      readonly row: number;
      readonly rotation: Turn;
    }
  | { readonly type: "rotatePiece"; readonly pieceId: string }
  | { readonly type: "removePiece"; readonly pieceId: string }
  | { readonly type: "tidyUp" }
  | { readonly type: "choosePaint"; readonly slot: PaintSlot; readonly paintId: PaintId | null }
  | { readonly type: "chooseFloor"; readonly floorId: FloorId }
  | { readonly type: "addLight"; readonly lightId: LightId }
  | { readonly type: "removeLight"; readonly index: number }
  | { readonly type: "buyPlan" }
  | { readonly type: "buyDecor"; readonly decorId: DecorId }
  | { readonly type: "edgePath"; readonly pathId: string; readonly samples: readonly Point[] }
  | {
      readonly type: "rollStroke";
      readonly wall: WallId;
      readonly points: readonly Point[];
      readonly durationMs: number;
    }
  | { readonly type: "reloadRoller" }
  | { readonly type: "pickTray"; readonly zone: RollerZone }
  | { readonly type: "assistPaint"; readonly wall: WallId }
  | {
      readonly type: "layFloor";
      readonly pieceIndex: number;
      readonly candidateKey: string;
      readonly x: number;
      readonly y: number;
      readonly assisted: boolean;
    }
  | { readonly type: "placeLight"; readonly index: number; readonly col: number; readonly row: number }
  | { readonly type: "liftLight"; readonly index: number }
  | { readonly type: "showMeLight" }
  | { readonly type: "addDecor"; readonly decorId: DecorId; readonly x: number; readonly y: number }
  | {
      readonly type: "moveDecor";
      readonly decorPieceId: string;
      readonly x: number;
      readonly y: number;
      readonly rotation: number;
      readonly scale: number;
      readonly layer: number;
    }
  | { readonly type: "removeDecor"; readonly decorPieceId: string }
  | { readonly type: "setSoftColour"; readonly colour: SoftColour }
  | { readonly type: "reveal" }
  | { readonly type: "endDay" }
  | { readonly type: "workShift" }
  | { readonly type: "buyUpgrade"; readonly upgradeId: UpgradeId }
  | { readonly type: "buyLoftDecor"; readonly decorId: LoftDecorId }
  | { readonly type: "setGuide"; readonly on: boolean }
  | { readonly type: "markBeatSeen"; readonly beatId: string }
  | { readonly type: "chooseStoryOption"; readonly beatId: string; readonly choiceId: string }
  | { readonly type: "openLarkspur" }
  | { readonly type: "startProject"; readonly storyId: HomeStoryId }
  | { readonly type: "placePurpose"; readonly purposeId: PurposeId; readonly spaceIndex: number }
  | { readonly type: "clearSpace"; readonly spaceIndex: number }
  | { readonly type: "useAchebeMap" }
  | { readonly type: "confirmMap" }
  | { readonly type: "togglePalettePaint"; readonly paintId: PaintId }
  | { readonly type: "setHallFloor"; readonly floorId: FloorId }
  | { readonly type: "useAchebePalette" }
  | { readonly type: "confirmPalette" }
  | { readonly type: "openHomeRoom"; readonly roomIndex: number }
  | { readonly type: "closeHomeRoom" }
  | { readonly type: "topUpPurse" }
  | { readonly type: "hireCrew"; readonly crewId: CrewId }
  | { readonly type: "finishCrew"; readonly crewId: CrewId }
  | {
      readonly type: "assignCrew";
      readonly crewId: CrewId;
      readonly roomIndex: number;
      readonly job: CrewJob;
    }
  | { readonly type: "coachCrew"; readonly record: CoachRecord }
  | { readonly type: "planOpenHouse"; readonly plan: TourChoice }
  | { readonly type: "stageOpenHouse" }
  | { readonly type: "chooseNextPlot"; readonly move: boolean };
