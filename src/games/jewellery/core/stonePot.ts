import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import type { StoneId } from "../content/stone";
import type { CollectionState, PotStone } from "./collectionState";
import { GEM_MARKET_HOURS } from "./collectionBoard";
import { asPick, gemBudget, lineStoneNeeds } from "./gemTray";
import type { GameState } from "./gameState";
import { launchStaged } from "./launchStatus";
import type { PieceRun } from "./pieceRun";
import { lineSeason } from "./seasonCalendar";
import { withStones, type Stock } from "./stock";
import { runSeats } from "./stoneSetting";

export const POT_SHORT = "One more stone for the line!";

function gemCollection(state: GameState): CollectionState | null {
  const collection = lineSeason(state, state.calendar.day);
  if (collection === null || collection.brief === null || collection.gemTray.length === 0) return null;
  return collection.gemSpent === null && !launchStaged(state, collection) ? collection : null;
}

function pickCounts(collection: CollectionState, picks: readonly number[]): Map<StoneId, number> {
  const counts = new Map<StoneId, number>();
  for (const index of picks) {
    const stone = collection.gemTray[index];
    if (stone !== undefined) counts.set(stone.stoneId, (counts.get(stone.stoneId) ?? 0) + 1);
  }
  return counts;
}

export function picksCost(collection: CollectionState, picks: readonly number[]): number {
  return picks.reduce((sum, index) => sum + (collection.gemTray[index]?.price ?? 0), 0);
}

export function potCovers(collection: CollectionState, picks: readonly number[]): boolean {
  if (collection.brief === null) return false;
  const counts = pickCounts(collection, picks);
  return [...lineStoneNeeds(collection.brief).entries()].every(
    ([stoneId, need]) => (counts.get(stoneId) ?? 0) >= need,
  );
}

export function canBuyGems(state: GameState, picks: readonly number[]): ActionCheck {
  const collection = gemCollection(state);
  if (collection === null || collection.brief === null || state.launch === null)
    return actionCheck(["Kemi's tray isn't out right now."]);
  const valid =
    picks.every((index) => Number.isInteger(index) && collection.gemTray[index]?.sold === false) &&
    new Set(picks).size === picks.length;
  if (!valid) return actionCheck(["Pick stones from Kemi's tray."]);
  const reasons: string[] = [];
  if (!potCovers(collection, picks)) reasons.push(POT_SHORT);
  const cost = picksCost(collection, picks);
  const budget = gemBudget(collection.brief, state.launch.spot);
  if (cost > budget) reasons.push(`That's ${cost} coins, over the line's ${budget}-coin stone budget.`);
  if (cost > state.coins) reasons.push(`That costs ${cost} coins and you have ${state.coins}.`);
  if (state.calendar.hoursLeft < GEM_MARKET_HOURS)
    reasons.push("The Gem Market takes 1 hour. End the day first.");
  return actionCheck(reasons);
}

export function buyGems(state: GameState, picks: readonly number[]): GameState {
  const collection = gemCollection(state);
  if (collection === null || !canBuyGems(state, picks).ok) return state;
  const spent = spendHours(state, GEM_MARKET_HOURS);
  if (spent === null) return state;
  const chosen = new Set(picks);
  const cost = picksCost(collection, picks);
  const stonePot: PotStone[] = picks.flatMap((index) => {
    const stone = collection.gemTray[index];
    return stone === undefined ? [] : [{ ...asPick(stone), used: false }];
  });
  return {
    ...spent,
    coins: spent.coins - cost,
    collection: {
      ...collection,
      gemTray: collection.gemTray.map((stone, index) =>
        chosen.has(index) ? { ...stone, sold: true } : stone,
      ),
      stonePot: [...collection.stonePot, ...stonePot],
      gemSpent: cost,
    },
  };
}

export function choosePotStones(state: GameState, indices: readonly number[]): GameState {
  const run = state.activeRun;
  const collection = state.collection;
  if (run === null || collection === null || run.stage !== "set" || run.purpose.kind !== "collection")
    return state;
  if (run.stonesTaken || indices.length !== runSeats(run).length || new Set(indices).size !== indices.length)
    return state;
  const fits = indices.every((index) => {
    const stone = collection.stonePot[index];
    return (
      Number.isInteger(index) && stone !== undefined && !stone.used && stone.stoneId === run.design.stoneId
    );
  });
  if (!fits) return state;
  if (run.potStones.length === indices.length && run.potStones.every((index, at) => indices[at] === index))
    return state;
  return { ...state, activeRun: { ...run, potStones: [...indices] } };
}

export function takePotStones(state: GameState, run: PieceRun): GameState | null {
  const collection = state.collection;
  if (collection === null || run.potStones.length !== runSeats(run).length) return null;
  const chosen = new Set(run.potStones);
  return {
    ...state,
    collection: {
      ...collection,
      stonePot: collection.stonePot.map((stone, index) =>
        chosen.has(index) ? { ...stone, used: true } : stone,
      ),
    },
    activeRun: { ...run, stonesTaken: true },
  };
}

export function keepBenchStones(state: GameState): GameState {
  const collection = state.collection;
  if (collection === null) return state;
  const run = state.activeRun;
  if (run === null || run.stage === "done" || run.purpose.kind !== "collection")
    return { ...state, collection: { ...collection, stonePot: [] } };
  const kept = run.stonesTaken
    ? run.potStones.flatMap((index) => {
        const stone = collection.stonePot[index];
        return stone === undefined ? [] : [stone];
      })
    : [];
  return {
    ...state,
    activeRun: { ...run, potStones: kept.map((_, index) => index) },
    collection: { ...collection, stonePot: kept },
  };
}

export function returnPotStones(stock: Stock, pot: readonly PotStone[]): Stock {
  return pot
    .filter((stone) => !stone.used)
    .reduce((current, stone) => withStones(current, stone.stoneId, 1), stock);
}
