import type { Point } from "../../../engine/geometry/point";
import {
  arcLoops,
  arcWave,
  crescentOutline,
  heartOutline,
  leafOutline,
  ring,
  sineLine,
  spiral,
  starOutline,
  zigzag,
} from "./pipeShape";
import type { ProductId } from "./product";

export const PATTERN_CHOICES = ["a", "b"] as const;
export type PatternChoice = (typeof PATTERN_CHOICES)[number];

export type PipeSurface = "cupcake" | "cake" | "tier" | "tart" | "biscuit";

export interface PipePathDef {
  readonly id: string;
  readonly name: string;
  readonly surface: PipeSurface;
  readonly points: readonly Point[];
  readonly closed: boolean;
}

export interface PipePatternDef {
  readonly name: string;
  readonly paths: readonly PipePathDef[];
}

const swirl = spiral(0.8, 4, 2.5);
const rosette = ring((theta) => 3 + 0.6 * Math.cos(5 * theta));
const circle = (radius: number) => ring(() => radius);

function cupcakes(name: string, points: readonly Point[], closed: boolean): PipePathDef[] {
  return [1, 2, 3].map((index) => ({
    id: `${name}-${index}`,
    name: `Cupcake ${index}`,
    surface: "cupcake",
    points,
    closed,
  }));
}

export const PIPE_PATTERNS: Readonly<Record<ProductId, Readonly<Record<PatternChoice, PipePatternDef>>>> = {
  "cupcake-tray": {
    a: { name: "Three swirls", paths: cupcakes("swirl", swirl, false) },
    b: { name: "Three rosettes", paths: cupcakes("rosette", rosette, true) },
  },
  "layer-cake": {
    a: {
      name: "Scallops and beads",
      paths: [
        {
          id: "top-scallop",
          name: "Top scallop ring",
          surface: "cake",
          points: ring((theta) => 8.6 + 0.8 * Math.abs(Math.sin(5 * theta))),
          closed: true,
        },
        {
          id: "base-beads",
          name: "Base bead border",
          surface: "cake",
          points: ring((theta) => 11 + 0.35 * Math.sin(24 * theta), 144),
          closed: true,
        },
      ],
    },
    b: {
      name: "Rope and dots",
      paths: [
        {
          id: "top-rope",
          name: "Top rope ring",
          surface: "cake",
          points: ring((theta) => 9 + 0.4 * Math.sin(14 * theta), 120),
          closed: true,
        },
        {
          id: "base-dots",
          name: "Base dot border",
          surface: "cake",
          points: ring((theta) => 11 + 0.5 * Math.cos(18 * theta), 144),
          closed: true,
        },
      ],
    },
  },
  "two-tier-cake": {
    a: {
      name: "Scallops and swag",
      paths: [
        {
          id: "lower-scallop",
          name: "Lower tier scallops",
          surface: "tier",
          points: ring((theta) => 10.6 + 0.7 * Math.abs(Math.sin(6 * theta))),
          closed: true,
        },
        {
          id: "upper-scallop",
          name: "Upper tier scallops",
          surface: "tier",
          points: ring((theta) => 5.6 + 0.6 * Math.abs(Math.sin(4 * theta))),
          closed: true,
        },
        {
          id: "swag-garland",
          name: "Swag garland",
          surface: "tier",
          points: arcWave(8.4, 0.9, 5, Math.PI * 0.2, Math.PI * 1.8),
          closed: false,
        },
      ],
    },
    b: {
      name: "Beads and loops",
      paths: [
        {
          id: "lower-beads",
          name: "Lower tier beads",
          surface: "tier",
          points: ring((theta) => 11 + 0.35 * Math.sin(24 * theta), 144),
          closed: true,
        },
        {
          id: "upper-beads",
          name: "Upper tier beads",
          surface: "tier",
          points: ring((theta) => 6 + 0.3 * Math.sin(14 * theta), 96),
          closed: true,
        },
        {
          id: "drop-loops",
          name: "Drop-loop garland",
          surface: "tier",
          points: arcLoops(7.8, 1.4, 6, Math.PI * 0.2, Math.PI * 1.8),
          closed: false,
        },
      ],
    },
  },
  "fruit-tart": {
    a: {
      name: "Rosettes and zigzag",
      paths: [
        {
          id: "rosette-ring",
          name: "Rosette ring",
          surface: "tart",
          points: ring((theta) => 9.5 + 0.5 * Math.cos(16 * theta), 128),
          closed: true,
        },
        {
          id: "glaze-zigzag",
          name: "Glaze zigzag",
          surface: "tart",
          points: zigzag(6, 18, 9, 15, 3),
          closed: false,
        },
      ],
    },
    b: {
      name: "Shells and wave",
      paths: [
        {
          id: "shell-ring",
          name: "Shell ring",
          surface: "tart",
          points: ring((theta) => 9.4 + 0.6 * Math.abs(Math.sin(10 * theta)), 120),
          closed: true,
        },
        {
          id: "glaze-wave",
          name: "Glaze wave",
          surface: "tart",
          points: sineLine(5.5, 18.5, 2.6, 2),
          closed: false,
        },
      ],
    },
  },
  "iced-biscuits": {
    a: {
      name: "Star, heart, flower, round",
      paths: [
        { id: "star", name: "Star", surface: "biscuit", points: starOutline(5, 7.4, 3.6), closed: true },
        { id: "heart", name: "Heart", surface: "biscuit", points: heartOutline(6.6), closed: true },
        {
          id: "flower",
          name: "Flower",
          surface: "biscuit",
          points: ring((theta) => 5.6 + 1.4 * Math.cos(5 * theta)),
          closed: true,
        },
        { id: "round", name: "Round", surface: "biscuit", points: circle(6), closed: true },
      ],
    },
    b: {
      name: "Moon, leaf, ball, round",
      paths: [
        { id: "moon", name: "Moon", surface: "biscuit", points: crescentOutline(7, 2.4), closed: true },
        { id: "leaf", name: "Leaf", surface: "biscuit", points: leafOutline(14, 4.4), closed: true },
        { id: "ball", name: "Ball", surface: "biscuit", points: circle(7), closed: true },
        { id: "round", name: "Round", surface: "biscuit", points: circle(5.6), closed: true },
      ],
    },
  },
};
