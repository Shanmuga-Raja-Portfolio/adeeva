import { hoursShortfallReason } from "../../../engine/dayHours";
import { PATH_RULES, PATH_SERVICE } from "../content/career";
import { CARDS_PER_CHAPTER, CHAPTERS } from "../content/chapter";
import { chapterById, dishById, isChapterId, isDishId } from "./catalog";
import { cardFor } from "./dishDiary";
import type { GameState } from "./gameState";
import { finishChapter, grantPathAward } from "./pathAwards";
import { recordMoney, tvOf, withPath, type ChapterState, type Cookbook, type TvState } from "./path";
import { STRONG_STARS } from "./rewards";
import { runStartIssue } from "./runLifecycle";
import { isTipChoice } from "./tipChoice";
import { openService, servicePlan } from "./serviceSetup";

export const PERFECT_STARS = 5;

export function bookOfferIssue(state: GameState): string | null {
  const tv = tvOf(state);
  if (tv === null) return "Only the studio kitchen writes a cookbook.";
  if (tv.book !== null) return "Your cookbook is already under way.";
  return tv.strongSegments >= PATH_RULES.bookOfferSegments
    ? null
    : `Make ${PATH_RULES.bookOfferSegments} segments of ${STRONG_STARS} stars or more first (${tv.strongSegments} so far).`;
}

export function startBook(state: GameState): GameState {
  const tv = tvOf(state);
  if (tv === null || bookOfferIssue(state) !== null) return state;
  const book: Cookbook = {
    chapters: CHAPTERS.map((chapter) => ({ chapterId: chapter.id, cards: [], spoons: null, review: null })),
    launched: false,
  };
  const signed = withPath({ ...state, coins: state.coins + PATH_RULES.bookAdvance }, { ...tv, book });
  return recordMoney(signed, "shows", PATH_RULES.bookAdvance);
}

export function bookDishes(book: Cookbook): string[] {
  return book.chapters.flatMap((chapter) => chapter.cards.map((card) => card.dishId));
}

export function chapterFits(chapter: ChapterState, dishId: string): boolean {
  if (!isDishId(dishId)) return false;
  const dish = dishById(dishId);
  const def = chapterById(chapter.chapterId);
  if (def.tags.length > 0) return dish.tags.some((tag) => def.tags.includes(tag));
  return chapter.cards.every((card) => dishById(card.dishId).cuisine !== dish.cuisine);
}

export function recipeCardIssue(
  state: GameState,
  chapterId: string,
  dishId: string,
  tip: number,
): string | null {
  const tv = tvOf(state);
  const book = tv?.book ?? null;
  if (tv === null || book === null) return "Start the cookbook first.";
  if (book.launched) return "The book is already on the shelf.";
  const chapter = book.chapters.find((entry) => entry.chapterId === chapterId);
  if (!isChapterId(chapterId) || chapter === undefined) return "Pick a chapter.";
  if (chapter.cards.length >= CARDS_PER_CHAPTER) return "That chapter is finished.";
  if (!isDishId(dishId)) return "Pick a dish.";
  if (!tv.tested.includes(dishId)) return "Test it first: cook it at 4 stars or more.";
  if (bookDishes(book).includes(dishId)) return "That dish already has a card.";
  if (!chapterFits(chapter, dishId)) return `That dish doesn't fit ${chapterById(chapterId).title}.`;
  return isTipChoice(tip) ? null : "Pick a tip bubble.";
}

function reviewed(state: GameState, chapter: ChapterState): ChapterState {
  if (chapter.cards.length < CARDS_PER_CHAPTER) return chapter;
  const perfect = chapter.cards.every(
    (card) => cardFor(state.platingCards, card.dishId)?.stars === PERFECT_STARS,
  );
  return { ...chapter, spoons: perfect ? 5 : 4, review: chapterById(chapter.chapterId).review };
}

export function addRecipeCard(state: GameState, chapterId: string, dishId: string, tip: number): GameState {
  const tv = tvOf(state);
  const book = tv?.book ?? null;
  if (
    tv === null ||
    book === null ||
    !isDishId(dishId) ||
    recipeCardIssue(state, chapterId, dishId, tip) !== null
  )
    return state;
  const chapters = book.chapters.map((chapter) =>
    chapter.chapterId === chapterId
      ? reviewed(state, { ...chapter, cards: [...chapter.cards, { dishId, tip }] })
      : chapter,
  );
  const finished =
    chapters.find((chapter) => chapter.chapterId === chapterId)?.cards.length === CARDS_PER_CHAPTER;
  const written = withPath(
    { ...state, coins: state.coins + (finished ? PATH_RULES.chapterFee : 0) },
    { ...tv, book: { ...book, chapters } },
  );
  return finished ? recordMoney(written, "shows", PATH_RULES.chapterFee) : written;
}

export function bookReady(tv: TvState): boolean {
  return tv.book !== null && tv.book.chapters.every((chapter) => chapter.cards.length >= CARDS_PER_CHAPTER);
}

export function launchIssues(state: GameState): string[] {
  const tv = tvOf(state);
  if (tv === null || tv.book === null) return ["Start the cookbook first."];
  if (tv.book.launched) return ["The book is already on the shelf."];
  const issues: string[] = [];
  if (!bookReady(tv)) issues.push("Finish all four chapters first.");
  const busy = runStartIssue(state) ?? hoursShortfallReason(state.calendar, PATH_RULES.serviceHours);
  if (busy !== null) issues.push(busy);
  return issues;
}

export function launchBook(state: GameState): GameState {
  const tv = tvOf(state);
  if (tv === null || tv.book === null || launchIssues(state).length > 0) return state;
  return openService(state, {
    kind: "launch",
    cuisines: [],
    plan: servicePlan(state, PATH_SERVICE.launch),
    helpers: [],
    special: null,
    pool: bookDishes(tv.book).filter(isDishId),
  });
}

export function settleLaunch(state: GameState): GameState {
  const tv = tvOf(state);
  if (tv === null || tv.book === null || tv.book.launched) return state;
  const launched = withPath(state, { ...tv, book: { ...tv.book, launched: true } });
  return finishChapter(grantPathAward(launched, "golden-page"));
}
