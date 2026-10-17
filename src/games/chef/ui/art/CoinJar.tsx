import { useSvgId } from "../../../../ui/art/useSvgId";

export interface CoinJarProps {
  readonly fill: number;
  readonly className?: string | undefined;
}

const COIN_ROWS = 6;

export function CoinJar({ fill, className }: CoinJarProps) {
  const id = useSvgId("ck-jar");
  const rows = Math.round(Math.max(0, Math.min(1, fill)) * COIN_ROWS);
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#dff1f6" stopOpacity={0.25} />
          <stop offset="1" stopColor="#9fc3cf" stopOpacity={0.45} />
        </linearGradient>
        <radialGradient id={`${id}-coin`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.6" stopColor="#f2b83b" />
          <stop offset="1" stopColor="#b97a14" />
        </radialGradient>
      </defs>
      <ellipse cx={32} cy={68} rx={24} ry={3.5} fill="#0d1215" opacity={0.18} />
      {Array.from({ length: rows }, (_, row) => (
        <g key={row}>
          {[0, 1, 2].map((column) => (
            <ellipse
              key={column}
              cx={20 + column * 12 + (row % 2 === 0 ? 0 : 5)}
              cy={60 - row * 7}
              rx={7}
              ry={3.6}
              fill={`url(#${id}-coin)`}
              stroke="#9a6410"
              strokeWidth={0.8}
            />
          ))}
        </g>
      ))}
      <path
        d="M14 16 C10 20 9 26 9 34 L9 58 C9 64 14 67 20 67 L44 67 C50 67 55 64 55 58 L55 34 C55 26 54 20 50 16 Z"
        fill={`url(#${id}-glass)`}
        stroke="#7f9fab"
        strokeWidth={2}
      />
      <rect x={12} y={6} width={40} height={11} rx={4} fill="#c9563a" stroke="#8f2a14" strokeWidth={1.5} />
      <rect x={14} y={8} width={36} height={3} rx={1.5} fill="#ffffff" opacity={0.35} />
      <path d="M16 26 L16 56" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    </svg>
  );
}
