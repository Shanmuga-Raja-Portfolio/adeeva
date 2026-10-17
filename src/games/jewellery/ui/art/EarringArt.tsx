import { productById, seatCut } from "../../core";
import { PlateArt } from "./PlateArt";
import { stoneHex, type PieceArtProps } from "./pieceArtProps";
import { StoneSeatArt } from "./StoneSeatArt";

const SIDES = [
  { x: 72, key: "l" },
  { x: 168, key: "r" },
] as const;

export function EarringArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const product = productById(source.productId);
  const drop = product.parts.some((part) => part.key === "drop-l");
  const seated = product.seats.length > 0;
  return (
    <g>
      {SIDES.map((side) => {
        const face = product.parts.find((part) => part.key === `${drop ? "drop" : "face"}-${side.key}`);
        const plateY = drop ? 140 : 124;
        return (
          <g key={side.key}>
            <rect
              x={side.x - 13}
              y={34}
              width={26}
              height={16}
              rx={8}
              fill="#e9e4dc"
              stroke="#8c8278"
              strokeWidth={1.2}
            />
            <circle cx={side.x} cy={42} r={4} fill={fill} stroke={metal.line} strokeWidth={1} />
            <path d={`M${side.x} 46 L${side.x} ${drop ? 70 : 82}`} stroke={metal.line} strokeWidth={4} />
            <path d={`M${side.x} 46 L${side.x} ${drop ? 70 : 82}`} stroke={fill} strokeWidth={2.4} />
            {drop ? <circle cx={side.x} cy={76} r={6} fill="none" stroke={fill} strokeWidth={3} /> : null}
            {face !== undefined ? (
              <PlateArt
                part={face}
                source={source}
                metal={metal}
                fill={fill}
                sheen={sheen}
                x={side.x}
                y={plateY}
                box={drop ? 116 : 84}
                twinkle={twinkle}
              />
            ) : null}
            {seated ? (
              <StoneSeatArt
                cut={seatCut(source)}
                hex={stoneHex(source)}
                metal={metal}
                fill={fill}
                x={side.x}
                y={drop ? plateY + 8 : plateY}
                size={drop ? 26 : 34}
                twinkle={twinkle}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
