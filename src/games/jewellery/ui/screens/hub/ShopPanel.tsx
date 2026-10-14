import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { DECOR, type DecorId } from "../../../content/decor";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { decorIssues, upgradePurchaseIssues, type GameState } from "../../../core";

interface ShopPanelProps {
  readonly state: GameState;
  readonly onBuyUpgrade: (event: ClickLike, upgradeId: UpgradeId) => void;
  readonly onBuyDecor: (event: ClickLike, decorId: DecorId) => void;
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
    <li className={row.owned ? "jb-shop__row jb-shop__row--owned" : "jb-shop__row"}>
      <div>
        <strong>{row.name}</strong>
        <p className="jb-muted">{row.description}</p>
      </div>
      {row.owned ? (
        <span className="jb-shop__owned">
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

export function ShopPanel({ state, onBuyUpgrade, onBuyDecor }: ShopPanelProps) {
  const upgrades: Row[] = UPGRADES.map((upgrade) => ({
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    price: upgrade.price,
    owned: state.upgrades.includes(upgrade.id),
    issue: upgradePurchaseIssues(state, upgrade)[0],
    buy: (event) => onBuyUpgrade(event, upgrade.id),
  }));
  const decor: Row[] = DECOR.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    owned: state.decor.includes(item.id),
    issue: decorIssues(state, item.id)[0],
    buy: (event) => onBuyDecor(event, item.id),
  }));
  return (
    <Card title="Mr. Osei's catalogue" eyebrow="One-time buys" className="jb-hub-card">
      <h4 className="jb-shop__heading">Bench upgrades</h4>
      <ul className="jb-shop">
        {upgrades.map((row) => (
          <ShopRow key={row.id} row={row} />
        ))}
      </ul>
      <h4 className="jb-shop__heading">Stall decor (just for looks)</h4>
      <ul className="jb-shop">
        {decor.map((row) => (
          <ShopRow key={row.id} row={row} />
        ))}
      </ul>
    </Card>
  );
}
