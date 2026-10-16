import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import type { FloorPattern } from "../../../content/floor";
import { HINTS } from "../../../content/hints";
import { COACH_FLOOR_PIECES, floorCanvas, floorPieces, isPastGate } from "../../../core";

interface CoachFloorProps {
  readonly pattern: FloorPattern;
  readonly tolerance: number;
  readonly onDone: (drops: readonly Point[]) => boolean;
}

const MARGIN = 12;
const START: Point = [6.5, 3.5];

export function CoachFloor({ pattern, tolerance, onDone }: CoachFloorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pieces = floorPieces(pattern).slice(0, COACH_FLOOR_PIECES);
  const canvas = floorCanvas(pattern);
  const [drops, setDrops] = useState<readonly Point[]>([]);
  const next = pieces[drops.length];
  const [pose, setPose] = useState<Point>(() =>
    next === undefined ? [0, 0] : [next.x + START[0], next.y + START[1]],
  );
  const [dragging, setDragging] = useState<Point | null>(null);
  const [hint, setHint] = useState("Drag the piece onto its shadow, then press it down.");

  const press = () => {
    if (next === undefined) return;
    if (isPastGate(Math.hypot(pose[0] - next.x, pose[1] - next.y), tolerance)) {
      setHint(HINTS.floorPastGate);
      return;
    }
    const placed = [...drops, pose];
    setDrops(placed);
    const after = pieces[placed.length];
    if (after !== undefined) setPose([after.x + START[0], after.y + START[1]]);
    setHint(after === undefined ? "Thunk! All three are down." : "Thunk! Now the next one.");
  };

  const toCm = (event: PointerEvent<SVGElement>): Point | null => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    return point === null ? null : [point.x, point.y];
  };

  const keys = (event: KeyboardEvent<SVGGElement>) => {
    const moves: Readonly<Record<string, Point>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (event.key === "Enter") {
      event.preventDefault();
      press();
      return;
    }
    if (move === undefined) return;
    event.preventDefault();
    setPose([pose[0] + move[0], pose[1] + move[1]]);
  };

  return (
    <div className="is-coach-floor">
      <svg
        ref={svgRef}
        viewBox={`${-MARGIN} ${-MARGIN} ${canvas.width + MARGIN * 2} ${canvas.height + MARGIN * 2}`}
        className="is-coach-floor__area"
        role="group"
        aria-label={`${drops.length} of ${pieces.length} sample pieces laid`}
        onPointerMove={(event) => {
          if (dragging === null) return;
          const at = toCm(event);
          if (at !== null) setPose([at[0] - dragging[0], at[1] - dragging[1]]);
        }}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        <rect
          x={-MARGIN}
          y={-MARGIN}
          width={canvas.width + MARGIN * 2}
          height={canvas.height + MARGIN * 2}
          rx={4}
          fill="#b9b1aa"
        />
        {pieces.map((piece, index) =>
          index < drops.length ? (
            <rect
              key={piece.index}
              x={drops[index]?.[0] ?? piece.x}
              y={drops[index]?.[1] ?? piece.y}
              width={piece.width}
              height={piece.height}
              rx={1.2}
              fill={piece.tone === "dark" ? "#2a2730" : "#c8914f"}
              stroke="#3b2a33"
              strokeWidth={0.5}
            />
          ) : (
            <rect
              key={piece.index}
              x={piece.x + 0.4}
              y={piece.y + 0.4}
              width={piece.width - 0.8}
              height={piece.height - 0.8}
              rx={1}
              fill={index === drops.length ? "rgba(255,255,255,0.3)" : "none"}
              stroke="#ffffff"
              strokeDasharray="2 1.4"
              strokeWidth={0.6}
            />
          ),
        )}
        {next === undefined ? null : (
          <g
            transform={`translate(${pose[0]} ${pose[1]})`}
            tabIndex={0}
            role="button"
            aria-label="Sample floor piece. Arrow keys nudge it, Enter presses it down."
            className="is-coach-floor__piece"
            data-testid="coach-floor-piece"
            onKeyDown={keys}
            onPointerDown={(event) => {
              const at = toCm(event);
              if (at === null) return;
              event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
              setDragging([at[0] - pose[0], at[1] - pose[1]]);
            }}
          >
            <rect
              width={next.width}
              height={next.height}
              rx={1.2}
              fill={next.tone === "dark" ? "#2a2730" : "#d9a873"}
              stroke="#3b2a33"
              strokeWidth={0.7}
            />
          </g>
        )}
      </svg>
      <p className="is-floor__hint" role="status" aria-live="polite">
        {hint}
      </p>
      <div className="is-crew-coach__buttons">
        <Button
          variant="secondary"
          onClick={press}
          disabled={next === undefined}
          data-testid="coach-floor-press"
        >
          Press it down
        </Button>
        <Button
          disabled={drops.length < pieces.length}
          onClick={() => {
            if (!onDone(drops)) setHint(HINTS.floorPastGate);
          }}
          data-testid="coach-floor-done"
        >
          Show the crew
        </Button>
      </div>
    </div>
  );
}
