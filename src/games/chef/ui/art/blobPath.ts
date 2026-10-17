import { seededUnit } from "../../../../ui/art/seedFromText";

export function blobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  wobble = 0.06,
  count = 14,
): string {
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const scale = 1 + (seededUnit(seed, index) - 0.5) * 2 * wobble;
    return [cx + Math.cos(angle) * rx * scale, cy + Math.sin(angle) * ry * scale] as const;
  });
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  const first = points[0];
  const last = points[count - 1];
  if (first === undefined || last === undefined) return "";
  const start = mid(last, first);
  const segments = points.map((point, index) => {
    const next = points[(index + 1) % count] ?? first;
    const end = mid(point, next);
    return `Q${point[0].toFixed(1)} ${point[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  });
  return `M${start[0].toFixed(1)} ${start[1].toFixed(1)} ${segments.join(" ")} Z`;
}
