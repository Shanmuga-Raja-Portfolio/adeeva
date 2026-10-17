import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PieceOutline } from "../../../content/garmentPart";
import type { Cloth } from "../../../../../ui/art/cloth/Cloth";
import type { Point } from "../../../../../engine/geometry/point";
import { placedPolygon, polygonBounds } from "../../../../../engine/geometry/polygonPlacement";
import { traceAccuracy } from "../../../../../engine/geometry/traceAccuracy";
import type { PiecePlacement } from "../../../core/dressRun";
import { FabricPattern, fabricFill } from "../../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../../ui/art/cloth/fabricLook";
import { seedFromText } from "../../../../../ui/art/seedFromText";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { ScissorsCursor, ScissorsDefs } from "./ScissorsCursor";
import { SnipParticles } from "./SnipParticles";
import { projectOnTrack, traceTrack } from "../../../../../engine/geometry/traceTrack";
import {
  TRACE_COMPLETE_SHARE,
  binCoverage,
  isCoverageComplete,
  trackVisits,
} from "../../../../../engine/geometry/traceCoverage";
import { cutPath } from "./cutPath";
import { useElementSize } from "../../../../../ui/kit/useElementSize";
import "./trace.css";

export interface TraceMatProps {
  readonly piece: PieceOutline;
  readonly fabric: Cloth | undefined;
  readonly placement: Pick<PiecePlacement, "x" | "y" | "rotation">;
  readonly toleranceCm: number;
  readonly reducedMotion: boolean;
  readonly onKeep: (accuracy: number, samples: readonly Point[]) => void;
}

const MARGIN_CM = 8;
const SAMPLE_SPACING_CM = 0.25;

interface Cursor {
  readonly point: Point;
  readonly angle: number;
}

export function TraceMat({ piece, fabric, placement, toleranceCm, reducedMotion, onKeep }: TraceMatProps) {
  const id = useSvgId("trace");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pressing = useRef<number | null>(null);
  const recorded = useRef<readonly Point[]>([]);
  const [samples, setSamples] = useState<readonly Point[]>([]);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [held, setHeld] = useState(false);
  const [finished, setFinished] = useState(false);
  const outline = useMemo(() => placedPolygon(piece.shape, placement), [piece.shape, placement]);
  const track = useMemo(() => traceTrack(outline), [outline]);
  const bounds = polygonBounds(outline);
  const view = {
    x: bounds.minX - MARGIN_CM,
    y: bounds.minY - MARGIN_CM,
    width: bounds.maxX - bounds.minX + MARGIN_CM * 2,
    height: bounds.maxY - bounds.minY + MARGIN_CM * 2,
  };
  const size = useElementSize(wrapRef, { width: 600, height: 600 });
  const unit = Math.max(view.width / Math.max(1, size.width), view.height / Math.max(1, size.height));
  const visited = trackVisits(track, samples, toleranceCm);
  const coverage = binCoverage(visited);
  const accuracy = traceAccuracy(samples, outline, toleranceCm);
  const start = outline[0] ?? [0, 0];
  const next = outline[1] ?? start;
  const startAngle = (Math.atan2(next[1] - start[1], next[0] - start[0]) * 180) / Math.PI;
  const look = fabric !== undefined ? fabricLook(fabric) : undefined;
  const travelled = samples.length * SAMPLE_SPACING_CM;
  const onLine = cursor !== null && projectOnTrack(track, cursor.point).distance <= toleranceCm;
  const tone = held ? (onLine ? "on" : "off") : "idle";

  const addSamples = (event: PointerEvent<SVGSVGElement>) => {
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const sources = events.length > 0 ? events : [native];
    const added: Point[] = [];
    let last = recorded.current[recorded.current.length - 1];
    for (const source of sources) {
      const point = clientToSvg(svgRef.current, source.clientX, source.clientY);
      if (point === null) continue;
      const sample: Point = [point.x, point.y];
      if (last !== undefined && Math.hypot(sample[0] - last[0], sample[1] - last[1]) < SAMPLE_SPACING_CM)
        continue;
      added.push(sample);
      last = sample;
    }
    if (added.length === 0) return;
    const all = [...recorded.current, ...added];
    recorded.current = all;
    setSamples(all);
    if (isCoverageComplete(binCoverage(trackVisits(track, all, toleranceCm)))) {
      pressing.current = null;
      setHeld(false);
      setFinished(true);
    }
  };

  const moveCursor = (event: PointerEvent<SVGSVGElement>) => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    setCursor((current) => {
      const target: Point = [point.x, point.y];
      if (current === null) return { point: target, angle: -35 };
      const dx = target[0] - current.point[0];
      const dy = target[1] - current.point[1];
      const angle = Math.hypot(dx, dy) > 0.15 ? (Math.atan2(dy, dx) * 180) / Math.PI : current.angle;
      return { point: target, angle };
    });
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (finished) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pressing.current = event.pointerId;
    setHeld(true);
    moveCursor(event);
    addSamples(event);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (finished) return;
    moveCursor(event);
    if (pressing.current === event.pointerId) addSamples(event);
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (pressing.current !== event.pointerId) return;
    pressing.current = null;
    setHeld(false);
  };

  const retry = () => {
    recorded.current = [];
    setSamples([]);
    setFinished(false);
    setCursor(null);
  };

  const trail = samples
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const percent = Math.round(accuracy * 100);
  const outlinePoints = outline.map(([x, y]) => `${x},${y}`).join(" ");
  const outlinePath = outline.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ") + " Z";
  return (
    <div className="ad-trace">
      <div className="ad-trace__stats" aria-live="polite">
        <span className="ad-trace__piece-name">
          <Icon name="scissors" size={20} />
          {piece.name}
        </span>
        <span className="ad-trace__stat">
          <span className="ad-trace__stat-label">Cut so far</span>
          <strong>{Math.round(Math.min(1, coverage / TRACE_COMPLETE_SHARE) * 100)}%</strong>
        </span>
        <span className={`ad-trace__stat ad-trace__stat--${tone}`}>
          <span className="ad-trace__stat-label">Neat cutting</span>
          <strong>{samples.length > 0 ? `${percent}%` : "—"}</strong>
        </span>
      </div>
      <div
        ref={wrapRef}
        className={finished ? "ad-trace__mat ad-trace__mat--finished" : "ad-trace__mat"}
        style={
          {
            aspectRatio: `${view.width} / ${view.height}`,
            "--mat-ratio": view.width / view.height,
          } as CSSProperties
        }
      >
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          className="ad-trace__svg"
          role="img"
          aria-label={`Trace around the ${piece.name.toLowerCase()} with the scissors`}
          data-testid="trace-mat"
          data-outline={JSON.stringify(outline)}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={() => {
            if (pressing.current === null) setCursor(null);
          }}
        >
          <ScissorsDefs />
          <defs>
            {fabric !== undefined ? <FabricPattern id={`${id}-fabric`} fabric={fabric} tile={6} /> : null}
          </defs>
          <rect
            x={view.x}
            y={view.y}
            width={view.width}
            height={view.height}
            fill={fabric !== undefined ? fabricFill(`${id}-fabric`) : "#efe6d4"}
          />
          <path
            className="ad-trace__wash"
            d={`M${view.x} ${view.y} h${view.width} v${view.height} h${-view.width} Z ${outlinePath}`}
            fillRule="evenodd"
          />
          <polygon
            className={finished ? "ad-trace__paper ad-trace__paper--lifted" : "ad-trace__paper"}
            points={outlinePoints}
            fill={finished && fabric !== undefined ? fabricFill(`${id}-fabric`) : undefined}
          />
          <polygon className="ad-trace__band" points={outlinePoints} strokeWidth={toleranceCm * 2} />
          <polygon className="ad-trace__halo" points={outlinePoints} strokeWidth={unit * 6} />
          <polygon
            className={reducedMotion ? "ad-trace__guide" : "ad-trace__guide ad-trace__guide--march"}
            points={outlinePoints}
            strokeWidth={unit * 3}
            strokeDasharray={`${unit * 9} ${unit * 6}`}
          />
          <path className="ad-trace__trail" d={trail} strokeWidth={unit * 1.6} />
          <path className="ad-trace__cut" d={cutPath(track, visited)} strokeWidth={unit * 3.2} />
          {samples.length === 0 ? (
            <g
              className={reducedMotion ? "ad-trace__start" : "ad-trace__start ad-trace__start--pulse"}
              transform={`translate(${start[0]} ${start[1]})`}
            >
              <circle r={unit * 11} />
              <path
                d={`M0 0 L${unit * 26} 0 M${unit * 18} ${-unit * 6} L${unit * 26} 0 L${unit * 18} ${unit * 6}`}
                transform={`rotate(${startAngle})`}
                strokeWidth={unit * 3}
              />
            </g>
          ) : null}
          {reducedMotion ? null : (
            <SnipParticles
              samples={samples}
              seed={seedFromText(piece.id)}
              colour={look?.stitch ?? "#a93d63"}
              unit={unit}
            />
          )}
          {finished && !reducedMotion ? (
            <g
              className="ad-trace__burst"
              transform={`translate(${(bounds.minX + bounds.maxX) / 2} ${(bounds.minY + bounds.maxY) / 2})`}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <circle
                  key={index}
                  className="ad-trace__spark"
                  r={unit * 4}
                  style={{
                    transform: `rotate(${index * 30}deg) translateX(${(bounds.maxX - bounds.minX) * 0.45}px)`,
                  }}
                />
              ))}
            </g>
          ) : null}
          {cursor !== null && !finished ? (
            <ScissorsCursor
              x={cursor.point[0]}
              y={cursor.point[1]}
              angle={cursor.angle}
              open={held ? (1 + Math.sin(travelled * 1.8)) / 2 : 0.7}
              unit={unit}
              tone={tone}
            />
          ) : null}
        </svg>
        {finished ? (
          <div className="ad-trace__result" role="status">
            <span className="ad-trace__snip">Snip!</span>
            <strong>{percent}% on the line</strong>
            <span className="ad-muted">
              {percent >= 90
                ? "Clean as a whistle."
                : percent >= 70
                  ? "Neat work."
                  : "A little wobbly, but it will hold."}
            </span>
            <div className="ad-trace__result-actions">
              <Button variant="ghost" onClick={retry}>
                Try again
              </Button>
              <Button onClick={() => onKeep(accuracy, samples)} data-testid="keep-cut">
                Keep this cut
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <p className="ad-trace__hint ad-muted">
        {held
          ? onLine
            ? "Lovely, keep following the line."
            : "Ease back into the pink band."
          : samples.length === 0
            ? "Press at the rose dot and cut along the dashed line, inside the pink band."
            : "Lift whenever you like, then carry on from where you stopped."}
      </p>
    </div>
  );
}
