import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";

type Raw = Readonly<Record<string, unknown>>;

const NEW_METALS = ["pewter", "steel", "white-gold", "green-gold"] as const;
const STOCK_SIZES = ["sheet", "strip", "wide"] as const;
const NEW_STONES = [
  "rose-quartz",
  "turquoise",
  "lapis",
  "sunstone",
  "tiger-eye",
  "topaz",
  "rose-garnet",
  "plum-glass",
] as const;
const NEW_EXTRAS = [
  "beaded-cord",
  "velvet-ribbon",
  "bag-clip",
  "motif-charm",
  "moon-charm",
  "shell-charm",
] as const;

function mapped(list: unknown, change: (entry: Raw) => Raw): unknown {
  return Array.isArray(list)
    ? list.map((entry: unknown) => (isPlainObject(entry) ? change(entry) : entry))
    : list;
}

function mappedRecord(record: unknown, change: (entry: Raw) => Raw): unknown {
  if (!isPlainObject(record)) return record;
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, isPlainObject(entry) ? change(entry) : entry]),
  );
}

function withZeroes(record: unknown, keys: readonly string[], zero: () => unknown): unknown {
  if (!isPlainObject(record)) return record;
  return { ...record, ...Object.fromEntries(keys.map((key) => [key, zero()])) };
}

function migratedStock(stock: unknown): unknown {
  if (!isPlainObject(stock)) return stock;
  return {
    ...stock,
    metal: withZeroes(stock.metal, NEW_METALS, () =>
      Object.fromEntries(STOCK_SIZES.map((size) => [size, 0])),
    ),
    stones: withZeroes(stock.stones, NEW_STONES, () => 0),
    extras: withZeroes(stock.extras, NEW_EXTRAS, () => 0),
  };
}

const charmWithShape = (charm: Raw): Raw => ({ ...charm, shape: null });

function migratedLook(look: unknown): unknown {
  if (!isPlainObject(look)) return look;
  return { ...look, stoneTint: null, charms: mapped(look.charms, charmWithShape) };
}

const withLook = (entry: Raw): Raw => ({ ...entry, look: migratedLook(entry.look) });
const briefWithPreset = (brief: unknown): unknown =>
  isPlainObject(brief) ? { ...brief, preset: null } : brief;
const gigWithPreset = (gig: Raw): Raw => ({ ...gig, brief: briefWithPreset(gig.brief) });

function migratedRun(run: unknown): unknown {
  if (!isPlainObject(run)) return run;
  const display = isPlainObject(run.display)
    ? { ...run.display, charms: mapped(run.display.charms, charmWithShape) }
    : run.display;
  return {
    ...run,
    brief: briefWithPreset(run.brief),
    joins: mappedRecord(run.joins, (record) => ({ ...record, twin: false })),
    display,
    twinGlow: false,
    lineSheet: false,
    potStones: [],
  };
}

function migratedGigs(gigs: unknown): unknown {
  if (!isPlainObject(gigs)) return gigs;
  return { ...gigs, offers: mapped(gigs.offers, gigWithPreset), active: mapped(gigs.active, gigWithPreset) };
}

function migratedMarket(market: unknown): unknown {
  if (!isPlainObject(market) || !isPlainObject(market.last)) return market;
  return {
    ...market,
    last: { ...market.last, slots: mapped(market.last.slots, withLook) },
  };
}

export function addCollectionFields(raw: Raw): Record<string, unknown> {
  return {
    ...raw,
    profile: isPlainObject(raw.profile) ? { ...raw.profile, startedAs: "bench" } : raw.profile,
    career: "bench",
    stock: migratedStock(raw.stock),
    gigs: migratedGigs(raw.gigs),
    activeRun: raw.activeRun === null ? null : migratedRun(raw.activeRun),
    stallBox: mapped(raw.stallBox, withLook),
    market: migratedMarket(raw.market),
    keepsakes: mapped(raw.keepsakes, withLook),
    collection: null,
    launch: null,
  };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = { 1: addCollectionFields };
