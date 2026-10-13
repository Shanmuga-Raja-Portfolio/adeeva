import { useRef, useState, type PointerEvent } from "react";
import type { FabricDef } from "../../../content/fabric";
import {
  canCommitCut,
  cutMetres,
  requiredPieces,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { BOLT_MARGIN } from "../../art/FabricBolt";
import { Button } from "../../../../../ui/kit/Button";
import { autoPlacementSpot } from "./autoPlacement";
import { clientToSvg, isInsideElement } from "../../../../../ui/kit/clientToSvg";
import { LayoutBoard, type LayoutGhost } from "./LayoutBoard";
import { clampToBoltWidth, rotatedSize, snapCm } from "./pieceGeometry";
import { PieceInspector } from "./PieceInspector";
import { PieceTray } from "./PieceTray";
import { useElementWidth } from "../../../../../ui/kit/useElementSize";

export interface LayoutWorkspaceProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly fabricId: string;
  readonly fabric: FabricDef | undefined;
  readonly dispatch: (action: Action) => void;
  readonly onStartCutting: () => void;
}

interface TrayDrag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly moved: boolean;
  readonly ghost: LayoutGhost | null;
}

const ZOOM_STEPS = [0.6, 0.8, 1, 1.25, 1.6, 2] as const;
const BOLT_SPAN_CM = 140 + BOLT_MARGIN.left + BOLT_MARGIN.right;

export function LayoutWorkspace({
  state,
  run,
  fabricId,
  fabric,
  dispatch,
  onStartCutting,
}: LayoutWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [trayDrag, setTrayDragState] = useState<TrayDrag | null>(null);
  const trayRef = useRef<TrayDrag | null>(null);
  const setTrayDrag = (next: TrayDrag | null) => {
    trayRef.current = next;
    setTrayDragState(next);
  };
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(scrollRef, 640);
  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;
  const pxPerCm = (Math.max(280, width - 12) / BOLT_SPAN_CM) * zoom;
  const owned = state.inventory.fabricMetres[fabricId] ?? 0;
  const entries = requiredPieces(run.design).filter((entry) => entry.fabricId === fabricId);
  const selectedEntry = entries.find((entry) => entry.piece.id === selectedId);
  const used = cutMetres(run, fabricId);
  const ready = canCommitCut(state, fabricId);

  const trayDown = (event: PointerEvent<HTMLButtonElement>, pieceId: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setTrayDrag({
      pieceId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      ghost: null,
    });
  };

  const trayAt = (current: TrayDrag, event: PointerEvent<HTMLButtonElement>): TrayDrag => {
    const entry = entries.find((candidate) => candidate.piece.id === current.pieceId);
    if (entry === undefined) return current;
    const moved =
      current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 8;
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    const inside = isInsideElement(scrollRef.current, event.clientX, event.clientY);
    const rotation = run.placements[entry.piece.id]?.rotation ?? 0;
    const size = rotatedSize(entry.piece.shape, rotation);
    const ghost =
      moved && inside && point !== null
        ? {
            pieceId: entry.piece.id,
            rotation,
            x: clampToBoltWidth(snapCm(point.x - size.width / 2), size.width),
            y: Math.max(0, snapCm(point.y - size.height / 2)),
          }
        : null;
    return { ...current, moved, ghost };
  };

  const trayMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setTrayDrag(trayAt(current, event));
  };

  const layDown = (pieceId: string) => {
    const entry = entries.find((candidate) => candidate.piece.id === pieceId);
    if (entry === undefined) return;
    setSelectedId(pieceId);
    if (run.placements[pieceId] !== undefined) return;
    const spot = autoPlacementSpot(run, fabricId, owned, entry.piece, 0);
    dispatch({ type: "placePiece", pieceId, x: spot.x, y: spot.y, rotation: 0 });
  };

  const trayUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = trayAt(current, event);
    const entry = entries.find((candidate) => candidate.piece.id === final.pieceId);
    setTrayDrag(null);
    if (entry === undefined) return;
    setSelectedId(entry.piece.id);
    const { ghost } = final;
    if (ghost !== null) {
      dispatch({
        type: "placePiece",
        pieceId: ghost.pieceId,
        x: ghost.x,
        y: ghost.y,
        rotation: ghost.rotation,
      });
      return;
    }
    if (!final.moved) layDown(entry.piece.id);
  };

  return (
    <div className="ad-layout-workspace">
      <PieceTray
        run={run}
        entries={entries}
        fabric={fabric}
        selectedId={selectedId}
        draggingId={trayDrag?.moved === true ? trayDrag.pieceId : null}
        onPointerDown={trayDown}
        onPointerMove={trayMove}
        onPointerUp={trayUp}
        onPointerCancel={() => setTrayDrag(null)}
        onKeyboardPick={layDown}
      />
      <div className="ad-layout-workspace__board">
        <div className="ad-layout-toolbar">
          <span className="ad-layout-toolbar__fabric">
            {fabric?.name ?? "Fabric"} · 140 cm × {owned * 100} cm
          </span>
          <div className="ad-layout-toolbar__zoom" role="group" aria-label="Zoom">
            <button
              type="button"
              className="ad-icon-button"
              onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="ad-icon-button ad-icon-button--wide"
              onClick={() => setZoomIndex(2)}
            >
              Fit
            </button>
            <button
              type="button"
              className="ad-icon-button"
              onClick={() => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))}
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
        <div className="ad-layout-scroll" ref={scrollRef}>
          <LayoutBoard
            run={run}
            fabricId={fabricId}
            fabric={fabric}
            ownedMetres={owned}
            pxPerCm={pxPerCm}
            selectedId={selectedId}
            onSelect={setSelectedId}
            dispatch={dispatch}
            svgRef={svgRef}
            ghost={trayDrag?.ghost ?? null}
          />
        </div>
      </div>
      <div className={used > owned ? "ad-layout-usage ad-layout-usage--short" : "ad-layout-usage"}>
        <span className="ad-eyebrow">Fabric used</span>
        <strong>
          {used} m <span className="ad-muted">of {owned} m</span>
        </strong>
        <span className="ad-layout-usage__bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, owned > 0 ? (used / owned) * 100 : 0)}%` }} />
        </span>
        {ready.ok ? (
          <small className="ad-muted">Measured down to the lowest piece, in half metres.</small>
        ) : (
          <ul className="ad-layout-issues" aria-live="polite">
            {[...new Set(ready.reasons)].slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
        <Button
          size="lg"
          block
          icon="scissors"
          onClick={onStartCutting}
          disabledReason={ready.ok ? undefined : ready.reasons[0]}
          data-testid="start-cutting"
        >
          Pick up the scissors
        </Button>
      </div>
      <PieceInspector
        entry={selectedEntry}
        placement={selectedEntry !== undefined ? run.placements[selectedEntry.piece.id] : undefined}
        dispatch={dispatch}
        onClear={() => setSelectedId(null)}
      />
    </div>
  );
}
