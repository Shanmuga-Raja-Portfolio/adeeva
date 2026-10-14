import { describe, expect, it } from "vitest";
import type { TraitId } from "../../../engine/trait";
import { CLIENTS } from "../content/client";
import { chopItem } from "./cookActions";
import type { GameState } from "./gameState";
import { entriesFor, type DishLogEntry } from "./log";
import { clientIsEligible, eligibleClients } from "./offers";
import { reduce } from "./reduce";
import { staffSkill } from "./staffing";
import { staffById } from "./catalog";
import { toleranceFor } from "./tolerance";
import { settleChefReward } from "./rewards";
import { visibleNextTrends } from "../../../engine/trendMarket";
import { cookDish, must, newTestGame, perfectChop, settleStories } from "./testPlaythrough";

function headChef(trait: TraitId, reputation = 80): GameState {
  return { ...settleStories(newTestGame({ trait, start: "head" })), reputation };
}

function lessonReward(trait: TraitId) {
  const done = cookDish(settleStories(must(settleStories(newTestGame({ trait })), { type: "startLesson" })));
  const entry = entriesFor(done.log, done.activeRun?.id ?? "").find(
    (item): item is DishLogEntry => item.kind === "dish",
  );
  if (entry?.reward == null) throw new Error("no reward");
  return entry.reward;
}

describe("trait perks", () => {
  it("Perfectionist makes every station 20% more forgiving", () => {
    const calm = headChef("dreamer");
    const steady = headChef("perfectionist");
    for (const step of ["chop", "sizzle", "simmer", "taste", "plate"] as const)
      expect(toleranceFor(steady, step)).toBeCloseTo(toleranceFor(calm, step) * 1.2);
  });

  it("tools stack with traits and difficulty", () => {
    const state = { ...headChef("perfectionist"), upgrades: ["knife-roll" as const] };
    expect(toleranceFor(state, "chop")).toBeCloseTo(1.2 * 1.15);
    expect(
      toleranceFor({ ...state, profile: { ...state.profile, difficulty: "relaxed" } }, "chop"),
    ).toBeCloseTo(1.2 * 1.15 * 1.3);
  });

  it("Dreamer earns colour on the plate for three garnish colours or a bold dish", () => {
    expect(lessonReward("dreamer").lines.map((line) => line.label)).not.toContain("Colour on the plate");
    const state = settleStories(newTestGame({ trait: "dreamer" }));
    const terms = {
      passed: true,
      score: 90,
      stars: 5,
      fee: 40,
      late: false,
      tags: ["comforting" as const],
      colourCount: 2,
    };
    const label = (reward: ReturnType<typeof settleChefReward>) => reward.lines.map((line) => line.label);
    expect(label(settleChefReward(state, terms))).not.toContain("Colour on the plate");
    expect(label(settleChefReward(state, { ...terms, colourCount: 3 }))).toContain("Colour on the plate");
    expect(label(settleChefReward(state, { ...terms, tags: ["bold"] }))).toContain("Colour on the plate");
    const charmer = settleStories(newTestGame({ trait: "charmer" }));
    expect(label(settleChefReward(charmer, { ...terms, colourCount: 3 }))).not.toContain(
      "Colour on the plate",
    );
  });

  it("Charmer earns a tip and keeps reputation on a soft fail", () => {
    expect(lessonReward("charmer").lines.map((line) => line.label)).toContain("Charmer tip");
    const sloppy = cookDish(
      settleStories(must(settleStories(newTestGame({ trait: "charmer" })), { type: "startLesson" })),
      {
        chopOffset: 400,
        sizzleHeat: 5,
        followShare: 0.2,
        wipe: false,
        assisted: false,
      },
    );
    const entry = entriesFor(sloppy.log, sloppy.activeRun?.id ?? "").find(
      (item): item is DishLogEntry => item.kind === "dish",
    );
    expect(entry?.reward?.outcome).toBe("soft-fail");
    expect(entry?.reward?.reputation).toBe(0);
  });

  it("Charmer's team cooks a little better, never above the helper cap", () => {
    const lin = staffById("lin");
    if (lin === undefined) throw new Error("missing Lin");
    expect(staffSkill(lin, "board", "dreamer")).toBe(0.7);
    expect(staffSkill(lin, "board", "charmer")).toBe(0.72);
    expect(staffSkill(lin, "hob", "charmer")).toBe(0.8);
  });

  it("Trendsetter sees next week's cravings early and earns more from a craving", () => {
    const state = headChef("trendsetter");
    expect(visibleNextTrends(state)).toEqual(state.trends.next);
    expect(visibleNextTrends(headChef("dreamer"))).toBeNull();
    const hot = state.trends.current[0] ?? "bold";
    const reward = settleChefReward(state, {
      passed: true,
      score: 90,
      stars: 5,
      fee: 50,
      late: false,
      tags: [hot],
      colourCount: 0,
    });
    expect(reward.lines.map((line) => line.label)).toEqual(
      expect.arrayContaining(["Town craving", "Trendsetter eye"]),
    );
    expect(reward.trendMatches).toEqual([hot]);
  });

  it("Perfectionist hears from Bastien after an unassisted chop with every mark perfect", () => {
    const state = settleStories(
      must(settleStories(newTestGame({ trait: "perfectionist" })), { type: "startLesson" }),
    );
    const ready = cookUntilChop(state);
    const chopped = chopItem(ready, 0, perfectChop(2));
    expect(chopped.story.queue).toContain("ch-trait-perfectionist");
    const helped = chopItem(ready, 0, { ...perfectChop(2), assisted: true });
    expect(helped.story.queue).not.toContain("ch-trait-perfectionist");
  });
});

function cookUntilChop(state: GameState): GameState {
  const placed = ["toor-dal", "ghee", "cumin-seeds", "garlic", "turmeric"].reduce(
    (next, ingredientId) => reduce(next, { type: "placeIngredient", ingredientId }),
    reduce(state, { type: "goToStage", stage: "mise" }),
  );
  return reduce(placed, { type: "goToStage", stage: "cook" });
}

describe("trait-gated clients", () => {
  it("each gated client only knocks for its own trait, from reputation 60 as head chef", () => {
    const gated = CLIENTS.filter((client) => client.traitGate !== undefined);
    expect(gated.map((client) => client.traitGate)).toEqual([
      "dreamer",
      "perfectionist",
      "trendsetter",
      "charmer",
    ]);
    for (const client of gated) {
      const own = client.traitGate ?? "dreamer";
      expect(clientIsEligible(client, headChef(own, 60))).toBe(true);
      expect(clientIsEligible(client, headChef(own, 59))).toBe(false);
      const other: TraitId = own === "dreamer" ? "charmer" : "dreamer";
      expect(clientIsEligible(client, headChef(other, 99))).toBe(false);
    }
  });

  it("no private orders reach a student, and reputation opens the bigger orders", () => {
    expect(eligibleClients(settleStories(newTestGame()))).toEqual([]);
    const ids = eligibleClients(headChef("dreamer", 60)).map((client) => client.id);
    expect(ids).toContain("netball-supper");
    expect(ids).not.toContain("grandpa-tomasz");
    expect(eligibleClients(headChef("dreamer", 80)).map((client) => client.id)).toContain("hollis-dinner");
  });

  it("queues the trait beat when a gated client's offer arrives", () => {
    let state = headChef("charmer", 99);
    for (
      let day = 0;
      day < 20 && !state.gigs.offers.some((offer) => offer.clientId === "thursday-table");
      day += 1
    )
      state = settleStories({ ...reduce(state, { type: "endDay" }), reputation: 99 });
    expect(state.gigs.offers.some((offer) => offer.clientId === "thursday-table")).toBe(true);
    expect(state.story.seen).toContain("ch-trait-charmer");
  });
});
