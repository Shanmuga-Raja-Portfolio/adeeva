import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { OVERLAP_EPSILON } from "../../../engine/geometry/overlapEpsilon";
import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { recordWithout } from "../../../engine/recordWithout";
import type { PartDef } from "../content/product";
import { HINTS } from "../content/hint";
import { knotPolygon } from "./boardKnots";
import { boardSizeById, productById } from "./catalog";
import { QUARTER_TURNS, type CommissionRun, type PartPlacement, type QuarterTurn } from "./commissionRun";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";
import { designParts, findPart } from "./pieceParts";

type LayoutIssueKind = "unplaced" | "off-board" | "knot" | "overlap" | "wrong-wood";

interface LayoutIssue {
  readonly partId: string;
  readonly kind: LayoutIssueKind;
  readonly message: string;
}

const SCAN_STEP_CM = 1;
const SHOW_ME_TURNS: readonly QuarterTurn[] = [0, 180, 90, 270];

export function runBoardById(state: GameState, run: CommissionRun, boardId: string): OwnedBoard | undefined {
  return (
    state.boards.find((board) => board.id === boardId) ?? run.usedBoards.find((board) => board.id === boardId)
  );
}

export function layoutBoards(state: GameState, run: CommissionRun): OwnedBoard[] {
  const woodId = run.design.woodId;
  return woodId === null ? [] : state.boards.filter((board) => board.woodId === woodId);
}

function partShape(part: PartDef): Point[] {
  return [
    [0, 0],
    [part.width, 0],
    [part.width, part.height],
    [0, part.height],
  ];
}

export function partPolygon(part: PartDef, placement: Pick<PartPlacement, "x" | "y" | "rotation">): Point[] {
  return placedPolygon(partShape(part), placement);
}

function onBoard(board: OwnedBoard, polygon: readonly Point[]): boolean {
  const size = boardSizeById(board.size);
  const bounds = polygonBounds(polygon);
  return (
    bounds.minX >= -OVERLAP_EPSILON &&
    bounds.minY >= -OVERLAP_EPSILON &&
    bounds.maxX <= size.width + OVERLAP_EPSILON &&
    bounds.maxY <= size.height + OVERLAP_EPSILON
  );
}

function touchesKnot(board: OwnedBoard, polygon: readonly Point[]): boolean {
  return board.knots.some((knot) => polygonsOverlap(polygon, knotPolygon(knot)));
}

function placedNeighbours(run: CommissionRun, boardId: string, exceptPartId: string): Point[][] {
  return designParts(run.design).flatMap((part) => {
    if (part.id === exceptPartId) return [];
    const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
    return placement === undefined || placement.boardId !== boardId ? [] : [partPolygon(part, placement)];
  });
}

export function placementIssue(
  state: GameState,
  run: CommissionRun,
  part: PartDef,
  placement: Pick<PartPlacement, "boardId" | "x" | "y" | "rotation">,
): LayoutIssue | null {
  const board = layoutBoards(state, run).find((entry) => entry.id === placement.boardId);
  if (board === undefined)
    return {
      partId: part.id,
      kind: "wrong-wood",
      message: `${part.name} needs a board of your chosen wood.`,
    };
  const polygon = partPolygon(part, placement);
  if (!onBoard(board, polygon))
    return { partId: part.id, kind: "off-board", message: `${part.name} hangs off the board.` };
  if (touchesKnot(board, polygon)) return { partId: part.id, kind: "knot", message: HINTS.onKnot };
  if (placedNeighbours(run, board.id, part.id).some((other) => polygonsOverlap(polygon, other)))
    return { partId: part.id, kind: "overlap", message: `${part.name} bumps into another part.` };
  return null;
}

export function layoutIssues(state: GameState, run: CommissionRun): LayoutIssue[] {
  return designParts(run.design).flatMap((part) => {
    const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
    if (placement === undefined)
      return [{ partId: part.id, kind: "unplaced" as const, message: `${part.name} still needs a board.` }];
    const issue = placementIssue(state, run, part, placement);
    return issue === null ? [] : [issue];
  });
}

function isQuarterTurn(value: number): value is QuarterTurn {
  return QUARTER_TURNS.some((turn) => turn === value);
}

export function placePart(
  state: GameState,
  partId: string,
  boardId: string,
  x: number,
  y: number,
  rotation: number,
): GameState {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !isQuarterTurn(rotation)) return state;
  return updateActiveRun(state, "layout", (run) => {
    const part = findPart(run.design, partId);
    if (part === undefined) return null;
    const placement: PartPlacement = { boardId, x, y, rotation, assisted: false };
    if (placementIssue(state, run, part, placement) !== null) return null;
    const current = Object.hasOwn(run.placements, partId) ? run.placements[partId] : undefined;
    if (
      current !== undefined &&
      current.boardId === boardId &&
      current.x === x &&
      current.y === y &&
      current.rotation === rotation
    )
      return null;
    return { ...run, placements: { ...run.placements, [partId]: placement } };
  });
}

export function removePart(state: GameState, partId: string): GameState {
  return updateActiveRun(state, "layout", (run) => {
    if (!Object.hasOwn(run.placements, partId)) return null;
    return { ...run, placements: recordWithout(run.placements, partId) };
  });
}

function canonicalSpot(state: GameState, run: CommissionRun, part: PartDef): PartPlacement | null {
  if (run.design.productId === null) return null;
  const boards = layoutBoards(state, run);
  const product = productById(run.design.productId);
  const seen = { short: 0, long: 0, panel: 0 };
  for (const canonical of product.canonical) {
    const index = seen[canonical.size];
    seen[canonical.size] += 1;
    const spot = canonical.spots.find((entry) => entry.partId === part.id);
    if (spot === undefined) continue;
    const board = boards.filter((entry) => entry.size === canonical.size)[index];
    if (board === undefined) return null;
    const placement: PartPlacement = { boardId: board.id, x: spot.x, y: spot.y, rotation: 0, assisted: true };
    return placementIssue(state, run, part, placement) === null ? placement : null;
  }
  return null;
}

function scannedSpot(state: GameState, run: CommissionRun, part: PartDef): PartPlacement | null {
  for (const rotation of SHOW_ME_TURNS) {
    for (const board of layoutBoards(state, run)) {
      const size = boardSizeById(board.size);
      for (let y = 0; y <= size.height; y += SCAN_STEP_CM) {
        for (let x = 0; x <= size.width; x += SCAN_STEP_CM) {
          const placement: PartPlacement = { boardId: board.id, x, y, rotation, assisted: true };
          if (placementIssue(state, run, part, placement) === null) return placement;
        }
      }
    }
  }
  return null;
}

function unplacedPart(run: CommissionRun, partId: string | null): PartDef | undefined {
  return designParts(run.design).find(
    (part) => !Object.hasOwn(run.placements, part.id) && (partId === null || part.id === partId),
  );
}

export function showMeSpot(
  state: GameState,
  run: CommissionRun,
  partId: string | null,
): PartPlacement | null {
  const part = unplacedPart(run, partId);
  if (part === undefined) return null;
  return canonicalSpot(state, run, part) ?? scannedSpot(state, run, part);
}

export function showMe(state: GameState, partId: string | null): GameState {
  return updateActiveRun(state, "layout", (run) => {
    const part = unplacedPart(run, partId);
    const placement = showMeSpot(state, run, partId);
    if (part === undefined || placement === null) return null;
    return { ...run, placements: { ...run.placements, [part.id]: placement } };
  });
}
