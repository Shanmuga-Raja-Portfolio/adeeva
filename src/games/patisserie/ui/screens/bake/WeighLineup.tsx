import { Icon } from "../../../../../ui/kit/IconSet";
import type { IngredientId } from "../../../content/ingredient";
import { ingredientById } from "../../../core";
import { IngredientPack } from "../../art/IngredientPack";

export interface WeighLineupProps {
  readonly items: readonly IngredientId[];
  readonly done: readonly IngredientId[];
  readonly current: IngredientId | null;
}

export function WeighLineup({ items, done, current }: WeighLineupProps) {
  const waiting = items.filter((item) => item !== current);
  if (waiting.length === 0) return null;
  return (
    <ul className="pa-weigh-lineup" aria-hidden="true">
      {waiting.map((item) => {
        const ticked = done.includes(item);
        return (
          <li
            key={item}
            className={ticked ? "pa-weigh-lineup__item pa-weigh-lineup__item--done" : "pa-weigh-lineup__item"}
          >
            <IngredientPack ingredient={ingredientById(item)} size={74} />
            {ticked ? (
              <span className="pa-weigh-lineup__tick">
                <Icon name="check" size={16} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
