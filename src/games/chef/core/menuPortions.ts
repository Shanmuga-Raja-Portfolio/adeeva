import type { MenuDish } from "./path";

export function menuPortions(menu: readonly MenuDish[]): number {
  return menu.reduce((sum, entry) => sum + entry.par, 0);
}
