import { describe, expect, it } from "vitest";
import { PLOT_IDS, PLOTS } from "../content/plot";
import { homeStoryById } from "./catalog";
import type { GameState } from "./gameState";
import { homePanels, homeRoomFacts, MAP_SUGGESTION_CAP, PLAN_SUGGESTION_CAP } from "./homePanels";
import { betterKey, isEveryGold, isStreetOfHomes, keyFor, verdictFor } from "./keyWall";
import type { KeyWall, OpenHousePlan } from "./larkspur";
import {
  newShowHomeGame,
  planHome,
  planShow,
  project,
  readyHome,
  stageHome,
  startHome,
  toStagingDay,
} from "./larkspurPlaythrough";
import { achebePlan } from "./openHousePlan";
import { carefulSourcing, openHousePrize, secondHalf, visitorNotes } from "./openHousePrize";
import { plotAdvance } from "./plotProgress";
import { projectFee } from "./project";
import { reduce } from "./reduce";

const READY = planShow(readyHome(planHome(startHome(newShowHomeGame()))));

function plotAt(state: GameState, plot: number, phase = 1): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) throw new Error("No Larkspur");
  return { ...state, larkspur: { ...larkspur, plot, phase } };
}

describe("the Open House panels", { timeout: 60_000 }, () => {
  it("weigh every part as the design says", () => {
    const facts = homeRoomFacts(READY, project(READY));
    const plan = project(READY).plan;
    if (plan === null) throw new Error("No plan");
    const [flow, light, comfort, story] = homePanels(READY, project(READY), plan);
    expect(flow?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["walk", 0.5],
      ["through", 0.3],
      ["map", 0.2],
    ]);
    expect(light?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["spots", 0.6],
      ["glow", 0.2],
      ["mood", 0.2],
    ]);
    expect(comfort?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["finish", 0.5],
      ["cosy", 0.3],
      ["colour", 0.2],
    ]);
    expect(story?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["pieces", 0.4],
      ["tags", 0.2],
      ["welcome", 0.2],
      ["tour", 0.2],
    ]);
    const walk = flow?.parts.find((part) => part.id === "walk")?.value;
    expect(walk).toBe(Math.round((100 * facts.reduce((sum, fact) => sum + fact.flow, 0)) / facts.length));
    const score = (flow?.parts ?? []).reduce((sum, part) => sum + part.value * part.weight, 0);
    expect(flow?.score).toBe(Math.round(score));
  });

  it("caps Ms. Achebe's map at 80 and her welcome and tour at 70, except on Relaxed", () => {
    const plan = project(READY).plan;
    if (plan === null) throw new Error("No plan");
    const [flow, , , story] = homePanels(READY, project(READY), plan);
    expect(flow?.parts.find((part) => part.id === "map")?.value).toBe(MAP_SUGGESTION_CAP);
    expect(story?.parts.find((part) => part.id === "welcome")?.value).toBe(PLAN_SUGGESTION_CAP);
    expect(story?.parts.find((part) => part.id === "tour")?.value).toBe(PLAN_SUGGESTION_CAP);
    const own: OpenHousePlan = { ...plan, fromAchebe: false };
    const ownStory = homePanels(
      READY,
      { ...project(READY), map: { ...project(READY).map, fromAchebe: false } },
      own,
    );
    expect(ownStory[0]?.parts.find((part) => part.id === "map")?.value).toBe(100);
    expect(ownStory[3]?.parts.find((part) => part.id === "welcome")?.value).toBe(100);
    const relaxed = { ...READY, profile: { ...READY.profile, difficulty: "relaxed" as const } };
    const easy = homePanels(relaxed, project(READY), plan);
    expect(easy[0]?.parts.find((part) => part.id === "map")?.value).toBe(100);
    expect(easy[3]?.parts.find((part) => part.id === "tour")?.value).toBe(100);
  });

  it("reads the story card: the wrong music and time score less", () => {
    const story = homeStoryById(project(READY).storyId);
    const plan = achebePlan(READY, project(READY));
    const wrongMusic = plan.music === "beach-pop" ? "classic-jazz" : "beach-pop";
    const wrongTime = plan.time === "morning" ? "evening" : "morning";
    const wrong = homePanels(READY, project(READY), {
      ...plan,
      music: wrongMusic,
      time: wrongTime,
      fromAchebe: false,
    });
    expect(wrong[3]?.parts.find((part) => part.id === "welcome")?.value).toBe(30);
    expect(plan.music).toBe(story.bestMusic);
  });

  it("hangs keys from fixed bands and words verdicts kindly", () => {
    expect([54, 55, 69, 70, 84, 85, 94, 95].map(keyFor)).toEqual([
      "welcome",
      "copper",
      "copper",
      "silver",
      "silver",
      "gold",
      "gold",
      "star",
    ]);
    expect([0, 54, 55, 70, 85].map(verdictFor)).toEqual([
      "Warmly welcomed",
      "Warmly welcomed",
      "Enjoyed it",
      "Loved it",
      "Delighted",
    ]);
    expect(betterKey("gold", "copper")).toBe("gold");
    expect(betterKey(null, "copper")).toBe("copper");
    expect(betterKey("silver", "star")).toBe("star");
  });

  it("pays the second half, visitor notes and careful sourcing", () => {
    expect(secondHalf(340, 76, "standard")).toBe(Math.round(170 * (0.8 + 0.304)));
    expect(secondHalf(340, 20, "relaxed")).toBe(340 / 2);
    expect(secondHalf(340, 100, "relaxed")).toBe(Math.round(170 * 1.2));
    expect([54, 55, 60, 64, 65, 100].map(visitorNotes)).toEqual([0, 0, 1, 1, 2, 8]);
    expect(carefulSourcing({ purse: 150, added: 0, spent: 136 })).toBe(7);
    expect(carefulSourcing({ purse: 345, added: 0, spent: 200 })).toBe(52);
    expect(carefulSourcing({ purse: 150, added: 10, spent: 170 })).toBe(0);
    const lines = openHousePrize({ fee: 330, purse: 150, added: 0, spent: 136 }, 76, "standard", 1);
    expect(lines.map((line) => line.amount)).toEqual([182, 40, 7]);
  });

  it("moves along the street, offers a sister home or asks, per difficulty", () => {
    expect(plotAdvance("standard", 59, "copper")).toBe("sister");
    expect(plotAdvance("standard", 60, "copper")).toBe("choice");
    expect(plotAdvance("standard", 75, "silver")).toBe("next");
    expect(plotAdvance("challenging", 64, "silver")).toBe("sister");
    expect(plotAdvance("challenging", 70, "silver")).toBe("next");
    expect(plotAdvance("relaxed", 10, "welcome")).toBe("choice");
    expect(plotAdvance("relaxed", 90, "gold")).toBe("choice");
  });

  it("lets the player stay for a sister home or move on after a choice", () => {
    const larkspur = READY.larkspur;
    if (larkspur === null) throw new Error("No Larkspur");
    const asked: GameState = { ...READY, larkspur: { ...larkspur, choicePending: true, storyOffer: [] } };
    const moved = reduce(asked, { type: "chooseNextPlot", move: true });
    expect(moved.larkspur?.plot).toBe(2);
    expect(moved.larkspur?.storyOffer).toHaveLength(2);
    const stayed = reduce(asked, { type: "chooseNextPlot", move: false });
    expect(stayed.larkspur?.plot).toBe(1);
    expect(stayed.larkspur?.sisterNext).toBe(true);
    expect(reduce(READY, { type: "chooseNextPlot", move: true })).toBe(READY);
  });

  it("starts a sister home on the same plot with its own story beat", () => {
    const staged = stageHome(READY);
    const larkspur = staged.larkspur;
    if (larkspur === null) throw new Error("No Larkspur");
    const sister: GameState = {
      ...staged,
      larkspur: { ...larkspur, plot: 1, sisterNext: true, choicePending: false },
    };
    const started = startHome(sister);
    expect(project(started).plotId).toBe("garden-flat");
    expect(project(started).sister).toBe(true);
    expect(started.story.seen).toContain("is-sister-home");
  });

  it("raises fees by 10% in phase two and every later cycle, never compounding", () => {
    const plot = PLOTS[0];
    if (plot === undefined) throw new Error("No plot");
    expect(projectFee(plot, 1)).toBe(330);
    expect(projectFee(plot, 2)).toBe(363);
    expect(projectFee(plot, 5)).toBe(363);
    const last = plotAt(newShowHomeGame(), 6);
    expect(project(startHome(last)).plotId).toBe("larkspur-end");
    expect(project(startHome(plotAt(newShowHomeGame(), 1, 2))).fee).toBe(363);
  });

  it("plays the finale once every hook holds Silver and one holds Gold", () => {
    const silver = Object.fromEntries(PLOT_IDS.map((id) => [id, "silver"])) as KeyWall;
    expect(isStreetOfHomes(silver)).toBe(false);
    expect(isStreetOfHomes({ ...silver, "blue-door": "gold" })).toBe(true);
    expect(isStreetOfHomes({ ...silver, "blue-door": "gold", "twin-gables": "copper" })).toBe(false);
    const gold = Object.fromEntries(PLOT_IDS.map((id) => [id, "gold"])) as KeyWall;
    expect(isEveryGold(gold)).toBe(true);
    expect(isEveryGold({ ...gold, "willow-house": "star" })).toBe(true);
    expect(isEveryGold({ ...gold, "willow-house": "silver" })).toBe(false);
    const larkspur = READY.larkspur;
    if (larkspur === null) throw new Error("No Larkspur");
    const nearly = { ...READY, larkspur: { ...larkspur, keyWall: { ...gold, "garden-flat": null } } };
    const finale = stageHome(nearly);
    expect(finale.story.seen).toContain("is-street-of-homes");
  });

  it("stages with two hours, applies the prize and hangs the key", () => {
    const waited = toStagingDay(READY);
    const staged = reduce(waited, { type: "stageOpenHouse" });
    const record = staged.larkspur?.history.at(-1);
    if (record === undefined) throw new Error("No record");
    const paid = record.prize.reduce((sum, line) => sum + line.amount, 0);
    expect(staged.coins).toBe(waited.coins + paid);
    expect(staged.calendar.hoursLeft).toBe(waited.calendar.hoursLeft - 2);
    expect(staged.reputation).toBe(waited.reputation + record.reputation);
    expect(staged.larkspur?.keyWall["garden-flat"]).toBe(record.keyId);
    expect(record.notes).toHaveLength(4);
    expect(record.tip.startsWith("Next time, try ")).toBe(true);
    expect(staged.story.queue).toContain("is-first-open-house");
    expect(record.buzz).toBe(Math.round(record.overall / 10));
    expect(
      reduce({ ...waited, calendar: { ...waited.calendar, hoursLeft: 1 } }, { type: "stageOpenHouse" })
        .larkspur?.history,
    ).toHaveLength(0);
  });
});
