import { darken, lighten } from "../../../../ui/art/colourMix";
import type { TrayProductId } from "../../content/product";

export interface TreatIconProps {
  readonly productId: TrayProductId;
  readonly colour: string;
  readonly size: number;
}

export function TreatIcon({ productId, colour, size }: TreatIconProps) {
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
      {productId === "cupcake-tray" ? (
        <g>
          <path d="M-18 2 L-13 22 H13 L18 2 Z" fill="#f4a259" stroke="#c86a24" strokeWidth={1.2} />
          <path d="M-10 4 L-8 21 M0 4 V21 M10 4 L8 21" stroke="#c86a24" strokeWidth={1} />
          <path
            d="M-20 4 Q-22 -10 -8 -12 Q0 -24 8 -12 Q22 -10 20 4 Z"
            fill={colour}
            stroke={darken(colour, 0.2)}
            strokeWidth={1.2}
          />
          <path
            d="M-10 -4 Q0 -10 10 -4"
            stroke={lighten(colour, 0.5)}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g>
          <circle r={22} fill="#efcf8e" stroke="#b98a4a" strokeWidth={1.4} />
          <circle r={17} fill={lighten(colour, 0.55)} stroke={colour} strokeWidth={4} />
          <circle cx={-6} cy={-6} r={3} fill="#ffffff" opacity={0.6} />
        </g>
      )}
    </svg>
  );
}
