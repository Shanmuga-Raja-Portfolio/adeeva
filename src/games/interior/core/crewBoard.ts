import { CREW_IDS, CREW_JOBS, type CrewId, type CrewJob } from "../content/crew";
import { crewById } from "./catalog";
import { crewCap, crewWage } from "./crewSkill";
import type { GameState } from "./gameState";
import type { Larkspur } from "./larkspur";
import { openProject, withLarkspur, withProject } from "./projectUpdate";
import { purseLeft, spendPurse } from "./purse";
import { queueStoryTrigger } from "./storyQueue";
import { lockRun } from "./warehouse";

function jobsToday(larkspur: Larkspur): number {
  return larkspur.project?.crewJobs.length ?? 0;
}

export function hireCrewIssue(state: GameState, crewId: CrewId): string | null {
  const larkspur = state.larkspur;
  if (larkspur === null || !CREW_IDS.includes(crewId)) return "Crew work on Larkspur Close.";
  if (larkspur.crew.hired.includes(crewId)) return `${crewById(crewId).name} is already on your crew.`;
  if (larkspur.crew.hired.length >= crewCap(state)) return "Your crew is full for now.";
  if (jobsToday(larkspur) > 0) return "Change your crew on a day with no jobs booked.";
  return null;
}

export function hireCrew(state: GameState, crewId: CrewId): GameState {
  if (hireCrewIssue(state, crewId) !== null) return state;
  const hired = withLarkspur(state, (larkspur) => ({
    ...larkspur,
    crew: { ...larkspur.crew, hired: [...larkspur.crew.hired, crewId] },
  }));
  return queueStoryTrigger(hired, "first-crew");
}

export function finishCrewIssue(state: GameState, crewId: CrewId): string | null {
  const larkspur = state.larkspur;
  if (larkspur === null || !larkspur.crew.hired.includes(crewId)) return "They aren't on your crew.";
  if (jobsToday(larkspur) > 0) return "Wait for today's jobs to finish first.";
  return null;
}

export function finishCrew(state: GameState, crewId: CrewId): GameState {
  if (finishCrewIssue(state, crewId) !== null) return state;
  return withLarkspur(state, (larkspur) => ({
    ...larkspur,
    crew: { ...larkspur.crew, hired: larkspur.crew.hired.filter((id) => id !== crewId) },
  }));
}

export function assignCrewIssue(
  state: GameState,
  crewId: CrewId,
  roomIndex: number,
  job: CrewJob,
): string | null {
  const larkspur = state.larkspur;
  const project = openProject(state);
  if (larkspur === null || project === null || project.stage !== "rooms")
    return "No rooms need the crew today.";
  if (!CREW_JOBS.includes(job) || !larkspur.crew.hired.includes(crewId)) return "Hire them first.";
  const name = crewById(crewId).name;
  if (project.crewJobs.some((entry) => entry.crewId === crewId)) return `${name} already has a job today.`;
  if (project.crewJobs.some((entry) => entry.roomIndex === roomIndex))
    return "Someone is already working there.";
  const room = Number.isInteger(roomIndex) ? project.rooms[roomIndex] : undefined;
  if (room === undefined) return "That room isn't in this home.";
  if (room === null) {
    const open = state.activeRun;
    const isOpen = open !== null && open.purpose.kind === "home-room" && open.purpose.roomIndex === roomIndex;
    return isOpen ? "Close the room first." : "Plan and shop for the room first.";
  }
  if (room.stage !== job) return `The ${job} step isn't next in that room.`;
  if (lockRun(state, room) === null) return "Some of the plan is missing from the shelf.";
  const wage = crewWage(state, crewId);
  if (purseLeft(project) < wage && state.profile.difficulty !== "relaxed")
    return `${name}'s wage is ${wage} coins. Top up the purse first.`;
  return null;
}

export function assignCrew(state: GameState, crewId: CrewId, roomIndex: number, job: CrewJob): GameState {
  const project = openProject(state);
  if (project === null || assignCrewIssue(state, crewId, roomIndex, job) !== null) return state;
  const room = project.rooms[roomIndex];
  if (room === undefined || room === null) return state;
  const locked = lockRun(state, room);
  if (locked === null) return state;
  const wage = crewWage(state, crewId);
  const paid = spendPurse(locked.state, wage);
  if (paid === null) return state;
  return withProject(paid, (current) => ({
    ...current,
    rooms: current.rooms.map((entry, index) => (index === roomIndex ? locked.run : entry)),
    crewJobs: [...current.crewJobs, { crewId, roomIndex, job, wage }],
  }));
}
