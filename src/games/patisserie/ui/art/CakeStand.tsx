export interface CakeStandProps {
  readonly width: number;
  readonly y: number;
}

export function CakeStand({ width, y }: CakeStandProps) {
  const half = width / 2;
  return (
    <g className="pa-cake-stand">
      <ellipse cx={200} cy={y + 62} rx={half * 0.62} ry={9} fill="#3b2620" opacity={0.12} />
      <path
        d={`M${200 - 28} ${y + 58} Q200 ${y + 50} ${200 + 28} ${y + 58} L${200 + 14} ${y + 22} Q200 ${y + 26} ${200 - 14} ${y + 22} Z`}
        fill="#f3ece0"
        stroke="#cbbca6"
        strokeWidth={1.4}
      />
      <ellipse cx={200} cy={y + 58} rx={34} ry={7} fill="#efe6d6" stroke="#cbbca6" strokeWidth={1.4} />
      <ellipse cx={200} cy={y + 8} rx={half} ry={16} fill="#e8dfcf" />
      <ellipse cx={200} cy={y} rx={half} ry={16} fill="#fbf8f2" stroke="#cbbca6" strokeWidth={1.6} />
      <path
        d={`M${200 - half + 10} ${y - 2} Q200 ${y + 14} ${200 + half - 10} ${y - 2}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        opacity={0.7}
      />
    </g>
  );
}
