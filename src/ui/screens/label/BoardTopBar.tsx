import type { GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { StatChip } from "../../kit/StatChip";

export interface BoardTopBarProps {
  state: GameState;
  title: string;
  backLabel: string;
  onBack: () => void;
}

export function BoardTopBar({ state, title, backLabel, onBack }: BoardTopBarProps) {
  return (
    <div className="ad-label-bar">
      <Button variant="ghost" onClick={onBack}>
        ‹ {backLabel}
      </Button>
      <span className="ad-label-bar__title">{title}</span>
      <div className="ad-label-bar__stats">
        <StatChip kind="day" value={`Day ${state.calendar.day}`} />
        <StatChip kind="coins" value={state.coins} />
        <StatChip kind="reputation" value={state.reputation} />
      </div>
    </div>
  );
}
