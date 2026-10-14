import type { Point } from "./point";
import { signedArea } from "./polygonArea";

export type Triangle = readonly [Point, Point, Point];

const AREA_EPSILON = 1e-9;

function cross(origin: Point, a: Point, b: Point): number {
  return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);
}

function samePoint(a: Point, b: Point): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function triangleContains(triangle: Triangle, point: Point): boolean {
  const [a, b, c] = triangle;
  const sides = [cross(a, b, point), cross(b, c, point), cross(c, a, point)];
  return !(sides.some((side) => side < -AREA_EPSILON) && sides.some((side) => side > AREA_EPSILON));
}

function cornerAt(ring: readonly Point[], index: number): Triangle | null {
  const count = ring.length;
  const previous = ring[(index - 1 + count) % count];
  const current = ring[index];
  const next = ring[(index + 1) % count];
  if (previous === undefined || current === undefined || next === undefined) return null;
  return [previous, current, next];
}

function isEar(ring: readonly Point[], corner: Triangle): boolean {
  if (cross(corner[0], corner[1], corner[2]) <= AREA_EPSILON) return false;
  return ring.every(
    (point) => corner.some((vertex) => samePoint(vertex, point)) || !triangleContains(corner, point),
  );
}

function isDegenerate(corner: Triangle): boolean {
  return Math.abs(cross(corner[0], corner[1], corner[2])) <= AREA_EPSILON;
}

function fan(ring: readonly Point[]): Triangle[] {
  const [first, ...rest] = ring;
  if (first === undefined) return [];
  return rest.slice(0, -1).flatMap((point, index): Triangle[] => {
    const next = rest[index + 1];
    return next === undefined ? [] : [[first, point, next]];
  });
}

export function triangulate(polygon: readonly Point[]): Triangle[] {
  const ring = signedArea(polygon) < 0 ? [...polygon].reverse() : [...polygon];
  const triangles: Triangle[] = [];
  while (ring.length > 3) {
    const corners = ring.map((_, index) => cornerAt(ring, index));
    const degenerate = corners.findIndex((corner) => corner !== null && isDegenerate(corner));
    if (degenerate !== -1) {
      ring.splice(degenerate, 1);
      continue;
    }
    const earIndex = corners.findIndex((corner) => corner !== null && isEar(ring, corner));
    const ear = corners[earIndex];
    if (ear === undefined || ear === null) return [...triangles, ...fan(ring)];
    triangles.push(ear);
    ring.splice(earIndex, 1);
  }
  const last = ring.length === 3 ? cornerAt(ring, 1) : null;
  return last === null || isDegenerate(last) ? triangles : [...triangles, last];
}
