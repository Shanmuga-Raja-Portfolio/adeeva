import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clampPose, type PlacedPose } from "../../../../../engine/placedPose";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { LAMP_STEP, PAGE_CANVAS, propById, type PieceSource } from "../../../core";
import type { BackdropId } from "../../../content/lookbookBackdrop";
import { PhotoArt, propTransform, type PhotoProp } from "../../art/PhotoArt";
import { PropArt } from "../../art/PropArt";

export interface PhotoStageProps {
  readonly backdrop: BackdropId;
  readonly props: readonly PhotoProp[];
  readonly piece: PieceSource;
  readonly light: number;
  readonly angle: number;
  readonly lampLocked: boolean;
  readonly selected: number | null;
  readonly reducedMotion: boolean;
  readonly onAngle: (angle: number) => void;
  readonly onSelect: (index: number | null) => void;
  readonly onMoveProp: (index: number, pose: PlacedPose) => void;
}

const RING = 136;
const CENTRE = PAGE_CANVAS.width / 2;
const NUDGE = 6;

interface PropDrag {
  readonly index: number;
  readonly pointerId: number;
  readonly start: { readonly x: number; readonly y: number };
  readonly origin: PlacedPose;
  readonly pose: PlacedPose;
  readonly moved: boolean;
}

function snapAngle(angle: number): number {
  return (((Math.round(angle / LAMP_STEP) * LAMP_STEP) % 360) + 360) % 360;
}

function lampPoint(angle: number): { readonly x: number; readonly y: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: CENTRE + Math.cos(radians) * RING, y: CENTRE + Math.sin(radians) * RING };
}

export function PhotoStage({
  backdrop,
  props,
  piece,
  light,
  angle,
  lampLocked,
  selected,
  reducedMotion,
  onAngle,
  onSelect,
  onMoveProp,
}: PhotoStageProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const clipId = useSvgId("jb-photo-clip");
  const [lampDrag, setLampDrag] = useState<number | null>(null);
  const [drag, setDrag] = useState<PropDrag | null>(null);
  const shown = props.map((prop, index) =>
    drag !== null && drag.index === index ? { ...prop, ...drag.pose } : prop,
  );
  const lamp = lampPoint(angle);

  const angleAt = (clientX: number, clientY: number): number | null => {
    const point = clientToSvg(svgRef.current, clientX, clientY);
    if (point === null) return null;
    return snapAngle((Math.atan2(point.y - CENTRE, point.x - CENTRE) * 180) / Math.PI + 90);
  };
  const lampDown = (event: PointerEvent<SVGGElement>) => {
    if (lampLocked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setLampDrag(event.pointerId);
  };
  const lampMove = (event: PointerEvent<SVGGElement>) => {
    if (lampDrag !== event.pointerId) return;
    const next = angleAt(event.clientX, event.clientY);
    if (next !== null && next !== angle) onAngle(next);
  };
  const lampKey = (event: KeyboardEvent<SVGGElement>) => {
    if (lampLocked) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onAngle(snapAngle(angle - LAMP_STEP));
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onAngle(snapAngle(angle + LAMP_STEP));
    }
  };
  const propDown = (event: PointerEvent<SVGGElement>, index: number) => {
    const prop = props[index];
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (prop === undefined || point === null) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, pointerId: event.pointerId, start: point, origin: prop, pose: prop, moved: false });
    onSelect(index);
  };
  const propMove = (event: PointerEvent<SVGGElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;
    setDrag({
      ...drag,
      moved: drag.moved || Math.hypot(dx, dy) > 3,
      pose: clampPose(PAGE_CANVAS, {
        ...drag.origin,
        x: Math.round(drag.origin.x + dx),
        y: Math.round(drag.origin.y + dy),
      }),
    });
  };
  const propUp = (event: PointerEvent<SVGGElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    setDrag(null);
    if (drag.moved) onMoveProp(drag.index, drag.pose);
  };
  const propKey = (event: KeyboardEvent<SVGGElement>, index: number) => {
    const prop = props[index];
    if (prop === undefined) return;
    const moves: Record<string, readonly [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    onSelect(index);
    onMoveProp(index, clampPose(PAGE_CANVAS, { ...prop, x: prop.x + delta[0], y: prop.y + delta[1] }));
  };
  return (
    <svg
      ref={svgRef}
      className="jb-photo-stage"
      viewBox={`${CENTRE - 160} ${CENTRE - 160} 320 320`}
      role="group"
      aria-label="Lookbook photo"
      data-testid="photo-stage"
      data-light={light.toFixed(3)}
      data-angle={angle}
    >
      <circle cx={CENTRE} cy={CENTRE} r={RING} fill="none" stroke="#e8c27a" strokeWidth={10} opacity={0.35} />
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r={RING}
        fill="none"
        stroke="#b8741c"
        strokeWidth={2}
        strokeDasharray="2 10"
      />
      <clipPath id={clipId}>
        <rect width={PAGE_CANVAS.width} height={PAGE_CANVAS.height} rx={14} />
      </clipPath>
      <g clipPath={`url(#${clipId})`} onPointerDown={() => onSelect(null)}>
        <PhotoArt
          backdrop={backdrop}
          props={[]}
          piece={piece}
          light={light}
          lampAngle={angle}
          twinkle={!reducedMotion}
        />
        {shown.map((prop, index) => (
          <g
            key={`${prop.propId}-${index}`}
            transform={propTransform(prop)}
            className={index === selected ? "jb-photo-prop jb-photo-prop--on" : "jb-photo-prop"}
            role="button"
            tabIndex={0}
            aria-label={`${propById(prop.propId).name}. Drag or use arrow keys to move it.`}
            onPointerDown={(event) => propDown(event, index)}
            onPointerMove={propMove}
            onPointerUp={propUp}
            onPointerCancel={() => setDrag(null)}
            onKeyDown={(event) => propKey(event, index)}
            onFocus={() => onSelect(index)}
            data-testid={`photo-prop-${index}`}
          >
            <rect x={-24} y={-24} width={48} height={48} fill="transparent" />
            {index === selected ? (
              <rect
                x={-25}
                y={-25}
                width={50}
                height={50}
                rx={8}
                fill="none"
                stroke="#e8a33d"
                strokeWidth={1.6}
                strokeDasharray="4 3"
              />
            ) : null}
            <PropArt propId={prop.propId} />
          </g>
        ))}
      </g>
      <rect
        width={PAGE_CANVAS.width}
        height={PAGE_CANVAS.height}
        rx={14}
        fill="none"
        stroke="#fffbf4"
        strokeWidth={6}
      />
      <g
        className={lampLocked ? "jb-lamp-knob jb-lamp-knob--locked" : "jb-lamp-knob"}
        transform={`translate(${lamp.x} ${lamp.y})`}
        role="slider"
        tabIndex={lampLocked ? -1 : 0}
        aria-label="Little lamp. Left and right arrows move it round the ring."
        aria-valuemin={0}
        aria-valuemax={355}
        aria-valuenow={angle}
        aria-valuetext={`${angle} degrees`}
        onPointerDown={lampDown}
        onPointerMove={lampMove}
        onPointerUp={() => setLampDrag(null)}
        onPointerCancel={() => setLampDrag(null)}
        onKeyDown={lampKey}
        data-testid="lamp-knob"
      >
        <circle r={28} fill="transparent" />
        <circle r={22} fill="#fff6d8" opacity={0.25 + 0.5 * light} />
        <circle r={15} fill="#e8a33d" stroke="#7a3d10" strokeWidth={2} />
        <path d="M-7 -3 L7 -3 L4 6 L-4 6 Z" fill="#fff3c8" />
        <rect x={-3} y={6} width={6} height={4} rx={1} fill="#7a3d10" />
      </g>
    </svg>
  );
}
