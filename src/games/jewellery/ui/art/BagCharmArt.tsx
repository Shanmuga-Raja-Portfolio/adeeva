import { productById } from "../../core";
import { PlateArt } from "./PlateArt";
import type { PieceArtProps } from "./pieceArtProps";

export function BagCharmArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const plate = productById(source.productId).parts.find((part) => part.key === "plate");
  const clipped = source.chain !== null;
  return (
    <g>
      {clipped ? (
        <g>
          <path
            d="M108 22 C108 8 132 8 132 22 L132 44 C132 54 108 54 108 44 Z"
            fill="none"
            stroke="#2d2a30"
            strokeWidth={6}
          />
          <path
            d="M108 22 C108 8 132 8 132 22 L132 44 C132 54 108 54 108 44 Z"
            fill="none"
            stroke="#6a6470"
            strokeWidth={3}
          />
          <rect x={126} y={24} width={8} height={14} rx={3} fill="#8a8490" />
        </g>
      ) : null}
      <path
        d="M120 52 L120 74"
        stroke={clipped ? "#5a5560" : "#ffffff"}
        strokeOpacity={clipped ? 1 : 0.35}
        strokeWidth={clipped ? 3 : 1.4}
        strokeDasharray={clipped ? undefined : "3 5"}
      />
      <circle cx={120} cy={80} r={7} fill="none" stroke={metal.line} strokeWidth={5} />
      <circle cx={120} cy={80} r={7} fill="none" stroke={fill} strokeWidth={3.4} />
      {plate !== undefined ? (
        <PlateArt
          part={plate}
          source={source}
          metal={metal}
          fill={fill}
          sheen={sheen}
          x={120}
          y={150}
          box={118}
          twinkle={twinkle}
        />
      ) : null}
    </g>
  );
}
