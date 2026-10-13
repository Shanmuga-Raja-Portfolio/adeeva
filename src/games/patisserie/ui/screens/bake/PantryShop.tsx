import { useState } from "react";
import { colourById, COLOURS, type ColourId } from "../../../../../engine/palette";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { FILLINGS, type FillingId } from "../../../content/filling";
import { INGREDIENTS, type IngredientId } from "../../../content/ingredient";
import { TOPPINGS, type ToppingId } from "../../../content/topping";
import {
  canBuy,
  cartCost,
  cartFor,
  EMPTY_CART,
  GEL_POT_PRICE,
  hasShortfall,
  MAX_CART_COUNT,
  pantryVisitHours,
  shortfall,
  shortfallLines,
  type Action,
  type BakeRun,
  type GameState,
  type PantryCart,
} from "../../../core";
import { IngredientPack } from "../../art/IngredientPack";
import { ToppingBadge } from "../../art/ToppingArt";
import "./pantry.css";

export interface PantryShopProps {
  readonly state: GameState;
  readonly run: BakeRun;
  readonly dispatch: (action: Action) => boolean;
}

type CountKey = "ingredients" | "fillings" | "toppings";

function bump<K extends string>(
  record: Readonly<Partial<Record<K, number>>>,
  key: K,
  step: number,
): Partial<Record<K, number>> {
  const next = Math.max(0, Math.min(MAX_CART_COUNT, (record[key] ?? 0) + step));
  const others = Object.fromEntries(Object.entries(record).filter(([entry]) => entry !== key)) as Partial<
    Record<K, number>
  >;
  return next === 0 ? others : { ...others, [key]: next };
}

function Stepper({
  label,
  count,
  onChange,
}: {
  readonly label: string;
  readonly count: number;
  readonly onChange: (step: number) => void;
}) {
  return (
    <span className="pa-stepper">
      <button
        type="button"
        aria-label={`One less ${label}`}
        disabled={count === 0}
        onClick={() => onChange(-1)}
      >
        −
      </button>
      <span aria-live="polite">{count}</span>
      <button
        type="button"
        aria-label={`One more ${label}`}
        disabled={count >= MAX_CART_COUNT}
        onClick={() => onChange(1)}
      >
        +
      </button>
    </span>
  );
}

export function PantryShop({ state, run, dispatch }: PantryShopProps) {
  const once = useDispatchOnce(state, dispatch);
  const missing = shortfall(state, run);
  const [cart, setCart] = useState<PantryCart>(() => (hasShortfall(missing) ? cartFor(missing) : EMPTY_CART));
  const cost = cartCost(cart);
  const check = canBuy(state, cart);
  const hours = pantryVisitHours(state);
  const change = (key: CountKey, id: string, step: number) => {
    if (key === "ingredients")
      setCart((current) => ({
        ...current,
        ingredients: bump(current.ingredients, id as IngredientId, step),
      }));
    if (key === "fillings")
      setCart((current) => ({ ...current, fillings: bump(current.fillings, id as FillingId, step) }));
    if (key === "toppings")
      setCart((current) => ({ ...current, toppings: bump(current.toppings, id as ToppingId, step) }));
  };
  const toggleGel = (colour: ColourId) =>
    setCart((current) => ({
      ...current,
      gels: current.gels.includes(colour)
        ? current.gels.filter((entry) => entry !== colour)
        : [...current.gels, colour],
    }));
  const buy = (event: { readonly detail: number }) => {
    if (once(event, { type: "buyPantry", cart })) setCart(EMPTY_CART);
  };
  const gelColours = COLOURS.filter(
    (colour) =>
      colour.id !== "ivory" &&
      (run.design.colours.includes(colour.id) || (state.pantry.gels[colour.id] ?? 0) > 0),
  );
  return (
    <div className="pa-pantry">
      <div className="pa-pantry__shelves">
        <section className="pa-shelf" aria-labelledby="pa-shelf-dry">
          <h3 id="pa-shelf-dry" className="pa-shelf__label">
            Baking shelf
          </h3>
          <div className="pa-shelf__row">
            {INGREDIENTS.map((ingredient) => {
              const need = missing.ingredients[ingredient.id];
              const amount = state.pantry.ingredients[ingredient.id];
              return (
                <article
                  key={ingredient.id}
                  className={need !== undefined ? "pa-pack pa-pack--need" : "pa-pack"}
                >
                  {need !== undefined ? (
                    <span className="pa-pack__need">
                      Need {need}
                      {ingredient.mode === "crack" ? "" : " g"}
                    </span>
                  ) : null}
                  <IngredientPack ingredient={ingredient} size={60} />
                  <strong className="pa-pack__name">{ingredient.name}</strong>
                  <span className="pa-pack__meta">
                    {ingredient.mode === "crack"
                      ? `Box of ${ingredient.packAmount}`
                      : `${ingredient.packAmount} g`}{" "}
                    · <Icon name="coin" size={12} /> {ingredient.price}
                  </span>
                  <span className="pa-pack__have">
                    Have {ingredient.mode === "crack" ? amount : `${amount} g`}
                  </span>
                  <Stepper
                    label={ingredient.name}
                    count={cart.ingredients[ingredient.id] ?? 0}
                    onChange={(step) => change("ingredients", ingredient.id, step)}
                  />
                </article>
              );
            })}
          </div>
        </section>
        {run.purpose.kind === "order" ? (
          <section className="pa-shelf" aria-labelledby="pa-shelf-treats">
            <h3 id="pa-shelf-treats" className="pa-shelf__label">
              Icing gels, fillings and toppings
            </h3>
            <div className="pa-shelf__row">
              {gelColours.map((colour) => {
                const picked = cart.gels.includes(colour.id);
                const need = missing.gels.includes(colour.id);
                return (
                  <article key={colour.id} className={need ? "pa-pack pa-pack--need" : "pa-pack"}>
                    {need ? <span className="pa-pack__need">Need 1</span> : null}
                    <span className="pa-gel" style={{ background: colour.hex }} aria-hidden="true" />
                    <strong className="pa-pack__name">{colour.name} gel</strong>
                    <span className="pa-pack__meta">
                      10 uses · <Icon name="coin" size={12} /> {GEL_POT_PRICE}
                    </span>
                    <span className="pa-pack__have">Uses left {state.pantry.gels[colour.id] ?? 0}</span>
                    <Button
                      size="sm"
                      variant={picked ? "primary" : "secondary"}
                      aria-pressed={picked}
                      onClick={() => toggleGel(colour.id)}
                    >
                      {picked ? "In basket" : "Add"}
                    </Button>
                  </article>
                );
              })}
              {FILLINGS.map((filling) => {
                const need = missing.fillings[filling.id];
                return (
                  <article
                    key={filling.id}
                    className={need !== undefined ? "pa-pack pa-pack--need" : "pa-pack"}
                  >
                    {need !== undefined ? <span className="pa-pack__need">Need {need}</span> : null}
                    <span className="pa-jar" style={{ background: filling.colour }} aria-hidden="true" />
                    <strong className="pa-pack__name">{filling.name}</strong>
                    <span className="pa-pack__meta">
                      Jar · <Icon name="coin" size={12} /> {filling.price}
                    </span>
                    <span className="pa-pack__have">Have {state.pantry.fillings[filling.id]}</span>
                    <Stepper
                      label={filling.name}
                      count={cart.fillings[filling.id] ?? 0}
                      onChange={(step) => change("fillings", filling.id, step)}
                    />
                  </article>
                );
              })}
              {TOPPINGS.map((topping) => {
                const need = missing.toppings[topping.id];
                return (
                  <article
                    key={topping.id}
                    className={need !== undefined ? "pa-pack pa-pack--need" : "pa-pack"}
                  >
                    {need !== undefined ? <span className="pa-pack__need">Need {need}</span> : null}
                    <ToppingBadge toppingId={topping.id} size={56} />
                    <strong className="pa-pack__name">{topping.name}</strong>
                    <span className="pa-pack__meta">
                      Each · <Icon name="coin" size={12} /> {topping.price}
                    </span>
                    <span className="pa-pack__have">Have {state.pantry.toppings[topping.id]}</span>
                    <Stepper
                      label={topping.name}
                      count={cart.toppings[topping.id] ?? 0}
                      onChange={(step) => change("toppings", topping.id, step)}
                    />
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
      <aside className="pa-basket pa-doily" aria-label="Shopping list">
        <h3>Shopping list</h3>
        {hasShortfall(missing) ? (
          <ul className="pa-basket__list">
            {shortfallLines(missing).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="pa-basket__done">
            <Icon name="check" size={16} /> You have everything for this bake.
          </p>
        )}
        <div className="pa-basket__total">
          <span>Basket</span>
          <strong className="pa-coin-line" data-testid="basket-cost">
            <Icon name="coin" size={16} /> {cost}
          </strong>
        </div>
        <div className="pa-basket__actions">
          {hasShortfall(missing) ? (
            <Button variant="ghost" size="sm" onClick={() => setCart(cartFor(missing))}>
              Fill basket with what I need
            </Button>
          ) : null}
          <Button
            block
            onClick={buy}
            disabledReason={check.ok ? undefined : check.reasons[0]}
            showReason
            data-testid="buy-pantry"
          >
            Buy{hours > 0 ? " · 1 h" : ""}
          </Button>
        </div>
        <p className="pa-hint">
          {colourById("ivory").name} buttercream is free. Leftovers stay on your shelf for next time.
        </p>
      </aside>
    </div>
  );
}
