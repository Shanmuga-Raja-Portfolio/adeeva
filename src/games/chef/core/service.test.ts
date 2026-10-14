import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { dishById } from "./catalog";
import { admitTickets } from "./serviceRail";
import { scoreQuick } from "./serviceQuick";
import {
  cookDish,
  GOOD_COOK,
  must,
  newTestGame,
  playTicket,
  quickRecordFor,
  settleStories,
} from "./testPlaythrough";

function lineCook(
  overrides: Partial<GameState> = {},
  difficulty: "relaxed" | "standard" | "challenging" = "standard",
) {
  const base = settleStories(newTestGame({ difficulty }));
  return settleStories({ ...base, rung: "line" as const, mentorsMet: [...base.mentorsMet], ...overrides });
}

function withShiftBoard(state: GameState): GameState {
  return settleStories(reduce(state, { type: "endDay" }));
}

describe("a Line service", () => {
  it("opens from the shift board, plays tickets on the clock and pays the wage plus a bonus", () => {
    const state = withShiftBoard(lineCook());
    const offer = state.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    expect(state.board.shifts).toHaveLength(2);
    const open = must(state, {
      type: "startShift",
      offerId: offer.id,
      setup: { special: null, helpers: [] },
    });
    const service = open.service;
    if (service === null) throw new Error("no service");
    expect(open.calendar.hoursLeft).toBe(4);
    expect(service.tickets).toHaveLength(6);
    expect(service.plan.lengthSeconds).toBe(240);
    expect(service.tickets.filter((ticket) => ticket.railAt !== null)).toHaveLength(0);
    expect(admitTickets(service, 2).tickets[0]?.railAt).toBe(2);
    let next = settleStories(open);
    next.service?.tickets.forEach((ticket, index) => {
      next = playTicket(next, index, Math.max(next.service?.lastAt ?? 0, ticket.arrival + 5));
    });
    const before = next.coins;
    const ended = must(next, { type: "endService", at: next.service?.lastAt ?? 0 });
    const entry = ended.log[ended.log.length - 1];
    if (entry?.kind !== "service") throw new Error("no service log");
    expect(entry.passed).toBe(true);
    expect(entry.handledShare).toBe(1);
    expect(entry.teamTickets).toBe(0);
    expect(entry.score).toBeGreaterThanOrEqual(90);
    expect(ended.coins).toBeGreaterThan(before + 20);
    expect(ended.passes.line).toBe(1);
    expect(ended.service).toBeNull();
    expect(
      reduce(ended, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: [] } }),
    ).toBe(ended);
  });

  it("lets the team finish a service nobody touched, as a kind soft fail", () => {
    const state = withShiftBoard(lineCook());
    const offer = state.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = settleStories(
      must(state, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: [] } }),
    );
    expect(reduce(open, { type: "endService", at: 30 })).toBe(open);
    const ended = must(open, { type: "endService", at: 240 });
    const entry = ended.log[ended.log.length - 1];
    if (entry?.kind !== "service") throw new Error("no service log");
    expect(entry.passed).toBe(false);
    expect(entry.handledShare).toBe(0);
    expect(entry.teamTickets).toBe(6);
    expect(entry.feedback).toContain("The team carried tonight. Let's cook more of it together tomorrow.");
    expect(entry.reward.outcome).toBe("soft-fail");
    expect(entry.reward.reputation).toBe(0);
    expect(ended.reputation).toBe(open.reputation);
    expect(ended.coins).toBe(open.coins + 20 + Math.round(20 * 0.4));
    expect(ended.story.queue).toContain("ch-team-finish");
  });

  it("keeps a missed handled share a kind soft fail on Challenging too", () => {
    const state = withShiftBoard(lineCook({}, "challenging"));
    const offer = state.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = settleStories(
      must(state, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: [] } }),
    );
    const at = open.service?.plan.lengthSeconds ?? 0;
    const ended = must(open, { type: "endService", at });
    const entry = ended.log[ended.log.length - 1];
    if (entry?.kind !== "service") throw new Error("no service log");
    expect(entry.reward.outcome).toBe("soft-fail");
    expect(entry.reward.reputation).toBe(0);
    expect(entry.reward.coins).toBeGreaterThan(0);
    expect(ended.reputation).toBe(open.reputation);
  });

  it("keeps the assist cap on a plating card that was plated with help", () => {
    const head = settleStories(newTestGame({ start: "head" }));
    const dish = dishById("dal-tadka");
    const helped = cookDish(settleStories(must(head, { type: "startPractice", dishId: dish.id })), {
      ...GOOD_COOK,
      assisted: true,
    });
    expect(helped.platingCards[0]?.assisted).toBe(true);
    const capped = helped.activeRun?.plated?.result.accuracy ?? 1;
    expect(scoreQuick(helped, dish, { kind: "plate", wiped: true }, null)).toEqual({
      accuracy: capped,
      assisted: true,
    });
    const own = cookDish(settleStories(must(head, { type: "startPractice", dishId: dish.id })));
    expect(own.platingCards[0]?.assisted).toBe(false);
    expect(scoreQuick(own, dish, { kind: "plate", wiped: true }, null)?.accuracy).toBeGreaterThan(capped);
  });

  it("keeps a short rail on Relaxed with no clock, and the team can finish whenever", () => {
    const state = withShiftBoard(lineCook({}, "relaxed"));
    const offer = state.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = settleStories(
      must(state, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: [] } }),
    );
    expect(open.service?.plan.lengthSeconds).toBe(0);
    expect(open.service?.tickets.filter((ticket) => ticket.railAt !== null)).toHaveLength(2);
    const played = playTicket(open, 0, 500);
    expect(played.service?.tickets[2]?.railAt).toBe(500);
    const record = quickRecordFor(played, 1, 0);
    expect(record).not.toBeNull();
    const ended = must(played, { type: "endService", at: 600 });
    const entry = ended.log[ended.log.length - 1];
    if (entry?.kind !== "service") throw new Error("no service log");
    expect(entry.averageOnTime).toBeLessThan(1);
    expect(entry.passed).toBe(true);
  });
});
