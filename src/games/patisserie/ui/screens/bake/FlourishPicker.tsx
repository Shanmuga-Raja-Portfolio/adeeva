import { TagPill } from "../../../../../ui/kit/TagPill";
import { FLOURISHES, MAX_FLOURISHES } from "../../../content/flourish";
import { PLAQUE_WORDS } from "../../../content/letterPath";
import { flourishIssue, type Action, type BakeRun } from "../../../core";

export interface FlourishPickerProps {
  readonly run: BakeRun;
  readonly dispatch: (action: Action) => boolean;
  readonly number: number;
}

function hoursLabel(hours: number): string {
  if (hours === 0) return "No extra time";
  return hours > 0 ? `+${hours} h` : `Saves ${-hours} h`;
}

export function FlourishPicker({ run, dispatch, number }: FlourishPickerProps) {
  return (
    <section className="pa-design__section" aria-labelledby="pa-design-touches">
      <h2 id="pa-design-touches">
        {number}. Extra touches{" "}
        <span className="pa-muted">(pick up to {MAX_FLOURISHES}, never required)</span>
      </h2>
      <p className="pa-hint">Each touch you finish well gives the Bakers' Bench more flair to cheer about.</p>
      <div className="pa-design__touches">
        {FLOURISHES.map((flourish) => {
          const chosen = run.flourishes.includes(flourish.id);
          const issue = chosen ? null : flourishIssue(run, flourish.id);
          return (
            <button
              key={flourish.id}
              type="button"
              aria-pressed={chosen}
              className="pa-choice pa-touch"
              disabled={issue !== null}
              title={issue ?? undefined}
              onClick={() => dispatch({ type: "toggleFlourish", flourish: flourish.id })}
              data-testid={`touch-${flourish.id}`}
            >
              <strong>{flourish.name}</strong>
              <span className="pa-choice__meta">{flourish.rule}</span>
              <span className="pa-touch__tags">
                <TagPill tone="sage">{flourish.reuses}</TagPill>
                <TagPill>{hoursLabel(flourish.hours)}</TagPill>
              </span>
              {issue !== null ? <span className="pa-choice__warn">{issue}</span> : null}
            </button>
          );
        })}
      </div>
      {run.flourishes.includes("plaque-lettering") ? (
        <div className="pa-design__words" role="radiogroup" aria-label="Plaque word">
          {PLAQUE_WORDS.map((word) => (
            <button
              key={word}
              type="button"
              role="radio"
              aria-checked={run.word === word}
              className="pa-choice pa-word"
              onClick={() => dispatch({ type: "chooseWord", word })}
            >
              <strong>{word}</strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
