export const FAIR_MUSIC_IDS = ["string-trio", "brass-band", "music-box", "garden-birdsong"] as const;
export type FairMusicId = (typeof FAIR_MUSIC_IDS)[number];

export interface FairMusicDef {
  readonly id: FairMusicId;
  readonly name: string;
  readonly mood: string;
}

export const FAIR_MUSIC: readonly FairMusicDef[] = [
  { id: "string-trio", name: "String trio", mood: "graceful" },
  { id: "brass-band", name: "Brass band", mood: "lively" },
  { id: "music-box", name: "Music box", mood: "twinkly" },
  { id: "garden-birdsong", name: "Garden birdsong", mood: "breezy" },
];
