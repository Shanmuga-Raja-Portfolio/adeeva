import type { Action, GameState, PieceRun } from "../../../core";

export interface StageProps {
  readonly state: GameState;
  readonly run: PieceRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}
