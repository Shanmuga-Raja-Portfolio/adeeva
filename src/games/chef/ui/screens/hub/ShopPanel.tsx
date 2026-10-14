import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { upgradePurchaseIssues, type GameState } from "../../../core";
import { ToolIcon } from "../../art/ToolIcon";

export interface ShopPanelProps {
  readonly state: GameState;
  readonly onBuy: (event: ClickLike, upgradeId: UpgradeId) => void;
}

export function ShopPanel({ state, onBuy }: ShopPanelProps) {
  return (
    <section className="ck-panel ck-shop" aria-labelledby="ck-shop-title">
      <header className="ck-panel__header">
        <h2 id="ck-shop-title">Tool shop</h2>
        <span className="ck-muted">Your own kit, yours to keep</span>
      </header>
      <ul className="ck-shop__list">
        {UPGRADES.map((upgrade) => {
          const owned = state.upgrades.includes(upgrade.id);
          const issue = upgradePurchaseIssues(state, upgrade)[0];
          return (
            <li key={upgrade.id} className={owned ? "ck-shop__item ck-shop__item--owned" : "ck-shop__item"}>
              <span className="ck-shop__icon">
                <ToolIcon tool={upgrade.id} />
              </span>
              <span className="ck-shop__copy">
                <strong>{upgrade.name}</strong>
                <span className="ck-muted">{upgrade.description}</span>
              </span>
              {owned ? (
                <span className="ck-shop__owned">
                  <Icon name="check" size={16} /> Yours
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => onBuy(event, upgrade.id)}
                  disabledReason={issue}
                >
                  <Icon name="coin" size={14} /> {upgrade.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
