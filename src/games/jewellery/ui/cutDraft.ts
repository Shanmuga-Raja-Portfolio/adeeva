import type { Point } from "../../../engine/geometry/point";
import { recordWithout } from "../../../engine/recordWithout";

const DRAFT_KEY = "jewellery-cut-drafts";
const MAX_DRAFT_POINTS = 4000;

export type CutStrokes = readonly (readonly Point[])[];

interface DraftBook {
  readonly piece: string;
  readonly drafts: Readonly<Record<string, CutStrokes>>;
}

function isPoint(value: unknown): value is Point {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

function isStrokes(value: unknown): value is CutStrokes {
  return (
    Array.isArray(value) &&
    value.every((stroke) => Array.isArray(stroke) && stroke.every(isPoint)) &&
    value.flat().length <= MAX_DRAFT_POINTS
  );
}

function readBook(): DraftBook | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const { piece, drafts } = parsed as { piece?: unknown; drafts?: unknown };
    if (typeof piece !== "string" || typeof drafts !== "object" || drafts === null) return null;
    const kept = Object.entries(drafts).filter((entry): entry is [string, CutStrokes] => isStrokes(entry[1]));
    return { piece, drafts: Object.fromEntries(kept) };
  } catch {
    return null;
  }
}

function writeBook(book: DraftBook): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(book));
  } catch {
    return;
  }
}

export function readCutDraft(piece: string, cut: string): CutStrokes {
  const book = readBook();
  if (book === null || book.piece !== piece || !Object.hasOwn(book.drafts, cut)) return [];
  return book.drafts[cut] ?? [];
}

export function writeCutDraft(piece: string, cut: string, strokes: CutStrokes): void {
  const book = readBook();
  const drafts = book === null || book.piece !== piece ? {} : book.drafts;
  const others = recordWithout(drafts, cut);
  writeBook({ piece, drafts: strokes.length === 0 ? others : { ...others, [cut]: strokes } });
}
