import { COLOURS } from "../../../../../engine/palette";
import { MATERIALS } from "../../../content/material";
import { STYLE_TAGS } from "../../../../../engine/styleTag";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";

export type ShopAvailability = "all" | "design" | "owned" | "locked";

export interface ShopFilterState {
  readonly material: string;
  readonly colour: string;
  readonly tag: string;
  readonly availability: ShopAvailability;
}

export const NO_SHOP_FILTER: ShopFilterState = { material: "", colour: "", tag: "", availability: "all" };

export interface ShopFiltersProps {
  readonly filters: ShopFilterState;
  readonly onChange: (filters: ShopFilterState) => void;
}

const AVAILABILITY = [
  { value: "all", label: "All" },
  { value: "design", label: "In design" },
  { value: "owned", label: "Owned" },
  { value: "locked", label: "Locked" },
] as const;

export function ShopFilters({ filters, onChange }: ShopFiltersProps) {
  return (
    <div className="ad-shop-filters">
      <SegmentedControl
        label="Show fabrics"
        options={AVAILABILITY}
        value={filters.availability}
        onChange={(availability) => onChange({ ...filters, availability })}
      />
      <label className="ad-shop-filter">
        <span>Material</span>
        <select
          value={filters.material}
          onChange={(event) => onChange({ ...filters, material: event.target.value })}
        >
          <option value="">Any</option>
          {MATERIALS.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </label>
      <label className="ad-shop-filter">
        <span>Colour</span>
        <select
          value={filters.colour}
          onChange={(event) => onChange({ ...filters, colour: event.target.value })}
        >
          <option value="">Any</option>
          {COLOURS.map((colour) => (
            <option key={colour.id} value={colour.id}>
              {colour.name}
            </option>
          ))}
        </select>
      </label>
      <label className="ad-shop-filter">
        <span>Feel</span>
        <select value={filters.tag} onChange={(event) => onChange({ ...filters, tag: event.target.value })}>
          <option value="">Any</option>
          {STYLE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
