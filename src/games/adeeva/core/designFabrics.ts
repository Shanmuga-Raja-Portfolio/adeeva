import type { Design } from "./dressRun";
import { requiredPieces } from "./requiredPieces";

export function fabricsNeedingCut(design: Design): string[] {
  const ids = requiredPieces(design)
    .map((entry) => entry.fabricId)
    .filter((id): id is string => id !== null);
  return [...new Set(ids)];
}
