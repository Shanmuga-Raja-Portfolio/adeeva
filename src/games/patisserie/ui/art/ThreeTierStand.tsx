export interface ThreeTierStandProps {
  readonly className?: string | undefined;
  readonly silver?: boolean | undefined;
}

const PLATES = [
  { y: 92, rx: 70 },
  { y: 196, rx: 104 },
  { y: 300, rx: 138 },
];

export function ThreeTierStand({ className, silver = false }: ThreeTierStandProps) {
  const metal = silver ? "#c7ccd6" : "#d9b45a";
  const edge = silver ? "#8f97a6" : "#a8841a";
  return (
    <svg className={className} viewBox="0 0 320 360" aria-hidden="true" focusable="false">
      <ellipse cx={160} cy={346} rx={120} ry={10} fill="#3b2620" opacity={0.14} />
      <path d="M160 18 V330" stroke={metal} strokeWidth={8} strokeLinecap="round" />
      <path d="M160 18 V330" stroke="#ffffff" strokeWidth={2} opacity={0.5} />
      <circle cx={160} cy={14} r={10} fill={metal} stroke={edge} strokeWidth={2} />
      <path d="M150 6 Q160 -8 170 6" fill="none" stroke={metal} strokeWidth={5} strokeLinecap="round" />
      {PLATES.map((plate) => (
        <g key={plate.y}>
          <ellipse cx={160} cy={plate.y + 6} rx={plate.rx} ry={plate.rx * 0.2} fill="#e9dcc6" />
          <ellipse
            cx={160}
            cy={plate.y}
            rx={plate.rx}
            ry={plate.rx * 0.2}
            fill="#fffdf8"
            stroke={edge}
            strokeWidth={2}
          />
          <ellipse
            cx={160}
            cy={plate.y}
            rx={plate.rx - 10}
            ry={plate.rx * 0.2 - 4}
            fill="none"
            stroke="#f2c4c9"
            strokeWidth={2}
            strokeDasharray="2 6"
          />
        </g>
      ))}
      <ellipse cx={160} cy={334} rx={44} ry={9} fill={metal} stroke={edge} strokeWidth={2} />
    </svg>
  );
}
