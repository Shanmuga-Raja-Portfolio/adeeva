import type { ProductId } from "./product";

export const MENU_TIER_IDS = ["top", "middle", "bottom"] as const;
export type MenuTierId = (typeof MENU_TIER_IDS)[number];

export interface MenuTierDef {
  readonly id: MenuTierId;
  readonly name: string;
  readonly products: readonly ProductId[];
}

export const MENU_TIERS: readonly MenuTierDef[] = [
  { id: "top", name: "Top tier", products: ["petit-fours", "cupcake-tray"] },
  { id: "middle", name: "Middle tier", products: ["tartlet-set", "spiral-roll"] },
  { id: "bottom", name: "Bottom tier", products: ["iced-biscuits"] },
];

export const MENU_ITEM_NAMES: Readonly<Partial<Record<ProductId, string>>> = {
  "petit-fours": "Petits fours",
  "cupcake-tray": "Cupcakes",
  "tartlet-set": "Tartlets",
  "spiral-roll": "Roll slices",
  "iced-biscuits": "Biscuits",
};
