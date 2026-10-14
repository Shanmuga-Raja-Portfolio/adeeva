import type { Point } from "./point";

export function rectangle(width: number, height: number): readonly Point[] {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
}
