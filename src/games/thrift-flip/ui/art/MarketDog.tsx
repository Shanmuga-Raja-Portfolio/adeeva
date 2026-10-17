export interface MarketDogProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export function MarketDog({ x, y, scale }: MarketDogProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={44} ry={7} fill="#3b2a1c" opacity={0.25} />
      <g className="tf-dog__tail">
        <path d="M30 -30 Q48 -44 46 -62" fill="none" stroke="#c27a3e" strokeWidth={8} strokeLinecap="round" />
      </g>
      <path
        d="M-30 -18 Q-34 -44 -8 -46 L26 -46 Q40 -44 38 -22 L36 0 L28 0 L26 -18 L-14 -18 L-18 0 L-26 0 Z"
        fill="#d9904e"
      />
      <path d="M-24 -40 Q0 -34 30 -40 L34 -26 Q2 -20 -26 -26 Z" fill="#f4d3a8" opacity={0.6} />
      <path d="M-8 -46 Q-4 -40 -10 -34" fill="none" stroke="#e57a8f" strokeWidth={6} strokeLinecap="round" />
      <circle cx={-6} cy={-36} r={3.5} fill="#f6d36b" stroke="#b8902a" strokeWidth={1} />
      <g>
        <path
          d="M-44 -54 Q-46 -76 -28 -78 Q-10 -76 -12 -54 Q-14 -40 -28 -40 Q-44 -40 -44 -54 Z"
          fill="#d9904e"
        />
        <path d="M-40 -46 Q-28 -36 -16 -46 Q-18 -38 -28 -36 Q-38 -38 -40 -46 Z" fill="#f4d3a8" />
        <path d="M-44 -72 Q-56 -70 -52 -50 Q-46 -56 -42 -64 Z" fill="#9a5a2a" />
        <path d="M-14 -74 Q-2 -70 -6 -52 Q-12 -58 -16 -66 Z" fill="#9a5a2a" />
        <circle cx={-34} cy={-60} r={2.6} fill="#2b2230" />
        <circle cx={-22} cy={-60} r={2.6} fill="#2b2230" />
        <ellipse cx={-28} cy={-50} rx={4} ry={3} fill="#2b2230" />
        <path
          d="M-28 -47 Q-28 -42 -24 -42"
          fill="none"
          stroke="#2b2230"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
