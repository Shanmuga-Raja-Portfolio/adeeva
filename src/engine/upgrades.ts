export interface UpgradeCore {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly minReputation: number;
}

export function upgradeIssues(
  owned: readonly string[],
  upgrade: UpgradeCore,
  coins: number,
  reputation: number,
): string[] {
  const issues: string[] = [];
  if (owned.includes(upgrade.id)) issues.push(`${upgrade.name} is already yours.`);
  if (reputation < upgrade.minReputation)
    issues.push(`${upgrade.name} unlocks at reputation ${upgrade.minReputation}.`);
  if (coins < upgrade.price) issues.push(`${upgrade.name} costs ${upgrade.price} coins.`);
  return issues;
}

type Shelf<K extends string> = { readonly coins: number; readonly reputation: number } & {
  readonly [P in K]: readonly string[];
};

export function shelfPurchaseIssues<K extends string>(
  state: Shelf<K>,
  shelf: K,
  item: UpgradeCore | undefined,
  missing: string,
): string[] {
  if (item === undefined) return [missing];
  return upgradeIssues(state[shelf], item, state.coins, state.reputation);
}

export function buyForShelf<K extends string, S extends Shelf<K>>(
  state: S,
  shelf: K,
  item: UpgradeCore | undefined,
  missing: string,
): S {
  if (item === undefined || shelfPurchaseIssues(state, shelf, item, missing).length > 0) return state;
  return { ...state, coins: state.coins - item.price, [shelf]: [...state[shelf], item.id] };
}

const MISSING_UPGRADE = "That upgrade does not exist.";

export interface UpgradeShop<U extends string> {
  readonly coins: number;
  readonly reputation: number;
  readonly upgrades: readonly U[];
}

export type ShopUpgrade<U extends string> = UpgradeCore & { readonly id: U };

export function upgradePurchaseIssues<U extends string>(
  state: UpgradeShop<U>,
  upgrade: ShopUpgrade<U> | undefined,
): string[] {
  return shelfPurchaseIssues(state, "upgrades", upgrade, MISSING_UPGRADE);
}

export function buyUpgrade<U extends string, S extends UpgradeShop<U>>(
  state: S,
  upgrade: ShopUpgrade<U> | undefined,
): S {
  return buyForShelf(state, "upgrades", upgrade, MISSING_UPGRADE);
}
