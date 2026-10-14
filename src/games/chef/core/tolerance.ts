import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { StepKind } from "../content/dish";
import { UPGRADES, type UpgradeId } from "../content/upgrade";
import { difficultyById } from "./catalog";

export const PERFECTIONIST_MULTIPLIER = 1.2;

export interface SkillState {
  readonly profile: { readonly trait: TraitId; readonly difficulty: DifficultyId };
  readonly upgrades: readonly UpgradeId[];
}

export function toleranceFor(state: SkillState, step: StepKind): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_MULTIPLIER : 1;
  const tool = UPGRADES.find((upgrade) => upgrade.step === step && state.upgrades.includes(upgrade.id));
  const upgrade = tool === undefined ? 1 : tool.multiplier;
  return trait * upgrade * difficultyById(state.profile.difficulty).toleranceMultiplier;
}
