import { productById } from "../../core";
import { PlateArt } from "./PlateArt";
import type { PieceArtProps } from "./pieceArtProps";

export function BadgeArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const plate = productById(source.productId).parts.find((part) => part.key === "plate");
  return (
    <g>
      <rect x={36} y={30} width={168} height={180} rx={18} fill="#e8dccb" opacity={0.18} />
      <path
        d="M36 70 L204 70"
        stroke="#ffffff"
        strokeOpacity={0.18}
        strokeWidth={1.2}
        strokeDasharray="4 6"
      />
      <rect
        x={70}
        y={64}
        width={100}
        height={12}
        rx={6}
        fill={metal.dark}
        stroke={metal.line}
        strokeWidth={1.2}
      />
      <rect x={74} y={66} width={92} height={4} rx={2} fill={metal.light} opacity={0.7} />
      <circle cx={170} cy={70} r={7} fill={fill} stroke={metal.line} strokeWidth={1.2} />
      {plate !== undefined ? (
        <PlateArt
          part={plate}
          source={source}
          metal={metal}
          fill={fill}
          sheen={sheen}
          x={120}
          y={134}
          box={138}
          twinkle={twinkle}
        />
      ) : null}
    </g>
  );
}
