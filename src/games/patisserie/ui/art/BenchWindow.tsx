export interface BenchWindowProps {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

const ROOFS: readonly (readonly [number, number, number, string])[] = [
  [8, 128, 44, "#e9a9bb"],
  [54, 112, 40, "#b9a7dc"],
  [98, 132, 50, "#a9c98b"],
  [140, 118, 34, "#f6c58c"],
];

export function BenchWindow({ id, x, y }: BenchWindowProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd0ee" />
          <stop offset="0.7" stopColor="#d7ecf8" />
          <stop offset="1" stopColor="#fff4d8" />
        </linearGradient>
        <radialGradient id={`${id}-sunlit`} cx="0.75" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={1} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-pane`}>
          <rect x={12} y={12} width={156} height={172} rx={70} ry={70} />
        </clipPath>
      </defs>
      <rect x={-6} y={-6} width={192} height={216} rx={86} ry={86} fill="#5a3220" opacity={0.16} />
      <rect
        x={0}
        y={0}
        width={180}
        height={200}
        rx={80}
        ry={80}
        fill="#fffaf0"
        stroke="#c9a27a"
        strokeWidth={3}
      />
      <g clipPath={`url(#${id}-pane)`}>
        <rect x={12} y={12} width={156} height={180} fill={`url(#${id}-sky)`} />
        <circle cx={124} cy={52} r={20} fill="#fff1b8" />
        <circle cx={124} cy={52} r={44} fill={`url(#${id}-sunlit)`} />
        <path
          d="M30 64 Q40 52 54 60 Q64 50 76 60 Q86 62 84 70 H28 Q22 66 30 64 Z"
          fill="#ffffff"
          opacity={0.9}
        />
        {ROOFS.map(([rx, ry, width, colour]) => (
          <g key={rx}>
            <rect x={rx} y={ry} width={width} height={80} fill="#fff6e8" />
            <path
              d={`M${rx - 4} ${ry} L${rx + width / 2} ${ry - 22} L${rx + width + 4} ${ry} Z`}
              fill={colour}
            />
            <rect x={rx + width / 2 - 6} y={ry + 14} width={12} height={16} rx={2} fill="#c8d6ee" />
          </g>
        ))}
        <ellipse cx={46} cy={186} rx={34} ry={20} fill="#86b06f" />
        <ellipse cx={130} cy={190} rx={44} ry={22} fill="#6f9a5c" />
      </g>
      <path d="M90 12 V192 M12 104 H168" stroke="#fffaf0" strokeWidth={7} />
      <path d="M90 12 V192 M12 104 H168" stroke="#c9a27a" strokeWidth={2} opacity={0.6} />
      <path d="M-4 -4 Q30 70 22 196 L-10 196 Z" fill="#f2c4c9" stroke="#d58aa5" strokeWidth={1.6} />
      <path d="M184 -4 Q150 70 158 196 L190 196 Z" fill="#f2c4c9" stroke="#d58aa5" strokeWidth={1.6} />
      <path d="M2 30 Q14 100 10 190" stroke="#ffffff" strokeWidth={3} opacity={0.5} fill="none" />
      <rect x={-14} y={194} width={208} height={14} rx={4} fill="#b7794f" />
      <rect x={-10} y={206} width={200} height={8} rx={3} fill="#5a3220" opacity={0.2} />
      <g transform="translate(150 194)">
        <path d="M-14 0 L-11 -20 H11 L14 0 Z" fill="#c97d4a" />
        {[-34, -10, 14, 36].map((angle, index) => (
          <ellipse
            key={angle}
            cx={0}
            cy={-34}
            rx={6}
            ry={15}
            fill={index % 2 === 0 ? "#6f9a5c" : "#86b06f"}
            transform={`rotate(${angle} 0 -20)`}
          />
        ))}
      </g>
    </g>
  );
}
