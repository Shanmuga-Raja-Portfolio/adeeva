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
          <pattern id={`${id}-grain`} width={8} height={1.6} patternUnits="userSpaceOnUse">
            <rect width={8} height={1.6} fill="#d8b98d" />
            <path d="M0 0.8 Q4 0.62 8 0.8" stroke="#c49f6f" strokeWidth={0.05} fill="none" />
          </pattern>
          <radialGradient id={`${id}-light`} cx="0.4" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.22} />
          </radialGradient>
        </defs>
        <rect
          x={stain.cx - span}
          y={stain.cy - span}
          width={span * 2}
          height={span * 2}
          fill={`url(#${id}-grain)`}
        />
        {panel !== undefined ? (
          <>
            <rect
              x={0.5}
              y={0.7}
              width={panel.width}
              height={panel.height}
              rx={0.6}
              fill="#3b2a1c"
              opacity={0.28}
            />
            <rect width={panel.width} height={panel.height} rx={0.6} fill={fabricFill(`${id}-fabric`)} />
            <rect width={panel.width} height={panel.height} rx={0.6} fill={fabricSheenFill(`${id}-fabric`)} />
            <rect
              x={0.6}
              y={0.6}
              width={Math.max(0, panel.width - 1.2)}
              height={Math.max(0, panel.height - 1.2)}
              rx={0.4}
              fill="none"
              stroke="#3b2a1c"
              strokeOpacity={0.22}
              strokeWidth={1.2}
            />
            <rect
              x={1.3}
              y={1.3}
              width={Math.max(0, panel.width - 2.6)}
              height={Math.max(0, panel.height - 2.6)}
              fill="none"
              stroke="#fffaf0"
              strokeOpacity={0.75}
              strokeWidth={0.16}
              strokeDasharray="0.6 0.45"
            />
            <path
              d={`M${stain.cx - span * 0.5} ${stain.cy + span * 0.36} Q${stain.cx} ${stain.cy + span * 0.28} ${stain.cx + span * 0.5} ${stain.cy + span * 0.4}`}
              fill="none"
              stroke="#3b2a1c"
              strokeOpacity={0.1}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
            <path
              d={`M${stain.cx - span * 0.48} ${stain.cy - span * 0.34} Q${stain.cx - span * 0.1} ${stain.cy - span * 0.4} ${stain.cx + span * 0.3} ${stain.cy - span * 0.3}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.22}
              strokeWidth={0.7}
              strokeLinecap="round"
            />
          </>
        ) : null}
        <rect
          width={panel?.width ?? 0}
          height={panel?.height ?? 0}
          fill={`url(#${id}-light)`}
          pointerEvents="none"
        />
        <circle
          cx={stain.cx}
          cy={stain.cy}
          r={stain.radius}
          fill="none"
          stroke="#2c4466"
          strokeWidth={0.36}
          opacity={0.45}
        />
        <circle
          cx={stain.cx}
          cy={stain.cy}
          r={stain.radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={0.22}
          strokeDasharray="0.7 0.5"
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
            <ellipse cx={0.5} cy={2.6} rx={3.4} ry={0.9} fill="#3b2a1c" opacity={0.25} />
            <g transform="rotate(-12)">
              <rect
                x={-3.2}
                y={-1.4}
                width={6.4}
                height={3.6}
                rx={1.1}
                fill={harsh ? "#f2a08c" : "#f6c94a"}
                stroke={harsh ? "#b8553a" : "#b8861c"}
                strokeWidth={0.16}
              />
              <rect x={-3.2} y={0.8} width={6.4} height={1.4} rx={0.7} fill="#3b2a1c" opacity={0.14} />
              <rect
                x={-3.2}
                y={-2.5}
                width={6.4}
                height={1.5}
                rx={0.6}
                fill={harsh ? "#c0392b" : "#4f9a6e"}
                stroke="#2f6b4a"
                strokeWidth={0.12}
              />
              <path d="M-2.6 -2.1 H2.6" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={0.22} />
              {[
                [-2.2, -0.4, 0.34],
                [-0.9, 0.5, 0.26],
                [0.4, -0.5, 0.3],
                [1.6, 0.4, 0.36],
                [2.4, -0.6, 0.22],
                [-1.6, 1.3, 0.2],
                [0.9, 1.4, 0.24],
              ].map(([px, py, pr]) => (
                <circle key={`${px}-${py}`} cx={px} cy={py} r={pr} fill="#a8761a" opacity={0.55} />
              ))}
              <path d="M-2.6 -0.9 Q0 -1.3 2.6 -0.9" fill="none" stroke="#fff3c4" strokeWidth={0.3} />
            </g>
            <circle cx={-3.6} cy={-2.4} r={0.7} fill="#ffffff" opacity={0.85} />
            <circle cx={-4.4} cy={-1.4} r={0.45} fill="#ffffff" opacity={0.75} />
            <circle cx={3.9} cy={-2.9} r={0.55} fill="#ffffff" opacity={0.8} />
          </g>
        ) : null}
      </svg>
      <div className="tf-gauge__label" aria-hidden="true">
        <span>Gentle</span>
        <strong>Scrub speed</strong>
        <span>Too fast</span>
      </div>
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
