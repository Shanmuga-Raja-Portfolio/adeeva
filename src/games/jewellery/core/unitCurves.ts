import type { Point } from "../../../engine/geometry/point";
import { polygonBounds } from "../../../engine/geometry/polygonPlacement";

export interface UnitShape {
  readonly points: readonly Point[];
  readonly dots: readonly number[];
}

export interface Circle {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export function ellipsePoints(cx: number, cy: number, rx: number, ry: number, count: number): Point[] {
  return Array.from({ length: count }, (_, index): Point => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  count: number,
): Point[] {
  return Array.from({ length: count + 1 }, (_, index): Point => {
    const angle = from + ((to - from) * index) / count;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

export function arcBetween(
  circle: Circle,
  from: Point,
  to: Point,
  keep: (point: Point) => boolean,
  count: number,
): Point[] {
  const start = Math.atan2(from[1] - circle.y, from[0] - circle.x);
  const end = Math.atan2(to[1] - circle.y, to[0] - circle.x);
  const forward = end > start ? end : end + 2 * Math.PI;
  const backward = end < start ? end : end - 2 * Math.PI;
  const middle = (start + forward) / 2;
  const target = keep([circle.x + circle.r * Math.cos(middle), circle.y + circle.r * Math.sin(middle)])
    ? forward
    : backward;
  return arc(circle.x, circle.y, circle.r, circle.r, start, target, count);
}

export function fitted(points: readonly Point[]): Point[] {
  const { minX, minY, maxX, maxY } = polygonBounds(points);
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  return points.map(([x, y]): Point => [(x - minX) / spanX, (y - minY) / spanY]);
}

export function starPoints(cx: number, cy: number, outer: number, inner: number): Point[] {
  return Array.from({ length: 10 }, (_, index): Point => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (Math.PI * index) / 5;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}

export function mirroredShape(shape: UnitShape): UnitShape {
  const count = shape.points.length;
  const points = [...shape.points].reverse().map(([x, y]): Point => [1 - x, y]);
  return { points, dots: shape.dots.map((index) => count - 1 - index) };
}

export function placedUnit(
  shape: UnitShape,
  cx: number,
  cy: number,
  size: number,
  aspect: number,
): UnitShape {
  return {
    points: shape.points.map(([x, y]): Point => [cx + ((x - 0.5) * size) / aspect, cy + (y - 0.5) * size]),
    dots: shape.dots,
  };
}
