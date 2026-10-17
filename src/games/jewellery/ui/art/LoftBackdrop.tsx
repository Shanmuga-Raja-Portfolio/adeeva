import { useSvgId } from "../../../../ui/art/useSvgId";
import { LanternGarland, type GarlandLight } from "./LanternGarland";

interface LoftBackdropProps {
  readonly className?: string | undefined;
  readonly dusk: string;
  readonly evening?: boolean | undefined;
  readonly garland: readonly GarlandLight[];
}

const BOX_COLOURS = ["#b8462f", "#1f4e5a", "#d9b23c", "#4b2a4f", "#3fa9a6", "#e8789c"] as const;
const STARS = [
  [470, 92],
  [540, 60],
  [610, 120],
  [700, 74],
  [760, 130],
  [520, 150],
  [655, 52],
] as const;

export function LoftBackdrop({ className, dusk, evening = false, garland }: LoftBackdropProps) {
  const id = useSvgId("jb-loft");
  return (
    <svg className={className} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b3b4f" />
          <stop offset="1" stopColor="#3a2433" />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk} />
          <stop offset="1" stopColor={evening ? "#5a3a5e" : "#c97c6a"} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5c3a" />
          <stop offset="1" stopColor="#4a2e1a" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={420} fill={`url(#${id}-wall)`} />
      <path d="M0 0 L420 0 L0 160 Z M1200 0 L780 0 L1200 160 Z" fill="#2c1a26" opacity={0.7} />
      {[120, 300, 900, 1080].map((x) => (
        <path
          key={x}
          d={`M${x} 0 L${x < 600 ? x - 60 : x + 60} 420`}
          stroke="#2c1a26"
          strokeWidth={14}
          opacity={0.5}
        />
      ))}
      <g>
        <circle cx={615} cy={150} r={170} fill="#2c1a26" />
        <circle cx={615} cy={150} r={156} fill={`url(#${id}-sky)`} />
        {STARS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill="#fff6d8" opacity={0.85} />
        ))}
        <path d="M720 70 A26 26 0 1 0 744 112 A20 20 0 1 1 720 70 Z" fill="#fff3c8" opacity={0.92} />
        <path d="M459 150 L771 150 M615 -6 L615 306" stroke="#2c1a26" strokeWidth={10} />
        <path d="M505 40 A156 156 0 0 1 725 40" fill="none" stroke="#2c1a26" strokeWidth={6} opacity={0.6} />
        <path d="M470 254 Q615 300 760 254 L760 306 L470 306 Z" fill="#2a2440" opacity={0.6} />
        <g fill="#2a2440" opacity={0.85}>
          <rect x={500} y={226} width={40} height={60} />
          <rect x={548} y={206} width={30} height={80} />
          <path d="M586 286 L586 214 L606 196 L626 214 L626 286 Z" />
          <rect x={640} y={232} width={50} height={54} />
          <rect x={700} y={218} width={26} height={68} />
        </g>
      </g>
      <LanternGarland lights={garland} width={420} sag={46} size={34} x={405} y={18} />
      <g>
        <rect x={64} y={110} width={220} height={12} rx={4} fill="#7a5236" />
        <rect x={64} y={196} width={220} height={12} rx={4} fill="#7a5236" />
        {[0, 1, 2, 3].map((index) => (
          <g key={`top-${index}`} transform={`translate(${82 + index * 50} ${78})`}>
            <rect width={38} height={32} rx={4} fill={BOX_COLOURS[index % BOX_COLOURS.length]} />
            <rect y={-6} width={38} height={8} rx={3} fill="#e8c27a" opacity={0.85} />
            <circle cx={19} cy={16} r={4} fill="#f6d27a" />
          </g>
        ))}
        {[0, 1, 2].map((index) => (
          <g key={`low-${index}`} transform={`translate(${96 + index * 64} ${160})`}>
            <rect width={46} height={36} rx={5} fill={BOX_COLOURS[(index + 3) % BOX_COLOURS.length]} />
            <path d="M6 0 Q23 -14 40 0" fill="#e8c27a" opacity={0.9} />
            <path d="M23 -18 l3 6 l6 2 l-6 2 l-3 6 l-3 -6 l-6 -2 l6 -2 Z" fill="#fff3c8" />
          </g>
        ))}
      </g>
      <g opacity={0.9}>
        <path
          d="M1010 420 Q1060 330 1000 260 Q950 200 1010 140 Q1060 90 1030 30"
          fill="none"
          stroke="#2c1a26"
          strokeWidth={16}
        />
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <path
            key={index}
            d={`M${960 + (index % 2) * 40} ${400 - index * 52} l90 -16`}
            stroke="#7a5236"
            strokeWidth={10}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={900} cy={262} r={110} fill={`url(#${id}-lamp)`} />
      <path d="M0 330 L1200 330 L1200 420 L0 420 Z" fill={`url(#${id}-floor)`} />
      <path d="M0 330 L1200 330" stroke="#e8a33d" strokeOpacity={0.25} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <path
          key={index}
          d={`M${index * 220} 330 L${index * 220 - 80} 420`}
          stroke="#3e2716"
          strokeOpacity={0.45}
          strokeWidth={3}
        />
      ))}
      <g transform="translate(820 262)">
        <rect x={-6} y={-4} width={160} height={12} rx={4} fill="#7a5236" />
        <rect x={6} y={8} width={10} height={60} fill="#553620" />
        <rect x={128} y={8} width={10} height={60} fill="#553620" />
        <path d="M60 -4 L70 -40 L84 -40 L94 -4 Z" fill="#c9a227" />
        <circle cx={77} cy={-46} r={10} fill="#ffd98a" />
      </g>
    </svg>
  );
}
