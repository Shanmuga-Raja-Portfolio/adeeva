import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { isColourId, type ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import { MENU_TIER_IDS, type MenuTierDef, type MenuTierId } from "../content/menuTier";
import { COUNTER_PRODUCT_IDS } from "../content/product";
import { isMixId, menuTierById, mixById, productById } from "./catalog";
import { mixOptions } from "./design";
import type { GameState } from "./gameState";
import { drawBookings, tableCount } from "./salonBookings";
import type { MenuEntry, SalonMenu } from "./salonState";
import { currentSeason, seasonBegun, seasonThemes } from "./seasonCalendar";

export const MENU_LOCKED = "The menu changes with the season.";

function tagScore(tags: readonly StyleTag[], wanted: readonly StyleTag[]): number {
  return tags.filter((tag) => wanted.includes(tag)).length;
}

function bestEntry(tier: MenuTierDef, wanted: readonly StyleTag[], colours: [ColourId, ColourId]): MenuEntry {
  const pairs = tier.products.flatMap((productId) => {
    const product = productById(productId);
    const counterId = COUNTER_PRODUCT_IDS.find((id) => id === productId);
    if (counterId === undefined) return [];
    return mixOptions(product).map((mix) => ({
      productId: counterId,
      mixId: mix.id,
      score: tagScore([...product.tags, ...mix.tags], wanted),
    }));
  });
  const best = pairs.reduce<(typeof pairs)[number] | null>(
    (top, pair) => (top === null || pair.score > top.score ? pair : top),
    null,
  );
  if (best === null) throw new Error(`No menu pair for ${tier.id}`);
  return { productId: best.productId, mixId: best.mixId, colours };
}

export function menuPalette(state: GameState): ColourId[] {
  const fair = state.fair;
  if (fair === null) return [];
  const chosen = seasonThemes(fair.seasonNumber).find((theme) => theme.id === fair.themeId);
  const themes = chosen === undefined ? seasonThemes(fair.seasonNumber) : [chosen];
  return [...new Set(themes.flatMap((theme) => theme.palette))];
}

export function suggestedMenu(state: GameState): SalonMenu | null {
  const fair = state.fair;
  if (fair === null) return null;
  const tags = currentSeason(fair).menuTags;
  const palette = menuPalette(state);
  const pick = (index: number): ColourId => palette[index % palette.length] ?? "ivory";
  const entry = (id: MenuTierId, index: number) =>
    bestEntry(menuTierById(id), tags, [pick(index), pick(index + 1)]);
  return { top: entry("top", 0), middle: entry("middle", 1), bottom: entry("bottom", 2) };
}

export function menuEntryIssue(tierId: MenuTierId, entry: MenuEntry): string | null {
  const tier = menuTierById(tierId);
  if (!tier.products.includes(entry.productId)) return `${tier.name} cannot hold that bake.`;
  if (!isMixId(entry.mixId)) return "That mix is not in the recipe book.";
  if (mixById(entry.mixId).kind !== productById(entry.productId).mixKind)
    return "That mix does not suit the bake.";
  const [first, second] = entry.colours;
  if (!isColourId(first) || !isColourId(second) || first === second)
    return "Pick two different icing colours for each tier.";
  return null;
}

export function canSetMenu(state: GameState): ActionCheck {
  const { fair, salon } = state;
  if (state.career !== "salon" || fair === null || salon === null)
    return actionCheck(["Open the Comet Room first."]);
  if (!seasonBegun(fair, state.calendar.day))
    return actionCheck([`The season's menu is set on day ${fair.seasonStartDay}.`]);
  if (salon.parlour === "resting") return actionCheck(["The parlour is resting this season."]);
  if (salon.menu !== null) return actionCheck([MENU_LOCKED]);
  return actionCheck([]);
}

export function setSalonMenu(state: GameState, menu: SalonMenu): GameState {
  const salon = state.salon;
  if (salon === null || !canSetMenu(state).ok) return state;
  if (MENU_TIER_IDS.some((tier) => menu[tier] === undefined || menuEntryIssue(tier, menu[tier]) !== null))
    return state;
  const copy = (entry: MenuEntry): MenuEntry => ({
    productId: entry.productId,
    mixId: entry.mixId,
    colours: [entry.colours[0], entry.colours[1]],
  });
  const clean: SalonMenu = { top: copy(menu.top), middle: copy(menu.middle), bottom: copy(menu.bottom) };
  const [bookings, rng] = drawBookings(clean, tableCount(state), state.rng);
  return { ...state, rng, salon: { ...salon, parlour: "open", menu: clean, bookings } };
}
