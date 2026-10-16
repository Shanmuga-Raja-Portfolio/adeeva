import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { LOFT_DECOR, type LoftDecorId } from "../../../content/loftDecor";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { loftDecorIssues, upgradeOpen, upgradePurchaseIssues, type GameState } from "../../../core";

interface LoftShopProps {
  readonly state: GameState;
  readonly onBuyUpgrade: (event: ClickLike, upgradeId: UpgradeId) => void;
  readonly onBuyDecor: (event: ClickLike, decorId: LoftDecorId) => void;
}

interface Row {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly owned: boolean;
  readonly issue: string | undefined;
  readonly buy: (event: ClickLike) => void;
}

function ShopRow({ row }: { readonly row: Row }) {
  return (
    <li className={row.owned ? "is-shop__row is-shop__row--owned" : "is-shop__row"}>
      <div>
        <strong>{row.name}</strong>
        <p className="is-muted">{row.description}</p>
      </div>
      {row.owned ? (
        <span className="is-shop__owned">
          <Icon name="check" size={16} /> Yours
        </span>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={row.buy}
          disabledReason={row.issue}
          aria-label={`Buy ${row.name}`}
        >
          <Icon name="coin" size={14} /> {row.price}
        </Button>
      )}
    </li>
  );
}

export function LoftShop({ state, onBuyUpgrade, onBuyDecor }: LoftShopProps) {
  const upgrades: Row[] = UPGRADES.filter((upgrade) => upgradeOpen(state, upgrade)).map((upgrade) => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    price: upgrade.price,
    owned: state.upgrades.includes(upgrade.id),
    issue: upgradePurchaseIssues(state, upgrade)[0],
    buy: (event) => onBuyUpgrade(event, upgrade.id),
  }));
  const decor: Row[] = LOFT_DECOR.filter((item) => upgradeOpen(state, item)).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    owned: state.loftDecor.includes(item.id),
    issue: loftDecorIssues(state, item.id)[0],
    buy: (event) => onBuyDecor(event, item.id),
  }));
  return (
    <Card title="The upgrade catalogue" eyebrow="One-time buys" className="is-hub-card">
      <h4 className="is-shop__heading">Studio tools</h4>
      <ul className="is-shop">
        {upgrades.map((row) => (
          <ShopRow key={row.id} row={row} />
        ))}
      </ul>
      <h4 className="is-shop__heading">
        {state.career === "development"
          ? "Loft and cabin decor (just for looks)"
          : "Loft decor (just for looks)"}
      </h4>
      <ul className="is-shop">
        {decor.map((row) => (
          <ShopRow key={row.id} row={row} />
        ))}
      </ul>
    </Card>
  );
}
