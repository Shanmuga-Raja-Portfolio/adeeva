export interface ChalkSignProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly lines: readonly string[];
}

export function ChalkSign({ x, y, scale, lines }: ChalkSignProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={-14} cy={2} rx={62} ry={8} fill="#3b2a1c" opacity={0.26} />
      <path
        d="M-40 0 L-26 -128 L26 -128 L40 0"
        fill="none"
        stroke="#7a4f2a"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path d="M-44 -2 L-30 -124 L30 -124 L44 -2 Z" fill="#a07a52" />
      <path d="M-36 -10 L-24 -116 L24 -116 L36 -10 Z" fill="#2f3d38" />
      <path d="M-30 -20 L-22 -104" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={10} />
      {lines.map((line, index) => (
        <text
          key={line}
          x={0}
          y={-82 + index * 26}
          textAnchor="middle"
          fontFamily="'Segoe Print', 'Comic Sans MS', cursive"
          fontSize={index === 0 ? 15 : 12}
          fontWeight={700}
          fill={index === 0 ? "#f6d36b" : "#f6f2e4"}
        >
          {line}
        </text>
      ))}
      <path d="M-18 -26 q18 -10 36 0" stroke="#e57a8f" strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={-20} cy={-26} r={3} fill="#8fcfb2" />
      <circle cx={20} cy={-26} r={3} fill="#8fcfb2" />
    </g>
  );
}
