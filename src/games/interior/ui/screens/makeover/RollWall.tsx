import { polylineLength } from "../../../../../engine/geometry/polylineLength";
import { useRef, useState, type PointerEvent } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { useSettings } from "../../../../../studio/SettingsContext";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { Meter } from "../../../../../ui/kit/Meter";
import type { WallId } from "../../../content/roomTemplate";
import { HINTS, HOME_HINTS } from "../../../content/hints";
import {
  coatedShare,
  hasWindow,
  isPaintable,
  paintableCells,
  isSplat,
  MIN_STROKE_PX,
  ROLL_CANVAS,
  ROLL_CELL_PX,
  ROLL_COLUMNS,
  ROLL_ROWS,
  ROLLER_LOAD,
  rollRecord,
  TOP_ZONE_ROWS,
  type Action,
  type GameState,
  type MakeoverRun,
  type RollerZone,
} from "../../../core";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { BARE_WALL } from "../../art/roomHex";

interface RollWallProps {
  readonly state: GameState;
  readonly run: MakeoverRun;
  readonly wall: WallId;
  readonly colour: string;
  readonly lowerColour: string | null;
  readonly dispatch: (action: Action) => boolean;
}

const SPARKLES: readonly (readonly [number, number])[] = [
  [70, 60],
  [190, 250],
  [330, 90],
  [450, 220],
  [110, 280],
];

interface Stroke {
  readonly points: readonly Point[];
  readonly startedAt: number;
}

function Tray({
  zone,
  colour,
  active,
  dipping,
  onDip,
}: {
  readonly zone: RollerZone;
  readonly colour: string;
  readonly active: boolean;
  readonly dipping: boolean;
  readonly onDip: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "is-tray-dip",
        dipping && active ? "is-tray-dip--dipping" : "",
        active ? "is-tray-dip--active" : "",
      ]
        .filter((name) => name.length > 0)
        .join(" ")}
      onClick={onDip}
      data-testid={`dip-${zone}`}
      aria-pressed={active}
      aria-label={`Dip the roller in the ${zone === "top" ? "top half" : "bottom half"} tray`}
    >
      <svg viewBox="0 0 80 50" aria-hidden="true">
        <path d="M6 14 L74 14 L64 44 L16 44 Z" fill="#c7ccd4" stroke="#3b2a33" strokeWidth={3} />
        <path d="M14 22 L66 22 L60 38 L20 38 Z" fill={colour} />
      </svg>
      <span>{zone === "top" ? "Top half" : "Bottom half"}</span>
    </button>
  );
}

export function RollWall({ state, run, wall, colour, lowerColour, dispatch }: RollWallProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { reducedMotion } = useSettings();
  const [stroke, setStroke] = useState<Stroke | null>(null);
  const [roller, setRoller] = useState<Point | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [dipping, setDipping] = useState(false);
  const [streak, setStreak] = useState<readonly Point[] | null>(null);
  const patternId = useSvgId("is-roll");
  const record = rollRecord(run, wall);
  const coated = coatedShare(run, wall);
  const full = paintableCells(run, wall).every((cell) => (record.passes[cell] ?? 0) >= 2);
  const zoned = lowerColour !== null;
  const rollerColour = zoned && run.rollerZone === "bottom" ? lowerColour : colour;
  const cellColour = (cell: number) =>
    zoned && Math.floor(cell / ROLL_COLUMNS) >= TOP_ZONE_ROWS ? lowerColour : colour;

  const pointOf = (event: PointerEvent<SVGSVGElement>): Point | null => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    return point === null ? null : [point.x, point.y];
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointOf(event);
    if (point === null) return;
    setStroke({ points: [point], startedAt: event.timeStamp });
    setRoller(point);
    setStreak(null);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointOf(event);
    if (point === null) return;
    setRoller(point);
    if (stroke !== null) setStroke({ ...stroke, points: [...stroke.points, point] });
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (stroke === null) return;
    const done = {
      points: stroke.points,
      durationMs: Math.max(1, Math.round(event.timeStamp - stroke.startedAt)),
    };
    setStroke(null);
    if (polylineLength(done.points) < MIN_STROKE_PX || done.points.length < 2) return;
    const dry = run.roller === 0;
    const wrongZone =
      zoned &&
      !dry &&
      done.points.some(([, y]) => (y < TOP_ZONE_ROWS * ROLL_CELL_PX ? "top" : "bottom") !== run.rollerZone);
    dispatch({ type: "rollStroke", wall, points: done.points, durationMs: done.durationMs });
    if (wrongZone) setHint(HOME_HINTS.twoTone);
    else if (dry) {
      setStreak(done.points);
      setHint(HINTS.rollerDry);
    } else if (isSplat(state, done)) setHint(HINTS.rollerTooFast);
    else setHint(null);
  };

  const dip = () => {
    if (!dispatch({ type: "reloadRoller" })) return;
    setHint(null);
    setDipping(true);
    window.setTimeout(() => setDipping(false), reducedMotion ? 0 : 400);
  };

  const dipZone = (zone: RollerZone) => {
    if (!dispatch({ type: "pickTray", zone })) return;
    setHint(null);
    setDipping(true);
    window.setTimeout(() => setDipping(false), reducedMotion ? 0 : 400);
  };

  const trail = stroke?.points ?? [];
  return (
    <div
      className="is-roll"
      data-testid={`roll-${wall}`}
      data-load={run.roller}
      data-coated={coated.toFixed(2)}
    >
      <svg
        ref={svgRef}
        className="is-roll__wall"
        viewBox={`0 0 ${ROLL_CANVAS.width} ${ROLL_CANVAS.height}`}
        width={ROLL_CANVAS.width}
        height={ROLL_CANVAS.height}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setStroke(null)}
        onPointerLeave={() => setRoller(null)}
        role="img"
        aria-label={`Wall to roll, ${Math.round(coated * 100)}% painted`}
      >
        <defs>
          <pattern id={`${patternId}-streak`} width={18} height={64} patternUnits="userSpaceOnUse">
            <rect width={18} height={64} fill={colour} opacity={0.62} />
            <rect x={11} width={4} height={64} fill={BARE_WALL} opacity={0.55} />
          </pattern>
          <linearGradient id={`${patternId}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.32} />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.08} />
          </linearGradient>
          <pattern id={`${patternId}-plaster`} width={24} height={24} patternUnits="userSpaceOnUse">
            <rect width={24} height={24} fill={BARE_WALL} />
            <circle cx={5} cy={7} r={1.2} fill="#a39b97" />
            <circle cx={17} cy={15} r={1} fill="#cbc5c1" />
            <circle cx={11} cy={21} r={0.8} fill="#a39b97" />
          </pattern>
        </defs>
        <rect width={ROLL_CANVAS.width} height={ROLL_CANVAS.height} fill={`url(#${patternId}-plaster)`} />
        {Array.from({ length: ROLL_COLUMNS * ROLL_ROWS }, (_, cell) => {
          const x = (cell % ROLL_COLUMNS) * ROLL_CELL_PX;
          const y = Math.floor(cell / ROLL_COLUMNS) * ROLL_CELL_PX;
          if (!isPaintable(run, wall, cell)) return null;
          const passes = record.passes[cell] ?? 0;
          return passes === 0 ? null : (
            <rect
              key={cell}
              x={x - 2}
              y={y - 2}
              width={ROLL_CELL_PX + 4}
              height={ROLL_CELL_PX + 4}
              fill={passes >= 2 ? cellColour(cell) : `url(#${patternId}-streak)`}
              className="is-roll__coat"
            />
          );
        })}
        {coated > 0 ? (
          <rect
            width={ROLL_CANVAS.width}
            height={ROLL_CANVAS.height}
            fill={`url(#${patternId}-sheen)`}
            pointerEvents="none"
          />
        ) : null}
        {hasWindow(run, wall) ? (
          <g>
            <rect
              x={3 * ROLL_CELL_PX + 6}
              y={ROLL_CELL_PX + 6}
              width={ROLL_CELL_PX * 2 - 12}
              height={ROLL_CELL_PX * 2 - 12}
              fill="#bfe3f6"
              stroke="#fffaf2"
              strokeWidth={8}
            />
            <path
              d={`M${4 * ROLL_CELL_PX} ${ROLL_CELL_PX + 6} L${4 * ROLL_CELL_PX} ${3 * ROLL_CELL_PX - 6}`}
              stroke="#fffaf2"
              strokeWidth={5}
            />
          </g>
        ) : null}
        <g stroke="#3b2a33" strokeOpacity={0.07}>
          {Array.from({ length: ROLL_COLUMNS - 1 }, (_, index) => (
            <path
              key={`v${index}`}
              d={`M${(index + 1) * ROLL_CELL_PX} 0 L${(index + 1) * ROLL_CELL_PX} ${ROLL_CANVAS.height}`}
            />
          ))}
          {Array.from({ length: ROLL_ROWS - 1 }, (_, index) => (
            <path
              key={`h${index}`}
              d={`M0 ${(index + 1) * ROLL_CELL_PX} L${ROLL_CANVAS.width} ${(index + 1) * ROLL_CELL_PX}`}
            />
          ))}
        </g>
        {zoned ? (
          <g pointerEvents="none" data-testid="mid-tape">
            <rect
              x={0}
              y={TOP_ZONE_ROWS * ROLL_CELL_PX - 5}
              width={ROLL_CANVAS.width}
              height={10}
              fill="#7fb1e6"
              opacity={0.85}
            />
            <text x={12} y={TOP_ZONE_ROWS * ROLL_CELL_PX - 10} className="is-roll__zone">
              top half
            </text>
            <text x={12} y={TOP_ZONE_ROWS * ROLL_CELL_PX + 22} className="is-roll__zone">
              bottom half
            </text>
          </g>
        ) : null}
        {streak !== null ? (
          <polyline
            points={streak.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="#fffaf2"
            strokeOpacity={0.6}
            strokeWidth={50}
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
        ) : null}
        {trail.length > 1 ? (
          <polyline
            points={trail.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={rollerColour}
            strokeOpacity={run.roller === 0 ? 0.15 : 0.45}
            strokeWidth={64}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {record.splats.map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <g className={reducedMotion ? "" : "is-splat"}>
              <circle r={7} fill="#fbf0dc" />
              <circle cx={9} cy={-5} r={3} fill="#fbf0dc" />
              <circle cx={-7} cy={7} r={2.5} fill="#fbf0dc" />
            </g>
          </g>
        ))}
        {full ? (
          <g className="is-splat" pointerEvents="none">
            {SPARKLES.map(([x, y]) => (
              <path
                key={`${x}-${y}`}
                transform={`translate(${x} ${y})`}
                d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z"
                fill="#ffffff"
                stroke="#f6d77a"
                strokeWidth={1.5}
              />
            ))}
          </g>
        ) : null}
        {roller !== null ? (
          <g transform={`translate(${roller[0]} ${roller[1]})`} pointerEvents="none">
            <rect
              x={-36}
              y={-14}
              width={72}
              height={28}
              rx={12}
              fill={run.roller > 0 ? rollerColour : "#f4ecd8"}
              stroke="#3b2a33"
              strokeWidth={3}
            />
            <path
              d="M0 14 L0 30 L22 36 L22 70"
              fill="none"
              stroke="#3b2a33"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <rect
              x={16}
              y={62}
              width={12}
              height={34}
              rx={5}
              fill="#3c6aa8"
              stroke="#3b2a33"
              strokeWidth={3}
            />
          </g>
        ) : null}
      </svg>
      <div className="is-roll__side">
        {zoned ? (
          <div className="is-roll__trays" role="group" aria-label="Two paint trays">
            <Tray
              zone="top"
              colour={colour}
              active={run.rollerZone === "top"}
              dipping={dipping}
              onDip={() => dipZone("top")}
            />
            <Tray
              zone="bottom"
              colour={lowerColour}
              active={run.rollerZone === "bottom"}
              dipping={dipping}
              onDip={() => dipZone("bottom")}
            />
          </div>
        ) : (
          <button
            type="button"
            className={dipping ? "is-tray-dip is-tray-dip--dipping" : "is-tray-dip"}
            onClick={dip}
            data-testid="dip-roller"
            aria-label={`Dip the roller in the paint tray. Paint load ${run.roller} of ${ROLLER_LOAD}.`}
          >
            <svg viewBox="0 0 80 50" aria-hidden="true">
              <path d="M6 14 L74 14 L64 44 L16 44 Z" fill="#c7ccd4" stroke="#3b2a33" strokeWidth={3} />
              <path d="M14 22 L66 22 L60 38 L20 38 Z" fill={colour} />
            </svg>
            <span>Dip the roller</span>
          </button>
        )}
        <Meter
          label="Paint on the roller"
          value={run.roller}
          max={ROLLER_LOAD}
          valueText={`${run.roller} of ${ROLLER_LOAD}`}
        />
        <Meter
          label="Wall painted"
          value={Math.round(coated * 100)}
          max={100}
          tone="sage"
          valueText={`${Math.round(coated * 100)}%`}
        />
        <p className="is-roll__stats">
          Splats {record.splats.length} · Dry streaks {record.dryStrokes}
          {zoned ? ` · Smudges ${record.smudges}` : ""}
        </p>
        <p className="is-roll__hint" role="status" aria-live="polite">
          {hint ?? "Roll slowly. Two coats make it perfect."}
        </p>
      </div>
    </div>
  );
}
