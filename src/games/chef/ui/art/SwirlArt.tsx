import { darken, lighten, mixHex } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { blobPath } from "./blobPath";
import type { PieceArtProps } from "./heroArt";
import { scatterInEllipse } from "./scatter";

const POOLS: readonly (readonly [number, number, number, number])[] = [
  [0.7, 0.32, 0.15, 0.1],
  [0.27, 0.66, 0.13, 0.085],
  [0.62, 0.74, 0.1, 0.07],
];

export function SwirlArt({ w, h, c1, c2, seed }: PieceArtProps) {
  const id = useSvgId("ck-swirl");
  const cx = w / 2;
  const cy = h / 2;
  const warm = mixHex(c1, c2, 0.35);
  const cream = "#fff4dc";
  const swirl = `M${w * 0.26} ${h * 0.56} C${w * 0.24} ${h * 0.3} ${w * 0.62} ${h * 0.22} ${w * 0.7} ${h * 0.44} C${w * 0.76} ${h * 0.62} ${w * 0.5} ${h * 0.7} ${w * 0.42} ${h * 0.56} C${w * 0.36} ${h * 0.46} ${w * 0.5} ${h * 0.38} ${w * 0.56} ${h * 0.48}`;
  return (
    <>
      <defs>
        <radialGradient id={`${id}-body`} cx="0.42" cy="0.36" r="0.72">
          <stop offset="0" stopColor={lighten(c1, 0.38)} />
          <stop offset="0.45" stopColor={c1} />
          <stop offset="0.85" stopColor={warm} />
          <stop offset="1" stopColor={darken(warm, 0.18)} />
        </radialGradient>
        <radialGradient id={`${id}-oil`} cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor={mixHex(c2, "#ffb347", 0.6)} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={mixHex(c2, "#e8562a", 0.45)} stopOpacity={0.8} />
          <stop offset="1" stopColor={mixHex(c2, "#c4372b", 0.4)} stopOpacity={0.95} />
        </radialGradient>
      </defs>
      <path
        d={blobPath(cx + 2, cy + 5, w / 2 - 1, h / 2 - 1, seed, 0.05)}
        fill={darken(warm, 0.5)}
        opacity={0.32}
      />
      <path d={blobPath(cx, cy, w / 2 - 2, h / 2 - 2, seed, 0.05)} fill={`url(#${id}-body)`} />
      {scatterInEllipse(seed + 5, 10, w, h, 0.6).map((lump, index) => (
        <path
          key={`lump-${index}`}
          d={blobPath(lump.x, lump.y, 11 * lump.size, 7 * lump.size, seed + 40 + index, 0.3, 8)}
          fill={index % 3 === 0 ? darken(c1, 0.1) : lighten(c1, 0.3)}
          opacity={0.38}
        />
      ))}
      {scatterInEllipse(seed + 9, 64, w, h, 0.84).map((lentil, index) => (
        <ellipse
          key={`lentil-${index}`}
          cx={lentil.x}
          cy={lentil.y}
          rx={2.3 * lentil.size}
          ry={1.5 * lentil.size}
          transform={`rotate(${lentil.turn} ${lentil.x} ${lentil.y})`}
          fill={lentil.pick > 0.55 ? lighten(c1, 0.42) : darken(c1, 0.14)}
          opacity={0.6}
        />
      ))}
      <path
        d={swirl}
        fill="none"
        stroke={darken(c1, 0.25)}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={0.3}
        transform="translate(1 2)"
      />
      <path d={swirl} fill="none" stroke={cream} strokeWidth={6} strokeLinecap="round" opacity={0.95} />
      <path
        d={swirl}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.8}
        transform="translate(-1 -1.5)"
      />
      {POOLS.map(([px, py, rx, ry], index) => (
        <g key={`pool-${index}`}>
          <path
            d={blobPath(w * px, h * py, w * rx * 1.2, h * ry * 1.2, seed + 70 + index, 0.3, 10)}
            fill={`url(#${id}-oil)`}
            opacity={0.42}
          />
          {scatterInEllipse(seed + 90 + index, 6, w * rx * 2, h * ry * 2, 0.9).map((drop, dropIndex) => (
            <g key={dropIndex} transform={`translate(${w * (px - rx) + drop.x} ${h * (py - ry) + drop.y})`}>
              <circle r={1.6 + drop.size * (dropIndex % 3 === 0 ? 3 : 1.6)} fill={`url(#${id}-oil)`} />
              <circle cx={-0.7} cy={-0.8} r={0.8} fill="#ffffff" opacity={0.8} />
            </g>
          ))}
          {[0, 1].map((flake) => (
            <rect
              key={flake}
              x={w * (px + (flake - 0.5) * rx * 0.6)}
              y={h * (py + (flake - 0.4) * ry * 0.6)}
              width={2.6}
              height={1.8}
              rx={0.6}
              transform={`rotate(${flake * 50 + index * 20} ${w * px} ${h * py})`}
              fill="#a8241a"
              opacity={0.85}
            />
          ))}
        </g>
      ))}
      {scatterInEllipse(seed + 3, 14, w, h, 0.66).map((seedDot, index) =>
        index % 2 === 0 ? (
          <g key={`seed-${index}`}>
            <circle cx={seedDot.x} cy={seedDot.y} r={1.9} fill="#2a1a0c" />
            <circle cx={seedDot.x - 0.6} cy={seedDot.y - 0.6} r={0.6} fill="#ffffff" opacity={0.6} />
          </g>
        ) : (
          <ellipse
            key={`seed-${index}`}
            cx={seedDot.x}
            cy={seedDot.y}
            rx={3.4}
            ry={1.3}
            transform={`rotate(${seedDot.turn} ${seedDot.x} ${seedDot.y})`}
            fill="#6a4320"
            stroke="#3a2410"
            strokeWidth={0.6}
          />
        ),
      )}
      {scatterInEllipse(seed + 31, 4, w, h, 0.5).map((sliver, index) => (
        <path
          key={`garlic-${index}`}
          d={`M${sliver.x - 4} ${sliver.y} q4 -4 8 0 q-4 2.5 -8 0 Z`}
          transform={`rotate(${sliver.turn} ${sliver.x} ${sliver.y})`}
          fill="#f6dc8a"
          stroke="#b9862a"
          strokeWidth={0.8}
        />
      ))}
      <path
        d={`M${w * 0.18} ${h * 0.38} Q${w * 0.26} ${h * 0.14} ${w * 0.5} ${h * 0.1}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.5}
      />
      <circle cx={w * 0.56} cy={h * 0.14} r={2} fill="#ffffff" opacity={0.7} />
      <circle cx={w * 0.8} cy={h * 0.5} r={1.6} fill="#ffffff" opacity={0.55} />
    </>
  );
}
