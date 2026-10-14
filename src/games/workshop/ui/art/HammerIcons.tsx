const MAX_HAMMERS = 3;

interface HammerIconsProps {
  readonly count: number;
}

export function HammerIcons({ count }: HammerIconsProps) {
  return (
    <span className="ww-hammers" role="img" aria-label={`Tough wood: ${count} of ${MAX_HAMMERS} hammers`}>
      {Array.from({ length: MAX_HAMMERS }, (_, index) => (
        <svg
          key={index}
          viewBox="-12 -12 24 24"
          width={16}
          height={16}
          className={index < count ? undefined : "ww-hammers__off"}
          aria-hidden="true"
        >
          <g transform="rotate(-35)">
            <rect x={-1.8} y={-2} width={3.6} height={13} rx={1.5} fill="currentColor" />
            <rect x={-7} y={-8} width={14} height={7} rx={2} fill="currentColor" />
          </g>
        </svg>
      ))}
    </span>
  );
}
