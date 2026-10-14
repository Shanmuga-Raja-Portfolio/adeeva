import { useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { DishId } from "../../../content/dish";
import { HINTS } from "../../../content/hints";
import {
  cuisineById,
  dishById,
  dishCost,
  fairPrice,
  hireableHelpers,
  priceRange,
  shiftIssues,
  specialForecast,
  type GameState,
  type ShiftOffer,
  type ShiftSetup,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { staffRoleLine } from "../path/staffRole";
import { DishPicker } from "./DishPicker";
import "./dialogs.css";

export interface ShiftDialogProps {
  readonly state: GameState;
  readonly offer: ShiftOffer | null;
  readonly onStart: (offerId: string, setup: ShiftSetup) => void;
  readonly onClose: () => void;
}

function SpecialWriter({
  state,
  dishId,
  price,
  onDish,
  onPrice,
}: {
  readonly state: GameState;
  readonly dishId: DishId | null;
  readonly price: number;
  readonly onDish: (id: DishId) => void;
  readonly onPrice: (price: number) => void;
}) {
  const dish = dishId === null ? null : dishById(dishId);
  const range = dishId === null ? null : priceRange(dishId);
  const forecast = dishId === null ? null : specialForecast(state, { dishId, price });
  return (
    <div className="ck-special">
      <p className="ck-muted">{HINTS.special}</p>
      {dish !== null && range !== null && forecast !== null ? (
        <div className="ck-special__board" data-testid="special-board">
          <span className="ck-chalk ck-special__title">Today's special: {dish.name}</span>
          <div className="ck-special__price">
            <Button
              variant="secondary"
              size="sm"
              aria-label="Lower the price"
              onClick={() => onPrice(Math.max(range[0], price - 1))}
              disabled={price <= range[0]}
            >
              −
            </Button>
            <span className="ck-special__amount" aria-live="polite">
              <Icon name="coin" size={18} /> {price}
            </span>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Raise the price"
              onClick={() => onPrice(Math.min(range[1], price + 1))}
              disabled={price >= range[1]}
            >
              +
            </Button>
          </div>
          <ul className="ck-special__facts">
            <li>Ingredients per plate: {dishCost(dish)}</li>
            <li>Fair price: {fairPrice(dish)}</li>
            <li className="ck-special__left">
              Left over per plate: {Math.round(forecast.leftOver * 10) / 10}
            </li>
            <li>
              Expect about {forecast.sold} of 12 to sell{forecast.soldOut ? " (a sell-out!)" : ""}, for a
              bonus of {forecast.bonus}.
            </li>
          </ul>
        </div>
      ) : (
        <p className="ck-special__board ck-special__empty">
          Pick a dish below to chalk it up as today's special.
        </p>
      )}
      <DishPicker
        state={state}
        selected={dishId === null ? [] : [dishId]}
        max={1}
        onChange={(ids) => ids[0] !== undefined && onDish(ids[0])}
      />
    </div>
  );
}

function HelperPicker({
  chosen,
  onToggle,
}: {
  readonly chosen: readonly string[];
  readonly onToggle: (id: string) => void;
}) {
  return (
    <div className="ck-helpers" role="group" aria-label="Helpers for tonight">
      {hireableHelpers().map((member) => {
        const on = chosen.includes(member.id);
        return (
          <button
            key={member.id}
            type="button"
            role="checkbox"
            aria-checked={on}
            className={on ? "ck-helper ck-helper--on" : "ck-helper"}
            onClick={() => onToggle(member.id)}
          >
            <Avatar
              look={member.look}
              garment={chefWhites("#f2a93b")}
              size={56}
              title={member.name}
              frameColour="#dfe5e8"
            />
            <span className="ck-helper__name">{member.name}</span>
            <span className="ck-muted">{staffRoleLine(member)}</span>
            <span className="ck-helper__note">{member.note}</span>
          </button>
        );
      })}
    </div>
  );
}

function ShiftBody({ state, offer, onStart, onClose }: ShiftDialogProps & { readonly offer: ShiftOffer }) {
  const [dishId, setDishId] = useState<DishId | null>(null);
  const [price, setPrice] = useState(0);
  const [helpers, setHelpers] = useState<readonly string[]>([]);
  const setup: ShiftSetup = {
    special: state.rung === "sous" && dishId !== null ? { dishId, price } : null,
    helpers: state.rung === "head" ? helpers : [],
  };
  const issue = shiftIssues(state, offer.id, setup)[0];
  const counters = offer.cuisines.map((cuisine) => cuisineById(cuisine).counter).join(" and ");
  return (
    <Dialog
      open
      title={state.rung === "head" ? "Tonight's service" : `Shift at ${counters}`}
      onClose={onClose}
      className="ad-dialog--wide ck-dish-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            icon="sparkle"
            onClick={() => onStart(offer.id, setup)}
            disabledReason={issue}
            showReason
            data-testid="start-service"
          >
            Start the service
          </Button>
        </>
      }
    >
      {state.rung === "sous" ? (
        <>
          <p>Teo is on the line with you tonight. Write today's special: 12 portions on the chalkboard.</p>
          <SpecialWriter
            state={state}
            dishId={dishId}
            price={price}
            onDish={(id) => {
              setDishId(id);
              setPrice(fairPrice(dishById(id)));
            }}
            onPrice={setPrice}
          />
        </>
      ) : (
        <>
          <p>Pick two helpers. Drag a helper onto a station during service and they cook there for you.</p>
          <HelperPicker
            chosen={helpers}
            onToggle={(id) =>
              setHelpers((current) =>
                current.includes(id)
                  ? current.filter((entry) => entry !== id)
                  : current.length < 2
                    ? [...current, id]
                    : current,
              )
            }
          />
        </>
      )}
    </Dialog>
  );
}

export function ShiftDialog(props: ShiftDialogProps) {
  return props.offer === null ? null : <ShiftBody {...props} offer={props.offer} />;
}
