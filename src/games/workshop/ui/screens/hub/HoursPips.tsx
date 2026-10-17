interface HoursPipsProps {
  readonly left: number;
  readonly total: number;
}

export function HoursPips({ left, total }: HoursPipsProps) {
  const used = total - left;
  return (
    <div
      className="ww-pips"
      role="meter"
      aria-label="Hours left today"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={left}
      aria-valuetext={`${left} of ${total} hours left`}
    >
      <span className="ww-pips__label">Hours left</span>
      <span className="ww-pips__row" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index < used ? "ww-pips__pip ww-pips__pip--spent" : "ww-pips__pip"} />
        ))}
      </span>
      <strong className="ww-pips__count">
        {left} <small>of {total} h</small>
      </strong>
    </div>
  );
}
