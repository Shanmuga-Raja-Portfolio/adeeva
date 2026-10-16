import type { FairAction } from "./action";
import { pickFairSet } from "./fairPick";
import { chooseFairTheme, restShowroom } from "./fairSeason";
import { moveUpBooth, stageFair } from "./fairStage";
import type { GameState } from "./gameState";

export function reduceFair(state: GameState, action: FairAction): GameState {
  switch (action.type) {
    case "chooseFairTheme":
      return chooseFairTheme(state, action.themeId);
    case "restShowroom":
      return restShowroom(state);
    case "pickFairSet":
      return pickFairSet(state, action.setId);
    case "stageFair":
      return stageFair(state, action.plan);
    case "moveUpBooth":
      return moveUpBooth(state);
  }
}
