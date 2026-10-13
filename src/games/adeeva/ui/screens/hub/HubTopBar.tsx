import { hoursPerDay, type GameState } from "../../../core";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { Wordmark } from "../title/Wordmark";
import { weekdayName } from "../../../../../engine/weekday";

export interface HubTopBarProps {
  state: GameState;
  onOpenSettings: () => void;
  onExit: () => void;
}

export function HubTopBar({ state, onOpenSettings, onExit }: HubTopBarProps) {
  const { calendar } = state;
  return (
    <header className="ad-hub-bar">
      <Wordmark compact />
      <div className="ad-hub-bar__stats">
        <span data-testid="stat-day">
          <StatChip kind="day" value={`Day ${calendar.day} · ${weekdayName(calendar.day).slice(0, 3)}`} />
        </span>
        <span data-testid="stat-hours">
          <StatChip kind="hours" value={`${calendar.hoursLeft} / ${hoursPerDay(state.studio)} h`} />
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
      </div>
      <div className="ad-hub-bar__actions">
        <Button variant="ghost" size="sm" onClick={onOpenSettings}>
          Settings
        </Button>
        <Button variant="secondary" size="sm" onClick={onExit}>
          Save &amp; exit
        </Button>
      </div>
    </header>
  );
}
