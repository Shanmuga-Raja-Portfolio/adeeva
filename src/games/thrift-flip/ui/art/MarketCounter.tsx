import { darken, lighten } from "../../../../ui/art/colourMix";

export interface MarketCounterProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly cloth: string;
  readonly stacks: readonly string[];
}

const BUTTONS = ["#f08a3c", "#7b7fd1", "#e57a8f", "#8fcfb2", "#f6d36b", "#3f5d84"];

function FoldedStack({
  x,
  y,
  colours,
}: {
  readonly x: number;
  readonly y: number;
  readonly colours: readonly string[];
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {colours.map((colour, index) => (
        <g key={`${colour}-${index}`} transform={`translate(${index % 2 === 0 ? 0 : 3} ${-index * 11})`}>
          <rect
            x={-30}
            y={-11}
            width={60}
            height={12}
            rx={4}
            fill={colour}
            stroke={darken(colour, 0.28)}
            strokeWidth={1.5}
          />
          <path d="M-26 -6 H26" stroke={lighten(colour, 0.4)} strokeWidth={1.6} opacity={0.8} />
        </g>
      ))}
    </g>
  );
}

export function MarketCounter({ x, y, width, cloth, stacks }: MarketCounterProps) {
  const stripes = Math.max(4, Math.round(width / 28));
  const left = stacks.slice(0, 3);
  const right = [...stacks.slice(3), ...stacks.slice(0, 1)].slice(0, 3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={width / 2} cy={92} rx={width * 0.56} ry={12} fill="#3b2a1c" opacity={0.25} />
      <rect x={-8} y={0} width={width + 16} height={14} rx={4} fill="#b88b5e" />
      <rect x={-8} y={0} width={width + 16} height={4} rx={2} fill="#d9b083" />
      {Array.from({ length: stripes }, (_, index) => {
        const w = width / stripes;
        return (
          <path
            key={index}
            d={`M${index * w} 14 L${(index + 1) * w} 14 L${(index + 1) * w} 84 Q${(index + 0.5) * w} 90 ${index * w} 84 Z`}
            fill={index % 2 === 0 ? cloth : "#fff4e2"}
          />
        );
      })}
      <rect x={0} y={14} width={width} height={20} fill="#3b2a1c" opacity={0.14} />
      <FoldedStack x={46} y={-2} colours={left} />
      <FoldedStack x={width - 50} y={-2} colours={right} />
      <g transform={`translate(${width / 2 - 40} -4)`}>
        <path d="M-34 -30 L34 -30 L28 0 L-28 0 Z" fill="#c9965c" stroke="#8a6a4a" strokeWidth={2} />
        <path d="M-32 -22 H32 M-30 -12 H30" stroke="#8a6a4a" strokeWidth={1.5} opacity={0.6} />
        <path
          d="M-26 -30 Q-20 -52 0 -44 Q16 -58 28 -30 Z"
          fill="#e57a8f"
          stroke="#a84a5c"
          strokeWidth={1.5}
        />
        <path d="M-6 -30 Q4 -48 20 -40" fill="none" stroke="#fff4e2" strokeWidth={2} opacity={0.7} />
        <path d="M-30 -30 Q0 -64 30 -30" fill="none" stroke="#8a6a4a" strokeWidth={3} />
      </g>
      <g transform={`translate(${width / 2 + 34} -4)`}>
        <rect
          x={-16}
          y={-36}
          width={32}
          height={36}
          rx={6}
          fill="#dff1f6"
          opacity={0.85}
          stroke="#9fb9c2"
          strokeWidth={2}
        />
        <rect x={-18} y={-42} width={36} height={8} rx={3} fill="#a07a52" />
        {BUTTONS.map((colour, index) => (
          <circle
            key={colour}
            cx={-9 + (index % 3) * 9}
            cy={-8 - Math.floor(index / 3) * 9}
            r={4}
            fill={colour}
            stroke={darken(colour, 0.3)}
            strokeWidth={1}
          />
        ))}
        <path d="M-12 -32 V-4" stroke="#ffffff" strokeWidth={2} opacity={0.6} />
      </g>
    </g>
  );
}
