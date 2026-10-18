import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import type { GameState } from "../../../core";
import { Awning } from "../../art/Awning";
import { Wordmark } from "../../art/Wordmark";

export interface HubTopBarProps {
  readonly state: GameState;
  readonly onOpenSettings: () => void;
  readonly onExit: () => void;
}

export function HubTopBar({ state, onOpenSettings, onExit }: HubTopBarProps) {
  return (
    <header className="tf-hub-top ad-pinned-head">
      <Awning className="tf-hub-top__awning" />
      <div className="tf-hub-top__row">
        <Wordmark compact />
        <div className="tf-hub-top__who">
          <Avatar
            look={state.profile.look}
            size={44}
            frameColour="#fde4cf"
            title={`${state.profile.name}'s portrait`}
          />
          <strong>{state.profile.name}</strong>
        </div>
        <div className="tf-hub-top__stats" role="group" aria-label="Your purse">
          <span data-testid="stat-coins">
            <StatChip kind="coins" value={state.coins} showLabel />
          </span>
          <StatChip kind="reputation" value={state.reputation} showLabel />
          <StatChip kind="buzz" value={state.buzz} showLabel />
        </div>
        <div className="tf-hub-top__actions">
          <Button variant="ghost" size="sm" icon="gear" onClick={onOpenSettings}>
            Settings
          </Button>
          <Button variant="ghost" size="sm" icon="home" onClick={onExit} data-testid="save-exit">
            Save & exit
          </Button>
        </div>
      </div>
    </header>
  );
}
