import { darken, lighten } from "../../../../ui/art/colourMix";
import type { PatternChoice } from "../../content/pipePattern";

export interface CupcakeArtProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly sponge: string;
  readonly icing: string;
  readonly paper: string;
  readonly pattern: PatternChoice;
  readonly iced: boolean;
  readonly filled: string | null;
}

const PETALS = [0, 72, 144, 216, 288];

export function CupcakeArt({ x, y, scale, sponge, icing, paper, pattern, iced, filled }: CupcakeArtProps) {
  const edge = darken(icing, 0.18);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={31} rx={34} ry={6} fill="#3b2620" opacity={0.14} />
      <path d="M-34 -4 L-26 30 H26 L34 -4 Z" fill={paper} stroke={darken(paper, 0.22)} strokeWidth={1.4} />
      {[-24, -14, -4, 6, 16, 26].map((dx) => (
        <path
          key={dx}
          d={`M${dx} -4 L${dx * 0.8} 30`}
          stroke={darken(paper, 0.16)}
          strokeWidth={1.2}
          opacity={0.7}
        />
      ))}
      <path
        d="M-36 -2 Q-36 -26 0 -28 Q36 -26 36 -2 Z"
        fill={sponge}
        stroke={darken(sponge, 0.2)}
        strokeWidth={1.2}
      />
      <path d="M10 -4 L34 -4 L26 30 H6 Z" fill="#3b2620" opacity={0.1} />
      {filled !== null && !iced ? (
        <circle cx={0} cy={-12} r={7} fill={filled} stroke={darken(filled, 0.2)} />
      ) : null}
      {iced && pattern === "a" ? (
        <g>
          <path
            d="M-34 -6 Q-36 -24 -16 -26 Q0 -28 16 -26 Q36 -24 34 -6 Q0 2 -34 -6 Z"
            fill={icing}
            stroke={edge}
            strokeWidth={1.2}
          />
          <path
            d="M-24 -20 Q-26 -36 -6 -38 Q16 -38 22 -24 Q0 -16 -24 -20 Z"
            fill={lighten(icing, 0.08)}
            stroke={edge}
            strokeWidth={1.2}
          />
          <path
            d="M-12 -34 Q-12 -50 4 -52 Q14 -46 10 -34 Q0 -30 -12 -34 Z"
            fill={lighten(icing, 0.14)}
            stroke={edge}
            strokeWidth={1.2}
          />
          <path
            d="M-20 -14 Q0 -8 22 -14 M-14 -28 Q2 -24 16 -30"
            stroke={lighten(icing, 0.45)}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx={-14}
            cy={-28}
            rx={7}
            ry={3.5}
            fill="#ffffff"
            opacity={0.5}
            transform="rotate(-20 -14 -28)"
          />
          <ellipse cx={-4} cy={-44} rx={4} ry={2.4} fill="#ffffff" opacity={0.55} />
        </g>
      ) : null}
      {iced && pattern === "b" ? (
        <g>
          <path d="M-34 -6 Q-36 -22 0 -24 Q36 -22 34 -6 Q0 2 -34 -6 Z" fill={lighten(icing, 0.3)} />
          {PETALS.map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-9}
              rx={9}
              ry={13}
              fill={icing}
              stroke={edge}
              strokeWidth={1.2}
              transform={`translate(0 -14) rotate(${angle}) translate(0 -9) scale(1 0.6) translate(0 9)`}
            />
          ))}
          <circle cx={0} cy={-16} r={7} fill={lighten(icing, 0.15)} stroke={edge} strokeWidth={1.2} />
        </g>
      ) : null}
    </g>
  );
}
