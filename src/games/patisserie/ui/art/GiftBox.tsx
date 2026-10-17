import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface GiftBoxProps {
  readonly ribbon: string;
  readonly children: ReactNode;
}

const CONFETTI = ["#f4a259", "#4b5aa6", "#a9c98b", "#e2b93b", "#e88aa3", "#9fd0ee"];
const RESTING: readonly [number, number, number, number][] = [
  [40, 120, 20, 1],
  [70, 60, -30, 0.8],
  [352, 96, 40, 1.1],
  [372, 168, -15, 0.9],
  [28, 230, 60, 1],
  [384, 238, 10, 0.8],
  [130, 30, -50, 1.2],
  [290, 40, 30, 0.9],
  [20, 176, -70, 0.7],
  [96, 104, 80, 0.9],
  [320, 60, -20, 0.7],
  [250, 18, 45, 1],
  [176, 54, 15, 0.8],
  [388, 300, 70, 1],
  [16, 300, -40, 0.9],
  [60, 340, 25, 0.8],
  [112, 12, 20, 0.9],
  [200, 6, -35, 1],
  [312, 10, 55, 0.8],
  [364, 60, -10, 1.1],
  [8, 80, 35, 0.9],
  [392, 150, -55, 0.9],
  [44, 196, 15, 1.1],
  [362, 270, -30, 1],
  [150, 40, 70, 0.7],
  [232, 44, -60, 0.8],
  [10, 360, 50, 1],
  [392, 360, -20, 0.9],
];
const DOTS: readonly [number, number, number][] = [
  [56, 84, 4],
  [338, 132, 5],
  [214, 36, 3.5],
  [30, 266, 4.5],
  [368, 210, 3.5],
  [110, 160, 3],
  [300, 104, 3],
];
const CURLS: readonly [number, number, number][] = [
  [86, 30, 0],
  [340, 30, 40],
  [24, 140, -20],
  [376, 128, 160],
  [160, 4, 10],
  [256, 0, -15],
  [8, 330, -30],
  [364, 334, 200],
];
const TWINKLES: readonly [number, number, number][] = [
  [84, 150, 1.2],
  [326, 132, 1],
  [200, 30, 0.9],
  [56, 300, 0.8],
  [352, 312, 1.1],
  [150, 80, 0.6],
  [262, 70, 0.7],
  [24, 40, 1.1],
  [380, 30, 1],
  [394, 196, 0.8],
  [10, 214, 0.9],
];

function Twinkle({ x, y, scale }: { readonly x: number; readonly y: number; readonly scale: number }) {
  return (
    <path
      className="pa-gift__twinkle"
      d="M0 -14 Q2 -2 14 0 Q2 2 0 14 Q-2 2 -14 0 Q-2 -2 0 -14 Z"
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="#ffe08a"
      stroke="#ffffff"
      strokeWidth={1.5}
    />
  );
}

function Confetti() {
  return (
    <g>
      {RESTING.map(([x, y, angle, scale], index) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
          <rect x={-7} y={-3.5} width={14} height={7} rx={2} fill={CONFETTI[index % CONFETTI.length]} />
          <rect x={-7} y={-3.5} width={14} height={2.5} rx={1.2} fill="#ffffff" opacity={0.45} />
        </g>
      ))}
      {DOTS.map(([x, y, r], index) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={CONFETTI[(index + 2) % CONFETTI.length]} />
      ))}
      {CURLS.map(([x, y, angle], index) => (
        <path
          key={`${x}-${y}`}
          d="M0 0 q6 -10 12 0 t12 0 t12 0"
          transform={`translate(${x} ${y}) rotate(${angle})`}
          fill="none"
          stroke={CONFETTI[(index + 4) % CONFETTI.length]}
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export function GiftBox({ ribbon, children }: GiftBoxProps) {
  const id = useSvgId("gift");
  const deep = darken(ribbon, 0.2);
  return (
    <div className="pa-gift">
      <div className="pa-gift__burst" aria-hidden="true" />
      <svg viewBox="0 0 400 400" className="pa-gift__back" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-inside`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c99f6a" />
            <stop offset="1" stopColor="#ecd0a2" />
          </linearGradient>
        </defs>
        <path d="M104 272 H356 L316 302 H64 Z" fill={`url(#${id}-inside)`} />
        <path d="M104 272 H356 L350 278 H110 Z" fill="#3b2620" opacity={0.12} />
      </svg>
      <div className="pa-gift__bake">{children}</div>
      <svg viewBox="0 0 400 400" className="pa-gift__box" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="1" stopColor="#f2dbb6" />
          </linearGradient>
          <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e6c99a" />
            <stop offset="1" stopColor="#d3b07c" />
          </linearGradient>
        </defs>
        <ellipse cx={212} cy={392} rx={176} ry={10} fill="#3b2620" opacity={0.18} />
        <path
          d="M316 302 L356 272 V362 L316 388 Z"
          fill={`url(#${id}-side)`}
          stroke="#d2ad78"
          strokeWidth={2}
        />
        <path d="M64 302 H316 V388 H64 Z" fill={`url(#${id}-front)`} stroke="#e2c08e" strokeWidth={3} />
        <path d="M66 304 H314" stroke="#ffffff" strokeWidth={3} opacity={0.8} />
        <path d="M64 302 H316 L356 272" fill="none" stroke="#d9b47c" strokeWidth={3} strokeLinejoin="round" />
        <rect x={176} y={302} width={28} height={86} fill={ribbon} />
        <rect x={176} y={302} width={8} height={86} fill={lighten(ribbon, 0.35)} opacity={0.6} />
        <path d="M330 292 L342 283 V371 L330 379 Z" fill={deep} />
        <path d="M64 352 H316" stroke={ribbon} strokeWidth={14} opacity={0.9} />
        <path d="M316 352 L356 326" stroke={deep} strokeWidth={14} />
        <g transform="translate(110 372)">
          <path d="M0 -12 A12 12 0 1 0 8 9 A9 9 0 1 1 0 -12 Z" fill="#e2b93b" />
          <path
            d="M10 -12 l1.5 3.2 3.5 0.5 -2.5 2.4 0.6 3.5 -3.1 -1.7 -3.1 1.7 0.6 -3.5 -2.5 -2.4 3.5 -0.5 Z"
            fill="#4b5aa6"
          />
        </g>
        <g transform="translate(190 352)">
          <path
            d="M0 0 C-44 -40 -70 4 -4 6 Z M0 0 C44 -40 70 4 4 6 Z"
            fill={ribbon}
            stroke={deep}
            strokeWidth={2}
          />
          <path d="M-4 4 L-22 34 M4 4 L22 34" stroke={ribbon} strokeWidth={9} strokeLinecap="round" />
          <circle cx={0} cy={2} r={9} fill={deep} />
        </g>
      </svg>
      <svg viewBox="0 0 400 400" className="pa-gift__sparkles" aria-hidden="true" focusable="false">
        <Confetti />
        {TWINKLES.map(([x, y, scale]) => (
          <Twinkle key={`${x}-${y}`} x={x} y={y} scale={scale} />
        ))}
      </svg>
      <svg viewBox="0 0 400 200" className="pa-gift__lid" aria-hidden="true" focusable="false">
        <rect x={54} y={120} width={312} height={52} rx={6} fill="#fffaf0" stroke="#e2c08e" strokeWidth={3} />
        <rect x={196} y={120} width={28} height={52} fill={ribbon} />
        <path d="M210 120 C160 60 120 110 206 122 Z M210 120 C260 60 300 110 214 122 Z" fill={ribbon} />
        <circle cx={210} cy={120} r={12} fill={ribbon} />
      </svg>
      <div className="pa-gift__confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={index}
            style={{
              background: CONFETTI[index % CONFETTI.length],
              left: `${10 + ((index * 37) % 80)}%`,
              animationDelay: `${0.4 + (index % 6) * 0.08}s`,
              transform: `rotate(${index * 40}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
