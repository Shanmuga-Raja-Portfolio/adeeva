import type { AvatarLook } from "../../../engine/avatar";
import type { StationId } from "./station";

export const STAFF_ROLES = ["cook", "host", "clean"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export interface StaffDef {
  readonly id: string;
  readonly name: string;
  readonly role: StaffRole;
  readonly best: StationId | null;
  readonly bestSkill: number;
  readonly otherSkill: number;
  readonly wage: number;
  readonly note: string;
  readonly look: AvatarLook;
}

export const TEO_ID = "teo";

export const STAFF: readonly StaffDef[] = [
  {
    id: "teo",
    role: "cook",
    name: "Teo Akande",
    best: null,
    bestSkill: 0.75,
    otherSkill: 0.75,
    wage: 0,
    note: "Cheerful on every station.",
    look: { skinTone: "chestnut", hairStyle: "curly-puff", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "tavi",
    role: "cook",
    name: "Tavi Moana",
    best: "board",
    bestSkill: 0.8,
    otherSkill: 0.7,
    wage: 30,
    note: "Quick and steady on the Board. With a Prep Fridge, readies three dishes, not two.",
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "lin",
    role: "cook",
    name: "Lin Zhao",
    best: "hob",
    bestSkill: 0.8,
    otherSkill: 0.7,
    wage: 30,
    note: "Knows every pan by its sound.",
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "yaw",
    role: "cook",
    name: "Yaw Darko",
    best: "pot",
    bestSkill: 0.8,
    otherSkill: 0.7,
    wage: 30,
    note: "Calm by the big pots.",
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "black", outfit: "studio-apron" },
  },
  {
    id: "esme",
    role: "cook",
    name: "Esme Hart",
    best: "pass",
    bestSkill: 0.8,
    otherSkill: 0.7,
    wage: 30,
    note: "Same as always, chef. Clean rims.",
    look: { skinTone: "porcelain", hairStyle: "ponytail", hairColour: "auburn", outfit: "studio-apron" },
  },
  {
    id: "nilufar",
    role: "cook",
    name: "Nilufar Rahimi",
    best: null,
    bestSkill: 0.75,
    otherSkill: 0.75,
    wage: 32,
    note: "A reliable all-rounder.",
    look: { skinTone: "honey", hairStyle: "braids", hairColour: "dark-brown", outfit: "studio-apron" },
  },
  {
    id: "sol",
    role: "cook",
    name: "Sol Ortega",
    best: null,
    bestSkill: 0.65,
    otherSkill: 0.65,
    wage: 18,
    note: "An apprentice, learning fast.",
    look: { skinTone: "peach", hairStyle: "locs", hairColour: "brown", outfit: "studio-apron" },
  },
  {
    id: "bruno",
    name: "Bruno Castell",
    role: "host",
    best: null,
    bestSkill: 0,
    otherSkill: 0,
    wage: 25,
    note: "Front of house. Seats more than twenty guests and welcomes three more.",
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "brown", outfit: "blazer" },
  },
  {
    id: "ada",
    name: "Ada Novak",
    role: "clean",
    best: null,
    bestSkill: 0,
    otherSkill: 0,
    wage: 22,
    note: "Clean Team. Stations reset fast, so every ticket gets a little more time.",
    look: { skinTone: "porcelain", hairStyle: "braids", hairColour: "blonde", outfit: "studio-apron" },
  },
];
