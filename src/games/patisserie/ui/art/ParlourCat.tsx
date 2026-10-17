export interface ParlourCatProps {
  readonly x: number;
  readonly y: number;
  readonly scale?: number | undefined;
}

const STRIPES: readonly (readonly [number, number])[] = [
  [-22, -22],
  [-8, -27],
  [6, -27],
];

export function ParlourCat({ x, y, scale = 1 }: ParlourCatProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={8} rx={58} ry={9} fill="#2a1a14" opacity={0.28} />
      <ellipse cx={0} cy={0} rx={54} ry={14} fill="#b9a7dc" />
      <ellipse cx={0} cy={-3} rx={48} ry={9} fill="#d4c7ee" />
      <path d="M-46 0 Q0 12 46 0" fill="none" stroke="#8f78c2" strokeWidth={2} opacity={0.6} />
      <g className="pa-parlour-cat__body">
        <path d="M-34 -6 Q-40 -34 -6 -38 Q30 -40 34 -8 Z" fill="#f0a35c" />
        <path
          d="M-28 -10 Q-26 -28 -2 -30"
          fill="none"
          stroke="#ffd2a3"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.7}
        />
        {STRIPES.map(([dx, dy]) => (
          <path
            key={dx}
            d={`M${dx} ${dy} q4 6 0 12`}
            fill="none"
            stroke="#c46a2a"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <path
          className="pa-parlour-cat__tail"
          d="M30 -10 Q52 -8 46 6 Q40 14 18 8"
          fill="none"
          stroke="#f0a35c"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path d="M44 4 Q40 12 26 9" fill="none" stroke="#fff4e4" strokeWidth={7} strokeLinecap="round" />
      </g>
      <g transform="translate(-30 -26)">
        <path d="M-16 -6 L-14 -24 L-4 -14 Z" fill="#f0a35c" />
        <path d="M16 -6 L14 -24 L4 -14 Z" fill="#f0a35c" />
        <path d="M-13 -9 L-12 -19 L-6 -13 Z" fill="#f6b8c6" />
        <path d="M13 -9 L12 -19 L6 -13 Z" fill="#f6b8c6" />
        <ellipse cx={0} cy={0} rx={19} ry={16} fill="#f0a35c" />
        <ellipse cx={0} cy={6} rx={11} ry={8} fill="#fff4e4" />
        <path
          d="M-10 -1 Q-6 3 -2 -1 M2 -1 Q6 3 10 -1"
          fill="none"
          stroke="#4a2c20"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path d="M-1.5 4 H1.5 L0 6 Z" fill="#d9476e" />
        <path
          d="M-8 -12 q2 4 0 7 M0 -14 q2 4 0 7 M8 -12 q2 4 0 7"
          fill="none"
          stroke="#c46a2a"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <ellipse cx={-11} cy={5} rx={4} ry={2.4} fill="#f6b8c6" opacity={0.6} />
        <ellipse cx={11} cy={5} rx={4} ry={2.4} fill="#f6b8c6" opacity={0.6} />
      </g>
      <g className="pa-parlour-cat__zzz" fill="#6c53a3" fontWeight={800} fontFamily="Georgia, serif">
        <text x={-4} y={-58} fontSize={14}>
          z
        </text>
        <text x={8} y={-72} fontSize={18}>
          z
        </text>
      </g>
    </g>
  );
}
