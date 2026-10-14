import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { GarmentSlot } from "../content/garmentSlot";
import { isGarmentSlot } from "./catalog";
import type { DressRun } from "./dressRun";
import type { GameState } from "./gameState";
import { requiredPiece } from "./requiredPieces";

const SLOT_NAMES: Readonly<Record<GarmentSlot, string>> = {
  "bodice-front": "bodice front",
  "bodice-back": "bodice back",
  neckline: "neckline",
  "sleeve-left": "left sleeve",
  "sleeve-right": "right sleeve",
  "skirt-front": "skirt front",
  "skirt-back": "skirt back",
};

export function slotAssignmentIssue(run: DressRun, slot: GarmentSlot, pieceId: string): string | null {
  if (!isGarmentSlot(slot)) return "That spot is not on the form.";
  const entry = requiredPiece(run.design, pieceId);
  if (entry === undefined) return "That piece is not part of this dress.";
  if (entry.fabricId === null || !run.cutFabrics.includes(entry.fabricId))
    return `${entry.piece.name} has not been cut yet.`;
  if (entry.piece.slot !== slot)
    return `${entry.piece.name} belongs on the ${SLOT_NAMES[entry.piece.slot]}, not the ${SLOT_NAMES[slot]}.`;
  const occupant = run.assembly[slot];
  if (occupant !== null && occupant !== pieceId) return `The ${SLOT_NAMES[slot]} already has a piece.`;
  return null;
}

export function assignSlot(state: GameState, slot: GarmentSlot, pieceId: string): GameState {
  return updateActiveRun(state, "assemble", (run) => {
    if (slotAssignmentIssue(run, slot, pieceId) !== null || run.assembly[slot] === pieceId) return null;
    return { ...run, assembly: { ...run.assembly, [slot]: pieceId } };
  });
}
