import type { ClickLike } from "../../kit/useDispatchOnce";
import { UPGRADES, type UpgradeId } from "../../../content/upgrade";
import {
  assistantHireCost,
  assistantWage,
  assistantHireIssue,
  upgradePurchaseIssues,
  type GameState,
} from "../../../core";
import { Button } from "../../kit/Button";
import { Card } from "../../kit/Card";
import { Icon, type IconName } from "../../kit/IconSet";
import "./studioPanel.css";

export interface StudioPanelProps {
  state: GameState;
  onBuy: (upgradeId: UpgradeId, event: ClickLike) => void;
  onHire: (event: ClickLike) => void;
  onFire: (event: ClickLike) => void;
}

const upgradeIcons: Record<UpgradeId, IconName> = {
  "pro-machine": "needle",
  "big-table": "scissors",
  "fabric-shelf": "bag",
  "mood-board": "palette",
};

export function StudioPanel({ state, onBuy, onHire, onFire }: StudioPanelProps) {
  const hired = state.studio.assistantHired;
  const hireIssue = assistantHireIssue(state);
  const hireCost = assistantHireCost(state);
  return (
    <Card title="Your studio" eyebrow="Upgrades & help" className="ad-hub-card">
      <ul className="ad-upgrades">
        {UPGRADES.map((upgrade) => {
          const owned = state.studio.upgrades.includes(upgrade.id);
          const issues = owned ? [] : upgradePurchaseIssues(state, upgrade.id);
          return (
            <li key={upgrade.id} className={owned ? "ad-upgrade ad-upgrade--owned" : "ad-upgrade"}>
              <span className="ad-upgrade__icon">
                <Icon name={upgradeIcons[upgrade.id]} size={20} />
              </span>
              <span className="ad-upgrade__name">{upgrade.name}</span>
              <span className="ad-upgrade__text">
                <span>{upgrade.description}</span>
                {issues.length > 0 ? <span className="ad-reason">{issues.join(" ")}</span> : null}
              </span>
              {owned ? (
                <span className="ad-upgrade__owned">
                  <Icon name="check" size={16} /> Installed
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => onBuy(upgrade.id, event)}
                  disabledReason={issues.length > 0 ? issues.join(" ") : undefined}
                  aria-label={`Buy ${upgrade.name} for ${upgrade.price} coins`}
                >
                  <Icon name="coin" size={14} /> {upgrade.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className={hired ? "ad-assistant ad-assistant--hired" : "ad-assistant"}>
        <span className="ad-assistant__icon">
          <Icon name="heart" size={20} />
        </span>
        <span className="ad-upgrade__name">{hired ? "Your assistant is in" : "Studio assistant"}</span>
        <span className="ad-assistant__text">
          <span>
            Sewing takes an hour less and cutting is more forgiving. {assistantWage(state)} coins a week.
          </span>
          {!hired && hireIssue !== null ? <span className="ad-reason">{hireIssue}</span> : null}
        </span>
        {hired ? (
          <Button size="sm" variant="ghost" onClick={onFire}>
            Let go
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={onHire} disabledReason={hireIssue ?? undefined}>
            {hireCost > 0 ? `Hire · ${hireCost}` : "Hire · paid"}
          </Button>
        )}
      </div>
    </Card>
  );
}
