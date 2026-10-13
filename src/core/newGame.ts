import {
  HAIR_COLOURS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  SKIN_TONES,
  type AvatarLook,
} from "../content/avatarOption";
import { CAREER_IDS, type CareerId } from "../content/career";
import { DIFFICULTY_IDS, type DifficultyId } from "../content/difficulty";
import { TRAIT_IDS, type TraitId } from "../content/trait";
import { TRIM_IDS, type TrimId } from "../content/trim";
import { careerById } from "./catalog";
import { BASE_DAY_HOURS } from "./dayHours";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollOffers } from "./offers";
import { beginSeason } from "./seasonFlow";
import { queueStoryTrigger } from "./storyQueue";
import { rollTrendState } from "./trendMarket";

export const MAX_NAME_LENGTH = 24;

export interface NewGameSettings {
  readonly seed: number;
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId;
  readonly difficulty: DifficultyId;
  readonly career: CareerId;
}

export function isAvatarLook(look: AvatarLook): boolean {
  return (
    SKIN_TONES.some((tone) => tone.id === look.skinTone) &&
    HAIR_STYLES.includes(look.hairStyle) &&
    HAIR_COLOURS.some((colour) => colour.id === look.hairColour) &&
    OUTFIT_STYLES.includes(look.outfit)
  );
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues: string[] = [];
  const name = settings.name.trim();
  if (name.length === 0) issues.push("Choose a name.");
  if (name.length > MAX_NAME_LENGTH) issues.push(`Names can be up to ${MAX_NAME_LENGTH} characters.`);
  if (!Number.isInteger(settings.seed)) issues.push("The seed must be a whole number.");
  if (!isAvatarLook(settings.look)) issues.push("Finish your avatar.");
  if (!TRAIT_IDS.includes(settings.trait)) issues.push("Choose a trait.");
  if (!DIFFICULTY_IDS.includes(settings.difficulty)) issues.push("Choose a difficulty.");
  if (!CAREER_IDS.includes(settings.career)) issues.push("Choose a career.");
  return issues;
}

export function createGame(settings: NewGameSettings): GameState {
  const career = careerById(settings.career);
  const [trends, rng] = rollTrendState(settings.seed | 0);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      career: settings.career,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS, shopOpen: false },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    inventory: {
      fabricMetres: {},
      trims: Object.fromEntries(TRIM_IDS.map((id) => [id, 0])) as Record<TrimId, number>,
    },
    studio: { upgrades: [], assistantHired: false, assistantPaidThroughDay: 0 },
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    season: null,
    log: [],
    deliveredRunIds: [],
    gigsDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
  const introduced = queueStoryTrigger(base, settings.career === "student" ? "intro-student" : "intro-label");
  const withOffers = rollOffers(introduced);
  return settings.career === "label" ? (beginSeason(withOffers, null) ?? withOffers) : withOffers;
}
