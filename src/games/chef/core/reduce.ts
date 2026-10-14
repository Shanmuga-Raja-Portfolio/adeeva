import { buyUpgrade } from "../../../engine/upgrades";
import type { Action } from "./action";
import { endDay, potWash } from "./calendar";
import { knownUpgrade } from "./catalog";
import {
  chopItem,
  cookSizzle,
  placeIngredient,
  plateDish,
  stirSimmer,
  stopSimmer,
  tasteDish,
} from "./cookActions";
import { declineLesson } from "./dayBoardRoll";
import type { GameState } from "./gameState";
import { setGuide, setMenu } from "./menu";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offers";
import { ringBell } from "./passBell";
import {
  abandonRun,
  startLesson,
  startNextTestDish,
  startOrderDish,
  startPractice,
  startTest,
} from "./runLifecycle";
import { assignStaff, serviceStep, staffStep } from "./serviceActions";
import { endService } from "./serviceEnd";
import { startShift, startStationTest } from "./serviceSetup";
import { goToStage } from "./stageNavigation";
import { seeBeat } from "./storyQueue";

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "newGame":
      return newGameIssues(action).length > 0 ? state : createGame(action);
    case "startLesson":
      return startLesson(state);
    case "declineLesson":
      return declineLesson(state);
    case "startPractice":
      return startPractice(state, action.dishId);
    case "acceptOffer":
      return acceptOffer(state, action.offerId);
    case "declineOffer":
      return declineOffer(state, action.offerId);
    case "startOrderDish":
      return startOrderDish(state, action.gigId, action.dishId);
    case "startTest":
      return startTest(state, action.test, action.dishIds);
    case "startNextTestDish":
      return startNextTestDish(state);
    case "abandonRun":
      return abandonRun(state);
    case "goToStage":
      return goToStage(state, action.stage);
    case "placeIngredient":
      return placeIngredient(state, action.ingredientId);
    case "chopItem":
      return chopItem(state, action.itemIndex, action.record);
    case "cookSizzle":
      return cookSizzle(state, action.record);
    case "stirSimmer":
      return stirSimmer(state, action.sample);
    case "stopSimmer":
      return stopSimmer(state);
    case "tasteDish":
      return tasteDish(state, action.pinches, action.tastes, action.assisted);
    case "plateDish":
      return plateDish(state, action.record);
    case "ringBell":
      return ringBell(state);
    case "startShift":
      return startShift(state, action.offerId, action.setup);
    case "startStationTest":
      return startStationTest(state, action.cuisine);
    case "serviceStep":
      return serviceStep(state, action.slot, action.at, action.record);
    case "staffStep":
      return staffStep(state, action.slot, action.at);
    case "assignStaff":
      return assignStaff(state, action.staffId, action.station);
    case "endService":
      return endService(state, action.at);
    case "setMenu":
      return setMenu(state, action.dishIds);
    case "endDay":
      return endDay(state);
    case "potWash":
      return potWash(state);
    case "buyUpgrade":
      return buyUpgrade(state, knownUpgrade(action.upgradeId));
    case "setGuide":
      return setGuide(state, action.on);
    case "markBeatSeen":
      return seeBeat(state, action.beatId);
    default:
      return state;
  }
}
