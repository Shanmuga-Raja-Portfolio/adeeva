import type { Point } from "../../../engine/geometry/point";
import {
  arcLoops,
  arcWave,
  bowOutline,
  crescentOutline,
  heartOutline,
  leafOutline,
  ring,
  roundedSquare,
  sineLine,
  spiral,
  starOutline,
  zigzag,
} from "./pipeShape";
import type { ProductId } from "./product";

export const PATTERN_CHOICES = ["a", "b"] as const;
export type PatternChoice = (typeof PATTERN_CHOICES)[number];

export type PipeSurface =
  | "cupcake"
  | "cake"
  | "tier"
  | "grand"
  | "tart"
  | "biscuit"
  | "petit"
  | "tartlet"
  | "roll"
  | "wreath"
  | "plaque";

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

function threeOf(
  name: string,
  label: string,
  surface: PipeSurface,
  points: readonly Point[],
  closed: boolean,
): PipePathDef[] {
  return [1, 2, 3].map((index) => ({
    id: `${name}-${index}`,
    name: `${label} ${index}`,
    surface,
    points,
    closed,
  }));
}

function cupcakes(name: string, points: readonly Point[], closed: boolean): PipePathDef[] {
  return threeOf(name, "Cupcake", "cupcake", points, closed);
}

const STAR: PipePathDef = {
  id: "star",
  name: "Star",
  surface: "biscuit",
  points: starOutline(5, 7.4, 3.6),
  closed: true,
};
const HEART: PipePathDef = {
  id: "heart",
  name: "Heart",
  surface: "biscuit",
  points: heartOutline(6.6),
  closed: true,
};
const FLOWER: PipePathDef = {
  id: "flower",
  name: "Flower",
  surface: "biscuit",
  points: ring((theta) => 5.6 + 1.4 * Math.cos(5 * theta)),
  closed: true,
};
const MOON: PipePathDef = {
  id: "moon",
  name: "Moon",
  surface: "biscuit",
  points: crescentOutline(7, 2.4),
  closed: true,
};
const LEAF: PipePathDef = {
  id: "leaf",
  name: "Leaf",
  surface: "biscuit",
  points: leafOutline(14, 4.4),
  closed: true,
};

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
        STAR,
        HEART,
        FLOWER,
        { id: "round", name: "Round", surface: "biscuit", points: circle(6), closed: true },
      ],
    },
    b: {
      name: "Moon, leaf, ball, round",
      paths: [
        MOON,
        LEAF,
        { id: "ball", name: "Ball", surface: "biscuit", points: circle(7), closed: true },
        { id: "round", name: "Round", surface: "biscuit", points: circle(5.6), closed: true },
      ],
    },
  },
  "petit-fours": {
    a: {
      name: "Dot crowns",
      paths: threeOf("crown", "Petit four", "petit", roundedSquare(4.2, 0.5, 6), true),
    },
    b: {
      name: "Lattice ticks",
      paths: threeOf("lattice", "Petit four", "petit", zigzag(7.5, 16.5, 9, 15, 3), false),
    },
  },
  "tartlet-set": {
    a: {
      name: "Rosette dots",
      paths: threeOf(
        "rosette-dots",
        "Tartlet",
        "tartlet",
        ring((theta) => 5 + 0.55 * Math.cos(10 * theta), 120),
        true,
      ),
    },
    b: {
      name: "Glaze swirls",
      paths: threeOf("glaze-swirl", "Tartlet", "tartlet", spiral(0.8, 4.6, 2), false),
    },
  },
  "spiral-roll": {
    a: {
      name: "Top zigzag",
      paths: [
        {
          id: "roll-zigzag",
          name: "Top zigzag",
          surface: "roll",
          points: zigzag(3.5, 20.5, 10, 14, 6),
          closed: false,
        },
      ],
    },
    b: {
      name: "Pearl line",
      paths: [
        {
          id: "roll-pearls",
          name: "Pearl line",
          surface: "roll",
          points: sineLine(3.5, 20.5, 1.2, 4),
          closed: false,
        },
      ],
    },
  },
  "biscuit-wreath": {
    a: {
      name: "Outlines and a bow",
      paths: [
        STAR,
        HEART,
        FLOWER,
        { id: "round", name: "Round", surface: "biscuit", points: circle(6), closed: true },
        { id: "bow", name: "Ribbon bow", surface: "wreath", points: bowOutline(15, 8), closed: true },
      ],
    },
    b: {
      name: "Outlines and a leaf trail",
      paths: [
        MOON,
        LEAF,
        { id: "ball", name: "Ball", surface: "biscuit", points: circle(7), closed: true },
        { id: "round", name: "Round", surface: "biscuit", points: circle(5.6), closed: true },
        {
          id: "leaf-trail",
          name: "Leaf trail",
          surface: "wreath",
          points: arcWave(8.6, 0.9, 6, Math.PI * 0.15, Math.PI * 1.85),
          closed: false,
        },
      ],
    },
  },
  "three-tier-cake": {
    a: {
      name: "Three scallops and a swag",
      paths: [
        {
          id: "big-scallop",
          name: "Big tier scallops",
          surface: "grand",
          points: ring((theta) => 10.8 + 0.6 * Math.abs(Math.sin(7 * theta)), 120),
          closed: true,
        },
        {
          id: "middle-scallop",
          name: "Middle tier scallops",
          surface: "grand",
          points: ring((theta) => 7.4 + 0.6 * Math.abs(Math.sin(5 * theta))),
          closed: true,
        },
        {
          id: "small-scallop",
          name: "Small tier scallops",
          surface: "grand",
          points: ring((theta) => 4 + 0.5 * Math.abs(Math.sin(4 * theta))),
          closed: true,
        },
        {
          id: "grand-swag",
          name: "Swag garland",
          surface: "grand",
          points: arcWave(9.2, 0.8, 5, Math.PI * 0.2, Math.PI * 1.8),
          closed: false,
        },
      ],
    },
    b: {
      name: "Three bead borders and loops",
      paths: [
        {
          id: "big-beads",
          name: "Big tier beads",
          surface: "grand",
          points: ring((theta) => 11 + 0.35 * Math.sin(24 * theta), 144),
          closed: true,
        },
        {
          id: "middle-beads",
          name: "Middle tier beads",
          surface: "grand",
          points: ring((theta) => 7.6 + 0.3 * Math.sin(18 * theta), 120),
          closed: true,
        },
        {
          id: "small-beads",
          name: "Small tier beads",
          surface: "grand",
          points: ring((theta) => 4.2 + 0.25 * Math.sin(12 * theta)),
          closed: true,
        },
        {
          id: "grand-loops",
          name: "Drop-loop garland",
          surface: "grand",
          points: arcLoops(8.6, 1.2, 6, Math.PI * 0.2, Math.PI * 1.8),
          closed: false,
        },
      ],
    },
  },
};
