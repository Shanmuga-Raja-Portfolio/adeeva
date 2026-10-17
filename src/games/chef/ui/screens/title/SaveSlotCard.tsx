import { weekdayName } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { difficultyById, rungById } from "../../../core";
import type { SlotRead } from "../../chefSlots";
import { ApronHook } from "../../art/ApronHook";

const APRONS = ["#4f8a3c", "#3d4f9a", "#d9472b"] as const;

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
      <article className="ck-slot ck-slot--empty" data-testid={`slot-${read.slot}`}>
        <ApronHook colour={APRONS[(read.slot - 1) % APRONS.length] ?? "#4f8a3c"} />
        <div className="ck-slot__empty-copy">
          <span className="ad-eyebrow">{label}</span>
          <p className="ck-slot__empty">A clean apron on a hook, waiting for a new cook.</p>
          <Button variant="secondary" icon="sparkle" onClick={onNewGame}>
            Start here
          </Button>
        </div>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="ck-slot ck-slot--damaged" data-testid={`slot-${read.slot}`}>
        <span className="ad-eyebrow">{label}</span>
        <div className="ck-slot__warning" role="alert">
          <Icon name="lock" size={18} />
          <div>
            <strong>This save can't be opened.</strong>
            <p className="ck-slot__error">{read.error}</p>
          </div>
        </div>
        <div className="ck-slot__actions">
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
    <article className="ck-slot ck-slot--ready" data-testid={`slot-${read.slot}`}>
      <div className="ck-slot__head">
        <Avatar
          look={state.profile.look}
          size={64}
          title={`${state.profile.name}'s portrait`}
          frameColour="#f2d9a8"
        />
        <div>
          <span className="ad-eyebrow">{label}</span>
          <h3 className="ck-slot__name">{state.profile.name}</h3>
          <span className="ck-muted">
            {rungById(state.rung).name} · {difficultyById(state.profile.difficulty).name}
          </span>
          <span className="ck-slot__day">
            Day {state.calendar.day}, {weekdayName(state.calendar.day)}
          </span>
        </div>
      </div>
      <div className="ck-slot__stats">
        <StatChip kind="coins" value={state.coins} />
        <StatChip kind="reputation" value={state.reputation} />
      </div>
      <div className="ck-slot__actions">
        <Button variant="secondary" onClick={onNewGame} aria-label={`Start a new game in slot ${read.slot}`}>
          New game
        </Button>
        <Button onClick={onLoad} aria-label={`Load slot ${read.slot}`}>
          Load
        </Button>
      </div>
    </article>
  );
}
