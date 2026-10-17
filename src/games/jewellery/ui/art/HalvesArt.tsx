import { productById } from "../../core";
import { ChainArt } from "./ChainArt";
import { PlateArt } from "./PlateArt";
import { cordHex, type PieceArtProps } from "./pieceArtProps";

const SIDES = [
  { key: "l", x: 86, chain: "M-4 4 C30 26 66 52 86 70" },
  { key: "r", x: 154, chain: "M244 4 C210 26 174 52 154 70" },
] as const;

export function HalvesArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const product = productById(source.productId);
  return (
    <g>
      {SIDES.map((side) => {
        const half = product.parts.find((part) => part.key === `half-${side.key}`);
        return (
          <g key={side.key}>
            {source.chain !== null ? (
              <ChainArt chain={source.chain} d={side.chain} metal={metal} cordHex={cordHex(source)} />
            ) : (
              <path
                d={side.chain}
                fill="none"
                stroke="#ffffff"
                strokeOpacity={0.35}
                strokeWidth={1.4}
                strokeDasharray="3 5"
              />
            )}
            <circle cx={side.x} cy={76} r={6} fill="none" stroke={metal.line} strokeWidth={4.6} />
            <circle cx={side.x} cy={76} r={6} fill="none" stroke={fill} strokeWidth={3} />
            {half !== undefined ? (
              <PlateArt
                part={half}
                source={source}
                metal={metal}
                fill={fill}
                sheen={sheen}
                x={side.key === "l" ? side.x - 1 : side.x + 1}
                y={146}
                box={128}
                twinkle={twinkle}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
