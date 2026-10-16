import { hasUniqueIds } from "../../../engine/uniqueIds";
import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { DECOR } from "../content/decor";
import { FLOORS } from "../content/floor";
import { FURNITURE } from "../content/furniture";
import { COACH_LINES, HINTS, HOME_HINTS } from "../content/hints";
import { LIGHTS } from "../content/light";
import { PAINTS } from "../content/paint";
import { ROOMS } from "../content/roomTemplate";
import { STORY_BEATS } from "../content/storyBeat";
import { roomById } from "./catalog";
import { recipeFor } from "./testPlaythrough";
import { cartCost, planCart } from "./warehouse";
import { createMakeoverRun, EMPTY_PLAN, MAKEOVER } from "./makeoverRun";
import { rollClientBrief } from "./brief";

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

function sentences(text: string): number {
  return text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;
}

function typicalSpend(clientId: string): number {
  const client = CLIENTS.find((entry) => entry.id === clientId);
  if (client === undefined) throw new Error(clientId);
  const recipe = recipeFor(clientId);
  const [brief] = rollClientBrief(client, { day: 1, minQualityBonus: 0, hotTags: ["classic", "cosy"] }, 1);
  const run = createMakeoverRun({
    id: "run-1",
    gigId: "gig-1",
    brief,
    purpose: MAKEOVER,
    plan: EMPTY_PLAN,
    day: 1,
    seed: 1,
  });
  const plan = {
    ...EMPTY_PLAN,
    pieces: recipe.furniture.map((furnitureId, index) => ({
      id: `p${index}`,
      furnitureId,
      col: 0,
      row: 0,
      rotation: 0 as const,
    })),
    wallPaint: recipe.wallPaint,
    featurePaint: recipe.featurePaint,
    floor: recipe.floor,
    lights: recipe.lights,
  };
  const base = cartCost({ upgrades: [] }, planCart({ ...run, plan }));
  const decor = recipe.decor.reduce((sum, id) => sum + (DECOR.find((item) => item.id === id)?.price ?? 0), 0);
  return base + decor;
}

describe("content", () => {
  it("keeps every catalog id unique", () => {
    for (const list of [CLIENTS, DECOR, FLOORS, FURNITURE, LIGHTS, PAINTS, ROOMS, STORY_BEATS])
      expect(hasUniqueIds(list)).toBe(true);
  });

  it("keeps hints to 12 words and client lines to 2 sentences", () => {
    for (const line of [...Object.values(HINTS), ...Object.values(COACH_LINES), ...Object.values(HOME_HINTS)])
      expect(words(line), line).toBeLessThanOrEqual(12);
    for (const client of CLIENTS)
      for (const line of Object.values(client.lines)) expect(sentences(line), line).toBeLessThanOrEqual(2);
  });

  it("matches the typical spends and fits them in every lowest budget with 4 coins spare", () => {
    const expected: Readonly<Record<string, number>> = {
      "nana-pearl": 36,
      "okafor-twins": 56,
      jun: 55,
      orla: 63,
      "mrs-halloran": 75,
      "dr-faraday": 56,
      "bluebell-cafe": 58,
      bellwind: 113,
      castellanos: 33,
      "grandpa-amos": 44,
      "ms-nakamura": 49,
      "supper-club": 51,
      "ms-farrow": 47,
      "bea-and-rufus": 55,
      solenne: 54,
      "the-hollins": 66,
    };
    for (const client of CLIENTS) {
      const spend = typicalSpend(client.id);
      expect(spend, client.id).toBe(expected[client.id]);
      expect(client.brief.budget[0], client.id).toBeGreaterThanOrEqual(spend + 4);
    }
  });

  it("puts every client in a room that exists and asks for at least one piece of furniture", () => {
    for (const client of CLIENTS) {
      expect(roomById(client.brief.roomId).id).toBe(client.brief.roomId);
      expect(client.brief.mustHaves.some((need) => FURNITURE.some((piece) => piece.id === need.itemId))).toBe(
        true,
      );
    }
  });
});
