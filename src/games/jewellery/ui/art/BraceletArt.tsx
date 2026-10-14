import { productById } from "../../core";
import { ChainArt } from "./ChainArt";
import { PlateArt } from "./PlateArt";
import { cordHex, type PieceArtProps } from "./pieceArtProps";

const CHARM_SPOTS = [
  { x: 64, y: 96 },
  { x: 120, y: 112 },
  { x: 176, y: 96 },
] as const;

export function BraceletArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const product = productById(source.productId);
  const d = "M8 62 C50 104 90 116 120 116 C150 116 190 104 232 62";
  return (
    <g>
      {source.chain !== null ? (
        <ChainArt chain={source.chain} d={d} metal={metal} cordHex={cordHex(source)} scale={1.2} />
      ) : (
        <path
          d={d}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.35}
          strokeWidth={1.4}
          strokeDasharray="3 5"
        />
      )}
      {product.parts.map((part, index) => {
        const spot = CHARM_SPOTS[index] ?? CHARM_SPOTS[1];
        return (
          <g key={part.key}>
            <circle cx={spot.x} cy={spot.y} r={5} fill="none" stroke={metal.line} strokeWidth={3.4} />
            <circle cx={spot.x} cy={spot.y} r={5} fill="none" stroke={fill} strokeWidth={2.2} />
            <PlateArt
              part={part}
              source={source}
              metal={metal}
              fill={fill}
              sheen={sheen}
              x={spot.x}
              y={spot.y + 34}
              box={52}
              twinkle={twinkle}
            />
          </g>
        );
      })}
    </g>
  );
}
