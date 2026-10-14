import { describe, expect, it } from "vitest";
import { TICKETS } from "../content/ticket";
import { hemOnEdge, HEM_EDGE_REASON, hemSpot } from "./alterLayout";
import { boutiqueStart, playTicketToReview } from "./boutiquePlaythrough";
import { flipSpend } from "./flipEvaluate";
import type { GameState } from "./gameState";
import { runBoard, runLayoutIssues } from "./layout";
import { panelBoard } from "./panelBoard";
import { reduce } from "./reduce";
import { runStages } from "./runStages";
import { runStageHours } from "./stageReadiness";
import { addRegularTicket, lentFind, rollTicketBrief, ticketInFlight } from "./ticketBrief";
import { ticketRewards } from "./ticketRewards";
import { dispatchAll, newTestGame, runOf, settleStories } from "./testPlaythrough";

function withTicket(state: GameState, ticketId: (typeof TICKETS)[number]["id"]): GameState {
  const ticket = TICKETS.find((entry) => entry.id === ticketId);
  if (ticket === undefined) throw new Error(ticketId);
  const [brief, rng] = rollTicketBrief(ticket, state.calendar.day, state.rng, 0);
  const id = `gig-${state.gigs.nextGigNumber}`;
  return {
    ...state,
    rng,
    gigs: {
      offers: [],
      active: [{ id, clientId: ticket.clientId, brief, acceptedDay: state.calendar.day }],
      lapsed: [],
      nextGigNumber: state.gigs.nextGigNumber + 1,
    },
  };
}

describe("mend and hem tickets", () => {
  it("use their own short stage lists", () => {
    const mend = withTicket(boutiqueStart(), "ticket-nana-bea");
    const started = reduce(mend, { type: "startFlip", gigId: mend.gigs.active[0]?.id ?? "" });
    expect(runStages(runOf(started))).toEqual([
      "brief",
      "unpick",
      "clean",
      "sew",
      "finish",
      "review",
      "done",
    ]);
    const alter = withTicket(boutiqueStart(), "ticket-ms-okafor");
    const alterRun = reduce(alter, { type: "startFlip", gigId: alter.gigs.active[0]?.id ?? "" });
    expect(runStages(runOf(alterRun))).toEqual(["brief", "unpick", "layout", "cut", "sew", "review", "done"]);
  });

  it("borrow the client's item, which never enters the stockroom and costs nothing", () => {
    const state = withTicket(boutiqueStart(), "ticket-theo");
    const gigId = state.gigs.active[0]?.id ?? "";
    const started = reduce(state, { type: "startFlip", gigId });
    const lent = runOf(started).finds[0];
    const theo = TICKETS.find((ticket) => ticket.id === "ticket-theo");
    if (theo === undefined) throw new Error("No ticket");
    expect(lent).toEqual(lentFind(gigId, theo));
    expect(lent?.price).toBe(0);
    expect(started.stock.finds.map((owned) => owned.id)).not.toContain(lent?.id);
  });

  it("plays a full mend at 0 coins, pays a flat reward and keeps one thing in use", () => {
    const state = withTicket(boutiqueStart({ seed: 5 }), "ticket-nana-bea");
    const gigId = state.gigs.active[0]?.id ?? "";
    const review = playTicketToReview(state, gigId);
    expect(runOf(review).stage).toBe("review");
    expect(flipSpend(runOf(review))).toBe(0);
    expect(review.coins).toBe(state.coins);
    expect(review.calendar.hoursLeft).toBe(10 - 4);
    const done = settleStories(reduce(review, { type: "deliver" }));
    const entry = done.log[done.log.length - 1];
    expect(entry?.kind).toBe("ticket");
    expect(entry?.reward?.outcome).toBe("pass");
    expect(done.reputation).toBe(state.reputation + 1);
    expect(done.keptInUse).toBe(state.keptInUse + 1);
    expect(done.stock.finds).toEqual(state.stock.finds);
    expect(done.story.seen).toContain("tf-first-mend");
  });

  it("plays a fresh hem along the bottom edge", () => {
    const state = withTicket(boutiqueStart({ seed: 9 }), "ticket-rosa-and-june");
    const gigId = state.gigs.active[0]?.id ?? "";
    const review = playTicketToReview(state, gigId);
    expect(runOf(review).stage).toBe("review");
    const done = reduce(review, { type: "deliver" });
    expect(done.log[done.log.length - 1]?.reward?.outcome).toBe("pass");
    expect(done.stock.scraps).toEqual(state.stock.scraps);
  });

  it("takes one hour less with the Mending Basket", () => {
    const state = withTicket(boutiqueStart(), "ticket-kofi");
    const started = reduce(state, { type: "startFlip", gigId: state.gigs.active[0]?.id ?? "" });
    const atUnpick = { ...runOf(started), stage: "unpick" as const, reachedStage: "unpick" as const };
    expect(runStageHours(atUnpick, [])).toBe(1);
    expect(runStageHours(atUnpick, ["mending-basket"])).toBe(0);
  });

  it("asks for the hem band within 2 cm of the bottom edge on every alter item, at both worn spots", () => {
    for (const ticket of TICKETS.filter((entry) => entry.kind === "alter")) {
      for (const wornSpot of [0, 1] as const) {
        const board = panelBoard([{ ...lentFind("gig-1", ticket), wornSpot }]);
        const spot = hemSpot(board);
        expect(spot, `${ticket.id} spot ${wornSpot}`).not.toBeNull();
        if (spot === null) continue;
        expect(hemOnEdge(board, spot)).toBe(true);
        expect(hemOnEdge(board, { ...spot, y: spot.y - 3 })).toBe(false);
        expect(hemOnEdge(board, { ...spot, rotation: 90 })).toBe(false);
      }
    }
  });

  it("explains a hem laid away from the edge", () => {
    const state = withTicket(boutiqueStart(), "ticket-ms-okafor");
    const atLayout = dispatchAll(state, [{ type: "startFlip", gigId: state.gigs.active[0]?.id ?? "" }]);
    const run = runOf(atLayout);
    const placed = { ...run, placements: { "hem-band": { x: 20, y: 10, rotation: 0 as const } } };
    expect(runLayoutIssues(placed).map((issue) => issue.message)).toContain(HEM_EDGE_REASON);
    const board = runBoard(run);
    expect(board.panels.length).toBeGreaterThan(0);
  });

  it("pays 40% on a soft fail, nothing on Challenging, and never lowers reputation", () => {
    const state = withTicket(boutiqueStart(), "ticket-lumi");
    const review = playTicketToReview(state, state.gigs.active[0]?.id ?? "", 0);
    const run = runOf(review);
    const brief = run.brief;
    if (brief === null) throw new Error("No brief");
    const done = reduce(review, { type: "deliver" });
    const entry = done.log[done.log.length - 1];
    expect(entry?.reward?.outcome).toBe("soft-fail");
    expect(entry?.reward?.coins).toBe(Math.round(brief.fee * 0.4));
    expect(done.reputation).toBe(state.reputation);
    const evaluation = entry?.evaluation;
    if (evaluation === undefined) throw new Error("No evaluation");
    const challenging = { difficulty: "challenging", trait: "dreamer" } as const;
    expect(ticketRewards(evaluation, brief, challenging)).toMatchObject({ coins: 0, reputation: 0 });
    expect(ticketRewards(evaluation, brief, { ...challenging, difficulty: "relaxed" }).outcome).toBe("pass");
  });

  it("pays a pass like any job: the Charmer tip and the Challenging late cut, with flat reputation", () => {
    const state = withTicket(boutiqueStart({ seed: 5 }), "ticket-nana-bea");
    const review = playTicketToReview(state, state.gigs.active[0]?.id ?? "");
    const entry = reduce(review, { type: "deliver" }).log.at(-1);
    const brief = runOf(review).brief;
    const evaluation = entry?.evaluation;
    if (brief === null || evaluation === undefined) throw new Error("No ticket result");
    const fee = Math.round(brief.fee * (0.8 + (0.4 * evaluation.score) / 100));
    const plain = ticketRewards(evaluation, brief, { difficulty: "standard", trait: "dreamer" });
    expect(plain).toMatchObject({ outcome: "pass", coins: fee, reputation: 1, buzz: 1 });
    const charmer = ticketRewards(evaluation, brief, { difficulty: "standard", trait: "charmer" });
    expect(charmer.coins).toBe(fee + Math.round(brief.fee * 0.1));
    const late = {
      ...evaluation,
      criteria: evaluation.criteria.map((criterion) =>
        criterion.id === "deadline" ? { ...criterion, passed: false } : criterion,
      ),
    };
    const lateChallenging = ticketRewards(late, brief, { difficulty: "challenging", trait: "dreamer" });
    expect(lateChallenging.coins).toBe(Math.max(0, fee - Math.round(brief.fee * 0.5)));
    expect(lateChallenging.reputation).toBe(1);
  });

  it("lets an undelivered ticket lapse without lowering reputation", () => {
    for (const difficulty of ["standard", "challenging"] as const) {
      const base = withTicket(boutiqueStart({ seed: 3 }), "ticket-nana-bea");
      const state: GameState = { ...base, profile: { ...base.profile, difficulty } };
      const gig = state.gigs.active[0];
      if (gig === undefined) throw new Error("No ticket");
      let next = state;
      while (next.gigs.active.some((entry) => entry.id === gig.id) && next.calendar.day < 30)
        next = settleStories(reduce(next, { type: "endDay" }));
      expect(next.gigs.lapsed.find((entry) => entry.gigId === gig.id)?.reputation).toBe(0);
      expect(next.reputation).toBeGreaterThanOrEqual(state.reputation);
    }
  });

  it("keeps at most one ticket in flight and always offers one when none is", () => {
    for (let seed = 1; seed < 12; seed += 1) {
      const state = boutiqueStart({ seed });
      expect(ticketInFlight(state)).toBe(true);
      const tickets = [...state.gigs.offers, ...state.gigs.active].filter(
        (entry) => entry.brief.kind !== "flip",
      );
      expect(tickets).toHaveLength(1);
      expect(addRegularTicket(state)).toBe(state);
    }
    const stall = settleStories(newTestGame());
    expect(addRegularTicket(stall)).toBe(stall);
  });
});
