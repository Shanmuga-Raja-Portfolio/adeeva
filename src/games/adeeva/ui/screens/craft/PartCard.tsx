import type { GarmentPartDef } from "../../../content/garmentPart";
import type { DressFabrics, DressParts } from "../../art/DressLook";
import { Icon } from "../../../../../ui/kit/IconSet";
import { DressThumb } from "./DressThumb";

export interface PartCardProps {
  readonly part: GarmentPartDef;
  readonly parts: DressParts;
  readonly fabrics: DressFabrics;
  readonly selected: boolean;
  readonly onChoose: () => void;
}

export function PartCard({ part, parts, fabrics, selected, onChoose }: PartCardProps) {
  return (
    <button
      type="button"
      className={selected ? "ad-part-card ad-part-card--selected" : "ad-part-card"}
      aria-pressed={selected}
      onClick={onChoose}
    >
      <DressThumb parts={{ ...parts, [part.category]: part.id }} fabrics={fabrics} focus={part.category} />
      <span className="ad-part-card__name">{part.name}</span>
      <span className="ad-part-card__tags">{part.tags.join(" · ")}</span>
      {selected ? (
        <span className="ad-part-card__check" aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
      ) : null}
    </button>
  );
}
