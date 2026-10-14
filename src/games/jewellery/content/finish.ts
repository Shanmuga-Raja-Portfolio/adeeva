import type { JewelTag } from "./jewelTag";

export const FINISH_IDS = ["high-shine", "satin", "antique", "glaze"] as const;
export type FinishId = (typeof FINISH_IDS)[number];

export interface FinishDef {
  readonly id: FinishId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly JewelTag[];
  readonly look: string;
}

export const FINISHES: readonly FinishDef[] = [
  { id: "high-shine", name: "High Shine", price: 0, tags: ["sparkly"], look: "Bright and glinting" },
  { id: "satin", name: "Soft Satin", price: 2, tags: ["elegant"], look: "Soft and smooth" },
  { id: "antique", name: "Shadowed", price: 3, tags: ["classic"], look: "Dark lines show the shape" },
  { id: "glaze", name: "Colour Glaze", price: 4, tags: ["playful"], look: "A splash of colour" },
];
