import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { CounterProductId } from "../../content/product";

export interface TreatIconProps {
  readonly productId: CounterProductId;
  readonly colour: string;
  readonly size: number;
}

function cupcake(colour: string): ReactNode {
  return (
    <g>
      <ellipse cx={0} cy={22} rx={14} ry={3} fill="#3b2620" opacity={0.18} />
      <path d="M-18 2 L-13 22 H13 L18 2 Z" fill="#f4a259" stroke="#c86a24" strokeWidth={1.2} />
      <path d="M6 2 L18 2 L13 22 H4 Z" fill="#c86a24" opacity={0.28} />
      <path d="M-10 4 L-8 21 M0 4 V21 M10 4 L8 21" stroke="#c86a24" strokeWidth={1} />
      <path
        d="M-20 4 Q-22 -10 -8 -12 Q0 -24 8 -12 Q22 -10 20 4 Z"
        fill={colour}
        stroke={darken(colour, 0.2)}
        strokeWidth={1.2}
      />
      <path d="M4 -14 Q20 -10 20 4 L4 4 Q12 -4 4 -14 Z" fill={darken(colour, 0.14)} opacity={0.55} />
      <path
        d="M-14 -4 Q-6 -12 2 -8"
        stroke={lighten(colour, 0.6)}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={2} cy={-19} r={4.4} fill="#c0304f" />
      <circle cx={0.8} cy={-20.4} r={1.4} fill="#ffffff" opacity={0.8} />
    </g>
  );
}

function biscuit(colour: string): ReactNode {
  return (
    <g>
      <circle cx={0} cy={3} r={22} fill="#b98a4a" />
      <circle r={22} fill="#efcf8e" stroke="#b98a4a" strokeWidth={1.4} />
      <circle r={17} fill={lighten(colour, 0.5)} stroke={colour} strokeWidth={4} />
      <path d="M8 -12 A15 15 0 0 1 4 15 A17 17 0 0 0 8 -12 Z" fill={darken(colour, 0.12)} opacity={0.4} />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <circle
          key={angle}
          cx={10 * Math.cos((angle * Math.PI) / 180)}
          cy={10 * Math.sin((angle * Math.PI) / 180)}
          r={1.8}
          fill={colour}
        />
      ))}
      <path
        d="M-12 -6 A13 13 0 0 1 -4 -13"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
    </g>
  );
}

function petitFour(colour: string): ReactNode {
  return (
    <g>
      <ellipse cx={0} cy={22} rx={18} ry={3} fill="#3b2620" opacity={0.16} />
      <path
        d="M-18 -8 L0 -16 L18 -8 L18 14 L0 22 L-18 14 Z"
        fill={darken(colour, 0.08)}
        stroke={darken(colour, 0.3)}
        strokeWidth={1.2}
      />
      <path d="M0 0 L18 -8 L18 14 L0 22 Z" fill={darken(colour, 0.2)} />
      <path d="M-18 4 L0 12 L18 4" fill="none" stroke="#fbf3e2" strokeWidth={2} opacity={0.75} />
      <path
        d="M-18 -8 L0 -16 L18 -8 L0 0 Z"
        fill={lighten(colour, 0.22)}
        stroke={darken(colour, 0.22)}
        strokeWidth={1}
      />
      <path d="M-12 -8 L0 -13 L6 -10.5" stroke="#ffffff" strokeWidth={1.6} fill="none" opacity={0.6} />
      <path d="M0 0 V22" stroke={darken(colour, 0.25)} strokeWidth={1} />
      <circle cx={0} cy={-8} r={3.2} fill="#fbf3e2" stroke={darken(colour, 0.2)} strokeWidth={0.8} />
      <circle cx={-1} cy={-9} r={1} fill="#ffffff" />
    </g>
  );
}

function tartlet(colour: string): ReactNode {
  return (
    <g>
      <path d="M-22 -2 L-17 16 Q0 22 17 16 L22 -2 Z" fill="#e9c27f" stroke="#a9772f" strokeWidth={1.2} />
      <path d="M8 -2 L22 -2 L17 16 Q12 18 6 19 Z" fill="#a9772f" opacity={0.3} />
      <path d="M-14 0 L-11 16 M-5 1 L-4 19 M5 1 L4 19" stroke="#c99a52" strokeWidth={1} opacity={0.8} />
      <ellipse cx={0} cy={-2} rx={22} ry={8} fill="#f3d79f" stroke="#a9772f" strokeWidth={1} />
      <ellipse cx={0} cy={-1} rx={18} ry={5.5} fill={lighten(colour, 0.35)} />
      <circle cx={-7} cy={-2} r={3.4} fill={colour} stroke={darken(colour, 0.25)} strokeWidth={0.6} />
      <circle cx={3} cy={-3} r={3.4} fill={colour} stroke={darken(colour, 0.25)} strokeWidth={0.6} />
      <circle cx={10} cy={0} r={2.8} fill={colour} stroke={darken(colour, 0.25)} strokeWidth={0.6} />
      <circle cx={-8} cy={-3.2} r={1} fill="#ffffff" opacity={0.85} />
      <circle cx={2} cy={-4.2} r={1} fill="#ffffff" opacity={0.85} />
    </g>
  );
}

function rollSlice(colour: string): ReactNode {
  const spiral = Array.from({ length: 41 }, (_, index) => {
    const share = index / 40;
    const angle = share * 5 * Math.PI;
    const radius = 17 * share;
    return `${index === 0 ? "M" : "L"}${(radius * Math.cos(angle)).toFixed(1)} ${(radius * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <ellipse cx={3} cy={2} rx={21} ry={21} fill={darken(colour, 0.25)} />
      <circle r={21} fill="#f6dfa6" stroke={colour} strokeWidth={4} />
      <path d={spiral} fill="none" stroke={darken(colour, 0.05)} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M6 -16 A17 17 0 0 1 6 16 A19 19 0 0 0 6 -16 Z" fill="#c99a52" opacity={0.35} />
      <path
        d="M-15 -8 A17 17 0 0 1 -6 -16"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      {[
        [-9, 9],
        [10, -6],
        [4, 12],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.1} fill="#e2bd73" />
      ))}
    </g>
  );
}

const ICONS: Readonly<Record<CounterProductId, (colour: string) => ReactNode>> = {
  "cupcake-tray": cupcake,
  "iced-biscuits": biscuit,
  "petit-fours": petitFour,
  "tartlet-set": tartlet,
  "spiral-roll": rollSlice,
};

export function TreatIcon({ productId, colour, size }: TreatIconProps) {
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
      {ICONS[productId](colour)}
    </svg>
  );
}
