import {
  HAIR_COLOURS,
  OUTFIT_STYLES,
  type AccessoryId,
  type AvatarLook,
  type HairColourId,
  type OutfitStyleId,
} from "../engine/avatar";
import type { GameId, LookOptions } from "./gameModule";

export const HOME_THEMES = ["morning", "twilight", "garden"] as const;
export type HomeThemeId = (typeof HOME_THEMES)[number];

export type Perk =
  | {
      readonly kind: "hair-colour";
      readonly id: string;
      readonly label: string;
      readonly threshold: number;
      readonly hairColour: HairColourId;
    }
  | {
      readonly kind: "outfit";
      readonly id: string;
      readonly label: string;
      readonly threshold: number;
      readonly outfit: OutfitStyleId;
    }
  | {
      readonly kind: "accessory";
      readonly id: string;
      readonly label: string;
      readonly threshold: number;
      readonly accessory: AccessoryId;
    }
  | {
      readonly kind: "home-theme";
      readonly id: string;
      readonly label: string;
      readonly threshold: number;
      readonly theme: HomeThemeId;
    };

export const PERKS: readonly Perk[] = [
  {
    kind: "hair-colour",
    id: "rose-gold-hair",
    label: "Rose-gold hair",
    threshold: 4,
    hairColour: "rose-gold",
  },
  { kind: "accessory", id: "star-clip", label: "Star hair clip", threshold: 8, accessory: "star-clip" },
  {
    kind: "home-theme",
    id: "twilight-hall",
    label: "Twilight studio hall",
    threshold: 13,
    theme: "twilight",
  },
  { kind: "outfit", id: "dungarees", label: "Sunny dungarees", threshold: 19, outfit: "dungarees" },
  {
    kind: "accessory",
    id: "round-glasses",
    label: "Round glasses",
    threshold: 26,
    accessory: "round-glasses",
  },
  {
    kind: "hair-colour",
    id: "ocean-teal-hair",
    label: "Ocean-teal hair",
    threshold: 34,
    hairColour: "ocean-teal",
  },
  { kind: "home-theme", id: "garden-hall", label: "Garden studio hall", threshold: 43, theme: "garden" },
  { kind: "accessory", id: "flower-crown", label: "Flower crown", threshold: 53, accessory: "flower-crown" },
];

export const PERK_IDS: readonly string[] = PERKS.map((perk) => perk.id);

export function isPerkId(value: string): boolean {
  return PERK_IDS.includes(value);
}

export const PER_GAME_REPUTATION_CAP = 24;

export interface ReputationSource {
  readonly id: GameId;
  readonly reputationOf: (rawSave: unknown) => number;
}

export function studioReputation(
  games: readonly ReputationSource[],
  rawSlots: (gameId: GameId) => readonly unknown[],
): number {
  return games.reduce((sum, game) => {
    const best = rawSlots(game.id).reduce<number>((top, raw) => Math.max(top, game.reputationOf(raw)), 0);
    return sum + Math.min(PER_GAME_REPUTATION_CAP, best);
  }, 0);
}

export function unlockedPerks(reputation: number, already: readonly string[]): string[] {
  return PERKS.filter((perk) => already.includes(perk.id) || reputation >= perk.threshold).map(
    (perk) => perk.id,
  );
}

export function nextPerk(reputation: number, unlocked: readonly string[]): Perk | null {
  return PERKS.find((perk) => !unlocked.includes(perk.id) && perk.threshold > reputation) ?? null;
}

export function lookOptions(unlocked: readonly string[]): LookOptions {
  const owned = PERKS.filter((perk) => unlocked.includes(perk.id));
  const lockedHair = PERKS.flatMap((perk) => (perk.kind === "hair-colour" ? [perk.hairColour] : []));
  const lockedOutfits = PERKS.flatMap((perk) => (perk.kind === "outfit" ? [perk.outfit] : []));
  const ownedHair = owned.flatMap((perk) => (perk.kind === "hair-colour" ? [perk.hairColour] : []));
  const ownedOutfits = owned.flatMap((perk) => (perk.kind === "outfit" ? [perk.outfit] : []));
  return {
    hairColours: HAIR_COLOURS.map((colour) => colour.id).filter(
      (id) => !lockedHair.includes(id) || ownedHair.includes(id),
    ),
    outfits: OUTFIT_STYLES.filter((id) => !lockedOutfits.includes(id) || ownedOutfits.includes(id)),
  };
}

export function lookAllowed(options: LookOptions, look: AvatarLook): boolean {
  return options.hairColours.includes(look.hairColour) && options.outfits.includes(look.outfit);
}
