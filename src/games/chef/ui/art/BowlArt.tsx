import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { blobPath } from "./blobPath";
import { FoodGrain } from "./FoodGrain";
import type { PieceArtProps } from "./heroArt";
import { scatterInEllipse } from "./scatter";

export function BowlArt({ w, h, c1, c2, seed }: PieceArtProps) {
  const id = useSvgId("ck-bowl");
  const cx = w / 2;
  const cy = h / 2;
  const soupRx = w / 2 - 16;
  const soupRy = h / 2 - 16;
  return (
    <>
      <defs>
        <radialGradient id={`${id}-glaze`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={lighten(c2, 0.5)} />
          <stop offset="0.6" stopColor={c2} />
          <stop offset="1" stopColor={darken(c2, 0.24)} />
        </radialGradient>
        <linearGradient id={`${id}-wall`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor={darken(c2, 0.26)} />
          <stop offset="0.55" stopColor={c2} />
          <stop offset="1" stopColor={lighten(c2, 0.35)} />
        </linearGradient>
        <radialGradient id={`${id}-soup`} cx="0.44" cy="0.4" r="0.66">
          <stop offset="0" stopColor={lighten(c1, 0.34)} />
          <stop offset="0.5" stopColor={lighten(c1, 0.08)} />
          <stop offset="0.86" stopColor={c1} />
          <stop offset="1" stopColor={darken(c1, 0.34)} />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="0.2" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0" stopColor={darken(c1, 0.55)} stopOpacity={0.42} />
          <stop offset="0.38" stopColor={darken(c1, 0.4)} stopOpacity={0} />
          <stop offset="0.7" stopColor="#fff6dc" stopOpacity={0} />
          <stop offset="1" stopColor="#fff6dc" stopOpacity={0.28} />
        </linearGradient>
        <radialGradient id={`${id}-bead`} cx="0.35" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#fff6d0" />
          <stop offset="0.5" stopColor={lighten(c1, 0.2)} stopOpacity={0.8} />
          <stop offset="1" stopColor={darken(c1, 0.2)} stopOpacity={0.4} />
        </radialGradient>
      </defs>
      <ellipse cx={cx + 7} cy={cy + 12} rx={w / 2} ry={h / 2} fill="#1c1220" opacity={0.24} />
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} fill={`url(#${id}-glaze)`} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={w / 2 - 1.5}
        ry={h / 2 - 1.5}
        fill="none"
        stroke={lighten(c2, 0.7)}
        strokeOpacity={0.8}
        strokeWidth={2.5}
      />
      <ellipse cx={cx} cy={cy} rx={w / 2 - 8} ry={h / 2 - 8} fill={`url(#${id}-wall)`} />
      <ellipse
        cx={cx + 2}
        cy={cy + 3}
        rx={soupRx + 1}
        ry={soupRy + 1}
        fill={darken(c1, 0.45)}
        opacity={0.6}
      />
      <ellipse cx={cx} cy={cy + 1} rx={soupRx} ry={soupRy} fill={`url(#${id}-soup)`} />
      <FoodGrain
        d={`M${cx - soupRx} ${cy + 1} a${soupRx} ${soupRy} 0 1 0 ${soupRx * 2} 0 a${soupRx} ${soupRy} 0 1 0 ${-soupRx * 2} 0 Z`}
        seed={seed}
        dark={darken(c1, 0.45)}
        light={lighten(c1, 0.55)}
      />
      <ellipse cx={cx} cy={cy + 1} rx={soupRx} ry={soupRy} fill={`url(#${id}-shade)`} />
      {scatterInEllipse(seed + 11, 9, w, h, 0.56).map((patch, index) => (
        <path
          key={`patch-${index}`}
          d={blobPath(patch.x, patch.y, 14 * patch.size, 9 * patch.size, seed + index, 0.25, 9)}
          fill={index % 2 === 0 ? lighten(c1, 0.3) : darken(c1, 0.12)}
          opacity={0.32}
        />
      ))}
      {scatterInEllipse(seed + 23, 46, w, h, 0.6).map((speck, index) => (
        <ellipse
          key={`speck-${index}`}
          cx={speck.x}
          cy={speck.y}
          rx={1.8 * speck.size}
          ry={1.1 * speck.size}
          transform={`rotate(${speck.turn} ${speck.x} ${speck.y})`}
          fill={speck.pick > 0.6 ? lighten(c1, 0.45) : darken(c1, 0.2)}
          opacity={0.55}
        />
      ))}
      {scatterInEllipse(seed, 12, w, h, 0.6).map((drop, index) => (
        <g key={index} transform={`translate(${drop.x} ${drop.y})`}>
          <circle r={2.6 * drop.size + (index % 3) * 0.8} fill={`url(#${id}-bead)`} />
          <circle cx={-0.9} cy={-0.9} r={0.9 * drop.size} fill="#ffffff" opacity={0.75} />
        </g>
      ))}
      <ellipse
        cx={cx}
        cy={cy + 1}
        rx={soupRx}
        ry={soupRy}
        fill="none"
        stroke={darken(c1, 0.4)}
        strokeOpacity={0.5}
        strokeWidth={3}
      />
      <path
        d={`M${cx - soupRx * 0.62} ${cy - soupRy * 0.42} Q${cx - soupRx * 0.2} ${cy - soupRy * 0.78} ${cx + soupRx * 0.32} ${cy - soupRy * 0.62}`}
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.28}
        fill="none"
      />
      <path
        d={`M${cx - w * 0.38} ${cy - h * 0.2} A${w * 0.46} ${h * 0.46} 0 0 1 ${cx + w * 0.08} ${cy - h * 0.46}`}
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
        fill="none"
      />
      <path
        d={`M${cx + w * 0.4} ${cy + h * 0.16} A${w * 0.46} ${h * 0.46} 0 0 1 ${cx + w * 0.12} ${cy + h * 0.44}`}
        stroke={darken(c2, 0.3)}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.35}
        fill="none"
      />
    </>
  );
}
