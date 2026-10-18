import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import type { SvgPoint } from "../../../../../ui/kit/clientToSvg";
import { HINTS, HOME_HINTS } from "../../../content/hints";
import {
  dropOffset,
  FLOOR_PIECES,
  FLOOR_PX_PER_CM,
  floorById,
  floorCandidates,
  floorCanvas,
  runFloorPieces,
  floorTolerance,
  isPastGate,
  isRightPiece,
  laidCount,
  paintById,
  runPattern,
  type FloorCandidate,
  type PieceSource,
  type PieceTone,
} from "../../../core";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { BARE_WALL, roomHex } from "../../art/roomHex";
import { FloorPieceArt, pieceFinish } from "./FloorPieceArt";
import { FLOOR_VIEW, FloorRoomBack } from "./FloorRoom";
import { useAssist } from "../../useAssist";
import { usePointerDrag } from "../../usePointerDrag";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./floor.css";

interface Pending {
  readonly candidate: FloorCandidate;
  readonly x: number;
  readonly y: number;
}

type FloorDrag = { readonly kind: "tray"; readonly candidate: FloorCandidate } | { readonly kind: "pending" };

const MARGIN = 14;
const TAP_OFFSET = { x: 6.5, y: 3.5 } as const;

function toneFill(tone: PieceTone, base: string): string {
  if (tone === "dark") return "#2a2730";
  if (tone === "light") return "#f4ecd8";
  return base;
}

export function FloorStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const { reducedMotion } = useSettings();
  const svgRef = useRef<SVGSVGElement>(null);
  const [magnet] = useAssist("floor");
  const [pending, setPending] = useState<Pending | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [wobble, setWobble] = useState<string | null>(null);
  const pattern = runPattern(run);
  const canvas = floorCanvas(pattern);
  const pieces = useMemo(() => runFloorPieces(run), [run]);
  const laid = laidCount(run);
  const next = pieces[laid];
  const floor = run.plan.floor === null ? null : floorById(run.plan.floor);
  const base = floor === null ? "#c8914f" : roomHex(floor.colours[0] ?? "ivory");
  const hallFloor = run.purpose.kind === "home-room" ? run.purpose.hallFloor : null;
  const threshold = pieces.some((piece) => piece.source === "hall") && hallFloor !== null;
  const hallBase = hallFloor === null ? base : roomHex(floorById(hallFloor).colours[0] ?? "ivory");
  const fillFor = (source: PieceSource, tone: PieceTone) =>
    toneFill(tone, source === "hall" ? hallBase : base);
  const boards = pattern === "boards";
  const finish = pieceFinish(run.plan.floor, boards);
  const sceneId = useSvgId("is-floor");
  const wallPaint = run.plan.featurePaint ?? run.plan.wallPaint;
  const wall = wallPaint === null ? BARE_WALL : roomHex(paintById(wallPaint).colour);
  const view = {
    x: -MARGIN - FLOOR_VIEW.side,
    y: -MARGIN - FLOOR_VIEW.top,
    width: canvas.width + (MARGIN + FLOOR_VIEW.side) * 2,
    height: canvas.height + MARGIN * 2 + FLOOR_VIEW.top + FLOOR_VIEW.bottom,
  };
  const tolerance = floorTolerance(state);
  const candidates = next === undefined ? [] : floorCandidates(run, next);

  const shake = (candidate: FloorCandidate) => {
    setWobble(candidate.key);
    setHint(
      next !== undefined && candidate.source !== next.source ? HOME_HINTS.wrongFloor : HINTS.wrongFloorPiece,
    );
    window.setTimeout(() => setWobble(null), reducedMotion ? 0 : 450);
  };

  const pendingAt = (candidate: FloorCandidate, spot: SvgPoint | null): Pending | null => {
    if (spot === null || next === undefined) return null;
    if (
      spot.x < -MARGIN ||
      spot.y < -MARGIN ||
      spot.x > canvas.width + MARGIN ||
      spot.y > canvas.height + MARGIN
    )
      return null;
    if (magnet) return { candidate, x: next.x, y: next.y };
    return {
      candidate,
      x: Math.round((spot.x - candidate.width / 2) * 10) / 10,
      y: Math.round((spot.y - candidate.height / 2) * 10) / 10,
    };
  };

  const onDrop = (drag: FloorDrag, spot: SvgPoint | null) => {
    const candidate = drag.kind === "tray" ? drag.candidate : pending?.candidate;
    if (candidate === undefined) return;
    if (!isRightPiece(run, laid, candidate.key)) {
      shake(candidate);
      return;
    }
    const placed = pendingAt(candidate, spot);
    if (placed === null) return;
    setPending(placed);
    setHint("Now tap Press it down.");
  };

  const onTap = (drag: FloorDrag) => {
    if (drag.kind === "pending" || next === undefined) return;
    if (!isRightPiece(run, laid, drag.candidate.key)) {
      shake(drag.candidate);
      return;
    }
    setPending(
      magnet
        ? { candidate: drag.candidate, x: next.x, y: next.y }
        : { candidate: drag.candidate, x: next.x + TAP_OFFSET.x, y: next.y + TAP_OFFSET.y },
    );
    setHint("Nudge it onto the shadow, then tap Press it down.");
  };

  const { active, handlers } = usePointerDrag<FloorDrag>(svgRef, onDrop, onTap);
  const draggedCandidate =
    active === null || !active.moved
      ? null
      : active.payload.kind === "tray"
        ? active.payload.candidate
        : (pending?.candidate ?? null);
  const ghostPending =
    active === null || draggedCandidate === null ? null : pendingAt(draggedCandidate, active.spot);

  const press = () => {
    if (pending === null) return;
    const offset = dropOffset(run, { pieceIndex: laid, x: pending.x, y: pending.y });
    if (isPastGate(offset, tolerance)) {
      setPending(null);
      setHint(HINTS.floorPastGate);
      return;
    }
    if (
      dispatch({
        type: "layFloor",
        pieceIndex: laid,
        candidateKey: pending.candidate.key,
        x: pending.x,
        y: pending.y,
        assisted: magnet,
      })
    ) {
      setPending(null);
      setHint(laid + 1 >= FLOOR_PIECES ? "Snug as can be! Your helper lays the rest." : "Thunk! Next piece.");
    }
  };

  const nudge = (event: KeyboardEvent<SVGGElement>) => {
    if (pending === null) return;
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      setPending({ ...pending, x: pending.x + move[0], y: pending.y + move[1] });
    } else if (event.key === "Enter") {
      event.preventDefault();
      press();
    }
  };

  const shown = ghostPending ?? pending;
  const boxStyle = (box: { x: number; y: number; width: number; height: number }): CSSProperties => ({
    left: `${(((box.x - view.x) / view.width) * 100).toFixed(2)}%`,
    top: `${(((box.y - view.y) / view.height) * 100).toFixed(2)}%`,
    width: `${((box.width / view.width) * 100).toFixed(2)}%`,
    height: `${((box.height / view.height) * 100).toFixed(2)}%`,
  });
  const fresh = laid > 0 ? pieces[laid - 1] : undefined;
  return (
    <div className="is-floor">
      <div className="is-floor__work">
        <div className="is-floor__bench">
          <div className="is-floor__left">
            <div
              className="is-floor__board"
              style={{ "--floor-aspect": (view.width / view.height).toFixed(3) } as CSSProperties}
            >
              <svg
                ref={svgRef}
                className="is-floor__area"
                viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
                width={view.width * FLOOR_PX_PER_CM}
                height={view.height * FLOOR_PX_PER_CM}
                data-testid="floor-area"
                data-target={next === undefined ? "" : `${next.x},${next.y}`}
                role="img"
                aria-label={`Floor strip, ${laid} of ${FLOOR_PIECES} pieces laid`}
              >
                <FloorRoomBack
                  width={canvas.width}
                  height={canvas.height}
                  margin={MARGIN}
                  wall={wall}
                  fill={base}
                  finish={finish}
                  pieces={pieces}
                  id={sceneId}
                />
                {pieces.map((piece) => {
                  const done = Object.hasOwn(run.floorLaid, String(piece.index));
                  return done ? (
                    <g key={piece.index} transform={`translate(${piece.x} ${piece.y})`}>
                      <rect
                        x={0.8}
                        y={1.6}
                        width={piece.width}
                        height={piece.height}
                        rx={1.2}
                        fill="#1c1220"
                        opacity={0.18}
                      />
                      <FloorPieceArt
                        width={piece.width}
                        height={piece.height}
                        fill={fillFor(piece.source, piece.tone)}
                        finish={finish}
                        seed={piece.index + 1}
                      />
                    </g>
                  ) : (
                    <rect
                      key={piece.index}
                      x={piece.x + 0.4}
                      y={piece.y + 0.4}
                      width={piece.width - 0.8}
                      height={piece.height - 0.8}
                      rx={1}
                      fill={piece.index === laid ? "rgba(255,246,200,0.35)" : "none"}
                      stroke={piece.index === laid ? "#fff6c8" : "#ffffff"}
                      strokeOpacity={piece.index === laid ? 1 : 0.5}
                      strokeWidth={piece.index === laid ? 0.9 : 0.5}
                      strokeDasharray="2 1.4"
                    />
                  );
                })}
                {shown !== null ? (
                  <g
                    transform={`translate(${shown.x} ${shown.y})`}
                    tabIndex={0}
                    role="button"
                    aria-label="The piece you are placing. Arrow keys nudge it, Enter presses it down."
                    className="is-floor__pending"
                    onKeyDown={nudge}
                    data-testid="floor-pending"
                    {...(pending !== null ? handlers({ kind: "pending" }) : {})}
                  >
                    <rect
                      x={1.4}
                      y={3}
                      width={shown.candidate.width}
                      height={shown.candidate.height}
                      rx={1.2}
                      fill="#1c1220"
                      opacity={0.26}
                    />
                    <FloorPieceArt
                      width={shown.candidate.width}
                      height={shown.candidate.height}
                      fill={fillFor(shown.candidate.source, shown.candidate.tone)}
                      finish={finish}
                      seed={laid + 1}
                    />
                  </g>
                ) : null}
              </svg>
              {next !== undefined && pending === null ? (
                <span className="is-floor__spot" style={boxStyle(next)} aria-hidden="true" />
              ) : null}
              {fresh !== undefined ? (
                <span key={laid} className="is-floor__burst" style={boxStyle(fresh)} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
            </div>
            <p className="is-floor__caption">
              <strong>Show strip by the door.</strong> Your helper copies your pattern for the rest.
            </p>
          </div>
          <div className="is-floor__side">
            <p className="is-floor__hint" role="status" aria-live="polite">
              {hint ??
                (next === undefined
                  ? "Every piece is down. Lovely and snug!"
                  : threshold
                    ? HOME_HINTS.threshold
                    : "Drag the piece that fits onto the glowing spot.")}
            </p>
            <div className="is-floor__controls">
              <div className="is-floor__tray" aria-label="Floor pieces to pick from">
                <span className="is-floor__tray-label" aria-hidden="true">
                  Next piece
                </span>
                {next === undefined
                  ? null
                  : candidates.map((candidate) => (
                      <button
                        key={candidate.key}
                        type="button"
                        className={[
                          "is-floor__candidate",
                          wobble === candidate.key ? "is-wobble" : "",
                          magnet && isRightPiece(run, laid, candidate.key) ? "is-floor__candidate--glow" : "",
                        ].join(" ")}
                        data-testid={`floor-candidate-${candidate.key}`}
                        data-right={isRightPiece(run, laid, candidate.key) ? "true" : undefined}
                        aria-label={`Floor piece ${candidate.width} by ${candidate.height}${candidate.tone === "plain" ? "" : `, ${candidate.tone}`}`}
                        {...handlers({ kind: "tray", candidate })}
                      >
                        <svg
                          viewBox={`-1 -1 ${candidate.width + 2} ${candidate.height + 2}`}
                          width={(candidate.width + 2) * 2.1}
                          height={(candidate.height + 2) * 2.1}
                          aria-hidden="true"
                        >
                          <FloorPieceArt
                            width={candidate.width}
                            height={candidate.height}
                            fill={fillFor(candidate.source, candidate.tone)}
                            finish={finish}
                            seed={laid + 1}
                          />
                        </svg>
                        <span className="is-floor__size" aria-hidden="true">
                          {candidate.width} × {candidate.height}
                        </span>
                      </button>
                    ))}
              </div>
              <Button
                size="lg"
                icon="check"
                className="is-floor__press"
                onClick={press}
                disabledReason={pending === null ? "First drop a piece on the glowing spot." : undefined}
                showReason
                data-testid="press-floor"
              >
                Press it down
              </Button>
            </div>
            {magnet ? null : <p className="is-hint is-floor__assist">{assistHint("Floor magnet", state)}</p>}
          </div>
        </div>
      </div>
      <StageFooter {...props} ready="The floor is down. Time for lights!" />
    </div>
  );
}
