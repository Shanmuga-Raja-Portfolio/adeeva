export interface NameCardDef {
  readonly id: string;
  readonly title: string;
  readonly ownName: boolean;
}

export const NAME_CARDS: readonly NameCardDef[] = [
  { id: "own-table", title: "{name}'s Table", ownName: true },
  { id: "own-kitchen", title: "{name}'s Kitchen", ownName: true },
  { id: "warm-lamp", title: "The Warm Lamp", ownName: false },
  { id: "harbour-table", title: "The Harbour Table", ownName: false },
  { id: "lantern-lane", title: "Lantern Kitchen", ownName: false },
  { id: "open-pass", title: "The Open Pass", ownName: false },
  { id: "long-table", title: "The Long Table", ownName: false },
  { id: "six-spoons", title: "Six Spoons", ownName: false },
  { id: "blue-door", title: "The Blue Door", ownName: false },
  { id: "gull-garden", title: "Gull & Garden", ownName: false },
  { id: "little-larkspur", title: "Little Larkspur", ownName: false },
  { id: "tide-and-thyme", title: "Tide & Thyme", ownName: false },
];
