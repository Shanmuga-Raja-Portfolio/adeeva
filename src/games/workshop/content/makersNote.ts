export const MAKERS_NOTE_IDS = ["one-board", "with-ren", "larkspur-homes"] as const;
export type MakersNoteId = (typeof MAKERS_NOTE_IDS)[number];

export interface MakersNoteDef {
  readonly id: MakersNoteId;
  readonly text: string;
}

export const MAKERS_NOTES: readonly MakersNoteDef[] = [
  { id: "one-board", text: "From one board" },
  { id: "with-ren", text: "Made with Ren" },
  { id: "larkspur-homes", text: "For Larkspur homes" },
];
