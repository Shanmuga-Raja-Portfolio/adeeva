import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { LaunchThemeId } from "../../../content/launchTheme";
import {
  canPickTheme,
  canRestLine,
  seasonByNumber,
  seasonThemes,
  type CollectionState,
  type GameState,
} from "../../../core";
import { ThemeBadge } from "./ThemeBadge";

export interface ThemeCardProps {
  readonly state: GameState;
  readonly collection: CollectionState;
  readonly onPick: (event: ClickLike, themeId: LaunchThemeId) => void;
  readonly onRest: (event: ClickLike) => void;
}

export function ThemeCard({ state, collection, onPick, onRest }: ThemeCardProps) {
  const themes = seasonThemes(collection.seasonNumber);
  const rest = canRestLine(state);
  const next = state.profile.trait === "trendsetter" ? seasonThemes(collection.seasonNumber + 1) : [];
  return (
    <Card
      tone="gold"
      eyebrow={`Season ${collection.seasonNumber} · ${seasonByNumber(collection.seasonNumber).name}`}
      title="Pick this season's theme"
      className="jb-hub-card jb-theme-card"
      data-testid="theme-card"
    >
      <p className="jb-muted">
        Every piece in your line follows the theme. Lantern Night is on day 13 of the season.
      </p>
      <div className="jb-theme-card__options">
        {themes.map((theme) => {
          const check = canPickTheme(state, theme.id);
          return (
            <article key={theme.id} className={`jb-theme-option jb-theme-option--${theme.season}`}>
              <h3>{theme.name}</h3>
              <ThemeBadge theme={theme} />
              <p className="jb-theme-option__blurb">{theme.blurb}</p>
              <Button
                onClick={(event) => onPick(event, theme.id)}
                disabledReason={check.ok ? undefined : check.reasons[0]}
                showReason
                data-testid={`pick-theme-${theme.id}`}
              >
                Choose {theme.name}
              </Button>
            </article>
          );
        })}
      </div>
      {rest.ok ? (
        <Button variant="ghost" onClick={onRest} data-testid="rest-line">
          Rest the line this season
        </Button>
      ) : null}
      {next.length > 0 ? (
        <p className="jb-hint">
          Trendsetter peek: next season brings {next.map((theme) => theme.name).join(" and ")}.
        </p>
      ) : null}
    </Card>
  );
}
