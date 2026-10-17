import { describe, expect, it } from "vitest";
import type { PriceTagId } from "../content/priceTag";
import { launchThemeById } from "./catalog";
import { copyRequestCount, mostLoved } from "./copyRequests";
import type { GameState } from "./gameState";
import { addToDrawer, DRAWER_SIZE, drawerGentlePrice } from "./lineDrawer";
import { endDayOnce, lanternNightLine, stagedLaunch } from "./linePlaythrough";
import { popupHeartTotal, popupHearts, shareByAppeal } from "./popupHearts";
import { dearestTag, fairPrice, sells, tagPrice } from "./popupPrice";
import { popupBoard } from "./popupSale";
import { reduce } from "./reduce";
import type { StallPiece } from "./stallBox";
import { leaveHours } from "./hourCost";

function popupMorning(overrides = {}): GameState {
  return endDayOnce(stagedLaunch(lanternNightLine(overrides)));
}

function tagsFor(state: GameState, tag: (index: number) => PriceTagId): Record<string, PriceTagId> {
  const order = state.launch?.result?.plan.order ?? [];
  return Object.fromEntries(order.map((id, index) => [id, tag(index)]));
}

describe("Pop-up hearts", () => {
  it("gives every piece one heart and shares H − n by appeal with the largest remainder", () => {
    expect(popupHeartTotal(4, 83, false)).toBe(8);
    expect(popupHeartTotal(3, 30, false)).toBe(3);
    expect(popupHeartTotal(5, 96, true)).toBe(12);
    expect(
      shareByAppeal(
        [
          { id: "a", appeal: 100 },
          { id: "b", appeal: 100 },
          { id: "c", appeal: 100 },
        ],
        2,
      ),
    ).toEqual([1, 1, 0]);
    expect(
      shareByAppeal(
        [
          { id: "a", appeal: 90 },
          { id: "b", appeal: 210 },
        ],
        3,
      ),
    ).toEqual([1, 2]);
    const hearts = popupHearts(
      [
        { id: "a", appeal: 100 },
        { id: "b", appeal: 100 },
        { id: "c", appeal: 100 },
        { id: "d", appeal: 100 },
      ],
      83,
      false,
      "c",
    );
    expect([...hearts.values()]).toEqual([2, 2, 3, 2]);
  });

  it("sells an all-Gentle line when H = n = 3 even with appeals 140 / 140 / 20", () => {
    const hearts = popupHearts(
      [
        { id: "a", appeal: 140 },
        { id: "b", appeal: 140 },
        { id: "c", appeal: 20 },
      ],
      30,
      false,
      "z",
    );
    expect([...hearts.values()]).toEqual([1, 1, 1]);
    expect([...hearts.values()].every((count) => sells(count, "gentle"))).toBe(true);
  });

  it("prices Fair by the line base, quality, sparkle, harmony and award, with Gentle, Fair and Special tags", () => {
    const look = { productId: "stone-pendant" as const };
    const fair = fairPrice(
      { look: look as never, quality: 88, sparkle: 2 },
      { harmony: 71, silverOrBetter: true },
    );
    expect(fair).toBe(80);
    expect(
      fairPrice({ look: look as never, quality: 88, sparkle: 2 }, { harmony: 80, silverOrBetter: true }),
    ).toBe(88);
    expect(tagPrice(80, "gentle")).toBe(64);
    expect(tagPrice(80, "special")).toBe(104);
    expect(dearestTag(1)).toBe("gentle");
    expect(dearestTag(2)).toBe("fair");
    expect(dearestTag(3)).toBe("special");
  });
});

describe("the Pop-up Window", () => {
  it("opens the day after Lantern Night for 3 hours and sells pieces whose hearts reach their tags", () => {
    const morning = popupMorning();
    const board = popupBoard(morning, morning.launch?.result?.plan.order[0] ?? "");
    expect(board.every((row) => row.hearts >= 1)).toBe(true);
    const plinth = board[board.length - 1]?.piece.id ?? "";
    const tags = tagsFor(morning, () => "special");
    const popped = reduce(morning, { type: "openPopup", plinth, tags, shelf: [] });
    const popup = popped.launch?.popup;
    if (popup === null || popup === undefined) throw new Error("no popup");
    expect(popped.calendar.hoursLeft).toBe(morning.calendar.hoursLeft - 3);
    for (const entry of popup.entries) expect(entry.sold).toBe(entry.hearts >= 3);
    expect(popped.collection?.drawer.length).toBe(popup.entries.filter((entry) => !entry.sold).length);
    expect(popped.collection?.pieces).toEqual([]);
    expect(reduce(popped, { type: "openPopup", plinth, tags, shelf: [] })).toBe(popped);
  });

  it("always sells out an all-Gentle line and sells a short piece at Gentle on Relaxed", () => {
    const morning = popupMorning();
    const plinth = morning.launch?.result?.plan.order[0] ?? "";
    const gentle = reduce(morning, {
      type: "openPopup",
      plinth,
      tags: tagsFor(morning, () => "gentle"),
      shelf: [],
    });
    expect(gentle.launch?.popup?.entries.every((entry) => entry.sold)).toBe(true);
    const relaxed = popupMorning({ difficulty: "relaxed" });
    const relaxedPlinth = relaxed.launch?.result?.plan.order[0] ?? "";
    const special = reduce(relaxed, {
      type: "openPopup",
      plinth: relaxedPlinth,
      tags: tagsFor(relaxed, () => "special"),
      shelf: [],
    });
    const entries = special.launch?.popup?.entries ?? [];
    expect(entries.every((entry) => entry.sold)).toBe(true);
    expect(entries.some((entry) => entry.cameBack)).toBe(true);
  });

  it("turns spare hearts into at most 2 copy requests, pinned the next day with a 0 h preset design", () => {
    const morning = popupMorning();
    const plinth = morning.launch?.result?.plan.order[0] ?? "";
    const gentle = reduce(morning, {
      type: "openPopup",
      plinth,
      tags: tagsFor(morning, () => "gentle"),
      shelf: [],
    });
    const copies = gentle.launch?.pendingCopies ?? [];
    expect(copies.length).toBeGreaterThan(0);
    expect(copies.length).toBeLessThanOrEqual(2);
    const loved = popupBoard(morning, plinth).find((row) => row.piece.id === copies[0]?.pieceId);
    expect(copies[0]?.fee).toBe(Math.round(1.2 * (loved?.fair ?? 0)));
    const next = endDayOnce(gentle);
    const pinned = next.gigs.offers.filter((offer) => offer.brief.preset !== null);
    expect(pinned).toHaveLength(copies.length);
    expect(pinned[0]?.brief.minQuality).toBe(70);
    const themeId = morning.launch?.result?.themeId;
    if (themeId === undefined) throw new Error("no theme");
    expect(pinned[0]?.brief.requiredTags).toEqual([launchThemeById(themeId).tags[0]]);
    expect(next.story.seen).toContain("jb-copy-request");
    const accepted = reduce(next, { type: "acceptOffer", offerId: pinned[0]?.id ?? "" });
    const started = reduce(accepted, { type: "startOrder", gigId: pinned[0]?.id ?? "" });
    const run = reduce(started, { type: "goToStage", stage: "design" }).activeRun;
    if (run === null) throw new Error("no run");
    expect(run.design.metalId).toBe(copies[0]?.metalId);
    expect(leaveHours(run)).toBe(0);
    expect(reduce({ ...started, activeRun: run }, { type: "chooseMetal", metalId: "copper" }).activeRun).toBe(
      run,
    );
    expect(
      copyRequestCount([
        { pieceId: "a", hearts: 5, need: 1, sold: true },
        { pieceId: "b", hearts: 4, need: 3, sold: false },
      ]),
    ).toBe(2);
    expect(
      mostLoved([
        { pieceId: "a", hearts: 3, need: 1, sold: true },
        { pieceId: "b", hearts: 3, need: 1, sold: true },
      ]),
    ).toBe("a");
  });

  it("sells Little shelf pieces from the stall box and the Line Drawer", () => {
    const morning = popupMorning();
    const plinth = morning.launch?.result?.plan.order[0] ?? "";
    const look = morning.collection?.pieces[0]?.look;
    if (look === undefined) throw new Error("no look");
    const extra: StallPiece = {
      id: "stall-a",
      look,
      quality: 80,
      tags: ["nature"],
      colours: ["sage"],
      madeDay: 2,
    };
    const stocked = { ...morning, stallBox: [extra] };
    const popped = reduce(stocked, {
      type: "openPopup",
      plinth,
      tags: tagsFor(stocked, () => "fair"),
      shelf: ["stall-a"],
    });
    expect(popped.stallBox).toEqual([]);
    expect(popped.launch?.popup?.shelf[0]?.sold).toBe(true);
    expect(
      reduce(stocked, { type: "openPopup", plinth, tags: tagsFor(stocked, () => "fair"), shelf: ["x"] }),
    ).toBe(stocked);
  });
});

describe("the Line Drawer", () => {
  it("holds 8 pieces and sells the oldest at its Gentle price when a ninth arrives", () => {
    const morning = popupMorning();
    const look = morning.collection?.pieces[0]?.look;
    if (look === undefined) throw new Error("no look");
    const pieces = Array.from({ length: DRAWER_SIZE + 1 }, (_, index): StallPiece => ({
      id: `p${index}`,
      look,
      quality: 80,
      tags: [],
      colours: [],
      madeDay: index + 1,
    }));
    const fill = pieces.reduce(addToDrawer, { drawer: [], sold: [], coins: 0 });
    expect(fill.drawer).toHaveLength(DRAWER_SIZE);
    expect(fill.sold).toEqual(["p0"]);
    expect(fill.coins).toBe(drawerGentlePrice(pieces[0] as StallPiece));
  });
});
