import { useState } from "react";
import { canStartNextSeason, selectableThemes, type GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { TagPill } from "../../kit/TagPill";
import { PaletteChips } from "./PaletteChips";
import { themeAccentStyle } from "./themeAccent";

export interface NextSeasonPickerProps {
  state: GameState;
  nextNumber: number;
  onStart: (themeId: string) => void;
  onExit: () => void;
}

export function NextSeasonPicker({ state, nextNumber, onStart, onExit }: NextSeasonPickerProps) {
  const themes = selectableThemes(state);
  const [picked, setPicked] = useState<string | null>(themes[0]?.id ?? null);
  const check = canStartNextSeason(state);
  const reason = check.reasons[0] ?? (picked === null ? "Choose a theme for the next show." : undefined);
  return (
    <section className="ad-next-season" aria-labelledby="next-season-title" data-testid="next-season">
      <h2 id="next-season-title">What comes next?</h2>
      <p className="ad-next-season__lead">
        Pick the story for season {nextNumber}. A bigger venue is already calling.
      </p>
      <div className="ad-next-season__themes" role="radiogroup" aria-label="Next season theme">
        {themes.map((theme) => {
          const checked = picked === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={checked}
              className={checked ? "ad-theme-tile is-checked" : "ad-theme-tile"}
              style={themeAccentStyle(theme)}
              onClick={() => setPicked(theme.id)}
            >
              <span className="ad-theme-tile__name">{theme.name}</span>
              <span className="ad-theme-tile__pitch">{theme.pitch}</span>
              <span className="ad-theme-tile__tags">
                {theme.requiredTags.map((tag) => (
                  <TagPill key={tag} tone="gold">
                    {tag}
                  </TagPill>
                ))}
              </span>
              <PaletteChips colours={theme.palette} size="sm" label={`${theme.name} palette`} />
            </button>
          );
        })}
      </div>
      <div className="ad-next-season__actions">
        <Button
          size="lg"
          icon="sparkle"
          disabledReason={reason}
          showReason
          onClick={() => {
            if (picked !== null && check.ok) onStart(picked);
          }}
        >
          Next season
        </Button>
        <Button variant="secondary" size="lg" onClick={onExit}>
          Back to studio
        </Button>
      </div>
    </section>
  );
}
