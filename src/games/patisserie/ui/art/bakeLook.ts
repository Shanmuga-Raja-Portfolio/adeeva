import { colourById } from "../../../../engine/palette";
import { designFilling, designMixes, fillingById, type BakeDesign, type PlacedTopping } from "../../core";
import type { PatternChoice } from "../../content/pipePattern";
import type { ProductId } from "../../content/product";

export interface BakeLook {
  readonly productId: ProductId;
  readonly mixColours: readonly string[];
  readonly fillingColour: string | null;
  readonly icing: readonly string[];
  readonly pattern: PatternChoice;
  readonly toppings: readonly PlacedTopping[];
  readonly iced: boolean;
}

export const DEFAULT_ICING = "#fbf3e2";
export const DEFAULT_SPONGE = "#f1d290";

export function icingHex(look: BakeLook, index: number): string {
  return look.icing[index % Math.max(1, look.icing.length)] ?? DEFAULT_ICING;
}

export function spongeHex(look: BakeLook, index: number): string {
  return look.mixColours[index] ?? look.mixColours[0] ?? DEFAULT_SPONGE;
}

export function bakeLook(
  design: BakeDesign,
  toppings: readonly PlacedTopping[],
  iced: boolean,
): BakeLook | null {
  if (design.productId === null) return null;
  const filling = designFilling(design);
  return {
    productId: design.productId,
    mixColours: designMixes(design).map((mix) => mix.colour),
    fillingColour: filling === null ? null : fillingById(filling).colour,
    icing: design.colours.map((colour) => colourById(colour).hex),
    pattern: design.pattern,
    toppings,
    iced,
  };
}
