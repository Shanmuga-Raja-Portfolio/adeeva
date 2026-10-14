interface SawSpriteProps {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly scale: number;
  readonly busy: boolean;
}

const OUTLINE = "#2f2622";

export function SawSprite({ x, y, angle, scale, busy }: SawSpriteProps) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
      className={busy ? "ww-saw ww-saw--busy" : "ww-saw"}
      pointerEvents="none"
    >
      <g className="ww-saw__body">
        <path
          d="M-2 0 L-26 0 L-26 -7 L-4 -10 Z"
          fill="#d7dde2"
          stroke={OUTLINE}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
        <path
          d="M-26 0 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4 l1.2 1.4 l1.2 -1.4"
          fill="#aeb7bf"
          stroke={OUTLINE}
          strokeWidth={0.35}
        />
        <path d="M-6 -11 h8 a3 3 0 0 1 3 3 v8 h-11 Z" fill="#c0392b" stroke={OUTLINE} strokeWidth={0.6} />
        <rect x={-3.5} y={-8} width={5} height={4} rx={1.6} fill="#fbf3e6" />
        <path d="M-22 -4 l14 -2" stroke="#ffffff" strokeWidth={0.6} strokeLinecap="round" opacity={0.8} />
      </g>
    </g>
  );
}
