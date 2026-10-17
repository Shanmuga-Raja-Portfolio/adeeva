import { productById } from "../../core";
import { PlateArt } from "./PlateArt";
import type { PieceArtProps } from "./pieceArtProps";

export function SlideArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const plate = productById(source.productId).parts.find((part) => part.key === "plate");
  return (
    <g>
      <path
        d="M34 112 C70 150 170 150 206 112"
        fill="none"
        stroke="#3a3440"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path d="M44 132 L196 132" stroke="#58525e" strokeWidth={3} strokeLinecap="round" />
      <circle cx={196} cy={132} r={4} fill="#58525e" />
      {plate !== undefined ? (
        <PlateArt
          part={plate}
          source={source}
          metal={metal}
          fill={fill}
          sheen={sheen}
          x={120}
          y={112}
          box={196}
          twinkle={twinkle}
        />
      ) : null}
    </g>
  );
}
