import type { ReactNode } from "react";

export type FairToppingId =
  | "candied-orange"
  | "sugar-shimmer"
  | "mint-leaf"
  | "sugar-daisy"
  | "wafer-fan"
  | "marzipan-bee"
  | "choc-sail"
  | "sugar-snowflake"
  | "toffee-shard";

function candiedOrange(): ReactNode {
  const segments = [-150, -120, -90, -60, -30];
  return (
    <g>
      <path d="M-16 4 A16 16 0 0 1 16 4 Z" fill="#f39a2e" stroke="#c86a24" strokeWidth={1.4} />
      <path d="M-12.5 4 A12.5 12.5 0 0 1 12.5 4 Z" fill="#ffc46b" />
      {segments.map((angle) => (
        <path
          key={angle}
          d={`M0 4 L${(12 * Math.cos((angle * Math.PI) / 180)).toFixed(1)} ${(4 + 12 * Math.sin((angle * Math.PI) / 180)).toFixed(1)}`}
          stroke="#fff4dd"
          strokeWidth={1.4}
        />
      ))}
      <circle cx={-6} cy={-3} r={1} fill="#ffffff" />
      <circle cx={5} cy={-5} r={1.2} fill="#ffffff" />
      <circle cx={1} cy={-1} r={0.8} fill="#ffffff" />
    </g>
  );
}

function sparkle(x: number, y: number, size: number, fill: string): ReactNode {
  const s = size;
  return (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`}
      fill={fill}
    />
  );
}

function sugarShimmer(): ReactNode {
  return (
    <g>
      {sparkle(-8, -6, 7, "#f2d36b")}
      {sparkle(7, -9, 5, "#e8dcff")}
      {sparkle(9, 6, 6.5, "#fff6cf")}
      {sparkle(-6, 9, 4.5, "#d7c4f2")}
      {sparkle(0, 0, 3.5, "#ffffff")}
      <circle cx={-13} cy={3} r={1.2} fill="#f2d36b" />
      <circle cx={14} cy={-2} r={1} fill="#ffffff" />
      <circle cx={3} cy={13} r={1.1} fill="#f2d36b" />
    </g>
  );
}

function mintLeaf(): ReactNode {
  return (
    <g>
      <path
        d="M-15 10 C-12 -10 6 -16 15 -12 C14 0 2 14 -15 10 Z"
        fill="#6fb27a"
        stroke="#3f7a4b"
        strokeWidth={1.2}
      />
      <path
        d="M-13 9 C-4 1 4 -5 13 -11"
        stroke="#d7f0d6"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-6 3 l-1 -6 M0 -1 l-1 -6 M5 -5 l0 -5 M-3 1 l6 2 M3 -3 l5 2"
        stroke="#b7e2b8"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </g>
  );
}

function sugarDaisy(): ReactNode {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g>
      {petals.map((angle) => (
        <ellipse
          key={angle}
          cx={0}
          cy={-9}
          rx={4.2}
          ry={8}
          fill="#ffffff"
          stroke="#e3ddd0"
          strokeWidth={0.8}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={6} fill="#f6c63d" stroke="#d99a1b" strokeWidth={1} />
      <circle cx={-2} cy={-2} r={1.6} fill="#fff1b0" />
    </g>
  );
}

function waferFan(): ReactNode {
  const ribs = [-60, -40, -20, 0, 20, 40, 60];
  return (
    <g>
      <path
        d="M0 12 L-15 -8 Q0 -18 15 -8 Z"
        fill="#e8c98f"
        stroke="#b98a4a"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {ribs.map((angle) => (
        <path
          key={angle}
          d={`M0 12 L${(17 * Math.sin((angle * Math.PI) / 180)).toFixed(1)} ${(12 - 22 * Math.cos((angle * Math.PI) / 180)).toFixed(1)}`}
          stroke="#c99e5e"
          strokeWidth={1}
        />
      ))}
      <path d="M-13 -7 Q0 -15 13 -7" stroke="#fff3d9" strokeWidth={1.4} fill="none" />
    </g>
  );
}

function marzipanBee(): ReactNode {
  return (
    <g>
      <ellipse
        cx={-5}
        cy={-9}
        rx={6}
        ry={8}
        fill="#eaf6ff"
        stroke="#9fc4e0"
        strokeWidth={1}
        transform="rotate(-25 -5 -9)"
      />
      <ellipse
        cx={5}
        cy={-9}
        rx={6}
        ry={8}
        fill="#eaf6ff"
        stroke="#9fc4e0"
        strokeWidth={1}
        transform="rotate(25 5 -9)"
      />
      <ellipse rx={13} ry={9} fill="#f6c63d" stroke="#b98a1b" strokeWidth={1.2} />
      <path d="M-4 -8.5 Q-6 0 -4 8.5 M3 -8.8 Q1 0 3 8.8" stroke="#3b2620" strokeWidth={3.4} fill="none" />
      <circle cx={9} cy={-2} r={1.4} fill="#3b2620" />
      <path d="M7 3 Q9 5 11 3" stroke="#3b2620" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <circle cx={10} cy={1.4} r={1.2} fill="#f29bb0" opacity={0.8} />
    </g>
  );
}

function chocSail(): ReactNode {
  return (
    <g>
      <path
        d="M-12 12 Q-10 -6 6 -16 Q2 0 14 12 Z"
        fill="#5a3324"
        stroke="#3b2018"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path d="M-7 8 Q-5 -3 4 -10" stroke="#a46f55" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <ellipse cx={1} cy={12} rx={13} ry={2.4} fill="#3b2620" opacity={0.2} />
    </g>
  );
}

function sugarSnowflake(): ReactNode {
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <g stroke="#9fc9ea" strokeLinecap="round" fill="none">
      {arms.map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path d="M0 0 V-15" strokeWidth={3.2} stroke="#ffffff" />
          <path d="M0 0 V-15" strokeWidth={1.2} />
          <path d="M0 -9 l-4 -4 M0 -9 l4 -4" strokeWidth={1.6} />
        </g>
      ))}
      <circle r={3} fill="#ffffff" stroke="#9fc9ea" strokeWidth={1.2} />
    </g>
  );
}

function toffeeShard(): ReactNode {
  return (
    <g>
      <path
        d="M-13 9 L-6 -14 L5 -10 L14 6 L1 14 Z"
        fill="#d9944a"
        stroke="#9c5a2c"
        strokeWidth={1.2}
        strokeLinejoin="round"
        opacity={0.95}
      />
      <path d="M-6 -14 L-1 4 L14 6 M-1 4 L1 14" stroke="#b87534" strokeWidth={1} fill="none" />
      <path d="M-8 4 L-4 -9" stroke="#ffe2b3" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export const FAIR_TOPPING_ART: Readonly<Record<FairToppingId, () => ReactNode>> = {
  "candied-orange": candiedOrange,
  "sugar-shimmer": sugarShimmer,
  "mint-leaf": mintLeaf,
  "sugar-daisy": sugarDaisy,
  "wafer-fan": waferFan,
  "marzipan-bee": marzipanBee,
  "choc-sail": chocSail,
  "sugar-snowflake": sugarSnowflake,
  "toffee-shard": toffeeShard,
};
