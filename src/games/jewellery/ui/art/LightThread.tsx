interface LightThreadProps {
  readonly points: readonly { readonly x: number; readonly y: number }[];
  readonly drawn: number;
  readonly brightness: number;
  readonly glow: string;
}

export function LightThread({ points, drawn, brightness, glow }: LightThreadProps) {
  if (points.length < 2 || drawn <= 0) return null;
  const [first, ...rest] = points;
  if (first === undefined) return null;
  const d = `M${first.x} ${first.y} ${rest
    .map((point, index) => {
      const before = points[index] ?? first;
      return `Q${(before.x + point.x) / 2} ${Math.min(before.y, point.y) - 60} ${point.x} ${point.y}`;
    })
    .join(" ")}`;
  const strength = 0.35 + 0.65 * Math.min(1, Math.max(0, brightness));
  return (
    <g data-testid="light-thread" data-brightness={brightness.toFixed(2)}>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={glow}
        strokeWidth={14}
        strokeLinecap="round"
        opacity={0.25 * strength}
        strokeDasharray={`${drawn} 1`}
      />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="#fffbe9"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={strength}
        strokeDasharray={`${drawn} 1`}
      />
    </g>
  );
}
