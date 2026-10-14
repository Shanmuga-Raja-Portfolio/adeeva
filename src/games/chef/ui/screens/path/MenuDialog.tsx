import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { PATH_RULES } from "../../../content/career";
import type { DishId } from "../../../content/dish";
import {
  cuisineById,
  dishById,
  dishCost,
  fairPrice,
  pathMenuIssues,
  priceRange,
  type Action,
  type GameState,
  type MenuDish,
} from "../../../core";
import { DishPicker } from "../hub/DishPicker";
import { HollisButton } from "./HollisButton";
import "../hub/dialogs.css";

export interface MenuDialogProps {
  readonly state: GameState;
  readonly menu: readonly MenuDish[];
  readonly dispatch: (action: Action) => boolean;
  readonly open: boolean;
  readonly onClose: () => void;
}

const SWEET_SPOT = 1.2;

function PriceRow({
  entry,
  dispatch,
}: {
  readonly entry: MenuDish;
  readonly dispatch: (action: Action) => boolean;
}) {
  const dish = dishById(entry.dishId);
  const [low, high] = priceRange(entry.dishId);
  const cost = dishCost(dish);
  const fair = fairPrice(dish);
  const left = Math.round((entry.price - cost) * 10) / 10;
  const set = (price: number) => dispatch({ type: "setPrice", dishId: entry.dishId, price });
  const position = (price: number) => Math.round(((price - low) / Math.max(1, high - low)) * 100);
  const note =
    entry.price > 1.5 * fair
      ? "Very dear: few guests will order it."
      : entry.price < 0.8 * fair
        ? "A bargain, but little is left over."
        : "A friendly price.";
  return (
    <li className="ck-price-row" data-testid={`price-${entry.dishId}`}>
      <div className="ck-price-row__dish">
        <strong className="ck-chalk">{dish.name}</strong>
        <span className="ck-muted">{cuisineById(dish.cuisine).name}</span>
      </div>
      <div className="ck-price-row__facts">
        <span>Ingredients per plate: {cost}</span>
        <span>Fair price: {fair}</span>
        <span className="ck-good">Left over per plate: {left}</span>
      </div>
      <div className="ck-price-row__control">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Lower the price of ${dish.name}`}
          onClick={() => set(entry.price - 1)}
          disabled={entry.price <= low}
        >
          −
        </Button>
        <span
          className="ck-price-row__track"
          style={{
            ["--ck-fair" as string]: `${position(fair)}%`,
            ["--ck-sweet" as string]: `${position(Math.round(SWEET_SPOT * fair))}%`,
          }}
        >
          <input
            type="range"
            min={low}
            max={high}
            step={1}
            value={entry.price}
            aria-label={`Price of ${dish.name}`}
            aria-valuetext={`${entry.price} coins. ${note}`}
            onChange={(event) => set(Number(event.target.value))}
            className="ck-price-row__slider"
          />
          <span className="ck-price-row__fair" aria-hidden="true">
            fair
          </span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Raise the price of ${dish.name}`}
          onClick={() => set(entry.price + 1)}
          disabled={entry.price >= high}
        >
          +
        </Button>
        <span className="ck-price-row__amount" aria-live="polite">
          <Icon name="coin" size={16} /> {entry.price}
        </span>
      </div>
      <p className="ck-price-row__note">{note}</p>
    </li>
  );
}

function Body({ state, menu, dispatch, onClose }: MenuDialogProps) {
  const [choosing, setChoosing] = useState(menu.length === 0);
  const [picked, setPicked] = useState<readonly DishId[]>(menu.map((entry) => entry.dishId));
  const truck = state.path?.kind === "truck";
  const max = truck ? PATH_RULES.truckMenu : PATH_RULES.menuMax;
  const issue = pathMenuIssues(state, picked)[0];
  return (
    <Dialog
      open
      title={truck ? "Menu & prices: three dishes for the hatch" : "Menu & prices"}
      onClose={onClose}
      className="ad-dialog--wide ck-dish-dialog ck-menu-dialog"
      footer={
        choosing ? (
          <>
            <span className="ck-dish-dialog__count">
              {picked.length} of {max} picked
            </span>
            <HollisButton state={state} desk="menu" dispatch={dispatch} onHelped={() => setChoosing(false)} />
            <Button variant="ghost" onClick={() => setChoosing(false)} disabled={menu.length === 0}>
              Back to prices
            </Button>
            <Button
              onClick={() => {
                if (dispatch({ type: "setPathMenu", dishIds: picked }) || menu.length > 0) setChoosing(false);
              }}
              disabledReason={issue}
              showReason
              data-testid="confirm-path-menu"
            >
              Use these dishes
            </Button>
          </>
        ) : (
          <>
            <HollisButton state={state} desk="menu" dispatch={dispatch} />
            <Button
              variant="secondary"
              icon="palette"
              onClick={() => {
                setPicked(menu.map((entry) => entry.dishId));
                setChoosing(true);
              }}
              data-testid="change-dishes"
            >
              Change dishes
            </Button>
            <Button onClick={onClose} data-testid="menu-done">
              Done
            </Button>
          </>
        )
      }
    >
      <p className="ck-dish-dialog__lead">
        Price minus ingredients is what's left over per plate. The green glow is where a fair price leaves the
        most over.
      </p>
      {choosing ? (
        <>
          <p className="ck-muted">
            {truck
              ? "Pick three dishes. Match the festival's tastes to draw a crowd."
              : `Pick ${PATH_RULES.menuMin} to ${PATH_RULES.menuMax} dishes from at least ${PATH_RULES.menuCuisines} kitchens. Variety keeps guests happy.`}
          </p>
          <DishPicker state={state} selected={picked} max={max} onChange={setPicked} />
        </>
      ) : (
        <ul className="ck-price-list">
          {menu.map((entry) => (
            <PriceRow key={entry.dishId} entry={entry} dispatch={dispatch} />
          ))}
        </ul>
      )}
    </Dialog>
  );
}

export function MenuDialog(props: MenuDialogProps) {
  return props.open ? <Body {...props} /> : null;
}
