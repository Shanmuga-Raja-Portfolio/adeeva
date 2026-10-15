import type { Point } from "./point";
import { OVERLAP_EPSILON } from "./overlapEpsilon";
import { polygonBounds } from "./polygonPlacement";
import { triangulate, type Triangle } from "./triangulate";

function edgeNormals(polygon: readonly Point[]): Point[] {
  const normals: Point[] = [];
  polygon.forEach((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    if (end === undefined) return;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy);
    if (length !== 0) normals.push([-dy / length, dx / length]);
  });
  return normals;
}

function projection(polygon: readonly Point[], axis: Point): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const [x, y] of polygon) {
    const value = x * axis[0] + y * axis[1];
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return [min, max];
}

function boundsOverlap(a: readonly Point[], b: readonly Point[]): boolean {
  const first = polygonBounds(a);
  const second = polygonBounds(b);
  return (
    first.maxX - second.minX > OVERLAP_EPSILON &&
    second.maxX - first.minX > OVERLAP_EPSILON &&
    first.maxY - second.minY > OVERLAP_EPSILON &&
    second.maxY - first.minY > OVERLAP_EPSILON
  );
}

export function convexPolygonsOverlap(a: readonly Point[], b: readonly Point[]): boolean {
  const separates = (axis: Point) => {
    const [minA, maxA] = projection(a, axis);
    const [minB, maxB] = projection(b, axis);
    return !(maxA - minB > OVERLAP_EPSILON && maxB - minA > OVERLAP_EPSILON);
  };
  return !edgeNormals(a).some(separates) && !edgeNormals(b).some(separates);
}

export function polygonsOverlap(a: readonly Point[], b: readonly Point[]): boolean {
  if (!boundsOverlap(a, b)) return false;
  const trianglesB = triangulate(b);
  return triangulate(a).some((first: Triangle) =>
    trianglesB.some((second) => boundsOverlap(first, second) && convexPolygonsOverlap(first, second)),
  );
}
