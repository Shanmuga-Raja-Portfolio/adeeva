import { isPlainObject } from "../../../engine/parse";
import { TOUR_MUSIC_IDS } from "../content/tourMusic";
import { TOUR_TIME_IDS } from "../content/tourTime";
import { homeStoryById } from "./catalog";
import type { GameState } from "./gameState";
import { allRoomsReady } from "./homeRoom";
import type { OpenHousePlan, Project, TourChoice } from "./larkspur";
import { openProject, withProject } from "./projectUpdate";
import { roomQuality } from "./roomQuality";

export function tourRooms(project: Pick<Project, "map">): number[] {
  return project.map.spaces.flatMap((purposeId, index) => (purposeId === "hall" ? [] : [index]));
}

export function roomQualities(state: Pick<GameState, "profile">, project: Project): number[] {
  return project.rooms.map((room) => (room === null ? 0 : roomQuality(state, room).quality));
}

export function achebePlan(state: Pick<GameState, "profile">, project: Project): OpenHousePlan {
  const story = homeStoryById(project.storyId);
  const qualities = roomQualities(state, project);
  const ranked = [...tourRooms(project)].sort((a, b) => (qualities[b] ?? 0) - (qualities[a] ?? 0) || a - b);
  const best = ranked[0];
  const tour = best === undefined ? [] : [...ranked.slice(1), best];
  return { tour, music: story.bestMusic, time: story.bestTime, fromAchebe: true };
}

export function samePlan(a: TourChoice, b: TourChoice): boolean {
  return (
    a.music === b.music &&
    a.time === b.time &&
    a.tour.length === b.tour.length &&
    a.tour.every((index, position) => b.tour[position] === index)
  );
}

export function planIssue(project: Project, plan: TourChoice): string | null {
  if (!isPlainObject(plan) || !Array.isArray(plan.tour)) return "Pick a plan.";
  const rooms = tourRooms(project);
  const tour = plan.tour;
  if (tour.length !== rooms.length || !rooms.every((index) => tour.includes(index)))
    return "Put every room in the tour once.";
  if (!TOUR_MUSIC_IDS.includes(plan.music)) return "Pick the music.";
  if (!TOUR_TIME_IDS.includes(plan.time)) return "Pick a time of day.";
  return null;
}

export function planOpenHouseIssue(state: GameState, plan: TourChoice): string | null {
  const project = openProject(state);
  if (project === null || (project.stage !== "planner" && project.stage !== "show"))
    return "Finish every room before planning the Open House.";
  if (!allRoomsReady(project)) return "Every room must be ready for visitors.";
  return planIssue(project, plan);
}

export function planOpenHouse(state: GameState, plan: TourChoice): GameState {
  if (planOpenHouseIssue(state, plan) !== null) return state;
  return withProject(state, (project) => {
    const clean: OpenHousePlan = {
      tour: [...plan.tour],
      music: plan.music,
      time: plan.time,
      fromAchebe: samePlan(plan, achebePlan(state, project)),
    };
    if (project.stage === "show" && project.plan !== null && samePlan(project.plan, clean)) return null;
    return { ...project, plan: clean, stage: "show" };
  });
}
