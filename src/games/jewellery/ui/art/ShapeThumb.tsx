import type { Point } from "../../../../engine/geometry/point";
import {
  ACCENT_IDS,
  BAND_IDS,
  type AccentId,
  type BandId,
  type OptionId,
  type ShapeId,
} from "../../content/partOption";
import { accentOutlines, bandOutline, shapeOutline } from "../../core";
import { outlinePath } from "./outlinePath";

interface ShapeThumbProps {
  readonly optionId: OptionId;
}

function isBand(optionId: OptionId): optionId is BandId {
  return BAND_IDS.some((id) => id === optionId);
}

function isAccent(optionId: OptionId): optionId is AccentId {
  return ACCENT_IDS.some((id) => id === optionId);
}

function inBox(points: readonly Point[], x: number, y: number, width: number, height: number): Point[] {
  return points.map(([px, py]): Point => [x + px * width, y + py * height]);
}

function BandThumb({ band }: { readonly band: BandId }) {
  const outline = inBox(bandOutline(band).points, 0.05, 0.36, 0.9, 0.28);
  return (
    <>
      <path
        d={outlinePath(outline)}
        fill="#d9b23c"
        stroke="#664e08"
        strokeWidth={0.03}
        strokeLinejoin="round"
      />
      {band === "hammered-band"
        ? [0.2, 0.38, 0.56, 0.74].map((x) => (
            <ellipse key={x} cx={x} cy={0.5} rx={0.05} ry={0.04} fill="#664e08" opacity={0.4} />
          ))
        : null}
      {band === "beaded-band"
        ? [0.14, 0.29, 0.43, 0.57, 0.71, 0.86].map((x) => (
            <circle key={x} cx={x} cy={0.5} r={0.06} fill="#fff3b0" stroke="#664e08" strokeWidth={0.02} />
          ))
        : null}
      {band === "twist-band"
        ? [0.16, 0.32, 0.48, 0.64, 0.8].map((x) => (
            <path
              key={x}
              d={`M${x} 0.38 L${x + 0.08} 0.62`}
              stroke="#664e08"
              strokeWidth={0.025}
              opacity={0.6}
            />
          ))
        : null}
    </>
  );
}

function AccentThumb({ accent }: { readonly accent: AccentId }) {
  const plate = inBox(shapeOutline("circle").points, 0.1, 0.1, 0.8, 0.8);
  const holes = accentOutlines(accent, "circle").map((hole) => inBox(hole.points, 0.1, 0.1, 0.8, 0.8));
  return (
    <path
      d={[outlinePath(plate), ...holes.map((hole) => outlinePath(hole))].join(" ")}
      fill="#d9b23c"
      fillRule="evenodd"
      stroke="#664e08"
      strokeWidth={0.03}
      strokeLinejoin="round"
    />
  );
}

function ShapeOnly({ shape }: { readonly shape: ShapeId }) {
  return (
    <path
      d={outlinePath(inBox(shapeOutline(shape).points, 0.1, 0.1, 0.8, 0.8))}
      fill="#d9b23c"
      stroke="#664e08"
      strokeWidth={0.03}
      strokeLinejoin="round"
    />
  );
}

export function ShapeThumb({ optionId }: ShapeThumbProps) {
  return (
    <svg className="jb-shape-thumb" viewBox="0 0 1 1" aria-hidden="true">
      {isBand(optionId) ? (
        <BandThumb band={optionId} />
      ) : isAccent(optionId) ? (
        <AccentThumb accent={optionId} />
      ) : (
        <ShapeOnly shape={optionId} />
      )}
    </svg>
  );
}
