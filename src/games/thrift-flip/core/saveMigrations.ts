import { COLOURS } from "../../../engine/palette";
import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";

type Raw = Readonly<Record<string, unknown>>;

function listOf(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function mapObjects(value: unknown, change: (item: Raw) => Raw): unknown {
  return Array.isArray(value) ? value.map((item) => (isPlainObject(item) ? change(item) : item)) : value;
}

function flipBrief(brief: unknown): unknown {
  return isPlainObject(brief) ? { ...brief, kind: "flip", ticketId: null } : brief;
}

function withFlipBrief(entry: Raw): Raw {
  return { ...entry, brief: flipBrief(entry.brief) };
}

function share(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value / 100)) : 0;
}

function finishColour(finish: unknown): unknown {
  if (!isPlainObject(finish) || !isPlainObject(finish.item)) return null;
  const item = finish.item;
  if (item.kind === "patch" && isPlainObject(item.scrap)) return item.scrap.colour;
  if (item.kind === "mark") return item.colour;
  return null;
}

function pieceColours(piece: Raw): string[] {
  const cloth = isPlainObject(piece.cloth) ? piece.cloth.colour : null;
  const present = new Set([cloth, ...listOf(piece.finishes).map(finishColour)]);
  return COLOURS.map((colour) => colour.id).filter((id) => present.has(id));
}

function rackPieceV2(piece: Raw): Raw {
  const leaves = share(piece.leaves);
  return {
    ...piece,
    findIds: [],
    seamAccuracy: share(piece.quality),
    leavesParts: { reuse: leaves, salvage: leaves, secondhand: leaves },
    colours: pieceColours(piece),
    showcaseSeason: null,
  };
}

function stallV2(stall: unknown): unknown {
  if (!isPlainObject(stall)) return stall;
  return { ...stall, sales: mapObjects(stall.sales, (sale) => ({ ...sale, bonuses: [] })) };
}

export function migrateV1toV2(raw: Raw): Record<string, unknown> {
  const gigs = isPlainObject(raw.gigs)
    ? {
        ...raw.gigs,
        offers: mapObjects(raw.gigs.offers, withFlipBrief),
        active: mapObjects(raw.gigs.active, withFlipBrief),
      }
    : raw.gigs;
  const activeRun = isPlainObject(raw.activeRun) ? withFlipBrief(raw.activeRun) : raw.activeRun;
  const profile = isPlainObject(raw.profile) ? { ...raw.profile, career: "stall" } : raw.profile;
  return {
    ...raw,
    profile,
    gigs,
    activeRun,
    rack: mapObjects(raw.rack, rackPieceV2),
    stall: stallV2(raw.stall),
    keptInUse: raw.flipsFinished,
    boutique: null,
  };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {
  1: migrateV1toV2,
};
