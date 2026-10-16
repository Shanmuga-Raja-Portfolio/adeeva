import type { AvatarLook } from "../../../engine/avatar";

export const CREW_IDS = ["rosa", "tobi", "hana", "marcus"] as const;
export type CrewId = (typeof CREW_IDS)[number];

export const CREW_JOBS = ["paint", "floor", "light"] as const;
export type CrewJob = (typeof CREW_JOBS)[number];

export interface CrewDef {
  readonly id: CrewId;
  readonly name: string;
  readonly speciality: string;
  readonly skill: Readonly<Record<CrewJob, number>>;
  readonly wage: number;
  readonly look: AvatarLook;
  readonly hello: string;
}

export const CREW: readonly CrewDef[] = [
  {
    id: "rosa",
    name: "Rosa Mendes",
    speciality: "Painter",
    skill: { paint: 0.8, floor: 0.64, light: 0.66 },
    wage: 14,
    look: { skinTone: "honey", hairStyle: "curly-puff", hairColour: "dark-brown", outfit: "dungarees" },
    hello: "Point me at a wall. I'll make you proud.",
  },
  {
    id: "tobi",
    name: "Tobi Adeyemi",
    speciality: "Floor layer",
    skill: { paint: 0.64, floor: 0.8, light: 0.66 },
    wage: 14,
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "black", outfit: "studio-apron" },
    hello: "Floors are my favourite puzzle. Leave it with me.",
  },
  {
    id: "hana",
    name: "Hana Kowalska",
    speciality: "Lighting",
    skill: { paint: 0.66, floor: 0.64, light: 0.82 },
    wage: 13,
    look: { skinTone: "porcelain", hairStyle: "ponytail", hairColour: "blonde", outfit: "denim-jacket" },
    hello: "Every room has a sunny spot waiting. I'll find it.",
  },
  {
    id: "marcus",
    name: "Marcus Reid",
    speciality: "All-rounder",
    skill: { paint: 0.72, floor: 0.72, light: 0.72 },
    wage: 12,
    look: { skinTone: "chestnut", hairStyle: "short-bob", hairColour: "brown", outfit: "blazer" },
    hello: "A bit of everything, done with a smile.",
  },
];
