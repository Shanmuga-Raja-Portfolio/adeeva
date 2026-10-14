import type { Point } from "./point";

export function signedArea(points: readonly Point[]): number {
  return points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length] ?? point;
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0);
}

export function polygonArea(points: readonly Point[]): number {
  return Math.abs(signedArea(points)) / 2;
}
