const DOT_COLOURS = ["#c8664a", "#f6d77a", "#7d8a4a", "#3c6aa8", "#b9a7dc", "#e98a6c"];

interface PaintDotsProps {
  readonly left: number;
  readonly total: number;
}

export function PaintDots({ left, total }: PaintDotsProps) {
  return (
    <div className="is-dots" role="img" aria-label={`${left} of ${total} hours left today`}>
      <svg viewBox={`0 0 ${total * 24 + 8} 28`} aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const x = 16 + index * 24;
          const lit = index < left;
          const colour = DOT_COLOURS[index % DOT_COLOURS.length] ?? "#c8664a";
          return (
            <g key={index}>
              <path
                d={`M${x - 9} 15 C${x - 10} 6 ${x - 2} 3 ${x + 4} 5 C${x + 11} 7 ${x + 11} 16 ${x + 6} 21 C${x + 1} 25 ${x - 8} 23 ${x - 9} 15 Z`}
                fill={lit ? colour : "#e6d4c4"}
                stroke={lit ? "#3b2a33" : "#cdb8a5"}
                strokeWidth={1.2}
              />
              {lit ? <circle cx={x - 2} cy={10} r={2.2} fill="#ffffff" opacity={0.7} /> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
