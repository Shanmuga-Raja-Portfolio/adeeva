import { productById, seatCut, bandOption } from "../../core";
import { Glint } from "./Glint";
import { PlateArt } from "./PlateArt";
import { glazeHex, stoneHex, type PieceArtProps } from "./pieceArtProps";
import { StoneSeatArt } from "./StoneSeatArt";

const CX = 120;
const CY = 150;
const RX = 70;
const RY = 30;

function arcPath(front: boolean, inset = 0): string {
  const rx = RX - inset;
  const ry = RY - inset * 0.45;
  return front
    ? `M${CX - rx} ${CY} A${rx} ${ry} 0 0 0 ${CX + rx} ${CY}`
    : `M${CX - rx} ${CY} A${rx} ${ry} 0 0 1 ${CX + rx} ${CY}`;
}

export function RingArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const product = productById(source.productId);
  const band = bandOption(source.options);
  const width = product.id === "stone-ring" ? 18 : 15;
  const glaze = glazeHex(source);
  const top = product.parts.find((part) => part.key === "top");
  const dimples = Array.from({ length: 9 }, (_, index) => {
    const angle = Math.PI * (0.12 + (0.76 * index) / 8);
    return { x: CX - RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
  });
  return (
    <g>
      <ellipse cx={CX} cy={CY + RY + 14} rx={RX * 0.9} ry={8} fill="#000000" opacity={0.22} />
      <path d={arcPath(false)} fill="none" stroke={metal.dark} strokeWidth={width} strokeLinecap="round" />
      <path d={arcPath(false, 2)} fill="none" stroke={metal.mid} strokeWidth={width * 0.35} opacity={0.6} />
      <path
        d={arcPath(true)}
        fill="none"
        stroke={metal.line}
        strokeWidth={width + 2.4}
        strokeLinecap="round"
      />
      <path d={arcPath(true)} fill="none" stroke={fill} strokeWidth={width} strokeLinecap="round" />
      {glaze !== null ? (
        <path
          d={arcPath(true)}
          fill="none"
          stroke={glaze}
          strokeWidth={width * 0.5}
          strokeLinecap="round"
          opacity={0.85}
        />
      ) : null}
      {source.finish === "antique" ? (
        <path
          d={arcPath(true)}
          fill="none"
          stroke="#2a2228"
          strokeWidth={width * 0.18}
          strokeOpacity={0.55}
        />
      ) : null}
      {band === "wavy-band" ? (
        <path
          d={arcPath(true, -width * 0.42)}
          fill="none"
          stroke={metal.light}
          strokeWidth={2.2}
          strokeDasharray="6 4"
        />
      ) : null}
      {band === "twist-band" ? (
        <path
          d={arcPath(true)}
          fill="none"
          stroke={metal.dark}
          strokeWidth={width * 0.8}
          strokeDasharray="2.4 7"
          opacity={0.5}
        />
      ) : null}
      {band === "beaded-band"
        ? dimples.map((dot, index) => (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y - 1}
              r={width * 0.32}
              fill={metal.light}
              stroke={metal.line}
              strokeWidth={0.8}
            />
          ))
        : null}
      {band === "hammered-band"
        ? dimples.map((dot, index) => (
            <ellipse
              key={index}
              cx={dot.x}
              cy={dot.y + 1}
              rx={3.2}
              ry={2.2}
              fill={metal.dark}
              opacity={0.35}
            />
          ))
        : null}
      <path d={arcPath(true, 3)} fill="none" stroke={sheen} strokeWidth={width * 0.3} opacity={0.9} />
      {top !== undefined ? (
        <g>
          <path
            d={`M${CX - 8} ${CY - RY + 3} L${CX - 5} ${CY - RY - 10} L${CX + 5} ${CY - RY - 10} L${CX + 8} ${CY - RY + 3} Z`}
            fill={fill}
            stroke={metal.line}
            strokeWidth={1.2}
          />
          <PlateArt
            part={top}
            source={source}
            metal={metal}
            fill={fill}
            sheen={sheen}
            x={CX}
            y={CY - RY - 34}
            box={58}
            twinkle={twinkle}
          />
        </g>
      ) : null}
      {product.seats.length > 0 ? (
        <g>
          <path
            d={`M${CX - 12} ${CY - RY + 2} L${CX - 8} ${CY - RY - 14} L${CX + 8} ${CY - RY - 14} L${CX + 12} ${CY - RY + 2} Z`}
            fill={fill}
            stroke={metal.line}
            strokeWidth={1.2}
          />
          <StoneSeatArt
            cut={seatCut(source)}
            hex={stoneHex(source)}
            metal={metal}
            fill={fill}
            x={CX}
            y={CY - RY - 30}
            size={40}
            twinkle={twinkle}
          />
        </g>
      ) : null}
      {source.finish === "high-shine" ? (
        <Glint x={CX - RX * 0.6} y={CY + RY * 0.72} size={7} twinkle={twinkle} delay={0.5} />
      ) : null}
    </g>
  );
}
