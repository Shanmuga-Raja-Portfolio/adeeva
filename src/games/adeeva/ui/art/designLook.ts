import type { PartCategory } from "../../content/garmentPart";
import { fabricById, type Design } from "../../core";
import type { DressFabrics, DressParts } from "./DressLook";

export function designParts(design: Design, visible?: (category: PartCategory) => boolean): DressParts {
  const pick = (category: PartCategory) =>
    visible === undefined || visible(category) ? (design.parts[category] ?? undefined) : undefined;
  return {
    bodice: pick("bodice"),
    neckline: pick("neckline"),
    sleeves: pick("sleeves"),
    skirt: pick("skirt"),
  };
}

export function designFabrics(design: Design): DressFabrics {
  const pick = (category: PartCategory) => {
    const fabricId = design.fabrics[category];
    return fabricId === null ? undefined : fabricById(fabricId);
  };
  return {
    bodice: pick("bodice"),
    neckline: pick("neckline"),
    sleeves: pick("sleeves"),
    skirt: pick("skirt"),
  };
}
