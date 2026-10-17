import { weekdayName } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { difficultyById } from "../../../core";
import type { SlotRead } from "../../patisserieSlots";

export interface SaveSlotCardProps {
  readonly read: SlotRead;
  readonly onLoad: () => void;
  readonly onNewGame: () => void;
  readonly onDelete: () => void;
}

export function SaveSlotCard({ read, onLoad, onNewGame, onDelete }: SaveSlotCardProps) {
  const label = `Slot ${read.slot}`;
  if (read.kind === "empty") {
    return (
      <article className="pa-slot pa-slot--empty" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <p className="pa-slot__empty">An empty cake stand, waiting for a story.</p>
        <Button variant="secondary" icon="sparkle" onClick={onNewGame}>
          Start here
        </Button>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="pa-slot pa-slot--damaged" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <div className="pa-slot__warning" role="alert">
          <Icon name="lock" size={18} />
          <div>
            <strong>This save can't be opened.</strong>
            <p className="pa-slot__error">{read.error}</p>
          </div>
        </div>
        <div className="pa-slot__actions">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete save
          </Button>
          <Button variant="secondary" size="sm" onClick={onNewGame}>
            Start over here
          </Button>
        </div>
      </article>
    );
  }
  const { state } = read;
  return (
    <article className="pa-slot pa-slot--ready" data-testid={`slot-${read.slot}`}>
      <div className="pa-slot__head">
        <Avatar look={state.profile.look} size={56} title={`${state.profile.name}'s portrait`} />
        <div>
          <span className="ad-eyebrow">{label}</span>
          <h3 className="pa-slot__name">{state.profile.name}</h3>
          <span className="pa-muted">Corner Baker · {difficultyById(state.profile.difficulty).name}</span>
          <span className="pa-slot__day">
            Day {state.calendar.day}, {weekdayName(state.calendar.day)}
          </span>
        </div>
        <div className="pa-slot__stats">
          <StatChip kind="coins" value={state.coins} />
          <StatChip kind="reputation" value={state.reputation} />
        </div>
      </div>
      <div className="pa-slot__actions">
        <Button variant="ghost" onClick={onNewGame} aria-label={`Start a new game in slot ${read.slot}`}>
          Start over
        </Button>
        <Button onClick={onLoad} aria-label={`Load slot ${read.slot}`}>
          Load
        </Button>
      </div>
    </article>
  );
}
