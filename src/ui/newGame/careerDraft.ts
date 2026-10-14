import type { ProfileSettings } from "../../engine/profile";
import {
  PROFILE_STEPS,
  draftSettings as profileSettings,
  playerDraft as profilePlayerDraft,
  stepIssue as profileStepIssue,
  type ProfileDraft,
} from "./profileDraft";

const [avatarStep, traitStep, difficultyStep] = PROFILE_STEPS;

export const CAREER_STEPS = [
  avatarStep,
  traitStep,
  { id: "career", label: "Career" },
  difficultyStep,
] as const;

export type CareerStepId = (typeof CAREER_STEPS)[number]["id"];

export interface CareerDraft<C extends string> extends ProfileDraft {
  readonly career: C | null;
}

export type CareerSettings<C extends string> = ProfileSettings & { readonly career: C };

export function careerPlayerDraft<C extends string>(
  player: Parameters<typeof profilePlayerDraft>[0],
  career: C | null,
): CareerDraft<C> {
  return { ...profilePlayerDraft(player), career };
}

export function careerDraftSettings<C extends string>(
  draft: CareerDraft<C>,
  seed: number,
): CareerSettings<C> | null {
  const base = profileSettings(draft, seed);
  return base === null || draft.career === null ? null : { ...base, career: draft.career };
}

export function careerStepIssue<C extends string>(
  step: CareerStepId,
  draft: CareerDraft<C>,
  settingsIssues: (settings: CareerSettings<C>) => readonly string[],
): string | null {
  if (step === "career") return draft.career === null ? "Choose a career." : null;
  if (step !== "difficulty") return profileStepIssue(step, draft);
  if (draft.difficulty === null) return "Choose a difficulty.";
  const settings = careerDraftSettings(draft, 1);
  return settings === null ? "Finish every step first." : (settingsIssues(settings)[0] ?? null);
}
