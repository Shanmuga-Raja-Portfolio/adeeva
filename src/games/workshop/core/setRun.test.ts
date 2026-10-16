import { describe, expect, it } from "vitest";
import { stageHours } from "./hourCost";
import { designJoints, designParts, designSurfaces, runPieces } from "./pieceParts";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { NOOK_PLAN, playSetToFloor, playSetUntil, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import { cutKey } from "./sawRecord";
import { setPartId } from "./setPartId";
import { TWIN_ECHO_PENALTY } from "./twinSaw";
import { dispatchAll, runOf, sawActions } from "./testPlaythrough";

const start = () => dispatchAll(showroomTestGame(), [{ type: "chooseFairTheme", themeId: "orchard-picnic" }]);

describe("starting a matched set", () => {
  it("opens a set run with no client, a fair brief and a fresh set id", () => {
    const state = reduce(start(), { type: "startSet", templateId: "breakfast-nook" });
    const run = runOf(state);
    expect(run.gigId).toBeNull();
    expect(run.purpose).toEqual({
      kind: "set",
      setId: "set-1",
      templateId: "breakfast-nook",
      setJoint: "peg",
    });
    expect(run.brief.requiredTags).toEqual(["rustic", "natural"]);
    expect(run.brief.deadlineDay).toBe(13);
    expect(state.showroom?.nextSetNumber).toBe(2);
    expect(state.story.queue).toContain("ww-first-set");
    expect(parseSave(serialize(state)).ok).toBe(true);
  });

  it("namespaces every part, joint and surface by piece", () => {
    const run = runOf(reduce(start(), { type: "startSet", templateId: "breakfast-nook" }));
    expect(runPieces(run).map((piece) => piece.name)).toEqual([
      "Breakfast Table",
      "Dining Chair 1",
      "Dining Chair 2",
    ]);
    expect(designParts(run).map((part) => part.id)).toContain("2:seat");
    expect(designParts(run)).toHaveLength(7 + 8 + 8);
    expect(designSurfaces(run).map((part) => part.id)).toEqual([
      "0:top",
      "1:seat",
      "1:back",
      "2:seat",
      "2:back",
    ]);
    const show = designJoints(run).filter((joint) => joint.show);
    expect(show.every((joint) => joint.kind === "peg")).toBe(true);
  });

  it("uses the set joint on show joints only", () => {
    const state = dispatchAll(start(), [
      { type: "startSet", templateId: "breakfast-nook" },
      { type: "goToStage", stage: "design" },
      { type: "chooseSetJoint", kind: "comb" },
    ]);
    const joints = designJoints(runOf(state));
    expect(joints.filter((joint) => joint.show).every((joint) => joint.kind === "comb")).toBe(true);
    expect(
      joints.filter((joint) => joint.baseId.startsWith("slot")).every((joint) => joint.kind === "slot"),
    ).toBe(true);
  });

  it("applies one choice per slot to every piece that has it", () => {
    const state = playSetUntil(start(), NOOK_PLAN, "saw");
    const run = runOf(state);
    expect(run.design.options).toEqual({
      edge: "rounded-edge",
      legs: "straight-legs",
      accent: "heart-cutout",
    });
    expect(run.design.productId).toBeNull();
  });
});

describe("set hours and twins", () => {
  it("costs 2 hours of sawing per piece and 1 for a twin, 2 of joining per piece", () => {
    const run = runOf(playSetUntil(start(), NOOK_PLAN, "saw"));
    expect(stageHours(run, "saw")).toBe(2 + 2 + 1);
    expect(stageHours(run, "join")).toBe(6);
    expect(stageHours(run, "sand")).toBe(1);
    expect(stageHours(run, "finish")).toBe(1);
    expect(stageHours({ ...run, cushion: { fabricId: "sage-linen", seam: null } }, "finish")).toBe(2);
  });

  it("saws a twin like the first, a little less sharply", () => {
    const atSaw = playSetUntil(start(), NOOK_PLAN, "saw");
    const firstChair = sawActions(atSaw, "trace").filter(
      (action) => action.type === "sawCut" && action.partId.startsWith("1:"),
    );
    const sawn = dispatchAll(atSaw, firstChair);
    const run = runOf(sawn);
    const echoed = reduce(sawn, { type: "sawLikeFirst", partId: "2:seat" });
    expect(echoed).not.toBe(sawn);
    const first = run.cuts[cutKey(setPartId(1, "seat"), 0)]?.accuracy ?? 0;
    expect(runOf(echoed).cuts[cutKey("2:seat", 0)]?.accuracy).toBeCloseTo(first - TWIN_ECHO_PENALTY, 6);
    expect(reduce(echoed, { type: "sawLikeFirst", partId: "2:seat" })).toBe(echoed);
    expect(reduce(atSaw, { type: "sawLikeFirst", partId: "2:seat" })).toBe(atSaw);
    expect(reduce(sawn, { type: "sawLikeFirst", partId: "1:seat" })).toBe(sawn);
  });

  it("can be set aside before the first saw line, never after", () => {
    const atSaw = playSetUntil(start(), NOOK_PLAN, "saw");
    expect(reduce(atSaw, { type: "setAside" }).activeRun).toBeNull();
    const cut = dispatchAll(atSaw, sawActions(atSaw, "trace").slice(0, 1));
    expect(reduce(cut, { type: "setAside" })).toBe(cut);
  });
});

describe("finishing a set", () => {
  it("puts the set on the floor and never touches the log or deliveries", () => {
    const before = start();
    const floored = playSetToFloor(before, { ...READING_PLAN, cushion: "sage-linen" });
    expect(floored.delivered).toBe(before.delivered);
    expect(floored.log).toEqual(before.log);
    const set = floored.showroom?.floor[0];
    expect(set?.templateId).toBe("reading-corner");
    expect(set?.pieces.map((piece) => piece.productId)).toEqual(["bookshelf", "footstool"]);
    expect(set?.cushion).toBe("sage-linen");
    expect(set?.mode).toBe("sale");
    expect(set?.stats.quality).toBeGreaterThan(90);
    expect(runOf(floored).stage).toBe("done");
    expect(parseSave(serialize(floored)).ok).toBe(true);
  });

  it("charges the finish once per piece and the fabric once per seat", () => {
    const atFinish = playSetUntil(start(), NOOK_PLAN, "finish");
    const finished = dispatchAll(atFinish, [{ type: "chooseFinish", finishId: "beeswax", paint: null }]);
    expect(atFinish.coins - finished.coins).toBe(5 * 3);
    const cushioned = reduce(finished, { type: "chooseCushion", fabricId: "sky-gingham" });
    expect(finished.coins - cushioned.coins).toBe(11 * 2);
  });

  it("keeps extras on their own piece and refuses wheels on a chair", () => {
    const atFinish = playSetUntil(start(), NOOK_PLAN, "finish");
    const knob = reduce(atFinish, { type: "addExtra", extraId: "wood-knob", x: 200, y: 150, piece: 1 });
    expect(runOf(knob).extras[0]?.piece).toBe(1);
    expect(reduce(atFinish, { type: "addExtra", extraId: "little-wheels", x: 200, y: 150, piece: 1 })).toBe(
      atFinish,
    );
    expect(
      reduce(atFinish, { type: "addExtra", extraId: "little-wheels", x: 200, y: 150, piece: 0 }),
    ).not.toBe(atFinish);
    expect(reduce(atFinish, { type: "addExtra", extraId: "wood-knob", x: 200, y: 150, piece: 3 })).toBe(
      atFinish,
    );
  });

  it("is deterministic", () => {
    expect(playSetToFloor(start(), NOOK_PLAN)).toEqual(playSetToFloor(start(), NOOK_PLAN));
  });
});
