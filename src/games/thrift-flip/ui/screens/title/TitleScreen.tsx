import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { FINDS } from "../../../content/find";
import type { GameState } from "../../../core";
import { Awning } from "../../art/Awning";
import { FindArt } from "../../art/FindArt";
import { StallBackdrop } from "../../art/StallBackdrop";
import { Wordmark } from "../../art/Wordmark";
import { thriftSlots, type SaveSlotId, type SlotRead } from "../../thriftSlots";
import { stallDayName } from "../stallDayName";
import { SaveSlotCard } from "./SaveSlotCard";
import { slotSummary } from "../../../../../studio/slotSummary";
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

const RAIL = ["gingham-shirt", "tea-dress", "faded-jeans", "check-coat"] as const;

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
  const resume = thriftSlots.continueSlot(slots);
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
    <main className="tf-title ad-screen">
      <StallBackdrop className="tf-title__backdrop" />
      <div className="tf-title__veil" aria-hidden="true" />
      <Awning className="tf-title__awning" />
      <div className="tf-title__content">
        <nav className="tf-title__nav">
          <Button variant="secondary" icon="back" onClick={onExitToStudio}>
            Back to studio
          </Button>
        </nav>
        <section className="tf-title__hero">
          <div className="tf-title__brand">
            <Wordmark tagline="Rescue loved finds. Remake them. Sell them fair." />
            <div className="tf-title__menu">
              {resume !== null && resume.kind === "ready" ? (
                <Button
                  size="lg"
                  className="tf-title__continue"
                  onClick={() => onLoad(resume.slot, resume.state)}
                >
                  <span>Continue</span>
                  <span className="tf-title__continue-meta">
                    {resume.state.profile.name} · Day {resume.state.calendar.day},{" "}
                    {stallDayName(resume.state.calendar.day, resume.state.profile.career)}
                  </span>
                </Button>
              ) : null}
              <div className="tf-title__menu-row">
                <Button
                  size="lg"
                  variant={resume === null ? "primary" : "secondary"}
                  icon="sparkle"
                  onClick={startNew}
                >
                  New Game
                </Button>
                <Button size="lg" variant="secondary" onClick={onOpenSettings}>
                  Settings
                </Button>
              </div>
            </div>
          </div>
          <div className="tf-title__rail" aria-hidden="true">
            <div className="tf-title__pole" />
            {RAIL.map((findId, index) => {
              const find = FINDS.find((entry) => entry.id === findId);
              return find === undefined ? null : (
                <div key={findId} className="tf-title__hanger" style={{ animationDelay: `${index * 0.4}s` }}>
                  <FindArt find={find} size={118} />
                </div>
              );
            })}
          </div>
        </section>
        {canSave ? null : (
          <section className="tf-title__offline" role="status" data-testid="saving-off">
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
        <section className="tf-title__slots" aria-labelledby="tf-title-slots" hidden={!canSave}>
          <h2 id="tf-title-slots" className="tf-title__slots-heading">
            <Icon name="hanger" size={22} />
            Your saves
          </h2>
          <div className="tf-title__slot-row">
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
        <p className="ad-muted">Your new stall is saved here automatically as you play.</p>
        <div className="tf-title__pick-list">
          {slots.map((read) => (
            <button
              key={read.slot}
              type="button"
              className="tf-title__pick"
              onClick={() =>
                read.kind === "empty" ? onNewGame(read.slot) : setPending({ kind: "overwrite", read })
              }
            >
              <span className="tf-title__pick-slot">Slot {read.slot}</span>
              <span className="tf-title__pick-meta">{slotSummary(read)}</span>
              {read.kind === "empty" ? null : <span className="tf-title__pick-warn">Replaces this save</span>}
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
              Start a new stall
            </Button>
          </>
        }
      >
        {pending.kind === "overwrite" ? (
          <p>
            Slot {pending.read.slot} holds <strong>{slotSummary(pending.read)}</strong>. A new game here
            replaces it once your new stall opens.
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
