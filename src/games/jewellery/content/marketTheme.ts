import type { JewelColour } from "./jewelColour";
import type { JewelTag } from "./jewelTag";

export const THEME_IDS = ["spring-fair", "lantern-night", "harbour-day"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export interface MarketThemeDef {
  readonly id: ThemeId;
  readonly name: string;
  readonly tags: readonly JewelTag[];
  readonly palette: readonly JewelColour[];
  readonly blurb: string;
}

export const MARKET_THEMES: readonly MarketThemeDef[] = [
  {
    id: "spring-fair",
    name: "Spring Fair",
    tags: ["nature", "playful"],
    palette: ["sage", "coral", "sky", "emerald"],
    blurb: "Blossom stalls and kites. Shoppers want fresh, happy pieces.",
  },
  {
    id: "lantern-night",
    name: "Lantern Night",
    tags: ["dreamy", "sparkly"],
    palette: ["navy", "lavender", "gold", "ivory"],
    blurb: "Paper lanterns everywhere. Shoppers want twinkly, dreamy pieces.",
  },
  {
    id: "harbour-day",
    name: "Harbour Day",
    tags: ["classic", "bold"],
    palette: ["navy", "teal", "silver", "charcoal"],
    blurb: "Boats in the bay. Shoppers want strong, classic pieces.",
  },
];
