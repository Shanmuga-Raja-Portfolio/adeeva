import { darken, lighten } from "../../../../ui/art/colourMix";

interface PaperLanternProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly hex: string | null;
  readonly glowId?: string | undefined;
}

const UNLIT = "#d9c9b4";

export function PaperLantern({ x, y, size, hex, glowId }: PaperLanternProps) {
  const body = hex ?? UNLIT;
  const lit = hex !== null;
  const w = size * 0.5;
  const h = size * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit && glowId !== undefined ? <circle r={size * 1.1} fill={`url(#${glowId})`} /> : null}
      <path d={`M0 ${-h - size * 0.24} L0 ${-h}`} stroke="#2a1c30" strokeWidth={size * 0.04} />
      <rect
        x={-w * 0.45}
        y={-h - size * 0.04}
        width={w * 0.9}
        height={size * 0.1}
        rx={size * 0.03}
        fill="#3b2740"
      />
      <ellipse
        rx={w}
        ry={h}
        fill={body}
        stroke={darken(body, 0.35)}
        strokeWidth={size * 0.035}
        opacity={lit ? 1 : 0.8}
      />
      {[-0.55, 0, 0.55].map((offset) => (
        <ellipse
          key={offset}
          cx={offset * w * 0.6}
          rx={w * (1 - Math.abs(offset) * 0.6)}
          ry={h}
          fill="none"
          stroke={darken(body, 0.2)}
          strokeOpacity={0.45}
          strokeWidth={size * 0.02}
        />
      ))}
      {lit ? (
        <ellipse
          cx={-w * 0.3}
          cy={-h * 0.3}
          rx={w * 0.28}
          ry={h * 0.4}
          fill={lighten(body, 0.6)}
          opacity={0.55}
        />
      ) : null}
      <rect
        x={-w * 0.45}
        y={h - size * 0.06}
        width={w * 0.9}
        height={size * 0.1}
        rx={size * 0.03}
        fill="#3b2740"
      />
      <path
        d={`M0 ${h + size * 0.04} L0 ${h + size * 0.24}`}
        stroke={darken(body, 0.4)}
        strokeWidth={size * 0.05}
      />
    </g>
  );
}
