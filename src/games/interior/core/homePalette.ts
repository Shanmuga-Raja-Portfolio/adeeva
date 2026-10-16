import { spendHours } from "../../../engine/dayHours";
import { FLOORS, type FloorId } from "../content/floor";
import type { HomeStoryDef } from "../content/homeStory";
import { PAINTS, type PaintId } from "../content/paint";
import type { PlotDef } from "../content/plot";
import { homeStoryById, isFloorId, isPaintId, plotById } from "./catalog";
import type { GameState } from "./gameState";
import type { HomePalette, Project } from "./larkspur";
import { openProject, withProject } from "./projectUpdate";

export const PALETTE_PAINTS = 3;
export const PLAN_HOME_HOURS = 1;

export const EMPTY_PALETTE: HomePalette = { paints: [], hallFloor: null };

export function achebePalette(story: HomeStoryDef, plot: PlotDef): HomePalette {
  const storyPaints = PAINTS.filter((paint) => story.palette.includes(paint.colour)).map((paint) => paint.id);
  const fillers = PAINTS.map((paint) => paint.id).filter((id) => !storyPaints.includes(id));
  const paints = [...storyPaints, ...fillers].slice(0, PALETTE_PAINTS);
  const storyFloor = FLOORS.find((floor) => floor.colours.some((colour) => story.palette.includes(colour)));
  const hallFloor: FloorId | null = plot.hall ? (storyFloor?.id ?? "oak-boards") : null;
  return { paints, hallFloor };
}

export function paletteIssues(project: Project): string[] {
  const issues: string[] = [];
  const left = PALETTE_PAINTS - project.palette.paints.length;
  if (left > 0) issues.push(`Pick ${left} more ${left === 1 ? "paint" : "paints"}.`);
  if (plotById(project.plotId).hall && project.palette.hallFloor === null) issues.push("Pick a hall floor.");
  return issues;
}

export function togglePalettePaint(state: GameState, paintId: PaintId): GameState {
  return withProject(state, (project) => {
    if (project.stage !== "palette" || !isPaintId(paintId)) return null;
    const { paints } = project.palette;
    if (paints.includes(paintId))
      return {
        ...project,
        palette: { ...project.palette, paints: paints.filter((id) => id !== paintId) },
      };
    if (paints.length >= PALETTE_PAINTS) return null;
    return { ...project, palette: { ...project.palette, paints: [...paints, paintId] } };
  });
}

export function setHallFloor(state: GameState, floorId: FloorId): GameState {
  return withProject(state, (project) => {
    if (project.stage !== "palette" || !isFloorId(floorId) || !plotById(project.plotId).hall) return null;
    if (project.palette.hallFloor === floorId) return null;
    return { ...project, palette: { ...project.palette, hallFloor: floorId } };
  });
}

export function takeAchebePalette(state: GameState): GameState {
  return withProject(state, (project) => {
    if (project.stage !== "palette") return null;
    const palette = achebePalette(homeStoryById(project.storyId), plotById(project.plotId));
    const same =
      palette.hallFloor === project.palette.hallFloor &&
      palette.paints.length === project.palette.paints.length &&
      palette.paints.every((paintId, index) => project.palette.paints[index] === paintId);
    return same ? null : { ...project, palette };
  });
}

export function confirmPalette(state: GameState): GameState {
  const project = openProject(state);
  if (project === null || project.stage !== "palette" || paletteIssues(project).length > 0) return state;
  const spent = spendHours(state, PLAN_HOME_HOURS);
  if (spent === null) return state;
  return withProject(spent, (current) => ({ ...current, stage: "rooms" }));
}
