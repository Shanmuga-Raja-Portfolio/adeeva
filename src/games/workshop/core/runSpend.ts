import { runBoardById } from "./boardLayout";
import type { CommissionRun } from "./commissionRun";
import { cushionPrice } from "./cushion";
import { extrasPrice, finishPrice } from "./finishChoice";
import type { GameState } from "./gameState";

function boardSpend(state: GameState, run: CommissionRun): number {
  const boardIds = new Set(Object.values(run.placements).map((placement) => placement.boardId));
  return [...boardIds].reduce((sum, boardId) => sum + (runBoardById(state, run, boardId)?.cost ?? 0), 0);
}

export function runSpend(state: GameState, run: CommissionRun): number {
  return (
    boardSpend(state, run) + finishPrice(run, run.finish) + extrasPrice(run) + cushionPrice(run, run.cushion)
  );
}
