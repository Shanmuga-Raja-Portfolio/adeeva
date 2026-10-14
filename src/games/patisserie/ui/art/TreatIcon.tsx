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
      <path d="M-18 2 L-13 22 H13 L18 2 Z" fill="#f4a259" stroke="#c86a24" strokeWidth={1.2} />
      <path d="M-10 4 L-8 21 M0 4 V21 M10 4 L8 21" stroke="#c86a24" strokeWidth={1} />
      <path
        d="M-20 4 Q-22 -10 -8 -12 Q0 -24 8 -12 Q22 -10 20 4 Z"
        fill={colour}
        stroke={darken(colour, 0.2)}
        strokeWidth={1.2}
      />
      <path
        d="M-10 -4 Q0 -10 10 -4"
        stroke={lighten(colour, 0.5)}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function biscuit(colour: string): ReactNode {
  return (
    <g>
      <circle r={22} fill="#efcf8e" stroke="#b98a4a" strokeWidth={1.4} />
      <circle r={17} fill={lighten(colour, 0.55)} stroke={colour} strokeWidth={4} />
      <circle cx={-6} cy={-6} r={3} fill="#ffffff" opacity={0.6} />
    </g>
  );
}

function petitFour(colour: string): ReactNode {
  return (
    <g>
      <path
        d="M-18 -8 L0 -16 L18 -8 L18 14 L0 22 L-18 14 Z"
        fill={darken(colour, 0.08)}
        stroke={darken(colour, 0.3)}
        strokeWidth={1.2}
      />
      <path
        d="M-18 -8 L0 -16 L18 -8 L0 0 Z"
        fill={lighten(colour, 0.18)}
        stroke={darken(colour, 0.22)}
        strokeWidth={1}
      />
      <path d="M0 0 V22" stroke={darken(colour, 0.2)} strokeWidth={1} />
      <circle cx={0} cy={-8} r={3} fill="#fbf3e2" stroke={darken(colour, 0.2)} strokeWidth={0.8} />
    </g>
  );
}

function tartlet(colour: string): ReactNode {
  return (
    <g>
      <path d="M-22 -2 L-17 16 Q0 22 17 16 L22 -2 Z" fill="#e9c27f" stroke="#a9772f" strokeWidth={1.2} />
      <ellipse cx={0} cy={-2} rx={22} ry={8} fill="#f3d79f" stroke="#a9772f" strokeWidth={1} />
      <ellipse cx={0} cy={-1} rx={18} ry={5.5} fill={lighten(colour, 0.35)} />
      <circle cx={-7} cy={-2} r={3} fill={colour} />
      <circle cx={3} cy={-3} r={3} fill={colour} />
      <circle cx={10} cy={0} r={2.4} fill={colour} />
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
      <circle r={21} fill="#f6dfa6" stroke={colour} strokeWidth={4} />
      <path d={spiral} fill="none" stroke={darken(colour, 0.05)} strokeWidth={3} strokeLinecap="round" />
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
