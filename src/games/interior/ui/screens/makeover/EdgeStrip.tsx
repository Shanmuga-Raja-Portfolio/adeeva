import { useRef, useState, type PointerEvent } from "react";
import { pathCoverage, PATH_COVERAGE_SHARE } from "../../../../../engine/geometry/pathTrace";
import type { Point } from "../../../../../engine/geometry/point";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { Meter } from "../../../../../ui/kit/Meter";
import { HINTS } from "../../../content/hints";
import { EDGE_PX_PER_CM, fitEdgeSamples, type EdgePath } from "../../../core";
import { BARE_WALL } from "../../art/roomHex";

interface EdgeStripProps {
  readonly path: EdgePath;
  readonly done: boolean;
  readonly colour: string;
  readonly tolerance: number;
  readonly onFinish: (samples: readonly Point[]) => boolean;
}

const KIND_NAMES = {
  ceiling: "Ceiling tape",
  skirting: "Skirting tape",
  frame: "Window frame",
  mid: "Mid-wall tape",
} as const;

function pathD(points: readonly Point[], closed: boolean): string {
  return `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")}${closed ? " Z" : ""}`;
}

export function EdgeStrip({ path, done, colour, tolerance, onFinish }: EdgeStripProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<readonly (readonly Point[])[]>([]);
  const [current, setCurrent] = useState<readonly Point[] | null>(null);
  const [brush, setBrush] = useState<Point | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const samples = strokes.flat();
  const coverage = pathCoverage(path, current === null ? samples : [...samples, ...current], tolerance);

  const toCm = (event: PointerEvent<SVGSVGElement>): Point[] => {
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const list = events.length > 0 ? events : [native];
    return list.flatMap((entry) => {
      const point = clientToSvg(svgRef.current, entry.clientX, entry.clientY);
      return point === null ? [] : [[point.x, point.y] as Point];
    });
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (done || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const points = toCm(event);
    setCurrent(points);
    setBrush(points[points.length - 1] ?? null);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const points = toCm(event);
    if (points.length > 0) setBrush(points[points.length - 1] ?? null);
    if (current === null) return;
    setCurrent([...current, ...points]);
  };

  const up = () => {
    if (current === null) return;
    const all = fitEdgeSamples([...samples, ...current]);
    setStrokes([...strokes, current]);
    setCurrent(null);
    if (pathCoverage(path, all, tolerance) < PATH_COVERAGE_SHARE) {
      setHint(HINTS.edgeUnfinished);
      return;
    }
    setHint(onFinish(all) ? null : HINTS.edgeUnfinished);
  };

  const painted = current === null ? strokes : [...strokes, current];
  return (
    <figure
      className={done ? "is-edge is-edge--done" : "is-edge"}
      data-testid={`edge-${path.id}`}
      data-path={JSON.stringify(path.points)}
      data-closed={path.closed}
    >
      <figcaption className="is-edge__caption">
        <strong>{KIND_NAMES[path.kind]}</strong>
        <span className="is-muted">{done ? "Crisp edge!" : "Brush along the blue tape"}</span>
      </figcaption>
      <svg
        ref={svgRef}
        className="is-edge__strip"
        viewBox={`0 0 ${path.width} ${path.height}`}
        width={path.width * EDGE_PX_PER_CM}
        height={path.height * EDGE_PX_PER_CM}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={() => setBrush(null)}
        role="img"
        aria-label={`${KIND_NAMES[path.kind]} edging strip`}
      >
        <rect width={path.width} height={path.height} fill={done ? colour : BARE_WALL} />
        <path
          d={pathD(path.points, path.closed)}
          fill="none"
          stroke="#7fb1e6"
          strokeWidth={2.4}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={done ? 0.25 : 0.95}
        />
        <path
          d={pathD(path.points, path.closed)}
          fill="none"
          stroke="#ffffff"
          strokeWidth={0.25}
          strokeDasharray="1 1"
          opacity={done ? 0 : 0.8}
        />
        {painted.map((stroke, index) =>
          stroke.length > 1 ? (
            <path
              key={index}
              d={pathD(stroke, false)}
              fill="none"
              stroke={colour}
              strokeWidth={Math.max(1.2, tolerance * 1.4)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.92}
            />
          ) : null,
        )}
        {brush !== null && !done ? (
          <g transform={`translate(${brush[0]} ${brush[1]}) rotate(-35)`} pointerEvents="none">
            <rect
              x={-1.6}
              y={-1.2}
              width={3.2}
              height={2.4}
              rx={0.6}
              fill={colour}
              stroke="#3b2a33"
              strokeWidth={0.25}
            />
            <rect
              x={-1.2}
              y={-5.5}
              width={2.4}
              height={4.4}
              rx={0.4}
              fill="#c8914f"
              stroke="#3b2a33"
              strokeWidth={0.25}
            />
            <rect
              x={-0.5}
              y={-12}
              width={1}
              height={6.6}
              rx={0.5}
              fill="#c8664a"
              stroke="#3b2a33"
              strokeWidth={0.2}
            />
          </g>
        ) : null}
      </svg>
      <div className="is-edge__progress">
        <Meter
          label="Taped edge covered"
          value={Math.round((done ? 1 : coverage) * 100)}
          max={100}
          tone="sage"
          valueText={`${Math.round((done ? 1 : coverage) * 100)}%`}
        />
      </div>
      {hint !== null && !done ? (
        <p className="is-edge__hint" role="status">
          {hint}
        </p>
      ) : null}
    </figure>
  );
}
