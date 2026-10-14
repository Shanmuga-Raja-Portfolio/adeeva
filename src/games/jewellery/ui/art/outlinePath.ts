import type { Point } from "../../../../engine/geometry/point";

export function outlinePath(points: readonly Point[], scale = 1, dx = 0, dy = 0): string {
  const body = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${(x * scale + dx).toFixed(2)} ${(y * scale + dy).toFixed(2)}`,
    )
    .join(" ");
  return `${body} Z`;
}

export function openPath(points: readonly Point[]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
}
