import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface CakeBodyProps {
  readonly cx: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly sponge: string;
  readonly coat: string | null;
  readonly fillingColour: string | null;
  readonly layered: boolean;
}

export function CakeBody({ cx, top, width, height, sponge, coat, fillingColour, layered }: CakeBodyProps) {
  const rx = width / 2;
  const ry = Math.max(10, width * 0.11);
  const bottom = top + height;
  const side = coat ?? sponge;
  const edge = darken(side, 0.28);
  const id = useSvgId("cake");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(side, 0.06)} />
          <stop offset="0.25" stopColor={lighten(side, 0.12)} />
          <stop offset="0.7" stopColor={side} />
          <stop offset="1" stopColor={darken(side, 0.16)} />
        </linearGradient>
      </defs>
      <path
        d={`M${cx - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} V${top} Z`}
        fill={`url(#${id}-side)`}
        stroke={edge}
        strokeWidth={1.6}
      />
      {coat === null && layered ? (
        <path
          d={`M${cx - rx} ${top + height / 2} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + height / 2}`}
          fill="none"
          stroke={fillingColour ?? lighten(sponge, 0.6)}
          strokeWidth={7}
        />
      ) : null}
      <path
        d={`M${cx - rx + 10} ${top + 8} V${bottom - 2}`}
        stroke={lighten(side, 0.5)}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.55}
      />
      <ellipse
        cx={cx}
        cy={top}
        rx={rx}
        ry={ry}
        fill={coat === null ? lighten(sponge, 0.18) : lighten(coat, 0.12)}
        stroke={edge}
        strokeWidth={1.4}
      />
    </g>
  );
}
