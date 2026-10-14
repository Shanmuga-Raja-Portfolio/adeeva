import { weekdayName } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { CAREER } from "../../../content/career";
import { difficultyById } from "../../../core";
import type { SlotRead } from "../../jewellerySlots";

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
      <article className="jb-slot jb-slot--empty" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <p className="jb-slot__empty">An empty velvet tray, waiting for its first treasure.</p>
        <Button variant="secondary" size="sm" onClick={onNewGame}>
          Start here
        </Button>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="jb-slot jb-slot--damaged" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <div className="jb-slot__warning" role="alert">
          <Icon name="lock" size={18} />
          <div>
            <strong>This save can't be opened.</strong>
            <p className="jb-slot__error">{read.error}</p>
          </div>
        </div>
        <div className="jb-slot__actions">
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
    <article className="jb-slot jb-slot--ready" data-testid={`slot-${read.slot}`}>
      <div className="jb-slot__head">
        <Avatar
          look={state.profile.look}
          size={64}
          title={`${state.profile.name}'s portrait`}
          frameColour="#d9e9ea"
        />
        <div>
          <span className="ad-eyebrow">{label}</span>
          <h3 className="jb-slot__name">{state.profile.name}</h3>
          <span className="jb-muted">
            {CAREER.name} · {difficultyById(state.profile.difficulty).name}
          </span>
        </div>
      </div>
      <p className="jb-slot__day">
        Day {state.calendar.day}, {weekdayName(state.calendar.day)}
      </p>
      <div className="jb-slot__stats">
        <StatChip kind="coins" value={state.coins} />
        <StatChip kind="reputation" value={state.reputation} />
      </div>
      <div className="jb-slot__actions">
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
    </article>
  );
}
