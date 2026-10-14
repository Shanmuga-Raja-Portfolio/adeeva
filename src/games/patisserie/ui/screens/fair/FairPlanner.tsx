import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import { FAIR_MUSIC, type FairMusicId } from "../../../content/fairMusic";
import type { FairThemeDef } from "../../../content/fairTheme";
import { TABLE_CLOTHS, type TableClothId } from "../../../content/tableCloth";
import type { FairPlan } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { MusicIcon } from "../../art/MusicIcon";
import type { ShowPlateView } from "./showPlates";

export interface FairPlannerProps {
  readonly theme: FairThemeDef;
  readonly plan: FairPlan;
  readonly plates: readonly ShowPlateView[];
  readonly onPlan: (plan: FairPlan) => void;
  readonly onSuggest: () => void;
  readonly onBack: () => void;
  readonly onStage: () => void;
  readonly stageIssue: string | null;
}

function moved(order: readonly number[], at: number, step: number): number[] {
  const next = [...order];
  const target = at + step;
  const here = next[at];
  const there = next[target];
  if (here === undefined || there === undefined) return next;
  next[at] = there;
  next[target] = here;
  return next;
}

export function FairPlanner({
  theme,
  plan,
  plates,
  onPlan,
  onSuggest,
  onBack,
  onStage,
  stageIssue,
}: FairPlannerProps) {
  const cloths = useRovingRadio(
    TABLE_CLOTHS.map((cloth) => ({ value: cloth.id })),
    plan.cloth,
    (cloth: TableClothId) => onPlan({ ...plan, cloth }),
  );
  const music = useRovingRadio(
    FAIR_MUSIC.map((entry) => ({ value: entry.id })),
    plan.music,
    (choice: FairMusicId) => onPlan({ ...plan, music: choice }),
  );
  return (
    <section className="pa-fair-plan" aria-labelledby="pa-fair-plan-title" data-testid="fair-planner">
      <header className="pa-fair-board__head">
        <div>
          <span className="ad-eyebrow">The Planner</span>
          <h2 id="pa-fair-plan-title">Choose a cloth, some music, and who goes last</h2>
          <p className="pa-fair-plan__moods">
            {theme.name} feels <strong>{theme.moods[0]}</strong> and <strong>{theme.moods[1]}</strong>.
          </p>
        </div>
        <Button variant="ghost" icon="sparkle" onClick={onSuggest}>
          Marigold suggests…
        </Button>
      </header>
      <div className="pa-fair-plan__grid">
        <div className="pa-fair-plan__order">
          <h3>Unveil order</h3>
          <p className="pa-hint">Save your best plate for last!</p>
          <ol>
            {plan.order.map((slot, at) => {
              const plate = plates[slot];
              if (plate === undefined) return null;
              return (
                <li key={slot} className="pa-unveil" data-testid={`unveil-${at}`}>
                  <span className="pa-unveil__number">{at + 1}</span>
                  {plate.look !== null ? (
                    <BakePreview
                      look={plate.look}
                      title={null}
                      className="pa-unveil__thumb"
                      plaque={plate.plaque}
                    />
                  ) : null}
                  <span className="pa-unveil__name">
                    <strong>{plate.label}</strong>
                    <span className="pa-muted">Quality {plate.quality}</span>
                  </span>
                  <span className="pa-unveil__moves">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onPlan({ ...plan, order: moved(plan.order, at, -1) })}
                      disabled={at === 0}
                      aria-label={`Unveil ${plate.label} earlier`}
                    >
                      <Icon name="back" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onPlan({ ...plan, order: moved(plan.order, at, 1) })}
                      disabled={at === plan.order.length - 1}
                      aria-label={`Unveil ${plate.label} later`}
                      className="pa-unveil__later"
                    >
                      <Icon name="back" size={14} />
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="pa-fair-plan__choice">
          <h3>Table cloth</h3>
          <div className="pa-fair-plan__options" role="radiogroup" aria-label="Table cloth">
            {TABLE_CLOTHS.map((cloth, index) => (
              <button
                key={cloth.id}
                ref={cloths.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={plan.cloth === cloth.id}
                tabIndex={cloths.tabIndex(index)}
                className="pa-mood"
                onClick={() => onPlan({ ...plan, cloth: cloth.id })}
                onKeyDown={(event) => cloths.handleKey(event, index)}
              >
                <span
                  className={`pa-mood__cloth pa-mood__cloth--${cloth.id}`}
                  style={{ background: cloth.colour }}
                  aria-hidden="true"
                />
                <strong>{cloth.name}</strong>
                <span className="pa-mood__word">{cloth.mood}</span>
              </button>
            ))}
          </div>
          <h3>Music</h3>
          <div className="pa-fair-plan__options" role="radiogroup" aria-label="Music">
            {FAIR_MUSIC.map((entry, index) => (
              <button
                key={entry.id}
                ref={music.buttonRef(index)}
                type="button"
                role="radio"
                aria-checked={plan.music === entry.id}
                tabIndex={music.tabIndex(index)}
                className="pa-mood"
                onClick={() => onPlan({ ...plan, music: entry.id })}
                onKeyDown={(event) => music.handleKey(event, index)}
              >
                <MusicIcon music={entry.id} size={40} />
                <strong>{entry.name}</strong>
                <span className="pa-mood__word">{entry.mood}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="pa-fair__footer">
        <Button variant="ghost" icon="back" onClick={onBack}>
          Back to the Fair Board
        </Button>
        <Button
          size="lg"
          icon="star"
          onClick={onStage}
          disabledReason={stageIssue ?? undefined}
          showReason
          data-testid="start-showcase"
        >
          Start the showcase
        </Button>
      </footer>
    </section>
  );
}
