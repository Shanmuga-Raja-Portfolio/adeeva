export const STATIONS = ["board", "hob", "pot", "spice", "pass"] as const;
export type StationId = (typeof STATIONS)[number];

export interface StationDef {
  readonly id: StationId;
  readonly name: string;
  readonly game: string;
}

export const STATION_DEFS: readonly StationDef[] = [
  { id: "board", name: "Board", game: "Chop" },
  { id: "hob", name: "Hob", game: "Sizzle" },
  { id: "pot", name: "Pot", game: "Simmer" },
  { id: "spice", name: "Spice", game: "Taste" },
  { id: "pass", name: "Pass", game: "Plate" },
];
