import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { CareerId } from "../content/career";
import type { FindId } from "../content/find";
import type { RecipeId } from "../content/recipe";
import type { UpgradeId } from "../content/upgrade";
import type { Design } from "./design";
import type { PlacedFinish } from "./flipRun";

export const RACK_SIZE = 4;
export const AWNING_RACK_SIZE = 6;
export const BOUTIQUE_RACK_SIZE = 8;
export const EXTENDED_RACK_SIZE = 10;

export interface PieceCloth {
  readonly colour: ColourId;
  readonly print: PrintId;
  readonly material: MaterialId;
}

export interface LeavesParts {
  readonly reuse: number;
  readonly salvage: number;
  readonly secondhand: number;
}

export interface RackPiece {
  readonly id: string;
  readonly runId: string;
  readonly recipeId: RecipeId;
  readonly design: Design;
  readonly cloth: PieceCloth;
  readonly quality: number;
  readonly leaves: number;
  readonly tags: readonly StyleTag[];
  readonly finishes: readonly PlacedFinish[];
  readonly madeDay: number;
  readonly findIds: readonly FindId[];
  readonly seamAccuracy: number;
  readonly leavesParts: LeavesParts;
  readonly colours: readonly ColourId[];
  readonly showcaseSeason: number | null;
}

export function rackSize(upgrades: readonly UpgradeId[], career: CareerId): number {
  if (career === "boutique")
    return upgrades.includes("rail-extension") ? EXTENDED_RACK_SIZE : BOUTIQUE_RACK_SIZE;
  return upgrades.includes("stall-awning") ? AWNING_RACK_SIZE : RACK_SIZE;
}
