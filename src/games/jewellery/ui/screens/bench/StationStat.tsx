export type StationTone = "gold" | "teal" | "rose";

interface StationStatProps {
  readonly label: string;
  readonly value: string;
  readonly fill: number | null;
  readonly tone: StationTone;
}

export function StationStat({ label, value, fill, tone }: StationStatProps) {
  const share = fill === null ? 0 : Math.max(0, Math.min(1, fill));
  return (
    <span className={`jb-stat jb-stat--${tone}${share >= 1 ? " jb-stat--full" : ""}`}>
      <span className="jb-stat__label">{label}</span>
      <strong className="jb-stat__value">{value}</strong>
      <span className="jb-stat__bar" aria-hidden="true">
        <span className="jb-stat__fill" style={{ width: `${share * 100}%` }} />
      </span>
    </span>
  );
}
