import type { ColourId } from "../../../content/colour";
import { colourById } from "../../../core";

export interface PaletteChipsProps {
  colours: readonly ColourId[];
  highlight?: readonly ColourId[] | undefined;
  size?: "sm" | "md" | undefined;
  showNames?: boolean | undefined;
  label: string;
}

export function PaletteChips({
  colours,
  highlight,
  size = "md",
  showNames = false,
  label,
}: PaletteChipsProps) {
  return (
    <ul className={`ad-palette ad-palette--${size}`} aria-label={label}>
      {colours.map((colour) => {
        const lit = highlight === undefined || highlight.includes(colour);
        return (
          <li
            key={colour}
            className={lit ? "ad-palette__chip" : "ad-palette__chip ad-palette__chip--dim"}
            title={colourById(colour).name}
          >
            <span className="ad-palette__dot" style={{ background: colourById(colour).hex }} />
            {showNames ? <span className="ad-palette__name">{colourById(colour).name}</span> : null}
            {showNames ? null : <span className="ad-visually-hidden">{colourById(colour).name}</span>}
          </li>
        );
      })}
    </ul>
  );
}
