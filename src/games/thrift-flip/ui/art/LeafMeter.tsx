import { useSvgId } from "../../../../ui/art/useSvgId";

export interface LeafMeterProps {
  readonly leaves: number;
  readonly size?: number | undefined;
  readonly label?: string | undefined;
}

const LEAF = "M12 2 C 22 6 24 18 12 30 C 0 18 2 6 12 2 Z";

export function LeafMeter({ leaves, size = 28, label = "Leaves" }: LeafMeterProps) {
  const id = useSvgId("leaves");
  const value = Math.max(0, Math.min(100, Math.round(leaves)));
  const filled = value / 20;
  return (
    <span
      className="tf-leaf-meter"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value} leaves out of 100`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const share = Math.max(0, Math.min(1, filled - index));
        return (
          <svg
            key={index}
            viewBox="0 0 24 32"
            width={size * 0.75}
            height={size}
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <clipPath id={`${id}-${index}`}>
                <rect x={0} y={32 - 32 * share} width={24} height={32 * share} />
              </clipPath>
            </defs>
            <path d={LEAF} fill="#e6efe4" stroke="#7fae93" strokeWidth={1.4} />
            <path d={LEAF} fill="#4fa57a" clipPath={`url(#${id}-${index})`} />
            <path
              d="M12 6 L12 28"
              stroke={share > 0.5 ? "#e2f4ea" : "#7fae93"}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </svg>
        );
      })}
      <strong className="tf-leaf-meter__value">{value}</strong>
    </span>
  );
}
