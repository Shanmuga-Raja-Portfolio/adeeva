import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { Icon } from "../../../../../ui/kit/IconSet";
import { SET_HINTS } from "../../../content/hint";
import {
  arrangeIssue,
  bayCount,
  FLOOR,
  isOnOwnRug,
  productById,
  rugsFor,
  setTemplateById,
  spotPolygon,
  type Action,
  type FloorSpot,
  type GameState,
  type QuarterTurn,
} from "../../../core";
import { floorLooks } from "../../art/pieceLook";
import { PiecePreview } from "../../art/PiecePreview";
import "./floor.css";

export interface FloorArrangeProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface Drag {
  readonly setId: string;
  readonly piece: number;
  readonly dx: number;
  readonly dy: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: QuarterTurn;
}

interface Chosen {
  readonly setId: string;
  readonly piece: number;
}

const RUG_FILLS = ["#c0574a", "#4a6378", "#3f6b4f"];
const NUDGE = 2;

function turned(rotation: QuarterTurn): QuarterTurn {
  return rotation === 0 ? 90 : rotation === 90 ? 180 : rotation === 180 ? 270 : 0;
}

function bounds(points: readonly (readonly [number, number])[]) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export function FloorArrange({ state, dispatch, onExit }: FloorArrangeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const showroom = state.showroom;
  const rugs = rugsFor(bayCount(state));

  const place = (setId: string, piece: number, spot: FloorSpot): boolean => {
    if (showroom === null) return false;
    const issue = arrangeIssue(showroom, setId, piece, spot);
    if (issue !== null) {
      setMessage(issue);
      return false;
    }
    dispatch({ type: "arrangeFloorPiece", setId, piece, ...spot });
    setMessage(null);
    return true;
  };

  const placeRef = useRef(place);
  useEffect(() => {
    placeRef.current = place;
  });

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
      if (current === null || point === null) return;
      const next = { ...current, x: Math.round(point.x - current.dx), y: Math.round(point.y - current.dy) };
      dragRef.current = next;
      setDrag(next);
    };
    const up = () => {
      const finished = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (finished !== null)
        placeRef.current(finished.setId, finished.piece, {
          x: finished.x,
          y: finished.y,
          rotation: finished.rotation,
        });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  if (showroom === null) return null;

  const start = (event: ReactPointerEvent, setId: string, piece: number, spot: FloorSpot) => {
    event.preventDefault();
    setChosen({ setId, piece });
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    const next: Drag = {
      setId,
      piece,
      dx: point.x - spot.x,
      dy: point.y - spot.y,
      x: spot.x,
      y: spot.y,
      rotation: spot.rotation,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const onKey = (event: KeyboardEvent, setId: string, piece: number, spot: FloorSpot) => {
    const steps: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      place(setId, piece, { ...spot, x: spot.x + step[0], y: spot.y + step[1] });
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      place(setId, piece, { ...spot, rotation: turned(spot.rotation) });
    }
  };

  const chosenSet = chosen === null ? undefined : showroom.floor.find((set) => set.setId === chosen.setId);
  const chosenPiece = chosen === null ? undefined : chosenSet?.pieces[chosen.piece];
  const turnChosen = () => {
    if (chosen === null || chosenPiece === undefined) return;
    place(chosen.setId, chosen.piece, { ...chosenPiece.spot, rotation: turned(chosenPiece.spot.rotation) });
  };

  return (
    <main className="ww-floor ad-screen" data-testid="floor-arrange">
      <header className="ww-floor__head">
        <div>
          <span className="ad-eyebrow">The Larkspur Road Showroom</span>
          <h1>Arrange the floor</h1>
          <p className="ww-muted">
            {SET_HINTS.rug} A set wholly on its own rug brings +2 buzz at Open House. Drag a piece, or tab to
            it and use the arrow keys. Tap Turn, or press R, to turn it.
          </p>
        </div>
        <Button icon="back" onClick={onExit} data-testid="floor-exit">
          Back to the shop
        </Button>
      </header>
      <div className="ww-floor__room ww-paper">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FLOOR.width} ${FLOOR.depth}`}
          className="ww-floor__canvas"
          role="group"
          aria-label="Showroom floor"
        >
          <defs>
            <pattern id="ww-floor-planks" patternUnits="userSpaceOnUse" width={40} height={10}>
              <rect width={40} height={10} fill="#d7a874" />
              <path d="M0 9.5 H40 M20 0 V5 M5 5 V10 M35 5 V10 M0 5 H40" stroke="#b98a58" strokeWidth={0.6} />
            </pattern>
          </defs>
          <rect width={FLOOR.width} height={FLOOR.depth} fill="url(#ww-floor-planks)" />
          {rugs.map((rug, bay) => {
            const set = showroom.floor.find((entry) => entry.bay === bay);
            return (
              <g key={bay}>
                <rect
                  x={rug.x}
                  y={rug.y}
                  width={rug.width}
                  height={rug.depth}
                  rx={6}
                  fill={RUG_FILLS[bay % RUG_FILLS.length]}
                  opacity={0.85}
                />
                <rect
                  x={rug.x + 3}
                  y={rug.y + 3}
                  width={rug.width - 6}
                  height={rug.depth - 6}
                  rx={4}
                  fill="none"
                  stroke="#fffaf0"
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
                <text x={rug.x + rug.width / 2} y={rug.y - 5} textAnchor="middle" className="ww-floor__label">
                  {set === undefined
                    ? `Bay ${bay + 1}: empty`
                    : `${setTemplateById(set.templateId).name}${isOnOwnRug(set, rugs) ? " ✓" : ""}`}
                </text>
              </g>
            );
          })}
          {showroom.floor.flatMap((set) => {
            const looks = floorLooks(set);
            return set.pieces.map((piece, index) => {
              const live = drag !== null && drag.setId === set.setId && drag.piece === index ? drag : null;
              const spot: FloorSpot =
                live === null ? piece.spot : { x: live.x, y: live.y, rotation: live.rotation };
              const box = bounds(spotPolygon(piece.productId, spot));
              const look = looks[index];
              const name = productById(piece.productId).name;
              return (
                <g
                  key={`${set.setId}-${index}`}
                  className={[
                    "ww-floor__piece",
                    live === null ? "" : "ww-floor__piece--lifted",
                    chosen?.setId === set.setId && chosen.piece === index ? "ww-floor__piece--chosen" : "",
                  ].join(" ")}
                  tabIndex={0}
                  role="button"
                  aria-label={`${name} from the ${setTemplateById(set.templateId).name}. Arrow keys move it, R turns it.`}
                  onPointerDown={(event) => start(event, set.setId, index, piece.spot)}
                  onKeyDown={(event) => onKey(event, set.setId, index, piece.spot)}
                  onFocus={() => setChosen({ setId: set.setId, piece: index })}
                  data-testid={`floor-piece-${set.setId}-${index}`}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx={2}
                    className="ww-floor__footprint"
                  />
                  {look !== undefined ? (
                    <svg
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      viewBox="40 40 320 240"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <PiecePreview look={look} title={null} showExtras={false} />
                    </svg>
                  ) : null}
                </g>
              );
            });
          })}
        </svg>
        <div className="ww-floor__controls">
          <Button
            variant="secondary"
            onClick={turnChosen}
            disabledReason={chosenPiece === undefined ? "Tap a piece first." : undefined}
            aria-label={
              chosenPiece === undefined
                ? "Turn a piece"
                : `Turn the ${productById(chosenPiece.productId).name}`
            }
            data-testid="floor-turn"
          >
            Turn ↻
          </Button>
          <span className="ww-muted">
            {chosenPiece === undefined
              ? "Tap a piece to choose it."
              : `Chosen: ${productById(chosenPiece.productId).name}`}
          </span>
        </div>
        <p className="ww-floor__message" role="status" aria-live="polite">
          {message ?? (
            <>
              <Icon name="heart" size={14} /> Visitors stroll in through the door at the front.
            </>
          )}
        </p>
      </div>
    </main>
  );
}
