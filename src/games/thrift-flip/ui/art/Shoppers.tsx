export interface ShoppersProps {
  readonly className?: string | undefined;
  readonly busy: boolean;
}

const FIGURES: readonly (readonly [number, number, string, string])[] = [
  [70, 1, "#7a8fb0", "#f08a3c"],
  [200, 0.9, "#a9c7b8", "#3f5d84"],
  [330, 1.05, "#d9a28b", "#8fcfb2"],
  [460, 0.95, "#b7a8cf", "#f6d36b"],
  [590, 1, "#9bb7a2", "#e57a8f"],
];

export function Shoppers({ className, busy }: ShoppersProps) {
  return (
    <svg
      className={className ? `tf-shoppers ${className}` : "tf-shoppers"}
      viewBox="0 0 660 200"
      aria-hidden="true"
      focusable="false"
    >
      {FIGURES.map(([x, scale, body, bag], index) => (
        <g key={x} transform={`translate(${x} ${200 - 190 * scale}) scale(${scale})`}>
          <g
            className={busy ? "tf-shopper tf-shopper--busy" : "tf-shopper"}
            style={{ animationDelay: `${index * 160}ms` }}
          >
            <ellipse cx={0} cy={186} rx={34} ry={6} fill="#2b2230" opacity={0.12} />
            <circle cx={0} cy={36} r={22} fill={body} opacity={0.9} />
            <path d="M-30 186 L-26 96 Q-24 66 0 64 Q24 66 26 96 L30 186 Z" fill={body} />
            <path d={`M26 110 L44 112 L46 150 L22 150 Z`} fill={bag} />
            <path d="M30 112 Q35 98 40 112" fill="none" stroke={bag} strokeWidth={3} />
          </g>
        </g>
      ))}
    </svg>
  );
}
