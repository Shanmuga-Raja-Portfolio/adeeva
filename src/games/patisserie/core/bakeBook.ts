import type { ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import type { MixId } from "../content/mix";
import type { PatternChoice } from "../content/pipePattern";
import type { ProductId } from "../content/product";
import { designFilling } from "./bakeNeeds";
import type { BakeRun, PlacedTopping } from "./bakeRun";

export const BAKE_BOOK_SIZE = 30;

export interface BakeBookEntry {
  readonly runId: string;
  readonly day: number;
  readonly clientId: string;
  readonly productId: ProductId;
  readonly mixIds: readonly MixId[];
  readonly fillingId: FillingId | null;
  readonly colours: readonly ColourId[];
  readonly pattern: PatternChoice;
  readonly toppings: readonly PlacedTopping[];
  readonly stars: number;
  readonly happy: boolean;
}

export function bakeBookEntry(
  run: BakeRun,
  clientId: string,
  day: number,
  stars: number,
  happy: boolean,
): BakeBookEntry | null {
  const { design } = run;
  if (design.productId === null) return null;
  return {
    runId: run.id,
    day,
    clientId,
    productId: design.productId,
    mixIds: design.mixIds.flatMap((id) => (id === null ? [] : [id])),
    fillingId: designFilling(design),
    colours: design.colours,
    pattern: design.pattern,
    toppings: run.toppings,
    stars,
    happy,
  };
}

export function addToBakeBook(book: readonly BakeBookEntry[], entry: BakeBookEntry): BakeBookEntry[] {
  return [...book, entry].slice(-BAKE_BOOK_SIZE);
}
