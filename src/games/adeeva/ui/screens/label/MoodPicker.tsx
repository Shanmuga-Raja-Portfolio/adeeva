import type { CSSProperties } from "react";
import { MUSIC_MOODS, type MusicMoodId } from "../../../../../engine/musicMood";
import type { ShowThemeDef } from "../../../content/showTheme";
import { MOOD_COPY } from "./moodCopy";

export interface MoodPickerProps {
  theme: Pick<ShowThemeDef, "bestMood" | "name">;
  value: MusicMoodId | null;
  onChange: (mood: MusicMoodId) => void;
  whisper?: boolean | undefined;
}

export function MoodPicker({ theme, value, onChange, whisper = true }: MoodPickerProps) {
  return (
    <div className="ad-rw-choice-grid ad-rw-choice-grid--moods" role="radiogroup" aria-label="Music mood">
      {MUSIC_MOODS.map((mood, moodIndex) => {
        const checked = value === mood.id;
        const suits = whisper && mood.id === theme.bestMood;
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
