import type { AvatarLook } from "../../../engine/avatar";

export interface HallPersonDef {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly look: AvatarLook;
}

export const HALL_PEOPLE: readonly HallPersonDef[] = [
  {
    id: "wen",
    name: "Wen",
    role: "Head teacher, Larkspur Cookery School",
    look: { skinTone: "honey", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
  },
  {
    id: "hollis",
    name: "Hollis",
    role: "Owner of Larkspur Market Hall",
    look: { skinTone: "cocoa", hairStyle: "pixie", hairColour: "platinum", outfit: "blazer" },
  },
  {
    id: "teo",
    name: "Teo",
    role: "Sous helper at the Hall",
    look: { skinTone: "chestnut", hairStyle: "curly-puff", hairColour: "black", outfit: "studio-apron" },
  },
];
