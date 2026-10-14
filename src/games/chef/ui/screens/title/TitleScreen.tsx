import { useState } from "react";
import { weekdayName } from "../../../../../engine/weekday";
import { slotSummary } from "../../../../../studio/slotSummary";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { DishId } from "../../../content/dish";
import { dishById, ghostLayout, type GameState } from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import { PlateArt } from "../../art/PlateArt";
import { Wordmark } from "../../art/Wordmark";
import { chefSlots, type SaveSlotId, type SlotRead } from "../../chefSlots";
import { SaveSlotCard } from "./SaveSlotCard";
import "./title.css";

export interface TitleScreenProps {
  readonly slots: readonly SlotRead[];
  readonly canSave: boolean;
  readonly onLoad: (slot: SaveSlotId, game: GameState) => void;
  readonly onNewGame: (slot: SaveSlotId) => void;
  readonly onDeleteSlot: (slot: SaveSlotId) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToStudio: () => void;
}

type Pending =
  | { readonly kind: "none" }
  | { readonly kind: "pick-slot" }
  | { readonly kind: "overwrite"; readonly read: SlotRead }
  | { readonly kind: "delete"; readonly read: SlotRead };

const SHOWCASE: readonly { readonly dishId: DishId; readonly colour: "white" | "slate" | "sand" }[] = [
  { dishId: "jollof-rice", colour: "sand" },
  { dishId: "spaghetti-al-pomodoro", colour: "white" },
  { dishId: "elote", colour: "slate" },
];

export function TitleScreen({
  slots,
  canSave,
  onLoad,
  onNewGame,
  onDeleteSlot,
  onOpenSettings,
  onExitToStudio,
}: TitleScreenProps) {
  const [pending, setPending] = useState<Pending>({ kind: "none" });
  const resume = chefSlots.continueSlot(slots);
  const closePending = () => setPending({ kind: "none" });

  const requestNewGame = (read: SlotRead) => {
    if (read.kind === "empty") onNewGame(read.slot);
    else setPending({ kind: "overwrite", read });
  };

  const startNew = () => {
    const empty = slots.find((read) => read.kind === "empty");
    if (slots.every((read) => read.kind === "empty") && empty !== undefined) onNewGame(empty.slot);
    else setPending({ kind: "pick-slot" });
  };

  return (
    <main className="ck-title ad-screen">
      <KitchenBackdrop scene="hall" className="ck-title__backdrop" />
      <div className="ck-title__veil" aria-hidden="true" />
      <div className="ck-title__content">
        <nav className="ck-title__nav">
          <Button variant="secondary" icon="back" onClick={onExitToStudio}>
            Back to studio
          </Button>
        </nav>
        <section className="ck-title__hero ck-card">
          <Wordmark tagline="Six mentors, six kitchens, one Market Hall. Cook your way to head chef." />
          <div className="ck-title__plates" aria-hidden="true">
            {SHOWCASE.map((entry, index) => (
              <PlateArt
                key={entry.dishId}
                colour={entry.colour}
                components={ghostLayout(dishById(entry.dishId))}
                title={null}
                className={`ck-title__plate ck-title__plate--${index}`}
              />
            ))}
          </div>
          <div className="ck-title__menu">
            {resume !== null && resume.kind === "ready" ? (
              <Button
                size="lg"
                className="ck-title__continue"
                onClick={() => onLoad(resume.slot, resume.state)}
              >
                <span className="ck-title__continue-label">Continue</span>
                <span className="ck-title__continue-meta">
                  {resume.state.profile.name} · Day {resume.state.calendar.day},{" "}
                  {weekdayName(resume.state.calendar.day)}
                </span>
              </Button>
            ) : null}
            <div className="ck-title__menu-row">
              <Button
                size="lg"
                variant={resume === null ? "primary" : "secondary"}
                icon="sparkle"
                onClick={startNew}
              >
                New Game
              </Button>
              <Button size="lg" variant="ghost" onClick={onOpenSettings}>
                Settings
              </Button>
            </div>
          </div>
        </section>
        {canSave ? null : (
          <section className="ck-title__offline" role="status" data-testid="saving-off">
            <Icon name="lock" size={20} />
            <div>
              <strong>Saving is turned off in this browser.</strong>
              <p>You can still cook, but your progress will not be kept after you close this page.</p>
            </div>
          </section>
        )}
        <section className="ck-title__slots" aria-labelledby="ck-title-slots" hidden={!canSave}>
          <h2 id="ck-title-slots" className="ck-title__slots-heading">
            Your saves
          </h2>
          <div className="ck-title__slot-row">
            {slots.map((read) => (
              <SaveSlotCard
                key={read.slot}
                read={read}
                onLoad={() => {
                  if (read.kind === "ready") onLoad(read.slot, read.state);
                }}
                onNewGame={() => requestNewGame(read)}
                onDelete={() => setPending({ kind: "delete", read })}
              />
            ))}
          </div>
        </section>
      </div>

      <Dialog open={pending.kind === "pick-slot"} title="Choose a save slot" onClose={closePending}>
        <p className="ck-muted">Your new kitchen will be saved here automatically as you play.</p>
        <div className="ck-title__pick-list">
          {slots.map((read) => (
            <button
              key={read.slot}
              type="button"
              className="ck-title__pick"
              onClick={() =>
                read.kind === "empty" ? onNewGame(read.slot) : setPending({ kind: "overwrite", read })
              }
            >
              <strong>Slot {read.slot}</strong>
              <span className="ck-muted">{slotSummary(read)}</span>
              {read.kind === "empty" ? null : <span className="ck-title__pick-warn">Replaces this save</span>}
            </button>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={pending.kind === "overwrite"}
        title="Start over in this slot?"
        onClose={closePending}
        footer={
          <>
            <Button variant="ghost" onClick={closePending}>
              Keep my save
            </Button>
            <Button
              onClick={() => {
                if (pending.kind === "overwrite") onNewGame(pending.read.slot);
              }}
            >
              Start a new kitchen
            </Button>
          </>
        }
      >
        {pending.kind === "overwrite" ? (
          <p>
            Slot {pending.read.slot} holds <strong>{slotSummary(pending.read)}</strong>. Starting a new game
            here will replace it once your new chef is ready.
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={pending.kind === "delete"}
        title="Delete this save?"
        onClose={closePending}
        footer={
          <>
            <Button variant="ghost" onClick={closePending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pending.kind === "delete") onDeleteSlot(pending.read.slot);
                closePending();
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        {pending.kind === "delete" ? (
          <p>Slot {pending.read.slot} will be cleared. This can't be undone.</p>
        ) : null}
      </Dialog>
    </main>
  );
}
