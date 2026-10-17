import { useSvgId } from "../../../../ui/art/useSvgId";

export interface BenchSceneProps {
  readonly className?: string | undefined;
}

const TILE_ROWS = Array.from({ length: 15 }, (_, index) => index);
const PLANKS = [452, 486, 522, 560];
const JARS: readonly [number, number, number, string][] = [
  [534, 30, 44, "#f4a259"],
  [574, 34, 56, "#a9c98b"],
  [618, 28, 38, "#f2c4c9"],
  [656, 32, 50, "#c8d6ee"],
];
const BERRIES: readonly [number, number, string][] = [
  [700, 500, "#b0213f"],
  [712, 494, "#3d3f8f"],
  [724, 502, "#b0213f"],
  [708, 506, "#3d3f8f"],
  [720, 490, "#e4572e"],
];

export function BenchScene({ className }: BenchSceneProps) {
  const id = useSvgId("bench");
  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9ecd4" />
          <stop offset="0.7" stopColor="#efdcbc" />
          <stop offset="1" stopColor="#e4caa0" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.16" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#fff6d8" stopOpacity={0.95} />
          <stop offset="0.55" stopColor="#fff6d8" stopOpacity={0.15} />
          <stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a874" />
          <stop offset="1" stopColor="#c58c56" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6438" />
          <stop offset="1" stopColor="#6e4325" />
        </linearGradient>
        <linearGradient id={`${id}-shaft`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.42" r="0.78">
          <stop offset="0.5" stopColor="#5a3220" stopOpacity={0} />
          <stop offset="1" stopColor="#5a3220" stopOpacity={0.3} />
        </radialGradient>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-jar`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <rect width={800} height={600} fill={`url(#${id}-wall)`} />
      <g fill={`url(#${id}-tile)`}>
        {TILE_ROWS.map((row) => (
          <rect key={row} x={0} y={row * 30 + 2} width={800} height={9} />
        ))}
      </g>
      <g stroke="#d6bf9a" strokeWidth={1.6}>
        {TILE_ROWS.map((row) => (
          <line key={row} x1={0} y1={row * 30} x2={800} y2={row * 30} />
        ))}
        {TILE_ROWS.flatMap((row) =>
          Array.from({ length: 14 }, (_, col) => (
            <line
              key={`${row}-${col}`}
              x1={col * 60 + (row % 2) * 30}
              y1={row * 30}
              x2={col * 60 + (row % 2) * 30}
              y2={row * 30 + 30}
            />
          )),
        )}
      </g>
      <rect width={800} height={600} fill={`url(#${id}-sun)`} />
      <path d="M40 0 H190 L520 450 H210 Z" fill={`url(#${id}-shaft)`} />
      <g transform="translate(118 40)">
        <rect x={3} y={6} width={150} height={8} rx={4} fill="#5a3220" opacity={0.18} />
        <rect x={0} y={0} width={150} height={8} rx={4} fill="#b7794f" />
        <g stroke="#8a6a52" strokeWidth={2}>
          <path d="M28 8 V20 M74 8 V20 M120 8 V20" />
        </g>
        <path
          d="M28 20 V52 M20 52 Q28 96 36 52 Z M22 60 Q28 84 34 60"
          fill="none"
          stroke="#9aa3b5"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M74 20 V70" stroke="#c9a27a" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={74} cy={80} rx={14} ry={10} fill="#d7dbe4" stroke="#9aa3b5" strokeWidth={2} />
        <path d="M120 20 V64" stroke="#7d5a43" strokeWidth={5} strokeLinecap="round" />
        <rect x={110} y={62} width={20} height={28} rx={6} fill="#e9b872" stroke="#b8864a" strokeWidth={2} />
      </g>
      <g transform="translate(-58 0)">
        <rect x={520} y={118} width={240} height={12} rx={4} fill="#b7794f" />
        <rect x={524} y={128} width={240} height={14} rx={6} fill="#5a3220" opacity={0.2} />
        <path d="M546 130 V150 L560 130 Z M734 130 V150 L720 130 Z" fill="#8a5a42" />
        {JARS.map(([x, w, h, colour]) => (
          <g key={x}>
            <rect x={x} y={118 - h} width={w} height={h} rx={8} fill={colour} opacity={0.9} />
            <rect x={x} y={118 - h} width={w} height={h} rx={8} fill={`url(#${id}-jar)`} />
            <rect x={x - 2} y={112 - h} width={w + 4} height={8} rx={3} fill="#8a5a42" />
            <rect x={x + 5} y={128 - h} width={w - 10} height={10} rx={2} fill="#fffaf0" opacity={0.9} />
          </g>
        ))}
        <g transform="translate(722 118)">
          <path d="M-16 0 L-12 -24 H12 L16 0 Z" fill="#c97d4a" />
          <rect x={-14} y={-28} width={28} height={6} rx={2} fill="#b0683a" />
          {[-40, -15, 10, 35].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-44}
              rx={7}
              ry={18}
              fill={angle % 2 === 0 ? "#6f9a5c" : "#86b06f"}
              transform={`rotate(${angle} 0 -28)`}
            />
          ))}
        </g>
      </g>
      <ellipse cx={400} cy={430} rx={330} ry={150} fill={`url(#${id}-pool)`} />
      <path d="M0 440 H800 V600 H0 Z" fill={`url(#${id}-top)`} />
      <g stroke="#b47a46" strokeWidth={1.6} opacity={0.55}>
        {PLANKS.map((y) => (
          <line key={y} x1={0} y1={y} x2={800} y2={y} />
        ))}
      </g>
      <g stroke="#e8bf8c" strokeWidth={1.2} opacity={0.5} fill="none">
        <path d="M30 470 Q140 462 260 472 T520 468" />
        <path d="M300 504 Q420 496 560 506 T790 500" />
        <path d="M10 540 Q160 532 300 542 T620 538" />
      </g>
      <rect x={0} y={436} width={800} height={8} fill="#e6bd8a" />
      <rect x={0} y={444} width={800} height={10} fill="#3b2620" opacity={0.12} />
      <ellipse cx={400} cy={500} rx={260} ry={46} fill="#fff6e0" opacity={0.25} />
      <g transform="translate(112 470)">
        <ellipse cx={34} cy={46} rx={44} ry={8} fill="#3b2620" opacity={0.18} />
        <path
          d="M4 44 Q-2 10 10 -8 L22 -18 H48 L58 -8 Q70 10 64 44 Z"
          fill="#f2e6cf"
          stroke="#c9b48a"
          strokeWidth={2}
        />
        <path d="M22 -18 Q34 -26 48 -18" fill="none" stroke="#c9b48a" strokeWidth={2} />
        <rect x={14} y={8} width={40} height={18} rx={3} fill="#fffaf0" stroke="#d8c7a6" />
        <path d="M22 17 H46" stroke="#a46f55" strokeWidth={2.4} strokeLinecap="round" />
      </g>
      <g transform="translate(160 530) rotate(-8)">
        <ellipse cx={60} cy={14} rx={74} ry={6} fill="#3b2620" opacity={0.14} />
        <rect x={0} y={-8} width={120} height={18} rx={9} fill="#e3b986" stroke="#b8864a" strokeWidth={1.6} />
        <rect x={-22} y={-4} width={26} height={10} rx={5} fill="#c58c56" />
        <rect x={116} y={-4} width={26} height={10} rx={5} fill="#c58c56" />
        <path d="M8 -3 H112" stroke="#fff3dc" strokeWidth={3} opacity={0.6} strokeLinecap="round" />
      </g>
      <g transform="translate(-56 0)">
        <ellipse cx={712} cy={512} rx={46} ry={9} fill="#3b2620" opacity={0.16} />
        <path d="M670 490 Q712 530 754 490 Z" fill="#ffffff" stroke="#c8d6ee" strokeWidth={2} />
        <ellipse cx={712} cy={490} rx={42} ry={8} fill="#eef3fb" stroke="#c8d6ee" strokeWidth={2} />
        {BERRIES.map(([x, y, colour]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={colour} />
        ))}
      </g>
      <rect x={0} y={582} width={800} height={18} fill={`url(#${id}-edge)`} />
      <rect width={800} height={600} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
