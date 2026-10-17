import { isObjectList } from "../../../engine/parse";
import type { Action } from "./action";
import { setBenchTour } from "./benchTour";
import { confirmCollection } from "./collectionBoard";
import { lineBriefShapeParser } from "./collectionParsers";
import { addToCollection } from "./collectionPiece";
import { startCollectionPiece } from "./collectionRun";
import type { GameState } from "./gameState";
import { pickLaunchTheme, renameLine, restLine } from "./launchSeason";
import { openLoft } from "./loftOffer";
import { choosePotStones, buyGems } from "./stonePot";
import { chooseStoryOption } from "./storyChoice";
import { recordTwinJoin } from "./twinLamp";

export type CollectionAction = Extract<
  Action,
  {
    readonly type:
      | "chooseStoryOption"
      | "openLoft"
      | "setBenchTour"
      | "pickLaunchTheme"
      | "restLine"
      | "renameLine"
      | "confirmCollection"
      | "buyGems"
      | "startCollectionPiece"
      | "choosePotStones"
      | "recordTwinJoin"
      | "addToCollection";
  }
>;

export function reduceCollection(state: GameState, action: CollectionAction): GameState {
  switch (action.type) {
    case "chooseStoryOption":
      return chooseStoryOption(state, action.beatId, action.choiceId, action.lineNameId);
    case "openLoft":
      return openLoft(state, action.lineNameId);
    case "setBenchTour":
      return setBenchTour(state, action.on);
    case "pickLaunchTheme":
      return pickLaunchTheme(state, action.themeId);
    case "restLine":
      return restLine(state);
    case "renameLine":
      return renameLine(state, action.lineNameId);
    case "confirmCollection":
      return lineBriefShapeParser(action.brief, "brief").ok ? confirmCollection(state, action.brief) : state;
    case "buyGems":
      return Array.isArray(action.picks) ? buyGems(state, action.picks) : state;
    case "startCollectionPiece":
      return startCollectionPiece(state, action.slot);
    case "choosePotStones":
      return Array.isArray(action.indices) ? choosePotStones(state, action.indices) : state;
    case "recordTwinJoin":
      return isObjectList(action.seams)
        ? recordTwinJoin(state, action.ticks, action.seams, action.assisted)
        : state;
    case "addToCollection":
      return addToCollection(state);
  }
}
