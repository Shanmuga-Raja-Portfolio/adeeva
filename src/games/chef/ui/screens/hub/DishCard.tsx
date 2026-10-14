import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import type { Dish } from "../../../content/dish";
import { cardFor, cuisineById, dishCost, fairPrice, ghostLayout, type GameState } from "../../../core";
import { PlateArt } from "../../art/PlateArt";

export interface DishCardProps {
  readonly state: GameState;
  readonly dish: Dish;
  readonly selected: boolean;
  readonly locked: boolean;
  readonly note?: string | undefined;
  readonly onToggle: () => void;
  readonly role: "radio" | "checkbox";
}

export function DishCard({ state, dish, selected, locked, note, onToggle, role }: DishCardProps) {
  const card = cardFor(state.platingCards, dish.id);
  const cuisine = cuisineById(dish.cuisine);
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={`${dish.name}${locked ? ", locked" : ""}`}
      className={selected ? "ck-dish-card ck-dish-card--selected" : "ck-dish-card"}
      disabled={locked}
      onClick={onToggle}
      style={{ ["--ck-cuisine" as string]: cuisine.accent }}
      data-testid={`dish-${dish.id}`}
    >
      <span className="ck-dish-card__plate">
        <PlateArt
          colour={card?.plateColour ?? "white"}
          components={card?.components ?? ghostLayout(dish)}
          title={null}
        />
        {locked ? (
          <span className="ck-dish-card__lock">
            <Icon name="lock" size={18} />
          </span>
        ) : null}
      </span>
      <span className="ck-dish-card__name">{dish.name}</span>
      <span className="ck-dish-card__meta">
        {cuisine.name} · {dish.tags.join(", ")}
      </span>
      <span className="ck-dish-card__meta">
        <Icon name="coin" size={14} /> {dishCost(dish)} per plate · fair price {fairPrice(dish)}
      </span>
      {card !== null ? <StarRating stars={card.stars} size={12} /> : null}
      {note !== undefined ? <span className="ck-dish-card__note">{note}</span> : null}
    </button>
  );
}
