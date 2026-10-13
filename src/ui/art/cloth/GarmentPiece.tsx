import { fabricFill, fabricSheenFill } from "./FabricPattern";
import type { GarmentShape } from "./GarmentShape";
import { useSvgId } from "../useSvgId";

export interface GarmentPieceProps {
  shape: GarmentShape;
  patternId?: string | undefined;
  shadeId: string;
  softId: string;
  ink: string;
  stitch: string;
  transform?: string | undefined;
}

export function GarmentPiece({
  shape,
  patternId,
  shadeId,
  softId,
  ink,
  stitch,
  transform,
}: GarmentPieceProps) {
  const clipId = useSvgId("piece");
  if (patternId === undefined) {
    return (
      <g transform={transform} className="ad-garment-sketch">
        <path d={shape.d} fill="#fffaf3" fillOpacity={0.55} />
        {shape.folds ? (
          <path
            d={shape.folds}
            fill="none"
            stroke="#5b4f60"
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ) : null}
        {shape.cords ? (
          <path d={shape.cords} fill="none" stroke="#5b4f60" strokeOpacity={0.35} strokeWidth={1} />
        ) : null}
        <path
          d={shape.d}
          fill="none"
          stroke="#5b4f60"
          strokeOpacity={0.85}
          strokeWidth={1.6}
          strokeDasharray="6 4"
          strokeLinejoin="round"
        />
      </g>
    );
  }
  return (
    <g transform={transform}>
      <defs>
        <clipPath id={clipId}>
          <path d={shape.d} />
        </clipPath>
      </defs>
      <path d={shape.d} fill={fabricFill(patternId)} />
      <g clipPath={`url(#${clipId})`}>
        <path d={shape.d} fill={fabricSheenFill(patternId)} />
        <path d={shape.d} fill={`url(#${shadeId})`} />
        {shape.shadows ? (
          <path d={shape.shadows} fill="#1c1220" opacity={0.2} filter={`url(#${softId})`} />
        ) : null}
        {shape.folds ? (
          <path
            d={shape.folds}
            fill="none"
            stroke="#1c1220"
            strokeOpacity={0.28}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ) : null}
        {shape.highlights ? (
          <path
            d={shape.highlights}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.32}
            strokeWidth={5}
            strokeLinecap="round"
            filter={`url(#${softId})`}
          />
        ) : null}
        {shape.seams ? (
          <path
            d={shape.seams}
            fill="none"
            stroke={stitch}
            strokeOpacity={0.75}
            strokeWidth={0.9}
            strokeDasharray="3 2.4"
            strokeLinecap="round"
          />
        ) : null}
      </g>
      {shape.cords ? (
        <path d={shape.cords} fill="none" stroke={stitch} strokeWidth={1.6} strokeLinecap="round" />
      ) : null}
      <path
        d={shape.d}
        fill="none"
        stroke={ink}
        strokeOpacity={0.7}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    </g>
  );
}
