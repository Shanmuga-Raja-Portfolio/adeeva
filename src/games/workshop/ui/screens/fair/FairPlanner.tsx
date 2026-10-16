import { useEffect, useRef } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import { BOOTH_BACKDROPS, type BoothBackdropId } from "../../../content/boothBackdrop";
import { FAIR_MUSIC, type FairMusicId } from "../../../content/fairMusic";
import type { FairThemeDef } from "../../../content/fairTheme";
import { SET_HINTS } from "../../../content/hint";
import { MAKERS_NOTES, type MakersNoteId } from "../../../content/makersNote";
import { boothBackdropById, productById, type FairPlan, type FloorSet } from "../../../core";
import { floorLooks } from "../../art/pieceLook";
import { PiecePreview } from "../../art/PiecePreview";

export interface FairPlannerProps {
  readonly theme: FairThemeDef;
  readonly set: FloorSet;
  readonly plan: FairPlan;
  readonly relaxed: boolean;
  readonly stageIssue: string | null;
  readonly onPlan: (plan: FairPlan) => void;
  readonly onBack: () => void;
  readonly onStage: () => void;
}

function swapped(order: readonly number[], at: number, step: number): number[] {
  const next = [...order];
  const here = next[at];
  const there = next[at + step];
  if (here === undefined || there === undefined) return next;
  next[at] = there;
  next[at + step] = here;
  return next;
}

export function FairPlanner({
  theme,
  set,
  plan,
  relaxed,
  stageIssue,
  onPlan,
  onBack,
  onStage,
}: FairPlannerProps) {
  const looks = floorLooks(set);
  const rows = useRef(new Map<number, HTMLLIElement>());
  const moving = useRef<{ readonly piece: number; readonly step: number } | null>(null);
  useEffect(() => {
    const move = moving.current;
    moving.current = null;
    if (move === null) return;
    const at = plan.order.indexOf(move.piece);
    const atEdge = move.step > 0 ? at === plan.order.length - 1 : at === 0;
    if (!atEdge) return;
    const buttons = rows.current.get(move.piece)?.querySelectorAll("button");
    buttons?.[move.step > 0 ? 0 : 1]?.focus();
  }, [plan.order]);
  const move = (at: number, step: number) => {
    const piece = plan.order[at];
    if (piece === undefined) return;
    moving.current = { piece, step };
    onPlan({ ...plan, order: swapped(plan.order, at, step) });
  };
  const backdrops = useRovingRadio(
    BOOTH_BACKDROPS.map((entry) => ({ value: entry.id })),
    plan.backdrop,
    (backdrop: BoothBackdropId) => onPlan({ ...plan, backdrop }),
  );
  const music = useRovingRadio(
    FAIR_MUSIC.map((entry) => ({ value: entry.id })),
    plan.music,
    (choice: FairMusicId) => onPlan({ ...plan, music: choice }),
  );
  const notes = useRovingRadio(
    MAKERS_NOTES.map((entry) => ({ value: entry.id })),
    plan.note,
    (note: MakersNoteId) => onPlan({ ...plan, note }),
  );
  return (
    <section className="ww-fair-plan" aria-labelledby="ww-fair-plan-title" data-testid="fair-planner">
      <header className="ww-fair-board__head">
        <div>
          <span className="ad-eyebrow">The Planner</span>
          <h2 id="ww-fair-plan-title">{SET_HINTS.planner}</h2>
          <p className="ww-muted">
            {theme.name} feels <strong>{theme.moods[0]}</strong> and <strong>{theme.moods[1]}</strong>.
          </p>
        </div>
        <Button variant="ghost" icon="back" onClick={onBack}>
          Back to the board
        </Button>
      </header>
      <p className="ww-fair-plan__hattie ww-paper" role="note">
        <Icon name="sparkle" size={18} />{" "}
        {relaxed
          ? `Hattie suggests: the ${boothBackdropById(theme.bestBackdrop).name.toLowerCase()}, some ${FAIR_MUSIC.find((entry) => entry.id === theme.bestMusic)?.name.toLowerCase() ?? "music"}, and your best piece last. Tap Open the booth when you're happy!`
          : `Hattie says the ${boothBackdropById(theme.bestBackdrop).name.toLowerCase()} suits ${theme.name}. Match the music to the mood words, and pick who comes last.`}
      </p>
      <div className="ww-fair-plan__grid">
        <div className="ww-fair-plan__order">
          <h3>Reveal order</h3>
          <p className="ww-hint">Save your favourite for last!</p>
          <ol>
            {plan.order.map((pieceIndex, at) => {
              const look = looks[pieceIndex];
              const piece = set.pieces[pieceIndex];
              if (look === undefined || piece === undefined) return null;
              const name = productById(piece.productId).name;
              return (
                <li
                  key={pieceIndex}
                  ref={(node) => {
                    if (node === null) rows.current.delete(pieceIndex);
                    else rows.current.set(pieceIndex, node);
                  }}
                  className="ww-reveal-row"
                  data-testid={`reveal-${at}`}
                >
                  <span className="ww-reveal-row__number">{at + 1}</span>
                  <PiecePreview look={look} title={null} className="ww-reveal-row__art" />
                  <span className="ww-reveal-row__name">
                    <strong>{name}</strong>
                    <span className="ww-muted">Quality {piece.quality}</span>
                  </span>
                  <span className="ww-reveal-row__moves">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => move(at, -1)}
                      disabled={at === 0}
                      aria-label={`Show ${name} earlier`}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => move(at, 1)}
                      disabled={at === plan.order.length - 1}
                      aria-label={`Show ${name} later`}
                    >
                      ▼
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="ww-fair-plan__choices">
          <h3 id="ww-plan-backdrop">Backdrop</h3>
          <div className="ww-plan-options" role="radiogroup" aria-labelledby="ww-plan-backdrop">
            {BOOTH_BACKDROPS.map((entry, index) => (
              <button
                key={entry.id}
                ref={backdrops.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={plan.backdrop === entry.id}
                tabIndex={backdrops.tabIndex(index)}
                onKeyDown={(event) => backdrops.handleKey(event, index)}
                className={`ww-plan-option ww-plan-option--${entry.id}`}
                onClick={() => onPlan({ ...plan, backdrop: entry.id })}
                data-testid={`backdrop-${entry.id}`}
              >
                <strong>{entry.name}</strong>
                <span className="ww-muted">{entry.mood}</span>
              </button>
            ))}
          </div>
          <h3 id="ww-plan-music">Music</h3>
          <div className="ww-plan-options" role="radiogroup" aria-labelledby="ww-plan-music">
            {FAIR_MUSIC.map((entry, index) => (
              <button
                key={entry.id}
                ref={music.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={plan.music === entry.id}
                tabIndex={music.tabIndex(index)}
                onKeyDown={(event) => music.handleKey(event, index)}
                className="ww-plan-option"
                onClick={() => onPlan({ ...plan, music: entry.id })}
                data-testid={`music-${entry.id}`}
              >
                <strong>♪ {entry.name}</strong>
                <span className="ww-muted">{entry.mood}</span>
              </button>
            ))}
          </div>
          <h3 id="ww-plan-note">Maker's note</h3>
          <div className="ww-plan-options" role="radiogroup" aria-labelledby="ww-plan-note">
            {MAKERS_NOTES.map((entry, index) => (
              <button
                key={entry.id}
                ref={notes.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={plan.note === entry.id}
                tabIndex={notes.tabIndex(index)}
                onKeyDown={(event) => notes.handleKey(event, index)}
                className="ww-plan-option ww-plan-option--note"
                onClick={() => onPlan({ ...plan, note: entry.id })}
              >
                <strong>“{entry.text}”</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="ww-fair-board__foot">
        <Button
          size="lg"
          icon="sparkle"
          onClick={onStage}
          disabledReason={stageIssue ?? undefined}
          showReason
          data-testid="open-booth"
        >
          Open the booth
        </Button>
      </footer>
    </section>
  );
}
