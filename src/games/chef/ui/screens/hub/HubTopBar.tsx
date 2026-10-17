import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { pathById, rungById, type GameState } from "../../../core";
import { Wordmark } from "../../art/Wordmark";
import { StatUnit } from "../../StatUnit";

export interface HubTopBarProps {
  readonly state: GameState;
  readonly onOpenSettings: () => void;
  readonly onExit: () => void;
}

export function HubTopBar({ state, onOpenSettings, onExit }: HubTopBarProps) {
  const { calendar } = state;
  return (
    <header className="ck-bar">
      <Wordmark compact heading={false} />
      <div className="ck-bar__stats">
        <div className="ck-bar__tray">
          <span data-testid="stat-day">
            <StatChip kind="day" value={`Day ${calendar.day} · ${weekdayName(calendar.day).slice(0, 3)}`} />
          </span>
          <span data-testid="stat-hours">
            <StatChip kind="hours" value={<StatUnit value={calendar.hoursLeft} unit="h left" />} />
          </span>
          <span data-testid="stat-coins">
            <StatChip kind="coins" value={<StatUnit value={state.coins} unit="coins" />} />
          </span>
          <span data-testid="stat-reputation">
            <StatChip kind="reputation" value={<StatUnit value={state.reputation} unit="rep" />} />
          </span>
          <span data-testid="stat-buzz">
            <StatChip kind="buzz" value={<StatUnit value={state.buzz} unit="buzz" />} />
          </span>
        </div>
        <span className="ck-bar__rung">
          <span className="ck-bar__rung-badge" aria-hidden="true">
            <Icon name="star" size={15} />
          </span>
          {state.path === null ? rungById(state.rung).name : pathById(state.path.kind).venue}
        </span>
      </div>
      <div className="ck-bar__actions">
        <Button variant="ghost" size="sm" icon="gear" onClick={onOpenSettings}>
          Settings
        </Button>
        <Button variant="secondary" size="sm" onClick={onExit} data-testid="save-exit">
          Save &amp; exit
        </Button>
      </div>
    </header>
  );
}
