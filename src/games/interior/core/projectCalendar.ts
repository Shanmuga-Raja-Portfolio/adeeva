import type { Larkspur, Project } from "./larkspur";

export const STAGE_FROM_OFFSET = 7;
export const OPEN_HOUSE_OFFSET = 12;
export const LATE_OFFSET = 13;

export function openHouseDay(project: Pick<Project, "startDay">): number {
  return project.startDay + OPEN_HOUSE_OFFSET;
}

export function firstStagingDay(project: Pick<Project, "startDay">): number {
  return project.startDay + STAGE_FROM_OFFSET;
}

export function lateDay(project: Pick<Project, "startDay">): number {
  return project.startDay + LATE_OFFSET;
}

export function isProjectOpenOn(larkspur: Pick<Larkspur, "project"> | null, day: number): boolean {
  const project = larkspur?.project ?? null;
  if (project === null) return false;
  return project.stage !== "done" || day <= openHouseDay(project);
}

export function stagingDayIssue(project: Pick<Project, "startDay">, day: number): string | null {
  if (day < firstStagingDay(project)) return `The Open House can open from day ${firstStagingDay(project)}.`;
  if (day > lateDay(project)) return "Bellwind already opened the doors.";
  return null;
}

export function isOverdue(project: Pick<Project, "startDay" | "stage">, endedDay: number): boolean {
  return project.stage !== "done" && endedDay >= lateDay(project);
}

export function isArchivable(project: Pick<Project, "startDay" | "stage">, day: number): boolean {
  return project.stage === "done" && day >= lateDay(project);
}

export type OpenHouseAlert = "today" | "late";

export function openHouseAlert(
  project: Pick<Project, "startDay" | "stage">,
  day: number,
): OpenHouseAlert | null {
  if (project.stage === "done") return null;
  if (day === lateDay(project)) return "late";
  return day === openHouseDay(project) ? "today" : null;
}
