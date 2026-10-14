import type { FairAction } from "./action";
import { bakeTogether } from "./bakeTogether";
import { chooseWord, toggleFlourish } from "./design";
import { chooseFairTheme } from "./fairSeason";
import { moveUpTent, stageFair } from "./fairStage";
import type { GameState } from "./gameState";
import { startShowpiece } from "./showpiece";

export function reduceFair(state: GameState, action: FairAction): GameState {
  switch (action.type) {
    case "chooseFairTheme":
      return chooseFairTheme(state, action.themeId);
    case "startShowpiece":
      return startShowpiece(state);
    case "toggleFlourish":
      return toggleFlourish(state, action.flourish);
    case "chooseWord":
      return chooseWord(state, action.word);
    case "bakeTogether":
      return bakeTogether(state, {
        heat: action.heat,
        turnedMinutes: action.turnedMinutes,
        takenMinutes: action.takenMinutes,
        assisted: action.assisted,
      });
    case "stageFair":
      return stageFair(state, action.plan);
    case "moveUpTent":
      return moveUpTent(state);
  }
}
