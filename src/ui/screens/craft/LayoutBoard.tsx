import { useRef, useState, type PointerEvent, type RefObject } from "react";
import type { FabricDef } from "../../../content/fabric";
import {
  BOLT_WIDTH_CM,
  boltLengthCm,
  cutMetres,
  fabricPlacementIssues,
  requiredPieces,
  type Action,
  type DressRun,
  type PiecePlacement,
  type Rotation,
} from "../../../core";
import { FabricBolt } from "../../art/FabricBolt";
import { clientToSvg } from "./clientToSvg";
import { clampToBoltWidth, rotateInPlace, rotatedSize, snapCm, turned } from "./pieceGeometry";
import { PlacedPieceArt } from "./PlacedPieceArt";

export interface LayoutGhost {
  readonly pieceId: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
}

export interface LayoutBoardProps {
  readonly run: DressRun;
  readonly fabricId: string;
  readonly fabric: FabricDef | undefined;
  readonly ownedMetres: number;
  readonly pxPerCm: number;
  readonly selectedId: string | null;
  readonly onSelect: (pieceId: string | null) => void;
  readonly dispatch: (action: Action) => void;
  readonly svgRef: RefObject<SVGSVGElement | null>;
  readonly ghost: LayoutGhost | null;
}

interface PieceDrag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly originX: number;
  readonly originY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

const DOUBLE_TAP_MS = 360;
const OVERHANG_CM = 24;

export function LayoutBoard({
  run,
  fabricId,
  fabric,
  ownedMetres,
  pxPerCm,
  selectedId,
  onSelect,
  dispatch,
  svgRef,
  ghost,
}: LayoutBoardProps) {
  const [drag, setDragState] = useState<PieceDrag | null>(null);
  const dragRef = useRef<PieceDrag | null>(null);
  const setDrag = (next: PieceDrag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const lastTap = useRef<{ pieceId: string; time: number } | null>(null);
  const lengthCm = boltLengthCm(ownedMetres);
  const entries = requiredPieces(run.design).filter((entry) => entry.fabricId === fabricId);
  const placements: Record<string, PiecePlacement> = { ...run.placements };
  if (drag !== null) {
    const current = run.placements[drag.pieceId];
    if (current !== undefined) placements[drag.pieceId] = { ...current, x: drag.x, y: drag.y };
  }
  if (ghost !== null)
    placements[ghost.pieceId] = { fabricId, x: ghost.x, y: ghost.y, rotation: ghost.rotation };
  const candidate: DressRun = { ...run, placements };
  const issues = fabricPlacementIssues(candidate, fabricId, ownedMetres).filter(
    (issue) => issue.kind !== "unplaced",
  );
  const troubled = new Set(
    issues.flatMap((issue) =>
      issue.otherPieceId === null ? [issue.pieceId] : [issue.pieceId, issue.otherPieceId],
    ),
  );
  const usedMetres = cutMetres(candidate, fabricId);

  const begin = (event: PointerEvent<SVGGElement>, pieceId: string) => {
    const placement = run.placements[pieceId];
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (placement === undefined || point === null) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(pieceId);
    setDrag({
      pieceId,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      originX: placement.x,
      originY: placement.y,
      x: placement.x,
      y: placement.y,
      moved: false,
    });
  };

  const dragAt = (current: PieceDrag, event: PointerEvent<SVGGElement>): PieceDrag => {
    const entry = entries.find((candidateEntry) => candidateEntry.piece.id === current.pieceId);
    const placement = run.placements[current.pieceId];
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (entry === undefined || placement === undefined || point === null) return current;
    const size = rotatedSize(entry.piece.shape, placement.rotation);
    const dx = point.x - current.startX;
    const dy = point.y - current.startY;
    const x = clampToBoltWidth(snapCm(current.originX + dx), size.width);
    const y = Math.min(lengthCm + OVERHANG_CM - size.height, Math.max(0, snapCm(current.originY + dy)));
    return { ...current, x, y, moved: current.moved || Math.hypot(dx, dy) > 0.8 };
  };

  const move = (event: PointerEvent<SVGGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(dragAt(current, event));
  };

  const finish = (event: PointerEvent<SVGGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = dragAt(current, event);
    const placement = run.placements[final.pieceId];
    const entry = entries.find((candidateEntry) => candidateEntry.piece.id === final.pieceId);
    setDrag(null);
    if (placement === undefined || entry === undefined) return;
    if (final.moved) {
      lastTap.current = null;
      if (final.x !== placement.x || final.y !== placement.y)
        dispatch({
          type: "placePiece",
          pieceId: final.pieceId,
          x: final.x,
          y: final.y,
          rotation: placement.rotation,
        });
      return;
    }
    const previous = lastTap.current;
    if (
      previous !== null &&
      previous.pieceId === final.pieceId &&
      event.timeStamp - previous.time < DOUBLE_TAP_MS
    ) {
      lastTap.current = null;
      const next = turned(placement.rotation, 1);
      const spot = rotateInPlace(entry.piece.shape, placement, next);
      dispatch({ type: "placePiece", pieceId: final.pieceId, x: spot.x, y: spot.y, rotation: next });
      return;
    }
    lastTap.current = { pieceId: final.pieceId, time: event.timeStamp };
  };

  const metreMarks: number[] = [];
  for (let cm = 50; cm < lengthCm; cm += 50) metreMarks.push(cm);

  return (
    <div
      className="ad-layout-board"
      style={{ paddingBottom: OVERHANG_CM * pxPerCm }}
      onPointerDown={() => onSelect(null)}
      data-testid="layout-board"
    >
      <FabricBolt
        fabric={fabric}
        widthCm={BOLT_WIDTH_CM}
        lengthCm={lengthCm}
        pxPerCm={pxPerCm}
        svgRef={svgRef}
        className="ad-layout-board__bolt"
        title={`${fabric?.name ?? "Fabric"} laid out on the cutting table, ${ownedMetres} metres`}
      >
        <g className="ad-layout-board__marks" pointerEvents="none">
          {metreMarks.map((cm) => (
            <g key={cm}>
              <line x1={0} y1={cm} x2={BOLT_WIDTH_CM} y2={cm} />
              <text x={BOLT_WIDTH_CM - 1.5} y={cm - 0.8} textAnchor="end">
                {cm / 100} m
              </text>
            </g>
          ))}
          {usedMetres > 0 ? (
            <g className="ad-layout-board__usage">
              <line x1={-2} y1={usedMetres * 100} x2={BOLT_WIDTH_CM + 2} y2={usedMetres * 100} />
              <text x={1.5} y={usedMetres * 100 + 3}>
                Cut line · uses {usedMetres} m
              </text>
            </g>
          ) : null}
        </g>
        {entries.map((entry) => {
          const placement = placements[entry.piece.id];
          if (placement === undefined || entry.piece.id === ghost?.pieceId) return null;
          const dragging = drag?.pieceId === entry.piece.id;
          const state = troubled.has(entry.piece.id)
            ? "invalid"
            : selectedId === entry.piece.id
              ? "selected"
              : "idle";
          return (
            <PlacedPieceArt
              key={entry.piece.id}
              piece={entry.piece}
              fabric={fabric}
              x={placement.x}
              y={placement.y}
              rotation={placement.rotation}
              state={state}
              className={dragging ? "ad-layout-piece ad-layout-piece--dragging" : "ad-layout-piece"}
              onPointerDown={(event) => begin(event, entry.piece.id)}
              onPointerMove={move}
              onPointerUp={finish}
              onPointerCancel={() => setDrag(null)}
            />
          );
        })}
        {ghost !== null
          ? entries
              .filter((entry) => entry.piece.id === ghost.pieceId)
              .map((entry) => (
                <PlacedPieceArt
                  key="ghost"
                  piece={entry.piece}
                  fabric={fabric}
                  x={ghost.x}
                  y={ghost.y}
                  rotation={ghost.rotation}
                  state={troubled.has(entry.piece.id) ? "invalid" : "selected"}
                  className="ad-layout-piece ad-layout-piece--ghost"
                />
              ))
          : null}
      </FabricBolt>
    </div>
  );
}
