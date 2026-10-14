import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import type { FindDef } from "../../../../content/find";
import type { Stain, StainWork } from "../../../../core";
import { findCloth } from "../../../art/findCloth";
import { StainArt } from "../../../art/StainArt";
import { useTickLoop } from "../../../../../../ui/kit/useTickLoop";
import { scrubTick } from "./scrubTick";

export interface StainScrubberProps {
  readonly find: FindDef;
  readonly stain: Stain;
  readonly stored: StainWork;
  readonly threshold: number;
  readonly gentle: number;
  readonly reducedMotion: boolean;
  readonly onRecord: (work: StainWork) => void;
}

const RECORD_EVERY_MS = 300;

interface Pointer {
  readonly id: number;
  point: Point;
  framePoint: Point;
  speed: number;
}

function localPoint(svg: SVGSVGElement | null, clientX: number, clientY: number): Point | null {
  const matrix = svg?.getScreenCTM();
  if (matrix === null || matrix === undefined) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return [point.x, point.y];
}

export function StainScrubber({
  find,
  stain,
  stored,
  threshold,
  gentle,
  reducedMotion,
  onRecord,
}: StainScrubberProps) {
  const id = useSvgId("scrub");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointer = useRef<Pointer | null>(null);
  const workRef = useRef<StainWork>(stored);
  const recordRef = useRef(onRecord);
  const recordedTicks = useRef(stored.scrubTicks);
  const sinceRecord = useRef(0);
  const [work, setWork] = useState<StainWork>(stored);
  const [active, setActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const cloth = findCloth(find);
  const panel = find.panels[stain.panel] ?? find.panels[0];
  const span = stain.radius * 3.2;
  const view = `${stain.cx - span / 2} ${stain.cy - span / 2} ${span} ${span}`;

  useEffect(() => {
    recordRef.current = onRecord;
  }, [onRecord]);

  const flush = useRef(() => {
    const latest = workRef.current;
    if (latest.scrubTicks <= recordedTicks.current) return;
    recordedTicks.current = latest.scrubTicks;
    recordRef.current(latest);
  });

  useEffect(() => {
    sinceRecord.current = 0;
    const done = flush.current;
    return () => done();
  }, [active]);

  useTickLoop(active, (count, seconds) => {
    sinceRecord.current += seconds * 1000;
    const current = pointer.current;
    if (current !== null && seconds > 0) {
      const instant =
        Math.hypot(current.point[0] - current.framePoint[0], current.point[1] - current.framePoint[1]) /
        seconds;
      current.speed = current.speed * 0.5 + instant * 0.5;
      current.framePoint = current.point;
    }
    let next = workRef.current;
    for (let tick = 0; current !== null && tick < count; tick += 1)
      next = scrubTick(next, stain, { point: current.point, speed: current.speed }, gentle);
    if (next !== workRef.current) {
      workRef.current = next;
      setWork(next);
    }
    if (current !== null) setSpeed(current.speed);
    if (sinceRecord.current >= RECORD_EVERY_MS) {
      sinceRecord.current = 0;
      flush.current();
    }
    return true;
  });

  const track = (event: PointerEvent<SVGSVGElement>) => {
    const point = localPoint(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    setCursor(point);
    const current = pointer.current;
    if (current === null || current.id !== event.pointerId) return;
    current.point = point;
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    const point = localPoint(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { id: event.pointerId, point, framePoint: point, speed: 0 };
    setActive(true);
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (pointer.current?.id !== event.pointerId) return;
    pointer.current = null;
    setActive(false);
    setSpeed(0);
  };

  const shares = work.cellTicks.map((ticks) => Math.min(1, ticks / threshold));
  const harsh = speed > gentle;
  const gauge = Math.min(1, speed / (gentle * 1.6));
  return (
    <div className={active ? "tf-scrub tf-scrub--active" : "tf-scrub"}>
      <svg
        ref={svgRef}
        className="tf-scrub__svg"
        viewBox={view}
        role="img"
        aria-label={`A stain on the ${find.name}. Scrub it with gentle circles.`}
        data-testid="stain-scrubber"
        data-scrub-ticks={work.scrubTicks}
        onPointerDown={down}
        onPointerMove={track}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={() => {
          if (pointer.current === null) setCursor(null);
        }}
      >
        <defs>
          <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={5} />
        </defs>
        <rect x={stain.cx - span} y={stain.cy - span} width={span * 2} height={span * 2} fill="#d8b98d" />
        {panel !== undefined ? (
          <>
            <rect width={panel.width} height={panel.height} fill={fabricFill(`${id}-fabric`)} />
            <rect width={panel.width} height={panel.height} fill={fabricSheenFill(`${id}-fabric`)} />
          </>
        ) : null}
        <circle
          cx={stain.cx}
          cy={stain.cy}
          r={stain.radius}
          fill="none"
          stroke="#3f5d84"
          strokeWidth={0.16}
          strokeDasharray="0.6 0.5"
          opacity={0.5}
        />
        <StainArt
          stain={stain}
          seed={`${find.id}-${stain.id}`}
          cleanShares={shares}
          scrubbing={active}
          reducedMotion={reducedMotion}
        />
        {cursor !== null ? (
          <g transform={`translate(${cursor[0]} ${cursor[1]})`} className="tf-sponge" pointerEvents="none">
            <rect
              x={-2.2}
              y={-1.5}
              width={4.4}
              height={3}
              rx={0.9}
              fill={harsh ? "#f2a08c" : "#f6d36b"}
              stroke="#b88a1c"
              strokeWidth={0.14}
            />
            <circle cx={-1.2} cy={-0.5} r={0.35} fill="#fff8d6" />
            <circle cx={0.9} cy={0.4} r={0.28} fill="#fff8d6" />
          </g>
        ) : null}
      </svg>
      <div className="tf-gauge" aria-hidden="true">
        <span className="tf-gauge__gentle" style={{ width: `${(100 * gentle) / (gentle * 1.6)}%` }} />
        <span
          className={harsh ? "tf-gauge__needle tf-gauge__needle--harsh" : "tf-gauge__needle"}
          style={{ left: `${gauge * 100}%` }}
        />
      </div>
      <p className={harsh ? "tf-scrub__tip tf-scrub__tip--harsh" : "tf-scrub__tip"} role="status">
        {harsh
          ? "Whoa, too fast! The colour fades."
          : active
            ? "Lovely gentle circles."
            : "Press and scrub in circles."}
      </p>
    </div>
  );
}
