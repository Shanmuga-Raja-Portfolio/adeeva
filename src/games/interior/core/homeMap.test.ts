import { describe, expect, it } from "vitest";
import { PLOTS, SUGGESTED_WAGE, type PlotDef } from "../content/plot";
import { PURPOSES, type PurposeId } from "../content/roomPurpose";
import { furnitureById, isFurnitureId, plotById, purposeById, roomById } from "./catalog";
import { placementProblem, throughDoorCell } from "./floorPlan";
import { bestMap, legalMaps, mapFit, plotSpaces, purposeFits, roomMapFit } from "./homeMap";
import { bestLightCell, litSpots, moodMatch, type PlacedLight } from "./lighting";
import { newShowHomeGame, project, startHome } from "./larkspurPlaythrough";
import { reduce } from "./reduce";
import { tidyLayout } from "./tidyLayout";
import { walkThrough } from "./walkThrough";

const TYPICAL_LIGHTS = {
  warm: ["paper-pendant", "lantern-pendant"],
  cool: ["dome-pendant", "clip-lamp"],
  any: ["paper-pendant", "lantern-pendant"],
} as const;

function mustHaveFurniture(purposeId: PurposeId) {
  return purposeById(purposeId)
    .mustHaves.flatMap((need) =>
      isFurnitureId(need.itemId) ? Array.from({ length: need.count }, () => need.itemId) : [],
    )
    .filter(isFurnitureId);
}

function typicalSpend(plot: PlotDef): number {
  const map = bestMap(plot);
  return plot.spaces.reduce((sum, space, index) => {
    const room = roomById(space.roomId);
    const furniture = mustHaveFurniture(map[index] ?? "hall").reduce(
      (total, id) => total + furnitureById(id).price,
      0,
    );
    return sum + furniture + 6 + 4 * Math.ceil((room.cols * room.rows) / 10) + 10 + 3;
  }, 0);
}

function spaceRoom(plot: PlotDef, index: number) {
  const space = plot.spaces[index];
  if (space === undefined) throw new Error("No space");
  return { ...roomById(space.roomId), throughRow: space.throughRow };
}

describe("who lives where", { timeout: 60_000 }, () => {
  it("scores fit as 0.25, plus 0.375 for the window wish and 0.375 for the quiet wish", () => {
    const [snug, bedroom] = plotSpaces(plotById("garden-flat"));
    if (snug === undefined || bedroom === undefined) throw new Error("No spaces");
    expect(roomMapFit("kids", snug)).toBe(1);
    expect(roomMapFit("kids", bedroom)).toBe(0.625);
    expect(roomMapFit("living", bedroom)).toBe(1);
    const willow = plotSpaces(plotById("willow-house"));
    const dining = willow[1];
    if (dining === undefined) throw new Error("No space");
    expect(roomMapFit("garden", dining)).toBe(0.625);
  });

  it("counts a roof window as a window and leaves the hall out of the mean", () => {
    const studio = {
      index: 0,
      roomId: "loft-studio" as const,
      side: "back" as const,
      cells: 30,
      windows: 1,
      hall: false,
      throughRow: null,
    };
    expect(roomById("loft-studio").roofWindow).toBe(true);
    expect(roomMapFit("bedroom", studio)).toBe(1);
    const cottage = plotById("corner-cottage");
    expect(mapFit(cottage, ["hall", "living", "kids"])).toBe(1);
    expect(mapFit(cottage, ["hall", "kids", "living"])).toBe(0.8125);
    expect(plotSpaces(cottage)[0]?.hall).toBe(true);
  });

  it("makes every map a real choice except the first tutorial flat", () => {
    expect(legalMaps(plotById("garden-flat"))).toHaveLength(1);
    for (const plot of PLOTS.slice(1)) {
      const fits = legalMaps(plot)
        .map((map) => mapFit(plot, map))
        .sort((a, b) => b - a);
      expect(fits.length, plot.id).toBeGreaterThanOrEqual(2);
      expect((fits[0] ?? 0) - (fits[1] ?? 0), plot.id).toBeGreaterThanOrEqual(0.1);
    }
  });

  it("uses the best map as Ms. Achebe's map, with a fit of at least 0.85", () => {
    for (const plot of PLOTS) {
      const best = bestMap(plot);
      const top = Math.max(...legalMaps(plot).map((map) => mapFit(plot, map)));
      expect(mapFit(plot, best), plot.id).toBe(top);
      expect(top, plot.id).toBeGreaterThanOrEqual(0.85);
    }
  });

  it("fits every purpose into every space it may take, with the through door clear and reached", () => {
    for (const plot of PLOTS)
      for (const space of plotSpaces(plot))
        for (const purpose of PURPOSES) {
          if (space.hall ? purpose.id !== "hall" : !purposeFits(purpose.id, space)) continue;
          const room = spaceRoom(plot, space.index);
          const pieces = tidyLayout(
            room,
            mustHaveFurniture(purpose.id).map((furnitureId, index) => ({ id: `p${index}`, furnitureId })),
          );
          if (pieces === null) throw new Error(`${plot.id} ${space.index} ${purpose.id} does not fit`);
          const walk = walkThrough(room, pieces, 1);
          expect(walk.flow, `${plot.id} ${purpose.id}`).toBeGreaterThanOrEqual(0.9);
          if (room.throughRow !== null) expect(walk.throughReached, `${plot.id} ${purpose.id}`).toBe(true);
          const lights: PlacedLight[] = [];
          for (const lightId of TYPICAL_LIGHTS[purpose.mood]) {
            const cell = bestLightCell(room, pieces, lights, lightId);
            if (cell !== null) lights.push({ lightId, col: cell[0], row: cell[1] });
          }
          const lit = litSpots(room, pieces, lights);
          expect(lit.lit, `${plot.id} ${purpose.id} lights`).toBe(lit.total);
          expect(moodMatch(purpose.mood, lights)).toBe(1);
        }
  });

  it("keeps every purse at least 1.1 times the typical spend plus two specialist wages a room", () => {
    for (const plot of PLOTS) {
      expect(typicalSpend(plot), plot.id).toBe(plot.typicalSpend);
      const need =
        Math.ceil((1.1 * (plot.typicalSpend + SUGGESTED_WAGE * 2 * (plot.spaces.length - 1))) / 5) * 5;
      expect(plot.purse, plot.id).toBeGreaterThanOrEqual(need);
    }
  });

  it("treats the through door as a hard cell and a walk target", () => {
    const room = spaceRoom(plotById("corner-cottage"), 1);
    const door = throughDoorCell(room);
    expect(door).toEqual([7, 1]);
    const blocking = { id: "p1", furnitureId: "bookcase" as const, col: 6, row: 1, rotation: 0 as const };
    expect(placementProblem(room, [], blocking)).toBe("through");
    const wall = { id: "p2", furnitureId: "wardrobe" as const, col: 5, row: 2, rotation: 90 as const };
    expect(placementProblem(room, [], wall)).toBeNull();
    expect(walkThrough(room, [], 1).throughReached).toBe(true);
    expect(walkThrough(roomById("reading-nook"), [], 1).throughReached).toBeNull();
  });

  it("refuses a card on a space that is too small, returning the same state", () => {
    const state = startHome(newShowHomeGame());
    expect(project(state).plotId).toBe("garden-flat");
    const tooSmall = reduce(state, { type: "placePurpose", purposeId: "living", spaceIndex: 0 });
    expect(tooSmall).toBe(state);
    const placed = reduce(state, { type: "placePurpose", purposeId: "kids", spaceIndex: 0 });
    expect(project(placed).map.spaces).toEqual(["kids", null]);
    expect(reduce(placed, { type: "confirmMap" })).toBe(placed);
    const suggested = reduce(state, { type: "useAchebeMap" });
    expect(project(suggested).map).toEqual({ spaces: ["kids", "living"], fromAchebe: true });
    expect(reduce(suggested, { type: "useAchebeMap" })).toBe(suggested);
    const moved = reduce(suggested, { type: "placePurpose", purposeId: "kids", spaceIndex: 1 });
    expect(project(moved).map).toEqual({ spaces: [null, "kids"], fromAchebe: false });
  });
});
