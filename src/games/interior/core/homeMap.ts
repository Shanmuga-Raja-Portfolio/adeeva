import { average } from "../../../engine/average";
import type { PlotDef, SpaceSide } from "../content/plot";
import type { PurposeId } from "../content/roomPurpose";
import type { RoomId } from "../content/roomTemplate";
import { plotById, purposeById, roomById } from "./catalog";
import type { GameState } from "./gameState";
import type { HomeMap, Project } from "./larkspur";
import { withProject } from "./projectUpdate";

const FIT_BASE = 0.25;
const WISH_WEIGHT = 0.375;

export interface SpaceView {
  readonly index: number;
  readonly roomId: RoomId;
  readonly side: SpaceSide;
  readonly cells: number;
  readonly windows: number;
  readonly hall: boolean;
  readonly throughRow: number | null;
}

export function plotSpaces(plot: PlotDef): SpaceView[] {
  return plot.spaces.map((space, index) => {
    const room = roomById(space.roomId);
    return {
      index,
      roomId: space.roomId,
      side: space.side,
      cells: room.cols * room.rows,
      windows: room.windows.length + (room.roofWindow ? 1 : 0),
      hall: plot.hall && index === 0,
      throughRow: space.throughRow,
    };
  });
}

export function purposeFits(purposeId: PurposeId, space: SpaceView): boolean {
  return !space.hall && purposeId !== "hall" && space.cells >= purposeById(purposeId).minCells;
}

export function roomMapFit(purposeId: PurposeId, space: SpaceView): number {
  const purpose = purposeById(purposeId);
  const window = space.windows >= purpose.windowWish ? 1 : 0;
  const quiet = !purpose.quiet || space.side === "back" ? 1 : 0;
  return FIT_BASE + WISH_WEIGHT * window + WISH_WEIGHT * quiet;
}

export function mapFit(plot: PlotDef, spaces: readonly (PurposeId | null)[]): number {
  const views = plotSpaces(plot).filter((space) => !space.hall);
  return average(
    views.map((space) => {
      const purposeId = spaces[space.index] ?? null;
      return purposeId === null ? 0 : roomMapFit(purposeId, space);
    }),
  );
}

export function emptyMap(plot: PlotDef): HomeMap {
  return {
    spaces: plot.spaces.map((_, index) => (plot.hall && index === 0 ? "hall" : null)),
    fromAchebe: false,
  };
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
  );
}

export function legalMaps(plot: PlotDef): (PurposeId | null)[][] {
  const views = plotSpaces(plot);
  const open = views.filter((space) => !space.hall);
  return permutations(plot.purposes).flatMap((order) => {
    const fits = order.every((purposeId, slot) => {
      const space = open[slot];
      return space !== undefined && purposeFits(purposeId, space);
    });
    if (!fits) return [];
    let slot = 0;
    return [
      views.map((space) => {
        if (space.hall) return "hall";
        const purposeId = order[slot] ?? null;
        slot += 1;
        return purposeId;
      }),
    ];
  });
}

export function bestMap(plot: PlotDef): (PurposeId | null)[] {
  let best: { spaces: (PurposeId | null)[]; fit: number } | null = null;
  for (const spaces of legalMaps(plot)) {
    const fit = mapFit(plot, spaces);
    if (best === null || fit > best.fit + 1e-9) best = { spaces, fit };
  }
  return best === null ? emptyMap(plot).spaces.slice() : best.spaces;
}

function suggestedMap(plot: PlotDef, spaces: readonly (PurposeId | null)[]): HomeMap {
  const best = bestMap(plot);
  return { spaces, fromAchebe: best.every((entry, index) => spaces[index] === entry) };
}

export function isMapComplete(plot: PlotDef, map: HomeMap): boolean {
  return plot.purposes.every((purposeId) => map.spaces.includes(purposeId));
}

export function placePurposeIssue(project: Project, purposeId: PurposeId, spaceIndex: number): string | null {
  if (project.stage !== "map") return "The home map is already done.";
  const plot = plotById(project.plotId);
  const space = plotSpaces(plot)[spaceIndex];
  if (space === undefined || !plot.purposes.includes(purposeId)) return "That card doesn't belong here.";
  if (space.hall) return "The hall always stays the hall.";
  if (!purposeFits(purposeId, space)) return `That space is too small for a ${purposeById(purposeId).name}.`;
  return null;
}

function moved(project: Project, purposeId: PurposeId, spaceIndex: number): Project {
  const spaces = project.map.spaces.map((entry, index) => {
    if (index === spaceIndex) return purposeId;
    return entry === purposeId ? null : entry;
  });
  return { ...project, map: suggestedMap(plotById(project.plotId), spaces) };
}

export function placePurpose(state: GameState, purposeId: PurposeId, spaceIndex: number): GameState {
  return withProject(state, (project) => {
    if (!Number.isInteger(spaceIndex) || placePurposeIssue(project, purposeId, spaceIndex) !== null)
      return null;
    if (project.map.spaces[spaceIndex] === purposeId) return null;
    return moved(project, purposeId, spaceIndex);
  });
}

export function clearSpace(state: GameState, spaceIndex: number): GameState {
  return withProject(state, (project) => {
    const current = project.map.spaces[spaceIndex];
    if (project.stage !== "map" || current === undefined || current === null || current === "hall")
      return null;
    const spaces = project.map.spaces.map((entry, index) => (index === spaceIndex ? null : entry));
    return { ...project, map: suggestedMap(plotById(project.plotId), spaces) };
  });
}

export function takeAchebeMap(state: GameState): GameState {
  return withProject(state, (project) => {
    if (project.stage !== "map") return null;
    const spaces = bestMap(plotById(project.plotId));
    if (project.map.fromAchebe && spaces.every((entry, index) => project.map.spaces[index] === entry))
      return null;
    return { ...project, map: { spaces, fromAchebe: true } };
  });
}

export function confirmMap(state: GameState): GameState {
  return withProject(state, (project) => {
    if (project.stage !== "map" || !isMapComplete(plotById(project.plotId), project.map)) return null;
    return { ...project, stage: "palette" };
  });
}
