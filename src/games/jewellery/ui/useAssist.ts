import { createAssist } from "../../../ui/kit/assistChoices";

export const ASSIST_STEPS = ["cut", "join", "set", "polish"] as const;

export type AssistStep = (typeof ASSIST_STEPS)[number];

export const { AssistProvider, useAssist, useAssistChoices } = createAssist<AssistStep>(ASSIST_STEPS);
