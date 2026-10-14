import type { Point } from "../../../engine/geometry/point";
import { polygonBounds } from "../../../engine/geometry/polygonPlacement";
import type { AccentId, BandId, ShapeId } from "../content/partOption";
import type { StoneCut } from "../content/stone";

export interface UnitShape {
  readonly points: readonly Point[];
  readonly dots: readonly number[];
}

const CURVE_POINTS = 48;

function ellipsePoints(cx: number, cy: number, rx: number, ry: number, count: number): Point[] {
  return Array.from({ length: count }, (_, index): Point => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

function arc(
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

interface Circle {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

function arcBetween(
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

function fitted(points: readonly Point[]): Point[] {
  const { minX, minY, maxX, maxY } = polygonBounds(points);
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  return points.map(([x, y]): Point => [(x - minX) / spanX, (y - minY) / spanY]);
}

function circle(): UnitShape {
  return { points: ellipsePoints(0.5, 0.5, 0.5, 0.5, CURVE_POINTS), dots: [] };
}

function heart(): UnitShape {
  const count = 64;
  const raw = Array.from({ length: count }, (_, index): Point => {
    const t = (2 * Math.PI * index) / count;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return [x, y];
  });
  return { points: fitted(raw), dots: [count / 2] };
}

function leaf(): UnitShape {
  const side = 24;
  const right = Array.from({ length: side + 1 }, (_, index): Point => {
    const s = index / side;
    return [0.5 + 0.42 * Math.sin(Math.PI * s), s];
  });
  const left = Array.from({ length: side - 1 }, (_, index): Point => {
    const s = 1 - (index + 1) / side;
    return [0.5 - 0.42 * Math.sin(Math.PI * s), s];
  });
  return { points: [...right, ...left], dots: [] };
}

function raindrop(): UnitShape {
  const cx = 0.5;
  const cy = 0.64;
  const r = 0.36;
  const spread = Math.acos(r / cy);
  const from = -Math.PI / 2 + spread;
  const to = (3 * Math.PI) / 2 - spread;
  return { points: [[0.5, 0], ...arc(cx, cy, r, r, from, to, 40)], dots: [0] };
}

function crescent(): UnitShape {
  const outer: Circle = { x: 0.5, y: 0.5, r: 0.5 };
  const inner: Circle = { x: 0.72, y: 0.4, r: 0.42 };
  const dx = inner.x - outer.x;
  const dy = inner.y - outer.y;
  const d = Math.hypot(dx, dy);
  const a = (outer.r ** 2 - inner.r ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(outer.r ** 2 - a ** 2);
  const baseX = outer.x + (a * dx) / d;
  const baseY = outer.y + (a * dy) / d;
  const tipA: Point = [baseX - (h * dy) / d, baseY + (h * dx) / d];
  const tipB: Point = [baseX + (h * dy) / d, baseY - (h * dx) / d];
  const outsideInner = (point: Point) => Math.hypot(point[0] - inner.x, point[1] - inner.y) > inner.r;
  const insideOuter = (point: Point) => Math.hypot(point[0] - outer.x, point[1] - outer.y) < outer.r;
  const outerPoints = arcBetween(outer, tipA, tipB, outsideInner, 32);
  const innerPoints = arcBetween(inner, tipB, tipA, insideOuter, 24).slice(1, -1);
  return { points: fitted([...outerPoints, ...innerPoints]), dots: [0, outerPoints.length - 1] };
}

function starPoints(cx: number, cy: number, outer: number, inner: number): Point[] {
  return Array.from({ length: 10 }, (_, index): Point => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (Math.PI * index) / 5;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}

function star(): UnitShape {
  return { points: fitted(starPoints(0.5, 0.5, 0.5, 0.22)), dots: Array.from({ length: 10 }, (_, i) => i) };
}

const SHAPES: Readonly<Record<ShapeId, () => UnitShape>> = {
  circle,
  heart,
  leaf,
  raindrop,
  crescent,
  star,
};

export function shapeOutline(shape: ShapeId): UnitShape {
  return SHAPES[shape]();
}

function wavyBand(): UnitShape {
  const count = 56;
  const wave = (x: number) => 0.15 * Math.sin(2 * Math.PI * 7 * x);
  const top = Array.from({ length: count + 1 }, (_, index): Point => {
    const x = index / count;
    return [x, 0.15 + wave(x)];
  });
  const bottom = Array.from({ length: count + 1 }, (_, index): Point => {
    const x = 1 - index / count;
    return [x, 0.85 + wave(x)];
  });
  return { points: fitted([...top, ...bottom]), dots: [] };
}

export function bandOutline(band: BandId): UnitShape {
  if (band === "wavy-band") return wavyBand();
  return {
    points: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    dots: [],
  };
}

function roundedSquare(): UnitShape {
  const inset = 0.06;
  const radius = 0.14;
  const corners: [number, number, number][] = [
    [1 - inset - radius, inset + radius, -Math.PI / 2],
    [1 - inset - radius, 1 - inset - radius, 0],
    [inset + radius, 1 - inset - radius, Math.PI / 2],
    [inset + radius, inset + radius, Math.PI],
  ];
  const points = corners.flatMap(([cx, cy, start]) =>
    arc(cx, cy, radius, radius, start, start + Math.PI / 2, 4),
  );
  return { points, dots: [] };
}

export function seatOutline(cut: StoneCut): UnitShape {
  switch (cut) {
    case "round":
      return circle();
    case "oval":
      return { points: ellipsePoints(0.5, 0.5, 0.36, 0.5, CURVE_POINTS), dots: [] };
    case "square":
      return roundedSquare();
    case "teardrop":
      return raindrop();
  }
}

export function loopOutline(): UnitShape {
  const left = arc(0.2, 0.5, 0.2, 0.5, Math.PI / 2, (3 * Math.PI) / 2, 12);
  const right = arc(0.8, 0.5, 0.2, 0.5, -Math.PI / 2, Math.PI / 2, 12);
  return { points: [...left, ...right], dots: [] };
}

interface AccentAnchor {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly vertical: boolean;
}

const ACCENT_ANCHORS: Readonly<Record<ShapeId, AccentAnchor>> = {
  circle: { x: 0.5, y: 0.5, size: 0.34, vertical: false },
  heart: { x: 0.5, y: 0.42, size: 0.3, vertical: false },
  leaf: { x: 0.5, y: 0.5, size: 0.3, vertical: true },
  raindrop: { x: 0.5, y: 0.64, size: 0.3, vertical: false },
  crescent: { x: 0.2, y: 0.52, size: 0.2, vertical: true },
  star: { x: 0.5, y: 0.53, size: 0.24, vertical: false },
};

export function accentOutlines(accent: AccentId, shape: ShapeId): UnitShape[] {
  const anchor = ACCENT_ANCHORS[shape];
  if (accent === "plain") return [];
  if (accent === "star-window") {
    const half = anchor.size / 2;
    return [
      {
        points: starPoints(anchor.x, anchor.y, half, half * 0.45),
        dots: Array.from({ length: 10 }, (_, i) => i),
      },
    ];
  }
  const radius = anchor.size * 0.2;
  const gap = anchor.size * 0.5;
  return [-1, 0, 1].map((offset) => ({
    points: ellipsePoints(
      anchor.vertical ? anchor.x : anchor.x + offset * gap,
      anchor.vertical ? anchor.y + offset * gap : anchor.y,
      radius,
      radius,
      20,
    ),
    dots: [],
  }));
}

export function mirroredShape(shape: UnitShape): UnitShape {
  const count = shape.points.length;
  const points = [...shape.points].reverse().map(([x, y]): Point => [1 - x, y]);
  return { points, dots: shape.dots.map((index) => count - 1 - index) };
}
