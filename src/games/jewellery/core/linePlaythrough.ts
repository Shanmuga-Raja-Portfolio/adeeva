import { LAUNCH_THEMES, type LaunchThemeId } from "../content/launchTheme";
import type { Action } from "./action";
import { oseiSuggestion } from "./collectionBoard";
import type { CollectionBrief } from "./collectionState";
import type { GameState } from "./gameState";
import { lineStoneNeeds } from "./gemTray";
import type { LaunchPlan } from "./launchState";
import { oseiPage } from "./lookbook";
import type { NewGameSettings } from "./newGame";
import { reduce } from "./reduce";
import { lanternNightOf, seasonThemes } from "./seasonCalendar";
import { GOOD_PLAN, newTestGame, playRunTo, settleStories, type PiecePlan } from "./testPlaythrough";

export const LINE_PLAN: PiecePlan = { ...GOOD_PLAN, chain: "fine-chain" };

export function collectionTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleStories(newTestGame({ career: "collection", lineNameId: "moon-and-thimble", ...overrides }));
}

function must(state: GameState, action: Action): GameState {
  const next = reduce(state, action);
  if (next === state) throw new Error(`Refused: ${action.type}`);
  return next;
}

export function endDayOnce(state: GameState): GameState {
  return settleStories(must(settleStories(state), { type: "endDay" }));
}

export function endDaysUntil(state: GameState, day: number): GameState {
  let next = state;
  while (next.calendar.day < day) next = endDayOnce(next);
  return next;
}

export function pickFirstTheme(state: GameState, themeId?: LaunchThemeId): GameState {
  const collection = state.collection;
  if (collection === null) throw new Error("No loft");
  const theme = themeId ?? seasonThemes(collection.seasonNumber)[0]?.id ?? LAUNCH_THEMES[0]?.id;
  if (theme === undefined) throw new Error("No theme");
  return settleStories(must(state, { type: "pickLaunchTheme", themeId: theme }));
}

export function suggestedBrief(state: GameState): CollectionBrief {
  const collection = state.collection;
  const brief = collection === null ? null : oseiSuggestion(state, collection);
  if (brief === null) throw new Error("No suggestion");
  return brief;
}

export function confirmBoard(state: GameState, brief = suggestedBrief(state)): GameState {
  return settleStories(must(state, { type: "confirmCollection", brief }));
}

export function cheapestPicks(state: GameState): number[] {
  const collection = state.collection;
  if (collection === null || collection.brief === null) return [];
  const picks: number[] = [];
  for (const [stoneId, need] of lineStoneNeeds(collection.brief)) {
    const tints = new Map<string, number[]>();
    collection.gemTray.forEach((stone, index) => {
      if (stone.stoneId !== stoneId || stone.sold) return;
      tints.set(stone.tint, [...(tints.get(stone.tint) ?? []), index]);
    });
    const best = [...tints.values()]
      .filter((indices) => indices.length >= need)
      .map((indices) =>
        [...indices].sort(
          (a, b) => (collection.gemTray[a]?.price ?? 0) - (collection.gemTray[b]?.price ?? 0),
        ),
      )
      .sort(
        (a, b) => (collection.gemTray[a[0] ?? 0]?.price ?? 0) - (collection.gemTray[b[0] ?? 0]?.price ?? 0),
      )[0];
    picks.push(...(best ?? []).slice(0, need));
  }
  return picks;
}

export function buyLineGems(state: GameState): GameState {
  const collection = state.collection;
  if (collection === null || collection.gemTray.length === 0) return state;
  return must(state, { type: "buyGems", picks: cheapestPicks(state) });
}

export function playLinePiece(state: GameState, slot: number, plan: PiecePlan = LINE_PLAN): GameState {
  const started = must(state, { type: "startCollectionPiece", slot });
  const reviewed = playRunTo(started, plan, "review");
  return must(reviewed, { type: "addToCollection" });
}

export function freshMorning(state: GameState, hours: number): GameState {
  return state.calendar.hoursLeft >= hours ? state : endDayOnce(state);
}

export function playWholeLine(state: GameState, plan: PiecePlan = LINE_PLAN): GameState {
  const brief = state.collection?.brief;
  if (brief === undefined || brief === null) throw new Error("No board");
  return brief.products.reduce((next, _, slot) => playLinePiece(freshMorning(next, 7), slot, plan), state);
}

export function shootLookbook(state: GameState): GameState {
  const collection = state.collection;
  const page = collection === null ? null : oseiPage(collection);
  if (collection === null || page === null) throw new Error("No lookbook");
  let next = collection.pieces.reduce(
    (current, piece) =>
      must(current, {
        type: "styleLookbookPage",
        pieceId: piece.id,
        backdrop: page.backdrop,
        props: page.props,
      }),
    state,
  );
  for (const piece of collection.pieces)
    next = must(next, {
      type: "snapLookbookPage",
      pieceId: piece.id,
      lampAngle: piece.sweetSpot,
      assisted: false,
    });
  return settleStories(must(freshMorning(next, 2), { type: "closeLookbook" }));
}

export function toLanternNight(state: GameState): GameState {
  const collection = state.collection;
  if (collection === null) throw new Error("No loft");
  return endDaysUntil(state, lanternNightOf(collection));
}

export function bestPlan(state: GameState): LaunchPlan {
  const collection = state.collection;
  if (collection === null || collection.themeId === null) throw new Error("No line");
  const theme = LAUNCH_THEMES.find((entry) => entry.id === collection.themeId);
  if (theme === undefined) throw new Error("No theme");
  const order = [...collection.pieces].sort((a, b) => a.quality - b.quality).map((piece) => piece.id);
  return { order, lantern: theme.lantern, music: theme.music, card: theme.bestCard };
}

export function stagedLaunch(state: GameState, plan = bestPlan(state)): GameState {
  return settleStories(must(state, { type: "stageLaunch", ...plan }));
}

export function lanternNightLine(overrides: Partial<NewGameSettings> = {}): GameState {
  const started = confirmBoard(pickFirstTheme(collectionTestGame(overrides)));
  const lined = playWholeLine(buyLineGems(started));
  const shot = shootLookbook(lined);
  return toLanternNight(shot);
}
