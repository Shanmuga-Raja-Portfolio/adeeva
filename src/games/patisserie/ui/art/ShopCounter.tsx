import { useSvgId } from "../../../../ui/art/useSvgId";

export interface ShopCounterProps {
  readonly className?: string | undefined;
}

const PANELS = Array.from({ length: 10 }, (_, index) => index * 124 + 14);
const SLICES: readonly [number, string, string][] = [
  [272, "#f2c4c9", "#fff4f6"],
  [316, "#f6df7c", "#fffaf0"],
  [360, "#b9a7dc", "#f7f3ff"],
  [404, "#a9c98b", "#f4faef"],
];
const MACARONS: readonly [number, string][] = [
  [276, "#f2c4c9"],
  [304, "#9fd0ee"],
  [332, "#f6df7c"],
  [360, "#b9a7dc"],
  [388, "#a9c98b"],
  [416, "#f4a259"],
];
const STEMS: readonly [number, number, string][] = [
  [-14, -46, "#f2c4c9"],
  [0, -58, "#f4a259"],
  [14, -48, "#fff1cf"],
  [-6, -36, "#b9a7dc"],
];

export function ShopCounter({ className }: ShopCounterProps) {
  const id = useSvgId("shop-counter");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 160"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6544" />
          <stop offset="1" stopColor="#5d3a2a" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9c9a2" />
          <stop offset="1" stopColor="#c99a6c" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.65} />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id={`${id}-cake`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f7d8e4" />
          <stop offset="0.3" stopColor="#fff0f5" />
          <stop offset="1" stopColor="#e9b3c3" />
        </linearGradient>
      </defs>
      <g>
        <ellipse cx={346} cy={74} rx={120} ry={6} fill="#3b2620" opacity={0.25} />
        <rect x={236} y={4} width={220} height={68} rx={8} fill="#fdf6ea" opacity={0.55} />
        <rect x={246} y={36} width={200} height={4} fill="#c9b48a" />
        {SLICES.map(([x, colour, cream]) => (
          <g key={x}>
            <path
              d={`M${x - 16} 34 L${x} 14 L${x + 16} 34 Z`}
              fill={colour}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <path d={`M${x - 10} 26 H${x + 10}`} stroke={cream} strokeWidth={3} />
          </g>
        ))}
        {MACARONS.map(([x, colour]) => (
          <g key={x}>
            <ellipse cx={x} cy={58} rx={11} ry={6} fill={colour} />
            <rect x={x - 10} y={56} width={20} height={4} fill="#fffaf0" />
            <ellipse cx={x} cy={52} rx={11} ry={5} fill={colour} />
            <ellipse cx={x - 4} cy={50} rx={4} ry={1.6} fill="#ffffff" opacity={0.6} />
          </g>
        ))}
        <rect x={236} y={4} width={220} height={68} rx={8} fill={`url(#${id}-glass)`} />
        <rect x={236} y={4} width={220} height={68} rx={8} fill="none" stroke="#8a5a42" strokeWidth={4} />
      </g>
      <g transform="translate(560 72)">
        <ellipse cx={0} cy={2} rx={54} ry={6} fill="#3b2620" opacity={0.22} />
        <path d="M-10 0 L-6 -16 H6 L10 0 Z" fill="#f3ece0" stroke="#cbbca6" />
        <ellipse cx={0} cy={-16} rx={46} ry={7} fill="#fbf8f2" stroke="#cbbca6" strokeWidth={1.4} />
        <path d="M-34 -18 V-52 A34 8 0 0 0 34 -52 V-18 A34 8 0 0 1 -34 -18 Z" fill={`url(#${id}-cake)`} />
        <ellipse cx={0} cy={-52} rx={34} ry={8} fill="#fff4f8" stroke="#e9b3c3" />
        <path
          d="M-34 -44 Q-28 -36 -22 -44 Q-16 -36 -10 -44 Q-4 -36 2 -44 Q8 -36 14 -44 Q20 -36 26 -44 Q30 -38 34 -44"
          fill="none"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {[-18, 0, 18].map((dx) => (
          <circle key={dx} cx={dx} cy={-56 - (dx === 0 ? 4 : 0)} r={5} fill="#b0213f" />
        ))}
        <path
          d="M-48 -16 V-70 Q-48 -104 0 -106 Q48 -104 48 -70 V-16"
          fill={`url(#${id}-dome)`}
          stroke="#ffffff"
          strokeOpacity={0.7}
          strokeWidth={2}
        />
        <circle cx={0} cy={-110} r={5} fill="#c9b48a" />
      </g>
      <g transform="translate(680 72)">
        <ellipse cx={0} cy={2} rx={22} ry={4} fill="#3b2620" opacity={0.22} />
        <path d="M-14 0 Q-18 -26 -10 -34 H10 Q18 -26 14 0 Z" fill="#c8d6ee" opacity={0.85} stroke="#8fa3c8" />
        {STEMS.map(([dx, dy, colour]) => (
          <g key={dx}>
            <path
              d={`M0 -30 Q${dx / 2} ${dy / 2} ${dx} ${dy}`}
              stroke="#6f9152"
              strokeWidth={2}
              fill="none"
            />
            <circle cx={dx} cy={dy} r={7} fill={colour} stroke="#ffffff" strokeWidth={1.4} />
            <circle cx={dx} cy={dy} r={2.4} fill="#e2b93b" />
          </g>
        ))}
      </g>
      <g transform="translate(760 72)">
        <ellipse cx={0} cy={2} rx={34} ry={5} fill="#3b2620" opacity={0.22} />
        <ellipse cx={0} cy={-2} rx={32} ry={6} fill="#ffffff" stroke="#d8cbb5" />
        <path d="M-20 -4 L-16 -18 H16 L20 -4 Z" fill="#f4a259" />
        <path d="M-22 -16 Q-24 -32 0 -36 Q24 -32 22 -16 Q0 -10 -22 -16 Z" fill="#f2c4c9" />
        <path d="M-12 -28 Q0 -42 12 -28 Q0 -24 -12 -28 Z" fill="#f7d8e4" />
        <circle cx={4} cy={-40} r={4} fill="#b0213f" />
      </g>
      <g transform="translate(78 72)">
        <ellipse cx={0} cy={2} rx={52} ry={5} fill="#3b2620" opacity={0.22} />
        <path
          d="M-58 -30 Q-30 -54 18 -40"
          stroke="#e2b46e"
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M-50 -34 Q-28 -50 10 -42"
          stroke="#f6d79c"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M-40 -30 L-34 -42 M-24 -38 L-18 -48 M-8 -42 L-2 -50" stroke="#b98a4a" strokeWidth={2} />
        <path
          d="M-10 -26 Q26 -62 56 -34"
          stroke="#d9a25c"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M-2 -32 Q24 -54 48 -36" stroke="#f6d79c" strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M-46 -26 H46 L38 0 H-38 Z" fill="#c98a4b" stroke="#8e5a2e" strokeWidth={2} />
        {[-30, -14, 2, 18, 34].map((dx) => (
          <path key={dx} d={`M${dx} -24 L${dx * 0.85} -2`} stroke="#8e5a2e" strokeWidth={1.6} opacity={0.7} />
        ))}
        <path d="M-46 -26 H46" stroke="#e8b47a" strokeWidth={4} strokeLinecap="round" />
        <path d="M-40 -14 H40" stroke="#8e5a2e" strokeWidth={1.4} opacity={0.6} />
      </g>
      <g transform="translate(488 72)">
        <ellipse cx={0} cy={2} rx={22} ry={4} fill="#3b2620" opacity={0.22} />
        <path
          d="M-18 0 Q-22 -26 -16 -40 H16 Q22 -26 18 0 Z"
          fill="#fdf6ea"
          opacity={0.55}
          stroke="#ffffff"
          strokeWidth={1.6}
        />
        {[
          [-8, -10, "#c98a4b"],
          [7, -12, "#b07440"],
          [-2, -24, "#d9a25c"],
          [9, -28, "#c98a4b"],
          [-10, -30, "#b07440"],
        ].map(([dx, dy, colour]) => (
          <g key={`${dx}-${dy}`}>
            <circle cx={Number(dx)} cy={Number(dy)} r={7} fill={String(colour)} />
            <circle cx={Number(dx) - 2} cy={Number(dy) - 1} r={1.4} fill="#4a2c20" />
            <circle cx={Number(dx) + 2} cy={Number(dy) + 2} r={1.2} fill="#4a2c20" />
          </g>
        ))}
        <path
          d="M-12 -34 Q-14 -18 -10 -4"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.7}
          fill="none"
        />
        <rect x={-18} y={-48} width={36} height={8} rx={3} fill="#f4a259" />
        <circle cx={0} cy={-52} r={5} fill="#c86a24" />
      </g>
      <g transform="translate(872 72)">
        <ellipse cx={0} cy={2} rx={46} ry={5} fill="#3b2620" opacity={0.22} />
        <path d="M0 0 V-74" stroke="#c9b48a" strokeWidth={3} />
        <ellipse cx={0} cy={-2} rx={44} ry={6} fill="#fbf8f2" stroke="#cbbca6" />
        <ellipse cx={0} cy={-44} rx={30} ry={5} fill="#fbf8f2" stroke="#cbbca6" />
        {[
          [-28, -4, "#f2c4c9"],
          [0, -4, "#9fd0ee"],
          [28, -4, "#b9a7dc"],
          [-14, -46, "#f6df7c"],
          [14, -46, "#a9c98b"],
        ].map(([dx, dy, colour]) => (
          <g key={`${dx}-${dy}`} transform={`translate(${dx} ${dy})`}>
            <path d="M-10 0 L-8 -12 H8 L10 0 Z" fill="#f4a259" />
            <path d="M-11 -11 Q-12 -22 0 -24 Q12 -22 11 -11 Z" fill={String(colour)} />
            <circle cx={-3} cy={-18} r={2.4} fill="#ffffff" opacity={0.7} />
          </g>
        ))}
        <circle cx={0} cy={-78} r={4} fill="#c9b48a" />
      </g>
      <rect x={0} y={66} width={1200} height={14} rx={3} fill={`url(#${id}-top)`} />
      <rect x={0} y={67} width={1200} height={3} fill="#ffffff" opacity={0.45} />
      <rect x={0} y={78} width={1200} height={6} fill="#3b2620" opacity={0.2} />
      <rect x={0} y={80} width={1200} height={80} fill={`url(#${id}-front)`} />
      {PANELS.map((x) => (
        <rect
          key={x}
          x={x}
          y={94}
          width={100}
          height={52}
          rx={6}
          fill="none"
          stroke="#fff1cf"
          strokeOpacity={0.18}
          strokeWidth={3}
        />
      ))}
      <path d="M0 70 H1200" stroke="#fff6e8" strokeWidth={2} opacity={0.6} />
    </svg>
  );
}
