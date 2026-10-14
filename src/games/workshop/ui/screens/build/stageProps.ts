import type { Action, CommissionRun, GameState } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: CommissionRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
