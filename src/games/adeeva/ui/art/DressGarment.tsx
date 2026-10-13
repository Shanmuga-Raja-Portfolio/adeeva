import type { PartCategory } from "../../content/garmentPart";
import { bodiceShape } from "./BodiceShape";
import { darken } from "../../../../ui/art/colourMix";
import type { DressFabrics, DressParts } from "./DressLook";
import { FabricPattern } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { GarmentPiece } from "../../../../ui/art/cloth/GarmentPiece";
import type { GarmentShape } from "../../../../ui/art/cloth/GarmentShape";
import { necklineShape } from "./NecklineShape";
import { skirtShape } from "../../../../ui/art/cloth/SkirtShape";
import { sleeveShape } from "./SleeveShape";

export interface DressLayerProps {
  idBase: string;
  parts: DressParts;
  fabrics: DressFabrics;
}

const categories: readonly PartCategory[] = ["bodice", "neckline", "sleeves", "skirt"];

function dressPatternId(idBase: string, category: PartCategory): string {
  return `${idBase}-${category}`;
}

function dressShadeId(idBase: string): string {
  return `${idBase}-shade`;
}

function dressSoftId(idBase: string): string {
  return `${idBase}-soft`;
}

export function DressFabricDefs({ idBase, fabrics }: Omit<DressLayerProps, "parts">) {
  return (
    <defs>
      <filter id={dressSoftId(idBase)} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.6" />
      </filter>
      <linearGradient id={dressShadeId(idBase)} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.16} />
        <stop offset="0.3" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="0.68" stopColor="#1c1220" stopOpacity={0.04} />
        <stop offset="1" stopColor="#1c1220" stopOpacity={0.3} />
      </linearGradient>
      {categories.map((category) => {
        const fabric = fabrics[category];
        return fabric ? (
          <FabricPattern key={category} id={dressPatternId(idBase, category)} fabric={fabric} tile={22} />
        ) : null;
      })}
    </defs>
  );
}

function CategoryPieces({
  idBase,
  fabrics,
  category,
  shapes,
  transform,
}: {
  idBase: string;
  fabrics: DressFabrics;
  category: PartCategory;
  shapes: GarmentShape[];
  transform?: string | undefined;
}) {
  const fabric = fabrics[category];
  const look = fabric ? fabricLook(fabric) : undefined;
  const ink = look ? darken(look.base, 0.55) : "#5b4f60";
  const stitch = look ? look.stitch : "#5b4f60";
  return (
    <g className={`ad-dress-${category}`}>
      {shapes.map((shape, index) => (
        <GarmentPiece
          key={index}
          shape={shape}
          patternId={fabric ? dressPatternId(idBase, category) : undefined}
          shadeId={dressShadeId(idBase)}
          softId={dressSoftId(idBase)}
          ink={ink}
          stitch={stitch}
          transform={transform}
        />
      ))}
    </g>
  );
}

export function DressBodyLayer({ idBase, parts, fabrics }: DressLayerProps) {
  return (
    <g className="ad-dress-body">
      {parts.skirt ? (
        <CategoryPieces idBase={idBase} fabrics={fabrics} category="skirt" shapes={skirtShape(parts.skirt)} />
      ) : null}
      {parts.bodice ? (
        <CategoryPieces
          idBase={idBase}
          fabrics={fabrics}
          category="bodice"
          shapes={bodiceShape(parts.bodice, parts.neckline)}
        />
      ) : null}
      {parts.neckline ? (
        <CategoryPieces
          idBase={idBase}
          fabrics={fabrics}
          category="neckline"
          shapes={necklineShape(parts.neckline)}
        />
      ) : null}
    </g>
  );
}

export function DressSleeveLayer({ idBase, parts, fabrics }: DressLayerProps) {
  if (!parts.sleeves) return null;
  const shapes = sleeveShape(parts.sleeves);
  if (shapes.length === 0) return null;
  return (
    <g className="ad-dress-sleeves">
      <CategoryPieces idBase={idBase} fabrics={fabrics} category="sleeves" shapes={shapes} />
      <CategoryPieces
        idBase={idBase}
        fabrics={fabrics}
        category="sleeves"
        shapes={shapes}
        transform="matrix(-1 0 0 1 400 0)"
      />
    </g>
  );
}
