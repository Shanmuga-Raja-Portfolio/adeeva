import { describe, expect, it } from "vitest";
import { canEndDay } from "./calendar";
import { canConfirmCollection } from "./collectionBoard";
import { canAddToCollection } from "./collectionPiece";
import type { CollectionBrief } from "./collectionState";
import type { GameState } from "./gameState";
import { canRestLine } from "./launchSeason";
import {
  buyLineGems,
  collectionTestGame,
  confirmBoard,
  endDayOnce,
  LINE_PLAN,
  pickFirstTheme,
  playLinePiece,
  playWholeLine,
  shootLookbook,
  stagedLaunch,
  suggestedBrief,
  toLanternNight,
} from "./linePlaythrough";
import { reduce } from "./reduce";
import { setAsideIssue } from "./runLifecycle";
import { parseSave, serialize } from "./save";
import { GOOD_PLAN, lastGigId, playRunTo, withOrder } from "./testPlaythrough";

function loads(state: GameState): boolean {
  return parseSave(serialize(state)).ok;
}

function stoneLine(): GameState {
  const themed = pickFirstTheme(collectionTestGame());
  const brief: CollectionBrief = {
    ...suggestedBrief(themed),
    products: ["stone-drops", "stone-pendant", "charm-bracelet"],
  };
  return buyLineGems(confirmBoard(themed, brief));
}

function pendantCarried(stage: "polish" | "join"): GameState {
  const drops = playLinePiece(stoneLine(), 0);
  const bracelet = playLinePiece(endDayOnce(drops), 2);
  const onBench = reduce(endDayOnce(bracelet), { type: "startCollectionPiece", slot: 1 });
  return playRunTo(onBench, LINE_PLAN, stage);
}

describe("a line piece carried past the Launch", () => {
  it("keeps the stone it took, so every save loads and the piece joins next season's line", () => {
    const pendant = pendantCarried("polish");
    expect(pendant.activeRun?.potStones).toEqual([2]);
    const taken = pendant.collection?.stonePot[2];
    const launched = stagedLaunch(toLanternNight(pendant));
    expect(loads(launched)).toBe(true);
    expect(launched.collection?.stonePot).toEqual([taken]);
    expect(launched.activeRun?.potStones).toEqual([0]);
    const nextSeason = endDayOnce(endDayOnce(launched));
    expect(nextSeason.collection?.seasonNumber).toBe(2);
    expect(loads(nextSeason)).toBe(true);
    expect(nextSeason.collection?.stonePot).toEqual([taken]);
    const bought = buyLineGems(confirmBoard(pickFirstTheme(nextSeason)));
    expect(bought.collection?.stonePot[0]).toEqual(taken);
    expect(bought.activeRun?.potStones).toEqual([0]);
    expect(loads(bought)).toBe(true);
    const added = reduce(playRunTo(bought, LINE_PLAN, "review"), { type: "addToCollection" });
    const piece = added.collection?.pieces.find((entry) => entry.look.productId === "stone-pendant");
    expect(piece?.potStones).toHaveLength(1);
    expect(piece?.potStones[0]?.tint).toBe(taken?.tint);
  });

  it("asks the new board for the carried piece's stone, and Osei suggests it", () => {
    const carried = pendantCarried("join");
    const stoneId = carried.activeRun?.design.stoneId;
    const nextSeason = pickFirstTheme(endDayOnce(endDayOnce(stagedLaunch(toLanternNight(carried)))));
    const suggested = suggestedBrief(nextSeason);
    expect(suggested.hero).toBe(stoneId);
    const other = suggested.hero === "sky-glass" ? "sea-glass" : "sky-glass";
    const swapped = { ...suggested, hero: other } as const;
    const check = canConfirmCollection(nextSeason, swapped);
    expect(check.ok).toBe(false);
    expect(check.reasons.join(" ")).toContain("on your bench joins this line");
    const kept = buyLineGems(confirmBoard(nextSeason));
    expect(playRunTo(kept, LINE_PLAN, "review").activeRun?.stage).toBe("review");
  });

  it("won't rest the line while the carried piece waits, and lets it be set aside before a new board", () => {
    const nextSeason = endDayOnce(endDayOnce(stagedLaunch(toLanternNight(pendantCarried("polish")))));
    expect(nextSeason.collection?.brief).toBeNull();
    expect(canRestLine(nextSeason).ok).toBe(false);
    expect(reduce(nextSeason, { type: "restLine" })).toBe(nextSeason);
    const reviewed = playRunTo(nextSeason, LINE_PLAN, "review");
    expect(canAddToCollection(reviewed).reasons).toEqual([
      "Plan this season's line on the Collection Board first.",
    ]);
    expect(setAsideIssue(nextSeason)).toBeNull();
    const setAside = reduce(nextSeason, { type: "abandonRun" });
    expect(setAside.activeRun).toBeNull();
    expect(canRestLine(setAside).ok).toBe(true);
    expect(loads(setAside)).toBe(true);
  });

  it("still refuses to set aside a cut line piece while its line is planned", () => {
    const carried = pendantCarried("join");
    expect(setAsideIssue(carried)).toBe("Finish this piece first.");
    const launched = stagedLaunch(toLanternNight(carried));
    expect(setAsideIssue(launched)).toBe("Finish this piece first.");
  });
});

describe("Pop-up Day without a Launch", () => {
  it("lets the day end once a late Launch no longer fits, carrying the line on", () => {
    const night = toLanternNight(
      shootLookbook(playWholeLine(buyLineGems(confirmBoard(pickFirstTheme(collectionTestGame()))))),
    );
    const late = withOrder(endDayOnce(night), "gran-mina");
    const worked = playRunTo(
      reduce(late, { type: "startOrder", gigId: lastGigId(late) }),
      GOOD_PLAN,
      "review",
    );
    const delivered = reduce(worked, { type: "deliver" });
    expect(delivered.calendar.hoursLeft).toBeLessThan(4);
    expect(canEndDay(delivered).ok).toBe(true);
    const next = endDayOnce(delivered);
    expect(next.collection?.seasonNumber).toBe(2);
    expect(next.collection?.carried).toBe(true);
    expect(loads(next)).toBe(true);
  });
});

describe("edited loft saves", () => {
  it("refuse seasons, grace and pieces that the game can't make", () => {
    const line = playLinePiece(endDayOnce(playLinePiece(stoneLine(), 0)), 2);
    const collection = line.collection;
    const [piece, other] = collection?.pieces ?? [];
    if (collection === null || piece === undefined || other === undefined) throw new Error("no line");
    expect(loads(line)).toBe(true);
    const edit = (changes: Partial<typeof collection>) =>
      loads({ ...line, collection: { ...collection, ...changes } });
    expect(edit({ seasonNumber: 999 })).toBe(false);
    expect(edit({ graceSeason: collection.seasonNumber + 1 })).toBe(false);
    expect(edit({ pieces: [piece, { ...other, id: piece.id }] })).toBe(false);
    expect(edit({ gemTray: [...collection.gemTray, ...collection.gemTray] })).toBe(false);
  });
});
