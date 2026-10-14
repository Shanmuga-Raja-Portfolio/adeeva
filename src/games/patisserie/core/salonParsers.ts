import {
  arrayOf,
  booleanParser,
  fixedRecordOf,
  integerRangeParser,
  keyedRecordOf,
  nullable,
  objectOf,
  oneOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import {
  colourIdParser,
  countParser,
  dayParser,
  shareParser,
  styleTagParser,
} from "../../../engine/stateParsers";
import type { ColourId } from "../../../engine/palette";
import { MENU_TIER_IDS } from "../content/menuTier";
import { MIX_IDS } from "../content/mix";
import { COUNTER_PRODUCT_IDS } from "../content/product";
import { TEA_IDS, type TeaId } from "../content/tea";
import { clientIdParser } from "./bakeRunParser";
import { isMenuTierId } from "./catalog";
import {
  PARLOUR_STATES,
  type Booking,
  type MenuEntry,
  type PlatedItem,
  type SalonState,
  type SalonSummary,
  type SalonTray,
  type TableSession,
  type TableState,
  type TeaPour,
} from "./salonState";
import { MAX_POUR_ML, MAX_POUR_ACTIONS } from "./teaPour";

const scoreParser = integerRangeParser(0, 100);

function pairOf<T>(item: Parser<T>): Parser<readonly [T, T]> {
  return refined(arrayOf(item), (items) => items.length === 2, "a pair") as Parser<readonly [T, T]>;
}

const menuEntryParser = refined(
  objectOf<MenuEntry>({
    productId: oneOf(COUNTER_PRODUCT_IDS),
    mixId: oneOf(MIX_IDS),
    colours: pairOf<ColourId>(colourIdParser),
  }),
  (entry) => entry.colours[0] !== entry.colours[1],
  "two different menu colours",
);

const bookingParser = objectOf<Booking>({
  guestId: clientIdParser,
  colours: fixedRecordOf(MENU_TIER_IDS, colourIdParser),
  teas: pairOf<TeaId>(oneOf(TEA_IDS)),
  occasion: booleanParser,
});

const salonTrayParser = objectOf<SalonTray>({
  id: stringParser,
  tier: oneOf(MENU_TIER_IDS),
  quality: scoreParser,
  tags: arrayOf(styleTagParser),
  left: pairOf(integerRangeParser(0, 6)),
});

const platedParser = objectOf<PlatedItem>({
  colour: colourIdParser,
  quality: scoreParser,
  seasonTag: booleanParser,
  swapped: booleanParser,
});

const pourParser = objectOf<TeaPour>({
  ml: integerRangeParser(0, MAX_POUR_ML),
  actions: integerRangeParser(1, MAX_POUR_ACTIONS),
  assisted: booleanParser,
  band: shareParser,
});

const tableParser = objectOf<TableState>({
  plated: keyedRecordOf(isMenuTierId, platedParser),
  pour: nullable(pourParser),
  served: booleanParser,
  pay: countParser,
});

const sessionParser = objectOf<TableSession>({ tables: arrayOf(tableParser), coins: countParser });

const summaryParser = objectOf<SalonSummary>({
  day: dayParser,
  coins: countParser,
  served: countParser,
  tables: countParser,
  toCounter: countParser,
  shared: countParser,
});

function shelfOnePerTier(shelf: readonly SalonTray[]): boolean {
  return new Set(shelf.map((tray) => tray.tier)).size === shelf.length;
}

export const salonStateParser = refined(
  objectOf<SalonState>({
    parlour: oneOf(PARLOUR_STATES),
    menu: nullable(fixedRecordOf(MENU_TIER_IDS, menuEntryParser)),
    bookings: arrayOf(bookingParser),
    shelf: refined(arrayOf(salonTrayParser), shelfOnePerTier, "one tray per tier"),
    session: nullable(sessionParser),
    doneDay: countParser,
    lastSummary: nullable(summaryParser),
    graceSeason: countParser,
    nextTrayNumber: dayParser,
  }),
  (salon) =>
    (salon.menu === null || salon.parlour === "open") &&
    (salon.session === null || salon.session.tables.length === salon.bookings.length),
  "a salon whose menu, bookings and tables fit together",
);
