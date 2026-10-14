import type { CareerId } from "../../../content/career";
import type { StudioPlayer } from "../../../../../studio/gameModule";
import {
  PROFILE_STEPS,
  draftSettings as profileSettings,
  playerDraft as profilePlayerDraft,
  stepIssue as profileStepIssue,
  type ProfileDraft,
} from "../../../../../ui/newGame/profileDraft";
import { newGameIssues, type NewGameSettings } from "../../../core";

const [avatarStep, traitStep, difficultyStep] = PROFILE_STEPS;

export const NEW_GAME_STEPS = [
  avatarStep,
  traitStep,
  { id: "career", label: "Career" },
  difficultyStep,
] as const;

export type NewGameStep = (typeof NEW_GAME_STEPS)[number]["id"];

export interface NewGameDraft extends ProfileDraft {
  readonly career: CareerId | null;
}

export function playerDraft(player: StudioPlayer): NewGameDraft {
  return { ...profilePlayerDraft(player), career: null };
}

export function draftSettings(draft: NewGameDraft, seed: number): NewGameSettings | null {
  const base = profileSettings(draft, seed);
  return base === null || draft.career === null ? null : { ...base, career: draft.career };
}

export function stepIssue(step: NewGameStep, draft: NewGameDraft): string | null {
  if (step === "career") return draft.career === null ? "Choose a career." : null;
  if (step !== "difficulty") return profileStepIssue(step, draft);
  if (draft.difficulty === null) return "Choose a difficulty.";
  const settings = draftSettings(draft, 1);
  return settings === null ? "Finish every step first." : (newGameIssues(settings)[0] ?? null);
}
