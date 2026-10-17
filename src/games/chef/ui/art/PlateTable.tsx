import { useSvgId } from "../../../../ui/art/useSvgId";

export function PlateTable({ className }: { readonly className?: string | undefined }) {
  const id = useSvgId("ck-table");
  return (
    <svg
      viewBox="0 0 500 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8703e" />
          <stop offset="0.5" stopColor="#8a5a2e" />
          <stop offset="1" stopColor="#6a4222" />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#ffe2a8" stopOpacity={0.45} />
          <stop offset="0.6" stopColor="#ffe2a8" stopOpacity={0.08} />
          <stop offset="1" stopColor="#1d1208" stopOpacity={0.45} />
        </radialGradient>
        <pattern id={`${id}-linen`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#f4efe4" />
          <path d="M0 4 H14 M0 10 H14" stroke="#c94a2e" strokeWidth={2} opacity={0.55} />
          <path d="M4 0 V14 M10 0 V14" stroke="#c94a2e" strokeWidth={2} opacity={0.4} />
        </pattern>
      </defs>
      <rect width={500} height={500} fill={`url(#${id}-wood)`} />
      {[0, 1, 2, 3, 4, 5].map((plank) => (
        <g key={plank}>
          <rect x={plank * 86 - 10} y={0} width={4} height={500} fill="#4a2c14" opacity={0.45} />
          <path
            d={`M${plank * 86 + 20} 0 C${plank * 86 + 40} 120 ${plank * 86 + 10} 260 ${plank * 86 + 34} 500`}
            stroke="#c48a52"
            strokeWidth={2}
            fill="none"
            opacity={0.35}
          />
          <path
            d={`M${plank * 86 + 52} 0 C${plank * 86 + 64} 160 ${plank * 86 + 44} 300 ${plank * 86 + 60} 500`}
            stroke="#5a3418"
            strokeWidth={1.5}
            fill="none"
            opacity={0.3}
          />
        </g>
      ))}
      <g transform="translate(372 352) rotate(-14)">
        <rect x={6} y={8} width={170} height={170} rx={6} fill="#1d1208" opacity={0.3} />
        <rect width={170} height={170} rx={6} fill={`url(#${id}-linen)`} />
        <path d="M0 0 L170 170" stroke="#ffffff" strokeWidth={3} opacity={0.35} />
      </g>
      <g transform="translate(28 96) rotate(4)" opacity={0.95}>
        <rect x={3} y={4} width={14} height={300} rx={7} fill="#1d1208" opacity={0.25} />
        <rect width={14} height={190} rx={7} fill="#d7dde0" />
        <rect x={-6} y={186} width={26} height={120} rx={8} fill="#aeb9bf" />
        {[0, 1, 2, 3].map((tine) => (
          <rect key={tine} x={-5 + tine * 7} y={300} width={4} height={60} rx={2} fill="#c9d1d5" />
        ))}
        <rect x={2} y={10} width={3} height={170} rx={1.5} fill="#ffffff" opacity={0.6} />
      </g>
      <g transform="translate(62 30)">
        <ellipse cx={30} cy={34} rx={34} ry={10} fill="#1d1208" opacity={0.3} />
        <ellipse cx={28} cy={22} rx={30} ry={20} fill="#f4efe4" stroke="#c9bca5" strokeWidth={2} />
        <ellipse cx={28} cy={20} rx={22} ry={13} fill="#e9e1d0" />
        {[
          [20, 18],
          [30, 22],
          [36, 16],
          [24, 24],
          [32, 14],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#ffffff" stroke="#d9d2c4" strokeWidth={0.6} />
        ))}
      </g>
      <g transform="translate(430 60) rotate(30)">
        <path d="M0 0 C10 -18 30 -22 40 -18 C34 -6 18 4 0 0 Z" fill="#4f8a3c" />
        <path d="M0 0 C-8 -18 -2 -36 6 -42 C12 -30 10 -14 0 0 Z" fill="#6aa84f" />
        <path d="M0 0 L0 30" stroke="#3f6f2a" strokeWidth={3} strokeLinecap="round" />
      </g>
      <rect width={500} height={500} fill={`url(#${id}-light)`} />
    </svg>
  );
}
