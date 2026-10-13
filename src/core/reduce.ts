import type { Action } from "./action";
import { assignSlot } from "./assembly";
import { endDay, workShift } from "./calendar";
import { placePiece, removePiece, rotatePiece } from "./cutLayout";
import { commitCut } from "./cutCommit";
import { addDecoration, moveDecoration, removeDecoration } from "./decoration";
import { deliver } from "./delivery";
import type { GameState } from "./gameState";
import { launchLabel } from "./labelLaunch";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offerResponse";
import { abandonRun, startLook, startRun } from "./runLifecycle";
import { chooseRunway, stageRunway } from "./runway";
import { startNextSeason } from "./seasonFlow";
import { recordSeam, resetSeam } from "./sewing";
import { buyFabric, buyTrim, closeShop, openShop } from "./shop";
import { chooseSketchFabric, chooseSketchPart } from "./sketch";
import { goToStage } from "./stageNavigation";
import { chooseStoryOption } from "./storyChoice";
import { markBeatSeen } from "./storyQueue";
import { buyUpgrade, fireAssistant, hireAssistant } from "./studio";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "newGame":
      return newGameIssues(action).length > 0 ? state : createGame(action);
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startRun":
      return startRun(state, action.gigId);
    case "startLook":
      return startLook(state, action.lookIndex);
    case "abandonRun":
      return abandonRun(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "chooseSketchPart":
      return chooseSketchPart(state, action.category, action.partId);
    case "chooseSketchFabric":
      return chooseSketchFabric(state, action.category, action.fabricId);
    case "openShop":
      return openShop(state);
    case "closeShop":
      return closeShop(state);
    case "buyFabric":
      return buyFabric(state, action.fabricId, action.metres);
    case "buyTrim":
      return buyTrim(state, action.trimId, action.count);
    case "placePiece":
      return placePiece(state, action.pieceId, action.x, action.y, action.rotation);
    case "rotatePiece":
      return rotatePiece(state, action.pieceId, action.rotation);
    case "removePiece":
      return removePiece(state, action.pieceId);
    case "commitCut":
      return commitCut(state, action.fabricId, action.accuracies);
    case "assignSlot":
      return assignSlot(state, action.slot, action.pieceId);
    case "recordSeam":
      return recordSeam(state, action.seamId, {
        progress: action.progress,
        ticks: action.ticks,
        insideTicks: action.insideTicks,
        assisted: action.assisted,
      });
    case "resetSeam":
      return resetSeam(state, action.seamId);
    case "addDecoration":
      return addDecoration(state, action.trimId, action.x, action.y);
    case "moveDecoration":
      return moveDecoration(state, action.decorationId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeDecoration":
      return removeDecoration(state, action.decorationId);
    case "deliver":
      return deliver(state);
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "hireAssistant":
      return hireAssistant(state);
    case "fireAssistant":
      return fireAssistant(state);
    case "buyUpgrade":
      return buyUpgrade(state, action.upgradeId);
    case "chooseRunway":
      return chooseRunway(state, action.order, action.mood, action.light);
    case "stageRunway":
      return stageRunway(state);
    case "startNextSeason":
      return startNextSeason(state, action.themeId);
    case "launchLabel":
      return launchLabel(state);
    case "markBeatSeen":
      return markBeatSeen(state, action.beatId);
    case "chooseStoryOption":
      return chooseStoryOption(state, action.beatId, action.choiceId);
  }
}
