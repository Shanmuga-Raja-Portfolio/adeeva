import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { FairThemeId } from "../../../content/fairTheme";
import { canChooseTheme, seasonThemes, type GameState } from "../../../core";
import { ThemeCard } from "./ThemeCard";

export interface ThemePickerProps {
  readonly state: GameState;
  readonly onChoose: (event: ClickLike, themeId: FairThemeId) => void;
}

export function ThemePicker({ state, onChoose }: ThemePickerProps) {
  const fair = state.fair;
  const themes = fair === null ? [] : seasonThemes(fair.seasonNumber);
  const [picked, setPicked] = useState<FairThemeId | null>(themes[0]?.id ?? null);
  const options = themes.map((theme) => ({ value: theme.id }));
  const roving = useRovingRadio(options, picked, setPicked);
  const check = picked === null ? null : canChooseTheme(state, picked);
  return (
    <div className="pa-season-step">
      <header className="pa-season-step__head">
        <span className="pa-season-step__number">1</span>
        <div>
          <h3>Pick this season's Fair theme</h3>
          <p className="pa-muted">Your showpiece and side plates will be judged on it. Kindly!</p>
        </div>
      </header>
      <div className="pa-theme-pick" role="radiogroup" aria-label="Fair theme">
        {themes.map((theme, index) => (
          <button
            key={theme.id}
            ref={roving.buttonRef(index)}
            type="button"
            role="radio"
            aria-checked={picked === theme.id}
            tabIndex={roving.tabIndex(index)}
            className="pa-theme-pick__option"
            onClick={() => setPicked(theme.id)}
            onKeyDown={(event) => roving.handleKey(event, index)}
          >
            <ThemeCard theme={theme} />
          </button>
        ))}
      </div>
      <div className="pa-season-step__actions">
        <span className="pa-hint">Choosing a theme brings Marigold's Baker's Hamper to the pantry.</span>
        <Button
          icon="sparkle"
          onClick={(event) => {
            if (picked !== null) onChoose(event, picked);
          }}
          disabledReason={check === null || check.ok ? undefined : check.reasons[0]}
          data-testid="choose-theme"
        >
          Choose this theme
        </Button>
      </div>
    </div>
  );
}
