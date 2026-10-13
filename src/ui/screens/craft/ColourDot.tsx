import type { ColourId } from "../../../content/colour";
import { colourById } from "../../../core";

export interface ColourDotProps {
  readonly colourId: ColourId;
  readonly crossed?: boolean | undefined;
}

export function ColourDot({ colourId, crossed = false }: ColourDotProps) {
  const colour = colourById(colourId);
  return (
    <span className={crossed ? "ad-colour-dot ad-colour-dot--crossed" : "ad-colour-dot"}>
      <span className="ad-colour-dot__swatch" style={{ background: colour.hex }} aria-hidden="true" />
      {colour.name}
    </span>
  );
}
