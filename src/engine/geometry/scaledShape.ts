import type { Point } from "./point";

export function scaledShape(shape: readonly Point[], scale: number): Point[] {
  return shape.map(([x, y]): Point => [x * scale, y * scale]);
}
