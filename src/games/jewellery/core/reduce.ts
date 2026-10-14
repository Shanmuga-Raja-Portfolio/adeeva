import { buyUpgrade } from "../../../engine/upgrades";
import type { Action } from "./action";
import { endDay, workShift } from "./calendar";
import { knownUpgrade } from "./catalog";
import { cutPath } from "./cutRecord";
import { buyDecor } from "./decorShop";
import { deliver, finishStall } from "./delivery";
import { chooseMetal, chooseOption, chooseStone } from "./design";
import { addCharm, chooseChain, chooseFinish, moveCharm, removeCharm } from "./displayChoice";
import type { GameState } from "./gameState";
import { setGuide } from "./guide";
import { recordJoin, restartJoin } from "./joinRecord";
import { showTray } from "./marketDay";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offers";
import { buffPart, polishStroke, restartPolish } from "./polish";
import { abandonRun, startOrder, startStall } from "./runLifecycle";
import { placePart, removePart, showMePlan } from "./sheetPlan";
import { goToStage } from "./stageNavigation";
import { setStone } from "./stoneSetting";
import { seeBeat } from "./storyQueue";
import { buySupplies } from "./supplies";

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
    case "startStall":
      return startStall(state, action.productId);
    case "abandonRun":
      return abandonRun(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "chooseOption":
      return chooseOption(state, action.slot, action.optionId);
    case "chooseMetal":
      return chooseMetal(state, action.metalId);
    case "chooseStone":
      return chooseStone(state, action.stoneId);
    case "buySupplies":
      return buySupplies(state, action.cart);
    case "placePart":
      return placePart(state, action.partKey, {
        size: action.size,
        x: action.x,
        y: action.y,
        rotation: action.rotation,
      });
    case "removePart":
      return removePart(state, action.partKey);
    case "showMePlan":
      return showMePlan(state);
    case "cutPath":
      return cutPath(state, action.pathId, action.strokes, action.pxPerMm, action.assisted);
    case "recordJoin":
      return recordJoin(state, action.jointId, {
        ticks: action.ticks,
        insideTicks: action.insideTicks,
        overTicks: action.overTicks,
        assisted: action.assisted,
      });
    case "restartJoin":
      return restartJoin(state, action.jointId);
    case "setStone":
      return setStone(
        state,
        action.seatKey,
        { x: action.x, y: action.y, rotation: action.rotation },
        action.claws,
        action.assisted,
      );
    case "polishStroke":
      return polishStroke(state, action.partKey, action.samples, action.pxPerMm);
    case "buffPart":
      return buffPart(state, action.partKey);
    case "restartPolish":
      return restartPolish(state, action.partKey);
    case "chooseFinish":
      return chooseFinish(state, action.finish, action.glaze);
    case "chooseChain":
      return chooseChain(state, action.chain, action.cordColour);
    case "addCharm":
      return addCharm(state, action.charmId, action.x, action.y);
    case "moveCharm":
      return moveCharm(state, action.charmPieceId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeCharm":
      return removeCharm(state, action.charmPieceId);
    case "deliver":
      return deliver(state);
    case "finishStall":
      return finishStall(state);
    case "showTray":
      return showTray(state, { slots: action.slots, cloth: action.cloth, sign: action.sign });
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "buyUpgrade":
      return buyUpgrade(state, knownUpgrade(action.upgradeId));
    case "buyDecor":
      return buyDecor(state, action.decorId);
    case "setGuide":
      return setGuide(state, action.on);
    case "markBeatSeen":
      return seeBeat(state, action.beatId);
  }
}
