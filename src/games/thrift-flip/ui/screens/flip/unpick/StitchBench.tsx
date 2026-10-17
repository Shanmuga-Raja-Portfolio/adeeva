import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { TrimArt } from "../../../../../adeeva/ui/art/TrimArt";
import type { FindDef, StitchLineDef } from "../../../../content/find";
import { MIN_PULL_CM, stitchPoints, type UnpickLine } from "../../../../core";
import { findCloth } from "../../../art/findCloth";
import { Pincushion, SeamRipper, Spool } from "../../../art/SewingTools";
import { frameTransform, frameViewBox, lineFrame } from "./lineFrame";

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
  readonly onPull: (request: StitchPullRequest) => void;
}

interface Drag {
  readonly pointerId: number;
  readonly stitch: number;
  readonly point: Point;
}

const HIT_PX = 26;

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
  onPull,
}: StitchBenchProps) {
  const id = useSvgId("bench");
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
  const frame = lineFrame(line, panel);
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
  const seam = Math.hypot(line.to[0] - line.from[0], line.to[1] - line.from[1]);

  return (
    <svg
      className={`tf-bench tf-bench--${tone}`}
      viewBox={frameViewBox(frame)}
      role="group"
      aria-label={`Stitches on the ${find.name}. Drag each one out a little.`}
      data-testid="stitch-bench"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={() => setDrag(null)}
    >
      <defs>
        <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={7} />
        <pattern id={`${id}-wood`} width={6} height={2} patternUnits="userSpaceOnUse">
          <rect width={6} height={2} fill="#d8b98d" />
          <path d="M0 1 Q3 0.4 6 1" stroke="#c49f6f" strokeWidth={0.18} fill="none" />
        </pattern>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.14} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id={`${id}-thread`} gradientUnits="userSpaceOnUse" x1={0} y1={-0.4} x2={0} y2={0.3}>
          <stop offset="0" stopColor="#ff8a6e" />
          <stop offset="0.45" stopColor="#d9432a" />
          <stop offset="1" stopColor="#8f2414" />
        </linearGradient>
        <pattern
          id={`${id}-folds`}
          width={14}
          height={14}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(28)"
        >
          <rect width={3.5} height={14} fill="#ffffff" opacity={0.09} />
          <rect x={3.5} width={2.5} height={14} fill="#3b2a1c" opacity={0.06} />
        </pattern>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0.55" stopColor="#3b2a1c" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.24} />
        </radialGradient>
      </defs>
      <rect
        x={-frame.halfWidth}
        y={-frame.halfHeight}
        width={frame.halfWidth * 2}
        height={frame.halfHeight * 2}
        fill={`url(#${id}-wood)`}
      />
      <Pincushion x={-frame.halfWidth + 3.4} y={frame.halfHeight - 3.2} scale={0.13} />
      <Spool x={frame.halfWidth - 3.2} y={frame.halfHeight - 3.4} scale={0.13} />
      <Spool x={frame.halfWidth - 6.4} y={frame.halfHeight - 2.6} scale={0.11} thread="#8fcfb2" />
      <SeamRipper x={-frame.halfWidth + 8.4} y={frame.halfHeight - 1.6} scale={0.12} />
      <g ref={groupRef} transform={frameTransform(frame)}>
        {panel !== undefined ? (
          <g>
            <rect x={0.4} y={0.6} width={panel.width} height={panel.height} fill="#3b2a1c" opacity={0.18} />
            <rect width={panel.width} height={panel.height} fill={fabricFill(`${id}-fabric`)} />
            <rect width={panel.width} height={panel.height} fill={fabricSheenFill(`${id}-fabric`)} />
            <rect width={panel.width} height={panel.height} fill={`url(#${id}-folds)`} />
            <rect width={panel.width} height={panel.height} fill={`url(#${id}-light)`} />
            <rect
              x={0.7}
              y={0.7}
              width={Math.max(0, panel.width - 1.4)}
              height={Math.max(0, panel.height - 1.4)}
              fill="none"
              stroke={look.deep}
              strokeOpacity={0.35}
              strokeWidth={0.14}
              strokeDasharray="0.6 0.4"
            />
            <rect
              width={panel.width}
              height={panel.height}
              fill="none"
              stroke="#3b2a1c"
              strokeOpacity={0.18}
              strokeWidth={0.3}
            />
          </g>
        ) : null}
        <g transform={`translate(${line.from[0]} ${line.from[1]}) rotate(${frame.angle})`}>
          <rect x={-1} y={0.35} width={seam + 2} height={1.4} fill="#3b2a1c" opacity={0.14} />
          <rect x={-1} y={-0.75} width={seam + 2} height={0.35} fill="#ffffff" opacity={0.45} />
          <path d={`M-1 0 L${seam + 1} 0`} stroke={look.deep} strokeWidth={0.4} strokeOpacity={0.55} />
          <path
            d="M-1 0 q-1.4 -0.4 -1.6 0.8 q-0.2 1.2 -1.4 1"
            fill="none"
            stroke="#d9432a"
            strokeWidth={0.3}
            strokeLinecap="round"
          />
        </g>
        {points.map(([x, y], index) => {
          const popped = record.popped.includes(index);
          const snags = record.snagsAt.filter((stitch) => stitch === index).length;
          const notion = notionAt(index);
          const notionKept = notion !== undefined && !(snags >= (sharpRipper ? 2 : 1));
          const dragging = drag?.stitch === index;
          const angle = frame.angle + 90;
          return (
            <g
              key={index}
              className={
                popped ? "tf-stitch tf-stitch--popped" : dragging ? "tf-stitch tf-stitch--held" : "tf-stitch"
              }
              data-stitch={index}
              data-popped={popped ? "yes" : "no"}
              tabIndex={popped ? -1 : 0}
              role="button"
              aria-label={popped ? `Stitch ${index + 1} is out` : `Snip stitch ${index + 1} with the helper`}
              onKeyDown={(event) => keyPull(event, index)}
            >
              <circle className="tf-stitch__hit" cx={x} cy={y} r={1.9} fill="transparent" />
              {popped ? (
                <g transform={`translate(${x} ${y})`}>
                  <circle r={0.32} fill="#3b2a1c" opacity={0.45} />
                  {reducedMotion ? null : (
                    <path
                      className="tf-stitch__curl"
                      d="M0 0 q0.8 -1.2 0 -2 q-0.8 -0.8 0.2 -1.6"
                      fill="none"
                      stroke="#e8553a"
                      strokeWidth={0.32}
                    />
                  )}
                </g>
              ) : (
                <g transform={`translate(${x} ${y}) rotate(${angle})`}>
                  <circle
                    className="tf-stitch__halo"
                    r={1.75}
                    fill="#fffaf0"
                    fillOpacity={0.42}
                    stroke="#ffffff"
                    strokeOpacity={0.9}
                    strokeWidth={0.16}
                  />
                  <circle cx={-1.5} cy={0.05} r={0.3} fill="#3b2a1c" opacity={0.55} />
                  <circle cx={1.5} cy={0.05} r={0.3} fill="#3b2a1c" opacity={0.55} />
                  <path
                    d="M-1.45 0.22 Q0 0.42 1.45 0.22"
                    fill="none"
                    stroke="#3b2a1c"
                    strokeOpacity={0.3}
                    strokeWidth={0.7}
                    strokeLinecap="round"
                  />
                  <path
                    d="M-1.45 0 Q0 -0.22 1.45 0"
                    fill="none"
                    stroke={`url(#${id}-thread)`}
                    strokeWidth={0.7}
                    strokeLinecap="round"
                  />
                  {[-0.8, -0.27, 0.27, 0.8].map((twist) => (
                    <path
                      key={twist}
                      d={`M${twist - 0.14} 0.24 L${twist + 0.14} -0.36`}
                      stroke="#7a1d0f"
                      strokeOpacity={0.5}
                      strokeWidth={0.09}
                    />
                  ))}
                  <path
                    d="M-1.1 -0.2 Q0 -0.36 1.1 -0.2"
                    fill="none"
                    stroke="#ffd2c4"
                    strokeWidth={0.14}
                    strokeLinecap="round"
                  />
                  {snags > 0 ? (
                    <circle
                      r={1.3}
                      fill="none"
                      stroke="#c0392b"
                      strokeWidth={0.18}
                      strokeDasharray="0.4 0.3"
                    />
                  ) : null}
                </g>
              )}
              {notion !== undefined && notionKept ? (
                <g className={popped ? "tf-stitch__notion tf-stitch__notion--saved" : "tf-stitch__notion"}>
                  <TrimArt trimId={notion.notion} x={x + 2.2} y={y - 2.2} scale={0.09} />
                </g>
              ) : null}
            </g>
          );
        })}
        {drag !== null && origin !== undefined ? (
          <g className="tf-pull">
            <path
              className="tf-pull__thread"
              d={`M${origin[0]} ${origin[1]} Q${(origin[0] + drag.point[0]) / 2 + 0.6} ${(origin[1] + drag.point[1]) / 2 - 0.6} ${drag.point[0]} ${drag.point[1]}`}
              fill="none"
              strokeWidth={0.36}
              strokeLinecap="round"
            />
            <circle
              className="tf-pull__ring"
              cx={drag.point[0]}
              cy={drag.point[1]}
              r={1.3}
              fill="none"
              strokeWidth={0.3}
            />
            <circle className="tf-pull__dot" cx={drag.point[0]} cy={drag.point[1]} r={0.28} />
          </g>
        ) : null}
        {drag === null && !assist && guide !== undefined ? (
          <g className="tf-pull-hint" pointerEvents="none">
            <path
              d={`M${guide.from[0]} ${guide.from[1]} L${guide.to[0]} ${guide.to[1]}`}
              stroke="#3f8f6e"
              strokeWidth={0.34}
              strokeDasharray="0.5 0.4"
              strokeLinecap="round"
            />
            <path
              d={`M${guide.to[0] + guide.normal[0] * 0.9} ${guide.to[1] + guide.normal[1] * 0.9} L${guide.to[0] + guide.side[0] * 0.7} ${guide.to[1] + guide.side[1] * 0.7} L${guide.to[0] - guide.side[0] * 0.7} ${guide.to[1] - guide.side[1] * 0.7} Z`}
              fill="#3f8f6e"
            />
          </g>
        ) : null}
      </g>
      <rect
        x={-frame.halfWidth}
        y={-frame.halfHeight}
        width={frame.halfWidth * 2}
        height={frame.halfHeight * 2}
        fill={`url(#${id}-lamp)`}
        pointerEvents="none"
      />
    </svg>
  );
}
