import { seededUnit } from "../../../../ui/art/seedFromText";

export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
  readonly turn: number;
  readonly size: number;
  readonly pick: number;
}

export function scatterInEllipse(
  seed: number,
  count: number,
  width: number,
  height: number,
  margin = 0.82,
): ScatterPoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = seededUnit(seed, index * 4) * Math.PI * 2;
    const radius = Math.sqrt(seededUnit(seed, index * 4 + 1)) * margin;
    return {
      x: width / 2 + Math.cos(angle) * radius * (width / 2),
      y: height / 2 + Math.sin(angle) * radius * (height / 2),
      turn: seededUnit(seed, index * 4 + 2) * 360,
      size: 0.75 + seededUnit(seed, index * 4 + 3) * 0.5,
      pick: seededUnit(seed, index * 7 + 5),
    };
  });
}
