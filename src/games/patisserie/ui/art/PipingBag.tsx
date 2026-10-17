import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten } from "../../../../ui/art/colourMix";

export interface PipingBagProps {
  readonly at: Point;
  readonly icing: string;
  readonly squeezing: boolean;
}

export function PipingBag({ at, icing, squeezing }: PipingBagProps) {
  const squash = squeezing ? 0.86 : 1;
  return (
    <g
      transform={`translate(${at[0]} ${at[1]}) rotate(-52) scale(0.07 ${0.07 * squash})`}
      pointerEvents="none"
      className="pa-piping-bag"
    >
      <ellipse cx={70} cy={30} rx={64} ry={14} fill="#3b2620" opacity={0.16} />
      <path d="M0 0 L14 -7 V7 Z" fill="#c9cfdc" stroke="#7d8699" strokeWidth={1.6} />
      <path d="M2 -2 L12 -5" stroke="#ffffff" strokeWidth={1.6} opacity={0.8} />
      <path
        d="M14 -9 Q60 -30 98 -30 Q108 0 98 30 Q60 30 14 9 Z"
        fill={lighten(icing, 0.55)}
        stroke={darken(icing, 0.3)}
        strokeWidth={2}
      />
      <path
        d="M20 -6 Q58 -22 92 -22"
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.6}
        fill="none"
      />
      <path
        d="M26 4 Q60 14 92 16"
        stroke={darken(icing, 0.15)}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      />
      <path
        d="M98 -30 Q112 -10 124 -14 Q114 0 124 14 Q112 10 98 30 Q108 0 98 -30 Z"
        fill="#f6e7cf"
        stroke="#c9b48a"
        strokeWidth={1.6}
      />
      <circle cx={0} cy={0} r={3} fill={icing} />
    </g>
  );
}
