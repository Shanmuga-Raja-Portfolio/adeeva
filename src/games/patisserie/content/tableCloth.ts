export const TABLE_CLOTH_IDS = ["linen", "gingham", "velvet"] as const;
export type TableClothId = (typeof TABLE_CLOTH_IDS)[number];

export interface TableClothDef {
  readonly id: TableClothId;
  readonly name: string;
  readonly mood: string;
  readonly colour: string;
}

export const TABLE_CLOTHS: readonly TableClothDef[] = [
  { id: "linen", name: "Linen", mood: "soft", colour: "#efe6d2" },
  { id: "gingham", name: "Gingham", mood: "sunny", colour: "#e46a6a" },
  { id: "velvet", name: "Velvet", mood: "rich", colour: "#5b2a5e" },
];
