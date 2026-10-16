import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { CommissionRun, CutRecord } from "./commissionRun";
import type { GameState } from "./gameState";
import { findPart, runPieces, type RunPart } from "./pieceParts";
import { consumeSawnBoards, cutKey, cutRecord, partCuts } from "./sawRecord";
import { setPartId } from "./setPartId";
import { sawTolerance } from "./tolerance";

export const TWIN_ECHO_PENALTY = 0.05;
export const JIG_SAW_WIDENING = 1.15;
export const JIG_JOINT_WIDENING = 1.1;

export function twinSource(run: CommissionRun, piece: number): number | null {
  if (run.purpose.kind !== "set") return null;
  return runPieces(run).find((entry) => entry.index === piece)?.twinOf ?? null;
}

export function hasJigs(state: Pick<GameState, "upgrades">): boolean {
  return state.upgrades.includes("matching-jigs");
}

export function twinSawTolerance(state: GameState, run: CommissionRun, part: RunPart): number | null {
  const woodId = run.design.woodId;
  if (woodId === null) return null;
  const base = sawTolerance(state, woodId);
  return twinSource(run, part.piece) !== null && hasJigs(state) ? base * JIG_SAW_WIDENING : base;
}

export function firstPartId(run: CommissionRun, part: RunPart): string | null {
  const source = twinSource(run, part.piece);
  return source === null ? null : setPartId(source, part.baseId);
}

function echoedCuts(state: GameState, run: CommissionRun, part: RunPart): Record<string, CutRecord> | null {
  const firstId = firstPartId(run, part);
  if (firstId === null) return null;
  const open = partCuts(state, run, part).flatMap((_, index) =>
    cutRecord(run, cutKey(part.id, index)) === undefined ? [index] : [],
  );
  if (open.length === 0) return null;
  const echoes: Record<string, CutRecord> = {};
  for (const index of open) {
    const first = cutRecord(run, cutKey(firstId, index));
    if (first === undefined) return null;
    echoes[cutKey(part.id, index)] = {
      accuracy: Math.max(0, first.accuracy - TWIN_ECHO_PENALTY),
      assisted: first.assisted,
    };
  }
  return echoes;
}

export function canSawLikeFirst(state: GameState, run: CommissionRun, part: RunPart): boolean {
  return run.stage === "saw" && echoedCuts(state, run, part) !== null;
}

export function sawLikeFirst(state: GameState, partId: string): GameState {
  const recorded = updateActiveRun(state, "saw", (run) => {
    const part = findPart(run, partId);
    const echoes = part === undefined ? null : echoedCuts(state, run, part);
    return echoes === null ? null : { ...run, cuts: { ...run.cuts, ...echoes } };
  });
  return recorded === state ? state : consumeSawnBoards(recorded);
}
