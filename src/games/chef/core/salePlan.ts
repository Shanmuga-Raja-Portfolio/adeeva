import { sellWithSpill, wantedPortions } from "../../../engine/demandShare";
import { PATH_RULES } from "../content/career";
import type { TasteTag } from "../content/tasteTag";
import { dishById } from "./catalog";
import { dishAppeal } from "./dishDemand";
import { dishCostTenths, fairPrice } from "./dishCost";
import type { GameState } from "./gameState";
import type { DishSale, MenuDish, SalePlan, StockCount } from "./path";

export interface SaleTerms {
  readonly day: number;
  readonly guests: number;
  readonly seats: number;
  readonly menu: readonly MenuDish[];
  readonly carried: readonly StockCount[];
  readonly crowdTags: readonly TasteTag[];
}

export function coinsForPortions(
  entries: readonly { readonly dishId: MenuDish["dishId"]; readonly count: number }[],
) {
  const tenths = entries.reduce(
    (sum, entry) => sum + entry.count * dishCostTenths(dishById(entry.dishId)),
    0,
  );
  return Math.ceil(tenths / 10);
}

export function planSale(state: GameState, terms: SaleTerms): SalePlan {
  const items = terms.menu.map((entry) => ({
    appeal: dishAppeal(state, entry.dishId, terms.crowdTags),
    price: entry.price,
    fair: fairPrice(dishById(entry.dishId)),
  }));
  const wanted = wantedPortions(terms.guests, PATH_RULES.platesPerGuest, items);
  const stock = terms.menu.map((entry) => entry.par);
  const split = sellWithSpill(wanted, stock);
  const dishes: DishSale[] = terms.menu.map((entry, index) => {
    const carried = terms.carried.find((item) => item.dishId === entry.dishId)?.count ?? 0;
    const sold = split.sold[index] ?? 0;
    return {
      dishId: entry.dishId,
      price: entry.price,
      stock: entry.par,
      bought: Math.max(0, entry.par - carried),
      wanted: wanted[index] ?? 0,
      sold,
      leftover: entry.par - sold,
    };
  });
  return {
    day: terms.day,
    guests: terms.guests,
    seats: terms.seats,
    dishes,
    ingredients: coinsForPortions(dishes.map((dish) => ({ dishId: dish.dishId, count: dish.bought }))),
    keptSimple: split.unmet,
  };
}

export function plateCoins(plan: SalePlan): number {
  return plan.dishes.reduce((sum, dish) => sum + dish.sold * dish.price, 0);
}

export function unservedCoins(plan: SalePlan, kept: readonly StockCount[]): number {
  return coinsForPortions(
    plan.dishes.map((dish) => ({
      dishId: dish.dishId,
      count: Math.max(0, dish.leftover - (kept.find((item) => item.dishId === dish.dishId)?.count ?? 0)),
    })),
  );
}
