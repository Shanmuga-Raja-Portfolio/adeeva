import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";

export interface Cloth {
  readonly id: string;
  readonly colour: ColourId;
  readonly material: MaterialId;
  readonly print: PrintId;
}
