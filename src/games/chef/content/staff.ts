import type { AvatarLook } from "../../../engine/avatar";
import type { StationId } from "./station";

export interface StaffDef {
  readonly id: string;
  readonly name: string;
  readonly best: StationId | null;
  readonly bestSkill: number;
  readonly otherSkill: number;
  readonly note: string;
  readonly look: AvatarLook;
}

export const TEO_ID = "teo";

export const STAFF: readonly StaffDef[] = [
  {
    id: "teo",
    name: "Teo Akande",
    best: null,
    bestSkill: 0.75,
    otherSkill: 0.75,
    note: "Cheerful on every station.",
    look: { skinTone: "chestnut", hairStyle: "curly-puff", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "tavi",
    name: "Tavi Moana",
    best: "board",
    bestSkill: 0.8,
    otherSkill: 0.7,
    note: "Quick and steady on the Board.",
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "lin",
    name: "Lin Zhao",
    best: "hob",
    bestSkill: 0.8,
    otherSkill: 0.7,
    note: "Knows every pan by its sound.",
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "yaw",
    name: "Yaw Darko",
    best: "pot",
    bestSkill: 0.8,
    otherSkill: 0.7,
    note: "Calm by the big pots.",
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "esme",
    name: "Esme Hart",
    best: "pass",
    bestSkill: 0.8,
    otherSkill: 0.7,
    note: "Same as always, chef. Clean rims.",
    look: { skinTone: "porcelain", hairStyle: "ponytail", hairColour: "auburn", outfit: "studio-apron" },
  },
  {
    id: "nilufar",
    name: "Nilufar Rahimi",
    best: null,
    bestSkill: 0.75,
    otherSkill: 0.75,
    note: "A reliable all-rounder.",
    look: { skinTone: "honey", hairStyle: "braids", hairColour: "dark-brown", outfit: "studio-apron" },
  },
  {
    id: "sol",
    name: "Sol Ortega",
    best: null,
    bestSkill: 0.65,
    otherSkill: 0.65,
    note: "An apprentice, learning fast.",
    look: { skinTone: "peach", hairStyle: "locs", hairColour: "brown", outfit: "studio-apron" },
  },
];
