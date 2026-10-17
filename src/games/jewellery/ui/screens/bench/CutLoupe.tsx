import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clamp } from "../../../../../engine/clamp";
import type { Point } from "../../../../../engine/geometry/point";
import { polygonBounds } from "../../../../../engine/geometry/polygonPlacement";
import { pointOnTrack, projectOnTrack, traceTrack } from "../../../../../engine/geometry/traceTrack";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { useElementWidth } from "../../../../../ui/kit/useElementSize";
import { HINTS } from "../../../content/hints";
import {
  cutAccuracy,
  cutCoverage,
  cutSamples,
  CUT_COVERAGE_NEEDED,
  dotReach,
  isCutComplete,
  MAX_PX_PER_MM,
  MIN_PX_PER_MM,
  trimStroke,
  type CutPath,
} from "../../../core";
import type { MetalLook } from "../../art/metalLook";
import { openPath, outlinePath } from "../../art/outlinePath";
import { MetalSheet } from "../../art/MetalSheet";
import { SawSprite } from "../../art/SawSprite";
import { Shavings, type Shaving } from "../../art/Shavings";
import type { CutStrokes } from "../../cutDraft";
import { StationStat } from "./StationStat";

interface CutLoupeProps {
  readonly path: CutPath;
  readonly outerPath: CutPath;
  readonly toleranceMm: number;
  readonly assisted: boolean;
  readonly metal: MetalLook;
  readonly reducedMotion: boolean;
  readonly draft: CutStrokes;
  readonly onDraft: (strokes: CutStrokes) => void;
  readonly onDone: (strokes: CutStrokes, pxPerMm: number) => void;
  readonly masterOutline?: boolean | undefined;
}

const MIN_SPACING_MM = 0.08;
const KEY_STEP_MM = 0.6;
const MAX_SHAVINGS = 14;

function view(path: CutPath, loupePx: number) {
  const { minX, minY, maxX, maxY } = polygonBounds(path.points);
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const content = Math.max(spanX, spanY) * 1.24 + 2;
  const size = Math.max(content, loupePx / MAX_PX_PER_MM);
  return { x: minX + spanX / 2 - size / 2, y: minY + spanY / 2 - size / 2, size };
}

export function CutLoupe({
  path,
  outerPath,
  toleranceMm,
  assisted,
  metal,
  reducedMotion,
  draft,
  onDraft,
  onDone,
  masterOutline = false,
}: CutLoupeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const loupePx = useElementWidth(wrapRef, 480);
  const box = view(path, loupePx);
  const actualPxPerMm = loupePx / box.size;
  const pxPerMm = clamp(actualPxPerMm, MIN_PX_PER_MM, MAX_PX_PER_MM);
  const tolerance = Math.max(toleranceMm, 8 / pxPerMm);
  const reach = dotReach(path);
  const track = traceTrack(path.points);
  const strokesRef = useRef<CutStrokes>(draft);
  const currentRef = useRef<Point[] | null>(null);
  const railRef = useRef<{ along: number; last: Point } | null>(null);
  const pointer = useRef<number | null>(null);
  const shavingId = useRef(0);
  const [strokes, setStrokes] = useState<CutStrokes>(draft);
  const [current, setCurrent] = useState<readonly Point[]>([]);
  const [stopped, setStopped] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [shavings, setShavings] = useState<readonly Shaving[]>([]);
  const all = [...strokes, ...(current.length > 0 ? [current] : [])];
  const counted = cutSamples(all, path, assisted);
  const coverage = cutCoverage(counted, path, tolerance);
  const accuracy = counted.length > 1 ? cutAccuracy(counted, path, tolerance, assisted) : null;
  const tip = current[current.length - 1] ?? strokes[strokes.length - 1]?.at(-1) ?? null;
  const before = current[current.length - 2] ?? null;
  const angle =
    tip !== null && before !== null
      ? (Math.atan2(tip[1] - before[1], tip[0] - before[0]) * 180) / Math.PI
      : -30;

  const shed = (point: Point) => {
    if (reducedMotion) return;
    shavingId.current += 1;
    const id = shavingId.current;
    if (id % 3 !== 0) return;
    setShavings((list) => [...list.slice(-MAX_SHAVINGS), { id, x: point[0], y: point[1] }]);
  };

  const push = (point: Point) => {
    const stroke = currentRef.current;
    if (stroke === null || stopped) return;
    const last = stroke[stroke.length - 1];
    if (last !== undefined && Math.hypot(point[0] - last[0], point[1] - last[1]) < MIN_SPACING_MM) return;
    const grown = [...stroke, point];
    const trimmed = assisted ? grown : trimStroke(grown, path.dots, reach);
    currentRef.current = trimmed;
    setCurrent(trimmed);
    shed(point);
    if (trimmed.length < grown.length) {
      setStopped(true);
      setHint(HINTS.turnAtDot);
    }
  };

  const railTo = (target: Point) => {
    const rail = railRef.current;
    if (rail === null) return;
    const moved = Math.hypot(target[0] - rail.last[0], target[1] - rail.last[1]);
    const along = Math.min(track.perimeter, rail.along + moved);
    railRef.current = { along, last: target };
    for (let step = rail.along; step <= along; step += 0.2) push(pointOnTrack(track, step));
  };

  const addFrom = (event: PointerEvent<SVGSVGElement>) => {
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    for (const source of events.length > 0 ? events : [native]) {
      const point = clientToSvg(svgRef.current, source.clientX, source.clientY);
      if (point === null) continue;
      if (assisted) railTo([point.x, point.y]);
      else push([point.x, point.y]);
    }
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = event.pointerId;
    setStopped(false);
    setHint(null);
    currentRef.current = [];
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (assisted && point !== null) {
      const previous = strokesRef.current.flat();
      const start =
        previous.length > 0 ? projectOnTrack(track, previous[previous.length - 1] ?? [0, 0]).along : 0;
      railRef.current = { along: start, last: [point.x, point.y] };
      push(pointOnTrack(track, start));
      return;
    }
    addFrom(event);
  };

  const finishStroke = () => {
    const stroke = currentRef.current;
    currentRef.current = null;
    railRef.current = null;
    setCurrent([]);
    setStopped(false);
    if (stroke === null || stroke.length === 0) return;
    const next = [...strokesRef.current, stroke];
    strokesRef.current = next;
    setStrokes(next);
    const samples = cutSamples(next, path, assisted);
    if (isCutComplete(samples, path, tolerance)) {
      onDone(next, pxPerMm);
      return;
    }
    onDraft(next);
    setHint((current) => (current === HINTS.turnAtDot ? current : HINTS.keepCutting));
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (pointer.current !== event.pointerId) return;
    pointer.current = null;
    finishStroke();
  };

  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!assisted || event.key !== "ArrowRight") return;
    event.preventDefault();
    if (currentRef.current === null) {
      const previous = strokesRef.current.flat();
      const start =
        previous.length > 0 ? projectOnTrack(track, previous[previous.length - 1] ?? [0, 0]).along : 0;
      currentRef.current = [];
      railRef.current = { along: start, last: pointOnTrack(track, start) };
      push(pointOnTrack(track, start));
    }
    const rail = railRef.current;
    if (rail === null) return;
    const along = Math.min(track.perimeter, rail.along + KEY_STEP_MM * 4);
    for (let step = rail.along; step <= along; step += 0.2) push(pointOnTrack(track, step));
    railRef.current = { along, last: pointOnTrack(track, along) };
    if (along >= track.perimeter) finishStroke();
  };

  const restart = () => {
    onDraft([]);
    strokesRef.current = [];
    currentRef.current = null;
    setStrokes([]);
    setCurrent([]);
    setStopped(false);
    setHint(null);
    setShavings([]);
  };

  const unit = box.size / 60;
  const round = Math.min(1, coverage / CUT_COVERAGE_NEEDED);
  const holes = outerPath.id === path.id ? [] : [outerPath];
  return (
    <div className="jb-cut-loupe jb-station">
      <div className="jb-stats" aria-live="polite">
        <StationStat label="Cut round" value={`${Math.round(round * 100)}%`} fill={round} tone="gold" />
        <StationStat
          label="On the line"
          value={accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}
          fill={accuracy}
          tone="teal"
        />
      </div>
      <div className="jb-loupe">
        <div className="jb-loupe__glass" ref={wrapRef}>
          <svg
            ref={svgRef}
            viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`}
            role="application"
            aria-label={`Cut out the ${path.name.toLowerCase()} by tracing its line${assisted ? ", or hold the right arrow key" : ""}`}
            tabIndex={0}
            onPointerDown={down}
            onPointerMove={(event) => {
              if (pointer.current === event.pointerId) addFrom(event);
            }}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={keyDown}
            onKeyUp={(event) => {
              if (event.key === "ArrowRight" && currentRef.current !== null) finishStroke();
            }}
            data-testid="cut-loupe"
            data-path={JSON.stringify(path.points)}
            data-dots={JSON.stringify(path.dots)}
          >
            <MetalSheet x={box.x} y={box.y} size={box.size} look={metal} />
            {holes.map((hole) => (
              <path
                key={hole.id}
                d={outlinePath(hole.points)}
                fill={metal.mid}
                stroke={metal.dark}
                strokeWidth={unit * 0.3}
              />
            ))}
            <path d={outlinePath(path.points)} fill="#fffdf4" fillOpacity={holes.length > 0 ? 0.3 : 0.24} />
            <path
              d={outlinePath(path.points)}
              fill="none"
              stroke="#1f4e5a"
              strokeOpacity={0.18}
              strokeWidth={tolerance * 2}
              strokeLinejoin="round"
            />
            {masterOutline ? (
              <path
                d={outlinePath(path.points)}
                fill="none"
                stroke="#f2c230"
                strokeOpacity={0.55}
                strokeWidth={unit * 0.9}
                strokeLinejoin="round"
                data-testid="motif-master-outline"
              />
            ) : null}
            <path
              d={outlinePath(path.points)}
              fill="none"
              stroke="#1f4e5a"
              strokeWidth={unit * 0.28}
              strokeDasharray={`${unit * 0.9} ${unit * 0.7}`}
            />
            {path.dots.map(([x, y], index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={Math.max(reach * 0.55, unit * 0.7)}
                className={stopped ? "jb-dot jb-dot--pulse" : "jb-dot"}
                fill="#e8a33d"
                stroke="#7a3d10"
                strokeWidth={unit * 0.18}
              />
            ))}
            {all.map((stroke, index) => (
              <g key={index}>
                <path
                  d={openPath(stroke)}
                  fill="none"
                  stroke="#2a1d2c"
                  strokeOpacity={0.45}
                  strokeWidth={unit * 0.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={openPath(stroke)}
                  fill="none"
                  stroke="#fff8ea"
                  strokeWidth={unit * 0.3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
            <Shavings shavings={shavings} colour={metal.light} unit={unit} />
            {tip !== null ? (
              <SawSprite x={tip[0]} y={tip[1]} angle={angle} size={unit * 12} working={current.length > 0} />
            ) : null}
            {tip === null ? (
              <circle
                cx={path.dots[0]?.[0] ?? path.points[0]?.[0] ?? 0}
                cy={path.dots[0]?.[1] ?? path.points[0]?.[1] ?? 0}
                r={unit * 1.2}
                fill="none"
                stroke="#1f4e5a"
                strokeWidth={unit * 0.3}
                className="jb-start-ring"
              />
            ) : null}
          </svg>
          <div className="jb-loupe__shine" aria-hidden="true" />
        </div>
      </div>
      <p className={hint === null ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"} aria-live="polite">
        {hint ??
          (assisted
            ? "Drag anywhere: the saw follows the rail."
            : "Press on the line and follow it. Turn at each dot.")}
      </p>
      <div className="jb-tools">
        <Button variant="secondary" onClick={restart} disabled={all.length === 0} data-testid="cut-restart">
          Restart this cut
        </Button>
      </div>
    </div>
  );
}
