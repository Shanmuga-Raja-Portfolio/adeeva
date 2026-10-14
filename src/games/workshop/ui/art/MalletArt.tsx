export function MalletArt({ size }: { readonly size: number }) {
  return (
    <svg viewBox="-24 -24 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <g transform="rotate(-35)" stroke="#2f2622" strokeWidth={2.4} strokeLinejoin="round">
        <rect x={-3.5} y={-3} width={7} height={26} rx={3} fill="#c58a4a" />
        <rect x={-15} y={-17} width={30} height={16} rx={4} fill="#f2c230" />
        <rect x={-15} y={-17} width={8} height={16} rx={3} fill="#c99a12" />
        <path d="M-4 -14 H10" stroke="#fff6d0" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    </svg>
  );
}

interface MalletRingProps {
  readonly radius: number;
  readonly targetRadius: number;
  readonly good: boolean;
}

export function MalletRing({ radius, targetRadius, good }: MalletRingProps) {
  return (
    <g className="ww-ring" aria-hidden="true">
      <circle r={targetRadius} fill="none" stroke="#3f6b4f" strokeWidth={1.6} strokeDasharray="2 1.6" />
      <circle r={radius} fill="none" stroke={good ? "#3f6b4f" : "#f2c230"} strokeWidth={good ? 2.4 : 1.8} />
    </g>
  );
}
