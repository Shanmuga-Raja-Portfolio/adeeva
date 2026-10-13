import type { Point } from "../../../engine/geometry/point";

export const PIPE_CANVAS_CM = 24;
const CENTRE = PIPE_CANVAS_CM / 2;
const RING_STEPS = 96;

function at(radius: number, theta: number): Point {
  return [
    Math.round((CENTRE + radius * Math.cos(theta)) * 100) / 100,
    Math.round((CENTRE + radius * Math.sin(theta)) * 100) / 100,
  ];
}

export function ring(radius: (theta: number) => number, steps = RING_STEPS): Point[] {
  return Array.from({ length: steps }, (_, index) => {
    const theta = -Math.PI / 2 + (index / steps) * Math.PI * 2;
    return at(radius(theta), theta);
  });
}

export function spiral(innerRadius: number, outerRadius: number, turns: number): Point[] {
  const steps = Math.round(turns * 40);
  return Array.from({ length: steps + 1 }, (_, index) => {
    const share = index / steps;
    return at(outerRadius - (outerRadius - innerRadius) * share, -Math.PI / 2 + share * turns * Math.PI * 2);
  });
}

export function arcWave(radius: number, swing: number, waves: number, from: number, to: number): Point[] {
  const steps = 90;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const theta = from + ((to - from) * index) / steps;
    return at(radius + swing * Math.sin(((theta - from) / (to - from)) * waves * Math.PI * 2), theta);
  });
}

export function arcLoops(radius: number, swing: number, loops: number, from: number, to: number): Point[] {
  const steps = 120;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const theta = from + ((to - from) * index) / steps;
    const phase = ((theta - from) / (to - from)) * loops;
    return at(radius + swing * Math.abs(Math.sin(phase * Math.PI)), theta);
  });
}

export function zigzag(left: number, right: number, top: number, bottom: number, peaks: number): Point[] {
  return Array.from({ length: peaks * 2 + 1 }, (_, index): Point => [
    Math.round((left + ((right - left) * index) / (peaks * 2)) * 100) / 100,
    index % 2 === 0 ? top : bottom,
  ]);
}

export function sineLine(left: number, right: number, amplitude: number, waves: number): Point[] {
  const steps = 72;
  return Array.from({ length: steps + 1 }, (_, index): Point => {
    const share = index / steps;
    return [
      Math.round((left + (right - left) * share) * 100) / 100,
      Math.round((CENTRE + amplitude * Math.sin(share * waves * Math.PI * 2)) * 100) / 100,
    ];
  });
}

export function starOutline(points: number, outer: number, inner: number): Point[] {
  return Array.from({ length: points * 2 }, (_, index) => {
    const theta = -Math.PI / 2 + (index * Math.PI) / points;
    return at(index % 2 === 0 ? outer : inner, theta);
  });
}

export function heartOutline(size: number): Point[] {
  const steps = 72;
  return Array.from({ length: steps }, (_, index): Point => {
    const t = (index / steps) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [
      Math.round((CENTRE + (x * size) / 16) * 100) / 100,
      Math.round((CENTRE - 0.6 - (y * size) / 16) * 100) / 100,
    ];
  });
}

export function crescentOutline(outer: number, offset: number): Point[] {
  const steps = 40;
  const outerArc = Array.from({ length: steps + 1 }, (_, index) => {
    const theta = Math.PI * 0.35 + (index / steps) * Math.PI * 1.3;
    return at(outer, theta);
  });
  const innerRadius = outer * 0.82;
  const innerArc = Array.from({ length: steps + 1 }, (_, index): Point => {
    const theta = Math.PI * 1.55 - (index / steps) * Math.PI * 1.1;
    return [
      Math.round((CENTRE + offset + innerRadius * Math.cos(theta)) * 100) / 100,
      Math.round((CENTRE + innerRadius * Math.sin(theta)) * 100) / 100,
    ];
  });
  return [...outerArc, ...innerArc.slice(1, -1)];
}

export function leafOutline(length: number, width: number): Point[] {
  const steps = 36;
  const side = (sign: number) =>
    Array.from({ length: steps + 1 }, (_, index): Point => {
      const share = index / steps;
      const along = -length / 2 + length * share;
      const across = sign * width * Math.sin(share * Math.PI) * (1 - 0.25 * share);
      const angle = -Math.PI / 4;
      return [
        Math.round((CENTRE + along * Math.cos(angle) - across * Math.sin(angle)) * 100) / 100,
        Math.round((CENTRE + along * Math.sin(angle) + across * Math.cos(angle)) * 100) / 100,
      ];
    });
  return [...side(1), ...side(-1).reverse().slice(1, -1)];
}
