import type { ReactNode } from "react";
import type { ToppingId } from "../../content/topping";

export const TOPPING_EXTENT = 40;

const SPRINKLE_COLOURS = ["#e04f5f", "#4b5aa6", "#f4a259", "#6f9152", "#e2b93b", "#b98be0"];

function sprinkles(): ReactNode {
  const bits: [number, number, number][] = [
    [-12, -6, 20],
    [-4, -12, -40],
    [6, -7, 70],
    [12, 3, 10],
    [-8, 6, -70],
    [2, 10, 35],
    [-14, 2, 80],
    [10, -14, -15],
    [-2, -1, 55],
  ];
  return (
    <g>
      {bits.map(([x, y, angle], index) => (
        <rect
          key={index}
          x={x - 4}
          y={y - 1.6}
          width={8}
          height={3.2}
          rx={1.6}
          fill={SPRINKLE_COLOURS[index % SPRINKLE_COLOURS.length]}
          transform={`rotate(${angle} ${x} ${y})`}
        />
      ))}
    </g>
  );
}

function sugarRose(): ReactNode {
  return (
    <g>
      <path d="M-14 8 Q-20 -2 -10 -4 Q-4 4 -14 8 Z M14 8 Q20 -2 10 -4 Q4 4 14 8 Z" fill="#7fa87a" />
      <circle r={13} fill="#e88aa3" />
      <path d="M-10 2 Q-4 -12 8 -6 Q12 4 0 8 Q-8 8 -10 2 Z" fill="#f3aec0" />
      <path d="M-5 0 Q0 -8 6 -3 Q6 3 0 4 Q-4 4 -5 0 Z" fill="#d76585" />
      <path d="M-2 -1 Q1 -4 3 -1" stroke="#b84a6b" strokeWidth={1.2} fill="none" />
    </g>
  );
}

function berry(): ReactNode {
  return (
    <g>
      <circle cx={-5} cy={3} r={9} fill="#b0213f" />
      <circle cx={6} cy={1} r={8} fill="#3d3f8f" />
      <circle cx={8} cy={-1} r={1.6} fill="#ffffff" opacity={0.6} />
      <circle cx={-8} cy={0} r={1.8} fill="#ffffff" opacity={0.6} />
      <path d="M-5 -6 L-3 -11 M-5 -6 L-9 -9" stroke="#557a3a" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function candle(): ReactNode {
  return (
    <g>
      <rect x={-4} y={-18} width={8} height={34} rx={3} fill="#4b5aa6" />
      <path d="M-4 -12 L4 -8 M-4 -4 L4 0 M-4 4 L4 8" stroke="#fff1cf" strokeWidth={2.4} />
      <rect x={-0.8} y={-23} width={1.6} height={6} fill="#3b2620" />
      <ellipse cx={0} cy={16} rx={7} ry={2.4} fill="#3b2620" opacity={0.2} />
    </g>
  );
}

function chocCurls(): ReactNode {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M-14 6 Q-12 -8 -2 -6 Q6 -4 2 4" stroke="#5a3324" strokeWidth={5} />
      <path d="M-2 10 Q4 -2 12 0 Q18 4 10 10" stroke="#7b4a35" strokeWidth={4.6} />
      <path d="M-12 4 Q-10 -5 -3 -4" stroke="#a46f55" strokeWidth={1.2} />
    </g>
  );
}

function pearls(): ReactNode {
  const spots: [number, number, number][] = [
    [-10, -4, 5],
    [0, -9, 4.5],
    [10, -3, 5],
    [-4, 6, 5.5],
    [8, 9, 4],
  ];
  return (
    <g>
      {spots.map(([x, y, r], index) => (
        <g key={index}>
          <circle cx={x} cy={y} r={r} fill="#f4efe6" stroke="#cfc4b0" strokeWidth={0.8} />
          <circle cx={x - r / 3} cy={y - r / 3} r={r / 3} fill="#ffffff" />
        </g>
      ))}
    </g>
  );
}

function butterfly(): ReactNode {
  return (
    <g>
      <path
        d="M0 0 C-6 -18 -22 -16 -18 -4 C-16 2 -8 2 0 0 Z"
        fill="#c9b6ea"
        stroke="#8f78c2"
        strokeWidth={1}
      />
      <path d="M0 0 C6 -18 22 -16 18 -4 C16 2 8 2 0 0 Z" fill="#c9b6ea" stroke="#8f78c2" strokeWidth={1} />
      <path d="M0 2 C-4 12 -16 14 -14 6 C-12 2 -6 2 0 2 Z" fill="#e3d8f6" stroke="#8f78c2" strokeWidth={1} />
      <path d="M0 2 C4 12 16 14 14 6 C12 2 6 2 0 2 Z" fill="#e3d8f6" stroke="#8f78c2" strokeWidth={1} />
      <path d="M-10 -8 h4 M-12 -4 h4 M6 -8 h4 M8 -4 h4" stroke="#f6efff" strokeWidth={1.2} />
      <rect x={-1.6} y={-8} width={3.2} height={14} rx={1.6} fill="#c79a5b" />
    </g>
  );
}

function goldStar(): ReactNode {
  return (
    <g>
      <path
        d="M0 -16 L4.7 -6.5 15.2 -4.9 7.6 2.4 9.4 12.9 0 7.9 -9.4 12.9 -7.6 2.4 -15.2 -4.9 -4.7 -6.5 Z"
        fill="#e2b93b"
        stroke="#a8841a"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path d="M0 -10 L2.6 -4.4 M-5 -3.5 L-1 -1" stroke="#fff3c4" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

function teamBall(): ReactNode {
  return (
    <g>
      <circle r={14} fill="#fbfbf8" stroke="#3b2620" strokeWidth={1.2} />
      <path d="M0 -6 L5.7 -1.9 3.5 4.9 -3.5 4.9 -5.7 -1.9 Z" fill="#2c2a30" />
      <path
        d="M0 -6 L0 -14 M5.7 -1.9 L13 -4.5 M3.5 4.9 L8 11 M-3.5 4.9 L-8 11 M-5.7 -1.9 L-13 -4.5"
        stroke="#2c2a30"
        strokeWidth={1.2}
      />
      <circle cx={-5} cy={-8} r={2.4} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

const ART: Readonly<Record<ToppingId, () => ReactNode>> = {
  sprinkles,
  "sugar-rose": sugarRose,
  "fresh-berries": berry,
  "party-candle": candle,
  "choc-curls": chocCurls,
  "sugar-pearls": pearls,
  "wafer-butterfly": butterfly,
  "gold-star": goldStar,
  "team-ball": teamBall,
};

export interface ToppingArtProps {
  readonly toppingId: ToppingId;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly selected?: boolean | undefined;
}

export function ToppingArt({ toppingId, x, y, rotation, scale, selected = false }: ToppingArtProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      {selected ? (
        <circle
          r={TOPPING_EXTENT / 2 + 4}
          fill="none"
          stroke="#4b5aa6"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      ) : null}
      {ART[toppingId]()}
    </g>
  );
}

export interface ToppingBadgeProps {
  readonly toppingId: ToppingId;
  readonly size: number;
}

export function ToppingBadge({ toppingId, size }: ToppingBadgeProps) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" aria-hidden="true" focusable="false">
      {ART[toppingId]()}
    </svg>
  );
}
