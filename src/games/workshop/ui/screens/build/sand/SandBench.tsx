import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { seededUnit } from "../../../../../../ui/art/seedFromText";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import type { WoodId } from "../../../../content/wood";
import {
  applyStrokes,
  MAX_PASSES,
  SAND_CANVAS,
  SAND_ROWS,
  sandStrokes,
  settleDrag,
  type SandRecord,
} from "../../../../core";
import { DustLayer } from "./DustLayer";
import { SandingBlock } from "../../../art/SandingBlock";
import { woodLook } from "../../../art/woodLook";
import { WoodPattern } from "../../../art/WoodPattern";

interface SandBenchProps {
  readonly woodId: WoodId;
  readonly record: SandRecord;
  readonly angleLimit: number;
  readonly assisted: boolean;
  readonly seed: number;
  readonly onRub: (points: readonly Point[], stillRubbing: boolean) => void;
}

const CELL_H = SAND_CANVAS.height / SAND_ROWS;
const MIN_POINT_GAP = 1;

function spaced(from: Point | undefined, points: readonly Point[]): Point[] {
  const kept: Point[] = [];
  let last = from;
  for (const point of points) {
    if (last !== undefined && Math.hypot(point[0] - last[0], point[1] - last[1]) < MIN_POINT_GAP) continue;
    kept.push(point);
    last = point;
  }
  return kept;
}

export function SandBench({ woodId, record, angleLimit, assisted, seed, onRub }: SandBenchProps) {
  const id = useSvgId("ww-sand");
  const svgRef = useRef<SVGSVGElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const [points, setPoints] = useState<readonly Point[]>([]);
  const [block, setBlock] = useState<Point | null>(null);
  const [rubbing, setRubbing] = useState(false);
  const [row, setRow] = useState(0);
  const [focused, setFocused] = useState(false);
  const strokes = sandStrokes(points, angleLimit, assisted);
  const shown = points.length > 1 ? applyStrokes(record, strokes, assisted) : record;
  const look = woodLook(woodId);

  const pointOf = (clientX: number, clientY: number): Point | null => {
    const point = clientToSvg(svgRef.current, clientX, clientY);
    if (point === null) return null;
    const first = pointsRef.current[0];
    const y = assisted && first !== undefined ? first[1] : point.y;
    return [Math.max(0, Math.min(SAND_CANVAS.width, point.x)), Math.max(0, Math.min(SAND_CANVAS.height, y))];
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointOf(event.clientX, event.clientY);
    if (point === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointsRef.current = [point];
    setPoints([point]);
    setBlock(point);
    setRubbing(true);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!rubbing) return;
    const native = event.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const added = spaced(
      pointsRef.current[pointsRef.current.length - 1],
      (events.length > 0 ? events : [native])
        .map((entry) => pointOf(entry.clientX, entry.clientY))
        .filter((point): point is Point => point !== null),
    );
    if (added.length === 0) return;
    const { settled, rest } = settleDrag([...pointsRef.current, ...added]);
    if (settled.length > 1) onRub(settled, true);
    pointsRef.current = [...rest];
    setPoints(rest);
    setBlock(added[added.length - 1] ?? null);
  };

  const up = () => {
    if (!rubbing) return;
    setRubbing(false);
    const finished = pointsRef.current;
    pointsRef.current = [];
    setPoints([]);
    if (finished.length > 1) onRub(finished, false);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      setRow((current) => Math.max(0, Math.min(SAND_ROWS - 1, current + (event.key === "ArrowUp" ? -1 : 1))));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      if (event.repeat) return;
      const y = (row + 0.5) * CELL_H;
      const ends: Point[] = [
        [6, y],
        [SAND_CANVAS.width - 6, y],
      ];
      onRub(event.key === "ArrowRight" ? ends : [...ends].reverse(), false);
    }
  };

  return (
    <svg
      ref={svgRef}
      tabIndex={0}
      onKeyDown={onKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={rubbing ? "ww-sand-bench ww-sand-bench--rubbing" : "ww-sand-bench"}
      viewBox={`-8 -8 ${SAND_CANVAS.width + 16} ${SAND_CANVAS.height + 16}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      data-testid="sand-bench"
      data-strokes={record.strokes}
      role="application"
      aria-roledescription="sanding surface"
      aria-label={`Surface to sand. ${shown.passes.filter((passes) => passes >= MAX_PASSES).length} of ${shown.passes.length} patches are silky. Up and down pick a row, left and right rub along it.`}
    >
      <defs>
        <WoodPattern id={`${id}-wood`} look={look} seed={seed} tile={40} />
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf2" stopOpacity={0.2} />
          <stop offset="0.3" stopColor="#fffdf2" stopOpacity={0.06} />
          <stop offset="1" stopColor="#2f1d12" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id={`${id}-bench`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8723f" />
          <stop offset="1" stopColor="#7a4a22" />
        </linearGradient>
      </defs>
      <rect
        x={-8}
        y={-8}
        width={SAND_CANVAS.width + 16}
        height={SAND_CANVAS.height + 16}
        rx={10}
        fill={`url(#${id}-bench)`}
      />
      <rect
        x={-8}
        y={-8}
        width={SAND_CANVAS.width + 16}
        height={SAND_CANVAS.height + 16}
        rx={10}
        fill="none"
        stroke="#2f2622"
        strokeOpacity={0.5}
        strokeWidth={1.5}
      />
      <rect x={2} y={4} width={SAND_CANVAS.width} height={SAND_CANVAS.height} fill="#2f2622" opacity={0.28} />
      <rect
        width={SAND_CANVAS.width}
        height={SAND_CANVAS.height}
        fill={`url(#${id}-wood)`}
        stroke="#2f2622"
        strokeWidth={1.5}
      />
      <rect width={SAND_CANVAS.width} height={SAND_CANVAS.height} fill={`url(#${id}-light)`} />
      <DustLayer id={`${id}-dust`} passes={shown.passes} seed={seed} />
      {record.across > 0
        ? Array.from({ length: Math.min(12, record.across) }, (_, index) => (
            <path
              key={index}
              d={`M${20 + seededUnit(seed, index + 60) * 280} ${12 + seededUnit(seed, index + 70) * 40} l${-6 + seededUnit(seed, index + 80) * 12} ${70 + seededUnit(seed, index + 90) * 40}`}
              stroke="#ffffff"
              strokeOpacity={0.55}
              strokeWidth={1}
            />
          ))
        : null}
      {focused ? (
        <rect
          x={0}
          y={row * CELL_H}
          width={SAND_CANVAS.width}
          height={CELL_H}
          fill="none"
          stroke="#f2c230"
          strokeWidth={3}
          strokeDasharray="8 5"
        />
      ) : null}
      {block !== null && rubbing ? <SandingBlock x={block[0]} y={block[1]} /> : null}
      <path
        d="M14 -3 H96 M88 -6.5 L96 -3 L88 0.5 M22 -6.5 L14 -3 L22 0.5"
        stroke="#fff3cf"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
