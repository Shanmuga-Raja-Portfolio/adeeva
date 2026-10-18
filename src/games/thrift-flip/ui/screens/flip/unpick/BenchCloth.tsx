import type { ReactNode, Ref } from "react";
import type { Point } from "../../../../../../engine/geometry/point";
import { fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import type { StitchLineDef } from "../../../../content/find";
import { frameTransform, type FittedFrame } from "./lineFrame";

export interface BenchClothProps {
  readonly id: string;
  readonly frame: FittedFrame;
  readonly line: StitchLineDef;
  readonly stitches: number;
  readonly popped: readonly number[];
  readonly deep: string;
  readonly groupRef: Ref<SVGGElement>;
  readonly children: ReactNode;
}

const CLOSED = 0.16;
const OPEN = 0.62;
const TOOTH = 0.62;
const BLEED = 60;

function pinked(left: number, right: number, top: number, bottom: number): string {
  const teeth = Math.ceil((right - left) / TOOTH);
  const lip = TOOTH * 0.5;
  const along = Array.from({ length: teeth + 1 }, (_, index) => left + index * TOOTH);
  const topEdge = along.map((x, index) => `L${x} ${index % 2 === 0 ? top + lip : top}`).join(" ");
  const bottomEdge = [...along]
    .reverse()
    .map((x, index) => `L${x} ${index % 2 === 0 ? bottom - lip : bottom}`)
    .join(" ");
  return `M${left} ${top + lip} ${topEdge} L${right} ${bottom} ${bottomEdge} Z`;
}

function seamEdge(seam: number, stitches: number, popped: readonly number[], side: 1 | -1): Point[] {
  const steps = Math.max(1, stitches - 1);
  const gap = (index: number) => (popped.includes(index) ? OPEN : CLOSED);
  const inner = Array.from({ length: stitches }, (_, index): Point[] => {
    const here: Point = [(seam * index) / steps, side * gap(index)];
    if (index === stitches - 1) return [here];
    const between = Math.max(CLOSED, ((gap(index) + gap(index + 1)) / 2) * 0.8);
    return [here, [(seam * (index + 0.5)) / steps, side * between]];
  }).flat();
  return [
    [-BLEED, side * CLOSED],
    [-1.2, side * CLOSED],
    ...inner,
    [seam + 1.2, side * CLOSED],
    [seam + BLEED, side * CLOSED],
  ];
}

function pathOf(points: readonly Point[], start: "M" | "L" = "M"): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return "";
  const curves = points.slice(1, -1).map(([x, y], index) => {
    const [nx, ny] = points[index + 2] ?? last;
    return `Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
  });
  return [`${start}${first[0]} ${first[1]}`, ...curves, `L${last[0]} ${last[1]}`].join(" ");
}

export function BenchCloth({ id, frame, line, stitches, popped, deep, groupRef, children }: BenchClothProps) {
  const seam = Math.hypot(line.to[0] - line.from[0], line.to[1] - line.from[1]);
  const left = -frame.halfWidth - 2;
  const right = frame.halfWidth + 2;
  const outline = pinked(left, right, -frame.clothHalf, frame.clothHalf);
  const upper = seamEdge(seam, stitches, popped, -1);
  const lower = seamEdge(seam, stitches, popped, 1);
  const gap = `${pathOf(upper)} ${pathOf([...lower].reverse(), "L")} Z`;
  const span = frame.halfWidth * 4 + BLEED;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-cloth`}>
          <path d={outline} />
        </clipPath>
        <linearGradient id={`${id}-gap`} gradientUnits="userSpaceOnUse" x1={0} y1={-OPEN} x2={0} y2={OPEN}>
          <stop offset="0" stopColor="#1c120a" stopOpacity={0.7} />
          <stop offset="0.45" stopColor="#1c120a" stopOpacity={0.05} />
          <stop offset="1" stopColor="#1c120a" stopOpacity={0.2} />
        </linearGradient>
        <pattern id={`${id}-weave`} width={0.24} height={0.24} patternUnits="userSpaceOnUse">
          <path d="M0 0.06 H0.24" stroke="#ffffff" strokeOpacity={0.09} strokeWidth={0.05} />
          <path d="M0.18 0 V0.24" stroke="#2a1b10" strokeOpacity={0.05} strokeWidth={0.05} />
        </pattern>
        <linearGradient id={`${id}-hem`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="0.06" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.9" stopColor="#2a1b10" stopOpacity={0} />
          <stop offset="1" stopColor="#2a1b10" stopOpacity={0.28} />
        </linearGradient>
      </defs>
      <path d={outline} fill="#2a1b10" opacity={0.14} transform="translate(0.35 0.75)" />
      <path d={outline} fill="#2a1b10" opacity={0.26} transform="translate(0.12 0.3)" />
      <g clipPath={`url(#${id}-cloth)`}>
        <g ref={groupRef} transform={frameTransform(frame)}>
          <g transform={`translate(${frame.cx - span / 2} ${frame.cy - span / 2})`}>
            <rect width={span} height={span} fill={fabricFill(`${id}-fabric`)} />
            <rect width={span} height={span} fill={fabricSheenFill(`${id}-fabric`)} />
            <rect width={span} height={span} fill="#fff8ec" opacity={0.1} />
            <rect width={span} height={span} fill={`url(#${id}-weave)`} />
          </g>
          <g transform={`translate(${line.from[0]} ${line.from[1]}) rotate(${frame.angle})`}>
            <path
              d={`M${-BLEED} -1.75 H${seam + BLEED} M${-BLEED} 1.75 H${seam + BLEED}`}
              stroke={deep}
              strokeOpacity={0.4}
              strokeWidth={0.07}
              strokeDasharray="0.42 0.3"
            />
            <path
              d={`M${-BLEED} -2.3 H${seam + BLEED}`}
              stroke="#ffffff"
              strokeOpacity={0.22}
              strokeWidth={0.5}
            />
            <path
              d={`M${-BLEED} 2.3 H${seam + BLEED}`}
              stroke="#2a1b10"
              strokeOpacity={0.08}
              strokeWidth={0.7}
            />
            <path d={gap} fill={fabricFill(`${id}-fabric`)} />
            <path d={gap} fill={deep} opacity={0.45} />
            <path d={gap} fill={`url(#${id}-gap)`} />
            <path
              d={pathOf(lower.map(([x, y]): Point => [x, y - 0.1]))}
              fill="none"
              stroke="#1c120a"
              strokeOpacity={0.35}
              strokeWidth={0.16}
            />
            <path
              d={pathOf(upper.map(([x, y]): Point => [x, y + 0.06]))}
              fill="none"
              stroke="#1c120a"
              strokeOpacity={0.3}
              strokeWidth={0.1}
            />
            <path
              d={pathOf(upper.map(([x, y]): Point => [x, y - 0.07]))}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.7}
              strokeWidth={0.12}
            />
            <path
              d={pathOf(lower.map(([x, y]): Point => [x, y + 0.08]))}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.3}
              strokeWidth={0.06}
            />
          </g>
          {children}
        </g>
        <rect
          x={left}
          y={-frame.halfWidth}
          width={right - left}
          height={frame.halfWidth * 2}
          fill={`url(#${id}-ripple)`}
          pointerEvents="none"
        />
        <rect
          x={left}
          y={-frame.clothHalf}
          width={right - left}
          height={frame.clothHalf * 2}
          fill={`url(#${id}-hem)`}
          pointerEvents="none"
        />
      </g>
      <path d={outline} fill="none" stroke={deep} strokeOpacity={0.45} strokeWidth={0.06} />
    </g>
  );
}
