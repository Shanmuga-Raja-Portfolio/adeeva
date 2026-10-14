import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { TrimArt } from "../../../../../adeeva/ui/art/TrimArt";
import type { FindDef, StitchLineDef } from "../../../../content/find";
import { MIN_PULL_CM, stitchPoints, type UnpickLine } from "../../../../core";
import { findCloth } from "../../../art/findCloth";
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
  const frame = lineFrame(line);
  const panel = find.panels[line.panel] ?? find.panels[0];
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
      </defs>
      <rect
        x={-frame.halfWidth}
        y={-frame.halfHeight}
        width={frame.halfWidth * 2}
        height={frame.halfHeight * 2}
        fill={`url(#${id}-wood)`}
      />
      <g ref={groupRef} transform={frameTransform(frame)}>
        {panel !== undefined ? (
          <g>
            <rect x={0.4} y={0.6} width={panel.width} height={panel.height} fill="#3b2a1c" opacity={0.18} />
            <rect width={panel.width} height={panel.height} fill={fabricFill(`${id}-fabric`)} />
            <rect width={panel.width} height={panel.height} fill={fabricSheenFill(`${id}-fabric`)} />
          </g>
        ) : null}
        <path
          d={`M${line.from[0]} ${line.from[1]} L${line.to[0]} ${line.to[1]}`}
          stroke={look.deep}
          strokeWidth={0.5}
          strokeOpacity={0.45}
        />
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
              <circle className="tf-stitch__hit" cx={x} cy={y} r={1.6} fill="transparent" />
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
                  <path d="M-1.1 0 L1.1 0" stroke="#e8553a" strokeWidth={0.55} strokeLinecap="round" />
                  <path d="M-1.1 0 L1.1 0" stroke="#ffc3b0" strokeWidth={0.16} strokeLinecap="round" />
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
              d={`M${origin[0]} ${origin[1]} Q${(origin[0] + drag.point[0]) / 2 + 0.6} ${(origin[1] + drag.point[1]) / 2 - 0.6} ${drag.point[0]} ${drag.point[1]}`}
              fill="none"
              strokeWidth={0.42}
              strokeLinecap="round"
            />
            <circle cx={drag.point[0]} cy={drag.point[1]} r={0.9} />
          </g>
        ) : null}
      </g>
    </svg>
  );
}
