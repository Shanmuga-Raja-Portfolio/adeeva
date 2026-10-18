import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
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
        <PriceTag tone="cream" tilt={0}>
          <svg className="tf-slot__hanger" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path
              d="M32 10 q7 0 7 6 q0 5 -7 7 v5 M6 48 L32 30 L58 48 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="ad-eyebrow">{label}</span>
          <p className="tf-slot__empty-text">Empty</p>
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
      <PriceTag tone="cream" tilt={0}>
        <div className="tf-slot__head">
          <Avatar
            look={state.profile.look}
            size={54}
            frameColour="#fde4cf"
            title={`${state.profile.name}'s portrait`}
          />
          <div>
            <span className="ad-eyebrow">{label}</span>
            <h3 className="tf-slot__name">{state.profile.name}</h3>
            <span className="tf-slot__meta">
              Day {state.calendar.day}, {stallDayName(state.calendar.day, state.profile.career)}
            </span>
            <span className="tf-slot__badges">
              <span className="tf-slot__place" data-testid="slot-place">
                <Icon name={state.boutique === null ? "bag" : "home"} size={14} />
                {state.boutique === null
                  ? "Market stall"
                  : `Boutique · ${signById(state.boutique.signId).name}`}
              </span>
              <span className="tf-slot__level">{difficultyById(state.profile.difficulty).name}</span>
            </span>
          </div>
        </div>
        <div className="tf-slot__foot">
          <div className="tf-slot__stats">
            <span>
              <Icon name="coin" size={18} />
              <strong>{state.coins}</strong> coins
            </span>
            <span>
              <Icon name="star" size={18} />
              <strong>{state.reputation}</strong> reputation
            </span>
          </div>
          <Button icon="hanger" onClick={onLoad} aria-label={`Load slot ${read.slot}`}>
            Load
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="tf-slot__restart"
          onClick={onNewGame}
          aria-label={`Start a new game in slot ${read.slot}`}
        >
          Start over
        </Button>
      </PriceTag>
    </article>
  );
}
