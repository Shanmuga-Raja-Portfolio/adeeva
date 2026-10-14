import type { Point } from "./point";

export function polylineLength(points: readonly Point[]): number {
  return points.slice(1).reduce((sum, point, index) => {
    const previous = points[index] ?? point;
    return sum + Math.hypot(point[0] - previous[0], point[1] - previous[1]);
  }, 0);
}
