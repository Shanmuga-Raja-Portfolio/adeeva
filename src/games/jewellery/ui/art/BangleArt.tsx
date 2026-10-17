import type { AccentId } from "../../content/partOption";
import { accentOutlines, bandOption } from "../../core";
import { Glint } from "./Glint";
import { outlinePath } from "./outlinePath";
import { glazeHex, type PieceArtProps } from "./pieceArtProps";

const CX = 120;
const CY = 132;
const RX = 88;
const RY = 42;
const WIDTH = 20;

function arcPath(front: boolean, inset = 0): string {
  const rx = RX - inset;
  const ry = RY - inset * 0.45;
  return front
    ? `M${CX - rx} ${CY} A${rx} ${ry} 0 0 0 ${CX + rx} ${CY}`
    : `M${CX - rx} ${CY} A${rx} ${ry} 0 0 1 ${CX + rx} ${CY}`;
}

function accentOf(source: PieceArtProps["source"]): AccentId {
  const accent = source.options.accent;
  return accent === "star-window" ||
    accent === "dot-row" ||
    accent === "moon-window" ||
    accent === "heart-window"
    ? accent
    : "plain";
}

function frontSpots(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.PI * (0.3 + (0.4 * index) / Math.max(1, count - 1));
    return { x: CX - RX * Math.cos(angle), y: CY + RY * Math.sin(angle) };
  });
}

export function BangleArt({ source, metal, fill, sheen, twinkle }: PieceArtProps) {
  const band = bandOption(source.options);
  const glaze = glazeHex(source);
  const windows = accentOutlines(accentOf(source), "circle");
  const beads = frontSpots(11);
  return (
    <g>
      <ellipse cx={CX} cy={CY + RY + 16} rx={RX * 0.92} ry={9} fill="#000000" opacity={0.22} />
      <path d={arcPath(false)} fill="none" stroke={metal.dark} strokeWidth={WIDTH} strokeLinecap="round" />
      <path d={arcPath(false, 3)} fill="none" stroke={metal.mid} strokeWidth={WIDTH * 0.3} opacity={0.55} />
      <path
        d={arcPath(true)}
        fill="none"
        stroke={metal.line}
        strokeWidth={WIDTH + 2.6}
        strokeLinecap="round"
      />
      <path d={arcPath(true)} fill="none" stroke={fill} strokeWidth={WIDTH} strokeLinecap="round" />
      {glaze !== null ? (
        <path d={arcPath(true)} fill="none" stroke={glaze} strokeWidth={WIDTH * 0.5} opacity={0.85} />
      ) : null}
      {band === "wavy-band" || band === "twist-band" ? (
        <path
          d={arcPath(true, band === "wavy-band" ? -WIDTH * 0.4 : 0)}
          fill="none"
          stroke={band === "wavy-band" ? metal.light : metal.dark}
          strokeWidth={band === "wavy-band" ? 2.4 : WIDTH * 0.8}
          strokeDasharray={band === "wavy-band" ? "7 5" : "2.6 8"}
          opacity={band === "wavy-band" ? 1 : 0.5}
        />
      ) : null}
      {band === "beaded-band" || band === "hammered-band"
        ? beads.map((spot, index) =>
            band === "beaded-band" ? (
              <circle
                key={index}
                cx={spot.x}
                cy={spot.y}
                r={WIDTH * 0.3}
                fill={metal.light}
                stroke={metal.line}
                strokeWidth={0.8}
              />
            ) : (
              <ellipse
                key={index}
                cx={spot.x}
                cy={spot.y}
                rx={3.6}
                ry={2.4}
                fill={metal.dark}
                opacity={0.35}
              />
            ),
          )
        : null}
      {windows.length > 0
        ? frontSpots(3).map((spot, index) => (
            <g key={index} transform={`translate(${spot.x - 9} ${spot.y - 9}) scale(18)`}>
              {windows.map((hole, holeIndex) => (
                <path
                  key={holeIndex}
                  d={outlinePath(hole.points)}
                  fill="#1c1220"
                  fillOpacity={0.7}
                  stroke={metal.line}
                  strokeWidth={0.04}
                />
              ))}
            </g>
          ))
        : null}
      {source.finish === "two-tone" ? (
        <path d={arcPath(true, -WIDTH * 0.46)} fill="none" stroke="#e8c34a" strokeWidth={2.4} />
      ) : null}
      <path d={arcPath(true, 4)} fill="none" stroke={sheen} strokeWidth={WIDTH * 0.28} opacity={0.9} />
      {source.finish === "high-shine" || source.finish === "starlit" ? (
        <>
          <Glint x={CX - RX * 0.55} y={CY + RY * 0.78} size={8} twinkle={twinkle} />
          <Glint x={CX + RX * 0.4} y={CY + RY * 0.86} size={6} twinkle={twinkle} delay={0.7} />
        </>
      ) : null}
    </g>
  );
}
