import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { SegmentedControl } from "../../../../../ui/kit/SegmentedControl";
import { CUISINES, type CuisineId } from "../../../content/cuisine";
import { cuisineById, dishById, type GameState } from "../../../core";
import { PlateArt } from "../../art/PlateArt";
import "./diary.css";

type Filter = "all" | CuisineId;

export function DishDiary({ state, onExit }: { readonly state: GameState; readonly onExit: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const entries = [...state.diary]
    .reverse()
    .filter((entry) => filter === "all" || dishById(entry.dishId).cuisine === filter);
  return (
    <main className="ck-diary ad-screen" data-testid="dish-diary">
      <header className="ck-diary__header">
        <Button variant="secondary" icon="back" onClick={onExit}>
          Kitchen
        </Button>
        <div>
          <span className="ad-eyebrow">Your newest {state.diary.length} plates</span>
          <h1>Dish Diary</h1>
        </div>
      </header>
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
      {entries.length === 0 ? (
        <p className="ck-diary__empty">
          No plates here yet. Every dish you send to the pass is kept in this diary.
        </p>
      ) : (
        <ul className="ck-diary__grid">
          {entries.map((entry) => {
            const dish = dishById(entry.dishId);
            return (
              <li
                key={entry.id}
                className="ck-diary__card"
                style={{ ["--ck-cuisine" as string]: cuisineById(dish.cuisine).accent }}
              >
                <PlateArt
                  colour={entry.plateColour}
                  components={entry.components}
                  title={`${dish.name} on day ${entry.day}`}
                />
                <strong>{dish.name}</strong>
                <StarRating stars={entry.stars} size={14} />
                <span className="ck-muted">
                  Day {entry.day} · {entry.note}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
