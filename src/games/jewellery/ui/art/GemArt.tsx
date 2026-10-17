import type { StoneId } from "../../content/stone";
import type { Shimmer, StoneTint } from "../../content/stoneTint";
import { jewelColourById } from "../../content/jewelColour";
import { stoneById } from "../../core";
import { Glint } from "./Glint";
import { tintedHex } from "./pieceArtProps";
import { StoneArt } from "./StoneArt";

interface GemArtProps {
  readonly stoneId: StoneId;
  readonly tint: StoneTint;
  readonly shimmer: Shimmer;
  readonly size: number;
  readonly twinkle?: boolean | undefined;
  readonly pattern?: boolean | undefined;
}

const SHIMMER_SPOTS = [
  [0.22, -0.3],
  [-0.32, 0.18],
  [0.3, 0.26],
] as const;

function TintPattern({ tint, size }: { readonly tint: StoneTint; readonly size: number }) {
  const badge = size * 0.16;
  const inner = badge * 0.62;
  return (
    <g transform={`translate(${size * 0.42} ${size * 0.42})`} aria-hidden="true">
      <circle r={badge} fill="#fffbf4" stroke="#2a1d2c" strokeWidth={size * 0.03} />
      {tint === "deep" ? <circle r={inner} fill="#2a1d2c" /> : null}
      {tint === "true" ? (
        <path d={`M0 ${-inner} A${inner} ${inner} 0 0 1 0 ${inner} Z`} fill="#2a1d2c" />
      ) : null}
      {tint === "pale" ? (
        <circle r={inner * 0.9} fill="none" stroke="#2a1d2c" strokeWidth={size * 0.025} />
      ) : null}
    </g>
  );
}

export function GemArt({ stoneId, tint, shimmer, size, twinkle = false, pattern = false }: GemArtProps) {
  const stone = stoneById(stoneId);
  const hex = tintedHex(jewelColourById(stone.colour).hex, tint);
  return (
    <g>
      <StoneArt cut={stone.cut} hex={hex} x={0} y={0} size={size} twinkle={twinkle} />
      {SHIMMER_SPOTS.slice(0, shimmer).map(([x, y], index) => (
        <Glint
          key={index}
          x={x * size}
          y={y * size}
          size={size * 0.09}
          twinkle={twinkle}
          delay={index * 0.5}
        />
      ))}
      {pattern ? <TintPattern tint={tint} size={size} /> : null}
    </g>
  );
}
