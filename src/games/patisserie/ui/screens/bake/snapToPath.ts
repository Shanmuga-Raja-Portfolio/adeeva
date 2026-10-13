import type { Point } from "../../../../../engine/geometry/point";

export function snapToPath(points: readonly Point[], closed: boolean, target: Point): Point {
  let best: Point = points[0] ?? target;
  let bestDistance = Infinity;
  const count = closed ? points.length : points.length - 1;
  for (let index = 0; index < count; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    if (start === undefined || end === undefined) continue;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = dx * dx + dy * dy;
    const t =
      length === 0
        ? 0
        : Math.max(0, Math.min(1, ((target[0] - start[0]) * dx + (target[1] - start[1]) * dy) / length));
    const candidate: Point = [start[0] + t * dx, start[1] + t * dy];
    const distance = Math.hypot(candidate[0] - target[0], candidate[1] - target[1]);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}
