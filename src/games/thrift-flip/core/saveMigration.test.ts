import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { thriftFlipModule } from "../module";
import {
  boutiqueStart,
  endDays,
  openedBoutique,
  playTicketToReview,
  rackPieceFixture,
  settleWithChoice,
  withRack,
} from "./boutiquePlaythrough";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { migrateV1toV2 } from "./saveMigrations";
import { pieceFairBand } from "./stallDay";
import { dispatchAll, seamActions, settleStories } from "./testPlaythrough";

const FIXTURES = ["midFlipAfterCut", "stallDayResult", "fullRack"] as const;

function fixture(name: (typeof FIXTURES)[number]): string {
  return readFileSync(new URL(`./v1Saves/${name}.json`, import.meta.url), "utf8");
}

function loaded(name: (typeof FIXTURES)[number]): GameState {
  const parsed = parseSave(fixture(name));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.state;
}

function roundTrip(state: GameState): GameState {
  const parsed = parseSave(serialize(state));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.state;
}

describe("saves from version 1", () => {
  it("load each committed fixture as a version 2 stall save", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(fixture(name)) as { schemaVersion: number; flipsFinished: number };
      expect(raw.schemaVersion).toBe(1);
      const state = loaded(name);
      expect(state.schemaVersion).toBe(2);
      expect(state.profile.career).toBe("stall");
      expect(state.boutique).toBeNull();
      expect(state.keptInUse).toBe(raw.flipsFinished);
      expect(roundTrip(state)).toEqual(state);
    }
  });

  it("fill rack pieces with honest defaults and keep stall results", () => {
    const rack = loaded("fullRack").rack;
    expect(rack).toHaveLength(4);
    for (const piece of rack) {
      expect(piece.findIds).toEqual([]);
      expect(piece.seamAccuracy).toBe(piece.quality / 100);
      expect(piece.leavesParts.reuse).toBe(piece.leaves / 100);
      expect(piece.colours).toContain(piece.cloth.colour);
      expect(piece.showcaseSeason).toBeNull();
    }
    const stall = loaded("stallDayResult").stall;
    expect(stall?.sales.length).toBeGreaterThan(0);
    expect(stall?.sales.every((sale) => sale.bonuses.length === 0)).toBe(true);
  });

  it("continue a flip that was mid-sew, then reach Stall Day, the offer and the boutique", () => {
    const state = loaded("midFlipAfterCut");
    expect(state.activeRun?.stage).toBe("sew");
    expect(state.activeRun?.brief?.kind).toBe("flip");
    const sewn = dispatchAll(state, [...seamActions(state, 0.9), { type: "goToStage", stage: "finish" }]);
    const review = dispatchAll(sewn, [
      { type: "addFinish", finish: { kind: "trim", trimId: "button", source: "new" }, x: 120, y: 160 },
      { type: "addFinish", finish: { kind: "trim", trimId: "button", source: "new" }, x: 160, y: 160 },
      { type: "goToStage", stage: "review" },
    ]);
    const delivered = settleStories(reduce(review, { type: "deliver" }));
    expect(delivered.log.at(-1)?.reward?.outcome).toBe("pass");
    expect(delivered.keptInUse).toBe(1);
    const stallDay = endDays(delivered, 6);
    expect(stallDay.calendar.day).toBe(7);
    const ready = { ...stallDay, reputation: 40, gigsDelivered: 10, fairSales: 3 };
    const prices = Object.fromEntries(
      ready.rack.map((piece) => [piece.id, pieceFairBand(ready, piece).high]),
    );
    const held = reduce(ready, { type: "holdStall", prices });
    const offered = reduce(held, { type: "endDay" });
    expect(offered.story.queue).toContain("tf-boutique-offer");
    const opened = settleWithChoice(offered, "open");
    expect(opened.profile.career).toBe("boutique");
    expect(roundTrip(opened)).toEqual(opened);
  });

  it("migrate briefs on the board and on the bench to flips", () => {
    const raw = JSON.parse(fixture("midFlipAfterCut")) as Record<string, unknown>;
    const migrated = migrateV1toV2(raw) as {
      activeRun: { brief: { kind: string; ticketId: null } };
      gigs: { offers: { brief: { kind: string } }[] };
      profile: { career: string };
    };
    expect(migrated.activeRun.brief).toMatchObject({ kind: "flip", ticketId: null });
    expect(migrated.gigs.offers.every((offer) => offer.brief.kind === "flip")).toBe(true);
    expect(migrated.profile.career).toBe("stall");
    expect(migrateV1toV2({ schemaVersion: 1 })).toMatchObject({ boutique: null });
  });
});

describe("version 2 saves", () => {
  it("round-trip a boutique mid-ticket, at the window and after a show", () => {
    const opened = openedBoutique();
    const ticket = opened.gigs.offers.find((offer) => offer.brief.kind !== "flip");
    if (ticket === undefined) throw new Error("No ticket offered");
    const accepted = reduce(opened, { type: "acceptOffer", offerId: ticket.id });
    const midTicket = playTicketToReview(accepted, ticket.id);
    expect(roundTrip(midTicket)).toEqual(midTicket);
    const swapDay = endDays(boutiqueStart(), 10);
    expect(roundTrip(swapDay)).toEqual(swapDay);
  });

  it("reject a boutique save without a boutique and a stall save with one, and report damage", () => {
    const opened = openedBoutique();
    const raw = JSON.parse(serialize(opened)) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, boutique: null })).ok).toBe(false);
    const stallRaw = JSON.parse(serialize(settleStories(boutiqueStart()))) as Record<string, unknown>;
    const stallWithShop = { ...stallRaw, profile: { ...(stallRaw.profile as object), career: "stall" } };
    expect(parseSave(JSON.stringify(stallWithShop)).ok).toBe(false);
    const damaged = parseSave(JSON.stringify({ ...raw, keptInUse: -2 }));
    expect(damaged.ok).toBe(false);
    if (!damaged.ok) expect(damaged.error).toContain("keptInUse");
  });

  it("reject a season past its length, an overfull shelf or window, and a swap count that disagrees", () => {
    const state = boutiqueStart();
    const boutique = state.boutique;
    if (boutique === null) throw new Error("No boutique");
    const loads = (next: GameState) => parseSave(serialize(next)).ok;
    expect(loads({ ...state, calendar: { ...state.calendar, day: 500 } })).toBe(false);
    const ids = ["piece-1", "piece-2", "piece-3", "piece-4"];
    const racked = withRack(
      state,
      ids.map((id) => rackPieceFixture(id)),
    );
    const shelf = (capsule: string[]) => ({
      ...racked,
      boutique: { ...boutique, season: { ...boutique.season, capsule } },
    });
    expect(loads(shelf(ids.slice(0, 3)))).toBe(true);
    expect(loads(shelf(ids))).toBe(false);
    const props = ["book-stack", "paper-moon", "wicker-basket", "potted-fern", "bike-wheel"] as const;
    const crowded = {
      ...boutique,
      props: [...props],
      window: { pieces: [], props: props.map((propId) => ({ propId, x: 10, y: 10 })) },
    };
    expect(loads({ ...state, boutique: crowded })).toBe(false);
    expect(loads({ ...state, boutique: crowded, upgrades: ["window-plinths"] })).toBe(true);
    const swapState = endDays(boutiqueStart(), 10);
    const swapDay = swapState.boutique?.season.swapDay;
    if (swapState.boutique === null || swapDay === null || swapDay === undefined) throw new Error("No hall");
    const miscounted = { ...swapDay, swaps: 2 };
    const swapSeason = { ...swapState.boutique.season, swapDay: miscounted };
    expect(loads({ ...swapState, boutique: { ...swapState.boutique, season: swapSeason } })).toBe(false);
    const unpaid = { ...swapDay, tables: swapDay.tables.map((table) => ({ ...table, soaked: true })) };
    const unpaidSeason = { ...swapState.boutique.season, swapDay: unpaid };
    expect(loads({ ...swapState, boutique: { ...swapState.boutique, season: unpaidSeason } })).toBe(false);
  });

  it("count studio reputation above each career's start", () => {
    const opened = { ...openedBoutique(), reputation: 52 };
    expect(thriftFlipModule.reputationOf(JSON.parse(serialize(opened)))).toBe(12);
    const started = { ...boutiqueStart(), reputation: 52 };
    expect(thriftFlipModule.reputationOf(JSON.parse(serialize(started)))).toBe(12);
    expect(thriftFlipModule.reputationOf(JSON.parse(fixture("fullRack")))).toBe(0);
  });
});
