import { useSvgId } from "../../../../ui/art/useSvgId";

export interface TableTopProps {
  readonly className?: string | undefined;
}

const PLANKS = Array.from({ length: 9 }, (_, index) => index);
const SPRINKLES: readonly [number, number, number, string][] = [
  [668, 370, 20, "#f2c4c9"],
  [690, 392, 70, "#9fd0ee"],
  [712, 368, 130, "#f6df7c"],
  [700, 420, 40, "#a9c98b"],
  [722, 400, 160, "#b9a7dc"],
  [662, 406, 100, "#f4a259"],
  [716, 436, 15, "#f2c4c9"],
  [680, 444, 80, "#f6df7c"],
];
const DUST: readonly [number, number, number][] = [
  [120, 150, 70],
  [170, 210, 40],
  [640, 120, 46],
  [210, 520, 54],
];

export function TableTop({ className }: TableTopProps) {
  const id = useSvgId("tabletop");
  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dcae78" />
          <stop offset="0.5" stopColor="#cf9b62" />
          <stop offset="1" stopColor="#bd8751" />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.45" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#fff4dc" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff4dc" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#3b2620" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2620" stopOpacity={0.28} />
        </radialGradient>
        <radialGradient id={`${id}-dust`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={800} height={600} fill={`url(#${id}-wood)`} />
      <g stroke="#a8743f" strokeWidth={2} opacity={0.55}>
        {PLANKS.map((index) => (
          <line key={index} x1={index * 96 - 8} y1={0} x2={index * 96 - 8} y2={600} />
        ))}
      </g>
      <g stroke="#e9c492" strokeWidth={1.4} fill="none" opacity={0.45}>
        {PLANKS.map((index) => (
          <path
            key={index}
            d={`M${index * 96 + 30} 0 Q${index * 96 + 44} 150 ${index * 96 + 26} 300 T${index * 96 + 38} 600`}
          />
        ))}
      </g>
      {DUST.map(([x, y, r]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 0.7} fill={`url(#${id}-dust)`} />
      ))}
      <rect width={800} height={600} fill={`url(#${id}-light)`} />
      <g transform="translate(44 392) rotate(-10) scale(0.66)">
        <rect x={0} y={0} width={150} height={120} rx={8} fill="#fffaf0" />
        <g fill="#e88aa3" opacity={0.8}>
          <rect x={0} y={16} width={150} height={10} />
          <rect x={0} y={94} width={150} height={10} />
          <rect x={20} y={0} width={10} height={120} />
          <rect x={120} y={0} width={10} height={120} />
        </g>
        <rect x={0} y={0} width={150} height={120} rx={8} fill="none" stroke="#3b2620" strokeOpacity={0.12} />
      </g>
      <g transform="translate(112 278) rotate(78) scale(0.78)">
        <ellipse cx={8} cy={12} rx={86} ry={26} fill="#3b2620" opacity={0.14} />
        <path d="M-70 0 L50 -22 Q70 0 50 22 Z" fill="#fff4f6" stroke="#e7b9c4" strokeWidth={2} />
        <path d="M-70 0 L-92 -5 V5 Z" fill="#9aa3b5" />
        <path d="M-40 -6 L30 -16 M-40 6 L30 16" stroke="#f2c4c9" strokeWidth={3} strokeLinecap="round" />
        <path d="M50 -22 Q78 -10 76 0 Q78 10 50 22" fill="#f2c4c9" />
      </g>
      <g transform="translate(690 252) scale(0.6)">
        <ellipse cx={6} cy={10} rx={66} ry={62} fill="#3b2620" opacity={0.14} />
        <circle cx={0} cy={0} r={60} fill="#eef3fb" stroke="#c8d6ee" strokeWidth={4} />
        <circle cx={0} cy={0} r={46} fill="#f6d2dc" />
        <path
          d="M-26 -10 Q0 -30 24 -6 Q8 10 -20 6"
          fill="none"
          stroke="#fbe7ed"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path d="M30 -40 L84 -92" stroke="#c9a27a" strokeWidth={9} strokeLinecap="round" />
        <ellipse cx={22} cy={-30} rx={12} ry={8} fill="#d7dbe4" transform="rotate(-45 22 -30)" />
      </g>
      {SPRINKLES.map(([x, y, angle, colour]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 7}
          y={y - 2.5}
          width={14}
          height={5}
          rx={2.5}
          fill={colour}
          transform={`rotate(${angle} ${x} ${y})`}
        />
      ))}
      <rect width={800} height={600} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
