import { withGuide } from "../../../engine/guide";
import type { Action, FairAction, SalonAction } from "./action";
import { closeCounter, openCounter, sellBox } from "./boxItUp";
import { endDay, workShift } from "./calendar";
import { deliver } from "./delivery";
import { chooseFilling, chooseMix, choosePattern, chooseProduct, toggleColour } from "./design";
import type { GameState } from "./gameState";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offers";
import { bakeBatch } from "./oven";
import { buyPantry } from "./pantry";
import { pipePath } from "./pipe";
import { abandonRun, startOrder, startTray } from "./runLifecycle";
import { assignStack, fill } from "./stack";
import { goToStage } from "./stageNavigation";
import { recordStir } from "./stir";
import { markBeatSeen } from "../../../engine/story";
import { addTopping, moveTopping, removeTopping } from "./toppingPlacement";
import { buyUpgrade } from "../../../engine/upgrades";
import { knownUpgrade, storyBeatById } from "./catalog";
import { reduceFair } from "./reduceFair";
import { reduceSalon } from "./reduceSalon";
import { chooseStoryOption } from "./storyChoice";
import { upgradeAllowed } from "./upgradeShop";
import { commitBatch, crackEgg, recordWeigh } from "./weigh";

const SALON_ACTIONS: readonly SalonAction["type"][] = [
  "openSalon",
  "restParlour",
  "setSalonMenu",
  "startSalonTray",
  "chooseSplit",
  "openTables",
  "closeTables",
  "plateItem",
  "unplateItem",
  "pourTea",
  "serveTable",
];

const FAIR_ACTIONS: readonly FairAction["type"][] = [
  "chooseFairTheme",
  "startShowpiece",
  "toggleFlourish",
  "chooseWord",
  "bakeTogether",
  "stageFair",
  "moveUpTent",
];

function isSalonAction(action: Action): action is SalonAction {
  return SALON_ACTIONS.some((type) => type === action.type);
}

function isFairAction(action: Action): action is FairAction {
  return FAIR_ACTIONS.some((type) => type === action.type);
}

export function reduce(state: GameState, action: Action): GameState {
  if (isSalonAction(action)) return reduceSalon(state, action);
  if (isFairAction(action)) return reduceFair(state, action);
  return reduceBakery(state, action);
}

function reduceBakery(state: GameState, action: Exclude<Action, SalonAction | FairAction>): GameState {
  switch (action.type) {
    case "newGame":
      return newGameIssues(action).length > 0 ? state : createGame(action);
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startOrder":
      return startOrder(state, action.gigId);
    case "startTray":
      return startTray(state, action.productId);
    case "abandonRun":
      return abandonRun(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "chooseProduct":
      return chooseProduct(state, action.productId);
    case "chooseMix":
      return chooseMix(state, action.batch, action.mixId);
    case "chooseFilling":
      return chooseFilling(state, action.fillingId);
    case "toggleColour":
      return toggleColour(state, action.colour);
    case "choosePattern":
      return choosePattern(state, action.pattern);
    case "buyPantry":
      return buyPantry(state, action.cart);
    case "recordWeigh":
      return recordWeigh(state, action.batch, action.ingredientId, {
        grams: action.grams,
        actions: action.actions,
        assisted: action.assisted,
      });
    case "crackEgg":
      return crackEgg(state, action.batch);
    case "commitBatch":
      return commitBatch(state, action.batch);
    case "recordStir":
      return recordStir(state, action.batch, {
        progress: action.progress,
        ticks: action.ticks,
        insideTicks: action.insideTicks,
        assisted: action.assisted,
      });
    case "bakeBatch":
      return bakeBatch(state, action.batch, {
        heat: action.heat,
        turnedMinutes: action.turnedMinutes,
        takenMinutes: action.takenMinutes,
        assisted: action.assisted,
      });
    case "assignStack":
      return assignStack(state, action.slot, action.pieceId);
    case "fill":
      return fill(state);
    case "pipePath":
      return pipePath(state, action.pathId, action.samples, action.assisted);
    case "addTopping":
      return addTopping(state, action.toppingId, action.x, action.y);
    case "moveTopping":
      return moveTopping(state, action.toppingId, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
        scale: action.scale,
        layer: action.layer,
      });
    case "removeTopping":
      return removeTopping(state, action.toppingId);
    case "deliver":
      return deliver(state);
    case "openCounter":
      return openCounter(state);
    case "sellBox":
      return sellBox(state, action.cardIndex, action.trayIds);
    case "closeCounter":
      return closeCounter(state);
    case "endDay":
      return endDay(state);
    case "workShift":
      return workShift(state);
    case "buyUpgrade":
      return upgradeAllowed(state, action.upgradeId)
        ? buyUpgrade(state, knownUpgrade(action.upgradeId))
        : state;
    case "setGuide":
      return withGuide(state, action.on);
    case "markBeatSeen":
      return (storyBeatById(action.beatId)?.choices.length ?? 0) > 0
        ? state
        : markBeatSeen(state, action.beatId, storyBeatById);
    case "chooseStoryOption":
      return chooseStoryOption(state, action.beatId, action.choiceId);
  }
}
