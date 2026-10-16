import type { ShowroomAction } from "./action";
import { giveRenWeekOff, takeRenOn } from "./apprentice";
import { handToRen } from "./apprenticeJob";
import { setBenchTour } from "./benchTour";
import { arrangeFloorPiece } from "./floorArrange";
import type { GameState } from "./gameState";
import { planTheRest } from "./planTheRest";
import { finishSet } from "./setFinish";
import { chooseSetJoint } from "./setJoint";
import { startSet } from "./setStart";
import { markFloorSet, pickOpenHouse } from "./showroomFloor";
import { openShowroomLater } from "./showroomOffer";
import { chooseStoryOption } from "./storyChoice";
import { sawLikeFirst } from "./twinSaw";

export function reduceShowroom(state: GameState, action: ShowroomAction): GameState {
  switch (action.type) {
    case "chooseStoryOption":
      return chooseStoryOption(state, action.beatId, action.choiceId);
    case "setBenchTour":
      return setBenchTour(state, action.on);
    case "openShowroom":
      return openShowroomLater(state);
    case "startSet":
      return startSet(state, action.templateId);
    case "chooseSetJoint":
      return chooseSetJoint(state, action.kind);
    case "planTheRest":
      return planTheRest(state);
    case "sawLikeFirst":
      return sawLikeFirst(state, action.partId);
    case "finishSet":
      return finishSet(state);
    case "markFloorSet":
      return markFloorSet(state, action.setId, action.mode);
    case "pickOpenHouse":
      return pickOpenHouse(state, action.setId);
    case "arrangeFloorPiece":
      return arrangeFloorPiece(state, action.setId, action.piece, {
        x: action.x,
        y: action.y,
        rotation: action.rotation,
      });
    case "takeRenOn":
      return takeRenOn(state);
    case "giveRenWeekOff":
      return giveRenWeekOff(state);
    case "handToRen":
      return handToRen(state, action.job);
  }
}
