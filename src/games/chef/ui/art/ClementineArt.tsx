export interface ClementineArtProps {
  readonly transform?: string | undefined;
  readonly menu?: readonly string[] | undefined;
  readonly ribbons?: number | undefined;
}

const AWNING = ["#f3f0e8", "#e86a1f", "#f3f0e8", "#e86a1f", "#f3f0e8", "#e86a1f", "#f3f0e8", "#e86a1f"];

export function ClementineArt({ transform, menu = [], ribbons = 0 }: ClementineArtProps) {
  return (
    <g transform={transform}>
      <ellipse cx={250} cy={312} rx={250} ry={16} fill="#000" opacity={0.18} />
      <path
        d="M20 120 Q20 60 80 60 H380 Q430 60 450 110 L490 190 Q500 210 500 230 V280 Q500 296 484 296 H36 Q20 296 20 280 Z"
        fill="#f28c28"
      />
      <path d="M20 200 H500 V280 Q500 296 484 296 H36 Q20 296 20 280 Z" fill="#d96f14" />
      <path
        d="M392 78 H436 Q448 80 456 100 L486 170 H392 Z"
        fill="#cfe6ee"
        stroke="#2e3a40"
        strokeWidth={5}
      />
      <path d="M404 92 L420 92 L400 150" stroke="#fff" strokeWidth={4} opacity={0.6} />
      <rect x={60} y={88} width={300} height={104} rx={10} fill="#2e3a40" />
      <rect x={70} y={98} width={280} height={84} rx={6} fill="#ffe8b8" />
      <g>
        {AWNING.map((colour, index) => (
          <path
            key={`stripe-${index}`}
            d={`M${50 + index * 40} 74 h40 l-6 34 q-14 10 -28 0 Z`}
            fill={colour}
            stroke="#b5520c"
            strokeWidth={1.5}
          />
        ))}
      </g>
      <path d="M84 182 H336 V196 H84 Z" fill="#c9d1d5" stroke="#5f6c73" strokeWidth={2} />
      <rect x={96} y={130} width={110} height={46} rx={4} fill="#2e3a40" />
      <text x={151} y={150} textAnchor="middle" fontSize={13} fill="#f3f0e8" className="ck-scene-label">
        {menu[0] ?? "Today"}
      </text>
      <text x={151} y={168} textAnchor="middle" fontSize={11} fill="#f2a93b" className="ck-scene-label">
        {menu.slice(1).join(" · ")}
      </text>
      <circle cx={276} cy={142} r={22} fill="#f3f0e8" />
      <circle cx={276} cy={142} r={14} fill="#d9472b" />
      <circle cx={270} cy={137} r={4} fill="#ffd387" />
      <text x={260} y={244} textAnchor="middle" fontSize={34} fill="#fff7ea" className="ck-truck-name">
        Clementine
      </text>
      <path d="M30 228 H490" stroke="#fff7ea" strokeWidth={3} opacity={0.5} />
      {Array.from({ length: Math.min(ribbons, 8) }, (_, index) => (
        <g
          key={`ribbon-${index}`}
          transform={`translate(${372 + (index % 4) * 26} ${200 + Math.floor(index / 4) * 30})`}
        >
          <path d="M0 10 l-6 16 l6 -4 l6 4 Z" fill="#2f6fb5" />
          <circle cy={6} r={8} fill="#3d84d6" stroke="#f3f0e8" strokeWidth={2} />
        </g>
      ))}
      {[110, 400].map((x) => (
        <g key={x}>
          <circle cx={x} cy={296} r={34} fill="#1d2528" />
          <circle cx={x} cy={296} r={16} fill="#aeb9bf" />
          <circle cx={x} cy={296} r={6} fill="#5f6c73" />
        </g>
      ))}
      <circle cx={488} cy={250} r={9} fill="#ffe59a" />
    </g>
  );
}
