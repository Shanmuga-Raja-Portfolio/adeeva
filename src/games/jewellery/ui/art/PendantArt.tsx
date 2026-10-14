import { productById, seatCut } from "../../core";
import { ChainArt } from "./ChainArt";
import { PlateArt } from "./PlateArt";
import { cordHex, stoneHex, type PieceArtProps } from "./pieceArtProps";
import { StoneSeatArt } from "./StoneSeatArt";

const LOOP_Y = 62;
const PLATE_Y = 142;

export function PendantArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const product = productById(source.productId);
  const plate = product.parts.find((part) => part.key === "plate");
  const stone = product.seats.length > 0;
  return (
    <g>
      {source.chain !== null ? (
        <ChainArt
          chain={source.chain}
          d={`M-4 6 C40 30 96 ${LOOP_Y - 18} 120 ${LOOP_Y - 6} C144 ${LOOP_Y - 18} 200 30 244 6`}
          metal={metal}
          cordHex={cordHex(source)}
        />
      ) : (
        <path
          d={`M-4 6 C40 30 96 ${LOOP_Y - 18} 120 ${LOOP_Y - 6} C144 ${LOOP_Y - 18} 200 30 244 6`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.35}
          strokeWidth={1.4}
          strokeDasharray="3 5"
        />
      )}
      <circle cx={120} cy={LOOP_Y + 4} r={8} fill="none" stroke={metal.line} strokeWidth={5.4} />
      <circle cx={120} cy={LOOP_Y + 4} r={8} fill="none" stroke={fill} strokeWidth={3.6} />
      {plate !== undefined ? (
        <PlateArt
          part={plate}
          source={source}
          metal={metal}
          fill={fill}
          sheen={sheen}
          x={120}
          y={PLATE_Y}
          box={stone ? 118 : 132}
          twinkle={twinkle}
        />
      ) : null}
      {stone ? (
        <StoneSeatArt
          cut={seatCut(source)}
          hex={stoneHex(source)}
          metal={metal}
          fill={fill}
          x={120}
          y={PLATE_Y}
          size={44}
          twinkle={twinkle}
        />
      ) : null}
    </g>
  );
}
