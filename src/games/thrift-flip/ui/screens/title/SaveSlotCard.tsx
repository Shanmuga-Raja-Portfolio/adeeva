import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { difficultyById, signById } from "../../../core";
import { PriceTag } from "../../art/PriceTag";
import type { SlotRead } from "../../thriftSlots";
import { stallDayName } from "../stallDayName";

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
      <article className="tf-slot tf-slot--empty" data-testid={`slot-${read.slot}`}>
        <PriceTag tone="cream" tilt={-2}>
          <span className="ad-eyebrow">{label}</span>
          <p className="tf-slot__empty-text">An empty hanger, waiting for a story.</p>
          <Button variant="secondary" size="sm" onClick={onNewGame}>
            Start here
          </Button>
        </PriceTag>
      </article>
    );
  }
  if (read.kind === "damaged") {
    return (
      <article className="tf-slot tf-slot--damaged" data-testid={`slot-${read.slot}`}>
        <PriceTag tone="tangerine" tilt={1}>
          <span className="ad-eyebrow">{label}</span>
          <div className="tf-slot__warning" role="alert">
            <Icon name="lock" size={18} />
            <div>
              <strong>This save can't be opened.</strong>
              <p className="tf-slot__error">{read.error}</p>
            </div>
          </div>
          <div className="tf-slot__actions">
            <Button variant="ghost" size="sm" onClick={onDelete}>
              Delete save
            </Button>
            <Button variant="secondary" size="sm" onClick={onNewGame}>
              Start over here
            </Button>
          </div>
        </PriceTag>
      </article>
    );
  }
  const { state } = read;
  return (
    <article className="tf-slot tf-slot--ready" data-testid={`slot-${read.slot}`}>
      <PriceTag tilt={read.slot % 2 === 0 ? 1.5 : -1.5}>
        <div className="tf-slot__head">
          <Avatar
            look={state.profile.look}
            size={60}
            frameColour="#fde4cf"
            title={`${state.profile.name}'s portrait`}
          />
          <div>
            <span className="ad-eyebrow">{label}</span>
            <h3 className="tf-slot__name">{state.profile.name}</h3>
            <span className="tf-slot__meta">
              Day {state.calendar.day}, {stallDayName(state.calendar.day, state.profile.career)} ·{" "}
              {difficultyById(state.profile.difficulty).name}
            </span>
            <span className="tf-slot__place" data-testid="slot-place">
              {state.boutique === null
                ? "Market stall"
                : `Boutique · ${signById(state.boutique.signId).name}`}
            </span>
          </div>
        </div>
        <div className="tf-slot__stats">
          <StatChip kind="coins" value={state.coins} />
          <StatChip kind="reputation" value={state.reputation} />
        </div>
        <div className="tf-slot__actions">
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
      </PriceTag>
    </article>
  );
}
