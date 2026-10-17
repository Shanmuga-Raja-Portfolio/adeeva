export interface SceneLightProps {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly warmth: string;
}

const SHAFTS: readonly (readonly [number, number])[] = [
  [0.58, 0.07],
  [0.72, 0.1],
  [0.9, 0.06],
];

const MOTES: readonly (readonly [number, number, number])[] = [
  [0.22, 0.32, 2.4],
  [0.36, 0.18, 1.8],
  [0.48, 0.4, 2.2],
  [0.63, 0.26, 1.6],
  [0.77, 0.44, 2.6],
  [0.86, 0.22, 1.9],
  [0.3, 0.55, 1.5],
];

export function SceneLight({ id, width, height, warmth }: SceneLightProps) {
  return (
    <g className="tf-scene-light" pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-shaft`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={warmth} stopOpacity={0.55} />
          <stop offset="0.7" stopColor={warmth} stopOpacity={0.08} />
          <stop offset="1" stopColor={warmth} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-sunspot`} cx="0.9" cy="0" r="0.8">
          <stop offset="0" stopColor={warmth} stopOpacity={0.6} />
          <stop offset="0.5" stopColor={warmth} stopOpacity={0.16} />
          <stop offset="1" stopColor={warmth} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a1c" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.24} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-sunspot)`} style={{ mixBlendMode: "screen" }} />
      {SHAFTS.map(([start, spread]) => {
        const x = width * start;
        const w = width * spread;
        return (
          <path
            key={start}
            d={`M${x} 0 L${x + w} 0 L${x + w - width * 0.42} ${height} L${x - width * 0.5} ${height} Z`}
            fill={`url(#${id}-shaft)`}
            opacity={0.5}
            style={{ mixBlendMode: "screen" }}
          />
        );
      })}
      <rect y={height * 0.78} width={width} height={height * 0.22} fill={`url(#${id}-floor)`} />
      {MOTES.map(([mx, my, r], index) => (
        <circle
          key={mx}
          className="tf-mote"
          cx={width * mx}
          cy={height * my}
          r={r}
          fill="#fffbe8"
          opacity={0.75}
          style={{ animationDelay: `${index * 410}ms` }}
        />
      ))}
    </g>
  );
}
