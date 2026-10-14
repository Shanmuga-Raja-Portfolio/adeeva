import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { RecipeId } from "../content/recipe";
import type { UpgradeId } from "../content/upgrade";
import type { Design } from "./design";
import type { PlacedFinish } from "./flipRun";

export const RACK_SIZE = 4;
export const AWNING_RACK_SIZE = 6;

export interface PieceCloth {
  readonly colour: ColourId;
  readonly print: PrintId;
  readonly material: MaterialId;
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
}

export function rackSize(upgrades: readonly UpgradeId[]): number {
  return upgrades.includes("stall-awning") ? AWNING_RACK_SIZE : RACK_SIZE;
}
