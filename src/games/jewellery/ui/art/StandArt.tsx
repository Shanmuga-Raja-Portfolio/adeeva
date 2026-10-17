import type { ReactNode } from "react";

interface StandArtProps {
  readonly x: number;
  readonly y: number;
  readonly plinth: boolean;
  readonly children?: ReactNode;
}

export function StandArt({ x, y, plinth, children }: StandArtProps) {
  const height = plinth ? 70 : 40;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000000" opacity={0.2} />
      <rect
        x={-56}
        y={-height}
        width={112}
        height={height}
        rx={8}
        fill={plinth ? "#7a2f3f" : "#1f4e5a"}
        stroke="#2a1c30"
        strokeWidth={3}
      />
      <rect
        x={-62}
        y={-height - 10}
        width={124}
        height={14}
        rx={6}
        fill={plinth ? "#e8c27a" : "#2f6b78"}
        stroke="#2a1c30"
        strokeWidth={2}
      />
      {plinth ? (
        <path d={`M-20 ${-height / 2} l20 -12 l20 12 l-20 12 Z`} fill="#e8c27a" opacity={0.8} />
      ) : null}
      <g transform={`translate(0 ${-height - 10})`}>{children}</g>
    </g>
  );
}
