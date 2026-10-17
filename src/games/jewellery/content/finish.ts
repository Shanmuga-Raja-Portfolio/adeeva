import type { JewelTag } from "./jewelTag";

export const FINISH_IDS = [
  "high-shine",
  "satin",
  "antique",
  "glaze",
  "frosted",
  "two-tone",
  "starlit",
] as const;
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
  { id: "frosted", name: "Frosted", price: 3, tags: ["dainty"], look: "Pale and softly matte" },
  { id: "two-tone", name: "Two-Tone", price: 5, tags: ["bold"], look: "A bright gold rim" },
  { id: "starlit", name: "Starlit", price: 4, tags: ["sparkly"], look: "Tiny sparkles all over" },
];
