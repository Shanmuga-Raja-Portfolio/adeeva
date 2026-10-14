export const PATH_IDS = ["restaurant", "truck", "tv"] as const;
export type PathId = (typeof PATH_IDS)[number];

export interface PathDef {
  readonly id: PathId;
  readonly name: string;
  readonly venue: string;
  readonly door: string;
  readonly goal: string;
  readonly startCost: number;
  readonly startKit: string;
  readonly rent: number;
  readonly home: string;
  readonly tour: string;
  readonly accent: string;
}

export const PATHS: readonly PathDef[] = [
  {
    id: "restaurant",
    name: "Your own restaurant",
    venue: "Quayside Lane",
    door: "A table of your own",
    goal: "Earn your three restaurant awards.",
    startCost: 900,
    startKit: "the keys, tables and a first Market Run",
    rent: 300,
    home: "the restaurant on Quayside Lane",
    tour: "Your own dining room, chef. You write the menu, set the prices and plan the team's week.",
    accent: "#d9472b",
  },
  {
    id: "truck",
    name: "Food truck",
    venue: "Clementine",
    door: "A truck and the open road",
    goal: "Serve at all eight festivals and win Festival Favourite at three.",
    startCost: 600,
    startKit: "Clementine, a secondhand truck",
    rent: 60,
    home: "Clementine's parking spot",
    tour: "Clementine and the festival map. Three dishes, one fridge and every party in town.",
    accent: "#f2a93b",
  },
  {
    id: "tv",
    name: "TV & cookbook",
    venue: "Spoon & Story",
    door: "A studio kitchen and a book",
    goal: "Finish a four-chapter cookbook and launch it at the library.",
    startCost: 200,
    startKit: "a studio kitchen kit",
    rent: 150,
    home: "a flat by the radio station",
    tour: "A studio kitchen and a book desk. Teach Larkspur to cook, one kind tip at a time.",
    accent: "#4f8a3c",
  },
];
