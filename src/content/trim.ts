import type { StyleTag } from "./styleTag";

export const TRIM_IDS = [
  "button",
  "bow",
  "lace",
  "flower-applique",
  "sequin-patch",
  "ribbon-belt",
  "pearl",
  "star-applique",
] as const;
export type TrimId = (typeof TRIM_IDS)[number];

export interface TrimDef {
  id: TrimId;
  name: string;
  price: number;
  tags: readonly StyleTag[];
}

export const TRIMS: readonly TrimDef[] = [
  { id: "button", name: "Covered Button", price: 1, tags: ["classic"] },
  { id: "bow", name: "Satin Bow", price: 3, tags: ["playful", "romantic"] },
  { id: "lace", name: "Lace Trim", price: 4, tags: ["romantic", "elegant"] },
  { id: "flower-applique", name: "Flower Appliqué", price: 3, tags: ["romantic", "dreamy"] },
  { id: "sequin-patch", name: "Sequin Patch", price: 4, tags: ["bold", "edgy"] },
  { id: "ribbon-belt", name: "Ribbon Belt", price: 5, tags: ["elegant", "classic"] },
  { id: "pearl", name: "Pearl Bead", price: 2, tags: ["regal", "elegant"] },
  { id: "star-applique", name: "Star Appliqué", price: 3, tags: ["playful", "bold"] },
];
