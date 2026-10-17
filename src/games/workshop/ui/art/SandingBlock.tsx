interface SandingBlockProps {
  readonly x: number;
  readonly y: number;
}

const OUTLINE = "#2f2622";

export function SandingBlock({ x, y }: SandingBlockProps) {
  return (
    <g transform={`translate(${x} ${y})`} className="ww-sand-bench__block" pointerEvents="none">
      <g
        className="ww-sand-bench__whoosh"
        stroke="#fffaf0"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      >
        <path d="M-44 -8 h-10 M-46 0 h-16 M-44 8 h-10" opacity={0.85} />
        <path d="M44 -8 h10 M46 0 h16 M44 8 h10" opacity={0.85} />
      </g>
      <ellipse cx={2} cy={20} rx={34} ry={6} fill={OUTLINE} opacity={0.22} />
      <path d="M-32 6 H32 L30 16 Q0 20 -30 16 Z" fill="#e7cf9e" stroke={OUTLINE} strokeWidth={1.4} />
      <g fill="#b39566">
        <circle cx={-22} cy={12} r={0.9} />
        <circle cx={-12} cy={14} r={0.8} />
        <circle cx={-2} cy={11} r={0.9} />
        <circle cx={9} cy={14} r={0.8} />
        <circle cx={20} cy={12} r={0.9} />
      </g>
      <path
        d="M-30 -10 Q-30 -16 -24 -16 H24 Q30 -16 30 -10 V6 H-30 Z"
        fill="#c0392b"
        stroke={OUTLINE}
        strokeWidth={1.6}
      />
      <path d="M-27 -12 H26" stroke="#e8705f" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M-30 1 H30" stroke="#8e2a1f" strokeWidth={1.2} />
      <path d="M-16 -16 Q-16 -30 0 -30 Q16 -30 16 -16" fill="#3a3a40" stroke={OUTLINE} strokeWidth={1.6} />
      <path d="M-10 -22 Q0 -27 10 -22" stroke="#8a8a96" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <rect x={-6} y={-9} width={12} height={6} rx={2} fill="#f2c230" stroke={OUTLINE} strokeWidth={1} />
      <g fill="#f3e6cc" opacity={0.9}>
        <circle cx={-36} cy={14} r={2.2} />
        <circle cx={-40} cy={9} r={1.5} />
        <circle cx={37} cy={15} r={2} />
        <circle cx={41} cy={10} r={1.3} />
      </g>
    </g>
  );
}
