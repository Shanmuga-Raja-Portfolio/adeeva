export const JAR_IDS = [
  "lemon-squeeze",
  "lime-squeeze",
  "chilli-flakes",
  "black-pepper",
  "butter-knob",
  "parmesan-grate",
  "garam-masala-pinch",
  "ginger-paste",
  "soy-dash",
  "rice-vinegar",
  "scotch-bonnet-pinch",
  "palm-oil-drizzle",
  "crema-spoon",
  "fresh-herbs",
  "savoury-pinch",
] as const;
export type JarId = (typeof JAR_IDS)[number];

export type TastePoint = readonly [number, number];

export interface JarDef {
  readonly id: JarId;
  readonly name: string;
  readonly vector: TastePoint;
  readonly savoury: number;
  readonly colour: string;
}

export const SAVOURY_JAR: JarId = "savoury-pinch";

export const JARS: readonly JarDef[] = [
  { id: "lemon-squeeze", name: "Lemon squeeze", vector: [2, 0], savoury: 0, colour: "#f3d23f" },
  { id: "lime-squeeze", name: "Lime squeeze", vector: [2, -1], savoury: 0, colour: "#8cc63f" },
  { id: "chilli-flakes", name: "Chilli flakes", vector: [0, 2], savoury: 0, colour: "#d9472b" },
  { id: "black-pepper", name: "Black pepper", vector: [0, 1], savoury: 0, colour: "#4a4040" },
  { id: "butter-knob", name: "Knob of butter", vector: [-2, -1], savoury: 0, colour: "#f6dd7a" },
  { id: "parmesan-grate", name: "Grated parmesan", vector: [-1, 0], savoury: 1, colour: "#f2dc9a" },
  { id: "garam-masala-pinch", name: "Garam masala", vector: [-1, 2], savoury: 0, colour: "#8a5a34" },
  { id: "ginger-paste", name: "Ginger", vector: [1, 1], savoury: 0, colour: "#d8ad6a" },
  { id: "soy-dash", name: "Soy sauce", vector: [-1, 0], savoury: 1, colour: "#4a2a1a" },
  { id: "rice-vinegar", name: "Rice vinegar", vector: [2, -1], savoury: 0, colour: "#e9e2c8" },
  { id: "scotch-bonnet-pinch", name: "Scotch bonnet", vector: [0, 2], savoury: 1, colour: "#f08a1e" },
  { id: "palm-oil-drizzle", name: "Red palm oil", vector: [-2, 0], savoury: 0, colour: "#d8452a" },
  { id: "crema-spoon", name: "Crema", vector: [-1, -2], savoury: 0, colour: "#fbf6ea" },
  { id: "fresh-herbs", name: "Fresh herbs", vector: [1, -1], savoury: 0, colour: "#4f8a3c" },
  { id: "savoury-pinch", name: "Savoury pinch", vector: [0, 0], savoury: 1, colour: "#b98a5a" },
];
