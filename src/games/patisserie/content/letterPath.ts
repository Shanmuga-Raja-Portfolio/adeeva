import type { Point } from "../../../engine/geometry/point";
import type { PipePathDef } from "./pipePattern";
import { PIPE_CANVAS_CM } from "./pipeShape";

export const PLAQUE_WORDS = ["JOY", "HOME", "BLOOM", "CHEER", "HELLO", "THANKS"] as const;
export type PlaqueWord = (typeof PLAQUE_WORDS)[number];

const LETTER_HEIGHT_CM = 12;
const LETTER_WIDTH_CM = 9;
const ARC_STEPS = 28;

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number): Point[] {
  return Array.from({ length: ARC_STEPS + 1 }, (_, index): Point => {
    const theta = ((from + ((to - from) * index) / ARC_STEPS) * Math.PI) / 180;
    return [cx + rx * Math.cos(theta), cy + ry * Math.sin(theta)];
  });
}

const STROKES: Readonly<Record<string, readonly Point[]>> = {
  A: [
    [0, 1],
    [0.5, 0],
    [1, 1],
    [0.75, 0.5],
    [0.25, 0.5],
  ],
  B: [
    [0, 1],
    [0, 0],
    [0.6, 0],
    [0.85, 0.12],
    [0.85, 0.38],
    [0.6, 0.5],
    [0, 0.5],
    [0.7, 0.5],
    [0.95, 0.62],
    [0.95, 0.88],
    [0.7, 1],
    [0, 1],
  ],
  C: arc(0.55, 0.5, 0.48, 0.5, -45, -315),
  E: [
    [1, 0],
    [0, 0],
    [0, 0.5],
    [0.75, 0.5],
    [0, 0.5],
    [0, 1],
    [1, 1],
  ],
  H: [
    [0, 0],
    [0, 1],
    [0, 0.5],
    [1, 0.5],
    [1, 0],
    [1, 1],
  ],
  J: [[0.8, 0], [0.8, 0.7], ...arc(0.5, 0.7, 0.3, 0.3, 0, 180).slice(1)],
  K: [
    [0, 0],
    [0, 1],
    [0, 0.6],
    [0.95, 0],
    [0.3, 0.41],
    [1, 1],
  ],
  L: [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  M: [
    [0, 1],
    [0, 0],
    [0.5, 0.6],
    [1, 0],
    [1, 1],
  ],
  N: [
    [0, 1],
    [0, 0],
    [1, 1],
    [1, 0],
  ],
  O: arc(0.5, 0.5, 0.5, 0.5, -90, 270),
  R: [
    [0, 1],
    [0, 0],
    [0.65, 0],
    [0.9, 0.13],
    [0.9, 0.37],
    [0.65, 0.5],
    [0, 0.5],
    [0.4, 0.5],
    [1, 1],
  ],
  S: [
    [0.95, 0.15],
    [0.75, 0],
    [0.25, 0],
    [0.05, 0.15],
    [0.05, 0.35],
    [0.25, 0.5],
    [0.75, 0.5],
    [0.95, 0.65],
    [0.95, 0.85],
    [0.75, 1],
    [0.25, 1],
    [0.05, 0.85],
  ],
  T: [
    [0, 0],
    [1, 0],
    [0.5, 0],
    [0.5, 1],
  ],
  Y: [
    [0, 0],
    [0.5, 0.5],
    [1, 0],
    [0.5, 0.5],
    [0.5, 1],
  ],
};

function placed(points: readonly Point[]): Point[] {
  const left = (PIPE_CANVAS_CM - LETTER_WIDTH_CM) / 2;
  const top = (PIPE_CANVAS_CM - LETTER_HEIGHT_CM) / 2;
  return points.map(([x, y]): Point => [
    Math.round((left + x * LETTER_WIDTH_CM) * 100) / 100,
    Math.round((top + y * LETTER_HEIGHT_CM) * 100) / 100,
  ]);
}

export function letterPaths(word: PlaqueWord): PipePathDef[] {
  return [...word].map((letter, index) => ({
    id: `letter-${index + 1}`,
    name: `Letter ${letter}`,
    surface: "plaque",
    points: placed(STROKES[letter] ?? []),
    closed: false,
  }));
}
