import { colourById } from "../../../../engine/palette";
import type { PieceLook } from "./pieceLook";
import { woodLook } from "./woodLook";

export const SHOWCASE_LOOKS: readonly PieceLook[] = [
  {
    productId: "birdhouse",
    options: { edge: "square-edge", accent: "star-cutout" },
    woodId: "cedar",
    frame: { kind: "wood", look: woodLook("cedar") },
    surface: { kind: "paint", hex: colourById("teal").hex },
    extras: [],
    cushion: null,
    plaque: "",
  },
  {
    productId: "toy-chest",
    options: { edge: "rounded-edge", accent: "no-accent" },
    woodId: "pine",
    frame: { kind: "paint", hex: colourById("coral").hex },
    surface: { kind: "wood", look: woodLook("pine") },
    extras: [
      { id: "show-1", extraId: "name-plaque", x: 200, y: 206, rotation: 0, scale: 1.2, layer: 1, piece: 0 },
      { id: "show-2", extraId: "star-stencil", x: 142, y: 186, rotation: 15, scale: 1, layer: 2, piece: 0 },
      {
        id: "show-3",
        extraId: "star-stencil",
        x: 258,
        y: 228,
        rotation: 330,
        scale: 0.8,
        layer: 3,
        piece: 0,
      },
    ],
    cushion: null,
    plaque: "Milo",
  },
];
