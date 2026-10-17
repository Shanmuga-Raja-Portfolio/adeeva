import type { ReactNode } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import type { GameState } from "../../../core";

export interface LoftHeaderProps {
  readonly state: GameState;
  readonly eyebrow: string;
  readonly title: string;
  readonly onExit: () => void;
  readonly exitLabel?: string | undefined;
  readonly children?: ReactNode;
}

export function LoftHeader({
  state,
  eyebrow,
  title,
  onExit,
  exitLabel = "Back to the loft",
  children,
}: LoftHeaderProps) {
  return (
    <header className="jb-loft-header">
      <Button variant="ghost" icon="back" onClick={onExit} data-testid="loft-exit">
        {exitLabel}
      </Button>
      <div className="jb-loft-header__title">
        <span className="ad-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="jb-loft-header__stats">
        {children}
        <StatChip kind="day" value={state.calendar.day} />
        <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        <span data-testid="loft-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
      </div>
    </header>
  );
}
