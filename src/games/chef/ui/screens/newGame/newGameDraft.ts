import type { StudioPlayer } from "../../../../../studio/gameModule";
import {
  PROFILE_STEPS,
  draftSettings as profileSettings,
  playerDraft as profilePlayerDraft,
  stepIssue as profileStepIssue,
  type ProfileDraft,
} from "../../../../../ui/newGame/profileDraft";
import type { StartId } from "../../../content/career";
import { newGameIssues, type NewGameSettings } from "../../../core";

const [avatarStep, traitStep, difficultyStep] = PROFILE_STEPS;

export const NEW_GAME_STEPS = [
  avatarStep,
  traitStep,
  { id: "start", label: "Start" },
  difficultyStep,
] as const;

export type NewGameStep = (typeof NEW_GAME_STEPS)[number]["id"];

export interface NewGameDraft extends ProfileDraft {
  readonly start: StartId | null;
}

export function playerDraft(player: StudioPlayer): NewGameDraft {
  return { ...profilePlayerDraft(player), start: null };
}

export function draftSettings(draft: NewGameDraft, seed: number): NewGameSettings | null {
  const base = profileSettings(draft, seed);
  return base === null || draft.start === null ? null : { ...base, start: draft.start };
}

export function stepIssue(step: NewGameStep, draft: NewGameDraft): string | null {
  if (step === "start") return draft.start === null ? "Choose where to start." : null;
  if (step !== "difficulty") return profileStepIssue(step, draft);
  if (draft.difficulty === null) return "Choose a difficulty.";
  const settings = draftSettings(draft, 1);
  return settings === null ? "Finish every step first." : (newGameIssues(settings)[0] ?? null);
}
