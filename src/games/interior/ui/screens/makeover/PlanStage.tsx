import { useRef, useState, type KeyboardEvent } from "react";
import type { SvgPoint } from "../../../../../ui/kit/clientToSvg";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { FurnitureId } from "../../../content/furniture";
import { HINTS } from "../../../content/hints";
import {
  difficultyById,
  furnitureById,
  pieceShape,
  placementIssue,
  plannedSpend,
  roomById,
  tidyIssue,
  turnedPlacement,
  walkThrough,
  type PlacedPiece,
  type Turn,
} from "../../../core";
import { BlueprintGrid, PLAN_CELL } from "../../art/BlueprintGrid";
import { FootprintMark } from "../../art/FootprintMark";
import { FurnitureSymbol, symbolTransform } from "../../art/FurnitureSymbol";
import { useAssist } from "../../useAssist";
import { usePointerDrag } from "../../usePointerDrag";
import { PlanTray, trayCardId } from "./PlanTray";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./plan.css";

type PlanDrag =
  | { readonly source: "tray"; readonly furnitureId: FurnitureId }
  | { readonly source: "grid"; readonly piece: PlacedPiece };

interface Pose {
  readonly col: number;
  readonly row: number;
  readonly rotation: Turn;
  readonly furnitureId: FurnitureId;
  readonly pieceId: string | null;
}

const TURN_ORDER: readonly Turn[] = [0, 90, 180, 270];
const DOUBLE_TAP_MS = 400;

function dragPiece(drag: PlanDrag): { furnitureId: FurnitureId; pieceId: string | null; rotation: Turn } {
  return drag.source === "tray"
    ? { furnitureId: drag.furnitureId, pieceId: null, rotation: 0 }
    : { furnitureId: drag.piece.furnitureId, pieceId: drag.piece.id, rotation: drag.piece.rotation };
}

export function PlanStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const room = roomById(run.brief.roomId);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [tidyOn] = useAssist("plan");
  const lastTrayTap = useRef<{ readonly furnitureId: FurnitureId; readonly at: number } | null>(null);
  const walk = walkThrough(
    room,
    run.plan.pieces,
    difficultyById(state.profile.difficulty).toleranceMultiplier,
  );
  const spend = plannedSpend(state, run);

  const poseAt = (drag: PlanDrag, spot: SvgPoint | null): Pose | null => {
    if (spot === null) return null;
    const inside =
      spot.x >= -PLAN_CELL * 0.3 &&
      spot.y >= -PLAN_CELL * 0.3 &&
      spot.x <= room.cols * PLAN_CELL + PLAN_CELL * 0.3 &&
      spot.y <= room.rows * PLAN_CELL + PLAN_CELL * 0.3;
    if (!inside) return null;
    const base = dragPiece(drag);
    const shape = pieceShape(base.furnitureId, base.rotation);
    return {
      ...base,
      col: Math.round(spot.x / PLAN_CELL - shape.width / 2),
      row: Math.round(spot.y / PLAN_CELL - shape.depth / 2),
    };
  };

  const place = (pose: Pose): boolean => {
    const issue = placementIssue(run, pose);
    if (issue !== null) {
      setHint(issue);
      return false;
    }
    setHint(null);
    return dispatch({ type: "placePiece", ...pose });
  };

  const firstSpot = (furnitureId: FurnitureId): Pose | null => {
    for (const rotation of TURN_ORDER)
      for (let row = 0; row < room.rows; row += 1)
        for (let col = 0; col < room.cols; col += 1) {
          const pose: Pose = { furnitureId, pieceId: null, col, row, rotation };
          if (placementIssue(run, pose) === null) return pose;
        }
    return null;
  };

  const onDrop = (drag: PlanDrag, spot: SvgPoint | null) => {
    const pose = poseAt(drag, spot);
    if (pose === null) {
      if (drag.source === "grid") {
        dispatch({ type: "removePiece", pieceId: drag.piece.id });
        setSelected(null);
      }
      return;
    }
    if (place(pose) && pose.pieceId !== null) setSelected(pose.pieceId);
  };

  const onTap = (drag: PlanDrag) => {
    if (drag.source === "grid") {
      setSelected(drag.piece.id);
      return;
    }
    const now = window.performance.now();
    const previous = lastTrayTap.current;
    lastTrayTap.current = { furnitureId: drag.furnitureId, at: now };
    if (previous !== null && previous.furnitureId === drag.furnitureId && now - previous.at < DOUBLE_TAP_MS)
      return;
    const spot = firstSpot(drag.furnitureId);
    if (spot === null) setHint("No space left for that piece. Try moving things.");
    else place(spot);
  };

  const { active, handlers } = usePointerDrag<PlanDrag>(svgRef, onDrop, onTap);
  const preview = active !== null && active.moved ? poseAt(active.payload, active.spot) : null;
  const previewIssue = preview === null ? null : placementIssue(run, preview);
  const selectedPiece = run.plan.pieces.find((piece) => piece.id === selected) ?? null;

  const nudge = (piece: PlacedPiece, event: KeyboardEvent<SVGGElement>) => {
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      place({
        furnitureId: piece.furnitureId,
        pieceId: piece.id,
        col: piece.col + move[0],
        row: piece.row + move[1],
        rotation: piece.rotation,
      });
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      rotate(piece.id);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      backToTray(piece);
    }
  };

  const backToTray = (piece: PlacedPiece) => {
    dispatch({ type: "removePiece", pieceId: piece.id });
    setSelected(null);
    document.getElementById(trayCardId(piece.furnitureId))?.focus();
  };

  const tidy = () => {
    const issue = tidyIssue(run);
    setHint(issue);
    if (issue === null) dispatch({ type: "tidyUp" });
  };

  const rotate = (pieceId: string) => {
    const turned = turnedPlacement(run, pieceId);
    if (turned === null) return;
    const issue = placementIssue(run, turned);
    if (issue !== null) setHint(issue);
    else {
      setHint(null);
      dispatch({ type: "rotatePiece", pieceId });
    }
  };

  return (
    <div className="is-plan">
      <div className="is-plan__work">
        <div className="is-plan__board">
          <div className="is-plan__budget" data-testid="plan-total">
            <span>
              <Icon name="coin" size={16} /> Plan total <strong>{spend}</strong> / {run.brief.budget}
            </span>
            <span className="is-plan__meter" aria-hidden="true">
              <span
                style={{ width: `${Math.min(100, (100 * spend) / run.brief.budget)}%` }}
                className={
                  spend > run.brief.budget
                    ? "is-plan__meter-fill is-plan__meter-fill--over"
                    : "is-plan__meter-fill"
                }
              />
            </span>
            <span className="is-plan__walk">
              Walk-through space <strong>{Math.round(walk.flow * 100)}%</strong>
            </span>
          </div>
          {spend > run.brief.budget ? (
            <p className="is-plan__hint is-plan__hint--warn">{HINTS.overBudget}</p>
          ) : null}
          <p className="is-plan__hint" role="status" aria-live="polite">
            {hint ??
              (walk.footprints.some((print) => !print.reached)
                ? HINTS.useSpotBlocked
                : "Drag pieces onto the plan. Tap a piece to pick it, then Turn ↻.")}
          </p>
          <div className="is-plan__grid-wrap">
            <BlueprintGrid ref={svgRef} room={room} title="Floor plan" className="is-plan__grid">
              {run.plan.pieces.map((piece) => {
                const shape = pieceShape(piece.furnitureId, piece.rotation);
                const def = furnitureById(piece.furnitureId);
                const dragging =
                  active?.moved === true &&
                  active.payload.source === "grid" &&
                  active.payload.piece.id === piece.id;
                return (
                  <g
                    key={piece.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${def.name}. Arrow keys move it, R turns it, Delete removes it.`}
                    aria-pressed={selected === piece.id}
                    className={[
                      "is-plan__piece",
                      selected === piece.id ? "is-plan__piece--selected" : "",
                      dragging ? "is-plan__piece--lifted" : "",
                    ].join(" ")}
                    data-testid={`placed-${piece.furnitureId}`}
                    transform={symbolTransform(
                      piece.furnitureId,
                      PLAN_CELL,
                      (piece.col + shape.width / 2) * PLAN_CELL,
                      (piece.row + shape.depth / 2) * PLAN_CELL,
                      piece.rotation,
                    )}
                    onKeyDown={(event) => nudge(piece, event)}
                    onFocus={() => setSelected(piece.id)}
                    {...handlers({ source: "grid", piece })}
                  >
                    <g className="is-plan__drop">
                      <FurnitureSymbol
                        furnitureId={piece.furnitureId}
                        cell={PLAN_CELL}
                        fill={def.tall ? "rgba(42,79,130,0.92)" : "rgba(90,134,194,0.92)"}
                      />
                    </g>
                  </g>
                );
              })}
              {walk.footprints.map((print) => (
                <FootprintMark
                  key={`${print.pieceId}-${print.cell[0]}-${print.cell[1]}`}
                  x={(print.cell[0] + 0.5) * PLAN_CELL}
                  y={(print.cell[1] + 0.5) * PLAN_CELL}
                  size={PLAN_CELL * 0.7}
                  reached={print.reached}
                />
              ))}
              {preview !== null ? (
                <g className="is-plan__preview" pointerEvents="none">
                  {pieceShape(preview.furnitureId, preview.rotation).cells.map(([col, row]) => (
                    <rect
                      key={`${col}-${row}`}
                      x={(preview.col + col) * PLAN_CELL + 3}
                      y={(preview.row + row) * PLAN_CELL + 3}
                      width={PLAN_CELL - 6}
                      height={PLAN_CELL - 6}
                      rx={8}
                      fill={previewIssue === null ? "rgba(127,209,139,0.45)" : "rgba(226,87,76,0.35)"}
                      stroke={previewIssue === null ? "#7fd18b" : "#ffffff"}
                      strokeWidth={3}
                      strokeDasharray={previewIssue === null ? undefined : "8 6"}
                    />
                  ))}
                  {previewIssue !== null ? (
                    <text
                      x={(preview.col + 0.2) * PLAN_CELL}
                      y={preview.row * PLAN_CELL - 8}
                      className="is-plan__reason"
                    >
                      {previewIssue}
                    </text>
                  ) : null}
                </g>
              ) : null}
            </BlueprintGrid>
          </div>
          <div className="is-plan__tools" aria-label="Selected piece">
            {selectedPiece !== null ? (
              <>
                <span className="is-plan__selected">{furnitureById(selectedPiece.furnitureId).name}</span>
                <Button
                  variant="secondary"
                  className="is-plan__tool"
                  onClick={() => rotate(selectedPiece.id)}
                  data-testid="turn-piece"
                >
                  Turn ↻
                </Button>
                <Button variant="ghost" className="is-plan__tool" onClick={() => backToTray(selectedPiece)}>
                  Back to tray
                </Button>
              </>
            ) : (
              <span className="is-muted">Tap a piece on the plan to turn it or take it back.</span>
            )}
            {tidyOn ? (
              <Button variant="secondary" icon="sparkle" onClick={tidy} data-testid="tidy-up">
                Tidy up
              </Button>
            ) : null}
          </div>
        </div>
        <PlanTray
          run={run}
          furnitureHandlers={(furnitureId) => handlers({ source: "tray", furnitureId })}
          onPaint={(slot, paintId) => dispatch({ type: "choosePaint", slot, paintId })}
          onFloor={(floorId) => dispatch({ type: "chooseFloor", floorId })}
          onAddLight={(lightId) => dispatch({ type: "addLight", lightId })}
          onRemoveLight={(index) => dispatch({ type: "removeLight", index })}
        />
      </div>
      {active !== null && active.moved && active.payload.source === "tray" ? (
        <div
          className="is-plan__ghost"
          style={{ left: active.clientX, top: active.clientY }}
          aria-hidden="true"
        >
          {furnitureById(active.payload.furnitureId).name}
        </div>
      ) : null}
      <StageFooter {...props} ready="Plan ready. Off to the warehouse!" />
    </div>
  );
}
