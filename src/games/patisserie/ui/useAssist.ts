import { createAssist } from "../../../ui/kit/assistChoices";

export const ASSIST_STEPS = ["weigh", "stir", "oven", "pipe"] as const;

export type AssistStep = (typeof ASSIST_STEPS)[number];

export const { AssistProvider, useAssist, useAssistChoices } = createAssist<AssistStep>(ASSIST_STEPS);
