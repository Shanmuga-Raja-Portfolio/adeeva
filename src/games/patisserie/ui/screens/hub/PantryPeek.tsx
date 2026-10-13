import { Card } from "../../../../../ui/kit/Card";
import { INGREDIENTS } from "../../../content/ingredient";
import type { GameState } from "../../../core";

export function PantryPeek({ state }: { readonly state: GameState }) {
  return (
    <Card title="Pantry peek" eyebrow="What's on the shelves" className="pa-hub-card">
      <ul className="pa-pantry-peek">
        {INGREDIENTS.map((ingredient) => {
          const amount = state.pantry.ingredients[ingredient.id];
          return (
            <li
              key={ingredient.id}
              className={
                amount === 0 ? "pa-pantry-peek__item pa-pantry-peek__item--empty" : "pa-pantry-peek__item"
              }
            >
              <span
                className="pa-pantry-peek__jar"
                style={{ background: ingredient.colour }}
                aria-hidden="true"
              />
              <span>{ingredient.name}</span>
              <strong>{ingredient.mode === "crack" ? `${amount}` : `${amount} g`}</strong>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
