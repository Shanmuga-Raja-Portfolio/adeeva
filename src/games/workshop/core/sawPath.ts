import type { Point } from "../../../engine/geometry/point";
import type { PartOptionId } from "../content/partOption";
import type { PartDef } from "../content/product";
import { boardSizeById, productById } from "./catalog";
import type { PartPlacement, PieceDesign, QuarterTurn } from "./commissionRun";
import type { OwnedBoard } from "./ownedBoard";

export interface SawCut {
  readonly points: readonly Point[];
  readonly closed: boolean;
}

const CORNER_RADIUS_CM = 4;
const ARC_STEPS = 6;
const ARCH_STEPS = 16;
const EDGE_EPSILON = 1e-6;

function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number): Point[] {
  return Array.from({ length: steps + 1 }, (_, index): Point => {
    const angle = from + ((to - from) * index) / steps;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });
}

function rounded(width: number, height: number): Point[] {
  const r = Math.min(CORNER_RADIUS_CM, Math.min(width, height) / 3);
  const half = Math.PI / 2;
  return [
    ...arc(r, r, r, Math.PI, Math.PI + half, ARC_STEPS),
    ...arc(width - r, r, r, -half, 0, ARC_STEPS),
    ...arc(width - r, height - r, r, 0, half, ARC_STEPS),
    ...arc(r, height - r, r, half, Math.PI, ARC_STEPS),
  ];
}

function arched(width: number, height: number): Point[] {
  const rise = Math.min(4, height * 0.3);
  const top = Array.from({ length: ARCH_STEPS + 1 }, (_, index): Point => {
    const t = index / ARCH_STEPS;
    return [width * t, rise * (1 - Math.sin(Math.PI * t))];
  });
  return [...top, [width, height], [0, height]];
}

function rectangle(width: number, height: number): Point[] {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
}

function tapered(width: number, height: number): Point[] {
  return [
    [0, 0],
    [width, height * 0.25],
    [width, height * 0.75],
    [0, height],
  ];
}

function splayed(width: number, height: number): Point[] {
  const slant = Math.min(2, width * 0.1);
  return [
    [0, 0],
    [width - slant, 0],
    [width, height],
    [slant, height],
  ];
}

function optionFor(design: PieceDesign, slot: "edge" | "legs" | "accent"): PartOptionId | null {
  return design.options[slot] ?? null;
}

function partOutline(part: PartDef, design: PieceDesign): Point[] {
  const { width, height } = part;
  if (part.role === "panel") {
    const edge = optionFor(design, "edge");
    if (edge === "rounded-edge") return rounded(width, height);
    if (edge === "arched-edge") return arched(width, height);
  }
  if (part.role === "leg") {
    const legs = optionFor(design, "legs");
    if (legs === "tapered-legs") return tapered(width, height);
    if (legs === "splayed-legs") return splayed(width, height);
  }
  return rectangle(width, height);
}

function star(cx: number, cy: number, outer: number): Point[] {
  return Array.from({ length: 10 }, (_, index): Point => {
    const radius = index % 2 === 0 ? outer : outer * 0.45;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
}

function leaf(cx: number, cy: number, size: number): Point[] {
  const steps = 10;
  const upper = Array.from({ length: steps + 1 }, (_, index): Point => {
    const t = index / steps;
    return [cx - size + 2 * size * t, cy - Math.sin(Math.PI * t) * size * 0.45];
  });
  const lower = Array.from({ length: steps - 1 }, (_, index): Point => {
    const t = 1 - (index + 1) / steps;
    return [cx - size + 2 * size * t, cy + Math.sin(Math.PI * t) * size * 0.45];
  });
  return [...upper, ...lower];
}

function accentCuts(part: PartDef, design: PieceDesign): SawCut[] {
  if (design.productId === null || productById(design.productId).accentPart !== part.id) return [];
  const accent = optionFor(design, "accent");
  const { width, height } = part;
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height) * 0.3;
  if (accent === "star-cutout") return [{ points: star(cx, cy, size), closed: true }];
  if (accent === "leaf-cutout") return [{ points: leaf(cx, cy, size * 1.2), closed: true }];
  if (accent === "slats")
    return [0.3, 0.5, 0.7].map((share) => ({
      points: [
        [width * share, height * 0.25],
        [width * share, height * 0.75],
      ],
      closed: false,
    }));
  return [];
}

function toBoard(point: Point, part: PartDef, placement: Pick<PartPlacement, "x" | "y" | "rotation">): Point {
  const [x, y] = point;
  const turn: QuarterTurn = placement.rotation;
  const turned: Point =
    turn === 0
      ? [x, y]
      : turn === 90
        ? [part.height - y, x]
        : turn === 180
          ? [part.width - x, part.height - y]
          : [y, part.width - x];
  return [turned[0] + placement.x, turned[1] + placement.y];
}

function onSameBoardEdge(a: Point, b: Point, width: number, height: number): boolean {
  const near = (value: number, target: number) => Math.abs(value - target) <= EDGE_EPSILON;
  return (
    (near(a[0], 0) && near(b[0], 0)) ||
    (near(a[0], width) && near(b[0], width)) ||
    (near(a[1], 0) && near(b[1], 0)) ||
    (near(a[1], height) && near(b[1], height))
  );
}

function longestEdgeRun(flags: readonly boolean[]): { readonly start: number; readonly length: number } {
  let best = { start: 0, length: 0 };
  const count = flags.length;
  for (let start = 0; start < count; start += 1) {
    if (!flags[start] || flags[(start - 1 + count) % count] === true) continue;
    let length = 0;
    while (length < count && flags[(start + length) % count] === true) length += 1;
    if (length > best.length) best = { start, length };
  }
  return best;
}

function openOutline(points: readonly Point[], board: OwnedBoard): SawCut {
  const size = boardSizeById(board.size);
  const count = points.length;
  const flags = points.map((point, index) =>
    onSameBoardEdge(point, points[(index + 1) % count] ?? point, size.width, size.height),
  );
  if (flags.every(Boolean)) return { points: [], closed: false };
  const run = longestEdgeRun(flags);
  if (run.length === 0) return { points, closed: true };
  const first = (run.start + run.length) % count;
  const open = Array.from({ length: count - run.length + 1 }, (_, step) => points[(first + step) % count]);
  return { points: open.filter((point): point is Point => point !== undefined), closed: false };
}

export function sawCuts(
  part: PartDef,
  design: PieceDesign,
  placement: Pick<PartPlacement, "x" | "y" | "rotation">,
  board: OwnedBoard,
): SawCut[] {
  const place = (cut: SawCut): SawCut => ({
    points: cut.points.map((point) => toBoard(point, part, placement)),
    closed: cut.closed,
  });
  const outline = partOutline(part, design).map((point) => toBoard(point, part, placement));
  const main = openOutline(outline, board);
  return [main, ...accentCuts(part, design).map(place)].filter((cut) => cut.points.length >= 2);
}
