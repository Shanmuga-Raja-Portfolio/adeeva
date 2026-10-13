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
