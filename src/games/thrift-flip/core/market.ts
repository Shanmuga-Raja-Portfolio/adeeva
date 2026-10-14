import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import { withBoughtFinds } from "./findChoice";
import { MARKET_VISIT_HOURS } from "./flipStage";
import type { GameState, RailSlot } from "./gameState";
import { rollOwnedFind, type OwnedFind } from "./ownedFind";
import { stallDayIssue } from "./stallCalendar";

export function marketVisitIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage !== "market") return "Visit the rail while planning a flip.";
  if (state.calendar.marketOpen) return "The rail is already open.";
  return stallDayIssue(state.calendar.day) ?? hoursShortfallReason(state.calendar, MARKET_VISIT_HOURS);
}

export function openMarket(state: GameState): GameState {
  if (marketVisitIssue(state) !== null) return state;
  const spent = spendHours(state, MARKET_VISIT_HOURS);
  if (spent === null) return state;
  return { ...spent, calendar: { ...spent.calendar, marketOpen: true } };
}

export function closeMarket(state: GameState): GameState {
  if (!state.calendar.marketOpen) return state;
  return { ...state, calendar: { ...state.calendar, marketOpen: false } };
}

function pickedSlots(state: GameState, slotIds: readonly string[]): RailSlot[] | null {
  if (new Set(slotIds).size !== slotIds.length) return null;
  const slots = slotIds.map((id) => state.rail.find((slot) => slot.id === id));
  return slots.every((slot): slot is RailSlot => slot !== undefined) ? slots : null;
}

export function buyIssues(state: GameState, slotIds: readonly string[]): string[] {
  if (state.activeRun?.stage !== "market") return ["Buy finds while planning a flip at the rail."];
  if (!state.calendar.marketOpen) return ["Open the rail first."];
  if (slotIds.length === 0) return ["Pick a find to buy."];
  const slots = pickedSlots(state, slotIds);
  if (slots === null) return ["That find is not on the rail."];
  if (slots.some((slot) => slot.sold)) return ["Someone already took that find home."];
  const total = slots.reduce((sum, slot) => sum + slot.price, 0);
  return total > state.coins ? [`These finds cost ${total} coins.`] : [];
}

export function buyFinds(state: GameState, slotIds: readonly string[]): GameState {
  const slots = pickedSlots(state, slotIds);
  const run = state.activeRun;
  if (slots === null || run === null || buyIssues(state, slotIds).length > 0) return state;
  let rng = state.rng;
  let number = state.next.find;
  const bought: OwnedFind[] = slots.map((slot) => {
    const [owned, after] = rollOwnedFind(`find-${number}`, slot.findId, slot.grade, slot.price, rng);
    rng = after;
    number += 1;
    return owned;
  });
  const sold = new Set(slotIds);
  return {
    ...state,
    rng,
    coins: state.coins - slots.reduce((sum, slot) => sum + slot.price, 0),
    rail: state.rail.map((slot) => (sold.has(slot.id) ? { ...slot, sold: true } : slot)),
    stock: { ...state.stock, finds: [...state.stock.finds, ...bought] },
    next: { ...state.next, find: number },
    activeRun: withBoughtFinds(run, bought),
  };
}
