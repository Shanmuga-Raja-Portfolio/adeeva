export interface SawSpriteProps {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly size: number;
  readonly working: boolean;
}

export function SawSprite({ x, y, angle, size, working }: SawSpriteProps) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${size / 24})`}
      className={working ? "jb-saw jb-saw--working" : "jb-saw"}
      aria-hidden="true"
    >
      <path
        d="M-2 0 L-2 -16 L16 -16 L16 -9"
        fill="none"
        stroke="#5b6573"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <rect x={13} y={-12} width={6} height={13} rx={2} fill="#7a5236" stroke="#3e2716" strokeWidth={0.8} />
      <path d="M-2 0 L-2 -16" stroke="#e7ebf0" strokeWidth={0.9} />
      <circle r={2.2} fill="#ffffff" stroke="#1f4e5a" strokeWidth={0.9} />
    </g>
  );
}
