import { StarRating } from "../../../../../ui/kit/StarRating";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { FairThemeDef } from "../../../content/fairTheme";
import {
  bookPlate,
  productById,
  SIDE_PLATES,
  sidePlateOptions,
  type FairEntry,
  type GameState,
} from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook, bookEntryLook } from "../../art/bakeLook";
import { bakeBookOwner } from "../book/BakeBookCard";
import { ThemeCard } from "../season/ThemeCard";

export interface FairBoardProps {
  readonly state: GameState;
  readonly theme: FairThemeDef;
  readonly entry: FairEntry;
  readonly sidePlates: readonly string[];
  readonly onToggle: (runId: string) => void;
  readonly onOttisPicks: () => void;
  readonly onNext: () => void;
}

export function FairBoard({
  state,
  theme,
  entry,
  sidePlates,
  onToggle,
  onOttisPicks,
  onNext,
}: FairBoardProps) {
  const options = sidePlateOptions(state);
  const showLook = bakeLook(entry.design, entry.toppings, true);
  const picked = sidePlates.flatMap((runId) => {
    const found = options.find((option) => option.runId === runId);
    return found === undefined ? [] : [found];
  });
  return (
    <section className="pa-fair-board" aria-labelledby="pa-fair-board-title" data-testid="fair-board">
      <header className="pa-fair-board__head">
        <div>
          <span className="ad-eyebrow">Fair Board</span>
          <h2 id="pa-fair-board-title">Pick two bakes to stand beside your showpiece</h2>
          <p className="pa-muted">
            Otti picked the plates that suit {theme.name} best. Swap them, or leave a spot empty.
          </p>
        </div>
        <ThemeCard theme={theme} compact />
      </header>
      <div className="pa-fair-board__slots">
        <figure className="pa-plate pa-plate--show">
          {showLook !== null ? (
            <BakePreview look={showLook} title="Your showpiece" plaque={entry.word} />
          ) : null}
          <figcaption>
            <strong>Showpiece</strong>
            <span className="pa-muted">
              {entry.design.productId === null ? "" : productById(entry.design.productId).name}
            </span>
          </figcaption>
        </figure>
        {Array.from({ length: SIDE_PLATES }, (_, index) => {
          const plate = picked[index];
          const look = plate === undefined ? null : bookEntryLook(plate);
          return (
            <figure key={index} className={plate === undefined ? "pa-plate pa-plate--empty" : "pa-plate"}>
              {look !== null && plate !== undefined ? (
                <BakePreview
                  look={look}
                  title={`${productById(plate.productId).name} for ${bakeBookOwner(plate)}`}
                />
              ) : (
                <span className="pa-plate__hole" aria-hidden="true" />
              )}
              <figcaption>
                <strong>Side plate {index + 1}</strong>
                <span className="pa-muted">{plate === undefined ? "Empty" : bakeBookOwner(plate)}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="pa-fair-board__book">
        <h3>From your Bake Book</h3>
        {options.length === 0 ? (
          <p className="pa-muted">
            No bakes to show yet. Deliver orders and they will wait in your Bake Book for the next Fair.
          </p>
        ) : (
          <ul className="pa-fair-board__options">
            {[...options].reverse().map((option) => {
              const look = bookEntryLook(option);
              const plate = bookPlate(option);
              const matches = theme.tags.filter((tag) => plate.tags.includes(tag));
              const chosen = sidePlates.includes(option.runId);
              const full = !chosen && sidePlates.length >= SIDE_PLATES;
              return (
                <li key={option.runId}>
                  <button
                    type="button"
                    className="pa-option"
                    aria-pressed={chosen}
                    disabled={full}
                    onClick={() => onToggle(option.runId)}
                    data-testid={`side-plate-${option.runId}`}
                  >
                    {look !== null ? (
                      <BakePreview look={look} title={null} className="pa-option__art" />
                    ) : null}
                    <span className="pa-option__body">
                      <strong>{bakeBookOwner(option)}</strong>
                      <span className="pa-muted">
                        Day {option.day} · {productById(option.productId).name}
                      </span>
                      <StarRating stars={option.stars} size={14} />
                      <span className="pa-option__tags">
                        {matches.map((tag) => (
                          <TagPill key={tag} tone="gold">
                            {tag}
                          </TagPill>
                        ))}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <footer className="pa-fair__footer">
        <Button variant="ghost" onClick={onOttisPicks}>
          Use Otti's picks
        </Button>
        <Button size="lg" icon="sparkle" onClick={onNext} data-testid="fair-board-next">
          Next: plan the unveil
        </Button>
      </footer>
    </section>
  );
}
