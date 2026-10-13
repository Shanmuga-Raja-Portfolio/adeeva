import type { CSSProperties } from "react";
import { RUNWAY_MOODS, type RunwayMoodId } from "../../../content/runwayMood";
import type { ShowThemeDef } from "../../../content/showTheme";
import { MOOD_COPY } from "./moodCopy";

export interface MoodPickerProps {
  theme: ShowThemeDef;
  value: RunwayMoodId | null;
  onChange: (mood: RunwayMoodId) => void;
}

export function MoodPicker({ theme, value, onChange }: MoodPickerProps) {
  return (
    <div className="ad-rw-choice-grid ad-rw-choice-grid--moods" role="radiogroup" aria-label="Music mood">
      {RUNWAY_MOODS.map((mood, moodIndex) => {
        const checked = value === mood.id;
        const suits = mood.id === theme.bestMood;
        return (
          <button
            key={mood.id}
            type="button"
            role="radio"
            aria-checked={checked}
            className={
              checked ? "ad-rw-choice ad-rw-choice--mood is-checked" : "ad-rw-choice ad-rw-choice--mood"
            }
            onClick={() => onChange(mood.id)}
          >
            <span className="ad-equaliser" aria-hidden="true" data-playing={checked ? "true" : "false"}>
              {[0, 1, 2, 3].map((bar) => (
                <i key={bar} style={{ "--bar": `${(bar + moodIndex) % 4}` } as CSSProperties} />
              ))}
            </span>
            <span className="ad-rw-choice__name">{mood.name}</span>
            <span className="ad-rw-choice__copy">{MOOD_COPY[mood.id]}</span>
            {suits ? (
              <span
                className="ad-rw-choice__whisper"
                title={`Something about this feels very ${theme.name}.`}
              >
                ✦ <span>feels like {theme.name}</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
