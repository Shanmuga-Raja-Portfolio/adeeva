import type { AvatarLook } from "../../engine/avatar";
import type { DifficultyId } from "../../engine/difficulty";
import { profileIssues, type ProfileSettings } from "../../engine/profile";
import type { TraitId } from "../../engine/trait";

export const PROFILE_STEPS = [
  { id: "avatar", label: "You" },
  { id: "trait", label: "Trait" },
  { id: "difficulty", label: "Difficulty" },
] as const;

export type ProfileStep = (typeof PROFILE_STEPS)[number]["id"];

export interface ProfileDraft {
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId | null;
  readonly difficulty: DifficultyId | null;
}

export function playerDraft(player: { readonly name: string; readonly look: AvatarLook }): ProfileDraft {
  return { name: player.name, look: player.look, trait: null, difficulty: null };
}

export function draftSettings(draft: ProfileDraft, seed: number): ProfileSettings | null {
  if (draft.trait === null || draft.difficulty === null) return null;
  return { seed, name: draft.name, look: draft.look, trait: draft.trait, difficulty: draft.difficulty };
}

export function stepIssue(step: ProfileStep, draft: ProfileDraft): string | null {
  switch (step) {
    case "avatar":
      return (
        profileIssues({
          seed: 1,
          name: draft.name,
          look: draft.look,
          trait: draft.trait ?? "dreamer",
          difficulty: draft.difficulty ?? "standard",
        })[0] ?? null
      );
    case "trait":
      return draft.trait === null ? "Choose a trait." : null;
    case "difficulty": {
      const settings = draftSettings(draft, 1);
      if (settings === null)
        return draft.difficulty === null ? "Choose a difficulty." : "Finish every step first.";
      return profileIssues(settings)[0] ?? null;
    }
  }
}
