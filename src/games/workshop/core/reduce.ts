import type { Action } from "./action";
import { placePart, removePart, showMe } from "./boardLayout";
import { endDay, workShift } from "./calendar";
import { chooseCushion, recordCushionSeam, resetCushionSeam } from "./cushion";
import { buyDecor } from "./decorShop";
import { deliver } from "./delivery";
import { chooseOption, chooseProduct, chooseWood } from "./design";
import { addExtra, chooseFinish, moveExtra, removeExtra } from "./finishChoice";
import type { GameState } from "./gameState";
import { resetJoint, seatJoint } from "./joint";
import { acceptOffer, declineOffer } from "./offers";
import { setAside, startCommission } from "./runLifecycle";
import { resetSurface, sandDrag } from "./sanding";
import { sawAssist, sawCut } from "./sawRecord";
import { goToStage } from "./stageNavigation";
import { seeBeat } from "./storyQueue";
import { buyBoards, buyPlan } from "./timberYard";
import { buyGarageUpgrade } from "./upgradeShop";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startCommission":
      return startCommission(state, action.gigId);
    case "setAside":
      return setAside(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "chooseProduct":
      return chooseProduct(state, action.productId);
    case "chooseOption":
      return chooseOption(state, action.slot, action.optionId);
    case "chooseWood":
      return chooseWood(state, action.woodId);
    case "buyBoards":
      return buyBoards(state, action.sizes);
    case "buyPlan":
      return buyPlan(state);
    case "placePart":
      return placePart(state, action.partId, action.boardId, action.x, action.y, action.rotation);
    case "removePart":
      return removePart(state, action.partId);
    case "showMe":
      return showMe(state, action.partId);
    case "sawCut":
      return sawCut(state, action.partId, action.cut, action.samples);
    case "sawAssist":
      return sawAssist(state, action.partId);
    case "seatJoint":
      return seatJoint(state, action.jointId, action.pose, action.goodTaps, action.assisted);
    case "resetJoint":
      return resetJoint(state, action.jointId);
    case "sandDrag":
      return sandDrag(state, action.surfaceId, action.points, action.assisted);
    case "resetSurface":
      return resetSurface(state, action.surfaceId);
    case "chooseFinish":
      return chooseFinish(state, action.finishId, action.paint);
    case "addExtra":
      return addExtra(state, action.extraId, action.x, action.y);
    case "moveExtra":
      return moveExtra(state, action.placedId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeExtra":
      return removeExtra(state, action.placedId);
    case "chooseCushion":
      return chooseCushion(state, action.fabricId);
    case "recordSeam":
      return recordCushionSeam(state, {
        progress: action.progress,
        ticks: action.ticks,
        insideTicks: action.insideTicks,
        assisted: action.assisted,
      });
    case "resetSeam":
      return resetCushionSeam(state);
    case "deliver":
      return deliver(state);
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "buyUpgrade":
      return buyGarageUpgrade(state, action.upgradeId);
    case "buyDecor":
      return buyDecor(state, action.decorId, action.paint);
    case "markBeatSeen":
      return seeBeat(state, action.beatId);
  }
}
