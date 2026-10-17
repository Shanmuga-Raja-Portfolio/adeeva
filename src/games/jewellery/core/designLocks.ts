import type { OptionSlot } from "../content/partOption";
import type { PieceRun } from "./pieceRun";

export function lockedSlots(run: PieceRun): readonly OptionSlot[] {
  if (run.purpose.kind === "collection") return ["shape"];
  const preset = run.brief?.preset;
  if (preset === undefined || preset === null) return [];
  return (["shape", "band", "accent"] as const).filter((slot) => preset.options[slot] !== undefined);
}

export function designLocked(run: PieceRun): boolean {
  return run.purpose.kind === "collection" || (run.brief?.preset ?? null) !== null;
}
