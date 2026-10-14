import type { ComponentType } from "react";
import type { AvatarLook, HairColourId, OutfitStyleId } from "../engine/avatar";
import type { TileArtProps } from "../ui/art/tiles/TileBackdrop";

export const GAME_IDS = [
  "adeeva",
  "thrift-flip",
  "patisserie",
  "workshop",
  "interior",
  "jewellery",
  "chef",
] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface StudioPlayer {
  readonly name: string;
  readonly look: AvatarLook;
}

export interface LookOptions {
  readonly hairColours: readonly HairColourId[];
  readonly outfits: readonly OutfitStyleId[];
}

export interface GameScreenProps {
  readonly player: StudioPlayer;
  readonly lookOptions: LookOptions;
  readonly onPlayerChange: (player: StudioPlayer) => void;
  readonly onExit: () => void;
}

interface GameCard {
  readonly id: GameId;
  readonly title: string;
  readonly tagline: string;
  readonly ages: string;
  readonly tileArt: ComponentType<TileArtProps>;
}

export interface GameModule extends GameCard {
  readonly status: "live";
  readonly load: () => Promise<{ readonly default: ComponentType<GameScreenProps> }>;
  readonly reputationOf: (rawSave: unknown) => number;
  readonly parentNote?: string | undefined;
}

export interface WorkshopGame extends GameCard {
  readonly status: "workshop";
}

export type StudioGame = GameModule | WorkshopGame;

export function isGameId(value: string): value is GameId {
  return GAME_IDS.some((id) => id === value);
}
