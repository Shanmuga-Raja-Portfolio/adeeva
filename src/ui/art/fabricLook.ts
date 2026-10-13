import type { FabricDef } from "../../content/fabric";
import type { MaterialDef } from "../../content/material";
import { colourById, materialById } from "../../core";
import { darken, lighten, luminance, mixHex } from "./colourMix";

export interface FabricLook {
  base: string;
  light: string;
  deep: string;
  motif: string;
  motifSoft: string;
  leaf: string;
  glint: string;
  stitch: string;
  dark: boolean;
  material: MaterialDef;
}

export function fabricLook(fabric: FabricDef): FabricLook {
  const base = colourById(fabric.colour).hex;
  const material = materialById(fabric.material);
  const lum = luminance(base);
  const dark = lum < 0.18;
  const motif = dark
    ? mixHex(base, "#fff4e8", 0.78)
    : lum > 0.55
      ? mixHex(base, "#9b2d55", 0.62)
      : lighten(base, 0.8);
  return {
    base,
    light: lighten(base, dark ? 0.22 : 0.35),
    deep: darken(base, dark ? 0.35 : 0.3),
    motif,
    motifSoft: mixHex(motif, base, 0.45),
    leaf: dark ? "#7fb08c" : mixHex("#5f8f6c", base, 0.18),
    glint: fabric.colour === "gold" ? "#fff6d0" : dark ? "#f5d77a" : "#ffffff",
    stitch: dark ? lighten(base, 0.45) : darken(base, 0.42),
    dark,
    material,
  };
}
