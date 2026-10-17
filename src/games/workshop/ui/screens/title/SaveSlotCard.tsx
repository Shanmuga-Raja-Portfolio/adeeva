import { weekdayName } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { careerById, difficultyById } from "../../../core";
import type { SlotRead } from "../../workshopSlots";

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
      <article className="ww-slot ww-slot--empty" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <p className="ww-slot__empty">An empty workbench, waiting for its first sawdust.</p>
        <Button variant="secondary" size="sm" onClick={onNewGame}>
          Start here
        </Button>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="ww-slot ww-slot--damaged" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <div className="ww-slot__warning" role="alert">
          <Icon name="lock" size={18} />
          <div>
            <strong>This save can't be opened.</strong>
            <p className="ww-slot__error">{read.error}</p>
          </div>
        </div>
        <div className="ww-slot__actions">
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
    <article className="ww-slot ww-slot--ready" data-testid={`slot-${read.slot}`}>
      <div className="ww-slot__head">
        <Avatar
          look={state.profile.look}
          size={64}
          title={`${state.profile.name}'s portrait`}
          frameColour="#f3dcc0"
        />
        <div>
          <span className="ad-eyebrow">{label}</span>
          <h3 className="ww-slot__name">{state.profile.name}</h3>
          <span className="ww-muted">
            {careerById(state.career).name} · {difficultyById(state.profile.difficulty).name}
          </span>
          <p className="ww-slot__day">
            Day {state.calendar.day}, {weekdayName(state.calendar.day)}
          </p>
        </div>
      </div>
      <div className="ww-slot__foot">
        <div className="ww-slot__stats">
          <StatChip kind="coins" value={state.coins} />
          <StatChip kind="reputation" value={state.reputation} />
        </div>
        <div className="ww-slot__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewGame}
            aria-label={`Start a new game in slot ${read.slot}`}
          >
            New game
          </Button>
          <Button size="sm" onClick={onLoad} aria-label={`Load slot ${read.slot}`}>
            Load
          </Button>
        </div>
      </div>
    </article>
  );
}
