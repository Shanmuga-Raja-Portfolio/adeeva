import type { Action, GameState, MakeoverRun } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: MakeoverRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
