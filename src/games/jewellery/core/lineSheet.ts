import { polygonArea } from "../../../engine/geometry/polygonArea";
import { placedPolygon } from "../../../engine/geometry/polygonPlacement";
import type { Point } from "../../../engine/geometry/point";
import { productById, stockSizeById } from "./catalog";
import type { CollectionPiece, LineHole, LineSheet } from "./collectionState";
import type { GameState } from "./gameState";
import { designInput, partOutline } from "./partGeometry";
import type { PieceRun } from "./pieceRun";
import { queueStoryTrigger } from "./storyQueue";

const LINE_SIZE = "wide";

function rounded(points: readonly Point[]): Point[] {
  return points.map(([x, y]): Point => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
}

export function currentLineSheet(state: Pick<GameState, "collection">, run: PieceRun): LineSheet | null {
  if (run.purpose.kind !== "collection" || state.collection === null) return null;
  return state.collection.lineSheets[state.collection.lineSheets.length - 1] ?? null;
}

export function lineSheetHoles(
  state: Pick<GameState, "collection">,
  run: PieceRun,
): readonly (readonly Point[])[] {
  const sheet = currentLineSheet(state, run);
  if (sheet === null) return [];
  return sheet.holes.filter((hole) => hole.runId !== run.id).map((hole) => hole.points);
}

export function wideHoles(run: PieceRun): LineHole[] {
  const input = designInput(run.design);
  return productById(run.design.productId).parts.flatMap((part) => {
    const placement = run.plan[part.key];
    if (placement === undefined || placement.size !== LINE_SIZE) return [];
    return [{ runId: run.id, points: rounded(placedPolygon(partOutline(part, input), placement)) }];
  });
}

export function plansOnLineSheet(state: Pick<GameState, "collection">, run: PieceRun): boolean {
  return (
    run.purpose.kind === "collection" &&
    currentLineSheet(state, run) !== null &&
    Object.values(run.plan).some((placement) => placement.size === LINE_SIZE)
  );
}

export function claimLineSheet(state: GameState, run: PieceRun, reused: boolean): GameState {
  const collection = state.collection;
  if (collection === null || run.purpose.kind !== "collection") return state;
  const holes = wideHoles(run);
  if (holes.length === 0) return state;
  const sheets = collection.lineSheets;
  const last = sheets[sheets.length - 1];
  const lineSheets =
    reused && last !== undefined
      ? [...sheets.slice(0, -1), { holes: [...last.holes, ...holes] }]
      : [...sheets, { holes }];
  const claimed: GameState = { ...state, collection: { ...collection, lineSheets } };
  return reused ? queueStoryTrigger(claimed, "first-line-sheet") : claimed;
}

export function runPartArea(run: PieceRun): number {
  const input = designInput(run.design);
  return productById(run.design.productId).parts.reduce(
    (sum, part) => sum + polygonArea(partOutline(part, input)),
    0,
  );
}

export function runSheetArea(run: PieceRun): number {
  return (run.consumed ?? [])
    .filter((size) => !(run.lineSheet && size === LINE_SIZE))
    .reduce((sum, size) => {
      const sheet = stockSizeById(size);
      return sum + sheet.width * sheet.height;
    }, 0);
}

export function sheetUse(pieces: readonly Pick<CollectionPiece, "partArea" | "sheetArea">[]): number {
  const area = pieces.reduce((sum, piece) => sum + piece.sheetArea, 0);
  if (area === 0) return 0;
  return pieces.reduce((sum, piece) => sum + piece.partArea, 0) / area;
}
