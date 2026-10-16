export const DECOR_IDS = [
  "pegboard-tools",
  "door-paint",
  "bench-lamp",
  "shop-sign",
  "window-ferns",
  "rocking-horse",
] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export interface DecorDef {
  readonly id: DecorId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly takesPaint: boolean;
  readonly showroomOnly: boolean;
}

export const DECORS: readonly DecorDef[] = [
  {
    id: "pegboard-tools",
    name: "Tool Outlines",
    description: "Painted outlines so every tool has a home.",
    price: 40,
    takesPaint: false,
    showroomOnly: false,
  },
  {
    id: "door-paint",
    name: "Painted Garage Door",
    description: "Your favourite colour on the big door.",
    price: 80,
    takesPaint: true,
    showroomOnly: false,
  },
  {
    id: "bench-lamp",
    name: "Bench Lamp",
    description: "A warm lamp that hangs over the workbench.",
    price: 120,
    takesPaint: false,
    showroomOnly: false,
  },
  {
    id: "shop-sign",
    name: "Painted Shop Sign",
    description: "Your showroom's name in a colour you love.",
    price: 60,
    takesPaint: true,
    showroomOnly: true,
  },
  {
    id: "window-ferns",
    name: "Window Ferns",
    description: "Green ferns hanging in the shop window.",
    price: 50,
    takesPaint: false,
    showroomOnly: true,
  },
  {
    id: "rocking-horse",
    name: "Rocking Horse",
    description: "Bram's old rocking horse, polished up for show. Just for looking at.",
    price: 120,
    takesPaint: false,
    showroomOnly: true,
  },
];
