import { useState } from "react";
import { weekdayName } from "../../../../../engine/weekday";
import { slotSummary } from "../../../../../studio/slotSummary";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { GameState } from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
import { PiecePreview } from "../../art/PiecePreview";
import { SHOWCASE_LOOKS } from "../../art/showcaseLooks";
import { Wordmark } from "../../art/Wordmark";
import { workshopSlots, type SaveSlotId, type SlotRead } from "../../workshopSlots";
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
  const resume = workshopSlots.continueSlot(slots);
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
    <main className="ww-title ad-screen">
      <GarageBackdrop className="ww-title__backdrop" />
      <div className="ww-title__veil" aria-hidden="true" />
      <div className="ww-title__content">
        <nav className="ww-title__nav">
          <Button variant="secondary" icon="back" onClick={onExitToStudio}>
            Back to studio
          </Button>
        </nav>
        <div className="ww-title__stage">
          {SHOWCASE_LOOKS.slice(0, 1).map((look) => (
            <PiecePreview
              key={look.productId}
              look={look}
              title={null}
              className="ww-title__piece"
              threeQuarter
            />
          ))}
          <section className="ww-title__hero ww-paper ww-tape">
            <Wordmark tagline="Draw it, saw it, tap it together, and deliver it down Larkspur Road." />
            <div className="ww-title__menu">
              {resume !== null && resume.kind === "ready" ? (
                <Button
                  size="lg"
                  className="ww-title__continue"
                  onClick={() => onLoad(resume.slot, resume.state)}
                >
                  <span className="ww-title__continue-label">Continue</span>
                  <span className="ww-title__continue-meta">
                    {resume.state.profile.name} · Day {resume.state.calendar.day},{" "}
                    {weekdayName(resume.state.calendar.day)}
                  </span>
                </Button>
              ) : null}
              <div className="ww-title__menu-row">
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
          {SHOWCASE_LOOKS.slice(1).map((look) => (
            <PiecePreview
              key={look.productId}
              look={look}
              title={null}
              className="ww-title__piece"
              threeQuarter
            />
          ))}
        </div>
        {canSave ? null : (
          <section className="ww-title__offline" role="status" data-testid="saving-off">
            <Icon name="lock" size={20} />
            <div>
              <strong>Saving is turned off in this browser.</strong>
              <p>You can still build, but your progress will not be kept after you close this page.</p>
            </div>
          </section>
        )}
        <section className="ww-title__slots" aria-labelledby="ww-title-slots" hidden={!canSave}>
          <h2 id="ww-title-slots" className="ww-title__slots-heading">
            Your saves
          </h2>
          <div className="ww-title__slot-row">
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
        <p className="ww-muted">Your new garage will be saved here automatically as you play.</p>
        <div className="ww-title__pick-list">
          {slots.map((read) => (
            <button
              key={read.slot}
              type="button"
              className="ww-title__pick"
              onClick={() =>
                read.kind === "empty" ? onNewGame(read.slot) : setPending({ kind: "overwrite", read })
              }
            >
              <strong>Slot {read.slot}</strong>
              <span className="ww-muted">{slotSummary(read)}</span>
              {read.kind === "empty" ? null : <span className="ww-title__pick-warn">Replaces this save</span>}
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
              Start a new garage
            </Button>
          </>
        }
      >
        {pending.kind === "overwrite" ? (
          <p>
            Slot {pending.read.slot} holds <strong>{slotSummary(pending.read)}</strong>. Starting a new game
            here will replace it once your new maker is ready.
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
