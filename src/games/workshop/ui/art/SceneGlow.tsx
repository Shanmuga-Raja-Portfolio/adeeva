interface SceneGlowProps {
  readonly id: string;
  readonly warmth: string;
  readonly from: readonly [number, number];
  readonly evening: boolean;
}

const MOTES: readonly (readonly [number, number, number])[] = [
  [0.36, 0.42, 3.2],
  [0.42, 0.3, 2.2],
  [0.47, 0.55, 2.8],
  [0.53, 0.38, 1.8],
  [0.58, 0.62, 2.4],
  [0.64, 0.46, 2],
  [0.4, 0.68, 1.6],
  [0.7, 0.3, 2.6],
  [0.75, 0.56, 1.7],
  [0.31, 0.52, 2],
];

export function SceneGlow({ id, warmth, from, evening }: SceneGlowProps) {
  const [fx, fy] = from;
  return (
    <g className="ww-glow" pointerEvents="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-pool`} cx={fx / 1200} cy={fy / 700} r="0.85">
          <stop offset="0" stopColor={warmth} stopOpacity={evening ? 0.36 : 0.42} />
          <stop offset="0.45" stopColor={warmth} stopOpacity={0.14} />
          <stop offset="1" stopColor={warmth} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={warmth} stopOpacity={0.5} />
          <stop offset="0.7" stopColor={warmth} stopOpacity={0.06} />
          <stop offset="1" stopColor={warmth} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.48" r="0.75">
          <stop offset="0.6" stopColor="#2f1d12" stopOpacity={0} />
          <stop offset="1" stopColor="#2f1d12" stopOpacity={evening ? 0.4 : 0.26} />
        </radialGradient>
        <radialGradient id={`${id}-mote`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={1} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={700} fill={`url(#${id}-pool)`} style={{ mixBlendMode: "screen" }} />
      {[0, 1, 2].map((ray) => (
        <path
          key={ray}
          d={`M${fx + ray * 40} ${fy} L${fx + 60 + ray * 50} ${fy} L${fx + 520 + ray * 120} 700 L${fx + 300 + ray * 110} 700 Z`}
          fill={`url(#${id}-ray)`}
          opacity={0.42 - ray * 0.1}
          style={{ mixBlendMode: "screen" }}
        />
      ))}
      {MOTES.map(([mx, my, r], index) => (
        <circle
          key={mx}
          className="ww-glow__mote"
          cx={1200 * mx}
          cy={700 * my}
          r={r * 2.2}
          fill={`url(#${id}-mote)`}
          style={{ animationDelay: `${index * 380}ms` }}
        />
      ))}
      <rect width={1200} height={700} fill={`url(#${id}-vignette)`} />
    </g>
  );
}
