import { describe, expect, it } from "vitest";
import { BOUTIQUE_CLIENTS } from "../content/boutiqueClient";
import { BOUTIQUE_FINDS } from "../content/boutiqueFind";
import { BOUTIQUE_RECIPES } from "../content/boutiqueRecipe";
import { BOUTIQUE_STORY_BEATS } from "../content/boutiqueStoryBeat";
import { CAREERS } from "../content/career";
import { CLIENTS } from "../content/client";
import { FINDS, WORN_SPOT_SIZE } from "../content/find";
import { MARKS, PATCHES } from "../content/finish";
import { HINTS } from "../content/hint";
import { RECIPES } from "../content/recipe";
import { SEASONS } from "../content/season";
import { SHOP_SIGNS } from "../content/shopSign";
import { STORY_BEATS } from "../content/storyBeat";
import { TICKETS } from "../content/ticket";
import { TICKET_CLIENTS } from "../content/ticketClient";
import { UPGRADES } from "../content/upgrade";
import { WINDOW_PROPS } from "../content/windowProp";
import { findById, personById } from "./catalog";
import { stitchPoints } from "./unpick";

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

function unique(ids: readonly string[]): boolean {
  return new Set(ids).size === ids.length;
}

describe("boutique content", () => {
  it("about doubles the slice with unique ids", () => {
    expect(FINDS).toHaveLength(28);
    expect(RECIPES).toHaveLength(12);
    expect(PATCHES.length + MARKS.length).toBe(12);
    expect(CLIENTS.length + BOUTIQUE_CLIENTS.length + TICKET_CLIENTS.length).toBe(20);
    expect(TICKETS).toHaveLength(8);
    expect(UPGRADES).toHaveLength(10);
    expect(STORY_BEATS.filter((beat) => beat.id.startsWith("tf-"))).toHaveLength(23);
    expect(SEASONS).toHaveLength(4);
    expect(WINDOW_PROPS).toHaveLength(8);
    expect(SHOP_SIGNS).toHaveLength(4);
    expect(CAREERS.map((career) => career.id)).toEqual(["stall", "boutique"]);
    for (const list of [
      FINDS,
      RECIPES,
      [...CLIENTS, ...BOUTIQUE_CLIENTS, ...TICKET_CLIENTS],
      TICKETS,
      UPGRADES,
      STORY_BEATS,
      WINDOW_PROPS,
    ])
      expect(unique(list.map((entry) => entry.id))).toBe(true);
  });

  it("places every boutique find's stitches on its panels, one every 4 cm, with spots inside", () => {
    for (const find of BOUTIQUE_FINDS) {
      expect(find.minReputation).toBeGreaterThanOrEqual(40);
      for (const line of find.lines) {
        const panel = find.panels[line.panel];
        expect(panel, find.id).toBeDefined();
        const length = Math.hypot(line.to[0] - line.from[0], line.to[1] - line.from[1]);
        expect(length).toBeCloseTo((line.stitches - 1) * 4, 5);
        for (const [x, y] of stitchPoints(line)) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(panel?.width ?? 0);
          expect(y).toBeLessThanOrEqual(panel?.height ?? 0);
        }
        for (const notion of line.notions) expect(notion.stitch).toBeLessThan(line.stitches);
      }
      for (const spot of find.wornSpots) {
        const panel = find.panels[spot.panel];
        expect(spot.x + WORN_SPOT_SIZE).toBeLessThanOrEqual(panel?.width ?? 0);
        expect(spot.y + WORN_SPOT_SIZE).toBeLessThanOrEqual(panel?.height ?? 0);
      }
    }
  });

  it("names a real line and a stain inside the item for every ticket", () => {
    for (const ticket of TICKETS) {
      const find = findById(ticket.findId);
      expect(find.lines[ticket.line], ticket.id).toBeDefined();
      expect(personById(ticket.clientId), ticket.id).toBeDefined();
      expect(ticket.kind === "mend").toBe(ticket.stain !== null);
      if (ticket.stain !== null) {
        const panel = find.panels[ticket.stain.panel];
        expect(ticket.stain.cx - ticket.stain.radius).toBeGreaterThanOrEqual(0);
        expect(ticket.stain.cx + ticket.stain.radius).toBeLessThanOrEqual(panel?.width ?? 0);
        expect(ticket.stain.cy + ticket.stain.radius).toBeLessThanOrEqual(panel?.height ?? 0);
      }
      expect(ticket.kind === "alter").toBe(ticket.wornSpot !== null);
    }
  });

  it("gates two clients by trait and sends boutique clients from reputation 40", () => {
    expect(
      BOUTIQUE_CLIENTS.filter((client) => client.traitGate !== undefined).map((client) => client.id),
    ).toEqual(["zuri", "mrs-ferreira"]);
    expect(BOUTIQUE_CLIENTS.every((client) => client.minReputation >= 40)).toBe(true);
    expect(UPGRADES.filter((upgrade) => upgrade.boutiqueOnly)).toHaveLength(6);
  });

  it("keeps kid-facing lines short and warm", () => {
    for (const hint of Object.values(HINTS)) expect(words(hint), hint).toBeLessThanOrEqual(12);
    for (const client of [...BOUTIQUE_CLIENTS, ...TICKET_CLIENTS])
      for (const line of Object.values(client.lines)) expect(words(line), line).toBeLessThanOrEqual(16);
    for (const beat of BOUTIQUE_STORY_BEATS)
      for (const line of beat.lines) expect(words(line.text), line.text).toBeLessThanOrEqual(16);
    const banned = /\b(ruined|cheap|dirty|exclusive|designer|limited|eviction|debt|lost|loser|failed)\b/i;
    const texts = [
      ...BOUTIQUE_STORY_BEATS.flatMap((beat) => beat.lines.map((line) => line.text)),
      ...[...BOUTIQUE_CLIENTS, ...TICKET_CLIENTS].flatMap((client) => Object.values(client.lines)),
      ...BOUTIQUE_RECIPES.map((recipe) => recipe.blurb),
      ...SHOP_SIGNS.map((sign) => sign.motto),
    ];
    for (const text of texts) expect(text).not.toMatch(banned);
  });
});
