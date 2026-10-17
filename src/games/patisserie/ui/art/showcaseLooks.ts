import type { BakeLook } from "./bakeLook";

export const SHOWCASE_LOOKS: readonly BakeLook[] = [
  {
    productId: "two-tier-cake",
    mixColours: ["#7a4a35", "#f3d996"],
    fillingColour: "#c2304f",
    icing: ["#f6dfe4", "#c9a227", "#fffaf0"],
    pattern: "a",
    toppings: [
      { id: "star-1", toppingId: "gold-star", x: 172, y: 150, rotation: 0, scale: 1, layer: 1 },
      { id: "star-2", toppingId: "gold-star", x: 228, y: 146, rotation: 15, scale: 0.9, layer: 2 },
      { id: "star-3", toppingId: "gold-star", x: 200, y: 132, rotation: 345, scale: 1.2, layer: 3 },
    ],
    iced: true,
  },
  {
    productId: "cupcake-tray",
    mixColours: ["#f6df7c"],
    fillingColour: null,
    icing: ["#9fd0ee", "#f2c4c9", "#b9a7dc"],
    pattern: "a",
    toppings: [
      { id: "butterfly", toppingId: "wafer-butterfly", x: 200, y: 168, rotation: 0, scale: 1, layer: 1 },
      { id: "sprinkles", toppingId: "sprinkles", x: 112, y: 236, rotation: 0, scale: 1, layer: 2 },
    ],
    iced: true,
  },
];
