import type { Action } from "./action";
import { endDay, workShift } from "./calendar";
import { scrubStain, soakStains } from "./clean";
import { commitCut } from "./cutCommit";
import { traceCut } from "./cutTrace";
import { deliver } from "./delivery";
import { choosePart, chooseRecipe } from "./designChoice";
import { chooseFinds } from "./findChoice";
import { addFinish, moveFinish, removeFinish } from "./finishing";
import type { GameState } from "./gameState";
import { autoLayout, placePiece, removePiece } from "./layout";
import { buyFinds, closeMarket, openMarket } from "./market";
import { acceptOffer, declineOffer } from "./offers";
import { abandonFlip, startFlip, startOwnFlip } from "./runLifecycle";
import { recordSeam, resetSeam } from "./sewing";
import { goToStage } from "./stageNavigation";
import { holdStall } from "./stallDay";
import { markBeatSeen } from "../../../engine/story";
import { pullStitch } from "./unpick";
import { buyUpgrade } from "../../../engine/upgrades";
import { knownUpgrade, storyBeatById } from "./catalog";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startFlip":
      return startFlip(state, action.gigId);
    case "startOwnFlip":
      return startOwnFlip(state);
    case "abandonFlip":
      return abandonFlip(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "chooseRecipe":
      return chooseRecipe(state, action.recipeId);
    case "choosePart":
      return choosePart(state, action.groupId, action.partId);
    case "openMarket":
      return openMarket(state);
    case "closeMarket":
      return closeMarket(state);
    case "buyFinds":
      return buyFinds(state, action.slotIds);
    case "chooseFinds":
      return chooseFinds(state, action.findIds);
    case "pullStitch":
      return pullStitch(state, action);
    case "scrubStain":
      return scrubStain(state, action);
    case "soakStains":
      return soakStains(state);
    case "placePiece":
      return placePiece(state, action.pieceId, action.x, action.y, action.rotation);
    case "removePiece":
      return removePiece(state, action.pieceId);
    case "autoLayout":
      return autoLayout(state);
    case "traceCut":
      return traceCut(state, action.pieceId, action.samples);
    case "commitCut":
      return commitCut(state, action.assisted);
    case "recordSeam":
      return recordSeam(state, action.seamId, {
        progress: action.progress,
        ticks: action.ticks,
        insideTicks: action.insideTicks,
        assisted: action.assisted,
      });
    case "resetSeam":
      return resetSeam(state, action.seamId);
    case "addFinish":
      return addFinish(state, action.finish, action.x, action.y);
    case "moveFinish":
      return moveFinish(state, action.finishId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeFinish":
      return removeFinish(state, action.finishId);
    case "deliver":
      return deliver(state);
    case "holdStall":
      return holdStall(state, action.prices);
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "buyUpgrade":
      return buyUpgrade(state, knownUpgrade(action.upgradeId));
    case "markBeatSeen":
      return markBeatSeen(state, action.beatId, storyBeatById);
  }
}
