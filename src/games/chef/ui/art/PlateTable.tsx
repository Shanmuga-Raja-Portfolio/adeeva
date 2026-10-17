import { useSvgId } from "../../../../ui/art/useSvgId";

const PLANKS = [0, 1, 2, 3, 4, 5, 6];

const KNOTS: readonly (readonly [number, number, number])[] = [
  [140, 120, 1],
  [980, 300, 0.8],
  [560, 470, 0.7],
  [1120, 70, 0.6],
];

export function PlateTable({ className }: { readonly className?: string | undefined }) {
  const id = useSvgId("ck-table");
  return (
    <svg
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b07a45" />
          <stop offset="0.5" stopColor="#9a6435" />
          <stop offset="1" stopColor="#7a4a26" />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.45" r="0.65">
          <stop offset="0" stopColor="#ffe6b0" stopOpacity={0.5} />
          <stop offset="0.45" stopColor="#ffd890" stopOpacity={0.14} />
          <stop offset="1" stopColor="#1d1208" stopOpacity={0.55} />
        </radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves={3} seed={7} />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width={1200} height={560} fill={`url(#${id}-wood)`} />
      <rect width={1200} height={560} fill="#000000" filter={`url(#${id}-grain)`} opacity={0.5} />
      {PLANKS.map((plank) => (
        <g key={plank}>
          <rect y={plank * 84 - 4} width={1200} height={3} fill="#4a2c14" opacity={0.5} />
          <rect y={plank * 84 - 1} width={1200} height={1.5} fill="#e0a868" opacity={0.25} />
          <path
            d={`M0 ${plank * 84 + 30} C300 ${plank * 84 + 18} 640 ${plank * 84 + 44} 1200 ${plank * 84 + 26}`}
            stroke="#5a3418"
            strokeWidth={1.5}
            fill="none"
            opacity={0.28}
          />
          <path
            d={`M0 ${plank * 84 + 56} C420 ${plank * 84 + 64} 760 ${plank * 84 + 46} 1200 ${plank * 84 + 60}`}
            stroke="#d39a5c"
            strokeWidth={2}
            fill="none"
            opacity={0.22}
          />
        </g>
      ))}
      {KNOTS.map(([x, y, size]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${size})`} opacity={0.5}>
          <ellipse rx={26} ry={9} fill="none" stroke="#5a3418" strokeWidth={2} />
          <ellipse rx={12} ry={4} fill="#5a3418" opacity={0.6} />
        </g>
      ))}
      <rect width={1200} height={560} fill={`url(#${id}-light)`} />
    </svg>
  );
}
