import type { Action, DressRun, GameState } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
