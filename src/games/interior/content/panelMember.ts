import type { AvatarLook } from "../../../engine/avatar";

export const HOME_PANEL_IDS = ["flow", "light", "comfort", "story"] as const;
export type HomePanelId = (typeof HOME_PANEL_IDS)[number];

export interface PanelMember {
  readonly name: string;
  readonly role: string;
  readonly look: AvatarLook;
}

export interface HomePanelDef {
  readonly id: HomePanelId;
  readonly label: string;
  readonly club: string;
  readonly members: readonly [PanelMember, PanelMember];
}

export const HOME_PANELS: readonly HomePanelDef[] = [
  {
    id: "flow",
    label: "Flow",
    club: "The Walking Club",
    members: [
      {
        name: "Mr. Ferdinand Oyelaran",
        role: "retired postman",
        look: { skinTone: "cocoa", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
      },
      {
        name: "Ms. Gwen Abernathy",
        role: "dance teacher",
        look: { skinTone: "peach", hairStyle: "high-bun", hairColour: "auburn", outfit: "dungarees" },
      },
    ],
  },
  {
    id: "light",
    label: "Light",
    club: "The Lamp Room",
    members: [
      {
        name: "Mrs. Inês Carvalho",
        role: "lamp-shop owner",
        look: { skinTone: "sand", hairStyle: "long-waves", hairColour: "dark-brown", outfit: "blazer" },
      },
      {
        name: "Mr. Sol Brightwater",
        role: "star-gazing club",
        look: { skinTone: "amber", hairStyle: "locs", hairColour: "black", outfit: "denim-jacket" },
      },
    ],
  },
  {
    id: "comfort",
    label: "Comfort",
    club: "The Kettle Club",
    members: [
      {
        name: "Grandad Teo Marsh",
        role: "keeps the kettle on",
        look: { skinTone: "porcelain", hairStyle: "pixie", hairColour: "platinum", outfit: "cardigan" },
      },
      {
        name: "Ms. Priya Sood",
        role: "community-centre organiser",
        look: { skinTone: "chestnut", hairStyle: "braids", hairColour: "black", outfit: "studio-apron" },
      },
    ],
  },
  {
    id: "story",
    label: "Story",
    club: "The Story Table",
    members: [
      {
        name: "Ms. Odette Fenwick",
        role: "retired stage-set painter",
        look: { skinTone: "porcelain", hairStyle: "high-bun", hairColour: "platinum", outfit: "dungarees" },
      },
      {
        name: "Mr. Kwame Boateng",
        role: "librarian",
        look: { skinTone: "espresso", hairStyle: "short-bob", hairColour: "black", outfit: "blazer" },
      },
    ],
  },
];
