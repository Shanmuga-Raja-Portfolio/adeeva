interface PencilTicksProps {
  readonly left: number;
  readonly total: number;
}

export function PencilTicks({ left, total }: PencilTicksProps) {
  const used = total - left;
  return (
    <div
      className="ww-ticks"
      role="meter"
      aria-label="Hours left today"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={left}
      aria-valuetext={`${left} of ${total} hours left`}
    >
      <svg viewBox={`0 0 ${total * 22 + 10} 48`} aria-hidden="true" focusable="false">
        {Array.from({ length: total }, (_, index) => {
          const x = 10 + index * 22;
          const spent = index < used;
          const lean = ((index * 37) % 7) - 3;
          return (
            <g key={index} className={spent ? "ww-ticks__tick ww-ticks__tick--spent" : "ww-ticks__tick"}>
              <path
                d={`M${x} 8 Q${x + lean * 0.4} 22 ${x + lean} 38`}
                stroke={spent ? "#b9a48f" : "#2f2622"}
                strokeWidth={spent ? 3 : 4.5}
                strokeLinecap="round"
                fill="none"
              />
              {spent ? (
                <path
                  d={`M${x - 8} 30 L${x + 10} 14`}
                  stroke="#c0392b"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <span className="ww-ticks__label">
        {left} of {total} hours left
      </span>
    </div>
  );
}
