export const ROSETTE_IDS = ["makers-ribbon", "merit", "silver", "gold", "oak-leaf"] as const;
export type RosetteId = (typeof ROSETTE_IDS)[number];

export interface RosetteDef {
  readonly id: RosetteId;
  readonly name: string;
  readonly from: number;
  readonly colour: string;
  readonly line: string;
}

export const ROSETTES: readonly RosetteDef[] = [
  {
    id: "makers-ribbon",
    name: "Maker's Ribbon",
    from: 0,
    colour: "#7fb3d5",
    line: "The green clapped for every piece!",
  },
  { id: "merit", name: "Ribbon of Merit", from: 55, colour: "#d0587e", line: "A warm round of applause." },
  { id: "silver", name: "Silver Rosette", from: 70, colour: "#c9ced6", line: "The green was delighted." },
  { id: "gold", name: "Gold Rosette", from: 85, colour: "#f2c230", line: "Cheers rang across the green!" },
  {
    id: "oak-leaf",
    name: "Oak Leaf Rosette",
    from: 95,
    colour: "#3f6b4f",
    line: "The whole village is talking about it.",
  },
];
