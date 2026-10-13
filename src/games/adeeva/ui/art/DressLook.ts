import type { FabricDef } from "../../content/fabric";
import type { TrimId } from "../../content/trim";

export interface DressParts {
  bodice?: string | undefined;
  neckline?: string | undefined;
  sleeves?: string | undefined;
  skirt?: string | undefined;
}

export interface DressFabrics {
  bodice?: FabricDef | undefined;
  neckline?: FabricDef | undefined;
  sleeves?: FabricDef | undefined;
  skirt?: FabricDef | undefined;
}

export interface PlacedTrim {
  id: string;
  trimId: TrimId;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  layer: number;
}
