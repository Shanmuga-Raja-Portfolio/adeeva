import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { seasonTheme, type LabelSeason } from "./labelSeason";

export function seasonMinQuality(state: GameState, season: LabelSeason): number {
  return seasonTheme(season).minQuality + difficultyById(state.profile.difficulty).minQualityBonus;
}
