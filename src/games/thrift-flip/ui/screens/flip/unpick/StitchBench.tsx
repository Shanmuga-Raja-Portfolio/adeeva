import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useElementSize } from "../../../../../../ui/kit/useElementSize";
import type { Point } from "../../../../../../engine/geometry/point";
import { FabricPattern } from "../../../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { TrimArt } from "../../../../../adeeva/ui/art/TrimArt";
import type { FindDef, StitchLineDef } from "../../../../content/find";
import { MIN_PULL_CM, stitchPoints, type UnpickLine } from "../../../../core";
import { findCloth } from "../../../art/findCloth";
import { BenchCloth } from "./BenchCloth";
import { fitFrame, fittedViewBox, frameTransform, lineFrame, type BenchMargins } from "./lineFrame";
import { RipperTool } from "./RipperTool";
import { StitchMark } from "./StitchMark";
import "./bench.css";

export interface StitchPullRequest {
  readonly stitch: number;
  readonly distanceCm: number;
  readonly assisted: boolean;
}

export interface StitchBenchProps {
  readonly find: FindDef;
  readonly line: StitchLineDef;
  readonly record: UnpickLine;
  readonly maxPullCm: number;
  readonly assist: boolean;
  readonly sharpRipper: boolean;
  readonly reducedMotion: boolean;
  readonly margins?: BenchMargins | undefined;
  readonly onPull: (request: StitchPullRequest) => void;
}

const SNUG: BenchMargins = { top: 14, bottom: 14 };

interface Drag {
  readonly pointerId: number;
  readonly stitch: number;
  readonly point: Point;
}

const HIT_PX = 38;

interface PullGuide {
  readonly from: Point;
  readonly to: Point;
  readonly normal: Point;
  readonly side: Point;
}

function pullGuide(
  line: StitchLineDef,
  points: readonly Point[],
  popped: readonly number[],
): PullGuide | undefined {
  const open = points.find((_, index) => !popped.includes(index));
  if (open === undefined) return undefined;
  const dx = line.to[0] - line.from[0];
  const dy = line.to[1] - line.from[1];
  const length = Math.max(1e-6, Math.hypot(dx, dy));
  const side: Point = [dx / length, dy / length];
  const normal: Point = [-side[1], side[0]];
  return {
    from: [open[0] + normal[0] * 2, open[1] + normal[1] * 2],
    to: [open[0] + normal[0] * 3.8, open[1] + normal[1] * 3.8],
    normal,
    side,
  };
}

function localPoint(group: SVGGElement | null, clientX: number, clientY: number): Point | null {
  const matrix = group?.getScreenCTM();
  if (matrix === null || matrix === undefined) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return [point.x, point.y];
}

function cmPerPixel(group: SVGGElement | null): number {
  const matrix = group?.getScreenCTM();
  if (matrix === null || matrix === undefined) return 0.1;
  return 1 / Math.max(0.01, Math.hypot(matrix.a, matrix.b));
}

export function StitchBench({
  find,
  line,
  record,
  maxPullCm,
  assist,
  sharpRipper,
  reducedMotion,
  margins = SNUG,
  onPull,
}: StitchBenchProps) {
  const id = useSvgId("bench");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const size = useElementSize(wrapRef, { width: 960, height: 400 });
  const groupRef = useRef<SVGGElement | null>(null);
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const setDrag = (next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const cloth = findCloth(find);
  const look = fabricLook(cloth);
  const panel = find.panels[line.panel] ?? find.panels[0];
  const frame = fitFrame(lineFrame(line, panel), size.width, size.height, margins);
  const points = stitchPoints(line);
  const notionAt = (stitch: number) => line.notions.find((notion) => notion.stitch === stitch);

  const nearest = (point: Point): number | null => {
    const reach = HIT_PX * cmPerPixel(groupRef.current);
    let best: number | null = null;
    let bestDistance = Infinity;
    points.forEach(([x, y], index) => {
      if (record.popped.includes(index)) return;
      const distance = Math.hypot(point[0] - x, point[1] - y);
      if (distance <= reach && distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    });
    return best;
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    const point = localPoint(groupRef.current, event.clientX, event.clientY);
    if (point === null) return;
    const stitch = nearest(point);
    if (stitch === null) return;
    if (assist) {
      onPull({ stitch, distanceCm: 0, assisted: true });
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ pointerId: event.pointerId, stitch, point });
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const point = localPoint(groupRef.current, event.clientX, event.clientY);
    if (point !== null) setDrag({ ...current, point });
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(null);
    const origin = points[current.stitch];
    const point = localPoint(groupRef.current, event.clientX, event.clientY) ?? current.point;
    if (origin === undefined) return;
    onPull({
      stitch: current.stitch,
      distanceCm: Math.hypot(point[0] - origin[0], point[1] - origin[1]),
      assisted: false,
    });
  };

  const keyPull = (event: KeyboardEvent<SVGGElement>, stitch: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onPull({ stitch, distanceCm: 0, assisted: true });
  };

  const origin = drag === null ? undefined : points[drag.stitch];
  const pulled =
    drag !== null && origin !== undefined
      ? Math.hypot(drag.point[0] - origin[0], drag.point[1] - origin[1])
      : 0;
  const tone = pulled < MIN_PULL_CM ? "slack" : pulled <= maxPullCm ? "good" : "snag";
  const guide = pullGuide(line, points, record.popped);
  const nextStitch = points.findIndex((_, index) => !record.popped.includes(index));
  const nextPoint = points[nextStitch];
  const toolAngle = frame.angle + 28;

  return (
    <div className="tf-bench-wrap" ref={wrapRef}>
      <svg
        className={`tf-bench tf-bench--${tone}`}
        viewBox={fittedViewBox(frame)}
        role="group"
        aria-label={`Stitches on the ${find.name}. Drag each one out a little.`}
        data-testid="stitch-bench"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
      >
        <defs>
          <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={3.4} />
          <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9b98a" />
            <stop offset="0.5" stopColor="#caa474" />
            <stop offset="1" stopColor="#b88f5e" />
          </linearGradient>
          <pattern id={`${id}-grain`} width={9} height={2.6} patternUnits="userSpaceOnUse">
            <path
              d="M0 0.9 Q2.2 0.5 4.5 0.9 T9 0.9"
              stroke="#9a6e42"
              strokeOpacity={0.22}
              strokeWidth={0.07}
              fill="none"
            />
            <path
              d="M0 2 Q3 1.7 6 2.1 T9 2"
              stroke="#ffffff"
              strokeOpacity={0.12}
              strokeWidth={0.08}
              fill="none"
            />
            <path d="M0 2.58 H9" stroke="#7a5634" strokeOpacity={0.22} strokeWidth={0.06} />
          </pattern>
          <linearGradient
            id={`${id}-thread`}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={-0.2}
            x2={0}
            y2={0.14}
          >
            <stop offset="0" stopColor="#ff8a6e" />
            <stop offset="0.45" stopColor="#d9432a" />
            <stop offset="1" stopColor="#8f2414" />
          </linearGradient>
          <linearGradient id={`${id}-steel`} gradientUnits="userSpaceOnUse" x1={0} y1={-0.2} x2={0} y2={0.2}>
            <stop offset="0" stopColor="#f1f3f6" />
            <stop offset="0.5" stopColor="#a9afb8" />
            <stop offset="1" stopColor="#6f747e" />
          </linearGradient>
          <radialGradient id={`${id}-lamp`} cx="0.52" cy="0.45" r="0.75">
            <stop offset="0" stopColor="#fff3cf" stopOpacity={0.24} />
            <stop offset="0.55" stopColor="#3b2a1c" stopOpacity={0} />
            <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.32} />
          </radialGradient>
          <linearGradient id={`${id}-ripple`} x1="0" y1="0" x2="1" y2="0.3">
            {[0, 0.14, 0.3, 0.46, 0.62, 0.78, 1].map((stop, index) => (
              <stop
                key={stop}
                offset={stop}
                stopColor={index % 2 === 0 ? "#ffffff" : "#3b2a1c"}
                stopOpacity={index % 2 === 0 ? 0.16 : 0.14}
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={-frame.halfWidth}
          y={frame.viewTop}
          width={frame.halfWidth * 2}
          height={frame.halfHeight * 2}
          fill={`url(#${id}-wood)`}
        />
        <rect
          x={-frame.halfWidth}
          y={frame.viewTop}
          width={frame.halfWidth * 2}
          height={frame.halfHeight * 2}
          fill={`url(#${id}-grain)`}
        />
        <BenchCloth
          id={id}
          frame={frame}
          line={line}
          stitches={points.length}
          popped={record.popped}
          deep={look.deep}
          groupRef={groupRef}
        >
          {points.map(([x, y], index) => {
            const popped = record.popped.includes(index);
            const snags = record.snagsAt.filter((stitch) => stitch === index).length;
            const notion = notionAt(index);
            const notionKept = notion !== undefined && !(snags >= (sharpRipper ? 2 : 1));
            const dragging = drag?.stitch === index;
            return (
              <g
                key={index}
                className={
                  popped
                    ? "tf-stitch tf-stitch--popped"
                    : dragging
                      ? "tf-stitch tf-stitch--held"
                      : "tf-stitch"
                }
                data-stitch={index}
                data-popped={popped ? "yes" : "no"}
                tabIndex={popped ? -1 : 0}
                role="button"
                aria-label={
                  popped ? `Stitch ${index + 1} is out` : `Snip stitch ${index + 1} with the helper`
                }
                onKeyDown={(event) => keyPull(event, index)}
              >
                <circle className="tf-stitch__hit" cx={x} cy={y} r={2.4} fill="transparent" />
                <StitchMark
                  x={x}
                  y={y}
                  angle={frame.angle + 90}
                  popped={popped}
                  next={index === nextStitch && drag === null}
                  snags={snags}
                  threadId={`${id}-thread`}
                  reducedMotion={reducedMotion}
                />
                {notion !== undefined && notionKept ? (
                  <g className={popped ? "tf-stitch__notion tf-stitch__notion--saved" : "tf-stitch__notion"}>
                    <TrimArt trimId={notion.notion} x={x + 2.2} y={y - 2.2} scale={0.09} />
                  </g>
                ) : null}
              </g>
            );
          })}
          {drag === null && !assist && guide !== undefined ? (
            <g className="tf-pull-hint" pointerEvents="none">
              <path
                d={`M${guide.from[0]} ${guide.from[1]} L${guide.to[0]} ${guide.to[1]}`}
                stroke="#2f7a5a"
                strokeWidth={0.24}
                strokeDasharray="0.45 0.35"
                strokeLinecap="round"
              />
              <path
                d={`M${guide.to[0] + guide.normal[0] * 0.8} ${guide.to[1] + guide.normal[1] * 0.8} L${guide.to[0] + guide.side[0] * 0.6} ${guide.to[1] + guide.side[1] * 0.6} L${guide.to[0] - guide.side[0] * 0.6} ${guide.to[1] - guide.side[1] * 0.6} Z`}
                fill="#2f7a5a"
              />
            </g>
          ) : null}
        </BenchCloth>
        <g transform={frameTransform(frame)} pointerEvents="none">
          {drag !== null && origin !== undefined ? (
            <g className="tf-pull" pointerEvents="none">
              <path
                className="tf-pull__thread"
                d={`M${origin[0]} ${origin[1]} Q${(origin[0] + drag.point[0]) / 2 + 0.5} ${(origin[1] + drag.point[1]) / 2 - 0.5} ${drag.point[0]} ${drag.point[1]}`}
                fill="none"
                strokeWidth={0.2}
                strokeLinecap="round"
              />
              <circle
                className="tf-pull__ring"
                cx={drag.point[0]}
                cy={drag.point[1]}
                r={1}
                fill="none"
                strokeWidth={0.18}
              />
              <RipperTool
                x={drag.point[0]}
                y={drag.point[1]}
                angle={toolAngle}
                resting={false}
                gradientId={`${id}-steel`}
              />
            </g>
          ) : nextPoint !== undefined && guide !== undefined ? (
            <RipperTool
              x={nextPoint[0] + guide.normal[0] * 1.3 + guide.side[0] * 1.1}
              y={nextPoint[1] + guide.normal[1] * 1.3 + guide.side[1] * 1.1}
              angle={toolAngle}
              resting
              gradientId={`${id}-steel`}
            />
          ) : null}
        </g>
        <rect
          x={-frame.halfWidth}
          y={frame.viewTop}
          width={frame.halfWidth * 2}
          height={frame.halfHeight * 2}
          fill={`url(#${id}-lamp)`}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
