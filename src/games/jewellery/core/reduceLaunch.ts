import { isObjectList, isPlainObject } from "../../../engine/parse";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { canStageLaunch, moveSpot, stageLaunch } from "./launchPlan";
import { closeLookbook, snapLookbookPage, styleEveryPage, styleLookbookPage } from "./lookbook";
import { openPopup } from "./popupSale";

export type LaunchAction = Extract<
  Action,
  {
    readonly type:
      | "styleLookbookPage"
      | "styleEveryPage"
      | "snapLookbookPage"
      | "closeLookbook"
      | "stageLaunch"
      | "moveSpot"
      | "openPopup";
  }
>;

export function reduceLaunch(state: GameState, action: LaunchAction): GameState {
  switch (action.type) {
    case "styleLookbookPage":
      return isObjectList(action.props)
        ? styleLookbookPage(state, action.pieceId, action.backdrop, action.props)
        : state;
    case "styleEveryPage":
      return styleEveryPage(state, action.fromPieceId);
    case "snapLookbookPage":
      return snapLookbookPage(state, action.pieceId, action.lampAngle, action.assisted);
    case "closeLookbook":
      return closeLookbook(state);
    case "stageLaunch": {
      if (!Array.isArray(action.order)) return state;
      const plan = { order: action.order, lantern: action.lantern, music: action.music, card: action.card };
      return canStageLaunch(state, plan).ok ? stageLaunch(state, plan) : state;
    }
    case "moveSpot":
      return moveSpot(state);
    case "openPopup":
      return isPlainObject(action.tags) && Array.isArray(action.shelf)
        ? openPopup(state, { plinth: action.plinth, tags: action.tags, shelf: action.shelf })
        : state;
  }
}
