import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";

export interface RailGarment {
  readonly key: string;
  readonly art: ReactNode;
}

export interface GarmentRailProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly pieces: readonly RailGarment[];
  readonly fillers: readonly string[];
  readonly slots: number;
}

const SHAPES = [
  "M-22 6 L-30 18 L-24 22 L-18 16 L-20 70 L20 70 L18 16 L24 22 L30 18 L22 6 Q0 14 -22 6 Z",
  "M-14 6 L-24 72 Q0 80 24 72 L14 6 Q0 12 -14 6 Z",
  "M-22 6 L-34 40 L-27 43 L-19 22 L-20 76 L-2 76 L0 34 L2 76 L20 76 L19 22 L27 43 L34 40 L22 6 Q0 14 -22 6 Z",
  "M-20 6 L-30 14 L-26 30 L-18 24 L-18 62 L18 62 L18 24 L26 30 L30 14 L20 6 Q0 16 -20 6 Z",
];

function Hanger({ x, top }: { readonly x: number; readonly top: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={`M${x} ${top - 6} q6 0 6 -6 q0 -6 -6 -6`} stroke="#8a8f99" strokeWidth={2.2} />
      <path
        d={`M${x - 22} ${top + 8} L${x} ${top - 2} L${x + 22} ${top + 8}`}
        stroke="#a07a52"
        strokeWidth={3}
      />
    </g>
  );
}

function Filler({
  x,
  top,
  colour,
  shape,
}: {
  readonly x: number;
  readonly top: number;
  readonly colour: string;
  readonly shape: number;
}) {
  const path = SHAPES[shape % SHAPES.length] ?? SHAPES[0];
  return (
    <g transform={`translate(${x} ${top})`}>
      <path d={path} fill={colour} stroke={darken(colour, 0.28)} strokeWidth={1.6} />
      <path d={path} fill="#3b2a1c" opacity={0.12} transform="translate(5 0) scale(0.6 1)" />
      <path d="M-12 12 Q0 18 12 12" fill="none" stroke={lighten(colour, 0.4)} strokeWidth={2} opacity={0.8} />
    </g>
  );
}

function Tag({ x, y, tilt }: { readonly x: number; readonly y: number; readonly tilt: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d="M0 -10 V0" stroke="#a07a52" strokeWidth={1.2} />
      <path d="M-8 0 L8 0 L8 18 L0 24 L-8 18 Z" fill="#fff4e2" stroke="#a07a52" strokeWidth={1.4} />
      <circle cx={0} cy={5} r={1.8} fill="#a07a52" />
      <path d="M-4 12 H4 M-3 16 H3" stroke="#f08a3c" strokeWidth={1.6} />
    </g>
  );
}

export function GarmentRail({ x, y, width, height, pieces, fillers, slots }: GarmentRailProps) {
  const step = width / slots;
  const slot = (index: number) => x + step * (index + 0.5);
  const spare = Array.from(
    { length: Math.max(0, slots - pieces.length) },
    (_, index) => index + pieces.length,
  );
  return (
    <g>
      <ellipse
        cx={x + width / 2}
        cy={y + height + 4}
        rx={width / 2 + 30}
        ry={12}
        fill="#3b2a1c"
        opacity={0.22}
      />
      {[x - 8, x + width + 8].map((post) => (
        <g key={post}>
          <path d={`M${post} ${y} V${y + height}`} stroke="#7d828c" strokeWidth={6} strokeLinecap="round" />
          <path d={`M${post - 1.5} ${y} V${y + height}`} stroke="#e1e4ea" strokeWidth={1.5} />
          <path
            d={`M${post - 22} ${y + height} H${post + 22}`}
            stroke="#5f646d"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle cx={post - 18} cy={y + height + 6} r={5} fill="#3b3f46" />
          <circle cx={post + 18} cy={y + height + 6} r={5} fill="#3b3f46" />
        </g>
      ))}
      <path d={`M${x - 14} ${y} H${x + width + 14}`} stroke="#7d828c" strokeWidth={7} strokeLinecap="round" />
      <path
        d={`M${x - 12} ${y - 2} H${x + width + 12}`}
        stroke="#eef0f4"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {spare.map((index) => (
        <g key={`spare-${index}`}>
          <Hanger x={slot(index)} top={y + 14} />
          <Filler
            x={slot(index)}
            top={y + 18}
            colour={fillers[index % Math.max(1, fillers.length)] ?? "#e8c7a0"}
            shape={index}
          />
        </g>
      ))}
      {pieces.map((piece, index) => (
        <g key={piece.key}>
          <Hanger x={slot(index)} top={y + 14} />
          <g transform={`translate(${slot(index)} ${y + 8})`}>{piece.art}</g>
          <Tag x={slot(index) + 20} y={y + 30} tilt={index % 2 === 0 ? -10 : 8} />
        </g>
      ))}
    </g>
  );
}
