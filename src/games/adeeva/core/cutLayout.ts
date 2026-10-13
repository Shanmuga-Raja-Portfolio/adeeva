import { updateActiveRun } from "./activeRunUpdate";
import type { DressRun, PiecePlacement } from "./dressRun";
import type { GameState } from "./gameState";
import { ownEntry } from "../../../engine/ownEntry";
import { recordWithout } from "../../../engine/recordWithout";
import { requiredPiece } from "./requiredPieces";
import { isRotation, type Rotation } from "../../../engine/geometry/rotation";

function editablePlacementFabric(run: DressRun, pieceId: string): string | null {
  const entry = requiredPiece(run.design, pieceId);
  if (entry === undefined || entry.fabricId === null || run.cutFabrics.includes(entry.fabricId)) return null;
  return entry.fabricId;
}

export function placePiece(
  state: GameState,
  pieceId: string,
  x: number,
  y: number,
  rotation: Rotation,
): GameState {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !isRotation(rotation)) return state;
  return updateActiveRun(state, "cut", (run) => {
    const fabricId = editablePlacementFabric(run, pieceId);
    if (fabricId === null) return null;
    const existing = ownEntry(run.placements, pieceId);
    if (existing !== undefined && existing.x === x && existing.y === y && existing.rotation === rotation)
      return null;
    const placement: PiecePlacement = { fabricId, x, y, rotation };
    return { ...run, placements: { ...run.placements, [pieceId]: placement } };
  });
}

export function rotatePiece(state: GameState, pieceId: string, rotation: Rotation): GameState {
  if (!isRotation(rotation)) return state;
  return updateActiveRun(state, "cut", (run) => {
    const placement = ownEntry(run.placements, pieceId);
    if (placement === undefined || editablePlacementFabric(run, pieceId) === null) return null;
    if (placement.rotation === rotation) return null;
    return { ...run, placements: { ...run.placements, [pieceId]: { ...placement, rotation } } };
  });
}

export function removePiece(state: GameState, pieceId: string): GameState {
  return updateActiveRun(state, "cut", (run) => {
    if (ownEntry(run.placements, pieceId) === undefined || editablePlacementFabric(run, pieceId) === null)
      return null;
    return { ...run, placements: recordWithout(run.placements, pieceId) };
  });
}
