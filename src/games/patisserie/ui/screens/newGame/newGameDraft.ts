import type { AvatarLook } from "../../../../../engine/avatar";
import type { DifficultyId } from "../../../../../engine/difficulty";
import type { TraitId } from "../../../../../engine/trait";
import type { StudioPlayer } from "../../../../../studio/gameModule";
import { newGameIssues, type NewGameSettings } from "../../../core";

export const NEW_GAME_STEPS = [
  { id: "avatar", label: "You" },
  { id: "trait", label: "Trait" },
  { id: "difficulty", label: "Difficulty" },
] as const;

export type NewGameStep = (typeof NEW_GAME_STEPS)[number]["id"];

export interface NewGameDraft {
  readonly name: string;
  readonly look: AvatarLook;
  readonly trait: TraitId | null;
  readonly difficulty: DifficultyId | null;
}

export function playerDraft(player: StudioPlayer): NewGameDraft {
  return { name: player.name, look: player.look, trait: null, difficulty: null };
}

export function draftSettings(draft: NewGameDraft, seed: number): NewGameSettings | null {
  if (draft.trait === null || draft.difficulty === null) return null;
  return { seed, name: draft.name, look: draft.look, trait: draft.trait, difficulty: draft.difficulty };
}

export function stepIssue(step: NewGameStep, draft: NewGameDraft): string | null {
  switch (step) {
    case "avatar":
      return (
        newGameIssues({
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
      return newGameIssues(settings)[0] ?? null;
    }
  }
}
