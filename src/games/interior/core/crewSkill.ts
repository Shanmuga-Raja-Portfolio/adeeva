import { CREW_IDS, CREW_JOBS, type CrewId, type CrewJob } from "../content/crew";
import { crewById } from "./catalog";
import type { GameState } from "./gameState";
import type { CrewState, Project } from "./larkspur";

export const SKILL_CAP = 0.86;
export const COACHED_CAP = 0.88;
const GROWTH_PER_JOB = 0.01;
const GROWTH_JOBS = 6;
const TRAILER_BONUS = 0.03;
const CHALLENGING_PENALTY = 0.04;
const DEMO_WEIGHT = 0.6;
const SUPPLY_SAVING = 2;
const BASE_CREW = 2;

export const EMPTY_CREW: CrewState = {
  hired: [],
  jobsDone: Object.fromEntries(
    CREW_IDS.map((id) => [id, Object.fromEntries(CREW_JOBS.map((job) => [job, 0]))]),
  ) as CrewState["jobsDone"],
};

type SkillState = Pick<GameState, "profile" | "upgrades">;

export function crewSkill(state: SkillState, crew: CrewState, crewId: CrewId, job: CrewJob): number {
  const done = crew.jobsDone[crewId][job];
  const raw =
    crewById(crewId).skill[job] +
    GROWTH_PER_JOB * Math.min(GROWTH_JOBS, done) +
    (state.upgrades.includes("tool-trailer") ? TRAILER_BONUS : 0) -
    (state.profile.difficulty === "challenging" ? CHALLENGING_PENALTY : 0);
  return Math.min(SKILL_CAP, raw);
}

export function coachedSkill(skill: number, demo: number): number {
  return Math.max(skill, Math.min(COACHED_CAP, (1 - DEMO_WEIGHT) * skill + DEMO_WEIGHT * demo));
}

export function workSkill(
  state: SkillState,
  crew: CrewState,
  project: Pick<Project, "coached">,
  crewId: CrewId,
  job: CrewJob,
): number {
  const skill = crewSkill(state, crew, crewId, job);
  const demo = project.coached[job];
  return demo === undefined ? skill : coachedSkill(skill, demo);
}

export function crewWage(state: Pick<GameState, "upgrades">, crewId: CrewId): number {
  return crewById(crewId).wage - (state.upgrades.includes("supply-account") ? SUPPLY_SAVING : 0);
}

export function crewCap(state: Pick<GameState, "upgrades">): number {
  return BASE_CREW + (state.upgrades.includes("crew-radio") ? 1 : 0);
}
