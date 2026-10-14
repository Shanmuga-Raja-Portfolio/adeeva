import type { AvatarLook } from "../../../engine/avatar";

export const SWAP_TABLE_KINDS = ["stitch", "stain", "seam"] as const;
export type SwapTableKind = (typeof SWAP_TABLE_KINDS)[number];

export interface SwapNeighbourDef {
  readonly name: string;
  readonly look: AvatarLook;
}

export const SWAP_NEIGHBOURS: readonly SwapNeighbourDef[] = [
  {
    name: "Hattie",
    look: { skinTone: "peach", hairStyle: "high-bun", hairColour: "auburn", outfit: "cardigan" },
  },
  {
    name: "Mr. Osei",
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "black", outfit: "blazer" },
  },
  {
    name: "Wren",
    look: { skinTone: "sand", hairStyle: "ponytail", hairColour: "blonde", outfit: "dungarees" },
  },
  {
    name: "Auntie Lin",
    look: { skinTone: "honey", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "cardigan" },
  },
  {
    name: "Benji",
    look: { skinTone: "cocoa", hairStyle: "curly-puff", hairColour: "black", outfit: "denim-jacket" },
  },
  {
    name: "Priya",
    look: { skinTone: "amber", hairStyle: "braids", hairColour: "black", outfit: "studio-apron" },
  },
  {
    name: "Mrs. Kowal",
    look: { skinTone: "porcelain", hairStyle: "high-bun", hairColour: "platinum", outfit: "blazer" },
  },
  {
    name: "Sami",
    look: { skinTone: "chestnut", hairStyle: "locs", hairColour: "dark-brown", outfit: "denim-jacket" },
  },
];

export const SWAP_REQUESTS: Readonly<Record<SwapTableKind, string>> = {
  stitch: "Could you snip open a puckered seam on my [item]?",
  stain: "Could you lift a jam spot from my [item]?",
  seam: "Could you sew up a little split in my [item]?",
};
