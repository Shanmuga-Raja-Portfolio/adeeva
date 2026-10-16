import { withGuide } from "../../../engine/guide";
import { buyUpgrade } from "../../../engine/upgrades";
import type { Action } from "./action";
import { endDay, workShift } from "./calendar";
import { knownUpgrade } from "./catalog";
import { addDecor, moveDecor, removeDecor, setSoftColour } from "./decorPlacement";
import { layFloor } from "./floorLay";
import type { GameState } from "./gameState";
import { liftLight, placeLight, showMeLight } from "./lightPlacement";
import { buyLoftDecor } from "./loftShop";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offers";
import { recordEdge } from "./paintEdge";
import { reloadRoller, rollStroke } from "./paintRoll";
import { assistPaint } from "./paintScore";
import {
  addLight,
  chooseFloor,
  choosePaint,
  placePiece,
  removeLight,
  removePiece,
  rotatePiece,
  tidyUp,
} from "./planChoice";
import { reveal } from "./reveal";
import { abandonRun, startOrder } from "./runLifecycle";
import { goToStage } from "./stageNavigation";
import { seeBeat } from "./storyQueue";
import { buyDecor, buyPlan } from "./warehouse";
import { reduceLarkspur } from "./reduceLarkspur";
import { upgradeOpen } from "./upgradeShop";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "newGame":
      return newGameIssues(action).length > 0 ? state : createGame(action);
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startOrder":
      return startOrder(state, action.gigId);
    case "abandonRun":
      return abandonRun(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "placePiece":
      return placePiece(state, {
        pieceId: action.pieceId,
        furnitureId: action.furnitureId,
        col: action.col,
        row: action.row,
        rotation: action.rotation,
      });
    case "rotatePiece":
      return rotatePiece(state, action.pieceId);
    case "removePiece":
      return removePiece(state, action.pieceId);
    case "tidyUp":
      return tidyUp(state);
    case "choosePaint":
      return choosePaint(state, action.slot, action.paintId);
    case "chooseFloor":
      return chooseFloor(state, action.floorId);
    case "addLight":
      return addLight(state, action.lightId);
    case "removeLight":
      return removeLight(state, action.index);
    case "buyPlan":
      return buyPlan(state);
    case "buyDecor":
      return buyDecor(state, action.decorId);
    case "edgePath":
      return recordEdge(state, action.pathId, action.samples);
    case "rollStroke":
      return rollStroke(state, action.wall, { points: action.points, durationMs: action.durationMs });
    case "reloadRoller":
      return reloadRoller(state);
    case "assistPaint":
      return assistPaint(state, action.wall);
    case "layFloor":
      return layFloor(state, {
        pieceIndex: action.pieceIndex,
        candidateKey: action.candidateKey,
        x: action.x,
        y: action.y,
        assisted: action.assisted,
      });
    case "placeLight":
      return placeLight(state, action.index, action.col, action.row);
    case "liftLight":
      return liftLight(state, action.index);
    case "showMeLight":
      return showMeLight(state);
    case "addDecor":
      return addDecor(state, action.decorId, action.x, action.y);
    case "moveDecor":
      return moveDecor(state, action.decorPieceId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeDecor":
      return removeDecor(state, action.decorPieceId);
    case "setSoftColour":
      return setSoftColour(state, action.colour);
    case "reveal":
      return reveal(state);
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "buyUpgrade": {
      const upgrade = knownUpgrade(action.upgradeId);
      return upgrade !== undefined && upgradeOpen(state, upgrade) ? buyUpgrade(state, upgrade) : state;
    }
    case "buyLoftDecor":
      return buyLoftDecor(state, action.decorId);
    case "setGuide":
      return withGuide(state, action.on);
    case "markBeatSeen":
      return seeBeat(state, action.beatId);
    default:
      return reduceLarkspur(state, action);
  }
}
