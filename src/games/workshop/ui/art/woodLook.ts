import { darken, lighten, mixHex } from "../../../../ui/art/colourMix";
import type { WoodId } from "../../content/wood";

export interface WoodLook {
  readonly base: string;
  readonly light: string;
  readonly line: string;
  readonly deep: string;
  readonly knot: string;
}

const WOOD_BASE: Readonly<Record<WoodId, string>> = {
  pine: "#e8b777",
  spruce: "#f0d6a4",
  poplar: "#e6dab0",
  cedar: "#c97a52",
  larch: "#d9a061",
  birch: "#f2e0bd",
  beech: "#e7c194",
  ash: "#e9d6b0",
  maple: "#f1dcb4",
  cherry: "#b8643f",
  oak: "#cf9a5a",
  walnut: "#6f4a32",
};

export function woodLook(woodId: WoodId): WoodLook {
  const base = WOOD_BASE[woodId];
  return {
    base,
    light: lighten(base, 0.28),
    line: darken(base, 0.2),
    deep: darken(base, 0.38),
    knot: mixHex(darken(base, 0.45), "#3a2218", 0.3),
  };
}

export function hexWoodLook(base: string): WoodLook {
  return {
    base,
    light: lighten(base, 0.25),
    line: darken(base, 0.18),
    deep: darken(base, 0.36),
    knot: darken(base, 0.5),
  };
}
