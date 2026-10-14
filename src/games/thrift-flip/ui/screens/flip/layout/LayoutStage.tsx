import { useRef, useState, type PointerEvent } from "react";
import type { Cloth } from "../../../../../../ui/art/cloth/Cloth";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { PieceThumb } from "../../../../../adeeva/ui/screens/craft/PieceThumb";
import { PlacedPieceArt } from "../../../../../adeeva/ui/screens/craft/PlacedPieceArt";
import { clientToSvg, isInsideElement } from "../../../../../../ui/kit/clientToSvg";
import {
  rotatedSize,
  rotateInPlace,
  snapCm,
  turned,
} from "../../../../../adeeva/ui/screens/craft/pieceGeometry";
import { HINTS } from "../../../../content/hint";
import type { RecipePiece } from "../../../../content/recipe";
import {
  autoLayoutIssue,
  hemSpot,
  runKind,
  autoSpot,
  findById,
  runPieces,
  grainScore,
  panelUnder,
  piecePolygon,
  runBoard,
  runLayoutIssues,
  type Placement,
} from "../../../../core";
import { findCloth } from "../../../art/findCloth";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { PanelBoardArt } from "./PanelBoardArt";
import "./layout.css";

interface Drag {
  readonly pieceId: string;
  readonly pointerId: number;
  readonly fromTray: boolean;
  readonly start: { readonly x: number; readonly y: number };
  readonly origin: Placement;
  readonly placement: Placement | null;
  readonly moved: boolean;
}

const MARGIN = 6;
const DOUBLE_TAP_MS = 360;

function grainLabel(piece: RecipePiece, placement: Placement): string {
  const score = grainScore(piece, placement.rotation);
  if (placement.rotation % 180 === 0) return "Fabric lines: straight";
  if (score >= 1) return "Fabric lines: swishy slant";
  return placement.rotation % 90 === 45 ? "Fabric lines: slanted" : "Fabric lines: sideways";
}

export function LayoutStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const lastTap = useRef<{ pieceId: string; time: number } | null>(null);
  const setDrag = (next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const board = runBoard(run);
  const kind = runKind(run);
  const pieces = runPieces(run);
  const placements: Record<string, Placement> = { ...run.placements };
  if (drag !== null && drag.placement !== null) placements[drag.pieceId] = drag.placement;
  const issues = runLayoutIssues({ ...run, placements });
  const troubled = new Set(
    issues.flatMap((issue) => (issue.kind === "unplaced" ? [] : [issue.pieceId, issue.otherPieceId ?? ""])),
  );
  const autoIssue = autoLayoutIssue(state);
  const firstFind = run.finds[0];
  const fallbackCloth: Cloth | undefined =
    firstFind === undefined ? undefined : findCloth(findById(firstFind.findId));
  const clothFor = (piece: RecipePiece, placement: Placement): Cloth | undefined => {
    const panel = panelUnder(board, piecePolygon(piece, placement));
    return panel === null ? fallbackCloth : findCloth(findById(panel.findId));
  };
  const selected = pieces.find((piece) => piece.id === selectedId);
  const selectedPlacement = selected === undefined ? undefined : run.placements[selected.id];

  const place = (pieceId: string, placement: Placement) =>
    dispatch({ type: "placePiece", pieceId, x: placement.x, y: placement.y, rotation: placement.rotation });

  const layDown = (pieceId: string) => {
    setSelectedId(pieceId);
    if (run.placements[pieceId] !== undefined) return;
    const spot = kind === "alter" ? hemSpot(board) : autoSpot(board, pieces, run.placements, pieceId);
    if (spot !== null) place(pieceId, spot);
  };

  const pointAt = (current: Drag, clientX: number, clientY: number): Drag => {
    const piece = pieces.find((entry) => entry.id === current.pieceId);
    const point = clientToSvg(svgRef.current, clientX, clientY);
    if (piece === undefined || point === null) return current;
    const dx = point.x - current.start.x;
    const dy = point.y - current.start.y;
    const moved = current.moved || Math.hypot(dx, dy) > (current.fromTray ? 3 : 0.8);
    if (current.fromTray) {
      const inside = isInsideElement(boardRef.current, clientX, clientY);
      const size = rotatedSize(piece.shape, current.origin.rotation);
      const placement = inside
        ? {
            x: snapCm(point.x - size.width / 2),
            y: snapCm(point.y - size.height / 2),
            rotation: current.origin.rotation,
          }
        : null;
      return { ...current, moved, placement };
    }
    return {
      ...current,
      moved,
      placement: {
        x: snapCm(current.origin.x + dx),
        y: snapCm(current.origin.y + dy),
        rotation: current.origin.rotation,
      },
    };
  };

  const beginBoard = (event: PointerEvent<SVGGElement>, pieceId: string) => {
    const placement = run.placements[pieceId];
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (placement === undefined || point === null) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(pieceId);
    setDrag({
      pieceId,
      pointerId: event.pointerId,
      fromTray: false,
      start: point,
      origin: placement,
      placement,
      moved: false,
    });
  };

  const beginTray = (event: PointerEvent<HTMLButtonElement>, pieceId: string) => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const origin = run.placements[pieceId] ?? { x: 0, y: 0, rotation: 0 };
    setDrag({
      pieceId,
      pointerId: event.pointerId,
      fromTray: true,
      start: point,
      origin,
      placement: null,
      moved: false,
    });
  };

  const move = (event: PointerEvent<Element>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(pointAt(current, event.clientX, event.clientY));
  };

  const finish = (event: PointerEvent<Element>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = pointAt(current, event.clientX, event.clientY);
    setDrag(null);
    if (final.fromTray) {
      if (final.moved && final.placement !== null) {
        setSelectedId(final.pieceId);
        place(final.pieceId, final.placement);
      } else if (!final.moved) layDown(final.pieceId);
      return;
    }
    if (final.moved && final.placement !== null) {
      lastTap.current = null;
      place(final.pieceId, final.placement);
      return;
    }
    const previous = lastTap.current;
    const piece = pieces.find((entry) => entry.id === final.pieceId);
    if (
      previous !== null &&
      previous.pieceId === final.pieceId &&
      event.timeStamp - previous.time < DOUBLE_TAP_MS &&
      piece !== undefined
    ) {
      lastTap.current = null;
      rotate(piece, final.origin, 2);
      return;
    }
    lastTap.current = { pieceId: final.pieceId, time: event.timeStamp };
  };

  const rotate = (piece: RecipePiece, placement: Placement, steps: number) => {
    const next = turned(placement.rotation, steps);
    const spot = rotateInPlace(piece.shape, placement, next);
    place(piece.id, { x: spot.x, y: spot.y, rotation: next });
  };

  const nudge = (piece: RecipePiece, placement: Placement, dx: number, dy: number) =>
    place(piece.id, { ...placement, x: placement.x + dx, y: placement.y + dy });

  const ghost = drag !== null && drag.fromTray && drag.placement !== null ? drag : null;
  return (
    <div className="tf-layout">
      <div className="tf-layout__tray">
        <header>
          <strong>Pattern pieces</strong>
          <span className="ad-muted">Drag onto the fabric, or tap to lay one down.</span>
        </header>
        <ul>
          {pieces.map((piece) => {
            const placement = run.placements[piece.id];
            return (
              <li key={piece.id}>
                <button
                  type="button"
                  className={[
                    "tf-tray-piece",
                    placement !== undefined ? "tf-tray-piece--placed" : "",
                    selectedId === piece.id ? "tf-tray-piece--selected" : "",
                  ].join(" ")}
                  data-tray-piece={piece.id}
                  onPointerDown={(event) => beginTray(event, piece.id)}
                  onPointerMove={move}
                  onPointerUp={finish}
                  onPointerCancel={() => setDrag(null)}
                  onClick={(event) => {
                    if (event.detail === 0) layDown(piece.id);
                  }}
                >
                  <PieceThumb
                    piece={piece}
                    fabric={fallbackCloth}
                    rotation={placement?.rotation ?? 0}
                    size={44}
                  />
                  <span>
                    <strong>{piece.name}</strong>
                    <small>
                      {placement === undefined
                        ? "Waiting"
                        : troubled.has(piece.id)
                          ? "Needs a new spot"
                          : "On the fabric"}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {autoIssue === null ? (
          <Button
            variant="secondary"
            icon="sparkle"
            onClick={() => dispatch({ type: "autoLayout" })}
            data-testid="auto-layout"
          >
            Auto-layout
          </Button>
        ) : null}
      </div>
      <div className="tf-layout__board" ref={boardRef} data-testid="layout-board">
        <p className="tf-hint">
          <Icon name="scissors" size={18} />
          {kind === "alter" ? HINTS.hem : run.design.recipeId === "patch-throw" ? HINTS.throw : HINTS.layout}
        </p>
        <svg
          ref={svgRef}
          className="tf-layout__svg"
          viewBox={`${-MARGIN} ${-MARGIN} ${board.width + MARGIN * 2} ${board.height + MARGIN * 2}`}
          role="group"
          aria-label="Your opened-up finds, laid flat"
          onPointerDown={() => setSelectedId(null)}
        >
          <PanelBoardArt board={board} />
          {pieces.map((piece) => {
            const placement = placements[piece.id];
            if (placement === undefined || piece.id === ghost?.pieceId) return null;
            const status = troubled.has(piece.id) ? "invalid" : selectedId === piece.id ? "selected" : "idle";
            return (
              <PlacedPieceArt
                key={piece.id}
                piece={piece}
                fabric={clothFor(piece, placement)}
                x={placement.x}
                y={placement.y}
                rotation={placement.rotation}
                state={status}
                className={
                  drag?.pieceId === piece.id ? "tf-layout-piece tf-layout-piece--dragging" : "tf-layout-piece"
                }
                onPointerDown={(event) => beginBoard(event, piece.id)}
                onPointerMove={move}
                onPointerUp={finish}
                onPointerCancel={() => setDrag(null)}
              />
            );
          })}
          {ghost !== null && ghost.placement !== null
            ? pieces
                .filter((piece) => piece.id === ghost.pieceId)
                .map((piece) =>
                  ghost.placement === null ? null : (
                    <PlacedPieceArt
                      key="ghost"
                      piece={piece}
                      fabric={clothFor(piece, ghost.placement)}
                      x={ghost.placement.x}
                      y={ghost.placement.y}
                      rotation={ghost.placement.rotation}
                      state={troubled.has(piece.id) ? "invalid" : "selected"}
                      className="tf-layout-piece tf-layout-piece--ghost"
                    />
                  ),
                )
            : null}
        </svg>
      </div>
      <div className="tf-layout__side">
        {selected !== undefined && selectedPlacement !== undefined ? (
          <div className="tf-inspector" aria-live="polite">
            <strong>{selected.name}</strong>
            <span className="tf-inspector__grain">{grainLabel(selected, selectedPlacement)}</span>
            <div className="tf-inspector__row">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => rotate(selected, selectedPlacement, -1)}
                aria-label={`Turn ${selected.name} left`}
              >
                ↺ Turn
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => rotate(selected, selectedPlacement, 1)}
                aria-label={`Turn ${selected.name} right`}
              >
                ↻ Turn
              </Button>
            </div>
            <div className="tf-inspector__pad" role="group" aria-label={`Slide ${selected.name}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nudge(selected, selectedPlacement, 0, -2)}
                aria-label="Slide up"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nudge(selected, selectedPlacement, -2, 0)}
                aria-label="Slide left"
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nudge(selected, selectedPlacement, 2, 0)}
                aria-label="Slide right"
              >
                →
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nudge(selected, selectedPlacement, 0, 2)}
                aria-label="Slide down"
              >
                ↓
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch({ type: "removePiece", pieceId: selected.id });
                setSelectedId(null);
              }}
            >
              Back to the tray
            </Button>
          </div>
        ) : (
          <div className="tf-inspector tf-inspector--empty">
            <strong>Fabric lines</strong>
            <p>Pieces hang best with their arrow along the fabric lines. Double-tap a piece to turn it.</p>
          </div>
        )}
        {issues.length > 0 ? (
          <ul className="tf-layout__issues" aria-live="polite">
            {[...new Set(issues.map((issue) => issue.message))].slice(0, 3).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : (
          <p className="tf-layout__ok">
            <Icon name="check" size={16} /> Every piece fits!
          </p>
        )}
      </div>
      <StageFooter {...props} hint="Perfect fit! Pick up the scissors." />
    </div>
  );
}
