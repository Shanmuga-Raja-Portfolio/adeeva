import type { AvatarLook } from "../../../engine/avatar";

export const APPRENTICE_JOB_IDS = ["fetch", "sand", "pegs"] as const;
export type ApprenticeJobId = (typeof APPRENTICE_JOB_IDS)[number];

export interface ApprenticeJobDef {
  readonly id: ApprenticeJobId;
  readonly name: string;
  readonly stage: "timber" | "sand" | "join";
  readonly blurb: string;
}

export const REN = {
  name: "Ren Calloway",
  shortName: "Ren",
  look: {
    skinTone: "amber",
    hairStyle: "curly-puff",
    hairColour: "dark-brown",
    outfit: "studio-apron",
  } satisfies AvatarLook,
  weeklyWage: 40,
  jobsPerDay: 2,
  benchJobsPerDay: 3,
  jobsPerLevel: 8,
  accuracies: [0.74, 0.8, 0.86],
} as const;

export const APPRENTICE_JOBS: readonly ApprenticeJobDef[] = [
  {
    id: "fetch",
    name: "Fetch the boards",
    stage: "timber",
    blurb: "Ren buys what fits your plan. No trip hour for you.",
  },
  {
    id: "sand",
    name: "Sand it",
    stage: "sand",
    blurb: "Ren sands every surface. The sanding takes no hours.",
  },
  {
    id: "pegs",
    name: "Peg joints",
    stage: "join",
    blurb: "Ren taps home the peg joints. One hour saved.",
  },
];
