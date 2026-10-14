import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import { upgradeIssues, type GameState } from "../../../core";

export interface UpgradesPanelProps {
  readonly state: GameState;
  readonly onBuy: (event: ClickLike, upgradeId: UpgradeId) => void;
}

export function UpgradesPanel({ state, onBuy }: UpgradesPanelProps) {
  return (
    <Card
      title={state.career === "salon" ? "Bakery and parlour upgrades" : "Bakery upgrades"}
      eyebrow="One-time buys"
      className="pa-hub-card"
    >
      <ul className="pa-upgrades">
        {UPGRADES.filter((upgrade) => upgrade.career === null || upgrade.career === state.career).map(
          (upgrade) => {
            const owned = state.upgrades.includes(upgrade.id);
            const issue = upgradeIssues(state, upgrade.id)[0];
            return (
              <li key={upgrade.id} className={owned ? "pa-upgrade pa-upgrade--owned" : "pa-upgrade"}>
                <div>
                  <strong>{upgrade.name}</strong>
                  <p className="pa-muted">{upgrade.description}</p>
                </div>
                {owned ? (
                  <span className="pa-upgrade__owned">
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
          },
        )}
      </ul>
    </Card>
  );
}
