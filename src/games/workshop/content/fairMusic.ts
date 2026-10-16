export const FAIR_MUSIC_IDS = ["fiddle-folk", "acoustic-guitar", "wind-chimes", "brass-band"] as const;
export type FairMusicId = (typeof FAIR_MUSIC_IDS)[number];

export interface FairMusicDef {
  readonly id: FairMusicId;
  readonly name: string;
  readonly mood: string;
}

export const FAIR_MUSIC: readonly FairMusicDef[] = [
  { id: "fiddle-folk", name: "Fiddle folk", mood: "lively" },
  { id: "acoustic-guitar", name: "Acoustic guitar", mood: "warm" },
  { id: "wind-chimes", name: "Wind chimes", mood: "gentle" },
  { id: "brass-band", name: "Brass band", mood: "bright" },
];
