import type { Action } from "./action";
import { coachCrew } from "./coachCrew";
import { assignCrew, finishCrew, hireCrew } from "./crewBoard";
import type { GameState } from "./gameState";
import { stageOpenHouse } from "./homeOpenHouse";
import { clearSpace, confirmMap, placePurpose, takeAchebeMap } from "./homeMap";
import { confirmPalette, setHallFloor, togglePalettePaint, takeAchebePalette } from "./homePalette";
import { closeHomeRoom, openHomeRoom } from "./homeRoom";
import { openLarkspur } from "./openLarkspur";
import { planOpenHouse } from "./openHousePlan";
import { pickTray } from "./paintRoll";
import { chooseNextPlot } from "./plotProgress";
import { startProject } from "./project";
import { topUpPurse } from "./purseTopUp";
import { chooseStoryOption } from "./storyChoice";

export type LarkspurAction = Extract<
  Action,
  {
    readonly type:
      | "chooseStoryOption"
      | "openLarkspur"
      | "startProject"
      | "placePurpose"
      | "clearSpace"
      | "useAchebeMap"
      | "confirmMap"
      | "togglePalettePaint"
      | "setHallFloor"
      | "useAchebePalette"
      | "confirmPalette"
      | "openHomeRoom"
      | "closeHomeRoom"
      | "topUpPurse"
      | "hireCrew"
      | "finishCrew"
      | "assignCrew"
      | "coachCrew"
      | "planOpenHouse"
      | "stageOpenHouse"
      | "chooseNextPlot"
      | "pickTray";
  }
>;

export function reduceLarkspur(state: GameState, action: LarkspurAction): GameState {
  switch (action.type) {
    case "chooseStoryOption":
      return chooseStoryOption(state, action.beatId, action.choiceId);
    case "openLarkspur":
      return openLarkspur(state);
    case "startProject":
      return startProject(state, action.storyId);
    case "placePurpose":
      return placePurpose(state, action.purposeId, action.spaceIndex);
    case "clearSpace":
      return clearSpace(state, action.spaceIndex);
    case "useAchebeMap":
      return takeAchebeMap(state);
    case "confirmMap":
      return confirmMap(state);
    case "togglePalettePaint":
      return togglePalettePaint(state, action.paintId);
    case "setHallFloor":
      return setHallFloor(state, action.floorId);
    case "useAchebePalette":
      return takeAchebePalette(state);
    case "confirmPalette":
      return confirmPalette(state);
    case "openHomeRoom":
      return openHomeRoom(state, action.roomIndex);
    case "closeHomeRoom":
      return closeHomeRoom(state);
    case "topUpPurse":
      return topUpPurse(state);
    case "hireCrew":
      return hireCrew(state, action.crewId);
    case "finishCrew":
      return finishCrew(state, action.crewId);
    case "assignCrew":
      return assignCrew(state, action.crewId, action.roomIndex, action.job);
    case "coachCrew":
      return coachCrew(state, action.record);
    case "planOpenHouse":
      return planOpenHouse(state, action.plan);
    case "stageOpenHouse":
      return stageOpenHouse(state);
    case "chooseNextPlot":
      return chooseNextPlot(state, action.move);
    case "pickTray":
      return pickTray(state, action.zone);
  }
}
