import {
  arrayOf,
  booleanParser,
  distinctBy,
  distinctListOf,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import { countParser, dayParser, shareParser } from "../../../engine/stateParsers";
import { PATH_AWARD_IDS } from "../content/award";
import { PATH_RULES } from "../content/career";
import { CARDS_PER_CHAPTER, CHAPTER_IDS } from "../content/chapter";
import { CRITIC_IDS } from "../content/critic";
import { CUE_KINDS } from "../content/cueCard";
import { DISH_IDS } from "../content/dish";
import { FESTIVAL_IDS } from "../content/festival";
import { PATH_IDS } from "../content/path";
import { letterById, nameCardById, staffById } from "./catalog";
import { menuPortions } from "./menuPortions";
import { LAST_TIP } from "./tipChoice";
import { MONEY_KINDS, type Ledger } from "./ledger";
import type {
  ChapterState,
  Cookbook,
  CriticNight,
  CriticSpoons,
  DishSale,
  FestivalReport,
  FestivalSlot,
  MenuDish,
  NightReport,
  PathCommon,
  PathState,
  RecipeCard,
  RestaurantState,
  Review,
  SalePlan,
  Season,
  SegmentPrep,
  SegmentReport,
  ShiftRow,
  StockCount,
  TruckDay,
  TruckState,
  TvState,
} from "./path";
import { dishIdParser, qualityParser, starsParser } from "./runParser";
import { isFairPrice } from "./special";

const ledgerParser = objectOf<Ledger>({
  week: dayParser,
  amounts: fixedRecordOf(MONEY_KINDS, integerParser),
  unserved: countParser,
});

const commonShape = {
  startDay: dayParser,
  awards: distinctListOf(PATH_AWARD_IDS, "path award"),
  community: countParser,
  cleanStreak: countParser,
  finished: booleanParser,
  week: ledgerParser,
  lastWeek: nullable(ledgerParser),
} satisfies { readonly [K in keyof PathCommon]-?: Parser<PathCommon[K]> };

function fairlyPriced(entry: MenuDish): boolean {
  return isFairPrice(entry.dishId, entry.price);
}

function menuDishParser(parMax: number) {
  return refined(
    objectOf<MenuDish>({
      dishId: dishIdParser,
      price: countParser,
      par: integerRangeParser(0, parMax),
    }),
    fairlyPriced,
    "a price in range",
  );
}

function menuParser(max: number, parMax: number, fridge: number) {
  return distinctBy(
    refined(
      arrayOf(menuDishParser(parMax)),
      (menu) => menu.length <= max && menuPortions(menu) <= fridge,
      `at most ${max} dishes that fit the fridge`,
    ),
    (entry) => entry.dishId,
    "each dish once",
  );
}

const dishSaleParser = objectOf<DishSale>({
  dishId: dishIdParser,
  price: countParser,
  stock: countParser,
  bought: countParser,
  wanted: countParser,
  sold: countParser,
  leftover: countParser,
});

const salePlanParser = objectOf<SalePlan>({
  day: dayParser,
  guests: countParser,
  seats: countParser,
  dishes: arrayOf(dishSaleParser),
  ingredients: countParser,
  keptSimple: countParser,
});

const criticIdParser = oneOf(CRITIC_IDS);
const spoonsParser = integerRangeParser(1, 5);

const reviewParser = objectOf<Review>({
  criticId: criticIdParser,
  day: dayParser,
  dishId: dishIdParser,
  spoons: spoonsParser,
  lines: arrayOf(stringParser),
});

const seasonParser = objectOf<Season>({
  startDay: dayParser,
  scores: arrayOf(qualityParser),
  critics: arrayOf(objectOf<CriticSpoons>({ criticId: criticIdParser, spoons: spoonsParser })),
  moneyIn: countParser,
  moneyOut: countParser,
  ingredients: countParser,
  unserved: countParser,
});

const stockParser = objectOf<StockCount>({ dishId: dishIdParser, count: countParser });

const shiftRowParser = objectOf<ShiftRow>({
  staffId: refined(stringParser, (id) => staffById(id) !== undefined && id !== "teo", "a team member"),
  nights: refined(
    arrayOf(integerRangeParser(2, 6)),
    (nights) => nights.length <= PATH_RULES.maxNights && new Set(nights).size === nights.length,
    "at most four different nights",
  ),
});

const nightReportParser = objectOf<NightReport>({
  plan: salePlanParser,
  score: qualityParser,
  stars: starsParser,
  plateCoins: countParser,
  tips: countParser,
  teamPay: countParser,
  carried: arrayOf(stockParser),
  review: nullable(reviewParser),
  notes: arrayOf(stringParser),
});

const restaurantParser = objectOf<RestaurantState>({
  ...commonShape,
  kind: oneOf(["restaurant"]),
  nameCard: refined(stringParser, (id) => nameCardById(id) !== undefined, "a name card"),
  menu: menuParser(PATH_RULES.menuMax, PATH_RULES.parMax, PATH_RULES.menuMax * PATH_RULES.parMax),
  team: distinctBy(
    refined(arrayOf(shiftRowParser), (team) => team.length <= PATH_RULES.maxTeam, "a small team"),
    (row) => row.staffId,
    "each team member once",
  ),
  carried: arrayOf(stockParser),
  criticNights: arrayOf(objectOf<CriticNight>({ criticId: criticIdParser, day: dayParser })),
  season: seasonParser,
  reviews: arrayOf(reviewParser),
  notes: arrayOf(stringParser),
  tonight: nullable(salePlanParser),
  lastNight: nullable(nightReportParser),
});

const festivalIdParser = oneOf(FESTIVAL_IDS);

const truckParser = objectOf<TruckState>({
  ...commonShape,
  kind: oneOf(["truck"]),
  menu: menuParser(PATH_RULES.truckMenu, PATH_RULES.fridge, PATH_RULES.fridge),
  cycle: refined(
    arrayOf(festivalIdParser),
    (cycle) => cycle.length === FESTIVAL_IDS.length && new Set(cycle).size === cycle.length,
    "every festival once",
  ),
  cycleIndex: integerRangeParser(0, FESTIVAL_IDS.length - 1),
  board: arrayOf(
    objectOf<FestivalSlot>({ day: dayParser, festivalId: festivalIdParser, worked: booleanParser }),
  ),
  visited: distinctListOf(FESTIVAL_IDS, "festival"),
  ribbons: distinctListOf(FESTIVAL_IDS, "ribbon"),
  today: nullable(
    objectOf<TruckDay>({ festivalId: festivalIdParser, helperId: stringParser, plan: salePlanParser }),
  ),
  lastFestival: nullable(
    objectOf<FestivalReport>({
      festivalId: festivalIdParser,
      plan: salePlanParser,
      score: qualityParser,
      stars: starsParser,
      ribbon: booleanParser,
      plateCoins: countParser,
      pitch: countParser,
      helperFee: countParser,
    }),
  ),
});

const cueParser = oneOf(CUE_KINDS);

const prepParser = refined(
  objectOf<SegmentPrep>({
    dishId: dishIdParser,
    cues: arrayOf(cueParser),
    deck: arrayOf(cueParser),
    order: arrayOf(cueParser),
    tips: arrayOf(nullable(integerRangeParser(0, LAST_TIP))),
  }),
  (prep) =>
    prep.deck.length === prep.cues.length &&
    prep.tips.length === prep.cues.length &&
    prep.order.length <= prep.cues.length &&
    prep.deck.every((cue) => prep.cues.includes(cue)),
  "a segment plan",
);

const chapterParser = objectOf<ChapterState>({
  chapterId: oneOf(CHAPTER_IDS),
  cards: refined(
    arrayOf(objectOf<RecipeCard>({ dishId: dishIdParser, tip: integerRangeParser(0, 2) })),
    (cards) => cards.length <= CARDS_PER_CHAPTER,
    `at most ${CARDS_PER_CHAPTER} cards`,
  ),
  spoons: nullable(spoonsParser),
  review: nullable(stringParser),
});

function uniqueDishes(chapters: readonly ChapterState[]): boolean {
  const dishes = chapters.flatMap((chapter) => chapter.cards.map((card) => card.dishId));
  return new Set(dishes).size === dishes.length;
}

const tvParser = objectOf<TvState>({
  ...commonShape,
  kind: oneOf(["tv"]),
  prep: nullable(prepParser),
  segmentWeek: dayParser,
  segmentsThisWeek: integerRangeParser(0, PATH_RULES.segmentsPerWeek),
  strongSegments: countParser,
  letters: distinctBy(
    arrayOf(refined(stringParser, (id) => letterById(id) !== undefined, "a letter")),
    (id) => id,
    "each letter once",
  ),
  tested: distinctListOf(DISH_IDS, "dish"),
  book: nullable(
    objectOf<Cookbook>({
      chapters: refined(
        arrayOf(chapterParser),
        (chapters) =>
          chapters.length === CHAPTER_IDS.length &&
          chapters.every((chapter, index) => chapter.chapterId === CHAPTER_IDS[index]) &&
          uniqueDishes(chapters),
        "the four chapters, each dish once",
      ),
      launched: booleanParser,
    }),
  ),
  lastSegment: nullable(
    objectOf<SegmentReport>({
      dishId: dishIdParser,
      day: dayParser,
      quality: qualityParser,
      clarity: shareParser,
      onClock: shareParser,
      clockSeconds: countParser,
      score: qualityParser,
      stars: starsParser,
      letterId: nullable(stringParser),
    }),
  ),
});

const pathIdParser = oneOf(PATH_IDS);

export const pathStateParser: Parser<PathState> = (input, path) => {
  const kind = objectOf<{ kind: PathState["kind"] }>({ kind: pathIdParser })(input, path);
  if (!kind.ok) return kind;
  switch (kind.value.kind) {
    case "restaurant":
      return restaurantParser(input, path);
    case "truck":
      return truckParser(input, path);
    case "tv":
      return tvParser(input, path);
  }
};
