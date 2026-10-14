import type { ColourId } from "../../../../../engine/palette";
import { colourById } from "../../../core";

export interface ColourChipProps {
  readonly colourId: ColourId;
  readonly crossed?: boolean | undefined;
}

export function ColourChip({ colourId, crossed = false }: ColourChipProps) {
  const colour = colourById(colourId);
  return (
    <span className={crossed ? "tf-colour tf-colour--crossed" : "tf-colour"}>
      <span className="tf-colour__dot" style={{ background: colour.hex }} aria-hidden="true" />
      {crossed ? `No ${colour.name.toLowerCase()}` : colour.name}
    </span>
  );
}
