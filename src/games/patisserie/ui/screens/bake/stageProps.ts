import type { Action, BakeRun, GameState } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: BakeRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
