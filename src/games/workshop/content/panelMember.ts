import type { AvatarLook } from "../../../engine/avatar";

export const FAIR_PANEL_IDS = ["craft", "comfort", "harmony", "story"] as const;
export type FairPanelId = (typeof FAIR_PANEL_IDS)[number];

export interface PanelMemberDef {
  readonly name: string;
  readonly look: AvatarLook;
}

export interface FairPanelDef {
  readonly id: FairPanelId;
  readonly name: string;
  readonly blurb: string;
  readonly members: readonly PanelMemberDef[];
}

export const BRAM_LOOK: AvatarLook = {
  skinTone: "chestnut",
  hairStyle: "short-bob",
  hairColour: "platinum",
  outfit: "denim-jacket",
};

export const HATTIE_LOOK: AvatarLook = {
  skinTone: "sand",
  hairStyle: "braids",
  hairColour: "auburn",
  outfit: "dungarees",
};

export const PELL_LOOK: AvatarLook = {
  skinTone: "porcelain",
  hairStyle: "pixie",
  hairColour: "brown",
  outfit: "studio-apron",
};

export const ESI_LOOK: AvatarLook = {
  skinTone: "chestnut",
  hairStyle: "braids",
  hairColour: "platinum",
  outfit: "cardigan",
};

export const FAIR_PANELS: readonly FairPanelDef[] = [
  {
    id: "craft",
    name: "Craft Bench",
    blurb: "How well it is made",
    members: [
      { name: "Uncle Bram", look: BRAM_LOOK },
      { name: "Mr. Pell", look: PELL_LOOK },
      { name: "Hattie Rowe", look: HATTIE_LOOK },
    ],
  },
  {
    id: "comfort",
    name: "Comfort Corner",
    blurb: "Smooth, inviting and solid",
    members: [
      {
        name: "Rosalind",
        look: { skinTone: "peach", hairStyle: "long-waves", hairColour: "auburn", outfit: "cardigan" },
      },
      { name: "Grandma Esi", look: ESI_LOOK },
    ],
  },
  {
    id: "harmony",
    name: "Harmony Table",
    blurb: "How well the pieces match",
    members: [
      {
        name: "Luna",
        look: { skinTone: "honey", hairStyle: "locs", hairColour: "lilac", outfit: "dungarees" },
      },
      {
        name: "Ms. Ingrid",
        look: { skinTone: "porcelain", hairStyle: "high-bun", hairColour: "blonde", outfit: "blazer" },
      },
    ],
  },
  {
    id: "story",
    name: "Story Wall",
    blurb: "Theme, booth and the big reveal",
    members: [],
  },
];
