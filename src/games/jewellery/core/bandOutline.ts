import type { Point } from "../../../engine/geometry/point";
import type { BandId } from "../content/partOption";
import { fitted, type UnitShape } from "./unitCurves";

const BAR: UnitShape = {
  points: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  dots: [],
};

function wavyEdges(crests: number, depth: number, offset: number): UnitShape {
  const count = 56;
  const wave = (x: number, phase: number) => depth * Math.sin(2 * Math.PI * crests * x + phase);
  const top = Array.from({ length: count + 1 }, (_, index): Point => {
    const x = index / count;
    return [x, 0.15 + wave(x, 0)];
  });
  const bottom = Array.from({ length: count + 1 }, (_, index): Point => {
    const x = 1 - index / count;
    return [x, 0.85 + wave(x, offset)];
  });
  return { points: fitted([...top, ...bottom]), dots: [] };
}

export function bandOutline(band: BandId): UnitShape {
  if (band === "wavy-band") return wavyEdges(7, 0.15, 0);
  if (band === "twist-band") return wavyEdges(6, 0.13, Math.PI);
  return BAR;
}

export function barOutline(): UnitShape {
  return BAR;
}
