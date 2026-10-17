import { useEffect, useRef, useState, type PointerEvent } from "react";
import { clamp } from "../../../../../../engine/clamp";
import { isPathTraced, pathCoverage } from "../../../../../../engine/geometry/pathTrace";
import type { Point } from "../../../../../../engine/geometry/point";
import { distanceToOutline } from "../../../../../../engine/geometry/traceAccuracy";
import { pointOnTrack, traceTrack } from "../../../../../../engine/geometry/traceTrack";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import { useElementWidth } from "../../../../../../ui/kit/useElementSize";
import type { PartDef } from "../../../../content/product";
import {
  boardNumber,
  boardSizeById,
  fitSawSamples,
  partPolygon,
  type OwnedBoard,
  type PartPlacement,
  type SawCut,
} from "../../../../core";
import { BoardSurface } from "../../../art/BoardArt";
import { SawdustBurst, type SawdustSpeck } from "../../../art/SawdustBurst";
import { SawSprite } from "../../../art/SawSprite";

interface SawBenchProps {
  readonly part: PartDef;
  readonly placement: PartPlacement;
  readonly board: OwnedBoard;
  readonly cuts: readonly SawCut[];
  readonly doneCuts: readonly boolean[];
  readonly cutIndex: number;
  readonly tolerance: number;
  readonly rail: boolean;
  readonly riding: boolean;
  readonly ghost: readonly Point[] | null;
  readonly onRideDone: () => void;
  readonly onComplete: (samples: readonly Point[]) => void;
  readonly onPaused: (coverage: number) => void;
}

const MARGIN = 6;
const MAX_SPECKS = 16;
const MIN_SAMPLE_GAP_CM = 0.2;
const MAX_HEIGHT_PX = 400;

function spacedSamples(from: Point | undefined, points: readonly Point[]): Point[] {
  const kept: Point[] = [];
  let last = from;
  for (const point of points) {
    if (last !== undefined && Math.hypot(point[0] - last[0], point[1] - last[1]) < MIN_SAMPLE_GAP_CM)
      continue;
    kept.push(point);
    last = point;
  }
  return kept;
}

function pathData(points: readonly Point[], closed: boolean): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M${first?.[0] ?? 0} ${first?.[1] ?? 0} ${rest.map(([x, y]) => `L${x} ${y}`).join(" ")}${closed ? " Z" : ""}`;
}

export function SawBench({
  part,
  placement,
  board,
  cuts,
  doneCuts,
  cutIndex,
  tolerance,
  rail,
  riding,
  ghost,
  onRideDone,
  onComplete,
  onPaused,
}: SawBenchProps) {
  const { reducedMotion } = useSettings();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const samplesRef = useRef<Point[]>([]);
  const speckId = useRef(0);
  const [samples, setSamples] = useState<readonly Point[]>([]);
  const [sawing, setSawing] = useState(false);
  const [saw, setSaw] = useState<{ x: number; y: number; angle: number } | null>(null);
  const [specks, setSpecks] = useState<readonly SawdustSpeck[]>([]);
  const containerWidth = useElementWidth(wrapRef, 720);
  const cut = cuts[cutIndex];
  const polygon = partPolygon(part, placement);
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  const size = boardSizeById(board.size);
  const minX = Math.max(-MARGIN, Math.min(...xs) - MARGIN);
  const minY = Math.max(-MARGIN, Math.min(...ys) - MARGIN);
  const maxX = Math.min(size.width + MARGIN, Math.max(...xs) + MARGIN);
  const maxY = Math.min(size.height + MARGIN, Math.max(...ys) + MARGIN) + 9;
  const viewWidth = maxX - minX;
  const viewHeight = maxY - minY;
  const pxPerCm = clamp(Math.min(containerWidth / viewWidth, MAX_HEIGHT_PX / viewHeight), 6, 16);
  const coverage = cut === undefined ? 0 : pathCoverage(cut, samples, tolerance);
  const rideDone = useRef(onRideDone);
  const openCuts = useRef<readonly SawCut[]>([]);

  useEffect(() => {
    rideDone.current = onRideDone;
    openCuts.current = cuts.filter((_, index) => doneCuts[index] !== true);
  });

  useEffect(() => {
    if (!riding) return;
    const paths = openCuts.current;
    if (reducedMotion || paths.length === 0) {
      rideDone.current();
      return;
    }
    const tracks = paths.map((entry) =>
      traceTrack(entry.closed ? entry.points : [...entry.points, ...[...entry.points].reverse()]),
    );
    let frame = 0;
    let begin: number | null = null;
    const duration = 1400;
    const step = (now: number) => {
      begin ??= now;
      const t = Math.min(1, (now - begin) / duration);
      const index = Math.min(tracks.length - 1, Math.floor(t * tracks.length));
      const track = tracks[index];
      if (track !== undefined) {
        const local = t * tracks.length - index;
        const along = (track.perimeter * local) / (paths[index]?.closed === true ? 1 : 2);
        const [x, y] = pointOnTrack(track, along);
        const [nx, ny] = pointOnTrack(track, along + 0.5);
        setSaw({ x, y, angle: (Math.atan2(ny - y, nx - x) * 180) / Math.PI });
      }
      if (t < 1) frame = requestAnimationFrame(step);
      else rideDone.current();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [riding, reducedMotion]);

  const reset = () => {
    samplesRef.current = [];
    setSamples([]);
    setSawing(false);
  };

  const addPoints = (incoming: readonly Point[]) => {
    const points = spacedSamples(samplesRef.current[samplesRef.current.length - 1], incoming);
    if (cut === undefined || points.length === 0) return;
    const next = [...samplesRef.current, ...points];
    samplesRef.current = next;
    setSamples(next);
    const last = points[points.length - 1];
    const before = next[next.length - 6] ?? next[0];
    if (last !== undefined && before !== undefined) {
      const angle = (Math.atan2(last[1] - before[1], last[0] - before[0]) * 180) / Math.PI;
      setSaw({ x: last[0], y: last[1], angle: Number.isFinite(angle) ? angle : 0 });
      if (!reducedMotion && next.length % 3 === 0) {
        speckId.current += 1;
        const id = speckId.current;
        setSpecks((current) => [
          ...current.slice(-MAX_SPECKS),
          { id, x: last[0], y: last[1], size: 0.35 + (id % 4) * 0.12, drift: ((id * 37) % 9) / 6 - 0.7 },
        ]);
      }
    }
    if (next.length % 4 === 0 && isPathTraced(cut, next, tolerance)) {
      onComplete(fitSawSamples(next));
      reset();
    }
  };

  const pointOf = (clientX: number, clientY: number): Point | null => {
    const point = clientToSvg(svgRef.current, clientX, clientY);
    return point === null ? null : [point.x, point.y];
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (cut === undefined || rail) return;
    const point = pointOf(event.clientX, event.clientY);
    if (point === null) return;
    if (distanceToOutline(point, cut.points, cut.closed) > Math.max(2.5, tolerance * 2.5)) {
      onPaused(-1);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSawing(true);
    addPoints([point]);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!sawing) return;
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const list = (events.length > 0 ? events : [native])
      .map((entry) => pointOf(entry.clientX, entry.clientY))
      .filter((point): point is Point => point !== null);
    addPoints(list);
  };

  const up = () => {
    if (!sawing) return;
    setSawing(false);
    if (cut !== undefined && samplesRef.current.length > 0) {
      if (isPathTraced(cut, samplesRef.current, tolerance)) {
        onComplete(fitSawSamples(samplesRef.current));
        reset();
      } else onPaused(pathCoverage(cut, samplesRef.current, tolerance));
    }
  };

  const start = cut?.points[0];
  return (
    <div className="ww-saw-bench" ref={wrapRef}>
      <svg
        ref={svgRef}
        className={sawing ? "ww-saw-bench__svg ww-saw-bench__svg--sawing" : "ww-saw-bench__svg"}
        viewBox={`${minX} ${minY} ${viewWidth} ${viewHeight}`}
        style={{ width: viewWidth * pxPerCm, height: viewHeight * pxPerCm }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        data-testid="saw-bench"
        data-cut={cut === undefined ? "[]" : JSON.stringify(cut.points)}
        data-closed={cut?.closed === true ? "yes" : "no"}
        data-coverage={coverage.toFixed(2)}
        role="img"
        aria-label={`Saw the ${part.name}. Follow the pencil line from the green dot.`}
      >
        <g className="ww-saw-bench__horses" aria-hidden="true">
          <path
            d={`M${minX + viewWidth * 0.12} ${maxY - 9} l-2.4 9.4 h2.4 l1.6 -6 l1.6 6 h2.4 l-2.4 -9.4 Z`}
            fill="#8f5a26"
            stroke="#2f2622"
            strokeWidth={0.3}
          />
          <path
            d={`M${maxX - viewWidth * 0.12 - 3} ${maxY - 9} l-2.4 9.4 h2.4 l1.6 -6 l1.6 6 h2.4 l-2.4 -9.4 Z`}
            fill="#8f5a26"
            stroke="#2f2622"
            strokeWidth={0.3}
          />
          <rect
            x={minX + viewWidth * 0.08}
            y={maxY - 10}
            width={viewWidth * 0.84}
            height={1.8}
            rx={0.4}
            fill="#b97f43"
          />
        </g>
        <BoardSurface
          woodId={board.woodId}
          width={size.width}
          height={size.height}
          knots={board.knots}
          seed={boardNumber(board.id) * 97}
        />
        <path d={pathData(polygon, true)} className="ww-saw-bench__part" />
        {rail && cut !== undefined ? (
          <path d={pathData(cut.points, cut.closed)} className="ww-saw-bench__rail" />
        ) : null}
        {cuts.map((entry, index) => (
          <path
            key={index}
            d={pathData(entry.points, entry.closed)}
            className={
              doneCuts[index] === true
                ? "ww-saw-bench__kerf"
                : index === cutIndex
                  ? "ww-saw-bench__pencil ww-saw-bench__pencil--active"
                  : "ww-saw-bench__pencil"
            }
          />
        ))}
        {ghost !== null && ghost.length > 1 ? (
          <path d={pathData(ghost, false)} className="ww-saw-bench__ghost" data-testid="twin-ghost" />
        ) : null}
        <path d={pathData(samples, false)} className="ww-saw-bench__trail" />
        {start !== undefined && samples.length === 0 && !rail ? (
          <g className="ww-saw-bench__start" transform={`translate(${start[0]} ${start[1]})`}>
            <circle r={1.6} />
            <circle r={0.6} fill="#fff" />
          </g>
        ) : null}
        <SawdustBurst specks={specks} />
        {saw !== null ? <SawSprite x={saw.x} y={saw.y} angle={saw.angle} scale={0.44} busy={sawing} /> : null}
      </svg>
      <div className="ww-saw-bench__progress" aria-hidden="true">
        <span style={{ width: `${Math.round(coverage * 100)}%` }} />
      </div>
    </div>
  );
}
