import type { AvatarLook } from "../../../engine/avatar";

export const FAIR_PANEL_IDS = ["bench", "garden", "visitors"] as const;
export type FairPanelId = (typeof FAIR_PANEL_IDS)[number];

export interface PanelMemberDef {
  readonly name: string;
  readonly role: string;
  readonly look: AvatarLook;
}

export interface FairPanelDef {
  readonly id: FairPanelId;
  readonly name: string;
  readonly blurb: string;
  readonly members: readonly PanelMemberDef[];
}

export const OTTI: PanelMemberDef = {
  name: "Otti",
  role: "Retired baker of Crumb & Comet",
  look: { skinTone: "chestnut", hairStyle: "short-bob", hairColour: "platinum", outfit: "studio-apron" },
};

export const MARIGOLD: PanelMemberDef = {
  name: "Marigold Asante",
  role: "Fair organiser",
  look: { skinTone: "cocoa", hairStyle: "locs", hairColour: "rose-gold", outfit: "cardigan" },
};

export const FAIR_PANELS: readonly FairPanelDef[] = [
  {
    id: "bench",
    name: "Bakers' Bench",
    blurb: "Craft, company, flair and sensible cost",
    members: [
      OTTI,
      {
        name: "Ruth Fenwick",
        role: "Village bread baker",
        look: { skinTone: "porcelain", hairStyle: "ponytail", hairColour: "auburn", outfit: "studio-apron" },
      },
      {
        name: "Mr. Hollis",
        role: "Retired pastry teacher",
        look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "brown", outfit: "blazer" },
      },
    ],
  },
  {
    id: "garden",
    name: "Garden Club",
    blurb: "Theme, palette and harmony",
    members: [
      MARIGOLD,
      {
        name: "Mr. Pell",
        role: "Glasshouse keeper",
        look: { skinTone: "amber", hairStyle: "pixie", hairColour: "black", outfit: "dungarees" },
      },
    ],
  },
  {
    id: "visitors",
    name: "Visitors' Table",
    blurb: "Wonder, setting and the big unveil",
    members: [],
  },
];

export const FAIR_SPEAKERS: readonly PanelMemberDef[] = FAIR_PANELS.flatMap((panel) => panel.members);
