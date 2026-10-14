import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { roomById } from "./catalog";
import { placementProblem } from "./floorPlan";
import { bestLightCell, litSpots, moodMatch, type PlacedLight } from "./lighting";
import { recipeFor } from "./testPlaythrough";
import { tidyLayout } from "./tidyLayout";
import { walkThrough } from "./walkThrough";

function typicalLayout(clientId: string) {
  const client = CLIENTS.find((entry) => entry.id === clientId);
  if (client === undefined) throw new Error(clientId);
  const room = roomById(client.brief.roomId);
  const recipe = recipeFor(clientId);
  const pieces = tidyLayout(
    room,
    recipe.furniture.map((furnitureId, index) => ({ id: `piece-${index}`, furnitureId })),
  );
  if (pieces === null) throw new Error(`${clientId}: the typical set does not fit`);
  return { client, room, recipe, pieces };
}

function lightUp(clientId: string): PlacedLight[] {
  const { room, recipe, pieces } = typicalLayout(clientId);
  const placed: PlacedLight[] = [];
  for (const lightId of recipe.lights) {
    const cell = bestLightCell(room, pieces, placed, lightId);
    if (cell === null) throw new Error(`${clientId}: nowhere for ${lightId}`);
    placed.push({ lightId, col: cell[0], row: cell[1] });
  }
  return placed;
}

describe("tidy layouts", () => {
  for (const client of CLIENTS)
    it(`fit ${client.name}'s must-haves and typical set with flow of at least 0.9`, () => {
      const { room, recipe, pieces } = typicalLayout(client.id);
      expect(pieces).toHaveLength(recipe.furniture.length);
      for (const piece of pieces) expect(placementProblem(room, pieces, piece)).toBeNull();
      expect(walkThrough(room, pieces, 1).flow).toBeGreaterThanOrEqual(0.9);
    });

  for (const client of CLIENTS)
    it(`light every spot for ${client.name} with the typical lights placed by Show me`, () => {
      const { room, pieces } = typicalLayout(client.id);
      const lights = lightUp(client.id);
      const result = litSpots(room, pieces, lights);
      expect(result.total).toBeGreaterThan(0);
      expect(result.lit).toBe(result.total);
      expect(moodMatch(client.brief.mood, lights)).toBe(1);
    });
});
