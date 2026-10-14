import type { Action, DishRun, GameState } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: DishRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
