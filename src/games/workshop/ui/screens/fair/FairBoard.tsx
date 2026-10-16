import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { FairThemeDef } from "../../../content/fairTheme";
import { SET_HINTS } from "../../../content/hint";
import {
  bramsPick,
  fairBoothByNumber,
  fairEligibleSets,
  setTemplateById,
  themeMatches,
  type GameState,
} from "../../../core";
import { floorLooks } from "../../art/pieceLook";
import { SetPreview } from "../../art/SetPreview";
import { ThemeSwatches } from "../hub/SeasonCard";

export interface FairBoardProps {
  readonly state: GameState;
  readonly theme: FairThemeDef;
  readonly picked: string | null;
  readonly onPick: (setId: string) => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
}

export function FairBoard({ state, theme, picked, onPick, onNext, onBack }: FairBoardProps) {
  const fair = state.fair;
  if (fair === null) return null;
  const booth = fairBoothByNumber(fair.booth);
  const sets = fairEligibleSets(state);
  const bram = bramsPick(state, theme);
  const chosen = picked ?? bram?.setId ?? null;
  return (
    <section className="ww-fair-board" aria-labelledby="ww-fair-board-title" data-testid="fair-board">
      <header className="ww-fair-board__head">
        <div>
          <span className="ad-eyebrow">The Fair Board</span>
          <h2 id="ww-fair-board-title">Which set goes to the green?</h2>
          <p className="ww-muted">{SET_HINTS.fairPick}</p>
        </div>
        <Button variant="ghost" icon="back" onClick={onBack}>
          Back to the shop
        </Button>
      </header>
      <div className="ww-fair-board__cards">
        <article className="ww-fair-theme ww-paper ww-tape">
          <span className="ad-eyebrow">This season's theme</span>
          <h3>{theme.name}</h3>
          <span className="ww-theme__tags">
            {theme.tags.map((tag) => (
              <TagPill key={tag} tone="sage">
                {tag}
              </TagPill>
            ))}
          </span>
          <ThemeSwatches theme={theme} />
          <p className="ww-muted">
            Feels <strong>{theme.moods[0]}</strong> and <strong>{theme.moods[1]}</strong>
          </p>
        </article>
        <article className="ww-fair-booth ww-paper ww-tape">
          <span className="ad-eyebrow">Your booth</span>
          <h3>{booth.name}</h3>
          <p className="ww-muted">
            Sets of{" "}
            {booth.minPieces === booth.maxPieces
              ? booth.minPieces
              : `${booth.minPieces} to ${booth.maxPieces}`}{" "}
            pieces. Ready for the Fair at quality {booth.readyMark}.
          </p>
          <p className="ww-hint">
            <Icon name="heart" size={14} /> Ready or not, the green is glad to see you.
          </p>
        </article>
      </div>
      {sets.length === 0 ? (
        <p className="ww-paper ww-fair-board__empty">
          No new set fits the {booth.name} yet. Make one before the end of day 14, or the Fair waits for next
          season. Nothing is lost.
        </p>
      ) : (
        <ul className="ww-fair-sets" role="radiogroup" aria-label="Set for the Fair">
          {sets.map((set) => {
            const template = setTemplateById(set.templateId);
            return (
              <li key={set.setId}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={chosen === set.setId}
                  className="ww-fair-set"
                  onClick={() => onPick(set.setId)}
                  data-testid={`fair-set-${set.setId}`}
                >
                  <SetPreview looks={floorLooks(set)} title={template.name} className="ww-fair-set__art" />
                  <strong>{template.name}</strong>
                  <span className="ww-muted">
                    Quality {set.stats.quality} · {themeMatches(set, theme)} of 2 theme tags
                  </span>
                  {bram?.setId === set.setId ? <TagPill tone="hot">Bram's pick</TagPill> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <footer className="ww-fair-board__foot">
        <Button
          size="lg"
          icon="sparkle"
          onClick={onNext}
          disabledReason={chosen === null ? "Pick a set first." : undefined}
          data-testid="fair-board-next"
        >
          To the Planner
        </Button>
      </footer>
    </section>
  );
}
