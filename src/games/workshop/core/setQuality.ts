import { average } from "../../../engine/average";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";
import { runPieces } from "./pieceParts";
import { pieceQuality } from "./pieceQuality";

export function pieceQualities(state: GameState, run: CommissionRun): number[] {
  return runPieces(run).map((piece) => pieceQuality(state, run, piece.index).quality);
}

export function setQuality(state: GameState, run: CommissionRun): number {
  const qualities = pieceQualities(state, run);
  return qualities.length === 0 ? 0 : Math.round(average(qualities));
}
