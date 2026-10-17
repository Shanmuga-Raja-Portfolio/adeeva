import type { AvatarLook } from "../../../engine/avatar";
import { MENTOR_LOOK, MENTOR_NAME } from "./mentor";

export const LAUNCH_PANEL_IDS = ["craft", "harmony", "sparkle", "story"] as const;
export type LaunchPanelId = (typeof LAUNCH_PANEL_IDS)[number];

export interface PanelMemberDef {
  readonly name: string;
  readonly look: AvatarLook;
}

export interface LaunchPanelDef {
  readonly id: LaunchPanelId;
  readonly name: string;
  readonly blurb: string;
  readonly members: readonly PanelMemberDef[];
}

export const BEA_LOOK: AvatarLook = {
  skinTone: "cocoa",
  hairStyle: "braids",
  hairColour: "platinum",
  outfit: "cardigan",
};

export const JUNE_LOOK: AvatarLook = {
  skinTone: "sand",
  hairStyle: "ponytail",
  hairColour: "auburn",
  outfit: "dungarees",
};

export const KEMI_NAME = "Auntie Kemi";

export const KEMI_LOOK: AvatarLook = {
  skinTone: "espresso",
  hairStyle: "high-bun",
  hairColour: "ocean-teal",
  outfit: "studio-apron",
};

export const LAUNCH_PANELS: readonly LaunchPanelDef[] = [
  {
    id: "craft",
    name: "Craft Table",
    blurb: "How finely every piece is made",
    members: [
      { name: MENTOR_NAME, look: MENTOR_LOOK },
      { name: "Bea Okafor", look: BEA_LOOK },
      {
        name: "Tomasz Pike",
        look: { skinTone: "porcelain", hairStyle: "short-bob", hairColour: "platinum", outfit: "blazer" },
      },
    ],
  },
  {
    id: "harmony",
    name: "Harmony Circle",
    blurb: "How well the pieces belong together",
    members: [
      {
        name: "Rosa Delgado",
        look: { skinTone: "honey", hairStyle: "curly-puff", hairColour: "dark-brown", outfit: "dungarees" },
      },
      {
        name: "Ottilie Marsh",
        look: { skinTone: "peach", hairStyle: "high-bun", hairColour: "rose-gold", outfit: "blazer" },
      },
    ],
  },
  {
    id: "sparkle",
    name: "Sparkle Lanterns",
    blurb: "Shine, shimmer and light",
    members: [
      { name: "June Hale", look: JUNE_LOOK },
      {
        name: "Felix Amari",
        look: { skinTone: "chestnut", hairStyle: "locs", hairColour: "black", outfit: "denim-jacket" },
      },
    ],
  },
  {
    id: "story",
    name: "Story Corner",
    blurb: "How the line tells the theme's story",
    members: [],
  },
];
