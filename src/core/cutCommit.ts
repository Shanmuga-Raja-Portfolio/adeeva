import { actionCheck, type ActionCheck } from "./actionCheck";
import { fabricById } from "./catalog";
import { cutMetres } from "./cutMetres";
import { fabricsNeedingCut } from "./designFabrics";
import type { GameState } from "./gameState";
import { fabricPlacementIssues } from "./piecePlacementIssues";
import { piecesOnFabric } from "./requiredPieces";
import { fabricCost } from "./shop";

function isAccuracy(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function canCommitCut(state: GameState, fabricId: string): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "cut") return actionCheck(["Cutting happens at the cutting table."]);
  if (!fabricsNeedingCut(run.design).includes(fabricId))
    return actionCheck(["This fabric is not in the design."]);
  if (run.cutFabrics.includes(fabricId)) return actionCheck(["This fabric is already cut."]);
  const owned = state.inventory.fabricMetres[fabricId] ?? 0;
  const reasons = fabricPlacementIssues(run, fabricId, owned).map((issue) => issue.message);
  const needed = cutMetres(run, fabricId);
  if (needed > owned) reasons.push(`This layout needs ${needed} m and you own ${owned} m.`);
  return actionCheck(reasons);
}

export function commitCut(
  state: GameState,
  fabricId: string,
  accuracies: Readonly<Record<string, number>>,
): GameState {
  const run = state.activeRun;
  const fabric = fabricById(fabricId);
  if (run === null || fabric === undefined || !canCommitCut(state, fabricId).ok) return state;
  const pieceIds = piecesOnFabric(run.design, fabricId).map((entry) => entry.piece.id);
  const recorded: Record<string, number> = {};
  for (const pieceId of pieceIds) {
    const accuracy = accuracies[pieceId];
    if (!isAccuracy(accuracy)) return state;
    recorded[pieceId] = accuracy;
  }
  const metres = cutMetres(run, fabricId);
  const owned = state.inventory.fabricMetres[fabricId] ?? 0;
  return {
    ...state,
    inventory: {
      ...state.inventory,
      fabricMetres: { ...state.inventory.fabricMetres, [fabricId]: owned - metres },
    },
    activeRun: {
      ...run,
      cutFabrics: [...run.cutFabrics, fabricId],
      cutAccuracy: { ...run.cutAccuracy, ...recorded },
      fabricSpend: run.fabricSpend + fabricCost(state, fabric, metres),
    },
  };
}
