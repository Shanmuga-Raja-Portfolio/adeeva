interface HeartPotProps {
  readonly x: number;
  readonly y: number;
  readonly hearts: number;
  readonly need: number;
}

function heartPath(cx: number, cy: number, size: number): string {
  const s = size;
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy} ${cx - s * 0.8} ${cy - s} ${cx} ${cy - s * 0.35} C${cx + s * 0.8} ${cy - s} ${cx + s * 1.4} ${cy} ${cx} ${cy + s * 0.9} Z`;
}

export function HeartPot({ x, y, hearts, need }: HeartPotProps) {
  const filled = hearts >= need;
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <path d="M-30 -18 L30 -18 L24 22 Q0 30 -24 22 Z" fill="#7a2f3f" stroke="#3a1420" strokeWidth={3} />
      <ellipse cx={0} cy={-18} rx={30} ry={7} fill="#8f3a4c" stroke="#3a1420" strokeWidth={2} />
      {Array.from({ length: Math.min(hearts, 6) }, (_, index) => (
        <path
          key={index}
          d={heartPath(-18 + (index % 3) * 18, -26 - Math.floor(index / 3) * 14, 7)}
          fill="#e8789c"
          stroke="#a84a6a"
          strokeWidth={1.2}
        />
      ))}
      <text
        x={0}
        y={12}
        textAnchor="middle"
        fill={filled ? "#ffe2a6" : "#f4ecdc"}
        fontSize={18}
        fontWeight={700}
      >
        {hearts} ♥
      </text>
    </g>
  );
}
