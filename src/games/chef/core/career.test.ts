import { describe, expect, it } from "vitest";
import { CUISINE_IDS } from "../content/cuisine";
import type { GameState } from "./gameState";
import { entriesFor } from "./log";
import { emptyMastery } from "./mastery";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { testStartIssues } from "./rung";
import { cookDish, must, newTestGame, playTicket, settleStories, type CookPlan } from "./testPlaythrough";

const ALL_MET = [...CUISINE_IDS];

function student(overrides: Partial<GameState> = {}): GameState {
  return { ...settleStories(newTestGame()), ...overrides };
}

function playTestDay(state: GameState, plan?: CookPlan): GameState {
  let next = cookDish(state, plan);
  for (let guard = 0; guard < 3 && next.testDay !== null; guard += 1)
    next = cookDish(settleStories(must(next, { type: "startNextTestDish" })), plan);
  return settleStories(next);
}

describe("the Cookery Student year", () => {
  it("offers lessons in order, one a day, and never on Family Meal", () => {
    let state = student();
    const seen: string[] = [];
    for (let day = 1; day <= 7; day += 1) {
      if (state.board.lesson !== null) seen.push(state.board.lesson.cuisine);
      state = settleStories(reduce(state, { type: "endDay" }));
    }
    expect(seen).toEqual(["indian", "indian", "indian", "indian", "indian", "indian"]);
    expect(student({ calendar: { day: 7, hoursLeft: 10 } }).board.day).toBe(1);
  });

  it("lets the player decline a lesson and practise instead", () => {
    const state = student();
    const declined = must(state, { type: "declineLesson" });
    expect(declined.board.lesson).toBeNull();
    expect(reduce(declined, { type: "startLesson" })).toBe(declined);
    const practice = must(declined, { type: "startPractice", dishId: "jollof-rice" });
    expect(practice.activeRun?.purpose.kind).toBe("practice");
    expect(reduce(declined, { type: "startPractice", dishId: "poulet-yassa" })).toBe(declined);
  });

  it("opens the Graduation Practical after six lessons and reputation 15, and promotes on a pass", () => {
    const ready = student({ mentorsMet: ALL_MET, reputation: 18 });
    expect(testStartIssues(student({ reputation: 18 }), "graduation")).not.toEqual([]);
    expect(testStartIssues(ready, "graduation")).toEqual([]);
    expect(
      reduce(ready, {
        type: "startTest",
        test: "graduation",
        dishIds: ["dal-tadka", "chana-masala", "miso-soup"],
      }),
    ).toBe(ready);
    const started = must(ready, {
      type: "startTest",
      test: "graduation",
      dishIds: ["dal-tadka", "jollof-rice", "miso-soup"],
    });
    expect(started.calendar.hoursLeft).toBe(1);
    const passed = playTestDay(started);
    expect(passed.rung).toBe("line");
    expect(passed.reputation).toBe(18 + 3);
    expect(passed.story.seen).toContain("ch-graduation");
    expect(passed.log.some((entry) => entry.kind === "test" && entry.passed)).toBe(true);
  });

  it("lets a missed test be retried tomorrow with no penalty", () => {
    const ready = student({ mentorsMet: ALL_MET, reputation: 18 });
    const sloppy: CookPlan = {
      chopOffset: 300,
      sizzleHeat: 5,
      followShare: 0.1,
      wipe: false,
      assisted: false,
    };
    const started = must(ready, {
      type: "startTest",
      test: "graduation",
      dishIds: ["dal-tadka", "jollof-rice", "miso-soup"],
    });
    const missed = playTestDay(started, sloppy);
    expect(missed.rung).toBe("student");
    const entry = missed.log.find((item) => item.kind === "test");
    expect(entry?.kind === "test" && entry.feedback.length).toBeGreaterThan(0);
    const tomorrow = settleStories(reduce(missed, { type: "endDay" }));
    expect(testStartIssues(tomorrow, "graduation")).toEqual([]);
  });
});

describe("the line, sous and head chef rungs", () => {
  it("opens the Station Test after five line services, Confident in two cuisines, reputation 35", () => {
    const line = student({
      rung: "line",
      reputation: 36,
      passes: { line: 5, sous: 0, head: 0 },
      mastery: { ...emptyMastery(0), indian: 4, italian: 4 },
    });
    expect(testStartIssues(line, "station")).toEqual([]);
    const opened = settleStories(must(line, { type: "startStationTest", cuisine: "indian" }));
    expect(opened.service?.kind).toBe("station-test");
    expect(opened.service?.tickets).toHaveLength(4);
    expect(opened.service?.plan.minimum).toBe(72);
    let played = opened;
    opened.service?.tickets.forEach((ticket, index) => {
      played = playTicket(played, index, Math.max(played.service?.lastAt ?? 0, ticket.arrival + 4));
    });
    const ended = settleStories(must(played, { type: "endService", at: played.service?.lastAt ?? 0 }));
    expect(ended.rung).toBe("sous");
    expect(ended.story.seen).toEqual(expect.arrayContaining(["ch-station-test", "ch-sous"]));
  });

  it("asks a sous chef for a fair special, and pays a sell-out bonus with a reputation point", () => {
    const sous = settleStories(
      reduce(student({ rung: "sous", mastery: emptyMastery(4) }), { type: "endDay" }),
    );
    const offer = sous.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    expect(offer.cuisines).toHaveLength(2);
    expect(
      reduce(sous, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: [] } }),
    ).toBe(sous);
    expect(
      reduce(sous, {
        type: "startShift",
        offerId: offer.id,
        setup: { special: { dishId: "jollof-rice", price: 30 }, helpers: [] },
      }),
    ).toBe(sous);
    const open = settleStories(
      must(sous, {
        type: "startShift",
        offerId: offer.id,
        setup: { special: { dishId: "jollof-rice", price: 5 }, helpers: [] },
      }),
    );
    expect(open.service?.staff.map((member) => member.staffId)).toEqual(["teo"]);
    const ended = settleStories(must(open, { type: "endService", at: 240 }));
    const entry = ended.log[ended.log.length - 1];
    if (entry?.kind !== "service" || entry.special === null) throw new Error("no special");
    expect(entry.special.sold).toBe(12);
    expect(entry.special.soldOut).toBe(true);
    expect(entry.special.bonus).toBe(Math.round(0.5 * (5 - 2) * 12));
    expect(Object.keys(entry.special).sort()).toEqual(["bonus", "sold", "soldOut", "special"]);
    const reloaded = parseSave(serialize(ended));
    if (!reloaded.ok) throw new Error(reloaded.error);
    expect(reloaded.state).toEqual(ended);
    expect(ended.story.seen).toContain("ch-first-special");
  });

  it("needs a six-dish menu and two helpers before a head chef service", () => {
    const head = settleStories(newTestGame({ start: "head" }));
    expect(head.rung).toBe("head");
    expect(head.reputation).toBe(60);
    expect(head.coins).toBe(300);
    const offer = head.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const setup = { special: null, helpers: ["lin", "yaw"] };
    expect(reduce(head, { type: "startShift", offerId: offer.id, setup })).toBe(head);
    const menu = ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"];
    expect(reduce(head, { type: "setMenu", dishIds: menu.slice(0, 5) })).toBe(head);
    expect(reduce(head, { type: "setMenu", dishIds: [...menu.slice(0, 5), "poulet-yassa"] })).toBe(head);
    const written = settleStories(must(head, { type: "setMenu", dishIds: menu }));
    expect(written.story.seen).toContain("ch-first-menu");
    expect(
      reduce(written, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: ["lin"] } }),
    ).toBe(written);
    expect(
      reduce(written, {
        type: "startShift",
        offerId: offer.id,
        setup: { special: null, helpers: ["teo", "lin"] },
      }),
    ).toBe(written);
    const open = must(written, { type: "startShift", offerId: offer.id, setup });
    expect(open.service?.tickets).toHaveLength(10);
    expect(
      open.service?.tickets.every((ticket) => ticket.dishes.every((dish) => menu.includes(dish.dishId))),
    ).toBe(true);
  });

  it("lets helpers on a station cook ready steps after eight seconds", () => {
    const head = settleStories(
      must(settleStories(newTestGame({ start: "head" })), {
        type: "setMenu",
        dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"],
      }),
    );
    const offer = head.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = settleStories(
      must(head, {
        type: "startShift",
        offerId: offer.id,
        setup: { special: null, helpers: ["lin", "nilufar"] },
      }),
    );
    const placed = must(open, { type: "assignStaff", staffId: "nilufar", station: "board" });
    const ticket = placed.service?.tickets.find((entry) =>
      entry.dishes.some((dish) => dish.dishId !== "elote"),
    );
    if (ticket === undefined) throw new Error("no ticket");
    const dishIndex = ticket.dishes.findIndex((dish) => dish.dishId !== "elote");
    const slot = { ticketId: ticket.id, dishIndex };
    const at = Math.max(ticket.arrival, 0) + 4;
    expect(reduce(placed, { type: "staffStep", slot, at })).toBe(placed);
    const helped = must(placed, { type: "staffStep", slot, at: ticket.arrival + 9 });
    const step = helped.service?.tickets.find((entry) => entry.id === ticket.id)?.dishes[dishIndex]?.steps[0];
    expect(step).toEqual({ accuracy: 0.75, by: "staff", assisted: false });
  });

  it("delivers a private order once every dish is cooked, and counts it toward head chef passes", () => {
    let head = settleStories(newTestGame({ start: "head", trait: "dreamer" }));
    for (
      let day = 0;
      day < 10 && !head.gigs.offers.some((offer) => offer.clientId === "netball-supper");
      day += 1
    )
      head = settleStories(reduce(head, { type: "endDay" }));
    const offer = head.gigs.offers.find((entry) => entry.clientId === "netball-supper");
    if (offer === undefined) throw new Error("no netball order");
    const accepted = must(head, { type: "acceptOffer", offerId: offer.id });
    expect(reduce(accepted, { type: "startOrderDish", gigId: offer.id, dishId: "kelewele" })).not.toBe(
      accepted,
    );
    const first = cookDish(
      settleStories(must(accepted, { type: "startOrderDish", gigId: offer.id, dishId: "chana-masala" })),
    );
    expect(first.orderDishes).toHaveLength(1);
    expect(reduce(first, { type: "startOrderDish", gigId: offer.id, dishId: "chana-masala" })).toBe(first);
    const tomorrow = settleStories(reduce(first, { type: "endDay" }));
    const second = cookDish(
      settleStories(must(tomorrow, { type: "startOrderDish", gigId: offer.id, dishId: "minestrone" })),
    );
    const order = entriesFor(second.log, second.activeRun?.id ?? "").find((entry) => entry.kind === "order");
    if (order?.kind !== "order") throw new Error("no order result");
    expect(order.evaluation.passed).toBe(true);
    expect(order.evaluation.spend).toBe(4);
    expect(second.gigs.active).toHaveLength(0);
    expect(second.orderDishes).toHaveLength(0);
    expect(second.passes.head).toBe(1);
  });
});
