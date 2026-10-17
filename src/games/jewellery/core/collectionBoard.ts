import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import { paletteCohesion } from "../../../engine/paletteCohesion";
import { FINISHES, type FinishId } from "../content/finish";
import { GLAZE_COLOURS, isGlazeColour, type GlazeColour, type JewelColour } from "../content/jewelColour";
import type { LaunchThemeDef } from "../content/launchTheme";
import { METALS } from "../content/metal";
import { SHAPE_IDS, type ShapeId } from "../content/partOption";
import { PRODUCT_IDS, type ProductId, type ProductKind } from "../content/product";
import { STONES, type StoneId } from "../content/stone";
import { launchThemeById, metalById, optionById, productById, spotByNumber, stoneById } from "./catalog";
import { canCarryMotif, slotStone } from "./collectionBrief";
import type { CollectionBrief, CollectionState } from "./collectionState";
import { metalLocked, stoneLocked } from "./design";
import { generateGemTray } from "./gemTray";
import type { GameState } from "./gameState";
import { BOARD_LAST_SEASON_DAY, daysToLanternNight, lineSeason, seasonDayOf } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { dayLength } from "./calendarHours";

export const BOARD_HOURS = 1;
export const GEM_MARKET_HOURS = 1;
export const LOOKBOOK_HOURS = 2;
export const MIN_LINE_KINDS = 2;

export const SUGGESTED_PRODUCTS: readonly ProductId[] = [
  "stone-pendant",
  "drop-pair",
  "charm-bracelet",
  "motif-ring",
  "coat-badge",
];

export function boardCollection(state: GameState): CollectionState | null {
  const collection = lineSeason(state, state.calendar.day);
  return collection !== null && collection.brief === null ? collection : null;
}

export function lineKinds(products: readonly ProductId[]): Set<ProductKind> {
  return new Set(products.map((id) => productById(id).kind));
}

function stoneIssues(state: GameState, brief: CollectionBrief): string[] {
  const issues: string[] = [];
  const seated = brief.products.filter((id) => productById(id).seats.length > 0);
  for (const stoneId of [brief.hero, brief.accent])
    if (stoneId !== null && stoneLocked(state, stoneId))
      issues.push(`${stoneById(stoneId).name} is still locked.`);
  if (seated.length === 0 && (brief.hero !== null || brief.accent !== null))
    issues.push("None of these pieces holds a stone.");
  if (seated.some((id) => slotStone(brief, id) === null)) issues.push("Pick a hero stone for the line.");
  if (brief.accent !== null && !brief.products.some((id) => productById(id).seats.length === 2))
    issues.push("An accent stone needs a pair of earrings in the line.");
  return issues;
}

export function boardIssues(state: GameState, brief: CollectionBrief): string[] {
  const collection = lineSeason(state, state.calendar.day);
  if (collection === null || state.launch === null) return ["Pick this season's theme first."];
  const spot = spotByNumber(state.launch.spot);
  const issues: string[] = [];
  const { products } = brief;
  if (!products.every((id) => PRODUCT_IDS.includes(id))) return ["That line has a piece we don't know."];
  if (products.length < spot.minPieces || products.length > spot.maxPieces)
    issues.push(
      spot.minPieces === spot.maxPieces
        ? `${spot.name} shows ${spot.minPieces} pieces.`
        : `${spot.name} shows ${spot.minPieces} to ${spot.maxPieces} pieces.`,
    );
  if (new Set(products).size !== products.length) issues.push("Each piece in the line is a different kind.");
  if (lineKinds(products).size < MIN_LINE_KINDS) issues.push("A line, not a pile.");
  if (!SHAPE_IDS.includes(brief.motif)) issues.push("Pick a motif.");
  if (!METALS.some((metal) => metal.id === brief.metalId)) issues.push("Pick a metal.");
  else if (metalLocked(state, brief.metalId))
    issues.push(`${metalById(brief.metalId).name} is still locked.`);
  if (!FINISHES.some((finish) => finish.id === brief.finish)) issues.push("Pick a finish.");
  else if ((brief.finish === "glaze") !== (brief.glaze !== null && isGlazeColour(brief.glaze)))
    issues.push("A glaze finish needs a glaze colour.");
  issues.push(...stoneIssues(state, brief));
  issues.push(...carriedIssues(state, brief));
  return issues;
}

function carriedIssues(state: GameState, brief: CollectionBrief): string[] {
  const run = state.activeRun;
  if (run === null || run.stage === "done" || run.purpose.kind !== "collection") return [];
  const { productId, metalId, stoneId } = run.design;
  const keeps =
    brief.products.includes(productId) &&
    metalId === brief.metalId &&
    (run.design.options.shape === undefined || run.design.options.shape === brief.motif) &&
    (stoneId === null || slotStone(brief, productId) === stoneId);
  if (keeps) return [];
  const name = productById(productId).name;
  return [
    stoneId === null
      ? `The ${name} on your bench joins this line, with its motif and metal.`
      : `The ${name} on your bench joins this line, with its motif, metal and ${stoneById(stoneId).name}.`,
  ];
}

export function canConfirmCollection(state: GameState, brief: CollectionBrief): ActionCheck {
  const collection = boardCollection(state);
  if (collection === null) return actionCheck(["The Collection Board is not open."]);
  const day = seasonDayOf(collection, state.calendar.day) ?? 0;
  if (day > BOARD_LAST_SEASON_DAY) return actionCheck(["The Collection Board closes after season day 10."]);
  const issues = boardIssues(state, brief);
  if (state.calendar.hoursLeft < BOARD_HOURS) issues.push("The board takes 1 hour. End the day first.");
  return actionCheck(issues);
}

function withCarriedSlot(state: GameState, brief: CollectionBrief): GameState {
  const run = state.activeRun;
  if (run === null || run.stage === "done" || run.purpose.kind !== "collection") return state;
  const slot = brief.products.indexOf(run.design.productId);
  return { ...state, activeRun: { ...run, purpose: { kind: "collection", slot } } };
}

export function confirmCollection(state: GameState, brief: CollectionBrief): GameState {
  const collection = boardCollection(state);
  if (collection === null || !canConfirmCollection(state, brief).ok) return state;
  const spent = spendHours(state, BOARD_HOURS);
  if (spent === null) return state;
  const [gemTray, rng] = generateGemTray(brief, spent.upgrades, spent.rng);
  const confirmed = withCarriedSlot(
    {
      ...spent,
      rng,
      collection: { ...collection, brief: { ...brief, products: [...brief.products] }, gemTray },
    },
    brief,
  );
  return gemTray.length > 0 ? queueStoryTrigger(confirmed, "first-gem-market") : confirmed;
}

function themedShape(theme: LaunchThemeDef): ShapeId {
  return SHAPE_IDS.find((id) => optionById(id).tags.some((tag) => theme.tags.includes(tag))) ?? "circle";
}

function themedFinish(theme: LaunchThemeDef): [FinishId, GlazeColour | null] {
  const fitting = FINISHES.filter((finish) => finish.tags.some((tag) => theme.tags.includes(tag)));
  const finish = [...fitting].sort((a, b) => a.price - b.price)[0]?.id ?? "high-shine";
  if (finish !== "glaze") return [finish, null];
  const glaze = GLAZE_COLOURS.find((colour) => theme.palette.includes(colour)) ?? "sky";
  return [finish, glaze];
}

export function oseiSuggestion(state: GameState, collection: CollectionState): CollectionBrief | null {
  if (collection.themeId === null || state.launch === null) return null;
  const theme = launchThemeById(collection.themeId);
  const spot = spotByNumber(state.launch.spot);
  const run = state.activeRun;
  const carried =
    run !== null && run.stage !== "done" && run.purpose.kind === "collection" ? run.design.productId : null;
  const products = [
    ...(carried === null ? [] : [carried]),
    ...SUGGESTED_PRODUCTS.filter((id) => id !== carried),
  ].slice(0, spot.maxPieces);
  const open = METALS.filter((metal) => !metalLocked(state, metal.id));
  const metal =
    (carried !== null && run !== null ? run.design.metalId : null) ??
    open.find((entry) => theme.palette.includes(entry.tone))?.id ??
    open.find((entry) => entry.tags.some((tag) => theme.tags.includes(tag)))?.id ??
    "silver";
  const stones = STONES.filter((stone) => !stoneLocked(state, stone.id));
  const hero: StoneId | null =
    (carried !== null && run !== null ? run.design.stoneId : null) ??
    stones.find((stone) => theme.palette.includes(stone.colour))?.id ??
    stones[0]?.id ??
    null;
  const [finish, glaze] = themedFinish(theme);
  const motif =
    SHAPE_IDS.find((id) => carried !== null && run !== null && run.design.options.shape === id) ??
    themedShape(theme);
  const seated = products.some((id) => productById(id).seats.length > 0);
  return { products, motif, metalId: metal, hero: seated ? hero : null, accent: null, finish, glaze };
}

export function previewColours(brief: CollectionBrief, productId: ProductId): JewelColour[] {
  const colours = new Set<JewelColour>([metalById(brief.metalId).tone]);
  const stoneId = slotStone(brief, productId);
  if (stoneId !== null) colours.add(stoneById(stoneId).colour);
  if (brief.finish === "antique") colours.add("charcoal");
  if (brief.finish === "two-tone") colours.add("gold");
  if (brief.glaze !== null) colours.add(brief.glaze);
  return [...colours];
}

export interface Harmony {
  readonly motifShare: number;
  readonly cohesion: number;
  readonly score: number;
}

export function harmonyMeter(brief: CollectionBrief): Harmony {
  const count = brief.products.length;
  if (count === 0) return { motifShare: 0, cohesion: 0, score: 0 };
  const motifShare = brief.products.filter(canCarryMotif).length / count;
  const cohesion = paletteCohesion(brief.products.map((id) => previewColours(brief, id)));
  return { motifShare, cohesion, score: Math.round(100 * (0.6 * motifShare + 0.4 * cohesion)) };
}

export function pieceHours(productId: ProductId): number {
  const product = productById(productId);
  return 2 + 1 + product.seats.length + 1;
}

export function benchHoursEstimate(collection: CollectionState, brief: CollectionBrief): number {
  const finished = new Set(collection.pieces.map((piece) => piece.slot));
  const pieces = brief.products
    .filter((_, slot) => !finished.has(slot))
    .reduce((sum, id) => sum + pieceHours(id), 0);
  const gems = collection.gemSpent === null && brief.products.some((id) => productById(id).seats.length > 0);
  const lookbook = collection.lookbook.closed ? 0 : LOOKBOOK_HOURS;
  return pieces + (gems ? GEM_MARKET_HOURS : 0) + lookbook;
}

export function workingHoursLeft(state: GameState, collection: CollectionState): number {
  const days = daysToLanternNight(collection, state.calendar.day);
  return days < 0 ? 0 : state.calendar.hoursLeft + days * dayLength(state);
}
