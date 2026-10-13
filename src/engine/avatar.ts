import { objectOf, oneOf, type Parser } from "./parse";

export const SKIN_TONES = [
  { id: "porcelain", hex: "#f6dcc8" },
  { id: "peach", hex: "#efc3a1" },
  { id: "sand", hex: "#dcaa80" },
  { id: "honey", hex: "#c58c5c" },
  { id: "amber", hex: "#a86b3f" },
  { id: "chestnut", hex: "#8a5230" },
  { id: "cocoa", hex: "#6b3d22" },
  { id: "espresso", hex: "#4a2a17" },
] as const;
export type SkinToneId = (typeof SKIN_TONES)[number]["id"];

export const HAIR_STYLES = [
  "long-waves",
  "high-bun",
  "short-bob",
  "curly-puff",
  "braids",
  "pixie",
  "ponytail",
  "locs",
] as const;
export type HairStyleId = (typeof HAIR_STYLES)[number];

export const HAIR_COLOURS = [
  { id: "black", hex: "#1b1416" },
  { id: "dark-brown", hex: "#3d2516" },
  { id: "brown", hex: "#6a4026" },
  { id: "auburn", hex: "#8c3a1e" },
  { id: "blonde", hex: "#d8b46a" },
  { id: "platinum", hex: "#ece2cf" },
  { id: "pastel-pink", hex: "#f2a7c0" },
  { id: "lilac", hex: "#a991d4" },
  { id: "rose-gold", hex: "#d4917a" },
  { id: "ocean-teal", hex: "#2f8c96" },
] as const;
export type HairColourId = (typeof HAIR_COLOURS)[number]["id"];

export const OUTFIT_STYLES = ["studio-apron", "denim-jacket", "blazer", "cardigan", "dungarees"] as const;
export type OutfitStyleId = (typeof OUTFIT_STYLES)[number];

export const ACCESSORIES = ["star-clip", "round-glasses", "flower-crown"] as const;
export type AccessoryId = (typeof ACCESSORIES)[number];

export interface AvatarLook {
  skinTone: SkinToneId;
  hairStyle: HairStyleId;
  hairColour: HairColourId;
  outfit: OutfitStyleId;
}

export const DEFAULT_LOOK: AvatarLook = {
  skinTone: "honey",
  hairStyle: "long-waves",
  hairColour: "dark-brown",
  outfit: "studio-apron",
};

export const avatarLookParser: Parser<AvatarLook> = objectOf<AvatarLook>({
  skinTone: oneOf(SKIN_TONES.map((tone) => tone.id)),
  hairStyle: oneOf(HAIR_STYLES),
  hairColour: oneOf(HAIR_COLOURS.map((colour) => colour.id)),
  outfit: oneOf(OUTFIT_STYLES),
});

export function isAvatarLook(look: AvatarLook): boolean {
  return (
    SKIN_TONES.some((tone) => tone.id === look.skinTone) &&
    HAIR_STYLES.includes(look.hairStyle) &&
    HAIR_COLOURS.some((colour) => colour.id === look.hairColour) &&
    OUTFIT_STYLES.includes(look.outfit)
  );
}
