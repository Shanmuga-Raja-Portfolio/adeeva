import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";
import { FILLING_IDS } from "../content/filling";
import { INGREDIENT_IDS } from "../content/ingredient";
import { TEA_IDS } from "../content/tea";
import { TOPPING_IDS } from "../content/topping";

type Raw = Readonly<Record<string, unknown>>;

function withZeroes(record: unknown, ids: readonly string[]): unknown {
  if (!isPlainObject(record)) return record;
  return Object.fromEntries(ids.map((id) => [id, Object.hasOwn(record, id) ? record[id] : 0]));
}

function briefWithColours(brief: unknown): unknown {
  return isPlainObject(brief) ? { ...brief, minColours: 0 } : brief;
}

function gigsWithColours(list: unknown): unknown {
  if (!Array.isArray(list)) return list;
  return list.map((entry: unknown) =>
    isPlainObject(entry) ? { ...entry, brief: briefWithColours(entry.brief) } : entry,
  );
}

function migratedPantry(pantry: unknown): unknown {
  if (!isPlainObject(pantry)) return pantry;
  return {
    ...pantry,
    ingredients: withZeroes(pantry.ingredients, INGREDIENT_IDS),
    fillings: withZeroes(pantry.fillings, FILLING_IDS),
    toppings: withZeroes(pantry.toppings, TOPPING_IDS),
    teas: Object.fromEntries(TEA_IDS.map((id) => [id, 0])),
  };
}

function migratedRun(run: unknown): unknown {
  if (!isPlainObject(run)) return run;
  const design = isPlainObject(run.design) ? { ...run.design, split: 6 } : run.design;
  return { ...run, brief: briefWithColours(run.brief), design, flourishes: [], word: null };
}

function migratedBook(book: unknown): unknown {
  if (!Array.isArray(book)) return book;
  return book.map((entry: unknown) => (isPlainObject(entry) ? { ...entry, quality: null } : entry));
}

export function addDepthFields(raw: Raw): Record<string, unknown> {
  const gigs = isPlainObject(raw.gigs)
    ? { ...raw.gigs, offers: gigsWithColours(raw.gigs.offers), active: gigsWithColours(raw.gigs.active) }
    : raw.gigs;
  return {
    ...raw,
    profile: isPlainObject(raw.profile) ? { ...raw.profile, startedAs: "bakery" } : raw.profile,
    career: "bakery",
    salon: null,
    fair: null,
    pantry: migratedPantry(raw.pantry),
    gigs,
    activeRun: raw.activeRun === null ? null : migratedRun(raw.activeRun),
    bakeBook: migratedBook(raw.bakeBook),
  };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = { 1: addDepthFields };
