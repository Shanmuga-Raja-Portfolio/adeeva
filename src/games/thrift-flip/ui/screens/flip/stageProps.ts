import type { Action, FlipRun, GameState } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: FlipRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
