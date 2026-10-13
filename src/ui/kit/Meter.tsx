import { useId } from "react";

export type MeterTone = "rose" | "sage" | "gold" | "ink";

export interface MeterProps {
  label: string;
  value: number;
  max?: number | undefined;
  min?: number | undefined;
  tone?: MeterTone | undefined;
  showValue?: boolean | undefined;
  valueText?: string | undefined;
  className?: string | undefined;
}

export function Meter({
  label,
  value,
  max = 100,
  min = 0,
  tone = "rose",
  showValue = true,
  valueText,
  className,
}: MeterProps) {
  const labelId = useId();
  const span = max - min;
  const ratio = span > 0 ? Math.min(1, Math.max(0, (value - min) / span)) : 0;
  const text = valueText ?? `${Math.round(value)} / ${max}`;
  const classes = ["ad-meter", tone === "rose" ? "" : `ad-meter--${tone}`, className ?? ""]
    .filter((name) => name.length > 0)
    .join(" ");
  return (
    <div className={classes}>
      <div className="ad-meter__row">
        <span id={labelId} className="ad-meter__label">
          {label}
        </span>
        {showValue ? <span className="ad-meter__value">{text}</span> : null}
      </div>
      <div
        className="ad-meter__track"
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text}
      >
        <div className="ad-meter__fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
