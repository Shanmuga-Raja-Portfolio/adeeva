interface ArcadeStallProps {
  readonly x: number;
  readonly y: number;
  readonly awning: string;
  readonly stripe: string;
  readonly glowId: string;
  readonly woodId: string;
  readonly goods: number;
}

const BEADS = ["#e8763d", "#3fa9a6", "#f6d27a", "#d0587e", "#b9a7dc", "#ffffff"] as const;
const SCALLOPS = 6;

export function ArcadeStall({ x, y, awning, stripe, glowId, woodId, goods }: ArcadeStallProps) {
  const edge = Array.from(
    { length: SCALLOPS },
    (_, index) => `Q${5 + index * 26} -6 ${18 + index * 26} -20`,
  ).join(" ");
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={70} cy={96} rx={86} ry={10} fill="#1c1018" opacity={0.45} />
      <rect x={6} y={-20} width={128} height={70} rx={4} fill="#3a2433" />
      <rect x={10} y={-16} width={120} height={62} rx={3} fill={`url(#${glowId})`} />
      {[0, 1, 2].map((shelf) => (
        <g key={shelf}>
          <path d={`M16 ${-2 + shelf * 18} L124 ${-2 + shelf * 18}`} stroke="#7a5236" strokeWidth={3} />
          {Array.from({ length: 5 }, (_, item) => {
            const colour = BEADS[(item + shelf + goods) % BEADS.length] ?? "#f6d27a";
            const cx = 26 + item * 22;
            const top = -14 + shelf * 18;
            return (item + shelf + goods) % 3 === 0 ? (
              <path
                key={item}
                d={`M${cx - 7} ${top} Q${cx} ${top + 12} ${cx + 7} ${top}`}
                fill="none"
                stroke="#f6d27a"
                strokeWidth={1.4}
              />
            ) : (
              <g key={item}>
                <circle cx={cx} cy={top + 7} r={4} fill={colour} />
                <circle cx={cx - 1.4} cy={top + 5.6} r={1.3} fill="#ffffff" opacity={0.8} />
              </g>
            );
          })}
        </g>
      ))}
      <rect
        x={0}
        y={50}
        width={140}
        height={44}
        rx={5}
        fill={`url(#${woodId})`}
        stroke="#2a1520"
        strokeWidth={2}
      />
      <path d="M4 54 L136 54" stroke="#e8c27a" strokeOpacity={0.55} strokeWidth={2} />
      <rect x={42} y={62} width={56} height={20} rx={4} fill="#2a1520" opacity={0.55} />
      <rect x={45} y={65} width={50} height={14} rx={3} fill="#f2e2c4" opacity={0.9} />
      <circle cx={60} cy={72} r={3} fill={awning} />
      <circle cx={70} cy={72} r={3} fill="#e8a33d" />
      <circle cx={80} cy={72} r={3} fill={stripe} />
      <path
        d="M-8 -20 L70 -52 L148 -20 Z"
        fill={awning}
        stroke="#2a1520"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {Array.from({ length: SCALLOPS }, (_, index) =>
        index % 2 === 0 ? (
          <path
            key={index}
            d={`M${-8 + index * 26} -20 L70 -52 L${18 + index * 26} -20 Z`}
            fill={stripe}
            opacity={0.85}
          />
        ) : null,
      )}
      <path d={`M-8 -20 ${edge}`} fill={awning} stroke="#2a1520" strokeWidth={2} />
      <path d="M-8 -20 L148 -20" stroke="#ffe2a6" strokeOpacity={0.5} strokeWidth={1.5} />
    </g>
  );
}
