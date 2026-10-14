interface HourBeadsProps {
  readonly left: number;
  readonly total: number;
}

export function HourBeads({ left, total }: HourBeadsProps) {
  return (
    <div className="jb-beads" role="img" aria-label={`${left} of ${total} hours left today`}>
      <svg viewBox={`0 0 ${total * 22 + 12} 28`} aria-hidden="true">
        <path
          d={`M2 14 Q${total * 11 + 6} 22 ${total * 22 + 10} 14`}
          fill="none"
          stroke="#7a5236"
          strokeWidth={1.4}
        />
        {Array.from({ length: total }, (_, index) => {
          const x = 14 + index * 22;
          const y = 14 + Math.sin((Math.PI * (index + 0.5)) / total) * 4;
          const lit = index < left;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={8}
                fill={lit ? "#e8a33d" : "#e2d1bb"}
                stroke={lit ? "#b8741c" : "#c9b59c"}
                strokeWidth={1.2}
              />
              {lit ? <circle cx={x - 2.6} cy={y - 2.6} r={2.2} fill="#fff3d0" /> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
