import { MENU_TIER_IDS, type MenuTierId } from "../content/menuTier";
import type { ColourId } from "../../../engine/palette";
import { fairThemeById } from "./catalog";
import { suggestedPlan } from "./fairPlan";
import { bookPlate, showpiecePlate } from "./fairPanels";
import type { GameState } from "./gameState";
import type { NewGameSettings } from "./newGame";
import { reduce } from "./reduce";
import { suggestedMenu } from "./salonMenu";
import { seasonThemes } from "./seasonCalendar";
import { ottisPicks, sidePlateOptions } from "./sidePlates";
import { TEA_TARGET_ML } from "./teaPour";
import { GOOD_PLAN, newTestGame, playRunTo, settleStories, type BakePlan } from "./testPlaythrough";
import { splitTally, coveringSplit } from "./traySplit";

export function salonTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleStories(newTestGame({ career: "salon", ...overrides }));
}

export function endDays(state: GameState, toDay: number): GameState {
  let next = state;
  for (let guard = 0; guard < 200 && next.calendar.day < toDay; guard += 1)
    next = settleStories(reduce(next, { type: "endDay" }));
  return next;
}

export function readySeason(state: GameState, themeIndex = 0): GameState {
  const fair = state.fair;
  if (fair === null) throw new Error("No Fair season");
  const theme = seasonThemes(fair.seasonNumber)[themeIndex];
  if (theme === undefined) throw new Error("No theme");
  const themed = reduce(state, { type: "chooseFairTheme", themeId: theme.id });
  const menu = suggestedMenu(themed);
  if (menu === null) throw new Error("No menu");
  return reduce(themed, { type: "setSalonMenu", menu });
}

export function salonTrayPlan(state: GameState, tier: MenuTierId): BakePlan {
  const salon = state.salon;
  const menu = salon?.menu ?? null;
  if (salon === null || menu === null) throw new Error("No salon menu");
  const entry = menu[tier];
  return {
    ...GOOD_PLAN,
    productId: entry.productId,
    mixIds: [entry.mixId],
    fillingId: null,
    colours: entry.colours,
    split: coveringSplit(splitTally(salon.bookings, menu, tier)),
  };
}

export function playSalonTray(state: GameState, tier: MenuTierId, plan?: BakePlan): GameState {
  const started = reduce(state, { type: "startSalonTray", tier });
  if (started === state) throw new Error(`Could not start the ${tier} tray`);
  const done = playRunTo(started, plan ?? salonTrayPlan(state, tier), "review");
  return reduce(done, { type: "deliver" });
}

function plateColour(state: GameState, tableIndex: number, tier: MenuTierId): ColourId | null {
  const salon = state.salon;
  const booking = salon?.bookings[tableIndex];
  const menu = salon?.menu ?? null;
  const tray = salon?.shelf.find((entry) => entry.tier === tier);
  if (booking === undefined || menu === null || tray === undefined) return null;
  const booked = booking.colours[tier];
  const index = menu[tier].colours.indexOf(booked);
  if ((tray.left[index] ?? 0) > 0) return booked;
  return menu[tier].colours.find((_, at) => (tray.left[at] ?? 0) > 0) ?? null;
}

export function serveTables(state: GameState, ml = TEA_TARGET_ML): GameState {
  let next = reduce(state, { type: "openTables" });
  const tables = next.salon?.bookings.length ?? 0;
  for (let tableIndex = 0; tableIndex < tables; tableIndex += 1) {
    for (const tier of MENU_TIER_IDS) {
      const colour = plateColour(next, tableIndex, tier);
      if (colour !== null) next = reduce(next, { type: "plateItem", tableIndex, tier, colour });
    }
    next = reduce(next, { type: "pourTea", tableIndex, ml, actions: 1, assisted: false });
    next = reduce(next, { type: "serveTable", tableIndex });
  }
  return reduce(next, { type: "closeTables" });
}

export function showpiecePlan(state: GameState): BakePlan {
  const fair = state.fair;
  if (fair === null || fair.themeId === null) throw new Error("No Fair theme");
  const theme = fairThemeById(fair.themeId);
  const productId = fair.tent >= 3 ? "two-tier-cake" : "layer-cake";
  const sponge = "vanilla-sponge" as const;
  return {
    ...GOOD_PLAN,
    productId,
    mixIds: productId === "two-tier-cake" ? [sponge, sponge] : [sponge],
    fillingId: "vanilla-cream",
    colours: theme.palette.slice(0, 3),
  };
}

export function playShowpiece(state: GameState, plan?: BakePlan): GameState {
  const started = reduce(state, { type: "startShowpiece" });
  if (started === state) throw new Error("Could not start the showpiece");
  const done = playRunTo(started, plan ?? showpiecePlan(state), "review");
  return reduce(done, { type: "deliver" });
}

export function stageSuggestedFair(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null || fair.themeId === null || fair.entry === null) throw new Error("Nothing to stage");
  const theme = fairThemeById(fair.themeId);
  const sides = ottisPicks(state, theme);
  const options = sidePlateOptions(state);
  const qualities = [
    showpiecePlate(fair.entry).quality,
    ...sides.flatMap((runId) => {
      const entry = options.find((option) => option.runId === runId);
      return entry === undefined ? [] : [bookPlate(entry).quality];
    }),
  ];
  return reduce(state, { type: "stageFair", plan: suggestedPlan(theme, sides, qualities) });
}
