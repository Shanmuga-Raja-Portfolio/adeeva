import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { upgradePurchaseIssues, type GameState } from "../../../core";

export interface UpgradesPanelProps {
  readonly state: GameState;
  readonly onBuy: (event: ClickLike, upgradeId: UpgradeId) => void;
}

export function UpgradesPanel({ state, onBuy }: UpgradesPanelProps) {
  return (
    <Card title="Garage upgrades" eyebrow="One-time buys" className="ww-hub-card">
      <ul className="ww-shop">
        {UPGRADES.map((upgrade) => {
          const owned = state.upgrades.includes(upgrade.id);
          const issue = upgradePurchaseIssues(state, upgrade)[0];
          return (
            <li key={upgrade.id} className={owned ? "ww-shop__item ww-shop__item--owned" : "ww-shop__item"}>
              <div>
                <strong>{upgrade.name}</strong>
                <p className="ww-muted">{upgrade.description}</p>
              </div>
              {owned ? (
                <span className="ww-shop__owned">
                  <Icon name="check" size={16} /> Yours
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => onBuy(event, upgrade.id)}
                  disabledReason={issue}
                  aria-label={`Buy ${upgrade.name} for ${upgrade.price} coins`}
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
