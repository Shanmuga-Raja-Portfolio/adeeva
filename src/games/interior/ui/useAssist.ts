import { createAssist } from "../../../ui/kit/assistChoices";

const ASSIST_STEPS = ["plan", "paint", "floor", "light"] as const;

export type AssistStep = (typeof ASSIST_STEPS)[number];

export const { AssistProvider, useAssist, useAssistChoices } = createAssist<AssistStep>(ASSIST_STEPS);
