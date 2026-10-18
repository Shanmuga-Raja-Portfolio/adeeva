import { memo } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";

export interface StallDressingProps {
  readonly id: string;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly rail: number;
  readonly floor: number;
}

const BULBS = ["#ffd27a", "#ffb37a", "#fff1b8", "#ffd27a", "#ffc6a8"];

export function StallDressingDefs({ id }: { readonly id: string }) {
  return (
    <>
      <radialGradient id={`${id}-bulb`}>
        <stop offset="0" stopColor="#fff6d8" stopOpacity={0.95} />
        <stop offset="0.35" stopColor="#ffd27a" stopOpacity={0.45} />
        <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`${id}-straw`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4d58e" />
        <stop offset="1" stopColor="#c99a4e" />
      </linearGradient>
      <linearGradient id={`${id}-pot`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d98a5e" />
        <stop offset="0.55" stopColor="#c06b44" />
        <stop offset="1" stopColor="#8f4a2c" />
      </linearGradient>
      <linearGradient id={`${id}-wicker`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9a86a" />
        <stop offset="1" stopColor="#9a6a36" />
      </linearGradient>
    </>
  );
}

function FairyLights({
  id,
  left,
  right,
  y,
}: {
  readonly id: string;
  readonly left: number;
  readonly right: number;
  readonly y: number;
}) {
  const count = 9;
  const step = (right - left) / (count - 1);
  const sag = (index: number) => Math.sin((index / (count - 1)) * Math.PI) * 9;
  const path = Array.from({ length: count }, (_, index) => {
    const x = left + index * step;
    return `${index === 0 ? "M" : "L"}${x} ${y + sag(index)}`;
  }).join(" ");
  return (
    <g>
      <path d={path} fill="none" stroke="#5b3a1e" strokeWidth={1.6} opacity={0.7} />
      {Array.from({ length: count }, (_, index) => {
        const x = left + index * step;
        const cy = y + sag(index) + 7;
        const colour = BULBS[index % BULBS.length] ?? "#ffd27a";
        return (
          <g key={index}>
            <circle cx={x} cy={cy} r={18} fill={`url(#${id}-bulb)`} />
            <path d={`M${x} ${cy - 7} v3`} stroke="#5b3a1e" strokeWidth={2} />
            <ellipse cx={x} cy={cy} rx={4} ry={5.5} fill={colour} />
            <ellipse cx={x - 1.3} cy={cy - 1.8} rx={1.3} ry={2} fill="#ffffff" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

function StrawHat({ id, x, y }: { readonly id: string; readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-10)`}>
      <path d="M0 -26 V-10" stroke="#8a6a4a" strokeWidth={1.6} />
      <ellipse cx={2} cy={6} rx={38} ry={11} fill="#3b2a1c" opacity={0.16} />
      <ellipse cx={0} cy={0} rx={36} ry={10} fill={`url(#${id}-straw)`} />
      <path d="M-16 -2 Q-16 -24 0 -24 Q16 -24 16 -2 Z" fill={`url(#${id}-straw)`} />
      <path d="M-16 -6 Q0 0 16 -6 L16 -2 Q0 4 -16 -2 Z" fill="#e57a8f" />
      <path
        d="M-30 1 Q0 9 30 1"
        fill="none"
        stroke="#a87a3e"
        strokeWidth={1.2}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      <path
        d="M-10 -20 Q-4 -23 4 -22"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        opacity={0.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function Tote({ x, y, colour }: { readonly x: number; readonly y: number; readonly colour: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(6)`}>
      <path d="M-12 0 Q-12 -22 0 -22 Q12 -22 12 0" fill="none" stroke={darken(colour, 0.3)} strokeWidth={3} />
      <path d="M-22 0 H22 L18 46 Q0 50 -18 46 Z" fill={colour} />
      <path d="M-22 0 H22 L21 9 H-21 Z" fill={darken(colour, 0.18)} />
      <path d="M2 0 L-2 47" stroke={lighten(colour, 0.3)} strokeWidth={6} opacity={0.35} />
      <path d="M-8 24 c-5 -7 4 -12 8 -5 c4 -7 13 -2 8 5 l-8 8 Z" fill="#fff4e2" opacity={0.9} />
      <path d="M8 2 L6 46" stroke={darken(colour, 0.25)} strokeWidth={1} opacity={0.5} />
    </g>
  );
}

function Scarf({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 0 Q-14 30 -8 70 L4 72 Q2 34 8 0 Z" fill="#7b7fd1" />
      <path d="M-6 0 Q-14 30 -8 70 L-3 70 Q-8 34 -1 0 Z" fill="#ffffff" opacity={0.2} />
      {[12, 26, 40, 54].map((stripe) => (
        <path key={stripe} d={`M-11 ${stripe} L6 ${stripe + 2}`} stroke="#f6d36b" strokeWidth={3} />
      ))}
      <path
        d="M-8 70 l-1 8 M-4 71 l0 8 M0 71 l1 8 M4 72 l2 7"
        stroke="#7b7fd1"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path d="M8 0 Q22 18 18 46 L10 44 Q12 20 2 2 Z" fill={darken("#7b7fd1", 0.22)} />
    </g>
  );
}

function Basket({ id, x, y }: { readonly id: string; readonly x: number; readonly y: number }) {
  const rolls = ["#e57a8f", "#8fcfb2", "#f6d36b", "#7b7fd1"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={6} cy={4} rx={62} ry={10} fill="#3b2a1c" opacity={0.28} />
      {rolls.map((colour, index) => (
        <g
          key={colour}
          transform={`translate(${-34 + index * 22} ${-52 - (index % 2) * 10}) rotate(${-14 + index * 9})`}
        >
          <rect x={-9} y={-30} width={18} height={56} rx={9} fill={colour} />
          <rect x={-9} y={-30} width={6} height={56} rx={3} fill={lighten(colour, 0.35)} opacity={0.6} />
          <ellipse cx={0} cy={-30} rx={9} ry={4} fill={lighten(colour, 0.2)} />
        </g>
      ))}
      <path d="M-52 -46 H52 L44 0 H-44 Z" fill={`url(#${id}-wicker)`} />
      {[-36, -24, -12, 0, 12, 24, 36].map((weave) => (
        <path
          key={weave}
          d={`M${weave} -46 L${weave * 0.85} 0`}
          stroke="#7a5228"
          strokeWidth={1.4}
          opacity={0.45}
        />
      ))}
      {[-34, -20, -6].map((row) => (
        <path
          key={row}
          d={`M${-50 + (row + 46) * 0.17} ${row} H${50 - (row + 46) * 0.17}`}
          stroke="#f2cf98"
          strokeWidth={1.4}
          opacity={0.6}
        />
      ))}
      <path d="M-54 -48 H54" stroke="#b4834a" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

function Plant({ id, x, y }: { readonly id: string; readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={4} cy={2} rx={34} ry={7} fill="#3b2a1c" opacity={0.28} />
      {[
        "M0 -40 Q-30 -70 -40 -104 Q-14 -86 0 -40",
        "M0 -40 Q-6 -90 6 -122 Q18 -84 0 -40",
        "M0 -40 Q26 -66 44 -94 Q20 -86 0 -40",
        "M0 -40 Q-36 -50 -54 -66 Q-24 -70 0 -40",
        "M0 -40 Q34 -46 52 -58 Q26 -64 0 -40",
      ].map((leaf, index) => (
        <path key={leaf} d={leaf} fill={index % 2 === 0 ? "#5f9a62" : "#7fb878"} />
      ))}
      <path d="M0 -40 Q-6 -90 6 -122" fill="none" stroke="#3f6e44" strokeWidth={1.4} opacity={0.6} />
      <path d="M-26 -42 H26 L20 0 H-20 Z" fill={`url(#${id}-pot)`} />
      <path d="M-28 -46 H28 V-38 H-28 Z" fill="#d98a5e" />
      <path d="M-22 -30 Q0 -26 22 -30" fill="none" stroke="#fff4e2" strokeWidth={2} opacity={0.4} />
    </g>
  );
}

function Dressing({ id, left, right, top, rail, floor }: StallDressingProps) {
  return (
    <g className="tf-stall-dressing">
      <FairyLights id={id} left={left - 14} right={right + 14} y={top} />
      <StrawHat id={id} x={left - 2} y={rail + 30} />
      <Tote x={right + 2} y={rail + 30} colour="#8fcfb2" />
      <Scarf x={left + 22} y={rail} />
      <Basket id={id} x={left - 58} y={floor + 2} />
      <Plant id={id} x={right + 26} y={floor + 6} />
    </g>
  );
}

export const StallDressing = memo(Dressing);
