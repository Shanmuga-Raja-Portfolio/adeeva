import type { Action } from "./action";
import { askHollis } from "./askHollis";
import { endDay, potWash } from "./calendar";
import {
  chopItem,
  cookSizzle,
  placeIngredient,
  plateDish,
  stirSimmer,
  stopSimmer,
  tasteDish,
} from "./cookActions";
import { addRecipeCard, launchBook, startBook } from "./cookbook";
import { choosePath, peekPath, withCrossroadsBeat } from "./crossroads";
import { declineLesson } from "./dayBoardRoll";
import type { GameState } from "./gameState";
import { buyKitUpgrade } from "./kitShop";
import { setGuide, setMenu } from "./menu";
import { createGame, newGameIssues } from "./newGame";
import { acceptOffer, declineOffer } from "./offers";
import { ringBell } from "./passBell";
import { setPar, setPathMenu, setPrice } from "./pathMenu";
import { openNight } from "./restaurantNight";
import { hireStaff, partWays, toggleShift } from "./restaurantTeam";
import {
  abandonRun,
  startLesson,
  startNextTestDish,
  startOrderDish,
  startPractice,
  startTest,
} from "./runLifecycle";
import { clearCues, dropSegment, pickTip, placeCue, prepSegment, startSegment } from "./segment";
import { assignStaff, serviceStep, staffStep } from "./serviceActions";
import { endService } from "./serviceEnd";
import { startShift, startStationTest } from "./serviceSetup";
import { goToStage } from "./stageNavigation";
import { seeBeat } from "./storyQueue";
import { openFestival } from "./truckDay";

function kitchenStep(state: GameState, action: Action): GameState {
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
      return buyKitUpgrade(state, action.upgradeId);
    case "setGuide":
      return setGuide(state, action.on);
    case "markBeatSeen":
      return seeBeat(state, action.beatId);
    default:
      return pathStep(state, action);
  }
}

function pathStep(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "peekPath":
      return peekPath(state, action.path);
    case "choosePath":
      return choosePath(state, action.path, action.nameCard);
    case "setPathMenu":
      return setPathMenu(state, action.dishIds);
    case "setPrice":
      return setPrice(state, action.dishId, action.price);
    case "setPar":
      return setPar(state, action.dishId, action.count);
    case "askHollis":
      return askHollis(state, action.desk);
    case "hireStaff":
      return hireStaff(state, action.staffId);
    case "partWays":
      return partWays(state, action.staffId);
    case "toggleShift":
      return toggleShift(state, action.staffId, action.night);
    case "openNight":
      return openNight(state);
    case "openFestival":
      return openFestival(state, action.helperId);
    case "prepSegment":
      return prepSegment(state, action.dishId);
    case "placeCue":
      return placeCue(state, action.cue);
    case "clearCues":
      return clearCues(state);
    case "pickTip":
      return pickTip(state, action.index, action.tip);
    case "dropSegment":
      return dropSegment(state);
    case "startSegment":
      return startSegment(state);
    case "startBook":
      return startBook(state);
    case "addRecipeCard":
      return addRecipeCard(state, action.chapterId, action.dishId, action.tip);
    case "launchBook":
      return launchBook(state);
    default:
      return state;
  }
}

export function reduce(state: GameState, action: Action): GameState {
  const next = kitchenStep(state, action);
  return next === state || action.type === "newGame" ? next : withCrossroadsBeat(next);
}
