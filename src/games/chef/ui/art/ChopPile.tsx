import type { ReactNode } from "react";
import { darken, lighten, mixHex } from "../../../../ui/art/colourMix";
import type { CutKind } from "../../content/dish";

export interface ChopPileProps {
  readonly count: number;
  readonly cut: CutKind;
  readonly colour: string;
  readonly accent: string;
  readonly animated: boolean;
}

const SPOTS: readonly (readonly [number, number])[] = [
  [-30, 4],
  [0, 8],
  [30, 4],
  [-15, -10],
  [15, -10],
  [-44, -10],
  [44, -10],
  [0, -24],
  [-28, -26],
  [28, -26],
  [-14, -38],
  [14, -38],
];

function Piece({ cut, colour, accent }: Omit<ChopPileProps, "count" | "animated">): ReactNode {
  if (cut === "dice") {
    const flesh = mixHex(colour, "#f0952e", 0.22);
    return (
      <g>
        <path d="M-11 -4 L0 -10 L11 -4 L0 2 Z" fill={lighten(flesh, 0.32)} />
        <path d="M-11 -4 L0 2 L0 13 L-11 7 Z" fill={flesh} />
        <path d="M11 -4 L0 2 L0 13 L11 7 Z" fill={darken(flesh, 0.2)} />
        <ellipse cx={0} cy={-4} rx={5.4} ry={2.8} fill="none" stroke={lighten(flesh, 0.5)} strokeWidth={1} />
        <circle cx={-1.4} cy={-4.4} r={0.8} fill={darken(flesh, 0.45)} />
        <circle cx={1.4} cy={-4.2} r={0.8} fill={darken(flesh, 0.45)} />
        <circle cx={0} cy={-3.2} r={0.8} fill={darken(flesh, 0.45)} />
        <path d="M-9 -3.4 L-3 -7" stroke="#ffffff" strokeWidth={1.2} opacity={0.6} strokeLinecap="round" />
        <path d="M-9 3 L-2 7" stroke={lighten(flesh, 0.45)} strokeWidth={1.2} opacity={0.7} />
        <path
          d="M-11 -4 L0 -10 L11 -4 L11 7 L0 13 L-11 7 Z"
          fill="none"
          stroke={darken(colour, 0.35)}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </g>
    );
  }
  if (cut === "slice")
    return (
      <g>
        <ellipse cx={0} cy={3} rx={12} ry={6} fill={darken(colour, 0.2)} />
        <ellipse
          cx={0}
          cy={0}
          rx={12}
          ry={6}
          fill={lighten(colour, 0.15)}
          stroke={accent}
          strokeWidth={1.2}
        />
        <ellipse cx={0} cy={0} rx={6} ry={3} fill={lighten(colour, 0.4)} opacity={0.8} />
      </g>
    );
  return (
    <g>
      <circle cx={-4} cy={0} r={3.4} fill={colour} stroke={darken(colour, 0.3)} strokeWidth={0.8} />
      <circle
        cx={4}
        cy={2}
        r={2.8}
        fill={lighten(colour, 0.15)}
        stroke={darken(colour, 0.3)}
        strokeWidth={0.8}
      />
      <circle cx={0} cy={-4} r={2.4} fill={colour} stroke={darken(colour, 0.3)} strokeWidth={0.8} />
    </g>
  );
}

export function ChopPile({ count, cut, colour, accent, animated }: ChopPileProps) {
  const shown = Math.min(count, SPOTS.length);
  return (
    <g>
      <ellipse cx={0} cy={34} rx={78} ry={14} fill="#3b2410" opacity={0.22} />
      <path d="M-74 0 Q-70 44 0 46 Q70 44 74 0 Z" fill="#f4efe4" stroke="#b9ae98" strokeWidth={2} />
      <path d="M-62 8 Q-56 36 0 38" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.7} />
      <ellipse cx={0} cy={0} rx={74} ry={16} fill="#e6dccb" stroke="#b9ae98" strokeWidth={2} />
      <ellipse cx={0} cy={2} rx={62} ry={11} fill="#d7cab3" />
      <path d="M-74 0 Q-70 6 -60 8" stroke="#3d6fb4" strokeWidth={3} fill="none" opacity={0.5} />
      {SPOTS.slice(0, shown).map(([x, y], index) => (
        <g key={index} transform={`translate(${x} ${y})`}>
          <g className={animated ? "ck-chop__piece" : undefined}>
            <g transform="scale(1.4)">
              <Piece cut={cut} colour={colour} accent={accent} />
            </g>
          </g>
        </g>
      ))}
    </g>
  );
}
