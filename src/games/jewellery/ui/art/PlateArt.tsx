import type { PartDef } from "../../content/product";
import { partAccents, partOutline, seatCut, type PieceSource } from "../../core";
import { Glint } from "./Glint";
import type { MetalLook } from "./metalLook";
import { outlinePath } from "./outlinePath";
import { fitPoints, glazeHex } from "./pieceArtProps";

interface PlateArtProps {
  readonly part: PartDef;
  readonly source: PieceSource;
  readonly metal: MetalLook;
  readonly fill: string;
  readonly sheen: string;
  readonly x: number;
  readonly y: number;
  readonly box: number;
  readonly twinkle: boolean;
}

export function PlateArt({ part, source, metal, fill, sheen, x, y, box, twinkle }: PlateArtProps) {
  const input = { options: source.options, cut: seatCut(source) };
  const outer = fitPoints(partOutline(part, input), part.width, part.height, box);
  const holes = partAccents(part, input).map((points) => fitPoints(points, part.width, part.height, box));
  const shape = [outlinePath(outer), ...holes.map((hole) => outlinePath(hole))].join(" ");
  const glaze = glazeHex(source);
  const antique = source.finish === "antique";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={shape} fill="#1c1220" fillOpacity={0.22} fillRule="evenodd" transform="translate(2.5 3.5)" />
      <path
        d={shape}
        fill={fill}
        fillRule="evenodd"
        stroke={metal.line}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {glaze !== null ? (
        <path
          d={shape}
          fillRule="evenodd"
          fill={glaze}
          fillOpacity={0.8}
          stroke={fill}
          strokeWidth={box * 0.07}
          strokeLinejoin="round"
        />
      ) : null}
      {antique ? (
        <path
          d={shape}
          fillRule="evenodd"
          fill="#2a2228"
          fillOpacity={0.12}
          stroke="#2a2228"
          strokeOpacity={0.6}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      ) : null}
      {holes.map((hole, index) => (
        <path key={index} d={outlinePath(hole)} fill="none" stroke={metal.line} strokeWidth={1} />
      ))}
      <path d={shape} fill={sheen} fillRule="evenodd" opacity={source.finish === "satin" ? 0.35 : 0.85} />
      {source.finish === "high-shine" ? (
        <>
          <Glint x={-box * 0.2} y={-box * 0.22} size={box * 0.09} twinkle={twinkle} />
          <Glint x={box * 0.22} y={box * 0.16} size={box * 0.06} twinkle={twinkle} delay={0.9} />
        </>
      ) : null}
    </g>
  );
}
