import { useState } from "react";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import { CUISINES, type CuisineId } from "../../../content/cuisine";
import { DISHES, type Dish, type DishId } from "../../../content/dish";
import { isDishUnlocked, masteryLevel, type GameState } from "../../../core";
import { DishCard } from "./DishCard";

export interface DishPickerProps {
  readonly state: GameState;
  readonly selected: readonly DishId[];
  readonly max: number;
  readonly allowed?: ((dish: Dish) => boolean) | undefined;
  readonly onChange: (selected: DishId[]) => void;
}

type Filter = "all" | CuisineId;

export function DishPicker({ state, selected, max, allowed, onChange }: DishPickerProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = DISHES.filter((dish) => filter === "all" || dish.cuisine === filter);
  const toggle = (id: DishId) => {
    if (max === 1) {
      onChange([id]);
      return;
    }
    if (selected.includes(id)) onChange(selected.filter((entry) => entry !== id));
    else if (selected.length < max) onChange([...selected, id]);
  };
  return (
    <div className="ck-dish-picker">
      <SegmentedControl<Filter>
        label="Cuisine"
        value={filter}
        onChange={setFilter}
        className="ck-dish-picker__filter"
        options={[
          { value: "all", label: "All" },
          ...CUISINES.map((cuisine) => ({ value: cuisine.id, label: cuisine.name })),
        ]}
      />
      <div className="ck-dish-picker__grid">
        {shown.map((dish) => {
          const unlocked = isDishUnlocked(state.mastery, dish);
          const fits = allowed === undefined || allowed(dish);
          return (
            <DishCard
              key={dish.id}
              state={state}
              dish={dish}
              role={max === 1 ? "radio" : "checkbox"}
              selected={selected.includes(dish.id)}
              locked={!unlocked || !fits}
              note={
                unlocked
                  ? fits
                    ? undefined
                    : "Not for this one"
                  : `Unlocks at ${dish.unlock === "confident" ? "Confident" : "Expert"} (${masteryLevel(state.mastery[dish.cuisine])} now)`
              }
              onToggle={() => toggle(dish.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
