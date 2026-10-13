import {
  BOLT_WIDTH_CM,
  cutMetres,
  metresForLength,
  polygonBounds,
  requiredPieces,
  rotatedShape,
  type DressRun,
} from "../../../core";

interface Box {
  readonly width: number;
  readonly height: number;
}

function shelfLength(boxes: readonly Box[]): number {
  const sorted = [...boxes].sort((a, b) => b.height - a.height);
  let rowTop = 0;
  let rowHeight = 0;
  let cursor = 0;
  for (const box of sorted) {
    if (cursor > 0 && cursor + box.width > BOLT_WIDTH_CM) {
      rowTop += rowHeight;
      rowHeight = 0;
      cursor = 0;
    }
    cursor += box.width;
    rowHeight = Math.max(rowHeight, box.height);
  }
  return rowTop + rowHeight;
}

export function estimatedMetres(run: DressRun, fabricId: string): number {
  const entries = requiredPieces(run.design).filter((entry) => entry.fabricId === fabricId);
  if (entries.length === 0) return 0;
  if (entries.every((entry) => run.placements[entry.piece.id] !== undefined)) return cutMetres(run, fabricId);
  const boxes = entries.map((entry) => {
    const bounds = polygonBounds(rotatedShape(entry.piece.shape, 0));
    return { width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };
  });
  return metresForLength(shelfLength(boxes));
}
