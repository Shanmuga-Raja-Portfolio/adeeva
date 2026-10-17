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
      <ellipse cx={9} cy={2} rx={12} ry={3} fill="#2a1d2c" opacity={0.22} />
      <path
        d="M-2 0 L-2 -17 Q-2 -19 0 -19 L14 -19 Q16 -19 16 -17 L16 -9"
        fill="none"
        stroke="#3d4450"
        strokeWidth={3.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M-2 0 L-2 -17 Q-2 -19 0 -19 L14 -19 Q16 -19 16 -17 L16 -9"
        fill="none"
        stroke="#b9c2cd"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M0.5 -18.4 L13 -18.4"
        stroke="#ffffff"
        strokeOpacity={0.8}
        strokeWidth={0.6}
        strokeLinecap="round"
      />
      <rect
        x={12.4}
        y={-12}
        width={7.2}
        height={16}
        rx={3.2}
        fill="#9a6a44"
        stroke="#3e2716"
        strokeWidth={0.9}
      />
      <rect x={13.6} y={-11} width={2} height={14} rx={1} fill="#c99a6e" opacity={0.8} />
      <path d="M12.6 -6 L19.4 -6 M12.6 -2 L19.4 -2" stroke="#3e2716" strokeOpacity={0.55} strokeWidth={0.7} />
      <rect
        x={12}
        y={-13.4}
        width={8}
        height={2.4}
        rx={1}
        fill="#c9a227"
        stroke="#5b470b"
        strokeWidth={0.5}
      />
      <path d="M-2 0 L-2 -17" stroke="#eef2f6" strokeWidth={0.8} />
      {working ? (
        <g>
          <circle r={3.4} fill="#fff3c8" opacity={0.55} />
          <path d="M0 -3.4 L0.8 -0.8 L3.4 0 L0.8 0.8 L0 3.4 L-0.8 0.8 L-3.4 0 L-0.8 -0.8 Z" fill="#ffffff" />
        </g>
      ) : (
        <circle r={2.2} fill="#ffffff" stroke="#1f4e5a" strokeWidth={0.9} />
      )}
    </g>
  );
}
