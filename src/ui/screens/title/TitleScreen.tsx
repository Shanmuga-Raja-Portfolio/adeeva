import { useState } from "react";
import { continueSlot, type SaveSlotId, type SlotRead } from "../../../app/saveSlots";
import type { GameState } from "../../../core";
import { StudioBackdrop } from "../../art/StudioBackdrop";
import { Button } from "../../kit/Button";
import { Dialog } from "../../kit/Dialog";
import { Icon } from "../../kit/IconSet";
import { weekdayName } from "../hub/weekday";
import { SaveSlotCard } from "./SaveSlotCard";
import { slotSummary } from "./slotSummary";
import { Wordmark } from "./Wordmark";
import "./title.css";

export interface TitleScreenProps {
  slots: readonly SlotRead[];
  canSave: boolean;
  onLoad: (slot: SaveSlotId, game: GameState) => void;
  onNewGame: (slot: SaveSlotId) => void;
  onDeleteSlot: (slot: SaveSlotId) => void;
  onOpenSettings: () => void;
}

type Pending =
  | { readonly kind: "none" }
  | { readonly kind: "pick-slot" }
  | { readonly kind: "overwrite"; readonly read: SlotRead }
  | { readonly kind: "delete"; readonly read: SlotRead };

export function TitleScreen({
  slots,
  canSave,
  onLoad,
  onNewGame,
  onDeleteSlot,
  onOpenSettings,
}: TitleScreenProps) {
  const [pending, setPending] = useState<Pending>({ kind: "none" });
  const resume = continueSlot(slots);
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
    <main className="ad-title ad-screen">
      <StudioBackdrop kind="atelier" wash={0.62} className="ad-title__backdrop" />
      <div className="ad-title__veil" aria-hidden="true" />
      <div className="ad-title__content">
        <section className="ad-title__hero">
          <Wordmark tagline="A fashion design story, stitched by you." />
          <div className="ad-title__menu">
            {resume !== null && resume.kind === "ready" ? (
              <Button
                size="lg"
                className="ad-title__continue"
                onClick={() => onLoad(resume.slot, resume.state)}
              >
                <span className="ad-title__continue-label">Continue</span>
                <span className="ad-title__continue-meta">
                  {resume.state.profile.name} · Day {resume.state.calendar.day},{" "}
                  {weekdayName(resume.state.calendar.day)}
                </span>
              </Button>
            ) : null}
            <div className="ad-title__menu-row">
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
          <section className="ad-title__offline" role="status" data-testid="saving-off">
            <Icon name="lock" size={20} />
            <div>
              <strong>Saving is turned off in this browser.</strong>
              <p>
                You can still play, but your progress will not be kept after you close this page. Allowing
                site storage for this page turns saving back on.
              </p>
            </div>
          </section>
        )}
        <section className="ad-title__slots" aria-labelledby="ad-title-slots" hidden={!canSave}>
          <h2 id="ad-title-slots" className="ad-title__slots-heading">
            <Icon name="hanger" size={20} />
            Your saves
          </h2>
          <div className="ad-title__slot-row">
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
        <p className="ad-muted">Your new story will be saved here automatically as you play.</p>
        <div className="ad-title__pick-list">
          {slots.map((read) => (
            <button
              key={read.slot}
              type="button"
              className="ad-title__pick"
              onClick={() =>
                read.kind === "empty" ? onNewGame(read.slot) : setPending({ kind: "overwrite", read })
              }
            >
              <span className="ad-title__pick-slot">Slot {read.slot}</span>
              <span className="ad-title__pick-meta">{slotSummary(read)}</span>
              {read.kind === "empty" ? null : <span className="ad-title__pick-warn">Replaces this save</span>}
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
              Start a new story
            </Button>
          </>
        }
      >
        {pending.kind === "overwrite" ? (
          <p>
            Slot {pending.read.slot} holds <strong>{slotSummary(pending.read)}</strong>. Starting a new game
            here will replace it once your new designer is ready.
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
