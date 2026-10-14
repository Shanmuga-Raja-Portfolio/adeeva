import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { FloorId } from "../content/floor";
import type { FurnitureId } from "../content/furniture";
import { HINTS } from "../content/hints";
import type { LightId } from "../content/light";
import type { PaintId } from "../content/paint";
import { isFloorId, isFurnitureId, isLightId, isPaintId, roomById } from "./catalog";
import {
  isTurn,
  pieceShape,
  placementProblem,
  type PlacedPiece,
  type PlacementProblem,
  type Turn,
} from "./floorPlan";
import type { GameState } from "./gameState";
import { mountCells } from "./lighting";
import type { MakeoverRun, RoomPlan } from "./makeoverRun";
import { tidyLayout, type TidyPiece } from "./tidyLayout";

export const MAX_PIECES = 12;
export const MAX_LIGHTS = 4;

export interface PiecePlacement {
  readonly pieceId: string | null;
  readonly furnitureId: FurnitureId;
  readonly col: number;
  readonly row: number;
  readonly rotation: Turn;
}

const PROBLEM_HINTS: Readonly<Record<PlacementProblem, string>> = {
  outside: HINTS.outsideRoom,
  overlap: HINTS.overlaps,
  door: HINTS.doorSwing,
  window: HINTS.tallByWindow,
};

function withPlan(
  state: GameState,
  change: (plan: RoomPlan, run: MakeoverRun) => RoomPlan | null,
): GameState {
  return updateActiveRun(state, "plan", (run) => {
    if (run.locked) return null;
    const plan = change(run.plan, run);
    return plan === null || plan === run.plan ? null : { ...run, plan };
  });
}

function candidatePiece(run: MakeoverRun, placement: PiecePlacement): PlacedPiece {
  return {
    id: placement.pieceId ?? `piece-${run.plan.nextPieceNumber}`,
    furnitureId: placement.furnitureId,
    col: placement.col,
    row: placement.row,
    rotation: placement.rotation,
  };
}

export function placementIssue(run: MakeoverRun, placement: PiecePlacement): string | null {
  if (!isFurnitureId(placement.furnitureId) || !isTurn(placement.rotation)) return HINTS.outsideRoom;
  if (!Number.isInteger(placement.col) || !Number.isInteger(placement.row)) return HINTS.outsideRoom;
  const existing =
    placement.pieceId === null ? undefined : run.plan.pieces.find((piece) => piece.id === placement.pieceId);
  if (
    placement.pieceId !== null &&
    (existing === undefined || existing.furnitureId !== placement.furnitureId)
  )
    return HINTS.outsideRoom;
  if (placement.pieceId === null && run.plan.pieces.length >= MAX_PIECES)
    return "The room is full of furniture.";
  const problem = placementProblem(
    roomById(run.brief.roomId),
    run.plan.pieces,
    candidatePiece(run, placement),
  );
  return problem === null ? null : PROBLEM_HINTS[problem];
}

export function placePiece(state: GameState, placement: PiecePlacement): GameState {
  return withPlan(state, (plan, run) => {
    if (placementIssue(run, placement) !== null) return null;
    const piece = candidatePiece(run, placement);
    if (placement.pieceId === null)
      return { ...plan, pieces: [...plan.pieces, piece], nextPieceNumber: plan.nextPieceNumber + 1 };
    return { ...plan, pieces: plan.pieces.map((entry) => (entry.id === piece.id ? piece : entry)) };
  });
}

export function turnedPlacement(run: MakeoverRun, pieceId: string): PiecePlacement | null {
  const piece = run.plan.pieces.find((entry) => entry.id === pieceId);
  if (piece === undefined) return null;
  const rotation = ((piece.rotation + 90) % 360) as Turn;
  const room = roomById(run.brief.roomId);
  const shape = pieceShape(piece.furnitureId, rotation);
  return {
    pieceId,
    furnitureId: piece.furnitureId,
    col: Math.max(0, Math.min(piece.col, room.cols - shape.width)),
    row: Math.max(0, Math.min(piece.row, room.rows - shape.depth)),
    rotation,
  };
}

export function rotatePiece(state: GameState, pieceId: string): GameState {
  const run = state.activeRun;
  const placement = run === null ? null : turnedPlacement(run, pieceId);
  return placement === null ? state : placePiece(state, placement);
}

export function removePiece(state: GameState, pieceId: string): GameState {
  return withPlan(state, (plan) =>
    plan.pieces.some((piece) => piece.id === pieceId)
      ? { ...plan, pieces: plan.pieces.filter((piece) => piece.id !== pieceId) }
      : null,
  );
}

export function choosePaint(state: GameState, slot: "wall" | "feature", paintId: PaintId | null): GameState {
  return withPlan(state, (plan) => {
    if (paintId !== null && !isPaintId(paintId)) return null;
    if (slot === "wall") {
      if (paintId === null || paintId === plan.wallPaint) return null;
      return {
        ...plan,
        wallPaint: paintId,
        featurePaint: plan.featurePaint === paintId ? null : plan.featurePaint,
      };
    }
    if (paintId === plan.featurePaint || (paintId !== null && paintId === plan.wallPaint)) return null;
    return { ...plan, featurePaint: paintId };
  });
}

export function chooseFloor(state: GameState, floorId: FloorId): GameState {
  return withPlan(state, (plan) =>
    isFloorId(floorId) && plan.floor !== floorId ? { ...plan, floor: floorId } : null,
  );
}

export function addLight(state: GameState, lightId: LightId): GameState {
  return withPlan(state, (plan) =>
    isLightId(lightId) && plan.lights.length < MAX_LIGHTS
      ? { ...plan, lights: [...plan.lights, lightId] }
      : null,
  );
}

export function removeLight(state: GameState, index: number): GameState {
  return withPlan(state, (plan) =>
    Number.isInteger(index) && index >= 0 && index < plan.lights.length
      ? { ...plan, lights: plan.lights.filter((_, position) => position !== index) }
      : null,
  );
}

function tidyItems(run: MakeoverRun): TidyPiece[] {
  const items: TidyPiece[] = run.plan.pieces.map((piece) => ({
    id: piece.id,
    furnitureId: piece.furnitureId,
  }));
  let next = run.plan.nextPieceNumber;
  for (const need of run.brief.mustHaves) {
    if (!isFurnitureId(need.itemId)) continue;
    const furnitureId = need.itemId;
    const have = items.filter((item) => item.furnitureId === furnitureId).length;
    for (let extra = have; extra < need.count; extra += 1) {
      items.push({ id: `piece-${next}`, furnitureId });
      next += 1;
    }
  }
  return items;
}

function tidyPlan(run: MakeoverRun): { readonly pieces: PlacedPiece[]; readonly added: number } | string {
  const items = tidyItems(run);
  if (items.length === 0) return "Place some furniture first.";
  if (items.length > MAX_PIECES) return "That is too much furniture to tidy. Take a piece out.";
  const pieces = tidyLayout(roomById(run.brief.roomId), items);
  if (pieces === null) return "Not everything fits. Take a piece out, then tidy up.";
  return { pieces, added: items.length - run.plan.pieces.length };
}

export function tidyIssue(run: MakeoverRun): string | null {
  const plan = tidyPlan(run);
  return typeof plan === "string" ? plan : null;
}

export function tidyUp(state: GameState): GameState {
  return withPlan(state, (plan, run) => {
    const tidy = tidyPlan(run);
    if (typeof tidy === "string") return null;
    return {
      ...plan,
      pieces: tidy.pieces,
      nextPieceNumber: plan.nextPieceNumber + tidy.added,
      tidied: true,
    };
  });
}

function hasLightSpot(run: MakeoverRun): boolean {
  const room = roomById(run.brief.roomId);
  return run.plan.lights.some((lightId) => mountCells(room, run.plan.pieces, [], lightId).length > 0);
}

export function planIssues(run: MakeoverRun): string[] {
  const issues: string[] = [];
  if (run.plan.pieces.length === 0) issues.push("Place some furniture.");
  if (run.plan.wallPaint === null) issues.push("Pick a wall paint.");
  if (run.plan.floor === null) issues.push("Pick a floor.");
  if (run.plan.lights.length === 0) issues.push("Pick at least one light.");
  else if (!hasLightSpot(run)) issues.push("Pick a light that has a place to go in this room.");
  return issues;
}
