import type { JarId } from "./seasoning";

export const CUISINE_IDS = ["italian", "indian", "japanese", "mexican", "french", "west-african"] as const;
export type CuisineId = (typeof CUISINE_IDS)[number];

export interface CuisineDef {
  readonly id: CuisineId;
  readonly name: string;
  readonly counter: string;
  readonly mentorId: string;
  readonly jars: readonly [JarId, JarId, JarId, JarId];
  readonly wall: string;
  readonly wallDeep: string;
  readonly accent: string;
}

export const CUISINES: readonly CuisineDef[] = [
  {
    id: "italian",
    name: "Italian",
    counter: "Ferrante's",
    mentorId: "lucia-ferrante",
    jars: ["lemon-squeeze", "chilli-flakes", "parmesan-grate", "fresh-herbs"],
    wall: "#7d9a5a",
    wallDeep: "#566f3a",
    accent: "#d9472b",
  },
  {
    id: "indian",
    name: "Indian",
    counter: "Mehra's",
    mentorId: "arjun-mehra",
    jars: ["lime-squeeze", "garam-masala-pinch", "ginger-paste", "fresh-herbs"],
    wall: "#3d4f9a",
    wallDeep: "#26346e",
    accent: "#f0b21e",
  },
  {
    id: "japanese",
    name: "Japanese",
    counter: "Moriyama's",
    mentorId: "haruka-moriyama",
    jars: ["ginger-paste", "soy-dash", "rice-vinegar", "fresh-herbs"],
    wall: "#e6d6b8",
    wallDeep: "#2e3f6a",
    accent: "#2e3f6a",
  },
  {
    id: "mexican",
    name: "Mexican",
    counter: "Quintero's",
    mentorId: "rafael-quintero",
    jars: ["lime-squeeze", "chilli-flakes", "crema-spoon", "fresh-herbs"],
    wall: "#f1ece0",
    wallDeep: "#2457a6",
    accent: "#2457a6",
  },
  {
    id: "french",
    name: "French",
    counter: "Laurier's",
    mentorId: "bastien-laurier",
    jars: ["lemon-squeeze", "black-pepper", "butter-knob", "fresh-herbs"],
    wall: "#9fb0b8",
    wallDeep: "#5f727c",
    accent: "#2f5f8a",
  },
  {
    id: "west-african",
    name: "West African",
    counter: "Mensah's",
    mentorId: "efua-mensah",
    jars: ["lime-squeeze", "ginger-paste", "scotch-bonnet-pinch", "palm-oil-drizzle"],
    wall: "#d99a3a",
    wallDeep: "#a8661c",
    accent: "#4f8a3c",
  },
];
