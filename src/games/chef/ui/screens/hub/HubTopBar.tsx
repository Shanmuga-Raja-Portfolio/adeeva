import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { rungById, type GameState } from "../../../core";
import { Wordmark } from "../../art/Wordmark";

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
        <span data-testid="stat-day">
          <StatChip kind="day" value={`Day ${calendar.day} · ${weekdayName(calendar.day).slice(0, 3)}`} />
        </span>
        <span data-testid="stat-hours">
          <StatChip kind="hours" value={`${calendar.hoursLeft} h`} />
        </span>
        <span data-testid="stat-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        <span data-testid="stat-reputation">
          <StatChip kind="reputation" value={state.reputation} />
        </span>
        <span data-testid="stat-buzz">
          <StatChip kind="buzz" value={state.buzz} />
        </span>
        <span className="ck-bar__rung">{rungById(state.rung).name}</span>
      </div>
      <div className="ck-bar__actions">
        <Button variant="ghost" size="sm" onClick={onOpenSettings}>
          Settings
        </Button>
        <Button variant="secondary" size="sm" onClick={onExit} data-testid="save-exit">
          Save &amp; exit
        </Button>
      </div>
    </header>
  );
}
