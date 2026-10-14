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
  if (upgrade === undefined) return ["That upgrade does not exist."];
  return upgradeIssues(state.upgrades, upgrade, state.coins, state.reputation);
}

export function buyUpgrade<U extends string, S extends UpgradeShop<U>>(
  state: S,
  upgrade: ShopUpgrade<U> | undefined,
): S {
  if (upgrade === undefined || upgradePurchaseIssues(state, upgrade).length > 0) return state;
  return { ...state, coins: state.coins - upgrade.price, upgrades: [...state.upgrades, upgrade.id] };
}
