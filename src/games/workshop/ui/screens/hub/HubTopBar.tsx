import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import type { GameState } from "../../../core";
import { Wordmark } from "../../art/Wordmark";

export interface HubTopBarProps {
  readonly state: GameState;
  readonly onOpenSettings: () => void;
  readonly onExit: () => void;
}

export function HubTopBar({ state, onOpenSettings, onExit }: HubTopBarProps) {
  const { calendar } = state;
  return (
    <header className="ww-hub-bar ad-pinned-head">
      <Wordmark compact />
      <div className="ww-hub-bar__stats ad-pinned-head__stats">
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
          <StatChip kind="reputation" value={state.reputation} showLabel />
        </span>
        <span data-testid="stat-buzz">
          <StatChip kind="buzz" value={state.buzz} showLabel />
        </span>
      </div>
      <div className="ww-hub-bar__actions">
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
