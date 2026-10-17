export interface PasserbyProps {
  readonly walkers: readonly Walker[];
}

export interface Walker {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly coat: string;
  readonly hair: string;
  readonly bag: string;
  readonly facing: 1 | -1;
}

const SKINS = ["#efc3a1", "#a86b3f", "#dcaa80", "#6b3d22", "#c58c5c"];

export function Passersby({ walkers }: PasserbyProps) {
  return (
    <g className="tf-passersby">
      {walkers.map((walker, index) => (
        <g
          key={`${walker.x}-${walker.y}`}
          transform={`translate(${walker.x} ${walker.y}) scale(${walker.scale * walker.facing} ${walker.scale})`}
        >
          <ellipse cx={-6} cy={1} rx={30} ry={5} fill="#3b2a1c" opacity={0.16} />
          <g className="tf-passerby" style={{ animationDelay: `${index * 330}ms` }}>
            <path d="M-4 0 L-12 -46 M8 0 L2 -46" stroke="#4b3d4f" strokeWidth={8} strokeLinecap="round" />
            <path d="M-12 1 h-10 M8 1 h10" stroke="#3b2a1c" strokeWidth={5} strokeLinecap="round" />
            <path d="M-21 -40 Q-23 -90 0 -94 Q22 -90 20 -40 Z" fill={walker.coat} />
            <path d="M-21 -40 Q-10 -36 0 -40 Q10 -36 20 -40" fill="none" stroke="#00000022" strokeWidth={3} />
            <path
              d="M14 -84 Q30 -70 26 -52"
              fill="none"
              stroke={walker.coat}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <path
              d="M-14 -84 Q-24 -70 -20 -54"
              fill="none"
              stroke={walker.coat}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <path d="M18 -62 L38 -60 L40 -30 L16 -30 Z" fill={walker.bag} />
            <path d="M22 -60 Q28 -74 34 -60" fill="none" stroke={walker.bag} strokeWidth={3} />
            <rect x={-5} y={-104} width={10} height={12} rx={4} fill={SKINS[index % SKINS.length]} />
            <circle cx={0} cy={-114} r={15} fill={SKINS[index % SKINS.length]} />
            <path
              d="M-16 -114 Q-16 -132 0 -132 Q17 -132 16 -112 Q8 -122 -2 -120 Q-10 -118 -16 -114 Z"
              fill={walker.hair}
            />
            <circle cx={6} cy={-114} r={1.8} fill="#2b2230" />
          </g>
        </g>
      ))}
    </g>
  );
}
