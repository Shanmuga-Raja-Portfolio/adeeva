interface FootprintMarkProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly reached: boolean;
}

export function FootprintMark({ x, y, size, reached }: FootprintMarkProps) {
  const s = size / 60;
  const fill = reached ? "#7fd18b" : "#e2574c";
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      className={reached ? "is-foot is-foot--ok" : "is-foot is-foot--blocked"}
    >
      <rect
        x={-24}
        y={-24}
        width={48}
        height={48}
        rx={10}
        fill={reached ? "rgba(127,209,139,0.18)" : "rgba(226,87,76,0.22)"}
        stroke={fill}
        strokeWidth={2.5}
        strokeDasharray={reached ? undefined : "6 4"}
      />
      <ellipse cx={-7} cy={-3} rx={6} ry={10} fill={fill} />
      <ellipse cx={8} cy={4} rx={6} ry={10} fill={fill} />
      <circle cx={-7} cy={-16} r={2.5} fill={fill} />
      <circle cx={8} cy={-9} r={2.5} fill={fill} />
      {reached ? null : (
        <path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      )}
    </g>
  );
}
