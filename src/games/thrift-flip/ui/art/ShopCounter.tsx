export interface ShopCounterProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
}

const FLORETS: readonly (readonly [number, number, string])[] = [
  [-14, -62, "#8a7fe0"],
  [-12, -54, "#a99cf0"],
  [0, -70, "#6f6fc4"],
  [1, -62, "#8a7fe0"],
  [14, -60, "#a99cf0"],
  [12, -52, "#6f6fc4"],
];

export function ShopCounter({ x, y, width }: ShopCounterProps) {
  const right = x + width;
  return (
    <g>
      <ellipse cx={x + width / 2} cy={y + 96} rx={width / 2 + 24} ry={12} fill="#3b2a1c" opacity={0.28} />
      <rect x={x} y={y + 12} width={width} height={84} rx={4} fill="#2f6f6a" />
      <rect x={x} y={y + 12} width={width} height={84} rx={4} fill="#000000" opacity={0.08} />
      {Array.from({ length: Math.floor(width / 48) }, (_, index) => (
        <rect
          key={index}
          x={x + 10 + index * 48}
          y={y + 24}
          width={38}
          height={60}
          rx={3}
          fill="none"
          stroke="#1d4744"
          strokeWidth={2.5}
        />
      ))}
      <rect x={x + 8} y={y + 22} width={width * 0.3} height={70} fill="#ffffff" opacity={0.06} />
      <rect x={x - 10} y={y} width={width + 20} height={14} rx={4} fill="#c99f72" />
      <rect x={x - 10} y={y} width={width + 20} height={4} rx={2} fill="#fff2dc" opacity={0.6} />
      <rect x={x - 10} y={y + 14} width={width + 20} height={4} fill="#3b2a1c" opacity={0.3} />
      <g transform={`translate(${right - 46} ${y})`}>
        <path d="M-30 0 L-26 -34 L26 -34 L30 0 Z" fill="#c9a227" />
        <path d="M-26 -34 L-20 -50 L20 -50 L26 -34 Z" fill="#e2bf4a" />
        <rect x={-16} y={-48} width={32} height={10} rx={2} fill="#2f3d38" />
        <text
          x={0}
          y={-40}
          textAnchor="middle"
          fontFamily="'Rockwell', Georgia, serif"
          fontSize={8}
          fill="#f6e3b0"
        >
          OPEN
        </text>
        {[-16, -6, 4, 14].map((key) => (
          <circle key={key} cx={key} cy={-20} r={3.2} fill="#fff4e2" stroke="#8a6a1a" strokeWidth={1} />
        ))}
        <path d="M-26 -8 H26" stroke="#8a6a1a" strokeWidth={2} />
        <path d="M-24 -32 L-22 -4" stroke="#ffffff" strokeWidth={2} opacity={0.4} />
      </g>
      <g transform={`translate(${x + 34} ${y})`}>
        <path d="M-10 0 Q-14 -18 -8 -26 L8 -26 Q14 -18 10 0 Z" fill="#dfe9ee" opacity={0.9} />
        <path d="M-6 -24 Q-8 -12 -6 -2" stroke="#ffffff" strokeWidth={2} opacity={0.6} />
        <path
          d="M0 -26 Q-6 -50 -14 -62 M0 -26 Q2 -54 0 -70 M0 -26 Q8 -48 14 -60"
          stroke="#4f7a4a"
          strokeWidth={2.5}
          fill="none"
        />
        {FLORETS.map(([cx, cy, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={fill} />
        ))}
      </g>
      <g transform={`translate(${x + width / 2 - 10} ${y})`}>
        <path d="M-26 0 L-22 -14 L22 -14 L26 0 Z" fill="#e8d9bd" stroke="#a07a52" strokeWidth={1.5} />
        <path d="M-18 -14 Q0 -26 18 -14" fill="none" stroke="#a07a52" strokeWidth={2.5} />
        <path d="M-12 -7 H12" stroke="#f08a3c" strokeWidth={2} />
      </g>
    </g>
  );
}
