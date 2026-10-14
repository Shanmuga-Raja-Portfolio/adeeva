export const DECOR_IDS = ["pegboard-tools", "door-paint", "bench-lamp"] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export interface DecorDef {
  readonly id: DecorId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly takesPaint: boolean;
}

export const DECORS: readonly DecorDef[] = [
  {
    id: "pegboard-tools",
    name: "Tool Outlines",
    description: "Painted outlines so every tool has a home.",
    price: 40,
    takesPaint: false,
  },
  {
    id: "door-paint",
    name: "Painted Garage Door",
    description: "Your favourite colour on the big door.",
    price: 80,
    takesPaint: true,
  },
  {
    id: "bench-lamp",
    name: "Bench Lamp",
    description: "A warm lamp that hangs over the workbench.",
    price: 120,
    takesPaint: false,
  },
];
