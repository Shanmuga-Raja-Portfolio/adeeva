import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { upgradeIssues, upgradeOpen, type GameState } from "../../../core";

export interface UpgradesPanelProps {
  readonly state: GameState;
  readonly onBuy: (upgradeId: UpgradeId, event: ClickLike) => void;
}

export function UpgradesPanel({ state, onBuy }: UpgradesPanelProps) {
  return (
    <Card
      title={state.profile.career === "boutique" ? "Shop upgrades" : "Stall upgrades"}
      eyebrow="One-time tools"
      className="tf-hub-card tf-upgrades"
    >
      <ul className="tf-upgrades__list">
        {UPGRADES.filter((upgrade) => upgradeOpen(state, upgrade.id)).map((upgrade) => {
          const owned = state.upgrades.includes(upgrade.id);
          const issues = upgradeIssues(state, upgrade.id);
          return (
            <li key={upgrade.id} className={owned ? "tf-upgrade tf-upgrade--owned" : "tf-upgrade"}>
              <div>
                <strong>{upgrade.name}</strong>
                <p>{upgrade.description}</p>
              </div>
              {owned ? (
                <span className="tf-upgrade__owned">
                  <Icon name="check" size={16} /> Yours
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => onBuy(upgrade.id, event)}
                  disabledReason={issues[0]}
                >
                  <Icon name="coin" size={14} /> {upgrade.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
