import { isAvatarLook, type AvatarLook } from "./avatar";
import { DIFFICULTY_IDS, type DifficultyId } from "./difficulty";
import { TRAIT_IDS, type TraitId } from "./trait";

export const MAX_NAME_LENGTH = 24;

export interface ProfileBase {
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId;
  readonly difficulty: DifficultyId;
}

export interface ProfileSettings extends ProfileBase {
  readonly seed: number;
}

export function profileIssues(settings: ProfileSettings): string[] {
  const issues: string[] = [];
  const name = settings.name.trim();
  if (name.length === 0) issues.push("Choose a name.");
  if (name.length > MAX_NAME_LENGTH) issues.push(`Names can be up to ${MAX_NAME_LENGTH} characters.`);
  if (!Number.isInteger(settings.seed)) issues.push("The seed must be a whole number.");
  if (!isAvatarLook(settings.look)) issues.push("Finish your avatar.");
  if (!TRAIT_IDS.includes(settings.trait)) issues.push("Choose a trait.");
  if (!DIFFICULTY_IDS.includes(settings.difficulty)) issues.push("Choose a difficulty.");
  return issues;
}
