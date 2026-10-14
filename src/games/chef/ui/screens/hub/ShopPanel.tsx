import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { kitUpgradeIssues, upgradeShown, type GameState } from "../../../core";
import { ToolIcon } from "../../art/ToolIcon";

export interface ShopPanelProps {
  readonly state: GameState;
  readonly onBuy: (event: ClickLike, upgradeId: UpgradeId) => void;
}

export function ShopPanel({ state, onBuy }: ShopPanelProps) {
  const restaurant = state.path?.kind === "restaurant";
  return (
    <section className="ck-panel ck-shop" aria-labelledby="ck-shop-title">
      <header className="ck-panel__header">
        <h2 id="ck-shop-title">{restaurant ? "Kitchen shop" : "Tool shop"}</h2>
        <span className="ck-muted">
          {restaurant ? "Tools and kitchen upgrades" : "Your own kit, yours to keep"}
        </span>
      </header>
      <ul className="ck-shop__list">
        {UPGRADES.filter((upgrade) => upgradeShown(state, upgrade.id)).map((upgrade) => {
          const owned = state.upgrades.includes(upgrade.id);
          const issue = kitUpgradeIssues(state, upgrade.id)[0];
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
                  data-testid={`buy-${upgrade.id}`}
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
