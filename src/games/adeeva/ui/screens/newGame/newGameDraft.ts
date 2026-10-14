import type { CareerId } from "../../../content/career";
import type { StudioPlayer } from "../../../../../studio/gameModule";
import {
  CAREER_STEPS,
  careerDraftSettings,
  careerPlayerDraft,
  careerStepIssue,
  type CareerDraft,
  type CareerStepId,
} from "../../../../../ui/newGame/careerDraft";
import { newGameIssues, type NewGameSettings } from "../../../core";

export const NEW_GAME_STEPS = CAREER_STEPS;

export type NewGameStep = CareerStepId;

export type NewGameDraft = CareerDraft<CareerId>;

export function playerDraft(player: StudioPlayer): NewGameDraft {
  return careerPlayerDraft<CareerId>(player, null);
}

export function draftSettings(draft: NewGameDraft, seed: number): NewGameSettings | null {
  return careerDraftSettings(draft, seed);
}

export function stepIssue(step: NewGameStep, draft: NewGameDraft): string | null {
  return careerStepIssue(step, draft, newGameIssues);
}
