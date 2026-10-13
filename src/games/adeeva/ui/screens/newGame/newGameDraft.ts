import type { AvatarLook } from "../../../../../engine/avatar";
import type { CareerId } from "../../../content/career";
import type { DifficultyId } from "../../../../../engine/difficulty";
import type { TraitId } from "../../../../../engine/trait";
import type { StudioPlayer } from "../../../../../studio/gameModule";
import { newGameIssues, type NewGameSettings } from "../../../core";

export const NEW_GAME_STEPS = [
  { id: "avatar", label: "You" },
  { id: "trait", label: "Trait" },
  { id: "career", label: "Career" },
  { id: "difficulty", label: "Difficulty" },
] as const;

export type NewGameStep = (typeof NEW_GAME_STEPS)[number]["id"];

export interface NewGameDraft {
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId | null;
  readonly career: CareerId | null;
  readonly difficulty: DifficultyId | null;
}

export function playerDraft(player: StudioPlayer): NewGameDraft {
  return { name: player.name, look: player.look, trait: null, career: null, difficulty: null };
}

export function draftSettings(draft: NewGameDraft, seed: number): NewGameSettings | null {
  if (draft.trait === null || draft.career === null || draft.difficulty === null) return null;
  return {
    seed,
    name: draft.name,
    look: draft.look,
    trait: draft.trait,
    career: draft.career,
    difficulty: draft.difficulty,
  };
}

function avatarIssues(draft: NewGameDraft): string[] {
  return newGameIssues({
    seed: 1,
    name: draft.name,
    look: draft.look,
    trait: draft.trait ?? "dreamer",
    career: draft.career ?? "student",
    difficulty: draft.difficulty ?? "standard",
  });
}

export function stepIssue(step: NewGameStep, draft: NewGameDraft): string | null {
  switch (step) {
    case "avatar":
      return avatarIssues(draft)[0] ?? null;
    case "trait":
      return draft.trait === null ? "Choose a trait." : null;
    case "career":
      return draft.career === null ? "Choose a career." : null;
    case "difficulty": {
      if (draft.difficulty === null) return "Choose a difficulty.";
      const settings = draftSettings(draft, 1);
      return settings === null ? "Finish every step first." : (newGameIssues(settings)[0] ?? null);
    }
  }
}
