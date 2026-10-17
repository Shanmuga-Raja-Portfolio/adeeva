import type { Point } from "../../../engine/geometry/point";
import type { ShapeId } from "../content/partOption";
import type { StoneCut } from "../content/stone";
import {
  arc,
  arcBetween,
  ellipsePoints,
  fitted,
  starPoints,
  type Circle,
  type UnitShape,
} from "./unitCurves";

export { mirroredShape, type UnitShape } from "./unitCurves";

const CURVE_POINTS = 48;

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

function star(): UnitShape {
  return { points: fitted(starPoints(0.5, 0.5, 0.5, 0.22)), dots: Array.from({ length: 10 }, (_, i) => i) };
}

function shell(): UnitShape {
  const across = 36;
  const top = Array.from({ length: across + 1 }, (_, index): Point => {
    const t = index / across;
    return [t, 0.42 - 0.34 * Math.sin(Math.PI * t) - 0.08 * Math.abs(Math.sin(3 * Math.PI * t))];
  });
  const side = 8;
  const right = Array.from({ length: side }, (_, index): Point => {
    const t = (index + 1) / side;
    return [1 - 0.5 * t, 0.42 + 0.58 * t - 0.12 * Math.sin(Math.PI * t)];
  });
  const left = Array.from({ length: side - 1 }, (_, index): Point => {
    const t = (index + 1) / side;
    return [0.5 - 0.5 * t, 1 - 0.58 * t - 0.12 * Math.sin(Math.PI * t)];
  });
  return { points: fitted([...top, ...right, ...left]), dots: [across + side] };
}

function flower(): UnitShape {
  const petals = 5;
  const steps = 14;
  const points: Point[] = [];
  const dots: number[] = [];
  for (let petal = 0; petal < petals; petal += 1)
    for (let step = 0; step < steps; step += 1) {
      const angle = -Math.PI / 2 + Math.PI / petals + (2 * Math.PI * (petal + step / steps)) / petals;
      if (step === 0) dots.push(points.length);
      const radius = 0.5 * (0.42 + 0.58 * Math.abs(Math.cos((petals * (angle + Math.PI / 2)) / 2)));
      points.push([0.5 + radius * Math.cos(angle), 0.5 + radius * Math.sin(angle)]);
    }
  return { points: fitted(points), dots };
}

function wave(): UnitShape {
  const steps = 28;
  const middle = (x: number) => 0.62 - 0.24 * x + 0.12 * Math.sin(2 * Math.PI * x);
  const top = Array.from({ length: steps + 1 }, (_, index): Point => {
    const x = index / steps;
    return [x, middle(x) - 0.34 * Math.sin(Math.PI * x)];
  });
  const bottom = Array.from({ length: steps - 1 }, (_, index): Point => {
    const x = 1 - (index + 1) / steps;
    return [x, middle(x) + 0.3 * Math.sin(Math.PI * x)];
  });
  return { points: fitted([...top, ...bottom]), dots: [0, steps] };
}

function lantern(): UnitShape {
  const cx = 0.5;
  const cy = 0.61;
  const rx = 0.5;
  const ry = 0.39;
  const tab = 0.12;
  const joinAngle = Math.asin(tab / rx);
  const joinY = cy - ry * Math.cos(joinAngle);
  const body = arc(cx, cy, rx, ry, -Math.PI / 2 + joinAngle, (3 * Math.PI) / 2 - joinAngle, 40);
  const points: Point[] = [
    [cx - tab, 0],
    [cx + tab, 0],
    [cx + tab, joinY],
    ...body.slice(1, -1),
    [cx - tab, joinY],
  ];
  return { points, dots: [0, 1, 2, points.length - 1] };
}

const SHAPES: Readonly<Record<ShapeId, () => UnitShape>> = {
  circle,
  heart,
  leaf,
  raindrop,
  crescent,
  star,
  shell,
  flower,
  wave,
  lantern,
};

export function shapeOutline(shape: ShapeId): UnitShape {
  return SHAPES[shape]();
}

const SPLIT_X = 0.5;
const ON_LINE = 1e-9;

interface ClipPoint {
  readonly point: Point;
  readonly dot: boolean;
  readonly cut: boolean;
}

function splitPoint(a: Point, b: Point): Point {
  const t = (SPLIT_X - a[0]) / (b[0] - a[0]);
  return [SPLIT_X, a[1] + (b[1] - a[1]) * t];
}

export function leftHalf(shape: UnitShape): UnitShape {
  const count = shape.points.length;
  const kept: ClipPoint[] = [];
  shape.points.forEach((current, index) => {
    const next = shape.points[(index + 1) % count];
    if (next === undefined) return;
    const inside = current[0] <= SPLIT_X + ON_LINE;
    const nextInside = next[0] <= SPLIT_X + ON_LINE;
    if (inside)
      kept.push({
        point: current,
        dot: shape.dots.includes(index),
        cut: Math.abs(current[0] - SPLIT_X) <= ON_LINE,
      });
    if (inside !== nextInside) kept.push({ point: splitPoint(current, next), dot: true, cut: true });
  });
  const dots = kept.flatMap((entry, index) => {
    const before = kept[(index + kept.length - 1) % kept.length];
    const after = kept[(index + 1) % kept.length];
    const endsCut = entry.cut && ((before?.cut ?? false) || (after?.cut ?? false));
    return entry.dot || endsCut ? [index] : [];
  });
  return { points: fitted(kept.map((entry) => entry.point)), dots };
}

export function halfOutline(shape: ShapeId): UnitShape {
  return leftHalf(shapeOutline(shape));
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
