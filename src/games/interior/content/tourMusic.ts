import { MUSIC_MOODS, type MusicMoodId } from "../../../engine/musicMood";

export type TourMusicId = MusicMoodId;

export interface TourMusicDef {
  readonly id: TourMusicId;
  readonly name: string;
  readonly word: string;
}

const WORDS: Readonly<Record<TourMusicId, string>> = {
  "dreamy-strings": "dreamy",
  "beach-pop": "sunny",
  "synth-pulse": "lively",
  "classic-jazz": "mellow",
};

export const TOUR_MUSIC: readonly TourMusicDef[] = MUSIC_MOODS.map((mood) => ({
  id: mood.id,
  name: mood.name,
  word: WORDS[mood.id],
}));

export const TOUR_MUSIC_IDS: readonly TourMusicId[] = TOUR_MUSIC.map((music) => music.id);
