import type { SlotRead } from "../../adeevaSlots";
import { careerById, difficultyById } from "../../../core";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { weekdayName } from "../../../../../engine/weekday";

export interface SaveSlotCardProps {
  read: SlotRead;
  onLoad: () => void;
  onNewGame: () => void;
  onDelete: () => void;
}

export function SaveSlotCard({ read, onLoad, onNewGame, onDelete }: SaveSlotCardProps) {
  const label = `Slot ${read.slot}`;
  if (read.kind === "empty") {
    return (
      <article className="ad-slot ad-slot--empty" data-testid={`slot-${read.slot}`}>
        <div className="ad-slot__empty-art" aria-hidden="true">
          <Icon name="hanger" size={26} />
        </div>
        <div className="ad-slot__who">
          <span className="ad-eyebrow">{label}</span>
          <p className="ad-slot__empty-text">An empty rail</p>
        </div>
        <Button variant="secondary" icon="sparkle" onClick={onNewGame}>
          Start here
        </Button>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="ad-slot ad-slot--damaged" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <div className="ad-slot__warning" role="alert">
          <Icon name="lock" size={18} />
          <div>
            <strong>This save can't be opened.</strong>
            <p className="ad-slot__error">{read.error}</p>
          </div>
        </div>
        <div className="ad-slot__actions">
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
  const career = careerById(state.profile.career);
  const difficulty = difficultyById(state.profile.difficulty);
  return (
    <article className="ad-slot ad-slot--ready" data-testid={`slot-${read.slot}`}>
      <div className="ad-slot__head">
        <Avatar look={state.profile.look} size={60} title={`${state.profile.name}'s portrait`} />
        <div className="ad-slot__who">
          <span className="ad-eyebrow">{label}</span>
          <h3 className="ad-slot__name">{state.profile.name}</h3>
          <span className="ad-slot__career">
            {career.name} · {difficulty.name}
          </span>
        </div>
        <div className="ad-slot__stats">
          <StatChip kind="coins" value={state.coins} />
          <StatChip kind="reputation" value={state.reputation} />
        </div>
      </div>
      <div className="ad-slot__foot">
        <p className="ad-slot__day">
          <Icon name="calendar" size={16} /> Day {state.calendar.day}, {weekdayName(state.calendar.day)}
        </p>
        <div className="ad-slot__actions">
          <Button variant="ghost" onClick={onNewGame} aria-label={`Start a new game in slot ${read.slot}`}>
            New game
          </Button>
          <Button onClick={onLoad} aria-label={`Load slot ${read.slot}`}>
            Load
          </Button>
        </div>
      </div>
    </article>
  );
}
