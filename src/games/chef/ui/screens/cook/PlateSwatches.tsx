import { PLATE_COLOURS, type PlateColour } from "../../../content/plateComponent";
import { PLATE_HEX, PLATE_NAMES } from "../../art/PlateArt";

export interface PlateSwatchesProps {
  readonly colour: PlateColour;
  readonly onPick: (colour: PlateColour) => void;
}

export function PlateSwatches({ colour, onPick }: PlateSwatchesProps) {
  return (
    <div className="ck-plate__colours" role="radiogroup" aria-label="Plate colour">
      <span className="ck-plate__colours-label" aria-hidden="true">
        Plate colour
      </span>
      {PLATE_COLOURS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={colour === option}
          aria-label={PLATE_NAMES[option]}
          title={PLATE_NAMES[option]}
          className="ck-plate__swatch-option"
          onClick={() => onPick(option)}
        >
          <span className="ck-plate__swatch" style={{ background: PLATE_HEX[option] }} />
        </button>
      ))}
    </div>
  );
}
