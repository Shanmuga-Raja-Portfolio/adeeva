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
          <stop offset="0" stopColor={darken(side, 0.14)} />
          <stop offset="0.22" stopColor={lighten(side, 0.22)} />
          <stop offset="0.55" stopColor={side} />
          <stop offset="0.85" stopColor={darken(side, 0.16)} />
          <stop offset="1" stopColor={darken(side, 0.3)} />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx="0.38" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.75} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.08} />
        </radialGradient>
      </defs>
      <ellipse cx={cx + 6} cy={bottom + 4} rx={rx + 6} ry={ry * 0.8} fill="#3b2620" opacity={0.16} />
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
      {coat !== null ? (
        <g fill="none" strokeLinecap="round">
          {[0.3, 0.56, 0.8].map((share) => (
            <g key={share}>
              <path
                d={`M${cx - rx + 6} ${top + height * share} A${rx - 6} ${ry} 0 0 0 ${cx + rx * 0.55} ${top + height * share + ry * 0.83}`}
                stroke={lighten(side, 0.55)}
                strokeWidth={3}
                opacity={0.55}
              />
              <path
                d={`M${cx - rx * 0.2} ${top + height * share + ry + 4} A${rx - 6} ${ry} 0 0 0 ${cx + rx - 6} ${top + height * share + 4}`}
                stroke={darken(side, 0.1)}
                strokeWidth={2}
                opacity={0.45}
              />
            </g>
          ))}
        </g>
      ) : null}
      <path
        d={`M${cx - rx + 10} ${top + 8} V${bottom - 2}`}
        stroke={lighten(side, 0.5)}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path
        d={`M${cx - rx + 2} ${top + 4} A${rx - 2} ${ry} 0 0 0 ${cx + rx - 2} ${top + 4}`}
        fill="none"
        stroke={darken(side, 0.3)}
        strokeWidth={6}
        opacity={0.18}
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
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={`url(#${id}-top)`} />
    </g>
  );
}
