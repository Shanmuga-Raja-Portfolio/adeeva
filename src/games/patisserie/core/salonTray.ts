import type { MenuTierId } from "../content/menuTier";
import { createBakeRun, EMPTY_BATCH, type BakeRun } from "./bakeRun";
import { bakeQuality } from "./bakeQuality";
import { bakeTags } from "./bakeTags";
import { isMenuTierId } from "./catalog";
import type { GameState } from "./gameState";
import { runStartIssue } from "./runLifecycle";
import type { SalonTray } from "./salonState";
import { salonDayOf, seasonBegun } from "./seasonCalendar";
import { coveringSplit, splitTally } from "./traySplit";

export const SALON_TRAY_ITEMS = 6;
export const DEFAULT_SPLIT = 3;

export function salonTrayIssue(state: GameState, tier: MenuTierId): string | null {
  const { salon, fair } = state;
  if (state.career !== "salon" || salon === null || fair === null) return "Open the Comet Room first.";
  if (salon.parlour === "resting") return "The parlour is resting this season.";
  if (salon.menu === null || !seasonBegun(fair, state.calendar.day)) return "Set the season's menu first.";
  if (state.calendar.day > salonDayOf(fair)) return "Salon trays wait for next season's menu now.";
  if (salon.shelf.some((tray) => tray.tier === tier))
    return "That tier already has a tray on the Salon shelf.";
  return runStartIssue(state);
}

export function startSalonTray(state: GameState, tier: MenuTierId): GameState {
  const salon = state.salon;
  const menu = salon?.menu ?? null;
  if (salon === null || !isMenuTierId(tier) || menu === null || salonTrayIssue(state, tier) !== null)
    return state;
  const entry = menu[tier];
  const counted = coveringSplit(splitTally(salon.bookings, menu, tier));
  const base = createBakeRun(
    `run-${state.nextRunNumber}`,
    { kind: "salon-tray", tier },
    null,
    state.calendar.day,
  );
  const run: BakeRun = {
    ...base,
    design: {
      ...base.design,
      productId: entry.productId,
      mixIds: [entry.mixId],
      colours: [...entry.colours],
      split: state.profile.difficulty === "relaxed" ? counted : DEFAULT_SPLIT,
    },
    batches: [EMPTY_BATCH],
  };
  return { ...state, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function shelfIssue(state: GameState, run: BakeRun): string | null {
  if (run.purpose.kind !== "salon-tray") return null;
  const { tier } = run.purpose;
  const { salon, fair } = state;
  if (salon === null || fair === null) return "Open the Comet Room first.";
  if (salon.menu === null || state.calendar.day > salonDayOf(fair) || salon.doneDay >= salonDayOf(fair))
    return "Salon Day is over for this season. Set this tray aside.";
  return salon.shelf.some((tray) => tray.tier === tier)
    ? "That tier already has a tray on the Salon shelf."
    : null;
}

export function stockSalonShelf(state: GameState, run: BakeRun): GameState {
  const salon = state.salon;
  if (salon === null || run.purpose.kind !== "salon-tray" || shelfIssue(state, run) !== null) return state;
  const tray: SalonTray = {
    id: `salon-${salon.nextTrayNumber}`,
    tier: run.purpose.tier,
    quality: bakeQuality(run).quality,
    tags: bakeTags(run),
    left: [run.design.split, SALON_TRAY_ITEMS - run.design.split],
  };
  return {
    ...state,
    activeRun: { ...run, stage: "done", reached: "done" },
    salon: { ...salon, shelf: [...salon.shelf, tray], nextTrayNumber: salon.nextTrayNumber + 1 },
  };
}
